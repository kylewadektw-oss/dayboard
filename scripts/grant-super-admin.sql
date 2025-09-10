-- Grant Super Admin Status to Specific User
-- User ID: 0139a6fc-bf13-426d-8929-604051c4d1f4

UPDATE profiles 
SET role = 'super_admin'
WHERE user_id = '0139a6fc-bf13-426d-8929-604051c4d1f4';

-- Verify the update
SELECT 
    id,
    user_id,
    name,
    preferred_name,
    role,
    household_id,
    updated_at
FROM profiles 
WHERE user_id = '0139a6fc-bf13-426d-8929-604051c4d1f4';
