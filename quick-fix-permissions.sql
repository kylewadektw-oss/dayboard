-- Quick fix: Add user_permissions table
-- Run this in Supabase SQL Editor

-- Create user_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
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

-- Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policy
CREATE POLICY "Users can view their own permissions" ON user_permissions
  FOR SELECT USING (auth.uid() = user_id);

-- Create index
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

-- Trigger to create default permissions (only if it doesn't exist)
DROP TRIGGER IF EXISTS create_user_permissions_trigger ON profiles;
CREATE TRIGGER create_user_permissions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_permissions();
