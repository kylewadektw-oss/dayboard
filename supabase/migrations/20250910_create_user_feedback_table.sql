-- User Feedback System Migration
-- This creates a table to store user feedback and critiques

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  
  -- Feedback Details
  page_url TEXT NOT NULL,
  page_title TEXT,
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'improvement', 'complaint', 'compliment', 'other')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  
  -- Context
  browser_info JSONB,
  screen_resolution TEXT,
  user_agent TEXT,
  
  -- Status Management
  status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'duplicate')),
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_household_id ON user_feedback(household_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_feedback_type ON user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_user_feedback_priority ON user_feedback(priority);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can create feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback (only specific fields)
CREATE POLICY "Users can update own feedback" ON user_feedback
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback (will need to be implemented based on your admin system)
-- This assumes you have a way to identify admins - adjust as needed
CREATE POLICY "Admins can view all feedback" ON user_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-set resolved_at when status changes to resolved or closed
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = NOW();
  END IF;
  
  -- Clear resolved_at if status changes from resolved/closed back to open/in_progress
  IF NEW.status IN ('open', 'in_progress') AND OLD.status IN ('resolved', 'closed') THEN
    NEW.resolved_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_feedback_updated_at_trigger
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feedback_updated_at();

-- Add helpful comments
COMMENT ON TABLE user_feedback IS 'Stores user feedback, bug reports, and feature requests';
COMMENT ON COLUMN user_feedback.feedback_type IS 'Type of feedback: bug, feature_request, improvement, complaint, compliment, other';
COMMENT ON COLUMN user_feedback.priority IS 'Priority level: low, medium, high, urgent';
COMMENT ON COLUMN user_feedback.status IS 'Current status: open, in_progress, resolved, closed, duplicate';
COMMENT ON COLUMN user_feedback.browser_info IS 'JSON object containing browser and device information';
