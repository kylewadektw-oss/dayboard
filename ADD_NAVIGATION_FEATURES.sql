-- ========================================================================
-- ADD NAVIGATION FEATURES TO ENHANCED PERMISSIONS
-- ========================================================================
-- 
-- PURPOSE: This migration adds comprehensive navigation access control to the
--          enhanced permissions system, allowing super admins to toggle access
--          to all sidebar features for different user roles.
--
-- EXECUTION: Run this SQL in Supabase Dashboard > SQL Editor
--
-- EXPECTED OUTCOME:
--   1. All navigation items (Dashboard, Meals, Lists, Work, Projects, Profile)
--      will be added as controllable features in global_feature_control
--   2. Development tools (Logs Dashboard, Simple Logging, Auth Debug) will be
--      added as super admin only features
--   3. Settings items will be created for toggle controls in the UI
--   4. Two new functions will be available:
--      - user_has_feature_access(): Check if a user can access a feature
--      - get_user_navigation(): Get navigation items with access status
--   5. Super admin can visit /settings > Super Admin tab to control access
--
-- PREREQUISITES:
--   - Enhanced permissions tables must exist (from previous migration)
--   - Tables required: global_feature_control, settings_items, profiles,
--     household_feature_settings, user_feature_overrides
--
-- POST-EXECUTION VERIFICATION:
--   - Visit /settings as super admin
--   - Check "Super Admin" tab for "Navigation Access Control" section
--   - Verify toggle switches work for all navigation features
--   - Test that member/admin access restrictions work as expected
-- ========================================================================

-- ========================================================================
-- STEP 1: INSERT NAVIGATION FEATURES
-- ========================================================================
-- 
-- Add all navigation items as controllable features in the global system.
-- Each feature defines access levels and categorization for proper control.
--
-- FEATURE CATEGORIES:
--   - navigation: Main app features (Dashboard, Meals, Lists, etc.)
--   - development: Debug tools (Logs, Auth Debug, etc.)
--   - admin: Administrative features
--   - super_admin: System-wide controls
--
-- ACCESS LEVELS & PERMISSION HIERARCHY:
--   - all: Available to all users (members, admins, super admins)
--   - member_plus: Available to members and above (members, admins, super admins)
--   - admin_only: Available to admins and super admins only (requires paid admin role)
--   - super_admin_only: Available to super admins only
--
-- ROLE-BASED ACCESS MODEL:
--   SUPER ADMIN: Universal access to everything + controls checkbox matrix for others
--   ADMIN: Gets access only when Super Admin checks their checkbox for each feature
--   MEMBER: Gets access only when Super Admin checks their checkbox for each feature
--
-- CHECKBOX ACCESS CONTROL MATRIX:
--   Super Admin sees a grid of checkboxes to control access:
--   ┌─────────────┬──────────────────────────────┬────────┬───────┬─────────────┐
--   │   Feature   │         Description          │ Member │ Admin │ Super Admin │
--   ├─────────────┼──────────────────────────────┼────────┼───────┼─────────────┤
--   │ Dashboard   │ Main dashboard overview      │   ☑️   │   ☑️  │     ✅      │
--   │ Meals       │ Meal planning & recipes      │   ☑️   │   ☑️  │     ✅      │
--   │ Work        │ Work tools & tracking        │   ☐   │   ☑️  │     ✅      │
--   │ Projects    │ Project management           │   ☐   │   ☑️  │     ✅      │
--   └─────────────┴──────────────────────────────┴────────┴───────┴─────────────┘
--   - ☑️ = Checked (access granted)
--   - ☐ = Unchecked (access denied)  
--   - ✅ = Always enabled (cannot be unchecked for Super Admin)
--
-- BUSINESS MODEL:
--   - First admin role: Included/standard
--   - Additional admin roles: Paid upgrade per admin
--   - Access control applies to each household independently
--
-- PERMISSION CONTROL:
--   Super Admin → Controls access matrix with checkboxes for each Feature + Role combination
--   Admin → Gets access when their specific checkbox is enabled for each feature
--   Member → Gets access when their specific checkbox is enabled for each feature
--
-- Insert navigation features into global_feature_control
INSERT INTO global_feature_control (feature_key, display_name, description, category, access_level, is_enabled_globally, requires_subscription, minimum_tier) VALUES
-- Main Navigation Features
('dashboard_access', 'Dashboard Access', 'Access to the main dashboard overview', 'navigation', 'all', true, false, 'free'),
('meals_access', 'Meals Module', 'Access to meal planning and recipe management', 'navigation', 'all', true, false, 'free'),
('lists_access', 'Lists Module', 'Access to task lists and checklists', 'navigation', 'all', true, false, 'free'),
('work_access', 'Work Module', 'Access to work-related tools and tracking', 'navigation', 'member_plus', true, false, 'free'),
('projects_access', 'Projects Module', 'Access to project management tools', 'navigation', 'member_plus', true, false, 'free'),
('profile_access', 'Profile Access', 'Access to user profile management', 'navigation', 'all', true, false, 'free'),
('settings_access', 'Settings Access', 'Access to application settings', 'navigation', 'admin_only', true, false, 'free'),

