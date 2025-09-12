-- Check current user profile and role
SELECT 
  id,
  email,
  role,
  created_at,
  updated_at
FROM profiles 
WHERE id = auth.uid();

-- If you need to update your role to super_admin, uncomment and run this:
-- UPDATE profiles 
-- SET role = 'super_admin' 
-- WHERE id = auth.uid();

-- Verify the update worked:
-- SELECT 
--   id,
--   email, 
--   role
-- FROM profiles 
-- WHERE id = auth.uid();
