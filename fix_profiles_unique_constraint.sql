-- Fix profiles table to add unique constraint on user_id
-- This is required for the upsert operation (ON CONFLICT) to work
-- Run this in your Supabase SQL editor

-- First, check if there are any duplicate user_id values
SELECT user_id, COUNT(*) as count 
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- If there are duplicates, you'll need to clean them up first
-- This query will show you which records are duplicates
-- DELETE FROM profiles WHERE id NOT IN (
--   SELECT MIN(id) FROM profiles GROUP BY user_id
-- );

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_unique' 
        AND table_name = 'profiles'
        AND constraint_type = 'UNIQUE'
    ) THEN
        -- Add the unique constraint
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        
        RAISE NOTICE 'Unique constraint on user_id added successfully to profiles table';
    ELSE
        RAISE NOTICE 'Unique constraint on user_id already exists in profiles table';
    END IF;
    
    -- Also ensure we have a primary key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'PRIMARY KEY' 
        AND table_name = 'profiles'
    ) THEN
        -- Add id column as primary key if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'id'
        ) THEN
            ALTER TABLE profiles 
            ADD COLUMN id BIGSERIAL PRIMARY KEY;
            
            RAISE NOTICE 'Primary key id column added to profiles table';
        ELSE
            -- id column exists but no primary key constraint
            ALTER TABLE profiles 
            ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
            
            RAISE NOTICE 'Primary key constraint added to existing id column';
        END IF;
    ELSE
        RAISE NOTICE 'Primary key already exists in profiles table';
    END IF;
END $$;

-- Verify the constraints were added
SELECT 
    constraint_name, 
    constraint_type, 
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
ORDER BY constraint_type, constraint_name;
