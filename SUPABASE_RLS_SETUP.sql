-- 🔧 Dayboard RLS Setup - Run this in Supabase SQL Editor
-- This will fix the "Unrestricted" status on your tables

-- Enable RLS on all main tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "profile_policy" ON profiles;

-- Create simple, working RLS policy for profiles
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Basic household policies
DROP POLICY IF EXISTS "household_access" ON households;
CREATE POLICY "household_access" ON households
  FOR ALL 
  USING (
    created_by = auth.uid() OR
    id IN (SELECT household_id FROM profiles WHERE user_id = auth.uid())
  );

-- Basic recipe policies  
DROP POLICY IF EXISTS "recipe_access" ON recipes;
CREATE POLICY "recipe_access" ON recipes
  FOR ALL 
  USING (
    household_id IN (SELECT household_id FROM profiles WHERE user_id = auth.uid()) OR
    household_id IS NULL
  );

-- Complete RLS Policies for household_invitations (full schema)
DROP POLICY IF EXISTS "invitation_access" ON household_invitations;

-- Policy: Users can view invitations for their household
CREATE POLICY "Users can view invitations for their household" ON household_invitations
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can create invitations for their household (if they're admin or creator)
CREATE POLICY "Household admins can create invitations" ON household_invitations
  FOR INSERT WITH CHECK (
    household_id IN (
      SELECT h.id FROM households h
      WHERE h.created_by = auth.uid()
      OR auth.uid() IN (
        SELECT hm.user_id FROM household_members hm 
        WHERE hm.household_id = h.id AND hm.role = 'admin'
      )
    )
  );

-- Policy: Users can update invitations they created
CREATE POLICY "Users can update invitations they created" ON household_invitations
  FOR UPDATE USING (created_by = auth.uid());

-- Policy: Anyone can view invitation by code (for joining)
CREATE POLICY "Anyone can view invitation by code" ON household_invitations
  FOR SELECT USING (invitation_code IS NOT NULL);

-- Household members policies
DROP POLICY IF EXISTS "members_access" ON household_members;
CREATE POLICY "members_access" ON household_members
  FOR ALL 
  USING (
    household_id IN (SELECT household_id FROM profiles WHERE user_id = auth.uid()) OR
    user_id = auth.uid()
  );

-- Check if RLS is properly enabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ Protected' ELSE '❌ Unrestricted' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'households', 'recipes', 'household_invitations', 'household_members')
ORDER BY tablename;

-- Check household_invitations table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'household_invitations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Complete functions for household invitations system

-- Function to generate unique invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate a 8-character code with uppercase letters and numbers
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM household_invitations WHERE invitation_code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create invitation with auto-generated code
CREATE OR REPLACE FUNCTION create_household_invitation(
  household_id_param uuid,
  invitee_email_param text DEFAULT NULL,
  invitee_name_param text DEFAULT NULL,
  role_param text DEFAULT 'member'
)
RETURNS json AS $$
DECLARE
  invitation_code_generated text;
  invitation_id uuid;
BEGIN
  -- Generate unique invitation code
  invitation_code_generated := generate_invitation_code();

  -- Insert invitation
  INSERT INTO household_invitations (
    household_id,
    invitation_code,
    created_by,
    invitee_email,
    invitee_name,
    role
  ) VALUES (
    household_id_param,
    invitation_code_generated,
    auth.uid(),
    invitee_email_param,
    invitee_name_param,
    role_param
  ) RETURNING id INTO invitation_id;

  RETURN json_build_object(
    'success', true,
    'invitation_id', invitation_id,
    'invitation_code', invitation_code_generated,
    'expires_at', (now() + interval '7 days')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept invitation and join household
CREATE OR REPLACE FUNCTION accept_household_invitation(
  invitation_code_param text,
  user_id_param uuid DEFAULT auth.uid()
)
RETURNS json AS $$
DECLARE
  invitation_record household_invitations%ROWTYPE;
  result json;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM household_invitations
  WHERE invitation_code = invitation_code_param
  AND status = 'pending'
  AND expires_at > now();

  -- Check if invitation exists and is valid
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation code'
    );
  END IF;

  -- Check if user is already in a household
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = user_id_param AND household_id IS NOT NULL) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is already in a household'
    );
  END IF;

  -- Update user's profile with household_id
  UPDATE profiles
  SET household_id = invitation_record.household_id,
      updated_at = now()
  WHERE user_id = user_id_param;

  -- Mark invitation as accepted
  UPDATE household_invitations
  SET status = 'accepted',
      used_by = user_id_param,
      used_at = now(),
      updated_at = now()
  WHERE id = invitation_record.id;

  -- Update household member count
  UPDATE households
  SET members_count = (
    SELECT COUNT(*) FROM profiles WHERE household_id = invitation_record.household_id
  ),
  updated_at = now()
  WHERE id = invitation_record.household_id;

  RETURN json_build_object(
    'success', true,
    'household_id', invitation_record.household_id,
    'message', 'Successfully joined household!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_household_invitations_updated_at
  BEFORE UPDATE ON household_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
