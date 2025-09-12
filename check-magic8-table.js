require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://csbwewirwzeitavhvykr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8'
);

async function checkMagic8Table() {
  console.log('🔍 Checking production database schema...');
  
  try {
    // Check profiles table structure
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.log('❌ Cannot access profiles table:', profileError.message);
    } else {
      console.log('✅ Profiles table sample data:', profileData);
      if (profileData && profileData.length > 0) {
        console.log('� Profile columns:', Object.keys(profileData[0]));
      }
    }
    
    // Check households table
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('*')
      .limit(1);
    
    if (householdError) {
      console.log('❌ Cannot access households table:', householdError.message);
    } else {
      console.log('✅ Households table accessible');
      if (householdData && householdData.length > 0) {
        console.log('📊 Household columns:', Object.keys(householdData[0]));
      }
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

checkMagic8Table().catch(console.error);