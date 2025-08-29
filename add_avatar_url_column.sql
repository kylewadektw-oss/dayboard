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
    
    -- Also add updated_at column if it doesn't exist (needed for automatic timestamping)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        -- Add the updated_at column
        ALTER TABLE profiles 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        -- Add a comment to the column
        COMMENT ON COLUMN profiles.updated_at IS 'Timestamp of last profile update';
        
        -- Create trigger to automatically update the timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON profiles 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'updated_at column and trigger added successfully to profiles table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in profiles table';
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('avatar_url', 'updated_at')
ORDER BY column_name;
