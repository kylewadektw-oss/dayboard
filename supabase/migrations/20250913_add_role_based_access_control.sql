-- 🔐 Role-Based Access Control Migration
-- This migration adds comprehensive role-based feature access control to Dayboard

-- First, add role column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role text CHECK (role IN ('member', 'admin', 'super_admin')) DEFAULT 'member';
  END IF;
END
$$;

-- Create feature_access table for role-based permissions
CREATE TABLE IF NOT EXISTS feature_access (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  feature_category text NOT NULL DEFAULT 'general',
  role text NOT NULL CHECK (role IN ('member', 'admin', 'super_admin')),
  available boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure unique combinations
  UNIQUE(household_id, feature_name, role)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_access_household_id ON feature_access(household_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_feature_name ON feature_access(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_access_role ON feature_access(role);

-- Enable RLS
ALTER TABLE feature_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_access table
CREATE POLICY "Users can view their household feature access"
ON feature_access FOR SELECT
USING (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Only admins and super_admins can modify feature access
CREATE POLICY "Admins can manage feature access"
ON feature_access FOR ALL
USING (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Add default feature access configurations
-- This function will set up default permissions for a household
CREATE OR REPLACE FUNCTION setup_default_feature_access(household_id_param uuid)
RETURNS void AS $$
DECLARE
  features text[][] := ARRAY[
    -- [feature_name, category, member_default, admin_default, super_admin_default]
    ['dashboard', 'core', 'true', 'true', 'true'],
    ['settings', 'core', 'true', 'true', 'true'],
    ['sign_out', 'core', 'true', 'true', 'true'],
    
    -- Meals features
    ['meals_tab', 'meals', 'true', 'true', 'true'],
    ['meals_favorites', 'meals', 'true', 'true', 'true'],
    ['meals_this_week', 'meals', 'true', 'true', 'true'],
    ['meals_recipe_library', 'meals', 'true', 'true', 'true'],
    ['meals_cocktails', 'meals', 'false', 'true', 'true'],
    ['meals_quick_meals', 'meals', 'false', 'true', 'true'],
    
    -- Lists features
    ['lists_tab', 'lists', 'true', 'true', 'true'],
    ['lists_grocery', 'lists', 'true', 'true', 'true'],
    ['lists_todo', 'lists', 'true', 'true', 'true'],
    ['lists_shared', 'lists', 'false', 'true', 'true'],
    
    -- Calendar features
    ['calendar_tab', 'calendar', 'true', 'true', 'true'],
    ['calendar_events', 'calendar', 'true', 'true', 'true'],
    ['calendar_scheduling', 'calendar', 'false', 'true', 'true'],
    
    -- Household management
    ['household_management', 'admin', 'false', 'true', 'true'],
    ['user_management', 'admin', 'false', 'false', 'true'],
    ['role_management', 'admin', 'false', 'false', 'true'],
    ['feature_access_control', 'admin', 'false', 'false', 'true']
  ];
  feature_row text[];
  role_type text;
BEGIN
  -- Insert default feature access for each role
  FOREACH feature_row SLICE 1 IN ARRAY features
  LOOP
    -- Member permissions
    INSERT INTO feature_access (household_id, feature_name, feature_category, role, available)
    VALUES (household_id_param, feature_row[1], feature_row[2], 'member', feature_row[3]::boolean)
    ON CONFLICT (household_id, feature_name, role) DO NOTHING;
    
    -- Admin permissions
    INSERT INTO feature_access (household_id, feature_name, feature_category, role, available)
    VALUES (household_id_param, feature_row[1], feature_row[2], 'admin', feature_row[4]::boolean)
    ON CONFLICT (household_id, feature_name, role) DO NOTHING;
    
    -- Super Admin permissions
    INSERT INTO feature_access (household_id, feature_name, feature_category, role, available)
    VALUES (household_id_param, feature_row[1], feature_row[2], 'super_admin', feature_row[5]::boolean)
    ON CONFLICT (household_id, feature_name, role) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add settings category for feature access control
INSERT INTO settings_categories (category_key, display_name, description, icon, sort_order, required_role)
VALUES 
  ('feature_access', 'Feature Access Control', 'Manage role-based access to application features', 'Shield', 40, 'super_admin')
ON CONFLICT (category_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  required_role = EXCLUDED.required_role;

-- Add settings items for feature access control
INSERT INTO settings_items (category_key, setting_key, display_name, description, setting_type, default_value, required_role, sort_order)
VALUES 
  ('feature_access', 'feature_access_matrix', 'Feature Access Matrix', 'Configure which features are available to each role', 'feature_matrix', '{}', 'super_admin', 10),
  ('feature_access', 'role_management', 'User Role Management', 'Assign roles to household members', 'role_management', '{}', 'super_admin', 20)
ON CONFLICT (category_key, setting_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  setting_type = EXCLUDED.setting_type,
  required_role = EXCLUDED.required_role;

-- Add admin settings category for limited access control
INSERT INTO settings_categories (category_key, display_name, description, icon, sort_order, required_role)
VALUES 
  ('admin_access', 'Access Management', 'Manage member access to features (limited by your permissions)', 'Users', 35, 'admin')
ON CONFLICT (category_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  required_role = EXCLUDED.required_role;

-- Add admin settings item for member access control
INSERT INTO settings_items (category_key, setting_key, display_name, description, setting_type, default_value, required_role, sort_order)
VALUES 
  ('admin_access', 'member_access_control', 'Member Access Control', 'Grant or revoke feature access for members (within your permission level)', 'member_access_matrix', '{}', 'admin', 10)
ON CONFLICT (category_key, setting_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  setting_type = EXCLUDED.setting_type,
  required_role = EXCLUDED.required_role;

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION check_feature_access(user_id_param uuid, feature_name_param text)
RETURNS boolean AS $$
DECLARE
  user_role text;
  user_household_id uuid;
  has_access boolean := false;
BEGIN
  -- Get user role and household
  SELECT role, household_id INTO user_role, user_household_id
  FROM profiles 
  WHERE id = user_id_param;
  
  -- If no role found, default to member
  IF user_role IS NULL THEN
    user_role := 'member';
  END IF;
  
  -- Check if user has access to this feature
  SELECT available INTO has_access
  FROM feature_access
  WHERE household_id = user_household_id
    AND feature_name = feature_name_param
    AND role = user_role;
  
  -- If no specific access rule found, default based on core features
  IF has_access IS NULL THEN
    -- Core features are always available
    IF feature_name_param IN ('dashboard', 'settings', 'sign_out') THEN
      has_access := true;
    ELSE
      has_access := false;
    END IF;
  END IF;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-setup feature access for new households
CREATE OR REPLACE FUNCTION trigger_setup_feature_access()
RETURNS trigger AS $$
BEGIN
  PERFORM setup_default_feature_access(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new households
DROP TRIGGER IF EXISTS setup_feature_access_on_household_create ON households;
CREATE TRIGGER setup_feature_access_on_household_create
  AFTER INSERT ON households
  FOR EACH ROW
  EXECUTE FUNCTION trigger_setup_feature_access();

-- Comments for documentation
COMMENT ON TABLE feature_access IS 'Stores role-based feature access permissions for household members';
COMMENT ON COLUMN feature_access.household_id IS 'Reference to the household this access rule applies to';
COMMENT ON COLUMN feature_access.feature_name IS 'The name/key of the feature being controlled';
COMMENT ON COLUMN feature_access.feature_category IS 'Category grouping for the feature (meals, lists, admin, etc.)';
COMMENT ON COLUMN feature_access.role IS 'The role this access rule applies to (member, admin, super_admin)';
COMMENT ON COLUMN feature_access.available IS 'Whether this feature is available to this role';

COMMENT ON FUNCTION setup_default_feature_access(uuid) IS 'Sets up default feature access permissions for a household';
COMMENT ON FUNCTION check_feature_access(uuid, text) IS 'Checks if a user has access to a specific feature';