const { createClient } = require('@supabase/supabase-js');

// Use the same config as the app
const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  console.log('🔐 Testing RLS policies...');
  
  try {
    // Test without authentication - should be blocked
    console.log('\n1. Testing unauthenticated access...');
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.log('✅ Unauthenticated access blocked (expected):', error.message);
    } else {
      console.log('❌ Unauthenticated access allowed (unexpected):', data?.length || 0, 'rows');
    }

    // Test with fake user ID
    console.log('\n2. Testing with fake user_id filter...');
    const { data: data2, error: error2 } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .single();
    
    if (error2) {
      console.log('✅ Query with fake user_id returned error:', error2.code, error2.message);
    } else {
      console.log('❌ Query with fake user_id succeeded (unexpected):', data2);
    }

    // Test households table
    console.log('\n3. Testing households table...');
    const { data: data3, error: error3 } = await supabase.from('households').select('*').limit(1);
    
    if (error3) {
      console.log('✅ Households access blocked:', error3.message);
    } else {
      console.log('❌ Households access allowed:', data3?.length || 0, 'rows');
    }

  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }
}

testRLS().then(() => {
  console.log('\n🏁 RLS test complete');
  process.exit(0);
}).catch((e) => {
  console.error('💥 Test failed:', e);
  process.exit(1);
});
