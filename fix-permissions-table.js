#!/usr/bin/env node

/*
 * 🔧 Fix User Permissions Table Issue
 * Investigates and fixes the foreign key constraint problem
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPermissionsTableIssue() {
  console.log('🔍 Investigating User Permissions Table Issue...\n');
  
  try {
    // 1. Check profiles table
    console.log('1️⃣ Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, name')
      .limit(3);
    
    if (profileError) {
      console.log('❌ Profile query error:', profileError);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles`);
    profiles.forEach(profile => {
      console.log(`   👤 ${profile.name}: id=${profile.id}, user_id=${profile.user_id}`);
    });
    
    // 2. Check user_permissions table structure
    console.log('\n2️⃣ Checking user_permissions table...');
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select('*')
      .limit(3);
    
    if (permError) {
      console.log('❌ Permissions query error:', permError);
      
      // Try to understand the table structure
      console.log('\n3️⃣ Trying to understand table structure...');
      const { error: structureError } = await supabase
        .from('user_permissions')
        .select('id')
        .limit(1);
      
      if (structureError) {
        console.log('❌ Table structure error:', structureError);
        console.log('\n🎯 The user_permissions table might need to be created or the foreign key constraint is referencing profile.id instead of profile.user_id');
      }
    } else {
      console.log(`✅ Found ${permissions.length} permission records`);
      if (permissions.length > 0) {
        console.log('   Sample permission structure:', Object.keys(permissions[0]));
      }
    }
    
    // 3. Try creating permissions with profile.id instead of user_id
    console.log('\n4️⃣ Trying to create permissions with profile.id...');
    const kyleProfile = profiles.find(p => p.name === 'Kyle Wade');
    
    if (kyleProfile) {
      console.log(`   Attempting with profile.id: ${kyleProfile.id}`);
      
      const defaultPermissions = {
        user_id: kyleProfile.id,  // Using profile.id instead of user_id
        dashboard: true,
        profile: true,
        meals: true,
        lists: true,
        work: false,
        projects: false,
        sports_ticker: false,
        financial_tracking: false,
        ai_features: false,
        household_management: true,
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
        console.log('❌ Still error with profile.id:', createError);
        
        // 4. Let's try just inserting with a different approach
        console.log('\n5️⃣ Trying alternative approach...');
        
        // Check if there's already a permissions record
        const { data: existingByProfileId } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', kyleProfile.id)
          .single();
        
        if (existingByProfileId) {
          console.log('✅ Permissions already exist with profile.id!');
          console.log('   Existing permissions:', JSON.stringify(existingByProfileId, null, 2));
        } else {
          console.log('❌ No existing permissions found with either approach');
          console.log('\n🎯 The user_permissions table may need to be recreated or have its foreign key constraint updated');
        }
      } else {
        console.log('✅ Permissions created successfully with profile.id!');
        console.log('   New permissions:', JSON.stringify(newPerms, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

fixPermissionsTableIssue();