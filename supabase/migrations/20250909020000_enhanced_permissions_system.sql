-- Enhanced User Permissions and Role-Based Access Control System
-- Migration for comprehensive feature toggles and settings management

-- Create enum for feature access levels
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_level') THEN
    CREATE TYPE access_level AS ENUM ('super_admin_only', 'admin_only', 'member_and_up', 'all_users');
  END IF;
END $$;

-- Enhanced global feature control table
CREATE TABLE IF NOT EXISTS global_feature_control (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general', -- 'core', 'premium', 'admin', 'super_admin'
  access_level access_level NOT NULL DEFAULT 'all_users',
  is_enabled_globally boolean DEFAULT true,
  requires_subscription boolean DEFAULT false,
  minimum_tier subscription_tier DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feature settings per household (admin can toggle features for their household)
CREATE TABLE IF NOT EXISTS household_feature_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  is_enabled boolean DEFAULT true,
  enabled_for_admins boolean DEFAULT true,
  enabled_for_members boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(household_id, feature_key)
);

-- Individual user feature overrides (granular control)
CREATE TABLE IF NOT EXISTS user_feature_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  is_enabled boolean NOT NULL,
  reason text, -- 'admin_disabled', 'subscription_limit', 'user_preference', etc.
  set_by_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

-- Settings categories and tabs structure
CREATE TABLE IF NOT EXISTS settings_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  required_role user_role DEFAULT 'member',
  created_at timestamptz DEFAULT now()
);

-- Individual settings within categories
CREATE TABLE IF NOT EXISTS settings_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text REFERENCES settings_categories(category_key) ON DELETE CASCADE,
  setting_key text NOT NULL,
  display_name text NOT NULL,
  description text,
  setting_type text NOT NULL DEFAULT 'boolean', -- 'boolean', 'string', 'number', 'select', 'multi_select'
  default_value jsonb,
  options jsonb, -- For select/multi_select types
  required_role user_role DEFAULT 'member',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_key, setting_key)
);

-- User settings values
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Household settings values
CREATE TABLE IF NOT EXISTS household_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(household_id, setting_key)
);

-- Insert default feature controls
INSERT INTO global_feature_control (feature_key, display_name, description, category, access_level, is_enabled_globally, requires_subscription, minimum_tier) 
VALUES
  -- Core features (always available)
  ('dashboard', 'Dashboard', 'Main family dashboard with widgets and overview', 'core', 'all_users', true, false, 'free'),
  ('profile', 'Profile Management', 'User and household profile management', 'core', 'all_users', true, false, 'free'),
  ('meals', 'Meal Planning', 'Meal planning, recipes, and grocery lists', 'core', 'all_users', true, false, 'free'),
  ('lists', 'List Management', 'Todo lists, shopping lists, and checklists', 'core', 'all_users', true, false, 'free'),
  ('projects', 'Project Management', 'Family projects and task tracking', 'core', 'all_users', true, false, 'free'),
  ('work', 'Work Schedules', 'Work schedule tracking and coordination', 'core', 'member_and_up', true, false, 'free'),
  
  -- Premium features
  ('sports_ticker', 'Sports Ticker', 'Live sports scores and updates', 'premium', 'all_users', true, true, 'premium'),
  ('financial_tracking', 'Financial Tracking', 'Budget tracking and expense management', 'premium', 'all_users', true, true, 'premium'),
  ('ai_features', 'AI Assistant', 'AI-powered suggestions and automation', 'premium', 'all_users', true, true, 'family_plus'),
  ('weather_extended', 'Extended Weather', 'Detailed weather forecasts and alerts', 'premium', 'all_users', true, true, 'premium'),
  ('calendar_sync', 'Calendar Sync', 'Advanced calendar integration and sync', 'premium', 'all_users', true, true, 'premium'),
  
  -- Admin features
  ('household_management', 'Household Management', 'Manage household settings and members', 'admin', 'admin_only', true, false, 'free'),
  ('user_management', 'User Management', 'Add, remove, and manage household members', 'admin', 'admin_only', true, false, 'free'),
  ('feature_management', 'Feature Management', 'Control feature access for household members', 'admin', 'admin_only', true, false, 'free'),
  ('billing_management', 'Billing Management', 'Manage subscriptions and billing', 'admin', 'admin_only', true, false, 'free'),
  ('household_analytics', 'Household Analytics', 'Usage analytics and insights', 'admin', 'admin_only', true, true, 'premium'),
  
  -- Super Admin features
  ('system_admin', 'System Administration', 'System-wide administrative functions', 'super_admin', 'super_admin_only', true, false, 'free'),
  ('global_feature_control', 'Global Feature Control', 'Control feature availability system-wide', 'super_admin', 'super_admin_only', true, false, 'free'),
  ('analytics_dashboard', 'Analytics Dashboard', 'System-wide analytics and reporting', 'super_admin', 'super_admin_only', true, false, 'free'),
  ('user_impersonation', 'User Impersonation', 'Impersonate users for support', 'super_admin', 'super_admin_only', true, false, 'free'),
  ('system_monitoring', 'System Monitoring', 'Monitor system health and performance', 'super_admin', 'super_admin_only', true, false, 'free')
