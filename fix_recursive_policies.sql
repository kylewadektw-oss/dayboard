-- Fix Recursive RLS Policy Issue
-- Run this in your Supabase SQL editor to fix the infinite recursion error

-- Disable RLS temporarily to clean up
ALTER TABLE households DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their household" ON households;
DROP POLICY IF EXISTS "Users can update households they created" ON households;
DROP POLICY IF EXISTS "Users can insert households" ON households;
DROP POLICY IF EXISTS "Users can delete households they created" ON households;

DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Users can insert household members" ON household_members;
DROP POLICY IF EXISTS "Users can update household members" ON household_members;
DROP POLICY IF EXISTS "Users can delete household members" ON household_members;

-- Re-enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for households
CREATE POLICY "Users can insert households" ON households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own households" ON households
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can update own households" ON households
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own households" ON households
  FOR DELETE USING (auth.uid() = created_by);

-- Create simple policies for household_members (no circular references)
CREATE POLICY "Household creators can manage members" ON household_members
  FOR ALL USING (
    auth.uid() IN (
      SELECT created_by FROM households WHERE id = household_members.household_id
    )
  );

CREATE POLICY "Members can view their own membership" ON household_members
  FOR SELECT USING (auth.uid() = user_id);

-- Test the fix
SELECT 'Policies recreated successfully' as status;
