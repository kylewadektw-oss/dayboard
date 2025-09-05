-- User Roles and Permissions System
-- Family Command Center Database Schema

-- Enum for user roles
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'member');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'family_plus');

-- Households table (family groups)
CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  admin_id uuid NOT NULL, -- References the household administrator
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_id text, -- Stripe subscription ID
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced profiles table with role system
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  display_name text,
  avatar_url text,
  role user_role DEFAULT 'member',
  household_id uuid REFERENCES households(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure household admin relationship
  CONSTRAINT valid_admin_role CHECK (
    role != 'admin' OR household_id IS NOT NULL
  )
);

-- Feature permissions table
CREATE TABLE user_permissions (
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

-- Household feature settings (what features are enabled for the household)
CREATE TABLE household_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  
  -- Core Features (always available)
  dashboard boolean DEFAULT true,
  meals boolean DEFAULT true,
  lists boolean DEFAULT true,
  work boolean DEFAULT true,
  projects boolean DEFAULT true,
  profile boolean DEFAULT true,
  
  -- Premium Features (based on subscription)
  sports_ticker boolean DEFAULT false,
  financial_tracking boolean DEFAULT false,
  ai_features boolean DEFAULT false,
  advanced_analytics boolean DEFAULT false,
  unlimited_storage boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(household_id)
);

-- Super Admin feature control (global feature toggles)
CREATE TABLE global_feature_toggles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text UNIQUE NOT NULL,
  is_enabled boolean DEFAULT true,
  description text,
  requires_subscription boolean DEFAULT false,
  minimum_tier subscription_tier DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Household invitations
CREATE TABLE household_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  invitation_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(household_id, invited_email)
);

-- Add foreign key constraint for household admin
ALTER TABLE households 
ADD CONSTRAINT households_admin_fkey 
FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE RESTRICT;

-- Create indexes for performance
CREATE INDEX idx_profiles_household_id ON profiles(household_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_household_features_household_id ON household_features(household_id);
CREATE INDEX idx_household_invitations_token ON household_invitations(invitation_token);
CREATE INDEX idx_household_invitations_email ON household_invitations(invited_email);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Household members can view each other" ON profiles
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage household members" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'super_admin')
      AND household_id = profiles.household_id
    )
  );

CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- User permissions policies
CREATE POLICY "Users can view their own permissions" ON user_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage household member permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      JOIN profiles p2 ON p1.household_id = p2.household_id
      WHERE p1.id = auth.uid() 
      AND p1.role IN ('admin', 'super_admin')
      AND p2.id = user_permissions.user_id
    )
  );

-- Household policies
CREATE POLICY "Household members can view their household" ON households
  FOR SELECT USING (
    id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their household" ON households
  FOR ALL USING (
    admin_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Global feature toggles (Super Admin only)
CREATE POLICY "Super admins can manage global features" ON global_feature_toggles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "All users can read global features" ON global_feature_toggles
  FOR SELECT TO authenticated USING (true);

-- Functions for role management

-- Function to create default permissions for new users
CREATE OR REPLACE FUNCTION create_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_permissions (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default permissions
CREATE TRIGGER create_user_permissions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_permissions();

-- Function to update household admin when needed
CREATE OR REPLACE FUNCTION update_household_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If user's role is changed to admin, update household admin
  IF NEW.role = 'admin' AND OLD.role != 'admin' THEN
    UPDATE households 
    SET admin_id = NEW.id, updated_at = now()
    WHERE id = NEW.household_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update household admin
CREATE TRIGGER update_household_admin_trigger
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_household_admin();

-- Insert default global feature toggles
INSERT INTO global_feature_toggles (feature_key, is_enabled, description, requires_subscription, minimum_tier) VALUES
  ('dashboard', true, 'Main dashboard with widgets', false, 'free'),
  ('meals', true, 'Meal planning and recipes', false, 'free'),
  ('lists', true, 'List management (grocery, todo, etc)', false, 'free'),
  ('work', true, 'Work schedule and time tracking', false, 'free'),
  ('projects', true, 'Project and task management', false, 'free'),
  ('profile', true, 'User profiles and household management', false, 'free'),
  ('sports_ticker', true, 'Sports scores and updates', true, 'premium'),
  ('financial_tracking', true, 'Stock and budget tracking', true, 'premium'),
  ('ai_features', true, 'AI-powered suggestions and automation', true, 'family_plus'),
  ('advanced_analytics', true, 'Detailed family analytics', true, 'premium'),
  ('unlimited_storage', true, 'Unlimited photo and document storage', true, 'premium');
