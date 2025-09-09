require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProfileSchema() {
  console.log('🔍 Checking profiles table columns...');
  
  try {
    // Get the one existing profile to see its structure
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (profiles && profiles.length > 0) {
      console.log('✅ Profile table columns:');
      Object.keys(profiles[0]).forEach(col => {
        console.log(`  - ${col}: ${typeof profiles[0][col]} = ${profiles[0][col]}`);
      });
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkProfileSchema();
