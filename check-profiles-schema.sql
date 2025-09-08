-- 🔍 CHECK PROFILES TABLE STRUCTURE
-- Run this in Supabase SQL editor to see what columns exist

-- Get column information for profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
