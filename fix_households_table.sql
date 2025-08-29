-- Add missing columns to households table
-- Run this in your Supabase SQL editor

-- Add missing columns if they don't exist
ALTER TABLE households ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE households ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE households ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE households ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE households ADD COLUMN IF NOT EXISTS income DECIMAL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'households' 
AND table_schema = 'public'
ORDER BY ordinal_position;
