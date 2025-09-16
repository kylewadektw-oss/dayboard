-- Schema Discovery Script
-- BentLo Labs LLC - Dayboard™
-- Run this to discover the actual table structure

-- Check if tables exist and get their column information
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('lists', 'list_items', 'calendar_events')
ORDER BY table_name, ordinal_position;

-- Check existing RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('lists', 'list_items', 'calendar_events');

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('lists', 'list_items', 'calendar_events');

-- Check if view exists and its definition
SELECT 
  table_name,
  view_definition
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name = 'v_calendar_feed';