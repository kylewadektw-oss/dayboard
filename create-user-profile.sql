-- 🔧 CREATE MISSING USER PROFILE
-- Run this in Supabase SQL editor to create profile for Kyle Wade

-- Create profile for the authenticated user
INSERT INTO profiles (
    user_id,
    name,
    age,
    profession,
    avatar_url,
    google_avatar_url,
    preferred_name,
    timezone,
    language,
    notification_preferences,
    privacy_settings,
    role,
    is_active,
    onboarding_completed,
    profile_completion_percentage,
    created_at,
    updated_at
) VALUES (
    '0139a6fc-bf13-426d-8929-604051c4d1f4',
    'Kyle Wade',
    35,
    'Software Developer',
    'https://lh3.googleusercontent.com/a/ACg8ocKui7F5ojd5EJlTILIq5xAufPb1WJ-NCTXEOmOIS_PduqtKQw=s96-c',
    'https://lh3.googleusercontent.com/a/ACg8ocKui7F5ojd5EJlTILIq5xAufPb1WJ-NCTXEOmOIS_PduqtKQw=s96-c',
    'Kyle',
    'America/New_York',
    'en',
    '{"email_notifications": true, "push_notifications": true}'::jsonb,
    '{"profile_visibility": "private", "data_sharing": false}'::jsonb,
    'household_admin',
    true,
    true,
    100,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    google_avatar_url = EXCLUDED.google_avatar_url,
    preferred_name = EXCLUDED.preferred_name,
    updated_at = NOW();

-- Create user permissions for the user
INSERT INTO user_permissions (
    user_id,
    can_manage_household,
    can_manage_users,
    can_view_analytics,
    can_manage_meals,
    can_manage_lists,
    can_manage_projects,
    can_manage_work,
    created_at,
    updated_at
) VALUES (
    '0139a6fc-bf13-426d-8929-604051c4d1f4',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    can_manage_household = EXCLUDED.can_manage_household,
    can_manage_users = EXCLUDED.can_manage_users,
    can_view_analytics = EXCLUDED.can_view_analytics,
    can_manage_meals = EXCLUDED.can_manage_meals,
    can_manage_lists = EXCLUDED.can_manage_lists,
    can_manage_projects = EXCLUDED.can_manage_projects,
    can_manage_work = EXCLUDED.can_manage_work,
    updated_at = NOW();

-- Verify the profile was created
SELECT 
    id,
    user_id,
    name,
    preferred_name,
    role,
    avatar_url,
    is_active,
    onboarding_completed
FROM profiles 
WHERE user_id = '0139a6fc-bf13-426d-8929-604051c4d1f4';

-- Success message
SELECT 'Profile and permissions created successfully for Kyle Wade!' as status;
