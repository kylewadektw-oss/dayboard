-- Migration: Add missing RLS policies for tables with enabled RLS
-- BentLo Labs LLC - Dayboard™
-- Date: September 16, 2025
-- Purpose: Create RLS policies for tables that have RLS enabled but no policies

BEGIN;

-- Add RLS policies for calendar_events table
CREATE POLICY "household_members_read_calendar_events" ON calendar_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = calendar_events.household_id
  ));

CREATE POLICY "household_members_write_calendar_events" ON calendar_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = calendar_events.household_id
  ));

CREATE POLICY "household_members_update_calendar_events" ON calendar_events FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = calendar_events.household_id
  ));

CREATE POLICY "household_members_delete_calendar_events" ON calendar_events FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = calendar_events.household_id
  ));

-- Add RLS policies for calendar_event_links table (if it exists)
-- These inherit security from the parent calendar event
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'calendar_event_links' AND schemaname = 'public') THEN
    EXECUTE 'CREATE POLICY "household_members_read_calendar_event_links" ON calendar_event_links FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM calendar_events ce
        JOIN profiles pr ON pr.household_id = ce.household_id
        WHERE ce.id = calendar_event_links.event_id AND pr.user_id = auth.uid()
      ))';
    
    EXECUTE 'CREATE POLICY "household_members_write_calendar_event_links" ON calendar_event_links FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM calendar_events ce
        JOIN profiles pr ON pr.household_id = ce.household_id
        WHERE ce.id = calendar_event_links.event_id AND pr.user_id = auth.uid()
      ))';
    
    EXECUTE 'CREATE POLICY "household_members_update_calendar_event_links" ON calendar_event_links FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM calendar_events ce
        JOIN profiles pr ON pr.household_id = ce.household_id
        WHERE ce.id = calendar_event_links.event_id AND pr.user_id = auth.uid()
      ))';
    
    EXECUTE 'CREATE POLICY "household_members_delete_calendar_event_links" ON calendar_event_links FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM calendar_events ce
        JOIN profiles pr ON pr.household_id = ce.household_id
        WHERE ce.id = calendar_event_links.event_id AND pr.user_id = auth.uid()
      ))';
  END IF;
END
$$;

-- Add RLS policies for household_features table (if it exists)
-- These control feature access per household
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'household_features' AND schemaname = 'public') THEN
    EXECUTE 'CREATE POLICY "household_members_read_household_features" ON household_features FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM profiles pr 
        WHERE pr.user_id = auth.uid() AND pr.household_id = household_features.household_id
      ))';
    
    EXECUTE 'CREATE POLICY "household_admins_write_household_features" ON household_features FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles pr 
        WHERE pr.user_id = auth.uid() 
          AND pr.household_id = household_features.household_id
          AND pr.role IN (''admin'', ''super_admin'')
      ))';
    
    EXECUTE 'CREATE POLICY "household_admins_update_household_features" ON household_features FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM profiles pr 
        WHERE pr.user_id = auth.uid() 
          AND pr.household_id = household_features.household_id
          AND pr.role IN (''admin'', ''super_admin'')
      ))';
    
    EXECUTE 'CREATE POLICY "household_admins_delete_household_features" ON household_features FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM profiles pr 
        WHERE pr.user_id = auth.uid() 
          AND pr.household_id = household_features.household_id
          AND pr.role IN (''admin'', ''super_admin'')
      ))';
  END IF;
END
$$;

-- Add comments explaining the policies
COMMENT ON POLICY "household_members_read_calendar_events" ON calendar_events IS 'Allow household members to read calendar events for their household';
COMMENT ON POLICY "household_members_write_calendar_events" ON calendar_events IS 'Allow household members to create calendar events for their household';
COMMENT ON POLICY "household_members_update_calendar_events" ON calendar_events IS 'Allow household members to update calendar events for their household';
COMMENT ON POLICY "household_members_delete_calendar_events" ON calendar_events IS 'Allow household members to delete calendar events for their household';

COMMIT;