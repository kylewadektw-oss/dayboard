#!/usr/bin/env node

/*
 * 🔧 Create Missing User Permissions
 * Creates the missing user_permissions record for Kyle Wade
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingPermissions() {
  console.log('🔧 Creating Missing User Permissions...\n');
  
  try {
    // 1. Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, name')
      .eq('name', 'Kyle Wade')
      .single();
    
    if (profileError) {
      console.log('❌ Could not find profile:', profileError);
      return;
    }
    
    console.log(`👤 Found profile: ${profile.name} (${profile.user_id})`);
    
    // 2. Check if permissions already exist
    const { data: existingPerms, error: checkError } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', profile.user_id)
      .single();
    
    if (!checkError && existingPerms) {
      console.log('✅ Permissions already exist!');
      console.log('   Permissions:', JSON.stringify(existingPerms, null, 2));
      return;
    }
    
    console.log('➡️  No permissions found, creating default permissions...');
    
    // 3. Create default permissions
    const defaultPermissions = {
      user_id: profile.user_id,
      dashboard: true,
      profile: true,
      meals: true,
      lists: true,
      work: false,
      projects: false,
      sports_ticker: false,
      financial_tracking: false,
      ai_features: false,
      household_management: true,  // Since Kyle is likely the household admin
      user_management: false,
      feature_management: false,
      billing_management: false,
      system_admin: false,
      global_feature_control: false,
      analytics_dashboard: false
    };
    
    const { data: newPerms, error: createError } = await supabase
      .from('user_permissions')
      .insert(defaultPermissions)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating permissions:', createError);
      return;
    }
    
    console.log('✅ Permissions created successfully!');
    console.log('   New permissions:', JSON.stringify(newPerms, null, 2));
    
    console.log('\n🎯 Profile page should now work without glitches!');
    console.log('   The user now has proper permissions for:');
    console.log('   - ✅ Dashboard access');
    console.log('   - ✅ Profile management');
    console.log('   - ✅ Meals and lists');
    console.log('   - ✅ Household management');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createMissingPermissions();