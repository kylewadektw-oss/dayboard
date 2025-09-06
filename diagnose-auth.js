#!/usr/bin/env node

console.log('🔍 Diagnosing Google OAuth Issues...\n');

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

console.log('📋 Environment Variables Check:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`${value ? '✅' : '❌'} ${envVar}: ${value ? 'Set' : 'Missing'}`);
});

console.log('\n🌐 URLs to Check:');
console.log('1. Supabase Auth Providers:');
console.log('   https://supabase.com/dashboard/project/csbwewirwzeitavhvykr/auth/providers');
console.log('\n2. Google Cloud Console:');
console.log('   https://console.cloud.google.com/apis/credentials');

console.log('\n🔧 Required Configurations:');
console.log('\n📍 Supabase (Enable Google Provider):');
console.log('   - Go to Authentication > Providers > Google');
console.log('   - Toggle ON the Google provider');
console.log('   - Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
console.log('   - Client Secret:', process.env.GOOGLE_CLIENT_SECRET);

console.log('\n📍 Google Console (Authorized Redirect URIs):');
console.log('   Add these redirect URIs:');
console.log('   - http://localhost:3000/auth/callback');
console.log('   - http://localhost:3001/auth/callback');
console.log('   - https://csbwewirwzeitavhvykr.supabase.co/auth/v1/callback');

console.log('\n🧪 Test Steps:');
console.log('1. Visit: http://localhost:3001/test-auth');
console.log('2. Click "Test Supabase Connection"');
console.log('3. Click "Test Google OAuth"');
console.log('4. Check browser console for errors');

console.log('\n⚠️  Common Issues:');
console.log('- Google provider not enabled in Supabase');
console.log('- Missing redirect URIs in Google Console');
console.log('- CSP blocking OAuth (check browser console)');
console.log('- Invalid Client ID/Secret');

console.log('\n🆘 If still not working:');
console.log('1. Check browser network tab for failed requests');
console.log('2. Check Supabase logs for auth errors');
console.log('3. Verify Google OAuth consent screen is published');
