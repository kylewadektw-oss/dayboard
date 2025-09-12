-- Set your user role to super_admin
-- Replace 'your-email@example.com' with your actual email

UPDATE profiles 
SET role = 'super_admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Or if you know your user ID, use this instead:
-- UPDATE profiles SET role = 'super_admin' WHERE id = 'your-user-id-here';

-- Check the update worked:
SELECT 
  u.email,
  p.role,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';
