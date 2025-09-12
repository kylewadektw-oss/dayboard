-- Targeted Fix for User Settings RLS Only
-- This script only fixes the user_settings table policies

-- Check current user_settings policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_settings';

-- Drop the problematic "FOR ALL" policy if it exists
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

-- Only create the new policies if they don't already exist
DO $$ 
BEGIN
    -- Check and create SELECT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_settings' 
        AND policyname = 'Users can view their own settings'
    ) THEN
        CREATE POLICY "Users can view their own settings" ON user_settings
          FOR SELECT TO authenticated USING (user_id = auth.uid());
    END IF;

    -- Check and create INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_settings' 
        AND policyname = 'Users can insert their own settings'
    ) THEN
        CREATE POLICY "Users can insert their own settings" ON user_settings
          FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    END IF;

    -- Check and create UPDATE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_settings' 
        AND policyname = 'Users can update their own settings'
    ) THEN
        CREATE POLICY "Users can update their own settings" ON user_settings
          FOR UPDATE TO authenticated 
          USING (user_id = auth.uid()) 
          WITH CHECK (user_id = auth.uid());
    END IF;

    -- Check and create DELETE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_settings' 
        AND policyname = 'Users can delete their own settings'
    ) THEN
        CREATE POLICY "Users can delete their own settings" ON user_settings
          FOR DELETE TO authenticated USING (user_id = auth.uid());
    END IF;
END $$;

-- Verify the fix
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_settings'
ORDER BY policyname;
