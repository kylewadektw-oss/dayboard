-- 03_calendar_rls.sql
-- Row Level Security policies for calendar system

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_links ENABLE ROW LEVEL SECURITY;

-- Calendar events policies - members can manage events in their household
CREATE POLICY "members read manual events"
  ON calendar_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.user_id = auth.uid()
      AND pr.household_id = calendar_events.household_id
  ));

CREATE POLICY "members write manual events"
  ON calendar_events FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.user_id = auth.uid()
      AND pr.household_id = calendar_events.household_id
  ));

CREATE POLICY "members update manual events"
  ON calendar_events FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.user_id = auth.uid()
      AND pr.household_id = calendar_events.household_id
  ));

CREATE POLICY "members delete manual events"
  ON calendar_events FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM profiles pr
    WHERE pr.user_id = auth.uid()
      AND pr.household_id = calendar_events.household_id
  ));

-- Calendar event links policies
CREATE POLICY "members read event links"
  ON calendar_event_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM calendar_events ce
    JOIN profiles pr ON pr.household_id = ce.household_id
    WHERE ce.id = calendar_event_links.event_id
      AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members write event links"
  ON calendar_event_links FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM calendar_events ce
    JOIN profiles pr ON pr.household_id = ce.household_id
    WHERE ce.id = calendar_event_links.event_id
      AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members update event links"
  ON calendar_event_links FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM calendar_events ce
    JOIN profiles pr ON pr.household_id = ce.household_id
    WHERE ce.id = calendar_event_links.event_id
      AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members delete event links"
  ON calendar_event_links FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM calendar_events ce
    JOIN profiles pr ON pr.household_id = ce.household_id
    WHERE ce.id = calendar_event_links.event_id
      AND pr.user_id = auth.uid()
  ));

-- Note: The v_calendar_feed view inherits underlying table policies automatically
-- No additional RLS needed on the view itself