-- Simplified storage setup for profile photos
-- Run this in your Supabase SQL editor

-- Create bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop all existing policies for this bucket to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete profile photos" ON storage.objects;

-- Create simple policies
-- 1. Allow authenticated users to upload to profile-photos bucket
CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

-- 2. Allow everyone to view profile photos
CREATE POLICY "Anyone can view profile photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-photos');

-- 3. Allow authenticated users to update files in profile-photos bucket
CREATE POLICY "Authenticated users can update profile photos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos');

-- 4. Allow authenticated users to delete files in profile-photos bucket
CREATE POLICY "Authenticated users can delete profile photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos');

-- Verify setup
SELECT 
    'Bucket created' as status,
    id, 
    name, 
    public 
FROM storage.buckets 
WHERE id = 'profile-photos'

UNION ALL

SELECT 
    'Policies created' as status,
    policyname as id,
    cmd as name,
    'true' as public
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%profile photos%';
