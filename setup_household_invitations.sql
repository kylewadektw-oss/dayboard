-- Create household invitation system with codes and member management
-- Run this in your Supabase SQL editor

-- 1. Ensure households table has updated_at column and add household_code column
ALTER TABLE households 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE households 
ADD COLUMN IF NOT EXISTS household_code VARCHAR(8) UNIQUE;

-- Ensure updated_at trigger exists for households
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_households_updated_at') THEN
        CREATE TRIGGER update_households_updated_at 
        BEFORE UPDATE ON households
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- 2. Add member status and role management columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS household_status VARCHAR(20) DEFAULT 'none' CHECK (household_status IN ('none', 'pending', 'approved', 'admin'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS household_role VARCHAR(20) DEFAULT 'member' CHECK (household_role IN ('admin', 'member'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS requested_household_id UUID REFERENCES households(id);

-- 3. Create household_invitations table for tracking invitations
CREATE TABLE IF NOT EXISTS household_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    inviter_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    household_code VARCHAR(8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create function to generate unique household codes
CREATE OR REPLACE FUNCTION generate_household_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    code VARCHAR(8);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-character code with uppercase letters and numbers
        code := UPPER(
            SUBSTR(MD5(RANDOM()::TEXT), 1, 8)
        );
        
        -- Replace some characters to avoid confusion (0->A, 1->B, etc.)
        code := REPLACE(code, '0', 'A');
        code := REPLACE(code, '1', 'B');
        code := REPLACE(code, 'O', 'C');
        code := REPLACE(code, 'I', 'D');
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM households WHERE household_code = code) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to auto-generate household codes (only assign codes, don't interfere with updated_at)
CREATE OR REPLACE FUNCTION assign_household_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.household_code IS NULL THEN
        NEW.household_code := generate_household_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_household_code ON households;
CREATE TRIGGER trigger_assign_household_code
    BEFORE INSERT OR UPDATE ON households
    FOR EACH ROW
    WHEN (NEW.household_code IS NULL)
    EXECUTE FUNCTION assign_household_code();

-- 6. Generate codes for existing households that don't have them
UPDATE households 
SET household_code = generate_household_code()
WHERE household_code IS NULL;

-- 7. Set existing household creators as admins
UPDATE profiles 
SET household_status = 'admin', household_role = 'admin'
WHERE user_id IN (
    SELECT created_by 
    FROM households 
    WHERE households.id = profiles.household_id
);

-- 8. Set existing household members as approved
UPDATE profiles 
SET household_status = 'approved'
WHERE household_id IS NOT NULL AND household_status = 'none';

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_households_code ON households(household_code);
CREATE INDEX IF NOT EXISTS idx_profiles_household_status ON profiles(household_status);
CREATE INDEX IF NOT EXISTS idx_household_invitations_status ON household_invitations(status);
CREATE INDEX IF NOT EXISTS idx_household_invitations_expires ON household_invitations(expires_at);

-- 10. Create RLS policies for household_invitations
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations they sent or received
CREATE POLICY "Users can view their invitations" ON household_invitations
    FOR SELECT USING (
        inviter_user_id = auth.uid() OR 
        invitee_user_id = auth.uid()
    );

-- Policy: Users can create invitations for households they admin
CREATE POLICY "Admins can create invitations" ON household_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND household_id = household_invitations.household_id 
            AND household_role = 'admin'
        )
    );

-- Policy: Users can update invitations they received
CREATE POLICY "Users can respond to invitations" ON household_invitations
    FOR UPDATE USING (invitee_user_id = auth.uid());

-- 11. Update profiles RLS policies for new columns
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Policy: Household admins can approve/reject pending members
CREATE POLICY "Admins can manage household members" ON profiles
    FOR UPDATE USING (
        -- User is updating their own profile
        user_id = auth.uid() OR
        -- User is a household admin managing a pending member
        (
            household_status = 'pending' AND
            EXISTS (
                SELECT 1 FROM profiles admin_profile
                WHERE admin_profile.user_id = auth.uid()
                AND admin_profile.household_id = profiles.requested_household_id
                AND admin_profile.household_role = 'admin'
            )
        )
    );

-- 12. Create function to handle household join requests
CREATE OR REPLACE FUNCTION join_household_by_code(
    p_household_code VARCHAR(8),
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_household households%ROWTYPE;
    v_profile profiles%ROWTYPE;
    v_result JSON;
BEGIN
    -- Find household by code
    SELECT * INTO v_household 
    FROM households 
    WHERE household_code = p_household_code;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid household code');
    END IF;
    
    -- Get user profile
    SELECT * INTO v_profile 
    FROM profiles 
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Check if user is already in a household
    IF v_profile.household_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'User is already in a household');
    END IF;
    
    -- Check if user already has a pending request for this household
    IF v_profile.requested_household_id = v_household.id AND v_profile.household_status = 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Request already pending for this household');
    END IF;
    
    -- Update profile to show pending status
    UPDATE profiles 
    SET 
        requested_household_id = v_household.id,
        household_status = 'pending',
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN json_build_object(
        'success', true, 
        'household_name', v_household.name,
        'status', 'pending'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create function to approve/reject household members
CREATE OR REPLACE FUNCTION manage_household_member(
    p_member_user_id UUID,
    p_action VARCHAR(10), -- 'approve' or 'reject'
    p_admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_member_profile profiles%ROWTYPE;
    v_admin_profile profiles%ROWTYPE;
    v_household households%ROWTYPE;
BEGIN
    -- Get member profile
    SELECT * INTO v_member_profile 
    FROM profiles 
    WHERE user_id = p_member_user_id AND household_status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Pending member not found');
    END IF;
    
    -- Get admin profile
    SELECT * INTO v_admin_profile 
    FROM profiles 
    WHERE user_id = p_admin_user_id AND household_role = 'admin';
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Admin access required');
    END IF;
    
    -- Verify admin is in the same household as the pending request
    IF v_admin_profile.household_id != v_member_profile.requested_household_id THEN
        RETURN json_build_object('success', false, 'error', 'Invalid household access');
    END IF;
    
    IF p_action = 'approve' THEN
        -- Approve member
        UPDATE profiles 
        SET 
            household_id = requested_household_id,
            household_status = 'approved',
            household_role = 'member',
            requested_household_id = NULL,
            updated_at = NOW()
        WHERE user_id = p_member_user_id;
        
        -- Update household member count
        UPDATE households 
        SET 
            members_count = members_count + 1,
            updated_at = NOW()
        WHERE id = v_member_profile.requested_household_id;
        
        RETURN json_build_object('success', true, 'action', 'approved');
        
    ELSIF p_action = 'reject' THEN
        -- Reject member
        UPDATE profiles 
        SET 
            household_status = 'none',
            requested_household_id = NULL,
            updated_at = NOW()
        WHERE user_id = p_member_user_id;
        
        RETURN json_build_object('success', true, 'action', 'rejected');
    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid action');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify setup
SELECT 'Household invitation system setup complete!' as status;
