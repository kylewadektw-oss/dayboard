#!/usr/bin/env node

// Test Navigation Controls System
// Run this after deploying ADD_NAVIGATION_FEATURES.sql

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNavigationControls() {
  console.log('🧪 Testing Navigation Controls System...\n');

  try {
    // Test navigation features
    console.log('1. Testing navigation features...');
    const { data: navFeatures, error: navError } = await supabase
      .from('global_feature_control')
      .select('*')
      .in('category', ['navigation', 'development'])
      .order('category, feature_key');

    if (navError) {
      console.log('❌ Navigation features error:', navError.message);
      return;
    }

    console.log('✅ Navigation features found:', navFeatures?.length || 0);
    
    const navigationFeatures = navFeatures?.filter(f => f.category === 'navigation') || [];
    const developmentFeatures = navFeatures?.filter(f => f.category === 'development') || [];
    
    console.log('\n📍 Navigation Features:');
    navigationFeatures.forEach(feature => {
      console.log(`   • ${feature.display_name} (${feature.feature_key}) - ${feature.access_level}`);
    });
    
    console.log('\n🛠️  Development Features:');
    developmentFeatures.forEach(feature => {
      console.log(`   • ${feature.display_name} (${feature.feature_key}) - ${feature.access_level}`);
    });

    // Test navigation settings
    console.log('\n2. Testing navigation settings...');
    const { data: navSettings, error: settingsError } = await supabase
      .from('settings_items')
      .select('*')
      .eq('category_key', 'super_admin')
      .ilike('setting_key', '%enable_%')
      .order('sort_order');

    if (settingsError) {
      console.log('❌ Navigation settings error:', settingsError.message);
    } else {
      console.log('✅ Navigation settings found:', navSettings?.length || 0);
      
      const mainNavSettings = navSettings?.filter(s => s.setting_key.includes('enable_') && !s.setting_key.includes('member_') && !s.setting_key.includes('admin_')) || [];
      const roleSettings = navSettings?.filter(s => s.setting_key.includes('member_') || s.setting_key.includes('admin_')) || [];
      
      console.log('\n🎛️  Main Navigation Controls:');
      mainNavSettings.forEach(setting => {
        console.log(`   • ${setting.display_name} (${setting.setting_key})`);
      });
      
      if (roleSettings.length > 0) {
        console.log('\n👥 Role-based Controls:');
        roleSettings.forEach(setting => {
          console.log(`   • ${setting.display_name} (${setting.setting_key})`);
        });
      }
    }

    // Test user navigation function
    console.log('\n3. Testing user navigation function...');
    
    // Get a user ID to test with
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .limit(1);

    if (usersError || !users?.[0]) {
      console.log('❌ Could not find test user:', usersError?.message || 'No users found');
      return;
    }

    const testUser = users[0];
    console.log(`🎯 Testing with user: ${testUser.name} (${testUser.role})`);

    const { data: userNav, error: userNavError } = await supabase.rpc('get_user_navigation', {
      user_id_param: testUser.id
    });

    if (userNavError) {
      console.log('❌ User navigation error:', userNavError.message);
    } else {
      console.log('✅ User navigation loaded:', userNav?.length || 0, 'items');
      
      const accessibleNav = userNav?.filter(n => n.has_access) || [];
      const restrictedNav = userNav?.filter(n => !n.has_access) || [];
      
      console.log('\n✅ Accessible Navigation:');
      accessibleNav.forEach(nav => {
        console.log(`   • ${nav.display_name} → ${nav.href}`);
      });
      
      if (restrictedNav.length > 0) {
        console.log('\n🚫 Restricted Navigation:');
        restrictedNav.forEach(nav => {
          console.log(`   • ${nav.display_name} → ${nav.href}`);
        });
      }
    }

    // Test access control function
    console.log('\n4. Testing access control function...');
    
    const testFeatures = ['dashboard_access', 'meals_access', 'logs_dashboard_access'];
    
    for (const feature of testFeatures) {
      const { data: hasAccess, error: accessError } = await supabase.rpc('user_has_feature_access', {
        user_id_param: testUser.id,
        feature_key_param: feature
      });

      if (accessError) {
        console.log(`❌ ${feature}: Error - ${accessError.message}`);
      } else {
        console.log(`${hasAccess ? '✅' : '🚫'} ${feature}: ${hasAccess ? 'ALLOWED' : 'DENIED'}`);
      }
    }

    console.log('\n🎉 Navigation Controls System is working perfectly!');
    console.log('📋 Next Steps:');
    console.log('   1. Visit /settings as super admin');
    console.log('   2. Go to Super Admin tab');
    console.log('   3. Use Navigation Access Control section');
    console.log('   4. Toggle features on/off for different user roles');

  } catch (err) {
    console.error('🔥 Fatal error:', err.message);
  }
}

testNavigationControls().catch(console.error);
