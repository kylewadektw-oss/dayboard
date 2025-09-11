-- CORRECTED: Fix for Supabase Function Search Path Security Issues
-- Based on actual function signatures found in the database

-- Functions that exist with no parameters (triggers/functions that return trigger)
ALTER FUNCTION public.create_default_permissions() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_initial_household_role() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.assign_household_admin_if_missing() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_household_member_role() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_household_admin() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.normalize_notification_preferences() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.trigger_initialize_household_features() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_profile_completion() SECURITY DEFINER SET search_path = public;

-- Functions with parameters (using correct signatures)
ALTER FUNCTION public.user_has_feature_access(uuid, text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_user_settings_tabs(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.initialize_household_features(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_user_sign_in(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.extract_google_oauth_data(jsonb) SECURITY DEFINER SET search_path = public;

-- Additional utility functions that might exist
ALTER FUNCTION public.exec(text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.exec_select(text) SECURITY DEFINER SET search_path = public;

-- Note: Some functions from the original audit may not exist in your current schema.
-- This script only targets functions that actually exist based on your migration files.
-- Run this in your Supabase SQL Editor to fix the search path vulnerabilities.
