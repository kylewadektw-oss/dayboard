#!/usr/bin/env node

/**
 * 🔄 LOGOUT ALL USERS SCRIPT
 *
 * This script helps clear authentication state for testing
 */

require('dotenv').config({ path: '.env.local' });

async function logoutAllUsers() {
  try {
    const { createClient } = require('@supabase/supabase-js');

    console.log('🔄 Logging out all users...\n');

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key for admin operations
    );

    // Get all users (admin operation)
    const { data: users, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }

    console.log(`📊 Found ${users.users.length} users in the system`);

    // Sign out all users
    for (const user of users.users) {
      console.log(`🔄 Signing out user: ${user.email || user.id}`);

      const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(
        user.id
      );

      if (signOutError) {
        console.log(
          `❌ Error signing out ${user.email || user.id}:`,
          signOutError.message
        );
      } else {
        console.log(`✅ Successfully signed out ${user.email || user.id}`);
      }
    }

    console.log('\n✅ All users have been signed out!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Clear your browser cache/cookies for localhost:3000');
    console.log('2. Refresh your application');
    console.log('3. Try signing in again with Google OAuth');
    console.log(
      '4. The fresh authentication should work with the fixed RLS policies'
    );
  } catch (error) {
    console.error('❌ Script Error:', error.message);
    console.log('\n💡 Alternative approach:');
    console.log('1. Clear browser cache/cookies manually');
    console.log('2. Open incognito/private browser window');
    console.log('3. Try signing in again');
  }
}

logoutAllUsers();
