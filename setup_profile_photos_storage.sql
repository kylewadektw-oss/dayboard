-- 🔧 Setup Profile Photos Storage Bucket
-- Run this in your Supabase SQL editor to set up storage for profile photos

-- Create the profile-photos bucket (if it doesn't exist)
-- This would normally be done through the Supabase dashboard
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Create storage policies for profile photos
DROP POLICY IF EXISTS "Users can upload own profile photos" ON storage.objects;
CREATE POLICY "Users can upload own profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view profile photos" ON storage.objects;
CREATE POLICY "Users can view profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Users can update own profile photos" ON storage.objects;
CREATE POLICY "Users can update own profile photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own profile photos" ON storage.objects;
CREATE POLICY "Users can delete own profile photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for household members to view dependent photos
DROP POLICY IF EXISTS "Household members can view dependent photos" ON storage.objects;
CREATE POLICY "Household members can view dependent photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-photos' AND 
    name LIKE '%dependent-photos%' AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
        AND p.household_id::text = (storage.foldername(name))[2]
    )
  );

-- Instructions for manual setup
SELECT 'Storage bucket setup complete!' as status;
SELECT 'IMPORTANT: You need to manually create the "profile-photos" bucket in your Supabase dashboard:' as instruction;
SELECT '1. Go to Storage in your Supabase dashboard' as step_1;
SELECT '2. Click "New Bucket"' as step_2;
SELECT '3. Name it "profile-photos"' as step_3;
SELECT '4. Make it public' as step_4;
SELECT '5. Click "Create Bucket"' as step_5;
SELECT 'Then run this SQL script to set up the policies.' as final_step;
