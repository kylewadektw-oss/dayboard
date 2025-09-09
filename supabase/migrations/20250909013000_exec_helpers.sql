-- Helper RPC Functions (exec, exec_select)
-- Idempotent creation of utility functions used by migration runner scripts.
-- Ensures controlled execution context with fixed search_path.

BEGIN;

-- Simple executor (no result)
CREATE OR REPLACE FUNCTION public.exec(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;
COMMENT ON FUNCTION public.exec(text) IS 'Execute arbitrary SQL (service role only) used by scripted migrations.';

-- Executor returning a single JSON value (for simple COUNT / scalar queries)
CREATE OR REPLACE FUNCTION public.exec_select(sql text)
RETURNS json AS $$
DECLARE r json; BEGIN EXECUTE sql INTO r; RETURN r; END; $$
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;
COMMENT ON FUNCTION public.exec_select(text) IS 'Execute a SQL statement and return one JSON value.';

COMMIT;
