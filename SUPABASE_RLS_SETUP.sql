-- 🔧 Dayboard RLS Setup - Run this in Supabase SQL Editor
-- This will fix the "Unrestricted" status on your tables

-- Enable RLS on all main tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "profile_policy" ON profiles;

-- Create simple, working RLS policy for profiles
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Basic household policies
DROP POLICY IF EXISTS "household_access" ON households;
CREATE POLICY "household_access" ON households
  FOR ALL 
  USING (
    created_by = auth.uid() OR
    id IN (SELECT household_id FROM profiles WHERE user_id = auth.uid())
  );

-- Basic recipe policies  
DROP POLICY IF EXISTS "recipe_access" ON recipes;
CREATE POLICY "recipe_access" ON recipes
  FOR ALL 
  USING (
    household_id IN (SELECT household_id FROM profiles WHERE user_id = auth.uid()) OR
    household_id IS NULL
  );

-- Check if RLS is properly enabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ Protected' ELSE '❌ Unrestricted' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'households', 'recipes')
ORDER BY tablename;
