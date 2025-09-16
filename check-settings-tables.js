const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSettingsTables() {
  console.log('📊 Checking Settings Tables Structure...\n');

  try {
    // Check settings_categories
    const { data: categories, error: catError } = await supabase
      .from('settings_categories')
      .select('*')
      .order('sort_order');

    console.log('🗂️ Settings Categories:');
    if (catError) {
      console.log('❌ Error:', catError.message);
    } else {
      console.log(categories?.length ? categories : '📭 No categories found');
    }

    // Check settings_items
    const { data: items, error: itemError } = await supabase
      .from('settings_items')
      .select('*')
      .order('category_key, sort_order')
      .limit(10);

    console.log('\n⚙️ Settings Items (first 10):');
    if (itemError) {
      console.log('❌ Error:', itemError.message);
    } else {
      console.log(items?.length ? items : '📭 No items found');
    }

    // Check user_settings
    const { data: userSettings, error: userError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(5);

    console.log('\n👤 User Settings (first 5):');
    if (userError) {
      console.log('❌ Error:', userError.message);
    } else {
      console.log(
        userSettings?.length ? userSettings : '📭 No user settings found'
      );
    }

    // Check household_settings
    const { data: householdSettings, error: householdError } = await supabase
      .from('household_settings')
      .select('*')
      .limit(5);

    console.log('\n🏠 Household Settings (first 5):');
    if (householdError) {
      console.log('❌ Error:', householdError.message);
    } else {
      console.log(
        householdSettings?.length
          ? householdSettings
          : '📭 No household settings found'
      );
    }

    // Check the RPC function
    console.log('\n🔧 Testing get_user_settings_tabs function...');
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_user_settings_tabs',
      { user_id_param: 'test' }
    );

    if (rpcError) {
      console.log('❌ RPC Error:', rpcError.message);
    } else {
      console.log('✅ RPC function exists and works');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSettingsTables();
