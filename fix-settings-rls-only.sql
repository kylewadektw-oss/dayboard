-- Quick Fix for User Settings RLS Policies
-- Run this in Supabase SQL Editor to fix the settings save issue

-- First, check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_settings';

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

-- Create separate policies for each operation
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_settings'
ORDER BY policyname;
