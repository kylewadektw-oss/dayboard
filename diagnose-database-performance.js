#!/usr/bin/env node

/**
 * 🔍 DATABASE PERFORMANCE DIAGNOSTIC
 *
 * This script helps diagnose database performance issues
 * identified in the query statistics analysis
 */

require('dotenv').config({ path: '.env.local' });

async function runPerformanceDiagnostics() {
  try {
    const { createClient } = require('@supabase/supabase-js');

    console.log('🔍 Running Database Performance Diagnostics...\n');

    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Create regular client for comparison
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test 1: Basic Connection Test
    console.log('📊 Test 1: Basic Connection Test');
    console.log('==================================');

    const connectionStartTime = Date.now();
    const { data: basicTest, error: basicError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const connectionDuration = Date.now() - connectionStartTime;
    console.log(`⏱️  Basic connection test took: ${connectionDuration}ms`);

    if (basicError) {
      console.log('❌ Basic connection failed:', basicError.message);
      return; // Exit early if basic connection fails
    } else {
      console.log('✅ Basic connection successful');
    }

    // Test 2: Profile Query Performance
    console.log('\n📊 Test 2: Profile Query Performance');
    console.log('=====================================');

    const profileStartTime = Date.now();
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);

    const profileDuration = Date.now() - profileStartTime;
    console.log(`⏱️  Profile query took: ${profileDuration}ms`);

    if (profileError) {
      console.log('❌ Profile query failed:', profileError.message);
    } else {
      console.log(`✅ Retrieved ${profiles?.length || 0} profiles`);
    }

    // Test 3: Logging Query Performance
    console.log('\n📊 Test 3: Application Logs Query Performance');
    console.log('===============================================');

    const logsStartTime = Date.now();
    const { data: logs, error: logsError } = await supabase
      .from('application_logs')
      .select('id, timestamp, level, message')
      .order('timestamp', { ascending: false })
      .limit(100);

    const logsDuration = Date.now() - logsStartTime;
    console.log(`⏱️  Logs query took: ${logsDuration}ms`);

    if (logsError) {
      console.log('❌ Logs query failed:', logsError.message);
    } else {
      console.log(`✅ Retrieved ${logs?.length || 0} log entries`);
    }

    // Test 5: Admin vs Regular Client Performance
    console.log('\n📊 Test 5: Admin vs Regular Client Performance');
    console.log('===============================================');

    // Test with admin client
    const adminStartTime = Date.now();
    const { data: adminProfiles, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id')
      .limit(5);
    const adminDuration = Date.now() - adminStartTime;

    console.log(`⏱️  Admin client query took: ${adminDuration}ms`);
    if (adminError) {
      console.log('❌ Admin query failed:', adminError.message);
    } else {
      console.log(`✅ Admin retrieved ${adminProfiles?.length || 0} profiles`);
    }

    // Test with regular client
    const regularStartTime = Date.now();
    const { data: regularProfiles, error: regularError } = await supabase
      .from('profiles')
      .select('id, user_id')
      .limit(5);
    const regularDuration = Date.now() - regularStartTime;

    console.log(`⏱️  Regular client query took: ${regularDuration}ms`);
    if (regularError) {
      console.log('❌ Regular query failed:', regularError.message);
    } else {
      console.log(
        `✅ Regular retrieved ${regularProfiles?.length || 0} profiles`
      );
    }

    // Performance Summary
    console.log('\n📋 Performance Summary');
    console.log('======================');
    console.log(`Connection test: ${connectionDuration}ms (target: <100ms)`);
    console.log(`Profile query: ${profileDuration}ms (target: <50ms)`);
    console.log(`Logs query: ${logsDuration}ms (target: <100ms)`);

    // Recommendations
    console.log('\n💡 Recommendations Based on Your Performance Data');
    console.log('==================================================');

    console.log('\n🚨 Critical Issues from Performance Analysis:');
    console.log('• Timezone queries taking 311ms average (should be <1ms)');
    console.log('• 771,051 profile queries executed - very high frequency');
    console.log('• Schema introspection taking 185ms average');
    console.log('• 16,443 log queries with 2.3ms average');

    if (connectionDuration > 100) {
      console.log('\n⚠️  Current connection latency is higher than expected');
      console.log('   → Check network connectivity to Supabase');
      console.log('   → Consider connection pooling optimization');
    }

    if (profileDuration > 50) {
      console.log('\n⚠️  Profile queries are slower than expected');
      console.log('   → CRITICAL: Implement Redis caching for user profiles');
      console.log('   → Add indexes on frequently queried columns');
      console.log(
        '   → Consider connection pooling for high-frequency queries'
      );
    }

    if (logsDuration > 100) {
      console.log('\n⚠️  Log queries are slower than expected');
      console.log('   → Ensure proper indexing on timestamp column');
      console.log('   → Consider log table partitioning');
      console.log('   → Implement log retention policy');
    }

    console.log('\n🎯 Priority Action Items:');
    console.log('1. 🔥 URGENT: Investigate timezone query performance issue');
    console.log(
      '2. 🔥 HIGH: Implement profile caching (771k queries is excessive)'
    );
    console.log('3. 📊 MEDIUM: Add database indexes for log queries');
    console.log('4. 🧹 LOW: Implement log cleanup for old entries');

    console.log('\n📈 Performance Targets:');
    console.log('• Timezone queries: <1ms (currently 311ms)');
    console.log('• Profile queries: <10ms with caching (currently varies)');
    console.log('• Log queries: <50ms (currently 2-3ms - good)');
    console.log('• Schema queries: <50ms (currently 185ms)');

    console.log('\n✅ Diagnostic complete!');
  } catch (error) {
    console.error('❌ Diagnostic Error:', error.message);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check environment variables are set correctly');
    console.log('2. Verify Supabase connection and service role key');
    console.log('3. Ensure database is accessible from your network');
    console.log('4. Check for any ongoing database maintenance');
  }
}

// Helper function to format duration
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

runPerformanceDiagnostics();
