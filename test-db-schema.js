const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema for application_logs table...');
  
  try {
    // Test if table exists and what columns are available
    const { data, error } = await supabase
      .from('application_logs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing application_logs table:', error);
      
      // Try to get more info about the error
      if (error.code === 'PGRST116') {
        console.log('💡 Table might not exist. Let\'s check...');
      } else if (error.message.includes('column')) {
        console.log('💡 Column-related error detected');
      }
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    console.log('📊 Sample row structure:', data?.[0] || 'No data found');
    
    // Test inserting a simple log entry
    console.log('\n🧪 Testing log insertion...');
    const testLog = {
      level: 'info',
      message: 'Database schema test',
      component: 'test',
      timestamp: new Date().toISOString(),
      side: 'client'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('application_logs')
      .insert(testLog)
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      
      // Check if it's a side column issue
      if (insertError.message.includes('side')) {
        console.log('💡 Trying insert without side column...');
        const { side, ...logWithoutSide } = testLog;
        const { data: retryData, error: retryError } = await supabase
          .from('application_logs')
          .insert(logWithoutSide)
          .select();
        
        if (retryError) {
          console.error('❌ Insert without side also failed:', retryError);
        } else {
          console.log('✅ Insert without side succeeded:', retryData);
        }
      }
    } else {
      console.log('✅ Insert succeeded:', insertData);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testDatabaseSchema();
