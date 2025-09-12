-- SQL to create magic8_questions table
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/csbwewirwzeitavhvykr/sql/new

-- Create Magic 8-Ball Questions Table
CREATE TABLE IF NOT EXISTS magic8_questions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  asked_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  theme text DEFAULT 'classic' CHECK (theme IN ('classic', 'mystic', 'retro', 'neon', 'galaxy', 'minimalist')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_magic8_household_id ON magic8_questions(household_id);
CREATE INDEX IF NOT EXISTS idx_magic8_asked_by ON magic8_questions(asked_by);
CREATE INDEX IF NOT EXISTS idx_magic8_created_at ON magic8_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_magic8_theme ON magic8_questions(theme);

-- Enable Row Level Security
ALTER TABLE magic8_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for magic8_questions
CREATE POLICY "Users can view household Magic 8-Ball questions" 
ON magic8_questions FOR SELECT 
USING (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create Magic 8-Ball questions" 
ON magic8_questions FOR INSERT 
WITH CHECK (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
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