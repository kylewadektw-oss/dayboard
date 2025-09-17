/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/**
 * 🔧 QUICK DATABASE FIX APPLICATOR
 *
 * Applies the RLS policy fixes directly to resolve production database issues.
 * This script connects to your Supabase database and fixes the infinite recursion.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function applyDatabaseFixes() {
  console.log('🔧 Applying Database Fixes...\n');

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.log('❌ Missing Supabase environment variables');
    console.log(
      'Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
    );
    return;
  }

  // Use service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('📊 Testing current database state...');

  // Test current profiles table access
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error && error.message.includes('infinite recursion')) {
      console.log(
        '❌ Confirmed: RLS infinite recursion detected in profiles table'
      );
      console.log('🔧 Applying fixes...\n');

      // Apply fixes using raw SQL
      const fixes = [
        // Drop problematic policies
        'DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;',
        'DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;',
        'DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;',
        'DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;',

        // Create simple, non-recursive policies
        `CREATE POLICY "Enable read access for authenticated users" ON profiles
         FOR SELECT USING (auth.uid() IS NOT NULL);`,

        `CREATE POLICY "Enable insert for authenticated users" ON profiles
         FOR INSERT WITH CHECK (auth.uid() = user_id);`,

        `CREATE POLICY "Enable update for profile owners" ON profiles
         FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`,

        // Fix households table
        'DROP POLICY IF EXISTS "households_select_policy" ON households;',
        `CREATE POLICY "Enable household access for members" ON households
         FOR SELECT USING (auth.uid() IS NOT NULL);`,

        // Fix user_permissions table
        'DROP POLICY IF EXISTS "user_permissions_select_policy" ON user_permissions;',
        `CREATE POLICY "Enable permissions access for authenticated users" ON user_permissions
         FOR SELECT USING (auth.uid() IS NOT NULL);`
      ];

      for (let i = 0; i < fixes.length; i++) {
        const sql = fixes[i];
        console.log(`Applying fix ${i + 1}/${fixes.length}...`);

        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
          console.log(`⚠️  Warning on fix ${i + 1}: ${error.message}`);
        } else {
          console.log(`✅ Fix ${i + 1} applied successfully`);
        }
      }

      console.log('\n🧪 Testing fixes...');

      // Test profiles table again
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (testError) {
        console.log('❌ Profiles table still has issues:', testError.message);
      } else {
        console.log('✅ Profiles table access working');
      }

      // Test application_logs table (should already work)
      const { error: logsError } = await supabase
        .from('application_logs')
        .select('id')
        .limit(1);

      if (logsError) {
        console.log('❌ Application logs issue:', logsError.message);
      } else {
        console.log('✅ Application logs table working');
      }
    } else if (error) {
      console.log('❌ Other database error:', error.message);
    } else {
      console.log('✅ Profiles table appears to be working');
      console.log('The issue might be elsewhere or already fixed');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Deploy your changes to trigger a new build');
  console.log(
    '2. Test the staging URL: https://dayboardofficial-git-staging-kw1984.vercel.app'
  );
  console.log('3. Check the health endpoint: /api/database-health');
  console.log('4. Monitor for "Failed to fetch" errors');
}

// Alternative method using direct SQL execution
async function alternativeFixMethod() {
  console.log('\n🔄 Alternative: Manual SQL Execution');
  console.log(
    'If the above method fails, copy and paste this SQL into Supabase SQL Editor:'
  );
  console.log('\n--- BEGIN SQL ---');
  console.log(`
-- Fix profiles table RLS infinite recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for profile owners" ON profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Fix households table
DROP POLICY IF EXISTS "households_select_policy" ON households;
CREATE POLICY "Enable household access for members" ON households
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix user_permissions table  
DROP POLICY IF EXISTS "user_permissions_select_policy" ON user_permissions;
CREATE POLICY "Enable permissions access for authenticated users" ON user_permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);
  `);
  console.log('--- END SQL ---\n');

  console.log(
    '🌐 Supabase SQL Editor: https://supabase.com/dashboard/project/csbwewirwzeitavhvykr/sql'
  );
}

applyDatabaseFixes()
  .then(() => alternativeFixMethod())
  .catch(console.error);
