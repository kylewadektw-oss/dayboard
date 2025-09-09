-- Normalize notification_preferences structure and enforce defaults
-- Ensures all boolean keys exist and future writes are normalized automatically

CREATE OR REPLACE FUNCTION public.normalize_notification_preferences()
RETURNS trigger AS $$
DECLARE
  np jsonb := coalesce(NEW.notification_preferences, '{}'::jsonb);
  email_val boolean;
  push_val boolean;
  sms_val boolean;
  daycare_val boolean;
BEGIN
  -- Safely cast existing values if present, else apply defaults
  email_val := CASE WHEN np ? 'email' THEN (np->>'email')::boolean ELSE true END; -- default: true
  push_val := CASE WHEN np ? 'push' THEN (np->>'push')::boolean ELSE true END;    -- default: true
  sms_val := CASE WHEN np ? 'sms' THEN (np->>'sms')::boolean ELSE false END;      -- default: false
  daycare_val := CASE WHEN np ? 'daycare_pickup_backup' THEN (np->>'daycare_pickup_backup')::boolean ELSE false END; -- default: false
  NEW.notification_preferences := jsonb_build_object(
    'email', email_val,
    'push', push_val,
    'sms', sms_val,
    'daycare_pickup_backup', daycare_val
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to normalize on insert/update
DROP TRIGGER IF EXISTS trg_normalize_notification_prefs ON profiles;
CREATE TRIGGER trg_normalize_notification_prefs
BEFORE INSERT OR UPDATE OF notification_preferences ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.normalize_notification_preferences();

-- Backfill existing rows (idempotent) - rewrite structure
UPDATE profiles p SET notification_preferences = (
  WITH np AS (
    SELECT coalesce(p.notification_preferences,'{}'::jsonb) j
  )
  SELECT jsonb_build_object(
    'email', CASE WHEN (p.notification_preferences ? 'email') THEN (p.notification_preferences->>'email')::boolean ELSE true END,
    'push', CASE WHEN (p.notification_preferences ? 'push') THEN (p.notification_preferences->>'push')::boolean ELSE true END,
    'sms', CASE WHEN (p.notification_preferences ? 'sms') THEN (p.notification_preferences->>'sms')::boolean ELSE false END,
    'daycare_pickup_backup', CASE WHEN (p.notification_preferences ? 'daycare_pickup_backup') THEN (p.notification_preferences->>'daycare_pickup_backup')::boolean ELSE false END
  )
) WHERE true;

-- Constraint to ensure required keys exist
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_notification_preferences;
ALTER TABLE profiles ADD CONSTRAINT valid_notification_preferences CHECK (
  jsonb_typeof(notification_preferences) = 'object' AND
  notification_preferences ? 'email' AND
  notification_preferences ? 'push' AND
  notification_preferences ? 'sms' AND
  notification_preferences ? 'daycare_pickup_backup'
);
