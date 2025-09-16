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

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM1ODc2MiwiZXhwIjoyMDcxOTM0NzYyfQ.9cYI_QLZEqI6HmTmhUKKmI0xeP37Xe1Jt5CJhQgOfF8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseSchema() {
  console.log('Checking database schema...');

  try {
    // Check what tables exist in the public schema
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `
    });

    if (error) {
      console.log('❌ Error checking tables:', error.message);
    } else {
      console.log('✅ Tables in public schema:');
      data.forEach((row) => console.log(`  - ${row.table_name}`));
    }
  } catch (error) {
    console.log('❌ Schema check failed:', error.message);
  }
}

checkDatabaseSchema().catch(console.error);
