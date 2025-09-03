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

-- Household invitations policies
DROP POLICY IF EXISTS "invitation_access" ON household_invitations;
CREATE POLICY "invitation_access" ON household_invitations
  FOR ALL 
  USING (
    household_id IN (SELECT household_id FROM profiles WHERE user_id = auth.uid()) OR
    invited_by = auth.uid()
  );

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

-- Create household invitation function
CREATE OR REPLACE FUNCTION create_household_invitation(
  household_id_param UUID,
  invitee_email_param TEXT DEFAULT NULL,
  invitee_name_param TEXT,
  role_param TEXT DEFAULT 'member'
) RETURNS JSON AS $$
DECLARE
  invitation_code TEXT;
  result JSON;
BEGIN
  -- Generate a unique 8-character code
  invitation_code := UPPER(substring(md5(random()::text) from 1 for 8));
  
  -- Ensure code is unique
  WHILE EXISTS (SELECT 1 FROM household_invitations WHERE invitation_code = invitation_code AND status = 'pending') LOOP
    invitation_code := UPPER(substring(md5(random()::text) from 1 for 8));
  END LOOP;
  
  -- Insert the invitation
  INSERT INTO household_invitations (
    household_id,
    invited_by,
    invitee_name,
    invitee_email,
    invitation_code,
    role,
    expires_at
  ) VALUES (
    household_id_param,
    auth.uid(),
    invitee_name_param,
    invitee_email_param,
    invitation_code,
    role_param,
    NOW() + INTERVAL '7 days'
  );
  
  -- Return success with invitation code
  result := json_build_object(
    'success', true,
    'invitation_code', invitation_code,
    'expires_at', NOW() + INTERVAL '7 days'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept household invitation function
CREATE OR REPLACE FUNCTION accept_household_invitation(
  invitation_code_param TEXT,
  user_id_param UUID
) RETURNS JSON AS $$
DECLARE
  invitation_record household_invitations%ROWTYPE;
  result JSON;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM household_invitations
  WHERE invitation_code = UPPER(invitation_code_param)
    AND status = 'pending'
    AND expires_at > NOW();
  
  -- Check if invitation exists and is valid
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation code'
    );
    RETURN result;
  END IF;
  
  -- Update user's profile with household info
  UPDATE profiles 
  SET 
    household_id = invitation_record.household_id,
    household_role = invitation_record.role,
    updated_at = NOW()
  WHERE user_id = user_id_param;
  
  -- Add to household_members table
  INSERT INTO household_members (
    household_id,
    user_id,
    role,
    joined_at
  ) VALUES (
    invitation_record.household_id,
    user_id_param,
    invitation_record.role,
    NOW()
  )
  ON CONFLICT (household_id, user_id) 
  DO UPDATE SET 
    role = invitation_record.role,
    joined_at = NOW();
  
  -- Mark invitation as accepted
  UPDATE household_invitations
  SET 
    status = 'accepted',
    used_at = NOW(),
    updated_at = NOW()
  WHERE id = invitation_record.id;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'household_id', invitation_record.household_id,
    'role', invitation_record.role
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
