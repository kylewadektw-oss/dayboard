require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProfileStatus() {
  console.log(
    '🔍 Checking profile status for user: 0139a6fc-bf13-426d-8929-604051c4d1f4'
  );

  try {
    // Check profile using user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', '0139a6fc-bf13-426d-8929-604051c4d1f4')
      .maybeSingle();

    if (profileError) {
      console.error('❌ Profile query error:', profileError);
      return;
    }

    if (!profile) {
      console.log('❌ No profile found for user');
      return;
    }

    console.log('✅ Profile found:');
    console.log('  - Profile ID:', profile.id);
    console.log('  - User ID:', profile.user_id);
    console.log('  - Name:', profile.name);
    console.log('  - Age:', profile.age);
    console.log('  - Profession:', profile.profession);
    console.log('  - Role:', profile.role);
    console.log('  - Household ID:', profile.household_id);
    console.log('  - Onboarding Completed:', profile.onboarding_completed);
    console.log(
      '  - Profile Completion %:',
      profile.profile_completion_percentage
    );
    console.log('  - Active:', profile.is_active);

    // Check completion criteria (using actual schema fields)
    const isComplete = !!(
      profile.household_id &&
      profile.onboarding_completed &&
      profile.name
    );
    console.log('\n🔍 Completion Check:');
    console.log('  - Has Household ID:', !!profile.household_id);
    console.log('  - Onboarding Completed:', profile.onboarding_completed);
    console.log('  - Has Name:', !!profile.name);
    console.log('  - Overall Complete:', isComplete);

    if (!isComplete) {
      console.log(
        '\n⚠️  Profile is incomplete - should redirect to /profile/setup'
      );
      console.log('   Missing:');
      if (!profile.household_id) console.log('   - Household ID');
      if (!profile.onboarding_completed)
        console.log('   - Onboarding completion');
      if (!profile.name) console.log('   - Name');
    } else {
      console.log('\n✅ Profile is complete - should allow dashboard access');
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkProfileStatus();
