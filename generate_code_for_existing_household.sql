-- 🔧 Generate Invitation Code for Existing Household
-- This will create an invitation code for households that existed before the invitation system

-- First, let's see your current household
SELECT 'Your Current Household:' as info;
SELECT 
  h.id as household_id,
  h.name as household_name,
  h.created_by,
  p.user_id,
  p.name as user_name
FROM households h
JOIN profiles p ON p.household_id = h.id
WHERE p.user_id = auth.uid();

-- Generate an invitation code for your household
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
  upper(substring(md5(random()::text) from 1 for 8)) as invitation_code,
  auth.uid(),
  'member',
  'pending',
  now() + interval '7 days'
FROM profiles p 
WHERE p.user_id = auth.uid() 
  AND p.household_id IS NOT NULL;

-- Show the newly created invitation code
SELECT 'Your New Invitation Code:' as info;
SELECT 
  hi.invitation_code,
  hi.household_id,
  hi.status,
  hi.expires_at,
  h.name as household_name
FROM household_invitations hi
JOIN households h ON h.id = hi.household_id
JOIN profiles p ON p.household_id = hi.household_id
WHERE p.user_id = auth.uid()
  AND hi.status = 'pending'
  AND hi.expires_at > now()
ORDER BY hi.created_at DESC
LIMIT 1;
