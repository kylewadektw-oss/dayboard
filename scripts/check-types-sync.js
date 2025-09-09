#!/usr/bin/env node
/**
 * Checks if generated Supabase types are in sync. Fails with non-zero exit if drift detected.
 */
const { execSync } = require('child_process');
const { readFileSync, writeFileSync, unlinkSync } = require('fs');
const { createHash } = require('crypto');

function hash(data){
  return createHash('sha256').update(data).digest('hex');
}

try {
  execSync('npx supabase gen types typescript --local --schema public > types_db.check.tmp.ts', { stdio: 'inherit' });
  const current = readFileSync('types_db.ts','utf8');
  const fresh = readFileSync('types_db.check.tmp.ts','utf8');
  unlinkSync('types_db.check.tmp.ts');

  if (hash(current) !== hash(fresh)) {
    console.error('\n[types:check] Drift detected between committed types_db.ts and freshly generated types.');
    console.error('[types:check] Run: npm run types:update');
    process.exit(2);
  }
  console.log('[types:check] Supabase types in sync.');
} catch (e) {
  console.error('[types:check] Failed to verify types:', e.message);
  process.exit(1);
}
