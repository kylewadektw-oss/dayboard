-- Migration: 20250908000001_fix_missing_household_type.sql
-- Purpose: Ensure public.households.household_type column & enum exist (idempotent) with minimal locking & clear audit notices.
-- Improvements applied: schema qualification, combined add+default, guarded backfill with row count, single transactional DO block (except concurrent index), defensive enum check, future enum guidance.

-- 1. Ensure enum household_type exists (defensive typtype = 'e')
DO $$
DECLARE
  v_added_column boolean := false;
  v_backfilled_count bigint := 0;
  v_nulls_remaining bigint := 0;
  v_total bigint := 0;
  v_column_exists boolean := false;
BEGIN
  -- Create enum if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'household_type' AND t.typtype = 'e'
  ) THEN
    CREATE TYPE household_type AS ENUM (
      'solo_user',
      'roommate_household',
      'couple_no_kids',
      'family_household',
      'single_parent_household',
      'multi_generational_household'
    );
    RAISE NOTICE '[migration] Created enum household_type';
  END IF;

  -- Detect if column already exists
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'households' AND column_name = 'household_type'
  ) INTO v_column_exists;

  -- If column missing, add with DEFAULT so existing rows get virtual default without full rewrite.
  IF NOT v_column_exists THEN
    EXECUTE $$ALTER TABLE public.households ADD COLUMN household_type household_type DEFAULT 'family_household'$$;
    v_added_column := true;
    -- Count total rows implicitly backfilled via default
    SELECT count(*) INTO v_backfilled_count FROM public.households;
    RAISE NOTICE '[migration] Added column household_type with default; implicitly backfilled % existing rows.', v_backfilled_count;
  ELSE
    -- Column exists; check for any NULLs needing explicit backfill
    SELECT count(*) INTO v_nulls_remaining FROM public.households WHERE household_type IS NULL;
    IF v_nulls_remaining > 0 THEN
      EXECUTE $$UPDATE public.households SET household_type = 'family_household' WHERE household_type IS NULL$$;
      GET DIAGNOSTICS v_backfilled_count = ROW_COUNT;
      RAISE NOTICE '[migration] Backfilled % rows with household_type = family_household (previously NULL).', v_backfilled_count;
    ELSE
      RAISE NOTICE '[migration] No NULL household_type values to backfill.';
    END IF;
  END IF;

  -- Enforce NOT NULL only if no NULLs remain (covers both paths)
  SELECT count(*) INTO v_nulls_remaining FROM public.households WHERE household_type IS NULL;
  IF v_nulls_remaining = 0 THEN
    -- Safe to set NOT NULL (idempotent: will fail only if already not null? ALTER ... SET NOT NULL is idempotent if already set)
    BEGIN
      EXECUTE $$ALTER TABLE public.households ALTER COLUMN household_type SET NOT NULL$$;
      RAISE NOTICE '[migration] Set household_type NOT NULL.';
    EXCEPTION WHEN duplicate_object THEN
      -- Ignore if already not null (rare race) - though duplicate_object typically not raised here, kept defensively.
      RAISE NOTICE '[migration] household_type NOT NULL already enforced.';
    END;
  ELSE
    RAISE WARNING '[migration] Skipped NOT NULL; % rows still NULL.', v_nulls_remaining;
  END IF;

  -- Drop default to avoid forcing future rows to a possibly generic value; application should set explicitly.
  -- This is safe even if default already absent.
  EXECUTE $$ALTER TABLE public.households ALTER COLUMN household_type DROP DEFAULT$$;
  RAISE NOTICE '[migration] Dropped default for household_type (explicit future writes required).';

  -- Re-add / ensure documentation comment
  COMMENT ON COLUMN public.households.household_type IS 'Type of household structure for organization & feature customization';
  RAISE NOTICE '[migration] Ensured comment on public.households.household_type';

  -- Totals overview (post state)
  SELECT count(*) INTO v_total FROM public.households;
  RAISE NOTICE '[migration] Post-state summary: total rows=%, nulls remaining=%', v_total, v_nulls_remaining;
END $$;

-- 2. Create index concurrently to minimize write locking (outside DO block; cannot be inside a transaction for CONCURRENTLY)
-- If table is small and you prefer simpler semantics, you could switch back to standard CREATE INDEX IF NOT EXISTS.
DO $$
BEGIN
  -- Check if index exists first (cannot use IF NOT EXISTS with a dynamic CONCURRENTLY if we want portable existence check across versions)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_households_household_type'
  ) THEN
    -- Note: CREATE INDEX CONCURRENTLY cannot run inside a transaction block; each DO runs in its own implicit transaction
    EXECUTE 'CREATE INDEX CONCURRENTLY idx_households_household_type ON public.households(household_type)';
    RAISE NOTICE '[migration] Created index idx_households_household_type concurrently.';
  ELSE
    RAISE NOTICE '[migration] Index idx_households_household_type already exists.';
  END IF;
END $$;

-- 3. Validation guidance (manual):
--   SELECT household_type, count(*) FROM public.households GROUP BY 1 ORDER BY 2 DESC;
--   
-- Future enum evolution: to add a new value use: 
--   ALTER TYPE household_type ADD VALUE IF NOT EXISTS 'new_value';
--   (Removing values is not straightforward; plan deprecations accordingly.)
-- End of migration
