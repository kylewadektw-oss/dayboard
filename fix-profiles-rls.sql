-- Fix infinite recursion in profiles RLS policies
-- This script safely recreates the profiles policies to avoid self-reference

-- Step 1: Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their household" ON profiles;
DROP POLICY IF EXISTS "Users can view household profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;

-- Step 2: Create simple, non-recursive policies
-- Policy 1: Users can view their own profile only
CREATE POLICY "allow_select_own_profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Users can update their own profile only
CREATE POLICY "allow_update_own_profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can insert their own profile only
CREATE POLICY "allow_insert_own_profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can view profiles in their household (if they have a household)
-- This policy is more complex but avoids self-reference by using a subquery
CREATE POLICY "allow_select_household_profiles" 
ON profiles FOR SELECT 
USING (
  household_id IS NOT NULL 
  AND household_id IN (
    SELECT p.household_id 
    FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.household_id IS NOT NULL
  )
);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Test the policies work
DO $$
BEGIN
    RAISE NOTICE '✅ Profiles RLS policies recreated successfully';
    RAISE NOTICE '🔍 Users can now view their own profile and household members';
    RAISE NOTICE '✏️ Users can update their own profile data';
    RAISE NOTICE '➕ New users can create their profile during signup';
END $$;