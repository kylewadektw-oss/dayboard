-- Setup Row Level Security (RLS) policies for Dayboard
-- This will fix the "Unrestricted" status in Supabase dashboard

-- First, ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

DROP POLICY IF EXISTS "Household members can view household" ON households;
DROP POLICY IF EXISTS "Users can create households" ON households;
DROP POLICY IF EXISTS "Household creators can update household" ON households;

DROP POLICY IF EXISTS "Users can view invitations for their household" ON household_invitations;
DROP POLICY IF EXISTS "Household admins can manage invitations" ON household_invitations;

DROP POLICY IF EXISTS "Household members can view members" ON household_members;
DROP POLICY IF EXISTS "Household admins can manage members" ON household_members;

DROP POLICY IF EXISTS "Household members can view recipes" ON recipes;
DROP POLICY IF EXISTS "Household members can manage recipes" ON recipes;

-- PROFILES TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- HOUSEHOLDS TABLE POLICIES
-- Members can view their household
CREATE POLICY "Household members can view household" ON households
    FOR SELECT USING (
        id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid() AND household_id IS NOT NULL
        )
    );

-- Authenticated users can create households
CREATE POLICY "Users can create households" ON households
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Household creators/admins can update household
CREATE POLICY "Household creators can update household" ON households
    FOR UPDATE USING (
        created_by = auth.uid() OR
        id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid() AND household_role = 'admin'
        )
    );

-- HOUSEHOLD_INVITATIONS TABLE POLICIES
-- Users can view invitations for households they're in or created
CREATE POLICY "Users can view household invitations" ON household_invitations
    FOR SELECT USING (
        household_id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid()
        ) OR
        household_id IN (
            SELECT id 
            FROM households 
            WHERE created_by = auth.uid()
        )
    );

-- Household admins can manage invitations
CREATE POLICY "Household admins can manage invitations" ON household_invitations
    FOR ALL USING (
        household_id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid() AND household_role IN ('admin', 'owner')
        ) OR
        household_id IN (
            SELECT id 
            FROM households 
            WHERE created_by = auth.uid()
        )
    );

-- HOUSEHOLD_MEMBERS TABLE POLICIES
-- Members can view other members in their household
CREATE POLICY "Household members can view members" ON household_members
    FOR SELECT USING (
        household_id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Household admins can manage members
CREATE POLICY "Household admins can manage members" ON household_members
    FOR ALL USING (
        household_id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid() AND household_role IN ('admin', 'owner')
        ) OR
        household_id IN (
            SELECT id 
            FROM households 
            WHERE created_by = auth.uid()
        )
    );

-- RECIPES TABLE POLICIES
-- Household members can view recipes
CREATE POLICY "Household members can view recipes" ON recipes
    FOR SELECT USING (
        household_id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid()
        ) OR
        household_id IS NULL -- Public recipes
    );

-- Household members can manage recipes
CREATE POLICY "Household members can manage recipes" ON recipes
    FOR ALL USING (
        household_id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Verify RLS is properly enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'households', 'household_invitations', 'household_members', 'recipes')
ORDER BY tablename;

-- Show policy count for each table
SELECT 
    t.tablename,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN COUNT(p.policyname) > 0 THEN '✅ Has Policies'
        ELSE '⚠️ No Policies'
    END as policy_status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public' 
AND t.tablename IN ('profiles', 'households', 'household_invitations', 'household_members', 'recipes')
GROUP BY t.tablename
ORDER BY t.tablename;

COMMIT;
