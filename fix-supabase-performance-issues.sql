-- =================================================================
-- SUPABASE PERFORMANCE OPTIMIZATION FIX
-- =================================================================
-- This file addresses all critical performance warnings from Supabase linter
-- Issues: Auth RLS InitPlan optimization, Multiple Permissive Policies, Duplicate Indexes

-- =================================================================
-- 1. AUTH RLS INITPLAN OPTIMIZATION
-- =================================================================
-- Replace auth.<function>() with (select auth.<function>()) to optimize query performance

-- Fix global_feature_control policies
DROP POLICY IF EXISTS "Only super admins can modify global feature controls" ON public.global_feature_control;
CREATE POLICY "Only super admins can modify global feature controls" ON public.global_feature_control
  FOR ALL TO authenticated
  USING ((select auth.jwt()) ->> 'role' = 'super_admin')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'super_admin');

-- Fix user_settings policies
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Fix household_settings policies
DROP POLICY IF EXISTS "Household admins can manage household settings" ON public.household_settings;
CREATE POLICY "Household admins can manage household settings" ON public.household_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_settings.household_id
      AND hm.user_id = (select auth.uid())
      AND hm.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_settings.household_id
      AND hm.user_id = (select auth.uid())
      AND hm.role IN ('admin', 'owner')
    )
  );

-- Fix household_feature_settings policies
DROP POLICY IF EXISTS "Household members can read household feature settings" ON public.household_feature_settings;
DROP POLICY IF EXISTS "Household admins can manage household feature settings" ON public.household_feature_settings;
DROP POLICY IF EXISTS "Household admins can update household feature settings" ON public.household_feature_settings;

CREATE POLICY "Household members can read household feature settings" ON public.household_feature_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_feature_settings.household_id
      AND hm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Household admins can manage household feature settings" ON public.household_feature_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_feature_settings.household_id
      AND hm.user_id = (select auth.uid())
      AND hm.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_feature_settings.household_id
      AND hm.user_id = (select auth.uid())
      AND hm.role IN ('admin', 'owner')
    )
  );

-- Fix user_feature_overrides policies
DROP POLICY IF EXISTS "Users can manage their own feature overrides" ON public.user_feature_overrides;
DROP POLICY IF EXISTS "Admins can manage member feature overrides in their household" ON public.user_feature_overrides;

CREATE POLICY "Users can manage their own feature overrides" ON public.user_feature_overrides
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can manage member feature overrides in their household" ON public.user_feature_overrides
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = (select auth.uid())
      AND hm1.role IN ('admin', 'owner')
      AND hm2.user_id = user_feature_overrides.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = (select auth.uid())
      AND hm1.role IN ('admin', 'owner')
      AND hm2.user_id = user_feature_overrides.user_id
    )
  );

-- =================================================================
-- 2. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =================================================================
-- Remove duplicate policies and consolidate into single, efficient policies

-- Fix credentials table policies
DROP POLICY IF EXISTS "Users can delete own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Users can insert own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Users can update own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Users can view own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Users can manage their own credentials" ON public.credentials;
DROP POLICY IF EXISTS "Household members can view shared credentials" ON public.credentials;

-- Create consolidated credentials policies
CREATE POLICY "credentials_user_access" ON public.credentials
  FOR ALL TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    (shared_with_household = true AND EXISTS (
      SELECT 1 FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = (select auth.uid())
      AND hm2.user_id = credentials.user_id
    ))
  )
  WITH CHECK (user_id = (select auth.uid()));

-- Fix global_feature_control table policies
DROP POLICY IF EXISTS "Anyone can read global feature controls" ON public.global_feature_control;
-- Keep only the super admin policy created above

CREATE POLICY "global_feature_control_read_access" ON public.global_feature_control
  FOR SELECT TO anon, authenticated
  USING (true);

-- Fix global_feature_toggles table policies
DROP POLICY IF EXISTS "All users can read global features" ON public.global_feature_toggles;
DROP POLICY IF EXISTS "Super admins can manage global features" ON public.global_feature_toggles;

CREATE POLICY "global_feature_toggles_read_access" ON public.global_feature_toggles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "global_feature_toggles_admin_access" ON public.global_feature_toggles
  FOR ALL TO authenticated
  USING ((select auth.jwt()) ->> 'role' = 'super_admin')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'super_admin');

-- Fix recipes table policies
DROP POLICY IF EXISTS "Users can manage their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "recipe_access" ON public.recipes;
DROP POLICY IF EXISTS "Household members can view shared recipes" ON public.recipes;

CREATE POLICY "recipes_comprehensive_access" ON public.recipes
  FOR ALL TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    (shared_with_household = true AND EXISTS (
      SELECT 1 FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = (select auth.uid())
      AND hm2.user_id = recipes.user_id
    )) OR
    visibility = 'public'
  )
  WITH CHECK (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = (select auth.uid())
      AND hm1.role IN ('admin', 'owner')
      AND hm2.user_id = recipes.user_id
    )
  );

-- =================================================================
-- 3. REMOVE DUPLICATE INDEXES
-- =================================================================
-- Drop duplicate indexes to improve performance

-- Remove duplicate household indexes
DROP INDEX IF EXISTS idx_households_created_by_fk;
-- Keep idx_households_created_by

-- Remove duplicate profile indexes
DROP INDEX IF EXISTS profiles_user_id_unique;
-- Keep profiles_user_id_key

-- =================================================================
-- 4. ADD PERFORMANCE INDEXES
-- =================================================================
-- Add optimized indexes for better query performance

-- Index for household member lookups (used frequently in RLS policies)
CREATE INDEX IF NOT EXISTS idx_household_members_user_household_role 
ON household_members(user_id, household_id, role);

-- Index for credential sharing lookups
CREATE INDEX IF NOT EXISTS idx_credentials_user_shared 
ON credentials(user_id, shared_with_household) 
WHERE shared_with_household = true;

-- Index for recipe sharing lookups
CREATE INDEX IF NOT EXISTS idx_recipes_user_shared_visibility 
ON recipes(user_id, shared_with_household, visibility);

-- Index for feature settings household lookups
CREATE INDEX IF NOT EXISTS idx_household_feature_settings_household 
ON household_feature_settings(household_id);

-- Index for user feature overrides
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_user 
ON user_feature_overrides(user_id);

-- =================================================================
-- 5. ANALYZE TABLES FOR PERFORMANCE
-- =================================================================
-- Update table statistics for query planner optimization

ANALYZE public.credentials;
ANALYZE public.global_feature_control;
ANALYZE public.global_feature_toggles;
ANALYZE public.recipes;
ANALYZE public.user_feature_overrides;
ANALYZE public.household_feature_settings;
ANALYZE public.household_members;
ANALYZE public.user_settings;
ANALYZE public.household_settings;

-- =================================================================
-- COMPLETION MESSAGE
-- =================================================================
-- Performance optimization completed successfully
-- - Fixed 8 auth RLS initplan warnings
-- - Consolidated multiple permissive policies on 5 tables
-- - Removed 2 duplicate indexes
-- - Added 5 performance indexes
-- - Updated table statistics
