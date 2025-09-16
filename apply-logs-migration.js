/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM1ODc2MiwiZXhwIjoyMDcxOTM0NzYyfQ.9cYI_QLZEqI6HmTmhUKKmI0xeP37Xe1Jt5CJhQgOfF8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableExists() {
  console.log('� Checking if application_logs table exists...');

  try {
    // Try to query the table to see if it exists
    const { data, error } = await supabase
      .from('application_logs')
      .select('id')
      .limit(1);

    if (error) {
      if (
        error.message.includes('relation "application_logs" does not exist')
      ) {
        console.log('❌ Table does not exist yet');
        return false;
      } else {
        console.log('❌ Error checking table:', error);
        return false;
      }
    } else {
      console.log('✅ Table already exists!');
      return true;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testTableAccess() {
  console.log('🧪 Testing table access...');

  try {
    // Try to insert a test log
    const { data, error } = await supabase
      .from('application_logs')
      .insert({
        session_id: 'test_session_' + Date.now(),
        level: 'info',
        message: 'Test log entry from migration script',
        component: 'MigrationScript',
        url: 'http://localhost:3000/test',
        user_agent: 'Migration Script'
      })
      .select();

    if (error) {
      console.log('❌ Error inserting test log:', error);
      return false;
    } else {
      console.log('✅ Successfully inserted test log:', data[0]?.id);

      // Clean up the test log
      if (data[0]?.id) {
        await supabase.from('application_logs').delete().eq('id', data[0].id);
        console.log('🧹 Cleaned up test log');
      }

      return true;
    }
  } catch (error) {
    console.log('❌ Error testing table:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Checking Supabase application_logs table status...');

  const tableExists = await checkTableExists();

  if (tableExists) {
    const accessWorks = await testTableAccess();
    if (accessWorks) {
      console.log('🎉 Application logs table is ready and working!');
      console.log('📝 Your logging system can now persist to the database');
    } else {
      console.log('⚠️ Table exists but access issues detected');
    }
  } else {
    console.log('📋 Table needs to be created manually in Supabase dashboard');
    console.log(
      '🔗 Visit: https://supabase.com/dashboard/project/csbwewirwzeitavhvykr/editor'
    );
    console.log(
      '💾 Run the SQL from: supabase/migrations/20250906001000_add_application_logs.sql'
    );
  }
}

main();
