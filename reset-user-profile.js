/*
 * Reset User Profile to Fix Household Issue
 * 
 * This script clears the invalid household_id from the user's profile
 * so they'll be redirected to profile setup to create a proper household.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetUserProfile() {
  console.log('🔧 Resetting User Profile for Household Setup...\n');

  try {
    // Get user profile with invalid household_id
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, name, preferred_name, household_id')
      .not('household_id', 'is', null);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('📭 No profiles with household_id found');
      return;
    }

    for (const profile of profiles) {
      const householdId = profile.household_id;
      console.log(`👤 Checking profile: ${profile.name || profile.preferred_name}`);
      console.log(`   Current Household ID: ${householdId}`);

      // Check if household exists
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('id')
        .eq('id', householdId)
        .single();

      if (householdError && householdError.code === 'PGRST116') {
        // Household doesn't exist - clear the invalid household_id
        console.log('   ❌ Household not found - clearing invalid household_id...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            household_id: null,
            onboarding_completed: false // Force them back to setup
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('   ❌ Error updating profile:', updateError);
        } else {
          console.log('   ✅ Profile updated successfully!');
          console.log('   📝 household_id cleared');
          console.log('   📝 onboarding_completed set to false');
          console.log('   🔄 User will be redirected to profile setup on next login');
        }
      } else if (household) {
        console.log('   ✅ Household exists - no action needed');
      } else {
        console.error('   ❌ Error checking household:', householdError);
      }
    }

  } catch (error) {
    console.error('💥 Error during reset:', error);
  }
}

async function main() {
  await resetUserProfile();
  
  console.log('\n🎯 What happens next:');
  console.log('1. ✅ Invalid household_id cleared from profile');
  console.log('2. 🔄 User will be redirected to profile setup on next login');
  console.log('3. 🏠 User can create a new household with proper address');
  console.log('4. 📍 Address will be geocoded to get coordinates');
  console.log('5. 🌤️ Weather widgets will work with real location data');
  
  console.log('\n🧪 To test:');
  console.log('1. Sign out and sign back in');
  console.log('2. Should be redirected to /profile/setup');
  console.log('3. Create household with address');
  console.log('4. Check weather on dashboard');
}

main().catch(console.error);