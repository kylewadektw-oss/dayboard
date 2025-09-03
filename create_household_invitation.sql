-- 🔧 Create Missing Household Invitation Record
-- This will create the invitation record for your existing household

-- First, let's check your current profile data
SELECT 'Current profile data:' as info;
SELECT 
  user_id,
  household_id,
  name
FROM profiles 
WHERE user_id = auth.uid();

-- Check what status values are allowed
SELECT 'Checking status constraint:' as info;
SELECT 
  conname,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%status%' 
  AND conrelid = 'household_invitations'::regclass;

-- Insert a new household invitation record for your existing household
INSERT INTO household_invitations (
  household_code,
  invitation_code,
  household_id,
  inviter_user_id,
  status,
  role,
  created_by
) VALUES (
  'AC4D8B22',  -- Your existing household code
  'AC4D8B22',  -- Use same code as invitation code
  'c37514ce-1967-4b36-b1e2-c1429b7775ab',  -- Your household ID from debug info
  auth.uid(),  -- You are the inviter
  'pending',    -- Use pending status (likely valid option)
  'admin',     -- You should be admin of your own household
  auth.uid()   -- You created this
);

-- Verify the record was created
SELECT 'New invitation record:' as info;
SELECT 
  id,
  household_code,
  invitation_code,
  household_id,
  status,
  role,
  expires_at,
  created_at
FROM household_invitations 
WHERE household_id = 'c37514ce-1967-4b36-b1e2-c1429b7775ab'
ORDER BY created_at DESC;

-- Test the query that HouseholdCodeDisplay uses
SELECT 'What HouseholdCodeDisplay will see:' as info;
SELECT 
  hi.invitation_code,
  hi.status,
  hi.expires_at
FROM household_invitations hi
JOIN profiles p ON p.household_id = hi.household_id
WHERE p.user_id = auth.uid()
  AND hi.status IN ('active', 'pending')
  AND (hi.expires_at IS NULL OR hi.expires_at > now())
ORDER BY hi.created_at DESC
LIMIT 1;
