-- FINAL: Complete Fix for Supabase Function Search Path Security Issues
-- Based on actual database query results - all 22 functions identified

-- Functions with no parameters (trigger functions)
ALTER FUNCTION public.assign_household_admin_if_missing() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.assign_household_code() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.create_default_permissions() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.generate_household_code() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.generate_invitation_code() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_household_member_role() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_initial_household_role() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_profile_completion() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_age_from_dob() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_household_admin() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = public;

-- Functions with parameters - using exact signatures from database
ALTER FUNCTION public.accept_household_invitation(text, uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_age_from_dob(date) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.create_household_invitation(uuid, text, text, text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_household_members(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_user_navigation(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_user_settings_tabs(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.join_household_by_code(character varying, uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.manage_household_member(uuid, character varying, uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.user_has_feature_access(uuid, text) SECURITY DEFINER SET search_path = public;

-- Utility functions (already secured but included for completeness)
-- Note: exec and exec_select already have search_path=pg_catalog, public which is secure
-- ALTER FUNCTION public.exec(text) SECURITY DEFINER SET search_path = public;
-- ALTER FUNCTION public.exec_select(text) SECURITY DEFINER SET search_path = public;

-- Total: 20 functions secured (exec functions already secure)
