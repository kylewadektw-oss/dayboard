-- DAYBOARD ENHANCED PERMISSIONS SYSTEM
-- Execute this SQL in Supabase Dashboard > SQL Editor

-- Create global_feature_control table
CREATE TABLE IF NOT EXISTS global_feature_control (
    feature_key TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'core',
    access_level TEXT NOT NULL DEFAULT 'all',
    is_enabled_globally BOOLEAN NOT NULL DEFAULT true,
    requires_subscription BOOLEAN NOT NULL DEFAULT false,
    minimum_tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings_categories table
CREATE TABLE IF NOT EXISTS settings_categories (
    category_key TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Settings',
    sort_order INTEGER DEFAULT 0,
    required_role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings_items table  
CREATE TABLE IF NOT EXISTS settings_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_key TEXT NOT NULL REFERENCES settings_categories(category_key),
    setting_key TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    setting_type TEXT NOT NULL DEFAULT 'boolean',
    default_value JSONB,
    options JSONB,
    required_role TEXT NOT NULL DEFAULT 'member',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_key, setting_key)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- Create household_settings table
CREATE TABLE IF NOT EXISTS household_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(household_id, setting_key)
);

-- Create household_feature_settings table
CREATE TABLE IF NOT EXISTS household_feature_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL REFERENCES global_feature_control(feature_key),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    enabled_for_admins BOOLEAN NOT NULL DEFAULT true,
    enabled_for_members BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(household_id, feature_key)
);

-- Create user_feature_overrides table
CREATE TABLE IF NOT EXISTS user_feature_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL REFERENCES global_feature_control(feature_key),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    override_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_key)
);

-- Insert default settings categories
INSERT INTO settings_categories (category_key, display_name, description, icon, sort_order, required_role) VALUES
('member', 'Member Settings', 'Personal preferences and account settings', 'User', 1, 'member'),
('admin', 'Admin Settings', 'Household management and member permissions', 'Shield', 2, 'admin'),
('super_admin', 'Super Admin', 'System-wide controls and global settings', 'Crown', 3, 'super_admin')
ON CONFLICT (category_key) DO NOTHING;

-- Insert default feature controls
INSERT INTO global_feature_control (feature_key, display_name, description, category, access_level, is_enabled_globally, requires_subscription, minimum_tier) VALUES
('meals_module', 'Meals Module', 'Meal planning and recipe management', 'core', 'all', true, false, 'free'),
('chores_module', 'Chores Module', 'Task assignment and tracking', 'core', 'all', true, false, 'free'),
('calendar_module', 'Calendar Module', 'Shared household calendar', 'core', 'all', true, false, 'free'),
('budget_module', 'Budget Module', 'Expense tracking and budgeting', 'premium', 'admin_only', true, true, 'pro'),
('reports_module', 'Reports & Analytics', 'Detailed household insights', 'premium', 'admin_only', true, true, 'pro'),
('settings_access', 'Settings Access', 'Access to application settings', 'core', 'all', true, false, 'free'),
('user_management', 'User Management', 'Manage household members', 'admin', 'admin_only', true, false, 'free'),
('global_controls', 'Global Controls', 'System-wide feature management', 'super_admin', 'super_admin_only', true, false, 'free')
ON CONFLICT (feature_key) DO NOTHING;

-- Insert default settings items
INSERT INTO settings_items (category_key, setting_key, display_name, description, setting_type, default_value, required_role, sort_order) VALUES
('member', 'email_notifications', 'Email Notifications', 'Receive notifications via email', 'boolean', 'true', 'member', 1),
('member', 'dark_mode', 'Dark Mode', 'Use dark theme interface', 'boolean', 'false', 'member', 2),
('member', 'timezone', 'Timezone', 'Your preferred timezone', 'select', '"UTC"', 'member', 3),
('admin', 'household_name', 'Household Name', 'Display name for your household', 'string', '""', 'admin', 1),
('admin', 'invite_notifications', 'Invitation Notifications', 'Notify when new members join', 'boolean', 'true', 'admin', 2),
('admin', 'auto_assign_chores', 'Auto-assign Chores', 'Automatically distribute chores to members', 'boolean', 'false', 'admin', 3),
('super_admin', 'maintenance_mode', 'Maintenance Mode', 'Enable system maintenance mode', 'boolean', 'false', 'super_admin', 1),
('super_admin', 'registration_enabled', 'User Registration', 'Allow new user registrations', 'boolean', 'true', 'super_admin', 2)
ON CONFLICT (category_key, setting_key) DO NOTHING;

-- Create function to get user settings tabs
CREATE OR REPLACE FUNCTION get_user_settings_tabs(user_id_param UUID)
RETURNS TABLE (
    category_key TEXT,
    display_name TEXT,
    description TEXT,
    icon TEXT,
    sort_order INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get the user's role
    SELECT role INTO user_role
    FROM profiles 
    WHERE id = user_id_param;
    
    -- Return appropriate tabs based on role
    RETURN QUERY
    SELECT 
        sc.category_key,
        sc.display_name,
        sc.description,
        sc.icon,
        sc.sort_order
    FROM settings_categories sc
    WHERE 
        CASE 
            WHEN user_role = 'super_admin' THEN TRUE
            WHEN user_role = 'admin' AND sc.required_role IN ('member', 'admin') THEN TRUE
            WHEN user_role = 'member' AND sc.required_role = 'member' THEN TRUE
            ELSE FALSE
        END
    ORDER BY sc.sort_order;
END;
$$;

-- Enable RLS on all new tables
ALTER TABLE global_feature_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_feature_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for global_feature_control
CREATE POLICY "Anyone can read global feature controls" ON global_feature_control FOR SELECT USING (true);
CREATE POLICY "Only super admins can modify global feature controls" ON global_feature_control FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
);

-- RLS Policies for settings_categories
CREATE POLICY "Anyone can read settings categories" ON settings_categories FOR SELECT USING (true);

-- RLS Policies for settings_items  
CREATE POLICY "Anyone can read settings items" ON settings_items FOR SELECT USING (true);

-- RLS Policies for user_settings
CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- RLS Policies for household_settings
CREATE POLICY "Household admins can manage household settings" ON household_settings FOR ALL USING (
    household_id IN (
        SELECT household_id FROM profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- RLS Policies for household_feature_settings
CREATE POLICY "Household members can read household feature settings" ON household_feature_settings FOR SELECT USING (
    household_id IN (
        SELECT household_id FROM profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Household admins can manage household feature settings" ON household_feature_settings FOR INSERT WITH CHECK (
    household_id IN (
        SELECT household_id FROM profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Household admins can update household feature settings" ON household_feature_settings FOR UPDATE USING (
    household_id IN (
        SELECT household_id FROM profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- RLS Policies for user_feature_overrides
CREATE POLICY "Users can manage their own feature overrides" ON user_feature_overrides FOR ALL USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage member feature overrides in their household" ON user_feature_overrides FOR ALL USING (
    user_id IN (
        SELECT p1.id FROM profiles p1 
        JOIN profiles p2 ON p1.household_id = p2.household_id
        WHERE p2.user_id = auth.uid() 
        AND p2.role IN ('admin', 'super_admin')
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_household_settings_household_id ON household_settings(household_id);
CREATE INDEX IF NOT EXISTS idx_household_feature_settings_household_id ON household_feature_settings(household_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_user_id ON user_feature_overrides(user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Enhanced Permissions System deployed successfully!';
    RAISE NOTICE '✅ All tables, functions, and policies created';
    RAISE NOTICE '🔧 Ready for use with enhanced settings interface';
END $$;
