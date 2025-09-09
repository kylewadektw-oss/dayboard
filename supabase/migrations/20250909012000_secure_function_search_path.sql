-- Secure Function Search Path Hardening
-- Fixes linter warnings: function_search_path_mutable
-- Strategy: For each listed function, if it exists, set immutable controlled search_path.
-- Using pg_catalog first to avoid hijacking of builtins; then public for objects we reference.
-- Idempotent: ALTER FUNCTION ... SET search_path is repeatable.

BEGIN;

DO $$
DECLARE
  fn text;
  stm text;
  funcs text[] := ARRAY[
    'create_default_permissions',
    'get_household_members',
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
    'update_age_from_dob',
    'set_profile_completion',
    'normalize_notification_preferences',
    'handle_new_user',
    'update_user_sign_in',
    'extract_google_oauth_data'
  ];
BEGIN
  FOREACH fn IN ARRAY funcs LOOP
    -- Only handle zero-arg functions (most of these). For those with args, add manually below.
    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn AND p.pronargs = 0
    ) THEN
      stm := format('ALTER FUNCTION public.%I() SET search_path = pg_catalog, public;', fn);
      EXECUTE stm;
    END IF;
  END LOOP;
END $$;

-- Handle functions with parameters explicitly (update_user_sign_in(uuid), extract_google_oauth_data(jsonb))
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='update_user_sign_in' AND p.pronargs=1) THEN
    EXECUTE 'ALTER FUNCTION public.update_user_sign_in(uuid) SET search_path = pg_catalog, public;';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='extract_google_oauth_data' AND p.pronargs=1) THEN
    EXECUTE 'ALTER FUNCTION public.extract_google_oauth_data(jsonb) SET search_path = pg_catalog, public;';
  END IF;
END $$;

COMMIT;

-- Post migration verification suggestions:
-- SELECT proname, current_setting FROM (
--   SELECT p.oid, p.proname,
--          (SELECT setting FROM pg_settings WHERE name='search_path') AS instance_default
--   FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
-- ) s;  -- (Optional) Custom query to inspect.
-- Better: \df+ public.* and inspect search_path column.

-- Remaining security warnings (manual actions):
-- 1. auth_otp_long_expiry: Reduce OTP expiry in Auth > Providers > Email (recommend <= 3600s).
-- 2. auth_leaked_password_protection: Enable "Leaked password protection" in Auth settings.
-- 3. vulnerable_postgres_version: Schedule upgrade in Project Settings -> Database -> Maintenance.
