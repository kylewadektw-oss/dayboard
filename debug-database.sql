-- Quick test to see if everything is working
-- Run this in Supabase SQL Editor after running ADMIN-SETUP.sql

-- 1. Check if table exists
SELECT 'Table exists' as status, count(*) as record_count 
FROM recipe_import_queue;

-- 2. Check your user profile  
SELECT 'Your profile' as info, id, role 
FROM profiles 
WHERE id = '0139a6fc-bf13-426d-8929-604051c4d1f4';

-- 3. Test if you can insert a record
INSERT INTO recipe_import_queue (
  external_id, 
  external_source, 
  raw_data, 
  title, 
  description, 
  submitted_by
) VALUES (
  'debug-test',
  'spoonacular',
  '{"debug": true}',
  'Debug Test Recipe',
  'Testing access',
  '0139a6fc-bf13-426d-8929-604051c4d1f4'
) ON CONFLICT (external_source, external_id) DO NOTHING;

-- 4. Check if insert worked
SELECT 'Insert test' as info, id, title, status
FROM recipe_import_queue 
WHERE external_id = 'debug-test';
