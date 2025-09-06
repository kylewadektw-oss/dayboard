const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM1ODc2MiwiZXhwIjoyMDcxOTM0NzYyfQ.9cYI_QLZEqI6HmTmhUKKmI0xeP37Xe1Jt5CJhQgOfF8';

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabase() {
  console.log('Testing database connection...');
  
  // Test basic connection with anon key
  try {
    const { data, error } = await supabaseAnon.from('profiles').select('count').single();
    console.log('✅ Database connection successful (anon)');
  } catch (error) {
    console.log('❌ Database connection failed (anon):', error.message);
  }

  // Check profiles with anon key (RLS applied)
  console.log('\n--- Testing with ANON key (RLS applied) ---');
  try {
    const { data, error } = await supabaseAnon.from('profiles').select('*').limit(10);
    if (error) {
      console.log('❌ Profiles table error (anon):', error.message);
    } else {
      console.log(`📊 Found ${data.length} profiles with anon key (RLS applied)`);
    }
  } catch (error) {
    console.log('❌ Profiles table access failed (anon):', error.message);
  }

  // Check profiles with service role key (bypasses RLS)
  console.log('\n--- Testing with SERVICE ROLE key (bypasses RLS) ---');
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(10);
    if (error) {
      console.log('❌ Profiles table error (admin):', error.message);
    } else {
      console.log('✅ Profiles table accessible (admin)');
      console.log(`📊 Found ${data.length} profiles in database:`);
      data.forEach(profile => {
        console.log(`  - ID: ${profile.id}`);
        console.log(`    Email: ${profile.email}`);
        console.log(`    Full Name: ${profile.full_name || 'N/A'}`);
        console.log(`    Display Name: ${profile.display_name || 'N/A'}`);
        console.log(`    Role: ${profile.role}`);
        console.log(`    Household ID: ${profile.household_id || 'N/A'}`);
        console.log(`    Active: ${profile.is_active}`);
        console.log(`    Created: ${profile.created_at}`);
        console.log('    ---');
      });
    }
  } catch (error) {
    console.log('❌ Profiles table access failed (admin):', error.message);
  }

  // Check if user_permissions table exists
  console.log('\n--- Testing user_permissions table ---');
  try {
    const { data, error } = await supabaseAdmin.from('user_permissions').select('*').limit(1);
    if (error) {
      console.log('❌ User permissions table error:', error.message);
    } else {
      console.log('✅ User permissions table accessible');
      console.log(`📊 Found ${data.length} permission records`);
    }
  } catch (error) {
    console.log('❌ User permissions table access failed:', error.message);
  }

  // Check current auth session
  console.log('\n--- Testing auth session ---');
  try {
    const { data: { session }, error } = await supabaseAnon.auth.getSession();
    if (session) {
      console.log('✅ Active session found for user:', session.user.email);
      console.log('  User ID:', session.user.id);
    } else {
      console.log('ℹ️  No active session (expected for this test)');
    }
  } catch (error) {
    console.log('❌ Session check failed:', error.message);
  }
}

testDatabase().catch(console.error);
