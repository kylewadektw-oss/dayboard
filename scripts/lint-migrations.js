#!/usr/bin/env node
/**
 * Lints migration files for idempotency patterns (ENUM create, column add, index create).
 */
const { readdirSync, readFileSync } = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations');
let failed = false;

function warn(msg){
  console.warn('\u001b[33m[migrations:lint] ' + msg + '\u001b[0m');
}
function error(msg){
  failed = true; console.error('\u001b[31m[migrations:lint] ' + msg + '\u001b[0m');
}

try {
  const files = readdirSync(MIGRATIONS_DIR).filter(f=>f.endsWith('.sql'));
  for (const file of files) {
    const full = path.join(MIGRATIONS_DIR, file);
    const sql = readFileSync(full,'utf8');

    // ENUM creation should be guarded
    if (/create\s+type\s+"?[a-z0-9_]+"?\s+as\s+enum/i.test(sql) && !/if not exists/i.test(sql)) {
      warn(`${file}: enum creation missing IF NOT EXISTS guard (wrap in DO $$ or add conditional check).`);
    }
    // Column add should use IF NOT EXISTS
    if (/alter\s+table/i.test(sql) && /add\s+column/i.test(sql) && !/if\s+not\s+exists/i.test(sql)) {
      warn(`${file}: column add missing IF NOT EXISTS safeguard.`);
    }
    // Index creation
    if (/create\s+index/i.test(sql) && !/if\s+not\s+exists/i.test(sql)) {
      warn(`${file}: index creation missing IF NOT EXISTS.`);
    }
    // Look for direct DROP without IF EXISTS
    if (/drop\s+type/i.test(sql) && !/if\s+exists/i.test(sql)) {
      warn(`${file}: DROP TYPE missing IF EXISTS.`);
    }
    // Encourage transactional block unless using CONCURRENTLY
    if (!/begin;|commit;/i.test(sql) && !/concurrently/i.test(sql)) {
      warn(`${file}: consider wrapping statements in a transaction.`);
    }
  }
} catch (e) {
  error(e.message);
}

if (failed) process.exit(1);
