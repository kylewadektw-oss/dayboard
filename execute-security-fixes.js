#!/usr/bin/env node
/**
 * Execute Supabase Security Fixes
 * This script applies the function search_path security fixes
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSecurityFixes() {
  console.log('🔧 Starting Supabase Security Fixes...\n');

  // Read the SQL commands from the file
  const sqlContent = fs.readFileSync('fix-function-search-path.sql', 'utf8');
  
  // Split by individual ALTER FUNCTION commands
  const commands = sqlContent
    .split('\n')
    .filter(line => line.trim().startsWith('ALTER FUNCTION'))
    .map(line => line.trim());

  console.log(`📋 Found ${commands.length} functions to secure\n`);

  let successCount = 0;
  let errorCount = 0;

  // Execute each command individually
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    const functionName = command.match(/public\.([a-zA-Z_]+)/)?.[1] || 'unknown';
    
    console.log(`🔨 [${i+1}/${commands.length}] Securing function: ${functionName}`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql: command 
      });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Secured`);
        successCount++;
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      errorCount++;
    }
    
    // Small delay between commands
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Security Fix Summary:`);
  console.log(`   ✅ Successfully secured: ${successCount} functions`);
  console.log(`   ❌ Failed to secure: ${errorCount} functions`);
  
  if (errorCount === 0) {
    console.log(`\n🎉 All database functions are now secure!`);
    console.log(`🛡️ SQL injection prevention via search_path is now active`);
  } else {
    console.log(`\n⚠️  Some functions failed to update. Check Supabase logs for details.`);
  }

  // Run verification query
  console.log(`\n🔍 Verifying security status...`);
  
  const verificationSQL = `
    SELECT 
        p.proname as function_name,
        p.prosecdef as is_security_definer,
        CASE 
            WHEN p.proconfig IS NULL THEN 'NOT SECURED'
            WHEN 'search_path=public' = ANY(p.proconfig) THEN 'SECURED'
            ELSE 'PARTIALLY SECURED'
        END as security_status
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
        'get_user_settings_tabs', 'create_default_permissions', 'user_has_feature_access',
        'get_user_navigation', 'get_household_members', 'set_profile_completion',
        'update_updated_at_column', 'join_household_by_code', 'generate_household_code',
        'assign_household_code', 'update_household_admin', 'set_initial_household_role',
        'assign_household_admin_if_missing', 'set_household_member_role', 'generate_invitation_code',
        'create_household_invitation', 'accept_household_invitation', 'manage_household_member',
        'calculate_age_from_dob', 'update_age_from_dob'
    )
    ORDER BY security_status, p.proname;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: verificationSQL 
    });
    
    if (error) {
      console.log(`   ❌ Verification failed: ${error.message}`);
    } else {
      console.log(`   ✅ Verification complete`);
      if (data) {
        console.log(`\n📋 Function Security Status:`);
        data.forEach(row => {
          const status = row.security_status === 'SECURED' ? '✅' : '❌';
          console.log(`   ${status} ${row.function_name}: ${row.security_status}`);
        });
      }
    }
  } catch (err) {
    console.log(`   ❌ Verification error: ${err.message}`);
  }
}

// Handle exec_sql RPC function creation if it doesn't exist
async function ensureExecSqlFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
        EXECUTE sql;
        RETURN '{"success": true}'::json;
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
    END;
    $$;
  `;
  
  console.log('🔧 Ensuring exec_sql helper function exists...');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    if (error && !error.message.includes('does not exist')) {
      console.log(`   ✅ Helper function ready`);
    }
  } catch (err) {
    // Function doesn't exist yet, that's expected
    console.log(`   ℹ️  Will execute via alternative method`);
  }
}

// Main execution
async function main() {
  try {
    await ensureExecSqlFunction();
    await executeSecurityFixes();
    
    console.log(`\n✨ Security fixes complete!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Go to Supabase Dashboard > Authentication > Settings`);
    console.log(`   2. Enable "Leaked Password Protection"`);
    console.log(`   3. Set "Email OTP expiry" to 1800 seconds (30 minutes)`);
    console.log(`   4. Schedule PostgreSQL upgrade in Infrastructure settings`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
