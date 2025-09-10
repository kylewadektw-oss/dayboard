#!/usr/bin/env node

// Debug Enhanced Settings System
// Run this to check what data is available

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSettings() {
  console.log('🔍 Debugging Enhanced Settings System...\n');

  try {
    // First, let's check what profiles exist
    console.log('1. Checking all profiles...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, name, role, household_id')
      .limit(10);

    if (allProfilesError) {
      console.log('❌ All profiles error:', allProfilesError.message);
      return;
    }

    console.log('✅ Profiles found:', allProfiles.length);
    allProfiles?.forEach(profile => {
      console.log(`   • ${profile.name || profile.id} - ID: ${profile.id} - Role: ${profile.role}`);
    });

    // Use the first super admin or admin profile we find
    const adminProfile = allProfiles?.find(p => p.role === 'super_admin') || allProfiles?.find(p => p.role === 'admin') || allProfiles?.[0];
    
    if (!adminProfile) {
      console.log('❌ No profiles found!');
      return;
    }

    const userID = adminProfile.id;
    console.log(`\n🎯 Using profile: ${adminProfile.name || adminProfile.id} (${userID})`);

    // Check settings tabs function
    console.log('\n2. Testing get_user_settings_tabs function...');
    const { data: tabs, error: tabsError } = await supabase.rpc('get_user_settings_tabs', {
      user_id_param: userID
    });

    if (tabsError) {
      console.log('❌ Tabs error:', tabsError.message);
    } else {
      console.log('✅ Tabs loaded:', tabs?.length || 0);
      tabs?.forEach(tab => {
        console.log(`   • ${tab.display_name} (${tab.category_key})`);
      });
    }

    // Check settings categories
    console.log('\n3. Checking settings categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('settings_categories')
      .select('*')
      .order('sort_order');

    if (categoriesError) {
      console.log('❌ Categories error:', categoriesError.message);
    } else {
      console.log('✅ Categories found:', categories?.length || 0);
      categories?.forEach(cat => {
        console.log(`   • ${cat.display_name} (${cat.category_key}) - Role: ${cat.required_role}`);
      });
    }

    // Check settings items
    console.log('\n4. Checking settings items...');
    const { data: items, error: itemsError } = await supabase
      .from('settings_items')
      .select('*')
      .order('category_key, sort_order');

    if (itemsError) {
      console.log('❌ Items error:', itemsError.message);
    } else {
      console.log('✅ Settings items found:', items?.length || 0);
      
      if (items && items.length > 0) {
        const itemsByCategory = items.reduce((acc, item) => {
          if (!acc[item.category_key]) acc[item.category_key] = [];
          acc[item.category_key].push(item);
          return acc;
        }, {});

        Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
          console.log(`\n   📂 ${category}:`);
          categoryItems.forEach(item => {
            console.log(`      • ${item.display_name} (${item.setting_key})`);
          });
        });
      }
    }

  } catch (err) {
    console.error('🔥 Fatal error:', err.message);
  }
}

debugSettings().catch(console.error);
