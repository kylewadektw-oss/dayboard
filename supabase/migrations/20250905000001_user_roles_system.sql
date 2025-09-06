-- User Roles and Permissions System
-- Family Command Center Database Schema

-- Enum for user roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'member');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'family_plus');
  END IF;
END $$;

-- Households table (family groups)
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  admin_id uuid NOT NULL, -- References the household administrator
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_id text, -- Stripe subscription ID
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns to existing households table if they don't exist
DO $$
BEGIN
  -- Add admin_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'households' AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE households ADD COLUMN admin_id uuid;
  END IF;
  
  -- Add subscription_tier column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'households' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE households ADD COLUMN subscription_tier subscription_tier DEFAULT 'free';
  END IF;
  
  -- Add subscription_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'households' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE households ADD COLUMN subscription_id text;
  END IF;
  
  -- Add trial_ends_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'households' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE households ADD COLUMN trial_ends_at timestamptz;
  END IF;
END $$;

-- Enhanced profiles table with role system
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  display_name text,
  avatar_url text,
  
  -- Personal Details
  date_of_birth date,
  phone_number text,
  bio text,
  preferred_name text, -- What they like to be called
  pronouns text, -- he/him, she/her, they/them, etc.
  
  -- Location & Contact
  address jsonb, -- Full address as JSON
  emergency_contact jsonb, -- Emergency contact info as JSON
  
  -- Preferences & Settings
  timezone text DEFAULT 'America/New_York',
  language text DEFAULT 'en',
  notification_preferences jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{}',
  
  -- Family Role & System
  role user_role DEFAULT 'member',
  household_id uuid REFERENCES households(id) ON DELETE SET NULL,
  family_role text, -- Mom, Dad, Child, Grandparent, etc.
  dietary_restrictions text[],
  allergies text[],
  
  -- Status & Activity
  is_active boolean DEFAULT true,
  last_seen_at timestamptz,
  onboarding_completed boolean DEFAULT false,
  profile_completion_percentage integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns to existing profiles table if they don't exist
DO $$
BEGIN
  -- Personal Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_name') THEN
    ALTER TABLE profiles ADD COLUMN preferred_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pronouns') THEN
    ALTER TABLE profiles ADD COLUMN pronouns text;
  END IF;
  
  -- Location & Contact
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
    ALTER TABLE profiles ADD COLUMN address jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'emergency_contact') THEN
    ALTER TABLE profiles ADD COLUMN emergency_contact jsonb;
  END IF;
  
  -- Preferences & Settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
    ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'America/New_York';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language') THEN
    ALTER TABLE profiles ADD COLUMN language text DEFAULT 'en';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
    ALTER TABLE profiles ADD COLUMN notification_preferences jsonb DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'privacy_settings') THEN
    ALTER TABLE profiles ADD COLUMN privacy_settings jsonb DEFAULT '{}';
  END IF;
  
  -- Family Role & System
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'member';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'household_id') THEN
    ALTER TABLE profiles ADD COLUMN household_id uuid REFERENCES households(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'family_role') THEN
    ALTER TABLE profiles ADD COLUMN family_role text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dietary_restrictions') THEN
    ALTER TABLE profiles ADD COLUMN dietary_restrictions text[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'allergies') THEN
    ALTER TABLE profiles ADD COLUMN allergies text[];
  END IF;
  
  -- Status & Activity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
    ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_seen_at') THEN
    ALTER TABLE profiles ADD COLUMN last_seen_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_completion_percentage') THEN
    ALTER TABLE profiles ADD COLUMN profile_completion_percentage integer DEFAULT 0;
  END IF;
  
  -- Add constraints after columns exist
  -- Valid admin role constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_admin_role' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_admin_role CHECK (
      role != 'admin' OR household_id IS NOT NULL
    );
  END IF;
  
  -- Valid profile completion constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_profile_completion' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_profile_completion CHECK (
      profile_completion_percentage >= 0 AND profile_completion_percentage <= 100
    );
  END IF;
