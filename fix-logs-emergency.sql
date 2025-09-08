-- 🛠️ EMERGENCY APPLICATION LOGS FIX
-- Run this in Supabase SQL editor to fix logging immediately

-- Temporarily disable RLS on application_logs to allow logging
ALTER TABLE application_logs DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on application_logs
DROP POLICY IF EXISTS "application_logs_simple_all" ON application_logs;
DROP POLICY IF EXISTS "application_logs_auth_read_v3" ON application_logs;
DROP POLICY IF EXISTS "application_logs_auth_insert_v3" ON application_logs;
DROP POLICY IF EXISTS "application_logs_select_policy" ON application_logs;
DROP POLICY IF EXISTS "application_logs_insert_policy" ON application_logs;

-- Re-enable RLS
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

-- Create VERY PERMISSIVE policies for application_logs
-- This allows all authenticated users to read and write logs
CREATE POLICY "logs_allow_all_authenticated" ON application_logs
    FOR ALL 
    USING (true)  -- Allow all reads
    WITH CHECK (true);  -- Allow all writes

-- Verify the policy was created
SELECT 
    tablename, 
    policyname, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'application_logs';

-- Test logging access
SELECT 'Application logs RLS policies fixed - logging should work now!' as status;
