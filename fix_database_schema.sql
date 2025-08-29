-- Fix Database Schema Issues
-- Run this SQL in your Supabase SQL editor to fix the profile saving error

-- First, let's check if the profiles table exists and has the right structure
-- If it doesn't exist or has issues, this will create/fix it

-- Create profiles table with correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  profession TEXT,
  household_id UUID,
  avatar_url TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the household_id column allows NULL (for users without households)
ALTER TABLE profiles ALTER COLUMN household_id DROP NOT NULL;

-- Create households table if it doesn't exist
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  income DECIMAL,
  members_count INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for household_id in profiles (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_household' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT fk_profiles_household 
        FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create household_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Drop existing household policies
DROP POLICY IF EXISTS "Users can view their household" ON households;
DROP POLICY IF EXISTS "Users can update households they created" ON households;
DROP POLICY IF EXISTS "Users can insert households" ON households;

-- Create RLS policies for households
CREATE POLICY "Users can view their household" ON households
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM household_members 
      WHERE household_id = households.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update households they created" ON households
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can insert households" ON households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Drop existing household_members policies
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Users can insert household members" ON household_members;
DROP POLICY IF EXISTS "Users can update household members" ON household_members;
DROP POLICY IF EXISTS "Users can delete household members" ON household_members;

-- Create RLS policies for household_members
CREATE POLICY "Users can view household members" ON household_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM households 
      WHERE id = household_members.household_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert household members" ON household_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM households 
      WHERE id = household_members.household_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update household members" ON household_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM households 
      WHERE id = household_members.household_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete household members" ON household_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM households 
      WHERE id = household_members.household_id AND created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_household_id ON profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_households_created_by ON households(created_by);

-- Verify the setup with a simple query
-- This should return the structure of the profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
