/*
 * Fix Existing User Profile for Proper Onboarding
 * 
 * This script clears the invalid household_id from existing users
 * so they'll go through the improved signup flow with address geocoding.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixExistingUser() {
  console.log('🔧 Fixing Existing User for Improved Onboarding...\n');

  try {
    // Find users with household_id that references non-existent households
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, name, preferred_name, household_id')
      .not('household_id', 'is', null);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    for (const profile of profiles) {
      console.log(`👤 Checking profile: ${profile.name || profile.preferred_name}`);
      
      // Check if household exists
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('id, name, coordinates')
        .eq('id', profile.household_id)
        .single();

      if (householdError && householdError.code === 'PGRST116') {
        console.log('   ❌ Household not found - clearing profile for fresh setup');
        
        // Clear household_id and reset onboarding
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            household_id: null,
            onboarding_completed: false
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('   ❌ Error updating profile:', updateError);
        } else {
          console.log('   ✅ Profile reset successfully');
          console.log('   🔄 User will go through improved signup on next login');
        }
      } else if (household) {
        console.log(`   ✅ Household exists: ${household.name}`);
        
        // Check if household has coordinates
        if (household.coordinates) {
          console.log('   📍 Coordinates already set - weather should work');
        } else {
          console.log('   ❌ No coordinates - user should update address in profile');
        }
      }
    }

  } catch (error) {
    console.error('💥 Error during fix:', error);
  }
}

async function main() {
  await fixExistingUser();
  
  console.log('\n🎯 What\'s improved:');
  console.log('1. ✅ Profile setup now uses GoogleAddressInput with geocoding');
  console.log('2. ✅ Households created with coordinates automatically');
  console.log('3. ✅ Auth callback validates household existence');
  console.log('4. ✅ Weather widgets will work immediately after signup');
  console.log('5. ✅ No more profile glitches from missing data');
  
  console.log('\n🧪 Next steps:');
  console.log('1. Sign out and sign back in');
  console.log('2. Complete the improved profile setup with address');
  console.log('3. Weather should work immediately on dashboard');
}

main().catch(console.error);