#!/usr/bin/env node
/**
 * Promote a user (by email) to super_admin role in profiles table.
 * Usage: node scripts/promote-super-admin.js user@example.com [--dry-run]
 * Requires env: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL
 */
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const email = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');
  if (!email || !email.includes('@')) {
    console.error(
      'Provide target email. Example: node scripts/promote-super-admin.js user@example.com'
    );
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.'
    );
    process.exit(1);
  }
  const supabase = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log(`🔍 Locating user by email: ${email}`);
  // There is no direct filter param in listUsers; small user base assumption.
  const { data: list, error: listError } =
    await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError);
    process.exit(1);
  }
  const user = list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (!user) {
    console.error('User not found.');
    process.exit(1);
  }
  console.log('✅ Found user id:', user.id);

  if (dryRun) {
    console.log('[DRY RUN] Would upsert profile with role super_admin');
    return;
  }

  // Upsert profile role
  console.log('⏫ Promoting to super_admin...');
  const upsertPayload = { id: user.id, role: 'super_admin' };
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'id' });
  if (upsertError) {
    console.error('Upsert failed:', upsertError);
    process.exit(1);
  }

  // Verify
  const { data: verify, error: verifyError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();
  if (verifyError) {
    console.error('Verification failed:', verifyError);
    process.exit(1);
  }
  if (verify.role === 'super_admin') {
    console.log('🎉 Success: User is now super_admin');
  } else {
    console.warn('Role not super_admin after upsert, current:', verify.role);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
