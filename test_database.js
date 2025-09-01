const { createClient } = require('@supabase/supabase-js');

// Use the same config as the app
const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Connection successful!');
      console.log('📊 Profiles table accessible');
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }

  try {
    // Test households table
    const { data, error } = await supabase.from('households').select('count').limit(1);
    
    if (error) {
      console.error('❌ Households table error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Households table accessible');
    }
  } catch (e) {
    console.error('❌ Households table unexpected error:', e);
  }

  try {
    // Test invitations table
    const { data, error } = await supabase.from('household_invitations').select('count').limit(1);
    
    if (error) {
      console.error('❌ Invitations table error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Invitations table accessible');
    }
  } catch (e) {
    console.error('❌ Invitations table unexpected error:', e);
  }
}

testConnection().then(() => {
  console.log('🏁 Test complete');
  process.exit(0);
}).catch((e) => {
  console.error('💥 Test failed:', e);
  process.exit(1);
});
