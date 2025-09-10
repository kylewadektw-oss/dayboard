-- Add customer review system for new signup approvals
-- This adds tables to track signup requests and approval status

-- Create customer review status enum
CREATE TYPE customer_review_status AS ENUM ('pending', 'approved', 'rejected');

-- Create customer_reviews table (tracks post-signup user reviews)
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE SET NULL,
  status customer_review_status NOT NULL DEFAULT 'pending',
  review_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_user_id ON customer_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created_at ON customer_reviews(created_at);

-- Add household referral codes (shared across household, different from invitation codes)
ALTER TABLE households 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate referral codes for existing households
UPDATE households 
SET referral_code = 'FAM' || UPPER(SUBSTRING(id::text, 1, 6))
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL after setting defaults
ALTER TABLE households 
ALTER COLUMN referral_code SET NOT NULL;

-- Add constraint for referral code format
ALTER TABLE households 
ADD CONSTRAINT households_referral_code_format 
CHECK (referral_code ~ '^[A-Z0-9]{6,12}$');

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for customer_reviews
CREATE TRIGGER update_customer_reviews_updated_at 
  BEFORE UPDATE ON customer_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for customer_reviews
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews" ON customer_reviews
  FOR SELECT USING (user_id = auth.uid());

-- Only super_admins and admins can view all reviews
CREATE POLICY "Admins can view all customer reviews" ON customer_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('super_admin', 'admin')
    )
  );

-- Only super_admins and admins can update reviews
CREATE POLICY "Admins can update customer reviews" ON customer_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('super_admin', 'admin')
    )
  );

-- System can insert new reviews (for new user signups)
CREATE POLICY "System can create customer reviews" ON customer_reviews
  FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE customer_reviews IS 'Stores customer review status for signup approval workflow';
COMMENT ON COLUMN customer_reviews.status IS 'Review status: pending, approved, or rejected';
COMMENT ON COLUMN households.referral_code IS 'Household-wide referral code for inviting new customers';
