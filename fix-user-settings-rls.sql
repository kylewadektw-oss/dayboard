-- Fix User Settings RLS Policies
-- This script ensures user_settings table has proper permissions

-- First, let's check if user_settings exists and create if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        CREATE TABLE user_settings (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            setting_key text NOT NULL,
            setting_value jsonb NOT NULL DEFAULT '{}',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(user_id, setting_key)
        );
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can view household member settings" ON user_settings;

-- Create comprehensive policies for user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid());

-- Admin policies (optional - admins can manage household member settings)
CREATE POLICY "Admins can view household member settings" ON user_settings
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      JOIN profiles p2 ON p1.household_id = p2.household_id
      WHERE p1.id = auth.uid() 
      AND p1.role IN ('admin', 'super_admin')
      AND p2.id = user_settings.user_id
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(setting_key);
