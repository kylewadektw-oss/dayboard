-- Check current profiles table structure and constraints
-- Run this first to see what we're working with

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Show existing constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Check for any duplicate user_id values
SELECT 
    user_id,
    COUNT(*) as duplicate_count
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;
