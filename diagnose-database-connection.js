/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/**
 * 🔧 DATABASE CONNECTION DIAGNOSTICS
 *
 * Tests Supabase database connectivity for both local and production environments.
 * Helps diagnose "Failed to fetch" errors in production deployments.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function diagnoseDatabaseConnection() {
  console.log('🔍 Starting Database Connection Diagnostics...\n');

  // Test environment variables
  console.log('📋 Environment Variables:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(
    `NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`
  );
  console.log(
    `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`
  );
  console.log(
    `SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`
  );

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.log(
      '\n❌ Missing required environment variables. Please check your .env configuration.'
    );
    return;
  }

  // Test Supabase client creation
  console.log('\n🔗 Testing Supabase Client:');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    console.log('✅ Supabase client created successfully');

    // Test basic connection
    console.log('\n🌐 Testing Database Connection:');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);

    if (connectionError) {
      console.log('❌ Database connection failed:', connectionError.message);
      console.log('Error details:', connectionError);
    } else {
      console.log('✅ Database connection successful');
    }

    // Test authentication
    console.log('\n🔐 Testing Authentication:');
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession();

    if (authError) {
      console.log('❌ Auth check failed:', authError.message);
    } else {
      console.log('✅ Authentication system accessible');
      console.log(
        `Session status: ${session ? 'Active' : 'No active session'}`
      );
    }

    // Test specific tables
    console.log('\n📊 Testing Table Access:');
    const tables = [
      'profiles',
      'application_logs',
      'households',
      'user_permissions'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Connection error -`, err.message);
      }
    }

    // Test with service role key
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('\n🔑 Testing Service Role Access:');
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: adminTest, error: adminError } = await adminSupabase
        .from('profiles')
        .select('count(*)')
        .limit(1);

      if (adminError) {
        console.log('❌ Service role access failed:', adminError.message);
      } else {
        console.log('✅ Service role access working');
      }
    }
  } catch (error) {
    console.log('❌ Failed to create Supabase client:', error.message);
    console.log('Full error:', error);
  }

  console.log('\n📝 Diagnostic Summary:');
  console.log('If you see "Failed to fetch" errors in production:');
  console.log('1. Check Vercel environment variables match local .env');
  console.log('2. Verify Supabase project is not paused');
  console.log('3. Check if Row Level Security (RLS) is blocking requests');
  console.log('4. Ensure API routes have proper CORS headers');
  console.log('5. Verify network connectivity between Vercel and Supabase');
}

// Run diagnostics
diagnoseDatabaseConnection().catch(console.error);
