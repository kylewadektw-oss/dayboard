-- 🚀 Migrate household_invitations table to complete schema
-- This will upgrade your existing table structure to support the full invitation system

-- First, let's see what we're working with
SELECT 'Current table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'household_invitations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to existing table
ALTER TABLE household_invitations 
ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS household_id uuid REFERENCES households(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invitation_code text UNIQUE,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invitee_email text,
ADD COLUMN IF NOT EXISTS invitee_name text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
ADD COLUMN IF NOT EXISTS used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS used_at timestamp with time zone;

-- Migrate existing data where possible
-- Convert household_code to invitation_code
UPDATE household_invitations 
SET invitation_code = household_code 
WHERE invitation_code IS NULL AND household_code IS NOT NULL;

-- Set default role for existing records
UPDATE household_invitations 
SET role = 'member' 
WHERE role IS NULL;

-- If you have a way to determine household_id from household_code, do it here
-- For now, we'll leave it NULL and you can update manually or via another query

-- Add constraints after data migration
ALTER TABLE household_invitations 
ALTER COLUMN status SET DEFAULT 'pending';

-- Add status check constraint (drop first if exists to avoid errors)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'household_invitations_status_check' 
        AND table_name = 'household_invitations'
    ) THEN
        ALTER TABLE household_invitations 
        ADD CONSTRAINT household_invitations_status_check 
        CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'));
    END IF;
END $$;

-- Make invitation_code unique and not null (after migration)
UPDATE household_invitations SET invitation_code = upper(substring(md5(random()::text) from 1 for 8)) 
WHERE invitation_code IS NULL;

ALTER TABLE household_invitations 
ALTER COLUMN invitation_code SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_household_invitations_code ON household_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_household_invitations_household_id ON household_invitations(household_id);
CREATE INDEX IF NOT EXISTS idx_household_invitations_created_by ON household_invitations(created_by);
CREATE INDEX IF NOT EXISTS idx_household_invitations_status ON household_invitations(status);

-- Drop old columns that are no longer needed (optional - uncomment if you want to clean up)
-- ALTER TABLE household_invitations DROP COLUMN IF EXISTS household_code;
-- ALTER TABLE household_invitations DROP COLUMN IF EXISTS invited_at;

-- Verify the new structure
SELECT 'New table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'household_invitations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Migration complete! 🎉' as result;