END $$;

-- Feature permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Core Pages
  dashboard boolean DEFAULT true,
  meals boolean DEFAULT true,
  lists boolean DEFAULT true,
  work boolean DEFAULT false,
  projects boolean DEFAULT true,
  profile boolean DEFAULT true,
  
  -- Premium Features
  sports_ticker boolean DEFAULT false,
  financial_tracking boolean DEFAULT false,
  ai_features boolean DEFAULT false,
  
  -- Admin Features
  household_management boolean DEFAULT false,
  user_management boolean DEFAULT false,
  feature_management boolean DEFAULT false,
  billing_management boolean DEFAULT false,
  
  -- Super Admin Features
  system_admin boolean DEFAULT false,
  global_feature_control boolean DEFAULT false,
  analytics_dashboard boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Household feature settings (what features are enabled for the household)
CREATE TABLE IF NOT EXISTS household_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  
  -- Core Features (always available)
  dashboard boolean DEFAULT true,
  meals boolean DEFAULT true,
  lists boolean DEFAULT true,
  work boolean DEFAULT true,
  projects boolean DEFAULT true,
  profile boolean DEFAULT true,
  
  -- Premium Features (based on subscription)
  sports_ticker boolean DEFAULT false,
  financial_tracking boolean DEFAULT false,
  ai_features boolean DEFAULT false,
  advanced_analytics boolean DEFAULT false,
  unlimited_storage boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(household_id)
);

-- Super Admin feature control (global feature toggles)
CREATE TABLE IF NOT EXISTS global_feature_toggles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text UNIQUE NOT NULL,
  is_enabled boolean DEFAULT true,
  description text,
  requires_subscription boolean DEFAULT false,
  minimum_tier subscription_tier DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Household invitations
CREATE TABLE IF NOT EXISTS household_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  invited_email text,
  invited_by uuid,
  role user_role DEFAULT 'member',
  invitation_token text,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns to existing household_invitations table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_invitations' AND column_name = 'invited_email') THEN
    ALTER TABLE household_invitations ADD COLUMN invited_email text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_invitations' AND column_name = 'invited_by') THEN
    ALTER TABLE household_invitations ADD COLUMN invited_by uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_invitations' AND column_name = 'role') THEN
    ALTER TABLE household_invitations ADD COLUMN role user_role DEFAULT 'member';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_invitations' AND column_name = 'invitation_token') THEN
    ALTER TABLE household_invitations ADD COLUMN invitation_token text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_invitations' AND column_name = 'expires_at') THEN
    ALTER TABLE household_invitations ADD COLUMN expires_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_invitations' AND column_name = 'accepted_at') THEN
    ALTER TABLE household_invitations ADD COLUMN accepted_at timestamptz;
  END IF;
  
  -- Add unique constraints after columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'household_invitations_invitation_token_key' 
    AND table_name = 'household_invitations'
  ) THEN
    ALTER TABLE household_invitations ADD CONSTRAINT household_invitations_invitation_token_key UNIQUE (invitation_token);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'household_invitations_household_id_invited_email_key' 
    AND table_name = 'household_invitations'
  ) THEN
    ALTER TABLE household_invitations ADD CONSTRAINT household_invitations_household_id_invited_email_key UNIQUE (household_id, invited_email);
  END IF;
END $$;

-- Add foreign key constraint for household admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'households_admin_fkey' 
    AND table_name = 'households'
  ) THEN
    ALTER TABLE households 
    ADD CONSTRAINT households_admin_fkey 
    FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_household_id ON profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_household_features_household_id ON household_features(household_id);
