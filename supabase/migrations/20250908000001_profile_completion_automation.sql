-- Automate profile_completion_percentage calculation
-- Recomputes percentage on insert and when relevant fields change

CREATE OR REPLACE FUNCTION public.set_profile_completion()
RETURNS trigger AS $$
DECLARE
  total integer := 10; -- number of criteria
  filled integer := 0;
  pct integer := 0;
  np jsonb := coalesce(NEW.notification_preferences, '{}'::jsonb);
BEGIN
  -- 1. Name (full_name OR preferred_name)
  IF coalesce(nullif(trim(NEW.full_name),''), nullif(trim(NEW.preferred_name),'')) IS NOT NULL THEN filled := filled + 1; END IF;
  -- 2. Phone
  IF coalesce(nullif(trim(NEW.phone_number),'')) IS NOT NULL THEN filled := filled + 1; END IF;
  -- 3. Date of birth
  IF NEW.date_of_birth IS NOT NULL THEN filled := filled + 1; END IF;
  -- 4. Bio
  IF coalesce(nullif(trim(NEW.bio),'')) IS NOT NULL THEN filled := filled + 1; END IF;
  -- 5. Timezone (treat non-null / non-empty as filled)
  IF coalesce(nullif(trim(NEW.timezone),'')) IS NOT NULL THEN filled := filled + 1; END IF;
  -- 6. Language
  IF coalesce(nullif(trim(NEW.language),'')) IS NOT NULL THEN filled := filled + 1; END IF;
  -- 7. Dietary restrictions array present
  IF NEW.dietary_restrictions IS NOT NULL AND array_length(NEW.dietary_restrictions,1) > 0 THEN filled := filled + 1; END IF;
  -- 8. Allergies array present
  IF NEW.allergies IS NOT NULL AND array_length(NEW.allergies,1) > 0 THEN filled := filled + 1; END IF;
  -- 9. Avatar
  IF coalesce(nullif(trim(NEW.avatar_url),'')) IS NOT NULL THEN filled := filled + 1; END IF;
  -- 10. Notification preferences have at least one enabled flag (email/push/sms/daycare_pickup_backup)
  IF (np ? 'email' AND (np->>'email')::boolean = true)
     OR (np ? 'push' AND (np->>'push')::boolean = true)
     OR (np ? 'sms' AND (np->>'sms')::boolean = true)
     OR (np ? 'daycare_pickup_backup' AND (np->>'daycare_pickup_backup')::boolean = true) THEN
     filled := filled + 1;
  END IF;

  pct := (filled * 100 / total);
  IF pct > 100 THEN pct := 100; END IF;
  NEW.profile_completion_percentage := pct;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (drop first for idempotency)
DROP TRIGGER IF EXISTS trg_set_profile_completion ON profiles;
CREATE TRIGGER trg_set_profile_completion
BEFORE INSERT OR UPDATE OF full_name, preferred_name, phone_number, date_of_birth, bio, timezone, language, dietary_restrictions, allergies, avatar_url, notification_preferences
ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profile_completion();

-- Backfill existing rows (runs logic once)
UPDATE profiles SET profile_completion_percentage = (
  WITH np AS (
    SELECT notification_preferences AS prefs
    FROM profiles p2 WHERE p2.id = profiles.id
  )
  SELECT (
    (
      (CASE WHEN coalesce(nullif(trim(full_name),''), nullif(trim(preferred_name),'')) IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN coalesce(nullif(trim(phone_number),'')) IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN date_of_birth IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN coalesce(nullif(trim(bio),'')) IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN coalesce(nullif(trim(timezone),'')) IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN coalesce(nullif(trim(language),'')) IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN dietary_restrictions IS NOT NULL AND array_length(dietary_restrictions,1) > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN allergies IS NOT NULL AND array_length(allergies,1) > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN coalesce(nullif(trim(avatar_url),'')) IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN (
          (notification_preferences ? 'email' AND (notification_preferences->>'email')::boolean = true) OR
          (notification_preferences ? 'push' AND (notification_preferences->>'push')::boolean = true) OR
          (notification_preferences ? 'sms' AND (notification_preferences->>'sms')::boolean = true) OR
          (notification_preferences ? 'daycare_pickup_backup' AND (notification_preferences->>'daycare_pickup_backup')::boolean = true)
        ) THEN 1 ELSE 0 END)
    ) * 100 / 10
  )
);

-- Optional: ensure constraint still valid
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS valid_profile_completion,
  ADD CONSTRAINT valid_profile_completion CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100);
