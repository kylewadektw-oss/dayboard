-- Clear Database Records for Fresh Start
-- Run these SQL commands in your Supabase SQL editor to delete all data while keeping table structure

-- Disable RLS temporarily to ensure we can delete everything
ALTER TABLE credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE households DISABLE ROW LEVEL SECURITY;

-- Delete all records in the correct order (respecting foreign key constraints)
-- Start with dependent tables first

-- Clear credentials (depends on users and households)
DELETE FROM credentials;

-- Clear household members (depends on households and users)
DELETE FROM household_members;

-- Clear profiles (depends on households and users)
DELETE FROM profiles;

-- Clear households (depends on users via created_by)
DELETE FROM households;

-- Note: We're not deleting from auth.users as that's managed by Supabase Auth
-- Users will need to sign out and sign back in to recreate their auth record

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Reset any sequences (if you have auto-incrementing fields)
-- This ensures IDs start from 1 again for any serial columns
-- Note: UUIDs don't need sequence resets

-- Verify all tables are empty
SELECT 'credentials' as table_name, COUNT(*) as record_count FROM credentials
UNION ALL
SELECT 'household_members' as table_name, COUNT(*) as record_count FROM household_members
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'households' as table_name, COUNT(*) as record_count FROM households;

-- Show remaining auth users (these will persist)
SELECT 'auth.users' as table_name, COUNT(*) as record_count FROM auth.users;
