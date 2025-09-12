-- Magic 8-Ball Questions Table Migration
-- This migration creates the magic8_questions table with proper dependencies

-- First, let's make sure we have the basic tables that magic8_questions depends on
-- Create households table if it doesn't exist
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create profiles table if it doesn't exist (this should exist from auth, but ensure it's there)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  notification_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on basic tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for households
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'households' AND policyname = 'Users can view their household') THEN
    CREATE POLICY "Users can view their household" 
    ON households FOR SELECT 
    USING (
      id IN (
        SELECT household_id 
        FROM profiles 
        WHERE profiles.id = auth.uid()
      )
    );
  END IF;
END $$;

-- Basic RLS policies for profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view household profiles') THEN
    CREATE POLICY "Users can view household profiles" 
    ON profiles FOR SELECT 
    USING (
      household_id IN (
        SELECT household_id 
        FROM profiles 
        WHERE profiles.id = auth.uid()
      )
    );
  END IF;
END $$;

-- Now create the Magic 8-Ball Questions Table
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
CREATE INDEX IF NOT EXISTS idx_magic8_household_id ON magic8_questions(household_id);
CREATE INDEX IF NOT EXISTS idx_magic8_asked_by ON magic8_questions(asked_by);
CREATE INDEX IF NOT EXISTS idx_magic8_created_at ON magic8_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_magic8_theme ON magic8_questions(theme);

-- Row Level Security (RLS) Policies
ALTER TABLE magic8_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see questions from their household
CREATE POLICY "Users can view household Magic 8-Ball questions" 
ON magic8_questions FOR SELECT 
USING (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Policy: Users can insert questions for their household
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

-- Policy: Users can update their own questions (for favorites, etc.)
CREATE POLICY "Users can update their own Magic 8-Ball questions" 
ON magic8_questions FOR UPDATE 
USING (asked_by = auth.uid())
WITH CHECK (asked_by = auth.uid());

-- Policy: Users can delete their own questions
CREATE POLICY "Users can delete their own Magic 8-Ball questions" 
ON magic8_questions FOR DELETE 
USING (asked_by = auth.uid());

-- Add comments to table and columns
COMMENT ON TABLE magic8_questions IS 'Stores Magic 8-Ball questions and answers for family tracking and history';
COMMENT ON COLUMN magic8_questions.household_id IS 'Reference to the household that asked the question';
COMMENT ON COLUMN magic8_questions.asked_by IS 'Reference to the user who asked the question';
COMMENT ON COLUMN magic8_questions.question IS 'The question that was asked to the Magic 8-Ball';
COMMENT ON COLUMN magic8_questions.answer IS 'The answer that was provided by the Magic 8-Ball';
COMMENT ON COLUMN magic8_questions.theme IS 'The theme mode used when the question was asked';
COMMENT ON COLUMN magic8_questions.created_at IS 'Timestamp when the question was asked';