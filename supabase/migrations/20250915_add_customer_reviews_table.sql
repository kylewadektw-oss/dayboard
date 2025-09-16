-- Create customer_reviews table for collecting and managing customer feedback
CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_type TEXT, -- 'bug_report', 'feature_request', 'general_feedback', etc.
    feedback_category TEXT, -- 'ui_ux', 'performance', 'functionality', etc.
    reviewer_name TEXT,
    reviewer_email TEXT,
    app_version TEXT,
    device_info JSONB,
    helpful_votes INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    response_from_team TEXT,
    response_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_customer_reviews_user_id ON public.customer_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON public.customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_rating ON public.customer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created_at ON public.customer_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_review_type ON public.customer_reviews(review_type);

-- Enable Row Level Security
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_reviews table
-- Users can view their own reviews
CREATE POLICY "Users can view their own reviews" 
ON public.customer_reviews FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can create their own reviews
CREATE POLICY "Users can create their own reviews" 
ON public.customer_reviews FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own reviews (only if not completed)
CREATE POLICY "Users can update their own reviews" 
ON public.customer_reviews FOR UPDATE 
USING (auth.uid()::text = user_id AND completed_at IS NULL);

-- Admins and super_admins can view all reviews
CREATE POLICY "Admins can view all reviews" 
ON public.customer_reviews FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid()::text 
        AND role IN ('admin', 'super_admin')
    )
);

-- Admins and super_admins can update all reviews
CREATE POLICY "Admins can update all reviews" 
ON public.customer_reviews FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid()::text 
        AND role IN ('admin', 'super_admin')
    )
);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_customer_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customer_reviews_updated_at
    BEFORE UPDATE ON public.customer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_customer_reviews_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.customer_reviews IS 'Customer feedback and reviews for the application';
COMMENT ON COLUMN public.customer_reviews.status IS 'Status of the review: pending, in_progress, completed, rejected';
COMMENT ON COLUMN public.customer_reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN public.customer_reviews.review_type IS 'Type of review: bug_report, feature_request, general_feedback, etc.';
COMMENT ON COLUMN public.customer_reviews.feedback_category IS 'Category: ui_ux, performance, functionality, etc.';
COMMENT ON COLUMN public.customer_reviews.device_info IS 'JSON containing device and browser information';
COMMENT ON COLUMN public.customer_reviews.helpful_votes IS 'Number of users who found this review helpful';
COMMENT ON COLUMN public.customer_reviews.is_public IS 'Whether this review can be displayed publicly';