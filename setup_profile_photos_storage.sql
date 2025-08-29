-- Create storage bucket for profile photos
-- Run this in your Supabase SQL editor

-- Insert bucket for profile photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES (
    'profile-photos', 
    'profile-photos', 
    true, 
    NOW(), 
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Profile photos are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;

-- Allow users to upload their own profile photos
-- The path structure will be: avatars/{user_id}-{timestamp}.{ext}
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Allow anyone to view profile photos (public bucket)
CREATE POLICY "Profile photos are publicly viewable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-photos');

-- Allow users to update their own profile photos
CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'profile-photos' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Allow users to delete their own profile photos
CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'profile-photos' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE id = 'profile-photos';

-- Test the policies by checking if they exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%profile photos%';