ON CONFLICT (feature_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  access_level = EXCLUDED.access_level,
  updated_at = now();

-- Insert default settings categories
INSERT INTO settings_categories (category_key, display_name, description, icon, sort_order, required_role)
VALUES
  ('member', 'Member Settings', 'Basic user preferences and settings', 'User', 1, 'member'),
  ('admin', 'Admin Settings', 'Household administration and management', 'Shield', 2, 'admin'),
  ('super_admin', 'Super Admin', 'System-wide administration', 'Crown', 3, 'super_admin')
ON CONFLICT (category_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  required_role = EXCLUDED.required_role;

-- Insert default settings items
INSERT INTO settings_items (category_key, setting_key, display_name, description, setting_type, default_value, required_role, sort_order)
VALUES
  -- Member settings
  ('member', 'notifications_email', 'Email Notifications', 'Receive notifications via email', 'boolean', 'true', 'member', 1),
  ('member', 'notifications_push', 'Push Notifications', 'Receive browser/app push notifications', 'boolean', 'true', 'member', 2),
  ('member', 'notifications_sms', 'SMS Notifications', 'Receive text message notifications', 'boolean', 'false', 'member', 3),
  ('member', 'theme_preference', 'Theme', 'Choose your preferred theme', 'select', '"light"', 'member', 4),
  ('member', 'language', 'Language', 'Interface language preference', 'select', '"en"', 'member', 5),
  ('member', 'timezone', 'Timezone', 'Your local timezone', 'string', '"America/New_York"', 'member', 6),
  ('member', 'dashboard_widgets', 'Dashboard Widgets', 'Customize which widgets appear on your dashboard', 'multi_select', '["weather", "calendar", "tasks"]', 'member', 7),
  
  -- Admin settings
  ('admin', 'household_name', 'Household Name', 'Display name for your household', 'string', '""', 'admin', 1),
  ('admin', 'household_timezone', 'Household Timezone', 'Default timezone for the household', 'string', '"America/New_York"', 'admin', 2),
  ('admin', 'member_permissions_dashboard', 'Dashboard Access', 'Allow members to access the dashboard', 'boolean', 'true', 'admin', 3),
  ('admin', 'member_permissions_meals', 'Meal Planning Access', 'Allow members to access meal planning', 'boolean', 'true', 'admin', 4),
  ('admin', 'member_permissions_lists', 'Lists Access', 'Allow members to access lists', 'boolean', 'true', 'admin', 5),
  ('admin', 'member_permissions_projects', 'Projects Access', 'Allow members to access projects', 'boolean', 'true', 'admin', 6),
  ('admin', 'member_permissions_work', 'Work Schedules Access', 'Allow members to access work schedules', 'boolean', 'false', 'admin', 7),
  ('admin', 'auto_approve_members', 'Auto-approve New Members', 'Automatically approve new household members', 'boolean', 'false', 'admin', 8),
  ('admin', 'require_member_approval', 'Require Admin Approval', 'Require admin approval for member actions', 'boolean', 'false', 'admin', 9),
  
  -- Super Admin settings
  ('super_admin', 'global_signup_enabled', 'Global Signup Enabled', 'Allow new user registrations', 'boolean', 'true', 'super_admin', 1),
  ('super_admin', 'maintenance_mode', 'Maintenance Mode', 'Enable maintenance mode', 'boolean', 'false', 'super_admin', 2),
  ('super_admin', 'max_households_per_user', 'Max Households Per User', 'Maximum number of households a user can join', 'number', '3', 'super_admin', 3),
  ('super_admin', 'default_subscription_tier', 'Default Subscription Tier', 'Default tier for new households', 'select', '"free"', 'super_admin', 4),
  ('super_admin', 'enable_analytics', 'Enable Analytics', 'Collect usage analytics', 'boolean', 'true', 'super_admin', 5)
ON CONFLICT (category_key, setting_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  setting_type = EXCLUDED.setting_type,
  default_value = EXCLUDED.default_value,
  required_role = EXCLUDED.required_role,
  sort_order = EXCLUDED.sort_order;

-- Update settings items with proper options for select fields
UPDATE settings_items SET options = '[
  {"value": "light", "label": "Light"},
  {"value": "dark", "label": "Dark"},
  {"value": "auto", "label": "Auto"}
]'::jsonb WHERE setting_key = 'theme_preference';

UPDATE settings_items SET options = '[
  {"value": "en", "label": "English"},
  {"value": "es", "label": "Spanish"},
  {"value": "fr", "label": "French"},
  {"value": "de", "label": "German"},
  {"value": "it", "label": "Italian"}
]'::jsonb WHERE setting_key = 'language';

UPDATE settings_items SET options = '[
  {"value": "weather", "label": "Weather Widget"},
  {"value": "calendar", "label": "Calendar Widget"},
  {"value": "tasks", "label": "Tasks Widget"},
  {"value": "meals", "label": "Meals Widget"},
  {"value": "family", "label": "Family Status"}
]'::jsonb WHERE setting_key = 'dashboard_widgets';

