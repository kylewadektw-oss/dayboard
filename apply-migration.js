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
const fs = require('fs');

const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM1ODc2MiwiZXhwIjoyMDcxOTM0NzYyfQ.9cYI_QLZEqI6HmTmhUKKmI0xeP37Xe1Jt5CJhQgOfF8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Reading migration file...');

  try {
    const migrationSQL = fs.readFileSync(
      './supabase/migrations/20250905000001_user_roles_system.sql',
      'utf8'
    );
    console.log('✅ Migration file loaded');

    console.log('Applying migration to remote database...');

    // Split SQL by statements and execute them one by one
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc('exec', { sql: statement });

        if (error) {
          if (
            error.message.includes('already exists') ||
            error.message.includes('duplicate')
          ) {
            console.log(
              `⚠️  Statement ${i + 1} - already exists (skipping):`,
              error.message
            );
          } else {
            console.log(`❌ Statement ${i + 1} failed:`, error.message);
            console.log('Statement was:', statement.substring(0, 100) + '...');
          }
        } else {
          console.log(`✅ Statement ${i + 1} - success`);
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} error:`, err.message);
      }
    }

    console.log('Migration complete! Testing tables...');

    // Test that the tables were created
    const tablesToTest = [
      'user_permissions',
      'household_features',
      'global_feature_toggles'
    ];

    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
  }
}

applyMigration().catch(console.error);
