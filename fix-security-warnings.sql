-- Fix Supabase Security Warnings
-- Run this SQL script in your Supabase SQL Editor to address the security warnings

-- =============================================================================
-- 1. Fix Function Search Path Security Issues
-- =============================================================================

-- Fix the 5 specific functions mentioned in the security warnings
ALTER FUNCTION public.user_has_feature_access(uuid, text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.initialize_household_features(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.trigger_initialize_household_features() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_user_settings_tabs(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = public;

-- Verify the functions have been secured
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    CASE 
        WHEN p.proconfig IS NULL THEN 'NOT SET'
        ELSE array_to_string(p.proconfig, ', ')
    END as search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'user_has_feature_access',
    'initialize_household_features', 
    'trigger_initialize_household_features',
    'get_user_settings_tabs',
    'update_updated_at_column'
)
ORDER BY p.proname;

-- =============================================================================
-- 2. Manual Configuration Instructions for Auth Settings
-- =============================================================================

/*
The following security settings need to be configured manually in your Supabase Dashboard:

A. REDUCE OTP EXPIRY TIME (Currently > 1 hour):
   1. Go to Authentication > Settings in your Supabase Dashboard
   2. Find the "Email OTP Expiry" setting
   3. Set it to 3600 seconds (1 hour) or less
   4. Recommended: 1800 seconds (30 minutes) for better security

B. ENABLE LEAKED PASSWORD PROTECTION:
   1. Go to Authentication > Settings in your Supabase Dashboard
   2. Find the "Password Protection" section
   3. Enable "Check for leaked passwords" (uses HaveIBeenPwned.org)
   4. This prevents users from using compromised passwords

C. POSTGRES VERSION UPGRADE:
   1. Go to Settings > Infrastructure in your Supabase Dashboard
   2. Check for available Postgres upgrades
   3. Schedule the upgrade during a maintenance window
   4. Current version: supabase-postgres-17.4.1.074 has security patches available
   
   Note: Database upgrades require downtime and should be planned carefully.
   Consider upgrading during low-usage periods.
*/

-- =============================================================================
-- 3. Additional Security Hardening (Optional)
-- =============================================================================

-- Create a security audit function to check for common issues
CREATE OR REPLACE FUNCTION public.security_audit()
RETURNS TABLE (
    check_type text,
    status text,
    details text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check for functions without search_path
    RETURN QUERY
    SELECT 
        'Function Security'::text,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'
            ELSE 'FAIL'
        END::text,
        CASE 
            WHEN COUNT(*) = 0 THEN 'All functions have secure search_path'
            ELSE COUNT(*)::text || ' functions need search_path configuration'
        END::text
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND p.proconfig IS NULL;
    
    -- Check for tables without RLS
    RETURN QUERY
    SELECT 
        'Row Level Security'::text,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'
            ELSE 'WARNING'
        END::text,
        CASE 
            WHEN COUNT(*) = 0 THEN 'All tables have RLS enabled'
            ELSE COUNT(*)::text || ' tables without RLS: ' || string_agg(tablename, ', ')
        END::text
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.schemaname = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM pg_class c2
        WHERE c2.oid = c.oid AND c2.relrowsecurity = true
    )
    GROUP BY () -- Force aggregation
    HAVING COUNT(*) > 0;
END;
$$;

-- Run the security audit
SELECT * FROM public.security_audit();

-- =============================================================================
-- 4. Security Monitoring Query (Run periodically)
-- =============================================================================

-- Query to monitor function security status
CREATE OR REPLACE VIEW public.function_security_status AS
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    CASE 
        WHEN p.proconfig IS NULL THEN 'INSECURE: No search_path set'
        WHEN 'search_path=public' = ANY(p.proconfig) THEN 'SECURE: search_path=public'
        ELSE 'CHECK: Custom search_path - ' || array_to_string(p.proconfig, ', ')
    END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true
ORDER BY p.proname;

-- Check current security status
SELECT * FROM public.function_security_status 
WHERE security_status LIKE 'INSECURE%';