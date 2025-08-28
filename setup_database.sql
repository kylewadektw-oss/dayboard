-- Supabase Database Setup for Dayboard
-- Run these SQL commands in your Supabase SQL editor

-- Enable RLS (Row Level Security)
-- This is usually enabled by default, but let's make sure

-- Drop existing tables if they have issues (optional - only if you need to start fresh)
-- DROP TABLE IF EXISTS household_members CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS households CASCADE;

-- Create profiles table
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

-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  income DECIMAL, -- Fixed: renamed from monthly_income to income
  members_count INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create household_members table (for multi-user households)
CREATE TABLE IF NOT EXISTS household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- Create credentials table (for password management)
CREATE TABLE IF NOT EXISTS credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  website TEXT,
  username TEXT,
  password TEXT,
  notes TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN ('personal', 'household', 'work', 'financial', 'social', 'other')),
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing created_by column if it doesn't exist
ALTER TABLE households ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add foreign key constraint for household_id in profiles
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_household 
FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_households_updated_at ON households;
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credentials_updated_at ON credentials;
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their household" ON households;
DROP POLICY IF EXISTS "Users can update households they created" ON households;
DROP POLICY IF EXISTS "Users can insert households" ON households;
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Users can insert household members" ON household_members;
DROP POLICY IF EXISTS "Users can update household members" ON household_members;
DROP POLICY IF EXISTS "Users can delete household members" ON household_members;
DROP POLICY IF EXISTS "Users can view own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can insert own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can update own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can delete own credentials" ON credentials;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for households
CREATE POLICY "Users can view their household" ON households
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() IN (
      SELECT user_id FROM household_members WHERE household_id = households.id
    )
  );

CREATE POLICY "Users can update households they created" ON households
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can insert households" ON households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create RLS policies for household_members (split by operation for clarity)
CREATE POLICY "Users can view household members" ON household_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT created_by FROM households WHERE id = household_members.household_id
    )
  );

CREATE POLICY "Users can insert household members" ON household_members
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM households WHERE id = household_members.household_id
    )
  );

CREATE POLICY "Users can update household members" ON household_members
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT created_by FROM households WHERE id = household_members.household_id
    )
  );

CREATE POLICY "Users can delete household members" ON household_members
  FOR DELETE USING (
    auth.uid() IN (
      SELECT created_by FROM households WHERE id = household_members.household_id
    )
  );

-- Create RLS policies for credentials
CREATE POLICY "Users can view own credentials" ON credentials
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_shared AND auth.uid() IN (
      SELECT user_id FROM household_members WHERE household_id = credentials.household_id
    ))
  );

CREATE POLICY "Users can insert own credentials" ON credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials" ON credentials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials" ON credentials
  FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample data (optional - remove if you don't want sample data)
-- This will only work after you have authenticated users

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_household_id ON profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_households_created_by ON households(created_by);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_household_id ON credentials(household_id);
CREATE INDEX IF NOT EXISTS idx_credentials_category ON credentials(category);
CREATE INDEX IF NOT EXISTS idx_credentials_is_shared ON credentials(is_shared);

-- Additional performance indexes for foreign key columns
CREATE INDEX IF NOT EXISTS idx_profiles_household_fk ON profiles(household_id) WHERE household_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_households_created_by_fk ON households(created_by);
CREATE INDEX IF NOT EXISTS idx_credentials_household_fk ON credentials(household_id) WHERE household_id IS NOT NULL;
