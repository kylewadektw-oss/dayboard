-- Create customer_reviews table for tracking customer feedback and reviews
-- This migration creates the customer_reviews table referenced in auth callback

BEGIN;

-- Create customer_reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'declined')),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_type text DEFAULT 'general' CHECK (review_type IN ('general', 'feature_feedback', 'bug_report', 'suggestion')),
  reviewer_name text,
  reviewer_email text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  
  -- Additional metadata
  app_version text,
  device_info jsonb,
  feedback_category text,
  helpful_votes integer DEFAULT 0,
  response_from_team text,
  response_at timestamp with time zone
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_reviews_user_id ON customer_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_rating ON customer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created_at ON customer_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_is_public ON customer_reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_review_type ON customer_reviews(review_type);

-- Row Level Security (RLS) Policies
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reviews
CREATE POLICY "Users can view their own reviews" 
ON customer_reviews FOR SELECT 
USING (user_id = auth.uid());

-- Policy: Users can insert their own reviews
CREATE POLICY "Users can create their own reviews" 
ON customer_reviews FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own reviews (before completion)
CREATE POLICY "Users can update their own pending reviews" 
ON customer_reviews FOR UPDATE 
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid());

-- Policy: Public reviews are viewable by all authenticated users
CREATE POLICY "Public reviews are viewable by all" 
ON customer_reviews FOR SELECT 
USING (is_public = true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating updated_at
CREATE TRIGGER update_customer_reviews_updated_at
  BEFORE UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_reviews_updated_at();

-- Add comments for documentation
COMMENT ON TABLE customer_reviews IS 'Stores customer reviews and feedback for the application';
COMMENT ON COLUMN customer_reviews.user_id IS 'Reference to the user who submitted the review';
COMMENT ON COLUMN customer_reviews.status IS 'Status of the review (pending, completed, declined)';
COMMENT ON COLUMN customer_reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN customer_reviews.review_text IS 'The actual review text content';
COMMENT ON COLUMN customer_reviews.review_type IS 'Type of review (general, feature_feedback, bug_report, suggestion)';
COMMENT ON COLUMN customer_reviews.is_public IS 'Whether this review can be displayed publicly';
COMMENT ON COLUMN customer_reviews.helpful_votes IS 'Number of users who found this review helpful';
COMMENT ON COLUMN customer_reviews.response_from_team IS 'Response from the development team';

COMMIT;