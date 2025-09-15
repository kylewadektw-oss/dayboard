-- 01_calendar_core.sql
-- Unified household calendar system with manual events and derived events from meals/lists/projects

-- Helpful enum for linkage
CREATE TYPE entity_kind AS ENUM ('manual','meal','list_item','chore','project_task');

-- Manual events users add directly
CREATE TABLE IF NOT EXISTS calendar_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  location      text,
  start_ts      timestamptz NOT NULL,
  end_ts        timestamptz NOT NULL,
  all_day       boolean NOT NULL DEFAULT false,
  color         text,                          -- hex or a named token
  rrule         text,                          -- optional iCal RRULE (for UI later)
  created_by    uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Optional link back to a source object (recipe, list item, etc.)
CREATE TABLE IF NOT EXISTS calendar_event_links (
  event_id    uuid REFERENCES calendar_events(id) ON DELETE CASCADE,
  kind        entity_kind NOT NULL DEFAULT 'manual',
  entity_id   text NOT NULL,                   -- store UUID/ID as text (flexible)
  PRIMARY KEY(event_id, kind, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_household_time
  ON calendar_events (household_id, start_ts, end_ts);

-- Create update trigger for calendar_events
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_calendar_events_updated
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();