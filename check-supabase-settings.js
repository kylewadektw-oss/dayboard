/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

// Check Supabase settings with service role key
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking Supabase Settings with Service Role\n');

async function checkWithServiceRole() {
  try {
    console.log('📡 Using service role to check auth settings...');

    // Try with service role key for admin access
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const settings = await response.json();
      console.log('✅ Settings retrieved with service role');

      if (settings.external) {
        console.log('\n📋 External providers:');
        Object.keys(settings.external).forEach((provider) => {
          const config = settings.external[provider];
          console.log(`   ${provider}:`);
          console.log(`     Enabled: ${config.enabled}`);
          console.log(
            `     Client ID: ${config.client_id ? 'Configured' : 'Missing'}`
          );
        });

        if (settings.external.google) {
          console.log('\n✅ Google provider configuration found!');
          console.log('   Enabled:', settings.external.google.enabled);
          console.log(
            '   Client ID:',
            settings.external.google.client_id ? 'Set' : 'Missing'
          );
        } else {
          console.log('\n❌ Google provider not found');
        }
      } else {
        console.log('❌ No external providers configured');
      }
    } else {
      console.log('❌ Could not retrieve settings');
      console.log('   Status:', response.status);
      console.log('   Status Text:', response.statusText);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkWithServiceRole().then(() => {
  console.log('\n🏁 Check complete');
});
