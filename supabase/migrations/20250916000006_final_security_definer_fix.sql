-- Migration: Final fix for security definer view
-- BentLo Labs LLC - Dayboard™
-- Date: September 16, 2025
-- Purpose: Explicitly remove SECURITY DEFINER from v_calendar_feed view

BEGIN;

-- Drop the view completely to ensure clean slate
DROP VIEW IF EXISTS public.v_calendar_feed CASCADE;

-- Recreate with explicit SECURITY INVOKER (not DEFINER)
-- This is the safest approach to ensure no SECURITY DEFINER property
CREATE VIEW public.v_calendar_feed 
WITH (security_invoker = true)
AS
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

-- Verify the view was created with SECURITY INVOKER
DO $$
DECLARE
  view_def text;
BEGIN
  SELECT pg_get_viewdef('public.v_calendar_feed'::regclass) INTO view_def;
  IF view_def ILIKE '%security_definer%' THEN
    RAISE EXCEPTION 'ERROR: View still has SECURITY DEFINER property!';
  END IF;
  
  RAISE NOTICE 'SUCCESS: View created with SECURITY INVOKER (safe)';
END
$$;

-- Add explicit comment about security property
COMMENT ON VIEW v_calendar_feed IS 'Calendar feed view with explicit SECURITY INVOKER - respects RLS policies of querying user. Includes manual events and list items with due dates.';

COMMIT;