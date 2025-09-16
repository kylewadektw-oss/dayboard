/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Simple script to create feedback table using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');

async function createFeedbackTable() {
  try {
    // Use your actual Supabase credentials
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://csbwewirwzeitavhvykr.supabase.co';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM1ODc2MiwiZXhwIjoyMDcxOTM0NzYyfQ.9cYI_QLZEqI6HmTmhUKKmI0xeP37Xe1Jt5CJhQgOfF8';

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if table exists first
    console.log('Checking if user_feedback table exists...');
    const { data, error } = await supabase
      .from('user_feedback')
      .select('count', { count: 'exact', head: true });

    if (
      error &&
      error.message.includes('relation "public.user_feedback" does not exist')
    ) {
      console.log(
        'Table does not exist. Creating feedback table using manual SQL...'
      );

      // Since we can't execute raw SQL directly, let's try inserting a test record to see if it works
      console.log(
        'You need to create the table manually in Supabase Studio or SQL Editor.'
      );
      console.log(
        'Go to https://supabase.com/dashboard and run the following SQL:'
      );
      console.log(`
CREATE TABLE public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  page_url TEXT,
  page_title TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'improvement', 'complaint', 'compliment', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'responded', 'closed')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info JSONB,
  screen_resolution TEXT,
  user_agent TEXT,
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_household_id ON public.user_feedback(household_id);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX idx_user_feedback_type ON public.user_feedback(feedback_type);
CREATE INDEX idx_user_feedback_priority ON public.user_feedback(priority);
CREATE INDEX idx_user_feedback_created_at ON public.user_feedback(created_at);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own feedback" ON public.user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback" ON public.user_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback" ON public.user_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
      `);
    } else if (error) {
      console.error('Error checking table:', error);
    } else {
      console.log('Table already exists!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createFeedbackTable();
