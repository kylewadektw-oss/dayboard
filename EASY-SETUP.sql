-- Dayboard Database Schema
-- © 2025 BentLo Labs LLC. All Rights Reserved.
-- PROPRIETARY AND CONFIDENTIAL
-- 
-- This database schema is the proprietary property of BentLo Labs LLC.
-- Unauthorized use, copying, or distribution is strictly prohibited.
--
-- Company: BentLo Labs LLC
-- Product: Dayboard™
-- Version: 1.0

-- EASY SETUP: Copy and paste this ENTIRE script into Supabase SQL Editor
-- This will set up everything you need in one go

-- Step 1: Make you a super admin (using your specific user ID)
UPDATE profiles SET role = 'super_admin' WHERE id = '0139a6fc-bf13-426d-8929-604051c4d1f4';

-- Step 2: Create the recipe queue (safe to run multiple times)
DO $$
BEGIN
  -- Create enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_queue_status') THEN
    CREATE TYPE recipe_queue_status AS ENUM ('pending', 'approved', 'rejected', 'needs_review');
  END IF;
END $$;

-- Create table
CREATE TABLE IF NOT EXISTS recipe_import_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  external_source text NOT NULL DEFAULT 'spoonacular',
  raw_data jsonb NOT NULL,
  processed_data jsonb,
  status recipe_queue_status DEFAULT 'pending',
  
  title text,
  description text,
  image_url text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  total_time_minutes integer,
  servings integer,
  difficulty text,
  cuisine text,
  meal_types text[],
  diet_types text[],
  tags text[],
  
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes text,
  approved_at timestamptz,
  rejected_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(external_source, external_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_status ON recipe_import_queue(status);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_source ON recipe_import_queue(external_source);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_created_at ON recipe_import_queue(created_at);

-- Enable security
ALTER TABLE recipe_import_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (clean slate)
DROP POLICY IF EXISTS "Super admins can manage all queue items" ON recipe_import_queue;
DROP POLICY IF EXISTS "Users can view their own submissions" ON recipe_import_queue;
DROP POLICY IF EXISTS "Users can submit to queue" ON recipe_import_queue;

-- Create fresh policies
CREATE POLICY "Super admins can manage all queue items" ON recipe_import_queue
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view their own submissions" ON recipe_import_queue
  FOR SELECT TO authenticated USING (submitted_by = auth.uid());

CREATE POLICY "Users can submit to queue" ON recipe_import_queue
  FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid());

-- Create trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_recipe_import_queue_updated_at ON recipe_import_queue;
CREATE TRIGGER update_recipe_import_queue_updated_at
  BEFORE UPDATE ON recipe_import_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Test it works
INSERT INTO recipe_import_queue (
  external_id, 
  external_source, 
  raw_data, 
  title, 
  description, 
  submitted_by
) VALUES (
  'test123',
  'spoonacular',
  '{"test": true}',
  'Test Recipe',
  'This is a test recipe for validation',
  auth.uid()
) ON CONFLICT (external_source, external_id) DO NOTHING;

-- Show your role and test record
SELECT 'Your role:' as info, role::text as value FROM profiles WHERE id = auth.uid()
UNION ALL
SELECT 'Test record created:' as info, CASE WHEN id IS NOT NULL THEN 'YES' ELSE 'NO' END as value
FROM recipe_import_queue WHERE external_id = 'test123' LIMIT 1;
