/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: developer@bentlolabs.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/**
 * 🔧 RLS POLICY FIX - Resolve Infinite Recursion
 * 
 * Fixes the infinite recursion issue in Row Level Security policies
 * that's causing "Failed to fetch" errors in production.
 */

-- Fix infinite recursion in profiles table RLS policies
-- This SQL should be run in the Supabase SQL editor

-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for profile owners" ON profiles;
DROP POLICY IF EXISTS "Enable delete for profile owners" ON profiles;

-- Create simple, non-recursive policies for profiles table
CREATE POLICY "profiles_read_simple" ON profiles
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert_simple" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_simple" ON profiles
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_simple" ON profiles
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Fix households table policies to avoid profile table recursion
DROP POLICY IF EXISTS "households_select_policy" ON households;
DROP POLICY IF EXISTS "households_insert_policy" ON households;
DROP POLICY IF EXISTS "households_update_policy" ON households;
DROP POLICY IF EXISTS "households_delete_policy" ON households;
DROP POLICY IF EXISTS "Enable household access for members" ON households;
DROP POLICY IF EXISTS "Enable household creation" ON households;
DROP POLICY IF EXISTS "Enable household updates for authenticated users" ON households;

CREATE POLICY "households_read_simple" ON households
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "households_insert_simple" ON households
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "households_update_simple" ON households
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Fix user_permissions table policies
DROP POLICY IF EXISTS "user_permissions_select_policy" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_insert_policy" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_update_policy" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_delete_policy" ON user_permissions;
DROP POLICY IF EXISTS "Enable permissions access for authenticated users" ON user_permissions;
DROP POLICY IF EXISTS "Enable permissions management" ON user_permissions;

CREATE POLICY "user_permissions_read_simple" ON user_permissions
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "user_permissions_all_simple" ON user_permissions
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;
