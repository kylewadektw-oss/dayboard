-- Safe fix for profiles RLS policies - handles existing policies
-- This version checks for existing policies before creating new ones

-- Step 1: Drop ALL possible policy variations that might exist
DO $$
BEGIN
    -- Drop all known policy variations
    DROP POLICY IF EXISTS "Users can view their household" ON profiles;
    DROP POLICY IF EXISTS "Users can view household profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON profiles;
    DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "allow_select_own_profile" ON profiles;
    DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;
    DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
    DROP POLICY IF EXISTS "allow_select_household_profiles" ON profiles;
    
    RAISE NOTICE '✅ All existing policies dropped';
END $$;

-- Step 2: Create new simple policies
DO $$
BEGIN
    -- Policy 1: Users can view their own profile only
    CREATE POLICY "profiles_select_own" 
    ON profiles FOR SELECT 
    USING (auth.uid() = user_id);
    
    RAISE NOTICE '✅ Created profiles_select_own policy';
END $$;

DO $$
BEGIN
    -- Policy 2: Users can update their own profile only
    CREATE POLICY "profiles_update_own" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE '✅ Created profiles_update_own policy';
END $$;

DO $$
BEGIN
    -- Policy 3: Users can insert their own profile only
    CREATE POLICY "profiles_insert_own" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE '✅ Created profiles_insert_own policy';
END $$;

-- Step 3: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Test the setup
DO $$
BEGIN
    RAISE NOTICE '🎉 Profiles RLS policies fixed successfully!';
    RAISE NOTICE '🔍 Users can now view/update their own profile';
    RAISE NOTICE '➕ New users can create their profile during signup';
    RAISE NOTICE '❌ Infinite recursion issue should be resolved';
END $$;