-- 🔧 Enhanced Profile System
-- Adds photo uploads, date of birth with auto-calculated age, and household members (children/pets)

-- 1. Update profiles table with new fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS google_avatar_url TEXT;

-- 2. Create household_members table for children/pets (separate from user accounts)
CREATE TABLE IF NOT EXISTS household_dependents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('child', 'pet', 'other')),
  date_of_birth DATE,
  age INTEGER,
  breed TEXT, -- For pets
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  photo_url TEXT,
  notes TEXT,
  dietary_restrictions TEXT[],
  medical_notes TEXT,
  school_grade TEXT, -- For children
  favorite_activities TEXT[],
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create profile photos storage bucket setup
-- This would typically be done through Supabase dashboard, but here's the SQL equivalent:
-- CREATE POLICY "Users can upload own profile photos" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view profile photos" ON storage.objects
-- FOR SELECT USING (bucket_id = 'profile-photos');

-- CREATE POLICY "Users can update own profile photos" ON storage.objects
-- FOR UPDATE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own profile photos" ON storage.objects
-- FOR DELETE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Create function to automatically calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age_from_dob(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  IF birth_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to auto-update age when date_of_birth changes
CREATE OR REPLACE FUNCTION update_age_from_dob()
RETURNS TRIGGER AS $$
BEGIN
  -- Update age for profiles
  IF TG_TABLE_NAME = 'profiles' THEN
    NEW.age = calculate_age_from_dob(NEW.date_of_birth);
    NEW.updated_at = NOW();
    RETURN NEW;
  END IF;
  
  -- Update age for household_dependents
  IF TG_TABLE_NAME = 'household_dependents' THEN
    NEW.age = calculate_age_from_dob(NEW.date_of_birth);
    NEW.updated_at = NOW();
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers for auto-age calculation
DROP TRIGGER IF EXISTS profiles_auto_age_trigger ON profiles;
CREATE TRIGGER profiles_auto_age_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_age_from_dob();

DROP TRIGGER IF EXISTS dependents_auto_age_trigger ON household_dependents;
CREATE TRIGGER dependents_auto_age_trigger
  BEFORE INSERT OR UPDATE ON household_dependents
  FOR EACH ROW
  EXECUTE FUNCTION update_age_from_dob();

-- 7. Create updated_at trigger for household_dependents
DROP TRIGGER IF EXISTS update_dependents_updated_at ON household_dependents;
CREATE TRIGGER update_dependents_updated_at BEFORE UPDATE ON household_dependents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable RLS for household_dependents
ALTER TABLE household_dependents ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for household_dependents
DROP POLICY IF EXISTS "Users can view household dependents" ON household_dependents;
CREATE POLICY "Users can view household dependents" ON household_dependents
  FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT user_id FROM household_members WHERE household_id = household_dependents.household_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE household_id = household_dependents.household_id
    )
  );

DROP POLICY IF EXISTS "Users can insert household dependents" ON household_dependents;
CREATE POLICY "Users can insert household dependents" ON household_dependents
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE household_id = household_dependents.household_id
    )
  );

DROP POLICY IF EXISTS "Users can update household dependents" ON household_dependents;
CREATE POLICY "Users can update household dependents" ON household_dependents
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT created_by FROM households WHERE id = household_dependents.household_id
    )
  );

DROP POLICY IF EXISTS "Users can delete household dependents" ON household_dependents;
CREATE POLICY "Users can delete household dependents" ON household_dependents
  FOR DELETE USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT created_by FROM households WHERE id = household_dependents.household_id
    )
  );

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_household_dependents_household_id ON household_dependents(household_id);
CREATE INDEX IF NOT EXISTS idx_household_dependents_created_by ON household_dependents(created_by);
CREATE INDEX IF NOT EXISTS idx_household_dependents_type ON household_dependents(type);
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- 11. Function to get all household members (users + dependents)
CREATE OR REPLACE FUNCTION get_household_members(household_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  age INTEGER,
  date_of_birth DATE,
  photo_url TEXT,
  is_user BOOLEAN,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  -- Get actual users
  SELECT 
    p.id,
    p.name,
    'user'::TEXT as type,
    p.age,
    p.date_of_birth,
    COALESCE(p.profile_photo_url, p.google_avatar_url) as photo_url,
    TRUE as is_user,
    p.user_id,
    p.created_at
  FROM profiles p
  WHERE p.household_id = household_id_param
  
  UNION ALL
  
  -- Get dependents (children/pets)
  SELECT 
    hd.id,
    hd.name,
    hd.type,
    hd.age,
    hd.date_of_birth,
    hd.photo_url,
    FALSE as is_user,
    NULL::UUID as user_id,
    hd.created_at
  FROM household_dependents hd
  WHERE hd.household_id = household_id_param
  
  ORDER BY created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Update existing ages based on existing date_of_birth (if any)
UPDATE profiles 
SET age = calculate_age_from_dob(date_of_birth)
WHERE date_of_birth IS NOT NULL;

-- Show what we've created
SELECT 'Enhanced profile system setup complete!' as status;
SELECT 'Tables created/updated:' as info;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'household_dependents') 
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
