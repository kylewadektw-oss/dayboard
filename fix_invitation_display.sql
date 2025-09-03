-- 🔧 Quick Fix for Invitation Code Display
-- Run this to temporarily simplify RLS policies so we can see the codes

-- Temporarily simplify the household_invitations policies
DROP POLICY IF EXISTS "Users can view invitations for their household" ON household_invitations;
DROP POLICY IF EXISTS "Household admins can create invitations" ON household_invitations;
DROP POLICY IF EXISTS "Users can update invitations they created" ON household_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by code" ON household_invitations;

-- Create one simple policy that allows household members to do everything
CREATE POLICY "household_invitations_simple_access" ON household_invitations
  FOR ALL 
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    created_by = auth.uid()
  )
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    created_by = auth.uid()
  );

-- Test: Create an invitation code for your household
INSERT INTO household_invitations (
  household_id,
  invitation_code,
  created_by,
  role,
  status,
  expires_at
) 
SELECT 
  p.household_id,
  upper(substring(md5(random()::text) from 1 for 8)),
  auth.uid(),
  'member',
  'pending',
  now() + interval '7 days'
FROM profiles p 
WHERE p.user_id = auth.uid() 
  AND p.household_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM household_invitations hi 
    WHERE hi.household_id = p.household_id 
      AND hi.status = 'pending' 
      AND hi.expires_at > now()
  );

-- Check what we have now
SELECT 
  'Your invitation codes:' as info,
  hi.invitation_code,
  hi.household_id,
  hi.status,
  hi.expires_at,
  h.name as household_name
FROM household_invitations hi
JOIN profiles p ON p.household_id = hi.household_id
JOIN households h ON h.id = hi.household_id
WHERE p.user_id = auth.uid()
  AND hi.status = 'pending'
  AND hi.expires_at > now();
