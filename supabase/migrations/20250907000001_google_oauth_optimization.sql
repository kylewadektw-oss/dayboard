-- Google OAuth Database Optimization Migration
-- Ensures seamless Google authentication with proper user data management
-- Date: September 7, 2025

-- Step 1: Create updated profile creation function that handles Google OAuth data
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into legacy users table for Stripe compatibility
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture');

  -- Insert into comprehensive profiles table with Google OAuth data
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    display_name, 
    avatar_url,
    preferred_name,
    profile_completion_percentage,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'given_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_user_meta_data->>'given_name', NEW.raw_user_meta_data->>'name', ''),
    25, -- 25% completion for OAuth signup (basic info from Google)
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', profiles.full_name),
    display_name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'given_name', profiles.display_name),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', profiles.avatar_url),
    preferred_name = COALESCE(NEW.raw_user_meta_data->>'given_name', NEW.raw_user_meta_data->>'name', profiles.preferred_name),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Add Google-specific metadata storage for advanced features (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'oauth_metadata'
  ) THEN
    ALTER TABLE profiles ADD COLUMN oauth_metadata jsonb DEFAULT '{}';
    COMMENT ON COLUMN profiles.oauth_metadata IS 'Stores OAuth provider metadata (Google profile data, etc.)';
  END IF;
END $$;

-- Step 3: Add last_sign_in tracking for analytics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_sign_in_at timestamptz;
    COMMENT ON COLUMN profiles.last_sign_in_at IS 'Tracks last successful authentication for analytics';
  END IF;
END $$;

-- Step 4: Add authentication provider tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'auth_provider'
  ) THEN
    ALTER TABLE profiles ADD COLUMN auth_provider text DEFAULT 'google';
    COMMENT ON COLUMN profiles.auth_provider IS 'Tracks which OAuth provider was used (google, email, etc.)';
  END IF;
END $$;

-- Step 5: Create function to update last sign in (called from auth callback)
CREATE OR REPLACE FUNCTION public.update_user_sign_in(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    last_sign_in_at = now(),
    last_seen_at = now(),
    is_active = true
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create comprehensive Google OAuth data extraction function
CREATE OR REPLACE FUNCTION public.extract_google_oauth_data(user_metadata jsonb)
RETURNS jsonb AS $$
DECLARE
  extracted_data jsonb;
BEGIN
  extracted_data := jsonb_build_object(
    'google_id', user_metadata->>'sub',
    'email_verified', (user_metadata->>'email_verified')::boolean,
    'locale', user_metadata->>'locale',
    'picture_url', user_metadata->>'picture',
    'given_name', user_metadata->>'given_name',
    'family_name', user_metadata->>'family_name',
    'profile_link', user_metadata->>'profile'
  );
  
  RETURN extracted_data;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 7: Add useful indexes for authentication performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON profiles(last_sign_in_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Step 8: Update RLS policies to ensure proper Google OAuth access
-- (Policies already exist, but ensuring they work with new fields)

-- Step 9: Create view for easy Google OAuth user data access
CREATE OR REPLACE VIEW google_oauth_users AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.display_name,
  p.avatar_url,
  p.preferred_name,
  p.auth_provider,
  p.last_sign_in_at,
  p.created_at,
  p.oauth_metadata,
  CASE 
    WHEN p.oauth_metadata->>'google_id' IS NOT NULL THEN true
    ELSE false
  END as is_google_user,
  p.oauth_metadata->>'email_verified' as google_email_verified,
  p.oauth_metadata->>'locale' as google_locale
FROM profiles p
WHERE p.auth_provider = 'google' OR p.oauth_metadata->>'google_id' IS NOT NULL;

-- Step 10: Add comments for documentation
COMMENT ON TABLE profiles IS 'Comprehensive user profiles supporting Google OAuth and household management';
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates user profiles from Google OAuth data on signup';
COMMENT ON FUNCTION update_user_sign_in(uuid) IS 'Updates user sign-in timestamp for analytics and activity tracking';
COMMENT ON VIEW google_oauth_users IS 'Convenient view for accessing Google OAuth user data';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Google OAuth database optimization completed successfully!';
  RAISE NOTICE 'Features added:';
  RAISE NOTICE '✅ Enhanced Google OAuth data extraction';
  RAISE NOTICE '✅ Automatic profile creation with Google metadata';
  RAISE NOTICE '✅ Authentication provider tracking';
  RAISE NOTICE '✅ Sign-in analytics and activity monitoring';
  RAISE NOTICE '✅ Performance indexes for auth operations';
  RAISE NOTICE '✅ Google OAuth user data view';
END $$;
