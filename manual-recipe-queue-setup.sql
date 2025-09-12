-- Simple Recipe Queue Setup for Manual Execution
-- Copy and paste this into Supabase SQL Editor

-- 1. Create enum for recipe status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_queue_status') THEN
    CREATE TYPE recipe_queue_status AS ENUM ('pending', 'approved', 'rejected', 'needs_review');
  END IF;
END $$;

-- 2. Create recipe import queue table
CREATE TABLE IF NOT EXISTS recipe_import_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  external_source text NOT NULL DEFAULT 'spoonacular',
  raw_data jsonb NOT NULL,
  processed_data jsonb,
  status recipe_queue_status DEFAULT 'pending',
  
  -- Basic info fields
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
  
  -- Approval workflow
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes text,
  approved_at timestamptz,
  rejected_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Prevent duplicates
  UNIQUE(external_source, external_id)
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_status ON recipe_import_queue(status);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_source ON recipe_import_queue(external_source);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_created_at ON recipe_import_queue(created_at);

-- 4. Enable RLS
ALTER TABLE recipe_import_queue ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies (check if they exist first)
DO $$
BEGIN
  -- Super admin policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'recipe_import_queue' 
    AND policyname = 'Super admins can manage all queue items'
  ) THEN
    CREATE POLICY "Super admins can manage all queue items" ON recipe_import_queue
      FOR ALL TO authenticated USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;

  -- Users view their own submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'recipe_import_queue' 
    AND policyname = 'Users can view their own submissions'
  ) THEN
    CREATE POLICY "Users can view their own submissions" ON recipe_import_queue
      FOR SELECT TO authenticated USING (submitted_by = auth.uid());
  END IF;

  -- Users can submit to queue
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'recipe_import_queue' 
    AND policyname = 'Users can submit to queue'
  ) THEN
    CREATE POLICY "Users can submit to queue" ON recipe_import_queue
      FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid());
  END IF;
END $$;

-- 6. Create updated_at trigger (check if it exists first)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_recipe_import_queue_updated_at'
  ) THEN
    CREATE TRIGGER update_recipe_import_queue_updated_at
      BEFORE UPDATE ON recipe_import_queue
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 7. Test the setup
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

-- Check if the test record was created
SELECT 
  id, 
  external_id, 
  title, 
  status, 
  created_at 
FROM recipe_import_queue 
WHERE external_id = 'test123';
