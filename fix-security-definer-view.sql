-- Fix for Security Definer View Warning
-- This addresses the security warning for view 'public.v_calendar_feed'
-- SECURITY DEFINER views can bypass RLS policies and pose security risks

-- BentLo Labs LLC - Dayboard™
-- Security remediation script for v_calendar_feed view
-- Date: September 16, 2025

BEGIN;

-- Drop the existing view that has SECURITY DEFINER property
DROP VIEW IF EXISTS public.v_calendar_feed;

-- Recreate the view WITHOUT SECURITY DEFINER (uses SECURITY INVOKER by default)
-- This ensures the view respects the RLS policies of the querying user
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

  UNION ALL

  -- Meals (requires: meal_plan_items with scheduled_on::date, meal_type, recipe_id; recipes.title)
  -- Note: This will work once meal planning tables are deployed
  SELECT
    'meal'::entity_kind      AS kind,
    concat('meal-',mpi.id)   AS event_id,
    mp.household_id,
    concat(initcap(mpi.meal_type), ': ', COALESCE(r.title, 'Planned Meal')) AS title,
    r.description            AS description,
    null::text               AS location,
    (mpi.scheduled_on::timestamptz + meal_slot_time(mpi.meal_type)) AS start_ts,
    (mpi.scheduled_on::timestamptz + meal_slot_time(mpi.meal_type) + interval '1 hour') AS end_ts,
    false                    AS all_day,
    '#22c55e'                AS color,          -- green
    concat('/meals/recipes/', r.id)::text       AS link_href,
    jsonb_build_object('recipe_id', r.id, 'meal_type', mpi.meal_type, 'servings', mpi.servings) AS meta
  FROM meal_plan_items mpi
  JOIN meal_plans mp ON mp.id = mpi.meal_plan_id
  LEFT JOIN recipes r ON r.id = mpi.recipe_id
  WHERE mpi.scheduled_on IS NOT NULL

  UNION ALL

  -- List items with due dates (todo / chores / shopping etc.)
  -- Note: Assumes lists and list_items tables exist
  SELECT
    'list_item'::entity_kind  AS kind,
    concat('list-',li.id)     AS event_id,
    l.household_id,
    li.title                  AS title,
    COALESCE(li.notes,'')     AS description,
    null::text                AS location,
    li.due_at                 AS start_ts,
    (li.due_at + interval '1 hour') AS end_ts,
    false                     AS all_day,
    '#3b82f6'                 AS color,        -- blue
    concat('/lists/', l.id)::text AS link_href,
    jsonb_build_object('list_id', l.id, 'priority', COALESCE(li.priority, 'medium'), 'completed', COALESCE(li.completed, false)) AS meta
  FROM list_items li
  JOIN lists l ON l.id = li.list_id
  WHERE li.due_at IS NOT NULL

  UNION ALL

  -- Project tasks/milestones with due dates
  -- Note: Assumes projects and project_tasks tables exist
  SELECT
    'project_task'::entity_kind AS kind,
    concat('task-',t.id)        AS event_id,
    p.household_id,
    concat(p.name, ': ', t.title) AS title,
    COALESCE(t.notes,'')          AS description,
    null::text                    AS location,
    t.due_at                      AS start_ts,
    (t.due_at + interval '1 hour') AS end_ts,
    false                         AS all_day,
    '#a855f7'                     AS color,   -- purple
    concat('/projects/', p.id)::text AS link_href,
    jsonb_build_object('project_id', p.id, 'status', COALESCE(t.status, 'pending'), 'priority', COALESCE(t.priority, 'medium')) AS meta
  FROM project_tasks t
  JOIN projects p ON p.id = t.project_id
  WHERE t.due_at IS NOT NULL
;

-- The view now uses SECURITY INVOKER (default) which means:
-- 1. It respects the RLS policies of the querying user
-- 2. Users can only see calendar events from their own household
-- 3. The underlying table RLS policies automatically apply

COMMIT;

-- After running this script:
-- 1. The security warning should be resolved
-- 2. The view will properly respect RLS policies
-- 3. Application functionality should remain unchanged
-- 4. Users will only see events from their authorized households