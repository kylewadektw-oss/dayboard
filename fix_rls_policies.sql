-- Fix RLS Policies for Household Creation
-- Run this in your Supabase SQL editor if you're getting household creation errors

-- First, let's check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Re-enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Drop and recreate household policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view their household" ON households;
DROP POLICY IF EXISTS "Users can update households they created" ON households;
DROP POLICY IF EXISTS "Users can insert households" ON households;

-- Create simple, non-recursive household policies
CREATE POLICY "Users can insert households" ON households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their household" ON households
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can update households they created" ON households
  FOR UPDATE USING (auth.uid() = created_by);

-- We'll add household member policies separately to avoid recursion
CREATE POLICY "Users can delete households they created" ON households
  FOR DELETE USING (auth.uid() = created_by);

-- Test the current user's auth status
SELECT 
  auth.uid() as current_user_id,
  auth.jwt() as current_jwt;

-- Check if there are any existing households (should be 0 after clearing)
SELECT COUNT(*) as household_count FROM households;

-- Test insertion permissions by trying a simple query
SELECT 
  'Can insert households' as test,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'User is authenticated'
    ELSE 'User is NOT authenticated'
  END as auth_status;
