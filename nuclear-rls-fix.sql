-- 🚀 NUCLEAR RLS POLICY FIX - Handles ALL existing policies
-- Run this in Supabase SQL editor when policies already exist

-- First, disable RLS temporarily to clear everything
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE households DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE application_logs DISABLE ROW LEVEL SECURITY;

-- Drop ALL possible policy names for profiles table (including v2)
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for profile owners" ON profiles;
DROP POLICY IF EXISTS "Enable delete for profile owners" ON profiles;
DROP POLICY IF EXISTS "profiles_read_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_update_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_auth_read_v2" ON profiles;
DROP POLICY IF EXISTS "profiles_auth_insert_v2" ON profiles;
DROP POLICY IF EXISTS "profiles_auth_update_v2" ON profiles;
DROP POLICY IF EXISTS "profiles_auth_delete_v2" ON profiles;

-- Drop ALL possible policy names for households table (including v2)
DROP POLICY IF EXISTS "households_select_policy" ON households;
DROP POLICY IF EXISTS "households_insert_policy" ON households;
DROP POLICY IF EXISTS "households_update_policy" ON households;
DROP POLICY IF EXISTS "households_delete_policy" ON households;
DROP POLICY IF EXISTS "Enable household access for members" ON households;
DROP POLICY IF EXISTS "Enable household creation" ON households;
DROP POLICY IF EXISTS "Enable household updates for authenticated users" ON households;
DROP POLICY IF EXISTS "households_read_simple" ON households;
DROP POLICY IF EXISTS "households_insert_simple" ON households;
DROP POLICY IF EXISTS "households_update_simple" ON households;
DROP POLICY IF EXISTS "households_auth_read_v2" ON households;
DROP POLICY IF EXISTS "households_auth_insert_v2" ON households;
DROP POLICY IF EXISTS "households_auth_update_v2" ON households;

-- Drop ALL possible policy names for user_permissions table (including v2)
DROP POLICY IF EXISTS "user_permissions_select_policy" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_insert_policy" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_update_policy" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_delete_policy" ON user_permissions;
DROP POLICY IF EXISTS "Enable permissions access for authenticated users" ON user_permissions;
DROP POLICY IF EXISTS "Enable permissions management" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_read_simple" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_all_simple" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_auth_read_v2" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_auth_all_v2" ON user_permissions;

-- Drop ALL possible policy names for application_logs table
DROP POLICY IF EXISTS "application_logs_select_policy" ON application_logs;
DROP POLICY IF EXISTS "application_logs_insert_policy" ON application_logs;
DROP POLICY IF EXISTS "application_logs_auth_read_v2" ON application_logs;
DROP POLICY IF EXISTS "application_logs_auth_insert_v2" ON application_logs;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

-- Create NEW policies with unique v3 names
CREATE POLICY "profiles_auth_read_v3" ON profiles
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_auth_insert_v3" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_auth_update_v3" ON profiles
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_auth_delete_v3" ON profiles
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Households policies
CREATE POLICY "households_auth_read_v3" ON households
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "households_auth_insert_v3" ON households
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "households_auth_update_v3" ON households
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- User permissions policies
CREATE POLICY "user_permissions_auth_read_v3" ON user_permissions
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "user_permissions_auth_all_v3" ON user_permissions
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Application logs policies
CREATE POLICY "application_logs_auth_read_v3" ON application_logs
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "application_logs_auth_insert_v3" ON application_logs
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- ✅ SUCCESS MESSAGE
SELECT 'RLS policies successfully recreated with v3 naming!' as status;
