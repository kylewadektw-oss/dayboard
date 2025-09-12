-- Fix User Settings RLS Policies for Upsert Operations
-- This migration fixes the RLS policies to allow proper INSERT/UPDATE operations

-- Drop the existing policy that uses FOR ALL
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
