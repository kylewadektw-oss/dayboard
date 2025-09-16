-- Comprehensive Database Setup for Dayboard
-- This migration creates all necessary tables for the application to work

BEGIN;

-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Household',
  household_type text DEFAULT 'family_household',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE SET NULL,
  full_name text,
  display_name text,
  avatar_url text,
  notification_preferences jsonb DEFAULT '{
    "email": false,
    "push": true,
    "sms": false
  }'::jsonb,
  user_role text DEFAULT 'member',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create Magic 8-Ball Questions Table
CREATE TABLE IF NOT EXISTS magic8_questions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  asked_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  theme text DEFAULT 'classic' CHECK (theme IN ('classic', 'holiday', 'school', 'pet', 'party', 'kids')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_household_id ON profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_magic8_household_id ON magic8_questions(household_id);
CREATE INDEX IF NOT EXISTS idx_magic8_asked_by ON magic8_questions(asked_by);
CREATE INDEX IF NOT EXISTS idx_magic8_created_at ON magic8_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_magic8_theme ON magic8_questions(theme);

-- Enable Row Level Security
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic8_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for households
CREATE POLICY "Users can view their household" 
ON households FOR SELECT 
USING (
  id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);

CREATE POLICY "Users can update their household" 
ON households FOR UPDATE 
USING (
  id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- RLS Policies for profiles
CREATE POLICY "Users can view household profiles" 
ON profiles FOR SELECT 
USING (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
  OR id = auth.uid()
);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (id = auth.uid());

-- RLS Policies for Magic 8-Ball
CREATE POLICY "Users can view household Magic 8-Ball questions" 
ON magic8_questions FOR SELECT 
USING (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);

CREATE POLICY "Users can create Magic 8-Ball questions" 
ON magic8_questions FOR INSERT 
WITH CHECK (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
  AND asked_by = auth.uid()
);

CREATE POLICY "Users can update their own Magic 8-Ball questions" 
ON magic8_questions FOR UPDATE 
USING (asked_by = auth.uid())
WITH CHECK (asked_by = auth.uid());

CREATE POLICY "Users can delete their own Magic 8-Ball questions" 
ON magic8_questions FOR DELETE 
USING (asked_by = auth.uid());

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  default_household_id uuid;
BEGIN
  -- Create a default household for the user if they don't have one
  INSERT INTO public.households (name) 
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'My') || '''s Household')
  RETURNING id INTO default_household_id;
  
  -- Create profile
  INSERT INTO public.profiles (
    id, 
    household_id,
    full_name, 
    display_name,
    avatar_url
  )
  VALUES (
    NEW.id, 
    default_household_id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add helpful comments
COMMENT ON TABLE magic8_questions IS 'Stores Magic 8-Ball questions and answers for family tracking and history';
COMMENT ON COLUMN magic8_questions.household_id IS 'Reference to the household that asked the question';
COMMENT ON COLUMN magic8_questions.asked_by IS 'Reference to the user who asked the question';
COMMENT ON COLUMN magic8_questions.question IS 'The question that was asked to the Magic 8-Ball';
COMMENT ON COLUMN magic8_questions.answer IS 'The answer that was provided by the Magic 8-Ball';
COMMENT ON COLUMN magic8_questions.theme IS 'The theme mode used when the question was asked';
COMMENT ON COLUMN magic8_questions.created_at IS 'Timestamp when the question was asked';

COMMIT;