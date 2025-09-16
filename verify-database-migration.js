#!/usr/bin/env node

// Verify Enhanced Permissions Database Migration
// Run this after executing DEPLOY_ENHANCED_PERMISSIONS.sql

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyMigration() {
  console.log('🔍 Verifying Enhanced Permissions Migration...\n');

  const checks = [
    {
      name: 'Global Feature Control Table',
      test: () =>
        supabase.from('global_feature_control').select('feature_key').limit(1)
    },
    {
      name: 'Settings Categories Table',
      test: () =>
        supabase.from('settings_categories').select('category_key').limit(1)
    },
    {
      name: 'Settings Items Table',
      test: () => supabase.from('settings_items').select('id').limit(1)
    },
    {
      name: 'User Settings Table',
      test: () => supabase.from('user_settings').select('id').limit(1)
    },
    {
      name: 'Household Settings Table',
      test: () => supabase.from('household_settings').select('id').limit(1)
    },
    {
      name: 'Household Feature Settings Table',
      test: () =>
        supabase.from('household_feature_settings').select('id').limit(1)
    },
    {
      name: 'User Feature Overrides Table',
      test: () => supabase.from('user_feature_overrides').select('id').limit(1)
    },
    {
      name: 'get_user_settings_tabs Function',
      test: () =>
        supabase.rpc('get_user_settings_tabs', {
          user_id_param: '0139a6fc-bf13-426d-8929-604051c4d1f4'
        })
    }
  ];

  let successCount = 0;
  let totalCount = checks.length;

  for (const check of checks) {
    try {
      const { data, error } = await check.test();
      if (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
      } else {
        console.log(`✅ ${check.name}: Available`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ ${check.name}: ${err.message}`);
    }
  }

  console.log(
    `\n📊 Migration Status: ${successCount}/${totalCount} components verified`
  );

  if (successCount === totalCount) {
    console.log('🎉 Enhanced Permissions System is fully deployed!');
    console.log('✨ You can now use the enhanced settings interface');
  } else {
    console.log(
      '⚠️  Some components are missing. Please run the SQL migration in Supabase Dashboard.'
    );
  }

  // Test data insertion
  if (successCount === totalCount) {
    console.log('\n🧪 Testing default data...');

    try {
      const { data: features } = await supabase
        .from('global_feature_control')
        .select('feature_key, display_name')
        .limit(3);

      console.log('📋 Sample Features:');
      features?.forEach((feature) => {
        console.log(`   • ${feature.display_name} (${feature.feature_key})`);
      });

      const { data: categories } = await supabase
        .from('settings_categories')
        .select('category_key, display_name')
        .order('sort_order');

      console.log('\n📂 Settings Categories:');
      categories?.forEach((cat) => {
        console.log(`   • ${cat.display_name} (${cat.category_key})`);
      });
    } catch (err) {
      console.log('⚠️  Data verification failed:', err.message);
    }
  }
}

verifyMigration().catch(console.error);
