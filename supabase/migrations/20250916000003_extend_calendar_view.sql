-- Migration: Extend calendar feed with list items
-- BentLo Labs LLC - Dayboard™
-- Date: September 16, 2025
-- Purpose: Add list items with due dates to the calendar feed view

BEGIN;

-- Drop and recreate the v_calendar_feed view with list items included
DROP VIEW IF EXISTS public.v_calendar_feed;

-- Recreate with SECURITY INVOKER (default behavior) including list items
CREATE OR REPLACE VIEW v_calendar_feed AS
  -- Manual events
  SELECT
    'manual'::entity_kind    AS kind,
    e.id::text               AS event_id,
    e.household_id,
    e.title,
    e.description,
    e.location,
    e.start_ts,
    e.end_ts,
    e.all_day,
    e.color,
    null::text               AS link_href,
    jsonb_build_object('source','manual') AS meta
  FROM calendar_events e
  WHERE EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = e.household_id
  )

  UNION ALL

  -- List items with due dates (using correct column names)
  SELECT
    'list_item'::entity_kind  AS kind,
    concat('list-',li.id)     AS event_id,
    l.household_id,
    li.title                  AS title,
    COALESCE(li.notes, '')    AS description,
    null::text                AS location,
    li.due_at                 AS start_ts,
    li.due_at + interval '1 hour' AS end_ts,
    false                     AS all_day,
    '#3b82f6'                 AS color,        -- blue
    concat('/lists/', l.id)::text AS link_href,
    jsonb_build_object(
      'list_id', l.id, 
      'priority', COALESCE(li.priority, 'medium'), 
      'completed', COALESCE(li.completed, false)
    ) AS meta
  FROM list_items li
  JOIN lists l ON l.id = li.list_id
  WHERE li.due_at IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles pr 
      WHERE pr.user_id = auth.uid() AND pr.household_id = l.household_id
    )
;

-- Comment explaining the enhanced view
COMMENT ON VIEW v_calendar_feed IS 'Calendar feed view with SECURITY INVOKER (safe) - includes manual events and list items with due dates. Respects RLS policies of querying user.';

COMMIT;