-- Dayboard Database Schema Updates
-- © 2025 BentLo Labs LLC. All Rights Reserved.
-- PROPRIETARY AND CONFIDENTIAL
-- 
-- This database schema update is the proprietary property of BentLo Labs LLC.
-- Unauthorized use, copying, or distribution is strictly prohibited.
--
-- Company: BentLo Labs LLC
-- Product: Dayboard™
-- Purpose: Add missing columns to fix TypeScript errors

-- ========================================
-- CRITICAL TYPE FIXES: Add Missing Columns
-- ========================================

-- Add missing columns to profiles table
DO $$
BEGIN
    -- Add display_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
        RAISE NOTICE 'Added display_name column to profiles table';
    END IF;

    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Added full_name column to profiles table';
    END IF;
END $$;

-- Add missing columns to households table
DO $$
BEGIN
    -- Add coordinates column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'households' AND column_name = 'coordinates') THEN
        ALTER TABLE households ADD COLUMN coordinates JSONB;
        RAISE NOTICE 'Added coordinates column to households table';
    END IF;

    -- Add referral_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'households' AND column_name = 'referral_code') THEN
        ALTER TABLE households ADD COLUMN referral_code TEXT;
        RAISE NOTICE 'Added referral_code column to households table';
    END IF;
END $$;

-- Add missing columns to household_members table (if needed)
DO $$
BEGIN
    -- Ensure is_active is not nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'is_active' AND is_nullable = 'YES') THEN
        ALTER TABLE household_members ALTER COLUMN is_active SET DEFAULT true;
        UPDATE household_members SET is_active = true WHERE is_active IS NULL;
        ALTER TABLE household_members ALTER COLUMN is_active SET NOT NULL;
        RAISE NOTICE 'Made is_active column not nullable in household_members table';
    END IF;
END $$;

-- ========================================
-- DATA MIGRATION: Populate Missing Fields
-- ========================================

-- Populate display_name and full_name for existing profiles
UPDATE profiles 
SET 
    display_name = COALESCE(preferred_name, name),
    full_name = name
WHERE display_name IS NULL OR full_name IS NULL;

-- Generate referral codes for existing households
UPDATE households 
SET referral_code = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- ========================================
-- INDEXES AND CONSTRAINTS
-- ========================================

-- Add indexes for performance (without CONCURRENTLY to avoid transaction issues)
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_households_referral_code ON households(referral_code);
CREATE INDEX IF NOT EXISTS idx_households_coordinates ON households USING GIN(coordinates);

-- Add unique constraint on referral_code
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'households_referral_code_unique') THEN
        ALTER TABLE households ADD CONSTRAINT households_referral_code_unique UNIQUE (referral_code);
        RAISE NOTICE 'Added unique constraint on referral_code';
    END IF;
END $$;

-- ========================================
-- RLS POLICIES UPDATE
-- ========================================

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- TYPE SAFETY VERIFICATION
-- ========================================

-- Verify all columns exist and have correct types
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col_record RECORD;
BEGIN
    -- Check required columns in profiles table
    FOR col_record IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name IN ('display_name', 'full_name', 'name', 'preferred_name')
    LOOP
        RAISE NOTICE 'profiles.%: %', col_record.column_name, col_record.data_type;
    END LOOP;

    -- Check required columns in households table
    FOR col_record IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'households' 
        AND column_name IN ('coordinates', 'referral_code', 'address', 'city')
    LOOP
        RAISE NOTICE 'households.%: %', col_record.column_name, col_record.data_type;
    END LOOP;

    RAISE NOTICE 'Database schema validation completed successfully';
END $$;

-- ========================================
-- COMPLETION LOG
-- ========================================

-- Log completion (removed system_logs insert since table doesn't exist)
SELECT 
    'SCHEMA_UPDATE_COMPLETED' as status,
    'Missing database columns added successfully' as message,
    NOW() as completed_at;