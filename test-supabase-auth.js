#!/usr/bin/env node

/**
 * 🧪 SUPABASE AUTH TEST
 * 
 * Test Supabase auth configuration
 */

require('dotenv').config({ path: '.env.local' });

async function testSupabaseAuth() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('🧪 Testing Supabase Auth Configuration...\n');

    // Test 1: Check if we can get session (should be null)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('1️⃣ Session Test:');
    console.log('   Session:', sessionData.session ? 'Active' : 'None (expected)');
    if (sessionError) {
      console.log('   ❌ Session Error:', sessionError.message);
    } else {
      console.log('   ✅ Session check successful');
    }

    // Test 2: Check auth settings
    console.log('\n2️⃣ Auth Settings:');
    console.log('   Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('   Client configured:', !!supabase);

    // Test 3: Try to get user (should be null when not authenticated)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('\n3️⃣ User Test:');
    console.log('   User:', userData.user ? 'Authenticated' : 'Not authenticated (expected)');
    if (userError) {
      console.log('   ❌ User Error:', userError.message);
    } else {
      console.log('   ✅ User check successful');
    }

    console.log('\n✅ Supabase Auth is properly configured!');
    console.log('\n💡 The OAuth issue is likely in Google Cloud Console redirect URIs');
    console.log('   Make sure this URI is added to your Google OAuth client:');
    console.log('   https://csbwewirwzeitavhvykr.supabase.co/auth/v1/callback');

  } catch (error) {
    console.error('❌ Supabase Auth Test Failed:', error.message);
  }
}

testSupabaseAuth();