-- Development/Debug Features
('logs_dashboard_access', 'Logs Dashboard', 'Access to system logs and monitoring', 'development', 'super_admin_only', true, false, 'free'),
('simple_logging_access', 'Simple Logging Tool', 'Access to basic logging test interface', 'development', 'super_admin_only', true, false, 'free'),
('auth_debug_access', 'Auth Debug Tool', 'Access to authentication debugging tools', 'development', 'super_admin_only', true, false, 'free'),

-- Additional System Features
('user_management_access', 'User Management', 'Manage household members and invitations', 'admin', 'admin_only', true, false, 'free'),
('household_management', 'Household Management', 'Manage household settings and configuration', 'admin', 'admin_only', true, false, 'free'),
('global_system_controls', 'Global System Controls', 'System-wide feature management and maintenance', 'super_admin', 'super_admin_only', true, false, 'free')

ON CONFLICT (feature_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    access_level = EXCLUDED.access_level,
    updated_at = NOW();

-- ========================================================================
-- STEP 2: CREATE SETTINGS ITEMS FOR UI CONTROLS
-- ========================================================================
--
-- These settings items create the toggle switches in the Settings UI.
-- Super admins can use these to control navigation access for different roles.
--
-- SETTING CATEGORIES:
--   - super_admin: Controls that only super admins can modify
--
-- SETTING TYPES:
--   - boolean: Actual checkboxes (☑️/☐) in the UI for each role/feature combination
--   - checkbox: Visual checkbox controls for precise access management
--
-- EXPECTED UI BEHAVIOR:
--   - Settings appear in Settings > Super Admin tab as a feature access matrix:
--     * Table format with features as rows and user roles as columns
--     * Columns: Feature | Description | ☐ Member | ☐ Admin | ✅ Super Admin (always checked, disabled)
--     * ACTUAL CHECKBOXES (☑️/☐) in Member and Admin columns to grant/deny access
--     * Super Admin column shows ✅ (always checked and disabled - universal access)
--     * Each checkbox controls whether that role can access that specific feature
--   - Visual checkbox grid showing exactly who has access to what
--   - Super Admin can check/uncheck any Member or Admin access
--   - Changes take effect immediately for new navigation requests
--   - Existing user sessions may need refresh to see changes
--
-- Add new settings items for navigation control
INSERT INTO settings_items (category_key, setting_key, display_name, description, setting_type, default_value, required_role, sort_order) VALUES
-- Navigation Feature Access Matrix - Checkbox Controls for Super Admin
-- Dashboard Access Controls
('super_admin', 'dashboard_member_access', '☐ Dashboard - Member Access', 'Check to allow Members to access Dashboard overview and main features', 'checkbox', 'true', 'super_admin', 10),
('super_admin', 'dashboard_admin_access', '☐ Dashboard - Admin Access', 'Check to allow Admins to access Dashboard overview and main features', 'checkbox', 'true', 'super_admin', 11),

-- Meals Module Access Controls
('super_admin', 'meals_member_access', '☐ Meals - Member Access', 'Check to allow Members to access meal planning and recipe management', 'checkbox', 'true', 'super_admin', 20),
('super_admin', 'meals_admin_access', '☐ Meals - Admin Access', 'Check to allow Admins to access meal planning and recipe management', 'checkbox', 'true', 'super_admin', 21),

-- Lists Module Access Controls
('super_admin', 'lists_member_access', '☐ Lists - Member Access', 'Check to allow Members to access task lists and checklists', 'checkbox', 'true', 'super_admin', 30),
('super_admin', 'lists_admin_access', '☐ Lists - Admin Access', 'Check to allow Admins to access task lists and checklists', 'checkbox', 'true', 'super_admin', 31),

-- Work Module Access Controls
('super_admin', 'work_member_access', '☐ Work - Member Access', 'Check to allow Members to access work-related tools and tracking', 'checkbox', 'false', 'super_admin', 40),
('super_admin', 'work_admin_access', '☐ Work - Admin Access', 'Check to allow Admins to access work-related tools and tracking', 'checkbox', 'true', 'super_admin', 41),

-- Projects Module Access Controls
('super_admin', 'projects_member_access', '☐ Projects - Member Access', 'Check to allow Members to access project management tools', 'checkbox', 'false', 'super_admin', 50),
('super_admin', 'projects_admin_access', '☐ Projects - Admin Access', 'Check to allow Admins to access project management tools', 'checkbox', 'true', 'super_admin', 51),

-- Profile Access Controls
('super_admin', 'profile_member_access', '☐ Profile - Member Access', 'Check to allow Members to access and edit their user profile', 'checkbox', 'true', 'super_admin', 60),
('super_admin', 'profile_admin_access', '☐ Profile - Admin Access', 'Check to allow Admins to access and edit their user profile', 'checkbox', 'true', 'super_admin', 61),

-- Settings Access Controls
('super_admin', 'settings_member_access', '☐ Settings - Member Access', 'Check to allow Members to access application settings (basic settings only)', 'checkbox', 'false', 'super_admin', 70),
('super_admin', 'settings_admin_access', '☐ Settings - Admin Access', 'Check to allow Admins to access application settings (household settings)', 'checkbox', 'true', 'super_admin', 71),

-- Development Tools (Super Admin only when enabled)
('super_admin', 'enable_logs_dashboard', '☐ Enable Logs Dashboard (Dev Tool)', 'Check to show/hide Logs Dashboard in navigation - SUPER ADMIN ONLY when enabled', 'checkbox', 'false', 'super_admin', 100),
('super_admin', 'enable_simple_logging', '☐ Enable Simple Logging Tool (Dev Tool)', 'Check to show/hide Simple Logging test tool - SUPER ADMIN ONLY when enabled', 'checkbox', 'false', 'super_admin', 101),
('super_admin', 'enable_auth_debug', '☐ Enable Auth Debug Tool (Dev Tool)', 'Check to show/hide Auth Debug tool - SUPER ADMIN ONLY when enabled', 'checkbox', 'false', 'super_admin', 102),

-- Admin Role & Business Controls
('super_admin', 'max_admin_count', 'Max Admin Roles Allowed', 'Maximum number of admin roles in this household (additional admins require paid upgrade)', 'number', '1', 'super_admin', 200),
('super_admin', 'admin_upgrade_required', '☐ Require Paid Admin Upgrade', 'Check to enforce paid upgrade for admin roles beyond the first one', 'checkbox', 'true', 'super_admin', 201),
('super_admin', 'admin_features_enabled', '☐ Enable Admin Features', 'Check to turn on/off admin-only features like Settings and User Management', 'checkbox', 'true', 'super_admin', 202)

ON CONFLICT (category_key, setting_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    default_value = EXCLUDED.default_value,
    sort_order = EXCLUDED.sort_order;

-- ========================================================================
-- STEP 3: CREATE ACCESS CONTROL FUNCTION
-- ========================================================================
--
-- This function determines if a user has access to a specific feature.
-- It checks multiple levels of permissions in order of precedence:
--
-- PERMISSION HIERARCHY (highest to lowest precedence):
--   1. Super admin always has access (cannot be restricted)
--   2. Feature-specific role access settings (e.g., dashboard_member_access, work_admin_access)
--   3. Global feature enablement (if feature is globally disabled, no one has access)
--
-- ACCESS MATRIX LOGIC:
--   - Each feature has separate boolean settings for Member and Admin access
--   - Super admin access is implicit and cannot be disabled
--   - Granular control allows different permissions per feature per role
--   - Example: Members can access Dashboard but not Work, Admins can access both
--
-- SPECIAL RULES:
--   - If global feature is disabled, no one has access (including admins)
--   - Super admin always has access regardless of any settings
--   - Each role checks their specific feature setting (no inheritance)
--
-- PARAMETERS:
--   @user_id_param: UUID of the user to check
--   @feature_key_param: Feature key to check access for
--
-- RETURNS: BOOLEAN (true = has access, false = no access)
--
-- Create function to check if user has access to a feature
CREATE OR REPLACE FUNCTION user_has_feature_access(user_id_param UUID, feature_key_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    household_id_val UUID;
    global_enabled BOOLEAN;
    feature_access_level TEXT;
    role_setting_key TEXT;
    role_access_enabled BOOLEAN := false;
BEGIN
    -- Get user role and household
    SELECT role, household_id INTO user_role, household_id_val
    FROM profiles 
    WHERE id = user_id_param;
    
    -- Check if feature is globally enabled and get access level
    SELECT is_enabled_globally, access_level INTO global_enabled, feature_access_level
    FROM global_feature_control
    WHERE global_feature_control.feature_key = feature_key_param;
    
    -- If not globally enabled, return false
    IF NOT COALESCE(global_enabled, false) THEN
        RETURN false;
    END IF;
    
    -- Super admin always has access
    IF user_role = 'super_admin' THEN
        RETURN true;
    END IF;
    
    -- For navigation features, check the specific role-based setting
    role_setting_key := CASE 
        WHEN feature_key_param = 'dashboard_access' AND user_role = 'member' THEN 'dashboard_member_access'
        WHEN feature_key_param = 'dashboard_access' AND user_role = 'admin' THEN 'dashboard_admin_access'
        WHEN feature_key_param = 'meals_access' AND user_role = 'member' THEN 'meals_member_access'
        WHEN feature_key_param = 'meals_access' AND user_role = 'admin' THEN 'meals_admin_access'
        WHEN feature_key_param = 'lists_access' AND user_role = 'member' THEN 'lists_member_access'
        WHEN feature_key_param = 'lists_access' AND user_role = 'admin' THEN 'lists_admin_access'
        WHEN feature_key_param = 'work_access' AND user_role = 'member' THEN 'work_member_access'
        WHEN feature_key_param = 'work_access' AND user_role = 'admin' THEN 'work_admin_access'
        WHEN feature_key_param = 'projects_access' AND user_role = 'member' THEN 'projects_member_access'
        WHEN feature_key_param = 'projects_access' AND user_role = 'admin' THEN 'projects_admin_access'
        WHEN feature_key_param = 'profile_access' AND user_role = 'member' THEN 'profile_member_access'
        WHEN feature_key_param = 'profile_access' AND user_role = 'admin' THEN 'profile_admin_access'
        WHEN feature_key_param = 'settings_access' AND user_role = 'member' THEN 'settings_member_access'
        WHEN feature_key_param = 'settings_access' AND user_role = 'admin' THEN 'settings_admin_access'
        ELSE NULL
    END;
    
    -- Get current access setting for this role from super admin
    IF role_setting_key IS NOT NULL THEN
        SELECT COALESCE(
            (SELECT value::boolean
             FROM user_settings us
             JOIN profiles p ON p.id = us.user_id
             WHERE p.household_id = household_id_val 
             AND p.role = 'super_admin'
             AND us.setting_key = role_setting_key), 
            -- Default values based on feature and role
            CASE role_setting_key
                WHEN 'dashboard_member_access' THEN true
                WHEN 'dashboard_admin_access' THEN true
                WHEN 'meals_member_access' THEN true
                WHEN 'meals_admin_access' THEN true
                WHEN 'lists_member_access' THEN true
                WHEN 'lists_admin_access' THEN true
                WHEN 'work_member_access' THEN false
                WHEN 'work_admin_access' THEN true
                WHEN 'projects_member_access' THEN false
                WHEN 'projects_admin_access' THEN true
                WHEN 'profile_member_access' THEN true
                WHEN 'profile_admin_access' THEN true
                WHEN 'settings_member_access' THEN false
                WHEN 'settings_admin_access' THEN true
                ELSE false
            END) 
        INTO role_access_enabled;
        
        RETURN role_access_enabled;
    END IF;
    
    -- For development features, check if they're enabled (super admin only when enabled)
    IF feature_key_param IN ('logs_dashboard_access', 'simple_logging_access', 'auth_debug_access') THEN
        -- These are always super admin only features
        RETURN false;
    END IF;
    
    -- For other admin features not in the matrix, check if admin role
    IF feature_access_level = 'admin_only' THEN
        RETURN user_role = 'admin';
    END IF;
    
    -- Super admin only features
    IF feature_access_level = 'super_admin_only' THEN
        RETURN false;
    END IF;
    
    -- Default: allow access for member_plus and all levels
    RETURN feature_access_level IN ('all', 'member_plus');
END;
$$;

-- ========================================================================
-- STEP 4: CREATE NAVIGATION BUILDER FUNCTION
-- ========================================================================
--
-- This function builds the complete navigation menu for a user, including
-- access permissions for each item. Used by the UI to show/hide nav items.
--
-- FUNCTION BEHAVIOR:
--   - Returns all navigation and development features
--   - Includes URL paths and icon names for each feature
--   - Calculates access permissions using user_has_feature_access()
--   - Orders items by category (navigation first, then development)
--
-- RETURN COLUMNS:
--   - feature_key: Unique identifier for the feature
--   - display_name: Human-readable name for the UI
--   - href: URL path for navigation
--   - icon: Lucide icon name for the UI
--   - has_access: Boolean indicating if user can access this item
--   - category: Feature category for grouping
--
-- PARAMETERS:
--   @user_id_param: UUID of the user to generate navigation for
--
-- EXPECTED USAGE:
--   SELECT * FROM get_user_navigation('user-uuid-here');
--
-- Create function to get navigation items for a user
CREATE OR REPLACE FUNCTION get_user_navigation(user_id_param UUID)
RETURNS TABLE (
    feature_key TEXT,
    display_name TEXT,
    href TEXT,
    icon TEXT,
    has_access BOOLEAN,
    category TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gfc.feature_key,
        gfc.display_name,
        CASE gfc.feature_key
            WHEN 'dashboard_access' THEN '/dashboard'
            WHEN 'meals_access' THEN '/meals'
            WHEN 'lists_access' THEN '/lists'
            WHEN 'work_access' THEN '/work'
            WHEN 'projects_access' THEN '/projects'
            WHEN 'profile_access' THEN '/profile'
            WHEN 'settings_access' THEN '/settings'
            WHEN 'logs_dashboard_access' THEN '/logs-dashboard'
            WHEN 'simple_logging_access' THEN '/test-logging-simple'
            WHEN 'auth_debug_access' THEN '/auth-debug'
            ELSE '/'
        END as href,
        CASE gfc.feature_key
            WHEN 'dashboard_access' THEN 'Home'
            WHEN 'meals_access' THEN 'UtensilsCrossed'
            WHEN 'lists_access' THEN 'ClipboardList'
            WHEN 'work_access' THEN 'Briefcase'
            WHEN 'projects_access' THEN 'FolderOpen'
            WHEN 'profile_access' THEN 'User'
            WHEN 'settings_access' THEN 'Settings'
            WHEN 'logs_dashboard_access' THEN 'FileText'
            WHEN 'simple_logging_access' THEN 'Activity'
            WHEN 'auth_debug_access' THEN 'Bug'
            ELSE 'Circle'
        END as icon,
        user_has_feature_access(user_id_param, gfc.feature_key) as has_access,
        gfc.category
    FROM global_feature_control gfc
    WHERE gfc.category IN ('navigation', 'development')
    ORDER BY 
        CASE gfc.category 
            WHEN 'navigation' THEN 1 
            WHEN 'development' THEN 2 
            ELSE 3 
        END,
        gfc.feature_key;
END;
$$;

-- ========================================================================
-- STEP 5: DEPLOYMENT VERIFICATION
-- ========================================================================
--
-- This block provides immediate feedback on successful deployment.
-- It counts the created records and confirms the system is ready.
--
-- EXPECTED OUTPUT:
--   - Navigation features count (should be 10+)
--   - Control settings count (should be 15+)
--   - Success confirmation messages
--
-- IF ERRORS OCCUR:
--   - Check that all prerequisite tables exist
--   - Verify no conflicting feature_keys exist
--   - Ensure proper permissions for function creation
--
-- Success message
DO $$
DECLARE
    nav_feature_count INTEGER;
    settings_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO nav_feature_count 
    FROM global_feature_control 
    WHERE category IN ('navigation', 'development');
    
    SELECT COUNT(*) INTO settings_count 
    FROM settings_items 
    WHERE category_key = 'super_admin' 
    AND (setting_key LIKE '%access%' OR setting_key LIKE 'enable_%');
    
    RAISE NOTICE '🎉 Navigation Feature Controls deployed successfully!';
    RAISE NOTICE '✅ Added % navigation features', nav_feature_count;
    RAISE NOTICE '✅ Added % control settings', settings_count;
    RAISE NOTICE '🔧 Super admin can now control all navigation access via Settings';
END $$;

-- ========================================================================
-- POST-DEPLOYMENT INSTRUCTIONS
-- ========================================================================
--
-- 1. VERIFY DEPLOYMENT:
--    Run: SELECT COUNT(*) FROM global_feature_control WHERE category IN ('navigation', 'development');
--    Expected: 10+ features
--
-- 2. TEST UI ACCESS:
--    - Visit /settings as super admin
--    - Go to "Super Admin" tab
--    - Look for "Navigation Access Control" section
--    - Verify toggle switches are present and functional
--
-- 3. TEST PERMISSION FUNCTIONS:
--    Run: SELECT * FROM get_user_navigation('your-user-id');
--    Expected: List of navigation items with access status
--
-- 4. TEST ACCESS CONTROL & ROLE-BASED PERMISSIONS:
--    a) Super Admin Testing:
--       - Toggle member access features on/off in Settings > Super Admin
--       - Test that members lose/gain access appropriately
--       - Verify admin and super admin access is unaffected
--    
--    b) Admin Role Testing:
--       - Verify admins automatically get admin-only features (Settings, User Management)
--       - Test that admin features cannot be accessed by members
--       - Confirm admin role requirements for restricted features
--    
--    c) Member Permission Testing:
--       - Test member access to features enabled by super admin
--       - Verify members cannot access admin-only features
--       - Test that member access follows super admin settings only
--
-- 5. TROUBLESHOOTING:
--    - If UI controls don't appear: Check that settings_items were inserted
--    - If permissions don't work: Verify user roles in profiles table
--    - If functions fail: Check PostgreSQL function permissions
--    - If member access fails: Check super admin's member access settings
--    - If admin features don't work: Verify user has actual admin role (not just member)
--
-- 6. ROLE-BASED ACCESS EXAMPLES:
--    -- Check if user has admin role:
--    SELECT role FROM profiles WHERE id = 'user-uuid';
--    
--    -- Set member access to work module (super admin only):
--    INSERT INTO user_settings (user_id, setting_key, value)
--    VALUES ('super-admin-uuid', 'member_work_access', 'true');
--    
--    -- Verify admin count for billing:
--    SELECT COUNT(*) FROM profiles WHERE household_id = 'household-uuid' AND role = 'admin';
--
-- ========================================================================
