-- 🔍 Diagnostic Script - Run this in Supabase SQL Editor
-- This will help us understand why the invitation code isn't showing

-- 1. Check table structure
SELECT 'Table Structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'household_invitations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check existing invitation data
SELECT 'Existing Invitations:' as info;
SELECT 
  id,
  household_id,
  invitation_code,
  status,
  expires_at,
  created_at,
  created_by
FROM household_invitations 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check your household
SELECT 'Your Household:' as info;
SELECT 
  h.id as household_id,
  h.name as household_name,
  h.created_by,
  p.user_id,
  p.name as user_name
FROM households h
LEFT JOIN profiles p ON p.household_id = h.id
WHERE h.created_by = auth.uid() OR p.user_id = auth.uid();

-- 4. Test invitation code generation
SELECT 'Testing Code Generation:' as info;
SELECT create_household_invitation(
  (SELECT household_id FROM profiles WHERE user_id = auth.uid()),
  null,
  'Test User',
  'member'
) as test_result;

-- 5. Check RLS policies
SELECT 'RLS Status:' as info;
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ Protected' ELSE '❌ Unrestricted' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'household_invitations';
