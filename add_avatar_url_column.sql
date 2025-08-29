-- Add avatar_url column to profiles table if it doesn't exist
-- Run this in your Supabase SQL editor

-- First check if the column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        -- Add the avatar_url column
        ALTER TABLE profiles 
        ADD COLUMN avatar_url TEXT;
        
        -- Add a comment to the column
        COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile photo stored in Supabase Storage or external service';
        
        RAISE NOTICE 'avatar_url column added successfully to profiles table';
    ELSE
        RAISE NOTICE 'avatar_url column already exists in profiles table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'avatar_url';
