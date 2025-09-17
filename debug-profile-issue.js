#!/usr/bin/env node

/*
 * 🔧 Profile Page Glitch Debugger
 * Investigates what's causing the profile page to be glitchy
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugProfileIssues() {
  console.log('🔍 Debugging Profile Page Issues...\n');
  
  try {
    // 1. Check if user profile exists and has valid data
    console.log('1️⃣ Checking user profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profileError) {
      console.log('❌ Profile fetch error:', profileError);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles`);
    
    profiles.forEach(profile => {
      console.log(`   👤 Profile: ${profile.name || 'No name'}`);
      console.log(`      - User ID: ${profile.user_id}`);
      console.log(`      - Household ID: ${profile.household_id || 'None'}`);
      console.log(`      - Onboarding completed: ${profile.onboarding_completed}`);
      console.log(`      - Phone: ${profile.phone_number || 'None'}`);
      console.log(`      - Date of birth: ${profile.date_of_birth || 'None'}`);
      console.log('');
    });
    
    // 2. Check household references
    console.log('2️⃣ Checking household references...');
    for (const profile of profiles) {
      if (profile.household_id) {
        const { data: household, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', profile.household_id)
          .single();
        
        if (householdError) {
          console.log(`❌ Household ${profile.household_id} not found for ${profile.name}`);
          console.log(`   Error: ${householdError.message}`);
        } else {
          console.log(`✅ Household "${household.name}" exists for ${profile.name}`);
          console.log(`   - Address: ${household.address || 'None'}`);
          console.log(`   - Coordinates: ${household.coordinates || 'None'}`);
        }
      } else {
        console.log(`⚠️  Profile ${profile.name} has no household`);
      }
    }
    
    // 3. Check user permissions
    console.log('\n3️⃣ Checking user permissions...');
    for (const profile of profiles) {
      const { data: permissions, error: permError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      
      if (permError) {
        console.log(`❌ No permissions found for ${profile.name}: ${permError.message}`);
      } else {
        console.log(`✅ Permissions exist for ${profile.name}`);
        console.log(`   - Dashboard: ${permissions.dashboard}`);
        console.log(`   - Profile: ${permissions.profile}`);
        console.log(`   - Household Management: ${permissions.household_management}`);
      }
    }
    
    // 4. Check notification preferences structure
    console.log('\n4️⃣ Checking notification preferences structure...');
    profiles.forEach(profile => {
      console.log(`   ${profile.name}:`);
      if (profile.notification_preferences) {
        try {
          const prefs = typeof profile.notification_preferences === 'string' 
            ? JSON.parse(profile.notification_preferences)
            : profile.notification_preferences;
          console.log(`      ✅ Valid JSON: ${JSON.stringify(prefs)}`);
        } catch (e) {
          console.log(`      ❌ Invalid JSON: ${profile.notification_preferences}`);
        }
      } else {
        console.log(`      ⚠️  No notification preferences`);
      }
    });
    
    // 5. Check dietary preferences and allergies
    console.log('\n5️⃣ Checking dietary preferences and allergies...');
    profiles.forEach(profile => {
      console.log(`   ${profile.name}:`);
      
      if (profile.dietary_preferences) {
        console.log(`      Dietary: ${Array.isArray(profile.dietary_preferences) ? 'Array' : typeof profile.dietary_preferences} - ${JSON.stringify(profile.dietary_preferences)}`);
      } else {
        console.log(`      Dietary: None`);
      }
      
      if (profile.allergies) {
        console.log(`      Allergies: ${Array.isArray(profile.allergies) ? 'Array' : typeof profile.allergies} - ${JSON.stringify(profile.allergies)}`);
      } else {
        console.log(`      Allergies: None`);
      }
    });
    
    console.log('\n🎯 Recommendations:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Verify all profile data is properly formatted');
    console.log('   3. Ensure household references are valid');
    console.log('   4. Check that permissions table exists and has correct data');
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugProfileIssues();