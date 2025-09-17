/*
 * Fix Missing Household Data
 * 
 * This script creates the missing household that the user's profile references
 * so that weather functionality can work properly.
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

async function fixMissingHousehold() {
  console.log('🔧 Fixing Missing Household Data...\n');

  try {
    // First, get the user profile to see what household_id they have
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
      console.log(`   Household ID: ${householdId}`);

      // Check if household exists
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('id')
        .eq('id', householdId)
        .single();

      if (householdError && householdError.code === 'PGRST116') {
        // Household doesn't exist, create it
        console.log('   ❌ Household not found - creating missing household...');
        
        const { data: newHousehold, error: createError } = await supabase
          .from('households')
          .insert({
            id: householdId, // Use the same ID the profile references
            name: `${profile.name || profile.preferred_name || 'User'}'s Household`,
            household_type: 'family_household',
            created_by: profile.user_id,
            admin_id: profile.user_id,
            address: null, // Will be set later via profile setup
            city: null,
            state: null,
            zip: null,
            coordinates: null,
            household_code: Math.random().toString(36).substring(2, 8).toUpperCase()
          })
          .select()
          .single();

        if (createError) {
          console.error('   ❌ Error creating household:', createError);
        } else {
          console.log('   ✅ Created household successfully!');
          console.log(`      Household Name: ${newHousehold.name}`);
          console.log(`      Household Code: ${newHousehold.household_code}`);
          console.log('      📍 Address: Not set (user needs to add via profile)');
        }
      } else if (household) {
        console.log('   ✅ Household already exists');
      } else {
        console.error('   ❌ Error checking household:', householdError);
      }
    }

    // Now check weather functionality
    console.log('\n🌤️ Testing weather functionality...');
    const { data: updatedHouseholds, error: testError } = await supabase
      .from('households')
      .select('id, name, address, city, state, coordinates');

    if (testError) {
      console.error('❌ Error checking households:', testError);
    } else if (updatedHouseholds && updatedHouseholds.length > 0) {
      console.log('✅ Households now exist:');
      for (const household of updatedHouseholds) {
        console.log(`   🏠 ${household.name}`);
        console.log(`      Address: ${household.address || '❌ Not set'}`);
        console.log(`      Coordinates: ${household.coordinates ? '✅ Set' : '❌ Not set'}`);
        
        if (!household.address) {
          console.log('      💡 User needs to set address in profile for weather to work');
        }
      }
    }

  } catch (error) {
    console.error('💥 Error during fix:', error);
  }
}

async function main() {
  await fixMissingHousehold();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. ✅ Household data fixed (if any were missing)');
  console.log('2. 📍 User needs to go to Profile page and set household address');
  console.log('3. 🌤️ Once address is set, weather should work automatically');
  console.log('4. 🧪 Test the profile setup flow to add address with geocoding');
}

main().catch(console.error);