const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecipeSchema() {
  console.log('📋 Checking Recipe Table Schema...\n');

  try {
    // Get one record to see what columns exist
    const { data, error } = await supabase.from('recipes').select('*').limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Available columns in recipes table:');
      const columns = Object.keys(data[0]).sort();
      columns.forEach((col, index) => {
        console.log(`${index + 1}. ${col}`);
      });

      console.log('\n📝 Sample data:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('📭 No data in recipes table to examine schema');
    }
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkRecipeSchema();
