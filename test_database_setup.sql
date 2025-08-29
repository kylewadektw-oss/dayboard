-- Simple Database Test and Fix Script
-- Run this first to check if your database is properly set up

-- Test if auth.users() function works
SELECT auth.uid() as current_user_id;

-- Check if profiles table exists
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if households table exists
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'households'
ORDER BY ordinal_position;

-- If no results above, create the basic tables:

-- Profiles table (minimal version for testing)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER,
  profession TEXT,
  household_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Households table (minimal version for testing)
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  members_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY IF NOT EXISTS "profiles_policy" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "households_policy" ON households
  FOR ALL USING (auth.uid() = created_by);

-- Test query (this should work if everything is set up correctly)
SELECT 'Database setup completed successfully' as status;