CREATE INDEX IF NOT EXISTS idx_household_invitations_token ON household_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_household_invitations_email ON household_invitations(invited_email);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Household members can view each other') THEN
    CREATE POLICY "Household members can view each other" ON profiles
      FOR SELECT USING (
        household_id IN (
          SELECT household_id FROM profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can manage household members') THEN
    CREATE POLICY "Admins can manage household members" ON profiles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND (role = 'admin' OR role = 'super_admin')
          AND household_id = profiles.household_id
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Super admins can view all profiles') THEN
    CREATE POLICY "Super admins can view all profiles" ON profiles
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- User permissions policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_permissions' AND policyname = 'Users can view their own permissions') THEN
    CREATE POLICY "Users can view their own permissions" ON user_permissions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_permissions' AND policyname = 'Admins can manage household member permissions') THEN
    CREATE POLICY "Admins can manage household member permissions" ON user_permissions
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles p1
          JOIN profiles p2 ON p1.household_id = p2.household_id
          WHERE p1.id = auth.uid() 
          AND p1.role IN ('admin', 'super_admin')
          AND p2.id = user_permissions.user_id
        )
      );
  END IF;
END $$;

-- Household policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'households' AND policyname = 'Household members can view their household') THEN
    CREATE POLICY "Household members can view their household" ON households
      FOR SELECT USING (
        id IN (
          SELECT household_id FROM profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'households' AND policyname = 'Admins can manage their household') THEN
    CREATE POLICY "Admins can manage their household" ON households
      FOR ALL USING (
        admin_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Global feature toggles (Super Admin only)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'global_feature_toggles' AND policyname = 'Super admins can manage global features') THEN
    CREATE POLICY "Super admins can manage global features" ON global_feature_toggles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'global_feature_toggles' AND policyname = 'All users can read global features') THEN
    CREATE POLICY "All users can read global features" ON global_feature_toggles
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Functions for role management

-- Function to create default permissions for new users
CREATE OR REPLACE FUNCTION create_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_permissions (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default permissions
DROP TRIGGER IF EXISTS create_user_permissions_trigger ON profiles;
CREATE TRIGGER create_user_permissions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_permissions();

-- Function to update household admin when needed
CREATE OR REPLACE FUNCTION update_household_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If user's role is changed to admin, update household admin
  IF NEW.role = 'admin' AND OLD.role != 'admin' THEN
    UPDATE households 
    SET admin_id = NEW.id, updated_at = now()
    WHERE id = NEW.household_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update household admin
DROP TRIGGER IF EXISTS update_household_admin_trigger ON profiles;
CREATE TRIGGER update_household_admin_trigger
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_household_admin();

-- Insert default global feature toggles (only if they don't exist)
INSERT INTO global_feature_toggles (feature_key, is_enabled, description, requires_subscription, minimum_tier) 
SELECT * FROM (VALUES
  ('dashboard', true, 'Main dashboard with widgets', false, 'free'::subscription_tier),
  ('meals', true, 'Meal planning and recipes', false, 'free'::subscription_tier),
  ('lists', true, 'List management (grocery, todo, etc)', false, 'free'::subscription_tier),
  ('work', true, 'Work schedule and time tracking', false, 'free'::subscription_tier),
  ('projects', true, 'Project and task management', false, 'free'::subscription_tier),
  ('profile', true, 'User profiles and household management', false, 'free'::subscription_tier),
  ('sports_ticker', true, 'Sports scores and updates', true, 'premium'::subscription_tier),
  ('financial_tracking', true, 'Stock and budget tracking', true, 'premium'::subscription_tier),
  ('ai_features', true, 'AI-powered suggestions and automation', true, 'family_plus'::subscription_tier),
  ('advanced_analytics', true, 'Detailed family analytics', true, 'premium'::subscription_tier),
  ('unlimited_storage', true, 'Unlimited photo and document storage', true, 'premium'::subscription_tier)
) AS v(feature_key, is_enabled, description, requires_subscription, minimum_tier)
WHERE NOT EXISTS (
  SELECT 1 FROM global_feature_toggles WHERE global_feature_toggles.feature_key = v.feature_key
);
