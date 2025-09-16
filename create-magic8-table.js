require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://csbwewirwzeitavhvykr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM1ODc2MiwiZXhwIjoyMDcxOTM0NzYyfQ.9cYI_QLZEqI6HmTmhUKKmI0xeP37Xe1Jt5CJhQgOfF8'
);

async function createMagic8Table() {
  console.log('🚀 Creating magic8_questions table in production...');

  // Step 1: Create the table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS magic8_questions (
      id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
      asked_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      question text NOT NULL,
      answer text NOT NULL,
      theme text DEFAULT 'classic' CHECK (theme IN ('classic', 'mystic', 'retro', 'neon', 'galaxy', 'minimalist')),
      created_at timestamp with time zone DEFAULT now()
    );
  `;

  try {
    const { error: createError } = await supabase.rpc('sql', {
      query: createTableSQL
    });

    if (createError) {
      console.log('❌ Error creating table:', createError);
      return;
    }

    console.log('✅ Table created successfully');

    // Step 2: Create indexes
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_magic8_household_id ON magic8_questions(household_id);
      CREATE INDEX IF NOT EXISTS idx_magic8_asked_by ON magic8_questions(asked_by);
      CREATE INDEX IF NOT EXISTS idx_magic8_created_at ON magic8_questions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_magic8_theme ON magic8_questions(theme);
    `;

    const { error: indexError } = await supabase.rpc('sql', {
      query: indexesSQL
    });

    if (indexError) {
      console.log('⚠️  Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Step 3: Enable RLS and create policies
    const rlsSQL = `
      ALTER TABLE magic8_questions ENABLE ROW LEVEL SECURITY;
      
      -- Policy for viewing Magic 8-Ball questions
      CREATE POLICY "Users can view household Magic 8-Ball questions" 
      ON magic8_questions FOR SELECT 
      USING (
        household_id IN (
          SELECT household_id 
          FROM profiles 
          WHERE profiles.user_id = auth.uid()
        )
      );
      
      -- Policy for creating questions  
      CREATE POLICY "Users can create Magic 8-Ball questions" 
      ON magic8_questions FOR INSERT 
      WITH CHECK (
        household_id IN (
          SELECT household_id 
          FROM profiles 
          WHERE profiles.user_id = auth.uid()
        )
        AND asked_by = auth.uid()
      );
      
      -- Policy for updating own questions
      CREATE POLICY "Users can update their own Magic 8-Ball questions" 
      ON magic8_questions FOR UPDATE 
      USING (asked_by = auth.uid())
      WITH CHECK (asked_by = auth.uid());
      
      -- Policy for deleting own questions
      CREATE POLICY "Users can delete their own Magic 8-Ball questions" 
      ON magic8_questions FOR DELETE 
      USING (asked_by = auth.uid());
    `;

    const { error: rlsError } = await supabase.rpc('sql', {
      query: rlsSQL
    });

    if (rlsError) {
      console.log('⚠️  Error setting up RLS policies:', rlsError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // Step 4: Test the table
    console.log('🧪 Testing table access...');
    const { data, error } = await supabase
      .from('magic8_questions')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.log('❌ Error testing table:', error);
    } else {
      console.log('✅ Table is accessible and ready!');
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

createMagic8Table().catch(console.error);