UPDATE settings_items SET options = '[
  {"value": "free", "label": "Free"},
  {"value": "premium", "label": "Premium"},
  {"value": "family_plus", "label": "Family Plus"}
]'::jsonb WHERE setting_key = 'default_subscription_tier';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_household_feature_settings_household_id ON household_feature_settings(household_id);
CREATE INDEX IF NOT EXISTS idx_household_feature_settings_feature_key ON household_feature_settings(feature_key);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_user_id ON user_feature_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_feature_key ON user_feature_overrides(feature_key);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_household_settings_household_id ON household_settings(household_id);
CREATE INDEX IF NOT EXISTS idx_settings_items_category_key ON settings_items(category_key);

-- Enable RLS on new tables
ALTER TABLE global_feature_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_feature_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Global feature control (super admin only for writes, all users for reads)
CREATE POLICY "Anyone can read global features" ON global_feature_control
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage global features" ON global_feature_control
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Household feature settings (admins can manage their household features)
CREATE POLICY "Household members can view feature settings" ON household_feature_settings
  FOR SELECT TO authenticated USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage household feature settings" ON household_feature_settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'super_admin')
      AND household_id = household_feature_settings.household_id
    )
  );

-- User feature overrides
CREATE POLICY "Users can view their feature overrides" ON user_feature_overrides
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage household member overrides" ON user_feature_overrides
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      JOIN profiles p2 ON p1.household_id = p2.household_id
      WHERE p1.id = auth.uid() 
      AND p1.role IN ('admin', 'super_admin')
      AND p2.id = user_feature_overrides.user_id
    ) OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Settings categories (all authenticated users can read)
CREATE POLICY "Authenticated users can read settings categories" ON settings_categories
  FOR SELECT TO authenticated USING (true);

-- Settings items (all authenticated users can read)
CREATE POLICY "Authenticated users can read settings items" ON settings_items
  FOR SELECT TO authenticated USING (true);

-- User settings (users can manage their own settings)
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

