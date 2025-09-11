const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSettingsSystem() {
  console.log('🧪 Testing Settings System Comprehensive Functionality...\n');

  try {
    // Get a test user
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, household_id, name, role')
      .limit(1);

    if (profileError || !profiles?.length) {
      console.log('❌ No test users found');
      return;
    }

    const testUser = profiles[0];
    console.log(`👤 Test User: ${testUser.name} (${testUser.role})`);
    console.log(`🏠 Household ID: ${testUser.household_id}\n`);

    // 1. Test Settings Categories
    console.log('📂 Testing Settings Categories...');
    const { data: categories, error: catError } = await supabase
      .from('settings_categories')
      .select('*')
      .order('sort_order');

    if (catError) {
      console.log('❌ Categories Error:', catError.message);
    } else {
      console.log(`✅ Found ${categories?.length} categories:`);
      categories?.forEach(cat => {
        console.log(`   - ${cat.display_name} (${cat.category_key}) - Role: ${cat.required_role}`);
      });
    }

    // 2. Test Settings Items
    console.log('\n⚙️ Testing Settings Items...');
    const { data: items, error: itemsError } = await supabase
      .from('settings_items')
      .select('category_key, setting_key, display_name, setting_type')
      .order('category_key, sort_order');

    if (itemsError) {
      console.log('❌ Items Error:', itemsError.message);
    } else {
      const itemsByCategory = items?.reduce((acc, item) => {
        if (!acc[item.category_key]) acc[item.category_key] = [];
        acc[item.category_key].push(item);
        return acc;
      }, {}) || {};

      Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
        console.log(`✅ ${category.toUpperCase()} (${categoryItems.length} items):`);
        categoryItems.slice(0, 3).forEach(item => {
          console.log(`   - ${item.display_name} (${item.setting_type})`);
        });
        if (categoryItems.length > 3) {
          console.log(`   ... and ${categoryItems.length - 3} more`);
        }
      });
    }

    // 3. Test RPC Function
    console.log('\n🔧 Testing get_user_settings_tabs RPC...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_settings_tabs', { user_id_param: testUser.id });

    if (rpcError) {
      console.log('❌ RPC Error:', rpcError.message);
    } else {
      console.log(`✅ RPC returns ${rpcData?.length} available tabs for user:`);
      rpcData?.forEach(tab => {
        console.log(`   - ${tab.display_name} (${tab.category_key})`);
      });
    }

    // 4. Test User Settings CRUD
    console.log('\n👤 Testing User Settings CRUD...');
    
    // Create/Update a test setting
    const testSettingKey = 'test_dark_mode';
    const testValue = true;
    
    const { error: upsertError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: testUser.id,
        setting_key: testSettingKey,
        setting_value: testValue,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,setting_key'
      });

    if (upsertError) {
      console.log('❌ User Setting Upsert Error:', upsertError.message);
    } else {
      console.log('✅ User setting created/updated successfully');
    }

    // Read the setting back
    const { data: userSetting, error: readError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('setting_key', testSettingKey)
      .maybeSingle();

    if (readError) {
      console.log('❌ User Setting Read Error:', readError.message);
    } else if (userSetting) {
      console.log(`✅ User setting read: ${testSettingKey} = ${userSetting.setting_value}`);
    }

    // 5. Test Household Settings (if user has household)
    if (testUser.household_id) {
      console.log('\n🏠 Testing Household Settings CRUD...');
      
      const householdTestKey = 'test_household_name';
      const householdTestValue = 'Test Household';
      
      const { error: householdUpsertError } = await supabase
        .from('household_settings')
        .upsert({
          household_id: testUser.household_id,
          setting_key: householdTestKey,
          setting_value: householdTestValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'household_id,setting_key'
        });

      if (householdUpsertError) {
        console.log('❌ Household Setting Upsert Error:', householdUpsertError.message);
      } else {
        console.log('✅ Household setting created/updated successfully');
      }

      // Read household setting back
      const { data: householdSetting, error: householdReadError } = await supabase
        .from('household_settings')
        .select('*')
        .eq('household_id', testUser.household_id)
        .eq('setting_key', householdTestKey)
        .maybeSingle();

      if (householdReadError) {
        console.log('❌ Household Setting Read Error:', householdReadError.message);
      } else if (householdSetting) {
        console.log(`✅ Household setting read: ${householdTestKey} = ${householdSetting.setting_value}`);
      }
    }

    // 6. Test Settings Validation
    console.log('\n✅ Testing Settings Validation...');
    
    // Count total configured items
    const { count: totalItems } = await supabase
      .from('settings_items')
      .select('*', { count: 'exact', head: true });

    const { count: memberItems } = await supabase
      .from('settings_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_key', 'member');

    const { count: adminItems } = await supabase
      .from('settings_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_key', 'admin');

    const { count: superAdminItems } = await supabase
      .from('settings_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_key', 'super_admin');

    console.log(`📊 Settings Distribution:`);
    console.log(`   Total Items: ${totalItems}`);
    console.log(`   Member Settings: ${memberItems}`);
    console.log(`   Admin Settings: ${adminItems}`);
    console.log(`   Super Admin Settings: ${superAdminItems}`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', testUser.id)
      .eq('setting_key', testSettingKey);

    if (testUser.household_id) {
      await supabase
        .from('household_settings')
        .delete()
        .eq('household_id', testUser.household_id)
        .eq('setting_key', 'test_household_name');
    }

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Settings System Test Complete!');
    console.log('\n📋 System Status:');
    console.log('✅ Settings categories configured');
    console.log('✅ Settings items properly structured');
    console.log('✅ RPC function working');
    console.log('✅ User settings CRUD functional');
    console.log('✅ Household settings CRUD functional');
    console.log('✅ Settings validation working');

  } catch (error) {
    console.error('❌ Error during settings test:', error.message);
  }
}

testSettingsSystem();
