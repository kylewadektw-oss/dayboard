#!/usr/bin/env node
/**
 * Automates Supabase type generation and normalizes file header.
 */
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

function run(cmd) {
  console.log('[types:update] $', cmd);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  // Generate into a temp file then post-process
  run(
    'npx supabase gen types typescript --local --schema public > types_db.new.ts'
  );
  let content = readFileSync('types_db.new.ts', 'utf8');

  // Basic normalization: ensure newline at eof
  if (!content.endsWith('\n')) content += '\n';

  // Replace file
  writeFileSync('types_db.ts', content, 'utf8');
  console.log('[types:update] types_db.ts updated');
  process.exit(0);
} catch (e) {
  console.error('[types:update] failed:', e.message);
  process.exit(1);
}
