-- Add Credentials Table to Existing Database
-- Run this SQL in your Supabase SQL editor

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

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_credentials_updated_at ON credentials;
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can insert own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can update own credentials" ON credentials;
DROP POLICY IF EXISTS "Users can delete own credentials" ON credentials;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_household_id ON credentials(household_id);
CREATE INDEX IF NOT EXISTS idx_credentials_category ON credentials(category);
CREATE INDEX IF NOT EXISTS idx_credentials_is_shared ON credentials(is_shared);
CREATE INDEX IF NOT EXISTS idx_credentials_household_fk ON credentials(household_id) WHERE household_id IS NOT NULL;
