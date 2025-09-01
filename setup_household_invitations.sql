-- Household Invitations System
-- This creates a system for inviting household members via activation codes

-- Create household_invitations table
CREATE TABLE IF NOT EXISTS household_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  invitation_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text,
  invitee_name text,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create RLS policies for household_invitations
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_household_invitations_code ON household_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_household_invitations_household_id ON household_invitations(household_id);
CREATE INDEX IF NOT EXISTS idx_household_invitations_created_by ON household_invitations(created_by);
CREATE INDEX IF NOT EXISTS idx_household_invitations_status ON household_invitations(status);

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
