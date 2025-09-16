/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Test script to apply feedback table migration
 */

const { createClient } = require('@supabase/supabase-js');

async function applyMigration() {
  try {
    // Use your actual Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // SQL for creating the feedback table
    const migrationSQL = `
      -- Create user_feedback table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.user_feedback (
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
      CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_feedback_household_id ON public.user_feedback(household_id);
      CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
      CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON public.user_feedback(feedback_type);
      CREATE INDEX IF NOT EXISTS idx_user_feedback_priority ON public.user_feedback(priority);
      CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback(created_at);

      -- Enable RLS
      ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

      -- RLS Policies
      DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_feedback;
      CREATE POLICY "Users can view own feedback" ON public.user_feedback
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert own feedback" ON public.user_feedback;
      CREATE POLICY "Users can insert own feedback" ON public.user_feedback
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update own feedback" ON public.user_feedback;
      CREATE POLICY "Users can update own feedback" ON public.user_feedback
        FOR UPDATE USING (auth.uid() = user_id);

      -- Admin can view all feedback (you'll need to adjust this based on your admin logic)
      DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
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

      DROP TRIGGER IF EXISTS update_user_feedback_updated_at ON public.user_feedback;
      CREATE TRIGGER update_user_feedback_updated_at
        BEFORE UPDATE ON public.user_feedback
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log('Applying migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('Migration failed:', error);

      // Try alternative approach - execute each statement separately
      const statements = migrationSQL.split(';').filter((s) => s.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.trim().substring(0, 50) + '...');
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: statement.trim()
          });
          if (stmtError) {
            console.error('Statement failed:', stmtError);
          }
        }
      }
    } else {
      console.log('Migration applied successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

applyMigration();
