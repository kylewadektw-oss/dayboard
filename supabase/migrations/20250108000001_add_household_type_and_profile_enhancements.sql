-- Add household_type and enhanced profile fields
-- Migration: 20250108000001_add_household_type_and_profile_enhancements.sql

-- Create household_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'household_type') THEN
    CREATE TYPE household_type AS ENUM (
      'solo_user',
      'roommate_household', 
      'couple_no_kids',
      'family_household',
      'single_parent_household',
      'multi_generational_household'
    );
  END IF;
END $$;

-- Create family_role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'family_role') THEN
    CREATE TYPE family_role AS ENUM (
      'parent_guardian',
      'mom',
      'dad', 
      'child',
      'spouse_partner',
      'roommate',
      'guest',
      'caregiver',
      'pet'
    );
  END IF;
END $$;

-- Add household_type to households table
ALTER TABLE households 
ADD COLUMN IF NOT EXISTS household_type household_type DEFAULT 'family_household';

-- Add missing fields to households table
ALTER TABLE households 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip text,
ADD COLUMN IF NOT EXISTS household_code text UNIQUE,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS members_count integer DEFAULT 1;

-- Update profiles table family_role to use the enum
DO $$
BEGIN
  -- First, check if the column exists and is text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'family_role' 
    AND data_type = 'text'
  ) THEN
    -- Convert existing family_role from text to enum
    ALTER TABLE profiles 
    ALTER COLUMN family_role TYPE family_role 
    USING CASE 
      WHEN family_role = 'parent_guardian' THEN 'parent_guardian'::family_role
      WHEN family_role = 'mom' THEN 'mom'::family_role
      WHEN family_role = 'dad' THEN 'dad'::family_role
      WHEN family_role = 'child' THEN 'child'::family_role
      WHEN family_role = 'spouse_partner' THEN 'spouse_partner'::family_role
      WHEN family_role = 'roommate' THEN 'roommate'::family_role
      WHEN family_role = 'guest' THEN 'guest'::family_role
      WHEN family_role = 'caregiver' THEN 'caregiver'::family_role
      WHEN family_role = 'pet' THEN 'pet'::family_role
      ELSE NULL
    END;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'family_role'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE profiles 
    ADD COLUMN family_role family_role;
  END IF;
END $$;

-- Add enhanced profile fields for dietary preferences
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dietary_preferences text[] DEFAULT '{}';

-- Update allergies to be text array if it's not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'allergies' 
    AND data_type != 'ARRAY'
  ) THEN
    -- Convert existing allergies to array if needed
    ALTER TABLE profiles 
    ALTER COLUMN allergies TYPE text[] 
    USING CASE 
      WHEN allergies IS NULL THEN '{}'::text[]
      ELSE string_to_array(allergies, ',')
    END;
  END IF;
END $$;

-- Update notification_preferences to include enhanced structure
DO $$
BEGIN
  -- Set default notification preferences for existing users if empty
  UPDATE profiles 
  SET notification_preferences = '{
    "email": false,
    "push": true,
    "sms": false,
    "daycare_pickup_backup": false
  }'::jsonb
  WHERE notification_preferences = '{}'::jsonb OR notification_preferences IS NULL;
END $$;

-- Create index for household_type
CREATE INDEX IF NOT EXISTS idx_households_household_type ON households(household_type);
CREATE INDEX IF NOT EXISTS idx_households_household_code ON households(household_code);
CREATE INDEX IF NOT EXISTS idx_profiles_family_role ON profiles(family_role);
CREATE INDEX IF NOT EXISTS idx_profiles_dietary_preferences ON profiles USING GIN(dietary_preferences);

-- Update existing households to have a default household_type
UPDATE households 
SET household_type = 'family_household'
WHERE household_type IS NULL;

-- Make household_type NOT NULL after setting defaults
ALTER TABLE households 
ALTER COLUMN household_type SET NOT NULL;

-- Add constraints
ALTER TABLE households 
ADD CONSTRAINT households_household_code_format 
CHECK (household_code ~ '^[A-Z0-9]{6}$');

-- Comments for documentation
COMMENT ON COLUMN households.household_type IS 'Type of household structure for better organization and feature customization';
COMMENT ON COLUMN households.household_code IS 'Unique 6-character code for joining households';
COMMENT ON COLUMN profiles.family_role IS 'Specific role within the family structure';
COMMENT ON COLUMN profiles.dietary_preferences IS 'Array of dietary preferences like vegetarian, vegan, etc.';
COMMENT ON COLUMN profiles.allergies IS 'Array of food allergies and restrictions';
