-- Quick Fix for User Settings RLS
-- Run this SQL directly in Supabase SQL Editor

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

-- Create separate policies for each operation type
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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_settings';
