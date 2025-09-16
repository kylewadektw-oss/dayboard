#!/usr/bin/env node

/**
 * 🔍 OAUTH DIAGNOSIS SCRIPT
 *
 * This script helps diagnose OAuth configuration issues
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 OAuth Configuration Diagnosis');
console.log('================================\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log(
  '- NEXT_PUBLIC_SUPABASE_URL:',
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined'
);
console.log(
  '- NEXT_PUBLIC_SUPABASE_ANON_KEY:',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : 'undefined'
);
console.log(
  '- NEXT_PUBLIC_GOOGLE_CLIENT_ID:',
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'undefined'
);
console.log(
  '- GOOGLE_CLIENT_SECRET:',
  process.env.GOOGLE_CLIENT_SECRET ? '[SET]' : 'undefined'
);
console.log(
  '- NEXT_PUBLIC_SITE_URL:',
  process.env.NEXT_PUBLIC_SITE_URL || 'undefined'
);

console.log('\n🔗 Expected OAuth URLs:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  console.log('- Supabase OAuth Callback:', `${supabaseUrl}/auth/v1/callback`);
  console.log('- Local OAuth Callback:', 'http://localhost:3000/auth/callback');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL not set');
}

console.log('\n🎯 Google Cloud Console Configuration Required:');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log(
  '2. Find OAuth 2.0 Client ID:',
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '[NOT SET]'
);
console.log('3. Add these Authorized redirect URIs:');
if (supabaseUrl) {
  console.log(`   - ${supabaseUrl}/auth/v1/callback`);
}
console.log('   - http://localhost:3000/auth/callback');

console.log('\n🎯 Supabase Dashboard Configuration Required:');
console.log(
  '1. Go to: https://supabase.com/dashboard/project/[your-project]/auth/providers'
);
console.log('2. Enable Google provider');
console.log(
  '3. Add Client ID:',
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '[NOT SET]'
);
console.log(
  '4. Add Client Secret:',
  process.env.GOOGLE_CLIENT_SECRET ? '[SET]' : '[NOT SET]'
);

// Test Supabase connection
console.log('\n🧪 Testing Supabase Connection...');
try {
  const { createClient } = require('@supabase/supabase-js');

  if (!supabaseUrl || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('❌ Missing Supabase credentials');
  } else {
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    console.log('✅ Supabase client created successfully');

    // Test the auth endpoint
    console.log('🔗 Testing auth endpoint availability...');
    // Note: We can't actually test the OAuth flow from Node.js, but we can verify the client setup
  }
} catch (error) {
  console.log('❌ Supabase connection error:', error.message);
}

console.log('\n💡 Common Issues & Solutions:');
console.log(
  '1. "invalid_client" = Redirect URI mismatch in Google Cloud Console'
);
console.log('2. "unauthorized_client" = Client ID/Secret mismatch in Supabase');
console.log('3. "access_denied" = User denied permission or app not verified');
console.log(
  '4. "redirect_uri_mismatch" = URI not added to Google Cloud Console'
);

console.log('\n🚀 Next Steps:');
console.log('1. Verify Google Cloud Console redirect URIs');
console.log('2. Check Supabase Auth Provider settings');
console.log('3. Try OAuth flow again');
console.log('4. Check browser console for detailed error logs');
