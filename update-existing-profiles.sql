-- Add new columns to existing profiles table
-- Run this in Supabase SQL Editor if profiles table already exists

-- Personal Details
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns text;

-- Location & Contact
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact jsonb;

-- Preferences & Settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{}';

-- Family Role & System
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_role text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dietary_restrictions text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allergies text[];

-- Status & Activity
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_profile_completion' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_profile_completion CHECK (
      profile_completion_percentage >= 0 AND profile_completion_percentage <= 100
    );
  END IF;
END $$;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Core Pages
  dashboard boolean DEFAULT true,
  meals boolean DEFAULT true,
  lists boolean DEFAULT true,
  work boolean DEFAULT false,
  projects boolean DEFAULT true,
  profile boolean DEFAULT true,
  
  -- Premium Features
  sports_ticker boolean DEFAULT false,
  financial_tracking boolean DEFAULT false,
  ai_features boolean DEFAULT false,
  
  -- Admin Features
  household_management boolean DEFAULT false,
  user_management boolean DEFAULT false,
  feature_management boolean DEFAULT false,
  billing_management boolean DEFAULT false,
  
  -- Super Admin Features
  system_admin boolean DEFAULT false,
  global_feature_control boolean DEFAULT false,
  analytics_dashboard boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS if not already enabled
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_permissions' 
    AND policyname = 'Users can view their own permissions'
  ) THEN
    CREATE POLICY "Users can view their own permissions" ON user_permissions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Function to create default permissions for new users
CREATE OR REPLACE FUNCTION create_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_permissions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS create_user_permissions_trigger ON profiles;
CREATE TRIGGER create_user_permissions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_permissions();
