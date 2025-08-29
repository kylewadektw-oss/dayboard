-- Add missing dietary_preferences column to profiles table
-- Run this in your Supabase SQL editor

-- First check if the column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'dietary_preferences'
    ) THEN
        -- Add the dietary_preferences column
        ALTER TABLE profiles 
        ADD COLUMN dietary_preferences TEXT[] DEFAULT '{}';
        
        -- Add a comment to the column
        COMMENT ON COLUMN profiles.dietary_preferences IS 'Array of dietary preferences for meal planning';
        
        -- Create an index for better performance when filtering by dietary preferences
        CREATE INDEX IF NOT EXISTS idx_profiles_dietary_preferences 
        ON profiles USING GIN (dietary_preferences);
        
        RAISE NOTICE 'dietary_preferences column added successfully to profiles table';
    ELSE
        RAISE NOTICE 'dietary_preferences column already exists in profiles table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'dietary_preferences';
