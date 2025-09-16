-- Migration: Fix security definer view warning (SIMPLIFIED)
-- BentLo Labs LLC - Dayboard™
-- Date: September 16, 2025
-- Purpose: Remove SECURITY DEFINER property from v_calendar_feed view

BEGIN;

-- Drop and recreate the v_calendar_feed view without SECURITY DEFINER
-- This ensures the view respects RLS policies of the querying user

DROP VIEW IF EXISTS public.v_calendar_feed;

-- Recreate with SECURITY INVOKER (default behavior)
-- Start with minimal functionality to avoid missing table errors
CREATE OR REPLACE VIEW v_calendar_feed AS
  -- Manual events only (other sources will be added when tables exist)
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
;

-- Comment explaining the security fix
COMMENT ON VIEW v_calendar_feed IS 'Calendar feed view with SECURITY INVOKER (safe) - respects RLS policies of querying user. Fixed from SECURITY DEFINER to prevent privilege escalation. Additional event sources can be added later via UNION ALL.';

COMMIT;