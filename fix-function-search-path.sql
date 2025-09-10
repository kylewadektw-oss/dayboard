-- Fix for Supabase Function Search Path Security Issues
-- This script secures all database functions by setting proper search_path
-- Run this in your Supabase SQL Editor

-- 1. Fix get_user_settings_tabs function
ALTER FUNCTION public.get_user_settings_tabs() SECURITY DEFINER SET search_path = public;

-- 2. Fix create_default_permissions function  
ALTER FUNCTION public.create_default_permissions(uuid) SECURITY DEFINER SET search_path = public;

-- 3. Fix user_has_feature_access function
ALTER FUNCTION public.user_has_feature_access(text) SECURITY DEFINER SET search_path = public;

-- 4. Fix get_user_navigation function
ALTER FUNCTION public.get_user_navigation() SECURITY DEFINER SET search_path = public;

-- 5. Fix get_household_members function
ALTER FUNCTION public.get_household_members(uuid) SECURITY DEFINER SET search_path = public;

-- 6. Fix set_profile_completion function
ALTER FUNCTION public.set_profile_completion(uuid, boolean) SECURITY DEFINER SET search_path = public;

-- 7. Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = public;

-- 8. Fix join_household_by_code function
ALTER FUNCTION public.join_household_by_code(text) SECURITY DEFINER SET search_path = public;

-- 9. Fix generate_household_code function
ALTER FUNCTION public.generate_household_code() SECURITY DEFINER SET search_path = public;

-- 10. Fix assign_household_code function
ALTER FUNCTION public.assign_household_code(uuid, text) SECURITY DEFINER SET search_path = public;

-- 11. Fix update_household_admin function
ALTER FUNCTION public.update_household_admin(uuid, uuid) SECURITY DEFINER SET search_path = public;

-- 12. Fix set_initial_household_role function
ALTER FUNCTION public.set_initial_household_role(uuid, uuid) SECURITY DEFINER SET search_path = public;

-- 13. Fix assign_household_admin_if_missing function
ALTER FUNCTION public.assign_household_admin_if_missing(uuid) SECURITY DEFINER SET search_path = public;

-- 14. Fix set_household_member_role function
ALTER FUNCTION public.set_household_member_role(uuid, text) SECURITY DEFINER SET search_path = public;

-- 15. Fix generate_invitation_code function
ALTER FUNCTION public.generate_invitation_code() SECURITY DEFINER SET search_path = public;

-- 16. Fix create_household_invitation function
ALTER FUNCTION public.create_household_invitation(uuid, uuid, text) SECURITY DEFINER SET search_path = public;

-- 17. Fix accept_household_invitation function
ALTER FUNCTION public.accept_household_invitation(text) SECURITY DEFINER SET search_path = public;

-- 18. Fix manage_household_member function
ALTER FUNCTION public.manage_household_member(uuid, text, text) SECURITY DEFINER SET search_path = public;

-- 19. Fix calculate_age_from_dob function
ALTER FUNCTION public.calculate_age_from_dob(date) SECURITY DEFINER SET search_path = public;

-- 20. Fix update_age_from_dob function
ALTER FUNCTION public.update_age_from_dob() SECURITY DEFINER SET search_path = public;

-- Verify all functions are now secure
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    p.proconfig as search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_user_settings_tabs',
    'create_default_permissions',
    'user_has_feature_access',
    'get_user_navigation',
    'get_household_members',
    'set_profile_completion',
    'update_updated_at_column',
    'join_household_by_code',
    'generate_household_code',
    'assign_household_code',
    'update_household_admin',
    'set_initial_household_role',
    'assign_household_admin_if_missing',
    'set_household_member_role',
    'generate_invitation_code',
    'create_household_invitation',
    'accept_household_invitation',
    'manage_household_member',
    'calculate_age_from_dob',
    'update_age_from_dob'
)
ORDER BY p.proname;