-- Household settings (household members can view, admins can manage)
CREATE POLICY "Household members can view household settings" ON household_settings
  FOR SELECT TO authenticated USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage household settings" ON household_settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'super_admin')
      AND household_id = household_settings.household_id
    )
  );

-- Functions for feature access checking
CREATE OR REPLACE FUNCTION user_has_feature_access(
  user_id_param uuid,
  feature_key_param text
) RETURNS boolean AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  global_control global_feature_control%ROWTYPE;
  household_setting household_feature_settings%ROWTYPE;
  user_override user_feature_overrides%ROWTYPE;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = user_id_param;
  IF NOT FOUND THEN RETURN false; END IF;

  -- Get global feature control
  SELECT * INTO global_control FROM global_feature_control WHERE feature_key = feature_key_param;
  IF NOT FOUND OR NOT global_control.is_enabled_globally THEN RETURN false; END IF;

  -- Check role requirements
  CASE global_control.access_level
    WHEN 'super_admin_only' THEN
      IF user_profile.role != 'super_admin' THEN RETURN false; END IF;
    WHEN 'admin_only' THEN
      IF user_profile.role NOT IN ('admin', 'super_admin') THEN RETURN false; END IF;
    WHEN 'member_and_up' THEN
      -- All roles can access
    WHEN 'all_users' THEN
      -- All users can access
  END CASE;

  -- Check subscription requirements
  IF global_control.requires_subscription AND user_profile.household_id IS NOT NULL THEN
    -- Check household subscription level
    -- (Implementation depends on your subscription logic)
  END IF;

  -- Check user-specific override
  SELECT * INTO user_override FROM user_feature_overrides 
  WHERE user_id = user_id_param AND feature_key = feature_key_param;
  IF FOUND THEN RETURN user_override.is_enabled; END IF;

  -- Check household setting
  IF user_profile.household_id IS NOT NULL THEN
    SELECT * INTO household_setting FROM household_feature_settings 
    WHERE household_id = user_profile.household_id AND feature_key = feature_key_param;
    IF FOUND THEN
      CASE user_profile.role
        WHEN 'member' THEN RETURN household_setting.enabled_for_members;
        WHEN 'admin', 'super_admin' THEN RETURN household_setting.enabled_for_admins;
      END CASE;
    END IF;
  END IF;

  -- Default to enabled if no restrictions found
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize default household feature settings
CREATE OR REPLACE FUNCTION initialize_household_features(household_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO household_feature_settings (household_id, feature_key, is_enabled, enabled_for_admins, enabled_for_members)
  SELECT 
    household_id_param,
    feature_key,
    true, -- Default enabled
    true, -- Admins can use
    CASE 
      WHEN access_level = 'admin_only' OR access_level = 'super_admin_only' THEN false
      ELSE true
    END -- Members can use if not admin-only
  FROM global_feature_control
  WHERE category IN ('core', 'premium', 'admin')
  ON CONFLICT (household_id, feature_key) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize household features when a household is created
CREATE OR REPLACE FUNCTION trigger_initialize_household_features()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_household_features(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS initialize_household_features_trigger ON households;
CREATE TRIGGER initialize_household_features_trigger
  AFTER INSERT ON households
  FOR EACH ROW
  EXECUTE FUNCTION trigger_initialize_household_features();

-- Function to get user's available settings tabs
CREATE OR REPLACE FUNCTION get_user_settings_tabs(user_id_param uuid)
RETURNS TABLE (
  category_key text,
  display_name text,
  description text,
  icon text,
  sort_order integer
) AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM profiles WHERE id = user_id_param;
  
  RETURN QUERY
  SELECT 
    sc.category_key,
    sc.display_name,
    sc.description,
    sc.icon,
    sc.sort_order
  FROM settings_categories sc
  WHERE 
    CASE user_role
      WHEN 'super_admin' THEN true -- Super admin sees all tabs
      WHEN 'admin' THEN sc.required_role IN ('member', 'admin') -- Admin sees member and admin tabs
      WHEN 'member' THEN sc.required_role = 'member' -- Member sees only member tab
      ELSE false
    END
  ORDER BY sc.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
