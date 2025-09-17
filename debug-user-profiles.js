/*
 * Debug User Profile and Household Setup
 * 
 * This script checks user profiles to see if they have household_id set
 * and helps identify why weather isn't working.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserProfiles() {
  console.log('🔍 Debugging User Profiles and Household Setup...\n');

  try {
    // Check all profiles
    console.log('👥 Fetching all user profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, name, preferred_name, household_id, onboarding_completed, role');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('📭 No user profiles found in database');
      return;
    }

    console.log(`✅ Found ${profiles.length} user profile(s):\n`);

    for (const profile of profiles) {
      console.log(`👤 Profile: ${profile.name || profile.preferred_name || 'Unnamed'}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   User ID: ${profile.user_id}`);
      console.log(`   Household ID: ${profile.household_id || '❌ NOT SET'}`);
      console.log(`   Onboarding Complete: ${profile.onboarding_completed || '❌ NOT SET'}`);
      console.log(`   Role: ${profile.role || 'Not set'}`);
      
      // Check if this profile should be redirected to setup
      if (!profile.household_id) {
        console.log('   🚨 ISSUE: User has no household - should be redirected to profile setup');
      } else {
        console.log('   ✅ User has household assigned');
      }
      
      if (!profile.onboarding_completed) {
        console.log('   🚨 ISSUE: Onboarding not completed - should be redirected to profile setup');
      } else {
        console.log('   ✅ Onboarding completed');
      }
      
      console.log(''); // Empty line between profiles
    }

    // Check households again to confirm
    console.log('🏠 Fetching all households...');
    const { data: households, error: householdsError } = await supabase
      .from('households')
      .select('id, name, address, city, state, zip, coordinates, created_by');

    if (householdsError) {
      console.error('❌ Error fetching households:', householdsError);
    } else if (!households || households.length === 0) {
      console.log('📭 No households found in database');
      console.log('💡 Users need to complete profile setup to create households');
    } else {
      console.log(`✅ Found ${households.length} household(s):`);
      for (const household of households) {
        console.log(`   🏠 ${household.name || 'Unnamed'} (ID: ${household.id})`);
        console.log(`      Created by: ${household.created_by}`);
        console.log(`      Address: ${household.address || 'Not set'}`);
        if (household.coordinates) {
          try {
            const coords = JSON.parse(household.coordinates);
            console.log(`      📍 Coordinates: lat=${coords.lat}, lng=${coords.lng}`);
          } catch {
            console.log(`      ❌ Invalid coordinates format`);
          }
        } else {
          console.log(`      ❌ No coordinates set`);
        }
      }
    }

  } catch (error) {
    console.error('💥 Error during debugging:', error);
  }
}

async function main() {
  await debugUserProfiles();
  
  console.log('\n🔧 Analysis Summary:');
  console.log('• If profiles exist but household_id is null → User needs to complete profile setup');
  console.log('• If onboarding_completed is false → User should be redirected to /profile/setup');
  console.log('• If no households exist → No weather data can be shown');
  console.log('• If household exists but no coordinates → Address needs to be geocoded');
  
  console.log('\n💡 Next steps:');
  console.log('1. Check auth callback logic for proper household_id validation');
  console.log('2. Ensure users are redirected to profile setup when needed');
  console.log('3. Test the profile setup flow to create household with address');
  console.log('4. Verify geocoding sets coordinates properly');
}

main().catch(console.error);