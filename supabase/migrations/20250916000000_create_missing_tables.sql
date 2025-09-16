-- Migration: Create missing tables for calendar feed
-- BentLo Labs LLC - Dayboard™
-- Date: September 16, 2025
-- Purpose: Create meal planning and project tables required by v_calendar_feed view

BEGIN;

-- First, ensure the lists system tables exist with the correct schema
-- The calendar feed view expects specific column names

-- Create lists table if it doesn't exist (matches expected schema)
CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text,
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create list_items table if it doesn't exist (matches expected schema)
CREATE TABLE IF NOT EXISTS list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  due_at timestamptz,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  completed boolean DEFAULT false,
  assigned_to uuid REFERENCES profiles(user_id),
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal planning tables
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  ingredients jsonb DEFAULT '[]'::jsonb,
  instructions jsonb DEFAULT '[]'::jsonb,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer DEFAULT 4,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine_type text,
  dietary_tags text[] DEFAULT '{}',
  image_url text,
  source_url text,
  rating decimal(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  scheduled_on date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert')),
  servings integer DEFAULT 4,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project management tables
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date date,
  target_completion_date date,
  actual_completion_date date,
  budget_allocated decimal(10,2),
  budget_spent decimal(10,2) DEFAULT 0.00,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_by uuid REFERENCES profiles(user_id),
  assigned_to uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_at timestamptz,
  completed_at timestamptz,
  estimated_hours decimal(5,2),
  actual_hours decimal(5,2),
  assigned_to uuid REFERENCES profiles(user_id),
  created_by uuid REFERENCES profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lists_household_id ON lists(household_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_due_at ON list_items(due_at);
CREATE INDEX IF NOT EXISTS idx_recipes_household_id ON recipes(household_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_household_id ON meal_plans(household_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_scheduled_on ON meal_plan_items(scheduled_on);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_projects_household_id ON projects(household_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_at ON project_tasks(due_at);

-- Enable RLS on all tables
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for household-based access

-- Lists policies
CREATE POLICY "members read lists" ON lists FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = lists.household_id
  ));

CREATE POLICY "members write lists" ON lists FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = lists.household_id
  ));

CREATE POLICY "members update lists" ON lists FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = lists.household_id
  ));

CREATE POLICY "members delete lists" ON lists FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = lists.household_id
  ));

-- List items policies (inherit from lists)
CREATE POLICY "members read list_items" ON list_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM lists l
    JOIN profiles pr ON pr.household_id = l.household_id
    WHERE l.id = list_items.list_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members write list_items" ON list_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM lists l
    JOIN profiles pr ON pr.household_id = l.household_id
    WHERE l.id = list_items.list_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members update list_items" ON list_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM lists l
    JOIN profiles pr ON pr.household_id = l.household_id
    WHERE l.id = list_items.list_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members delete list_items" ON list_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM lists l
    JOIN profiles pr ON pr.household_id = l.household_id
    WHERE l.id = list_items.list_id AND pr.user_id = auth.uid()
  ));

-- Recipes policies
CREATE POLICY "members read recipes" ON recipes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = recipes.household_id
  ));

CREATE POLICY "members write recipes" ON recipes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = recipes.household_id
  ));

CREATE POLICY "members update recipes" ON recipes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = recipes.household_id
  ));

CREATE POLICY "members delete recipes" ON recipes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = recipes.household_id
  ));

-- Meal plans policies
CREATE POLICY "members read meal_plans" ON meal_plans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = meal_plans.household_id
  ));

CREATE POLICY "members write meal_plans" ON meal_plans FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = meal_plans.household_id
  ));

CREATE POLICY "members update meal_plans" ON meal_plans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = meal_plans.household_id
  ));

CREATE POLICY "members delete meal_plans" ON meal_plans FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = meal_plans.household_id
  ));

-- Meal plan items policies (inherit from meal_plans)
CREATE POLICY "members read meal_plan_items" ON meal_plan_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM meal_plans mp
    JOIN profiles pr ON pr.household_id = mp.household_id
    WHERE mp.id = meal_plan_items.meal_plan_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members write meal_plan_items" ON meal_plan_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM meal_plans mp
    JOIN profiles pr ON pr.household_id = mp.household_id
    WHERE mp.id = meal_plan_items.meal_plan_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members update meal_plan_items" ON meal_plan_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM meal_plans mp
    JOIN profiles pr ON pr.household_id = mp.household_id
    WHERE mp.id = meal_plan_items.meal_plan_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members delete meal_plan_items" ON meal_plan_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM meal_plans mp
    JOIN profiles pr ON pr.household_id = mp.household_id
    WHERE mp.id = meal_plan_items.meal_plan_id AND pr.user_id = auth.uid()
  ));

-- Projects policies
CREATE POLICY "members read projects" ON projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = projects.household_id
  ));

CREATE POLICY "members write projects" ON projects FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = projects.household_id
  ));

CREATE POLICY "members update projects" ON projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = projects.household_id
  ));

CREATE POLICY "members delete projects" ON projects FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles pr 
    WHERE pr.user_id = auth.uid() AND pr.household_id = projects.household_id
  ));

-- Project tasks policies (inherit from projects)
CREATE POLICY "members read project_tasks" ON project_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects p
    JOIN profiles pr ON pr.household_id = p.household_id
    WHERE p.id = project_tasks.project_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members write project_tasks" ON project_tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects p
    JOIN profiles pr ON pr.household_id = p.household_id
    WHERE p.id = project_tasks.project_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members update project_tasks" ON project_tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects p
    JOIN profiles pr ON pr.household_id = p.household_id
    WHERE p.id = project_tasks.project_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "members delete project_tasks" ON project_tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects p
    JOIN profiles pr ON pr.household_id = p.household_id
    WHERE p.id = project_tasks.project_id AND pr.user_id = auth.uid()
  ));

COMMIT;