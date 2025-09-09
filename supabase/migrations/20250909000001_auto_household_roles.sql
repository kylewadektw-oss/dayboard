-- Auto-assign household roles & promote specific user to super_admin
-- GENERATED MIGRATION: ensure first household member becomes admin; subsequent become member.

-- 1. Promote specific user to super_admin (trimmed _id suffix if present)
DO $$
DECLARE
  target_id uuid := '0139a6fc-bf13-426d-8929-604051c4d1f4';
BEGIN
  UPDATE profiles SET role = 'super_admin' WHERE id = target_id;
  IF NOT FOUND THEN
    RAISE NOTICE 'No profile found for %', target_id;
  ELSE
    RAISE NOTICE 'Promoted % to super_admin', target_id;
  END IF;
END $$;

-- 2. Function: On profile insert, if first in household -> admin else member (unless explicitly super_admin)
CREATE OR REPLACE FUNCTION set_initial_household_role()
RETURNS TRIGGER AS $$
DECLARE
  existing_count int;
BEGIN
  IF NEW.role = 'super_admin' THEN
    RETURN NEW; -- explicit super admin stays
  END IF;

  IF NEW.household_id IS NOT NULL THEN
    SELECT COUNT(*) INTO existing_count FROM profiles WHERE household_id = NEW.household_id;
    IF existing_count = 0 THEN
      NEW.role := 'admin';
      -- Defer setting households.admin_id until after NEW.id exists (AFTER INSERT trigger will handle)
    ELSE
      -- Only override if not explicitly provided
      IF NEW.role IS NULL OR NEW.role NOT IN ('admin','member') THEN
        NEW.role := 'member';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_initial_household_role_before_insert ON profiles;
CREATE TRIGGER set_initial_household_role_before_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_household_role();

-- 3. AFTER INSERT trigger to set households.admin_id when first member created
CREATE OR REPLACE FUNCTION assign_household_admin_if_missing()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.household_id IS NOT NULL AND NEW.role = 'admin' THEN
    -- Only set if households.admin_id is null
    UPDATE households SET admin_id = NEW.id, updated_at = now()
      WHERE id = NEW.household_id AND admin_id IS NULL;
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assign_household_admin_if_missing_after_insert ON profiles;
CREATE TRIGGER assign_household_admin_if_missing_after_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_household_admin_if_missing();

-- 4. (Optional) household_members support: first membership row gets admin, others member
CREATE OR REPLACE FUNCTION set_household_member_role()
RETURNS TRIGGER AS $$
DECLARE
  cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM household_members WHERE household_id = NEW.household_id;
  IF cnt = 0 THEN
    NEW.role := 'admin';
  ELSE
    IF NEW.role IS NULL OR NEW.role NOT IN ('admin','member') THEN
      NEW.role := 'member';
    END IF;
  END IF;
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

-- Only create trigger if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'household_members') THEN
    DROP TRIGGER IF EXISTS set_household_member_role_before_insert ON household_members;
    CREATE TRIGGER set_household_member_role_before_insert
      BEFORE INSERT ON household_members
      FOR EACH ROW
      EXECUTE FUNCTION set_household_member_role();
  END IF;
END $$;

-- NOTES:
-- - This migration assumes profile insertion occurs after household creation.
-- - If profiles are retroactively assigned household_id, an update script may be needed to backfill roles.
-- - To backfill existing data where households lack admin_id:
--     UPDATE households h SET admin_id = p.id FROM LATERAL (
--       SELECT id FROM profiles WHERE household_id = h.id ORDER BY created_at LIMIT 1
--     ) p WHERE h.admin_id IS NULL;
