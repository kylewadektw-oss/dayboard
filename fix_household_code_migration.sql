-- 🔧 Fix Migration Issue - Copy household_code to invitation_code
-- This will properly migrate your existing household_code to the new invitation_code system

-- First, let's see what we have in the table
SELECT 'Current household_invitations data:' as info;
SELECT 
  id,
  household_code,
  invitation_code,
  status,
  expires_at,
  created_at
FROM household_invitations 
ORDER BY created_at DESC;

-- Update existing records to copy household_code to invitation_code
UPDATE household_invitations 
SET invitation_code = household_code 
WHERE household_code IS NOT NULL 
  AND (invitation_code IS NULL OR invitation_code = '');

-- Also update the household_id if it's missing
-- First, let's see what columns exist in households table
SELECT 'Households table structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'households' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Update household_id by finding the household this user belongs to
UPDATE household_invitations 
SET household_id = (
  SELECT p.household_id 
  FROM profiles p 
  WHERE p.user_id = auth.uid()
)
WHERE household_id IS NULL 
  AND household_code IS NOT NULL;

-- Set default role if missing
UPDATE household_invitations 
SET role = 'member' 
WHERE role IS NULL;

-- Set default status if missing
UPDATE household_invitations 
SET status = 'pending' 
WHERE status IS NULL OR status = '';

-- Set expires_at if missing (7 days from now)
UPDATE household_invitations 
SET expires_at = now() + interval '7 days'
WHERE expires_at IS NULL;

-- Show the updated data
SELECT 'Updated household_invitations data:' as info;
SELECT 
  id,
  household_id,
  invitation_code,
  household_code,
  status,
  expires_at,
  role,
  created_at
FROM household_invitations 
ORDER BY created_at DESC;

-- Verify the invitation code is now available for your household
SELECT 'Your invitation code:' as info;
SELECT 
  hi.invitation_code,
  hi.household_id,
  hi.status,
  hi.expires_at,
  p.household_id as user_household_id
FROM household_invitations hi
CROSS JOIN profiles p
WHERE p.user_id = auth.uid()
  AND (hi.household_id = p.household_id OR hi.household_code = 'AC4D8B22')
  AND hi.invitation_code IS NOT NULL
ORDER BY hi.created_at DESC;
