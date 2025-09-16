#!/usr/bin/env node

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Grant Super Admin Status Script
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const TARGET_USER_ID = '0139a6fc-bf13-426d-8929-604051c4d1f4';

async function grantSuperAdminStatus() {
  console.log('👑 Granting Super Admin Status');
  console.log('===============================\n');

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nPlease set these in your .env.local file.');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log(`🔍 Looking for user: ${TARGET_USER_ID}`);

    // First, check if the user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, user_id, name, preferred_name, role, household_id')
      .eq('user_id', TARGET_USER_ID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (!existingUser) {
      console.log('⚠️  User not found in profiles table.');
      console.log('   This might be because:');
      console.log("   1. The user hasn't logged in yet");
      console.log('   2. The user_id is incorrect');
      console.log("   3. The profile wasn't created properly");

      // Try to find any users with similar IDs
      const { data: similarUsers } = await supabase
        .from('profiles')
        .select('user_id, name, preferred_name, role')
        .ilike('user_id', `%${TARGET_USER_ID.slice(-8)}%`);

      if (similarUsers && similarUsers.length > 0) {
        console.log('\n🔍 Found similar user IDs:');
        similarUsers.forEach((user) => {
          console.log(
            `   - ${user.user_id} (${user.name || user.preferred_name || 'No name'}) - Role: ${user.role}`
          );
        });
      }

      return;
    }

    console.log('✅ User found:');
    console.log(
      `   Name: ${existingUser.name || existingUser.preferred_name || 'No name'}`
    );
    console.log(`   Current Role: ${existingUser.role}`);
    console.log(`   Household ID: ${existingUser.household_id || 'None'}`);

    if (existingUser.role === 'super_admin') {
      console.log('\n🎉 User already has super_admin role! No update needed.');
      return;
    }

    console.log('\n🔄 Updating user role to super_admin...');

    // Update the user's role to super_admin
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'super_admin',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', TARGET_USER_ID)
      .select('id, user_id, name, preferred_name, role, household_id')
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Successfully updated user role!');
    console.log('\n📋 Updated user details:');
    console.log(
      `   Name: ${updatedUser.name || updatedUser.preferred_name || 'No name'}`
    );
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`   User ID: ${updatedUser.user_id}`);
    console.log(`   Profile ID: ${updatedUser.id}`);

    console.log('\n🎯 Super Admin Capabilities:');
    console.log('   • Global feature control');
    console.log('   • System-wide settings management');
    console.log('   • Full access to all permission levels');
    console.log('   • Can deploy enhanced permissions system');

    console.log('\n👑 Super Admin status granted successfully!');
  } catch (error) {
    console.error('❌ Error granting super admin status:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  grantSuperAdminStatus();
}

module.exports = { grantSuperAdminStatus };
