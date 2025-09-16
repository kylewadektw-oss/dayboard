require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAllProfiles() {
  console.log('🔍 Checking all profiles in database...');

  try {
    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profileError) {
      console.error('❌ Profile query error:', profileError);
      return;
    }

    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Full Name: ${profile.full_name}`);
      console.log(`   Display Name: ${profile.display_name}`);
      console.log(`   Created: ${profile.created_at}`);
      console.log(`   Household ID: ${profile.household_id}`);
      console.log(`   Onboarding Complete: ${profile.onboarding_completed}`);
    });

    // Also check for any profile with the email
    console.log('\n🔍 Checking for profile with email: kwade1984@gmail.com');
    const { data: profileByEmail, error: emailError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'kwade1984@gmail.com')
      .maybeSingle();

    if (emailError) {
      console.error('❌ Email query error:', emailError);
    } else if (profileByEmail) {
      console.log('✅ Found profile by email:');
      console.log('   ID:', profileByEmail.id);
      console.log('   Full Name:', profileByEmail.full_name);
      console.log('   Expected ID: 0139a6fc-bf13-426d-8929-604051c4d1f4');
      console.log(
        '   ID Match:',
        profileByEmail.id === '0139a6fc-bf13-426d-8929-604051c4d1f4'
      );
    } else {
      console.log('❌ No profile found with that email either');
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkAllProfiles();
