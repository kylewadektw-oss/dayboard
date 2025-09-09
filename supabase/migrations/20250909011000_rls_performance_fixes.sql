-- RLS Performance Fixes
-- 1) Replace direct auth.* calls with SELECT-wrapped form to avoid per-row re-evaluation initplans
-- 2) Drop explicitly duplicated indexes flagged by linter
-- 3) (Optional TODO) Consolidate multiple permissive policies per (table, role, action)
--    This script only normalizes auth.* usage + duplicate indexes to minimize risk.
--
-- Safe to re-run (idempotent-ish): Dynamic policy rewrite only touches policies containing auth.uid() or auth.role()
-- NOTE: Requires roles executing this migration to have rights to DROP / CREATE POLICY and DROP INDEX.

BEGIN;

-- Drop duplicate indexes (KEEP constraint-owned index; drop non-constraint duplicate only)
-- Improved logic: prior attempt failed because profiles_user_id_unique is constraint-owned.
DO $$
DECLARE
  households_idx1 oid; households_idx2 oid;
  profiles_idx1 oid; profiles_idx2 oid;
  households_idx1_is_constraint boolean; households_idx2_is_constraint boolean;
  profiles_idx1_is_constraint boolean; profiles_idx2_is_constraint boolean;
  same_households boolean; same_profiles boolean;
BEGIN
  SELECT oid INTO households_idx1 FROM pg_class WHERE relname='idx_households_created_by' AND relkind='i';
  SELECT oid INTO households_idx2 FROM pg_class WHERE relname='idx_households_created_by_fk' AND relkind='i';
  IF households_idx1 IS NOT NULL AND households_idx2 IS NOT NULL THEN
    SELECT pg_get_indexdef(households_idx1) = pg_get_indexdef(households_idx2) INTO same_households;
    IF same_households THEN
      SELECT EXISTS(SELECT 1 FROM pg_constraint WHERE conindid = households_idx1) INTO households_idx1_is_constraint;
      SELECT EXISTS(SELECT 1 FROM pg_constraint WHERE conindid = households_idx2) INTO households_idx2_is_constraint;
      -- Prefer to drop the one that is NOT constraint-owned
      IF households_idx1_is_constraint AND households_idx2_is_constraint THEN
        RAISE NOTICE 'Both household indexes are constraint-owned; manual review required (skipping)';
      ELSIF households_idx1_is_constraint THEN
        EXECUTE 'DROP INDEX IF EXISTS idx_households_created_by_fk';
      ELSIF households_idx2_is_constraint THEN
        EXECUTE 'DROP INDEX IF EXISTS idx_households_created_by';
      ELSE
        -- Neither constraint-owned: drop the second for determinism
        EXECUTE 'DROP INDEX IF EXISTS idx_households_created_by_fk';
      END IF;
    END IF;
  END IF;

  SELECT oid INTO profiles_idx1 FROM pg_class WHERE relname='profiles_user_id_key' AND relkind='i';
  SELECT oid INTO profiles_idx2 FROM pg_class WHERE relname='profiles_user_id_unique' AND relkind='i';
  IF profiles_idx1 IS NOT NULL AND profiles_idx2 IS NOT NULL THEN
    SELECT pg_get_indexdef(profiles_idx1) = pg_get_indexdef(profiles_idx2) INTO same_profiles;
    IF same_profiles THEN
      SELECT EXISTS(SELECT 1 FROM pg_constraint WHERE conindid = profiles_idx1) INTO profiles_idx1_is_constraint;
      SELECT EXISTS(SELECT 1 FROM pg_constraint WHERE conindid = profiles_idx2) INTO profiles_idx2_is_constraint;
      IF profiles_idx1_is_constraint AND profiles_idx2_is_constraint THEN
        RAISE NOTICE 'Both profile indexes are constraint-owned; skipping automatic drop';
      ELSIF profiles_idx1_is_constraint THEN
        EXECUTE 'DROP INDEX IF EXISTS profiles_user_id_unique';
      ELSIF profiles_idx2_is_constraint THEN
        EXECUTE 'DROP INDEX IF EXISTS profiles_user_id_key';
      ELSE
        EXECUTE 'DROP INDEX IF EXISTS profiles_user_id_unique';
      END IF;
    END IF;
  END IF;
END $$;

-- Dynamic rewrite of policies using auth.uid()/auth.role()
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  roles_csv text;
  cmd_text text;
  permissive_text text;
  create_sql text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        qual ILIKE '%auth.uid()%' OR with_check ILIKE '%auth.uid()%'
        OR qual ILIKE '%auth.role()%' OR with_check ILIKE '%auth.role()%'
      )
  LOOP
    new_qual := r.qual;
    new_check := r.with_check;
    IF new_qual IS NOT NULL THEN
      new_qual := replace(new_qual, 'auth.uid()', '(select auth.uid())');
      new_qual := replace(new_qual, 'auth.role()', '(select auth.role())');
    END IF;
    IF new_check IS NOT NULL THEN
      new_check := replace(new_check, 'auth.uid()', '(select auth.uid())');
      new_check := replace(new_check, 'auth.role()', '(select auth.role())');
    END IF;

    -- Build roles list
    IF array_length(r.roles,1) IS NULL THEN
      roles_csv := 'public';
    ELSE
      SELECT string_agg(quote_ident(role_name), ', ') INTO roles_csv
      FROM unnest(r.roles) AS role_name;
    END IF;

    cmd_text := r.cmd; -- already like 'SELECT','INSERT','UPDATE','DELETE','ALL'
    -- r.permissive is text in pg_policies view (values 'permissive'/'restrictive')
    permissive_text := CASE WHEN lower(r.permissive) = 'permissive' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END;

    -- Drop existing policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);

    -- Construct CREATE POLICY
    create_sql := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      r.policyname, r.schemaname, r.tablename, permissive_text, cmd_text, roles_csv);

    IF new_qual IS NOT NULL THEN
      create_sql := create_sql || format(' USING (%s)', new_qual);
    END IF;
    IF new_check IS NOT NULL THEN
      create_sql := create_sql || format(' WITH CHECK (%s)', new_check);
    END IF;

    EXECUTE create_sql;
  END LOOP;
END $$;

COMMIT;

-- Verification suggestions (run manually):
-- SELECT policyname, tablename, qual FROM pg_policies WHERE qual ILIKE '%auth.uid()%';  -- should be 0 rows now
-- SELECT policyname, tablename, with_check FROM pg_policies WHERE with_check ILIKE '%auth.uid()%';
-- TODO: Consolidate multiple permissive policies (manual domain logic required before automation).
