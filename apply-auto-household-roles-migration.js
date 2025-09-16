/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Migration Runner: Auto Household Roles & Backfill
 * Applies migration 20250909000001_auto_household_roles.sql then performs safe backfill
 * for existing data (assign admin_id and profile roles where missing).
 *
 * NOTE: Relies on existing RPC function `exec(sql text)` (SQL execution helper) present in DB.
 * If `exec` is not installed, create it first:
 *   CREATE OR REPLACE FUNCTION exec(sql text) RETURNS void AS $$ BEGIN EXECUTE sql; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
 *   COMMENT ON FUNCTION exec(text) IS 'Arbitrary SQL execution for controlled migration scripts (service role only)';
 *
 * SECURITY: Uses service role key. Consider moving the key to environment variables (.env.local / process.env).
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM1ODc2MiwiZXhwIjoyMDcxOTM0NzYyfQ.9cYI_QLZEqI6HmTmhUKKmI0xeP37Xe1Jt5CJhQgOfF8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runStatement(sql, idxLabel) {
  try {
    const { error } = await supabase.rpc('exec', { sql });
    if (error) {
      const benign =
        /already exists|duplicate|does not exist|exists, skipping/i.test(
          error.message
        );
      if (benign) {
        console.log(`⚠️  ${idxLabel}: ${error.message}`);
      } else {
        console.log(`❌ ${idxLabel} FAILED: ${error.message}`);
      }
    } else {
      console.log(`✅ ${idxLabel}`);
    }
  } catch (e) {
    console.log(`❌ ${idxLabel} ERROR: ${e.message}`);
  }
}

async function applyMigration() {
  const filePath = path.join(
    __dirname,
    'supabase',
    'migrations',
    '20250909000001_auto_household_roles.sql'
  );
  console.log('📄 Loading migration:', filePath);
  const raw = fs.readFileSync(filePath, 'utf8');

  // Naive split on semicolon (avoid splitting inside $$ ... $$ blocks)
  const statements = [];
  let buffer = '';
  let inDollar = false;
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    // Track entry/exit of $$ blocks
    if (/\$\$/g.test(line)) {
      // Toggle for each occurrence (works for well-formed plpgsql bodies)
      const occurrences = (line.match(/\$\$/g) || []).length;
      for (let i = 0; i < occurrences; i++) inDollar = !inDollar;
    }
    buffer += line + '\n';
    if (!inDollar && /;\s*$/.test(line)) {
      const stmt = buffer.trim();
      buffer = '';
      if (stmt && !/^--/.test(stmt)) statements.push(stmt);
    }
  });
  const trimmedLast = buffer.trim();
  if (trimmedLast) statements.push(trimmedLast);

  console.log(`🚀 Executing ${statements.length} migration statements`);
  for (let i = 0; i < statements.length; i++) {
    await runStatement(
      statements[i],
      `Statement ${i + 1}/${statements.length}`
    );
  }
}

async function runBackfill() {
  console.log('\n🛠  Starting backfill (idempotent)');
  const backfillStatements = [
    // 1. Assign households.admin_id where missing
    `UPDATE households h
      SET admin_id = p.id, updated_at = now()
      FROM LATERAL (
        SELECT id FROM profiles WHERE household_id = h.id ORDER BY created_at LIMIT 1
      ) p
      WHERE h.admin_id IS NULL
      AND EXISTS (SELECT 1 FROM profiles WHERE household_id = h.id);`,
    // 2. Ensure admin profile has role admin (unless super_admin)
    `UPDATE profiles p
      SET role = 'admin'
      FROM households h
      WHERE p.id = h.admin_id
        AND (p.role IS NULL OR p.role NOT IN ('admin','super_admin'));`,
    // 3. Set remaining household-linked profiles to member where role missing/invalid
    `UPDATE profiles p
      SET role = 'member'
      WHERE p.household_id IS NOT NULL
        AND (p.role IS NULL OR p.role NOT IN ('admin','member','super_admin'));`,
    // 4. Logging notice (optional noop)
    `DO $$ BEGIN RAISE NOTICE 'Backfill complete (admin_id + profile.role normalization)'; END $$;`
  ];

  for (let i = 0; i < backfillStatements.length; i++) {
    await runStatement(
      backfillStatements[i],
      `Backfill ${i + 1}/${backfillStatements.length}`
    );
  }
}

async function verify() {
  console.log('\n🔍 Verification checks');
  const checks = [
    {
      label: 'Households with admin_id NULL (should be 0 if profiles exist)',
      sql: `SELECT COUNT(*) AS cnt FROM households h WHERE admin_id IS NULL AND EXISTS (SELECT 1 FROM profiles p WHERE p.household_id = h.id);`
    },
    {
      label: 'Profiles with NULL role but household_id set (should be 0)',
      sql: `SELECT COUNT(*) AS cnt FROM profiles WHERE household_id IS NOT NULL AND role IS NULL;`
    },
    {
      label: 'Profiles with invalid role',
      sql: `SELECT COUNT(*) AS cnt FROM profiles WHERE role IS NOT NULL AND role NOT IN ('super_admin','admin','member');`
    }
  ];

  for (const c of checks) {
    try {
      const { data, error } = await supabase.rpc('exec_select', { sql: c.sql });
      if (error) {
        console.log(`❌ ${c.label}: ${error.message}`);
      } else {
        console.log(`✅ ${c.label}:`, data);
      }
    } catch (e) {
      console.log(`❌ ${c.label}: ${e.message}`);
    }
  }

  console.log(
    '\nℹ️  If exec_select is not defined create it with:\nCREATE OR REPLACE FUNCTION exec_select(sql text) RETURNS json AS $$ DECLARE r json; BEGIN EXECUTE sql INTO r; RETURN r; END; $$ LANGUAGE plpgsql SECURITY DEFINER;'
  );
}

(async () => {
  console.log('=== Auto Household Roles Migration Runner ===');
  await applyMigration();
  await runBackfill();
  await verify();
  console.log('\n🎉 Done');
})();
