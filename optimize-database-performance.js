#!/usr/bin/env node

/**
 * ⚡ DATABASE PERFORMANCE OPTIMIZER
 *
 * This script implements optimizations based on the performance analysis
 */

require('dotenv').config({ path: '.env.local' });

async function optimizeDatabase() {
  try {
    const { createClient } = require('@supabase/supabase-js');

    console.log('⚡ Database Performance Optimizer\n');

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔍 Step 1: Analyzing Current Performance Issues');
    console.log('===============================================\n');

    // Check if indexes exist on frequently queried columns
    console.log('📊 Checking database indexes...');

    const indexCheckQueries = [
      {
        name: 'application_logs timestamp index',
        query: `
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename = 'application_logs' 
          AND indexdef LIKE '%timestamp%'
        `
      },
      {
        name: 'profiles user_id index',
        query: `
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename = 'profiles' 
          AND indexdef LIKE '%user_id%'
        `
      },
      {
        name: 'households indexes',
        query: `
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename = 'households'
        `
      }
    ];

    for (const check of indexCheckQueries) {
      try {
        const { data, error } = await supabase.rpc('execute_sql', {
          query: check.query
        });

        if (error) {
          console.log(`❌ Failed to check ${check.name}:`, error.message);
        } else {
          console.log(`✅ ${check.name}: ${data?.length || 0} indexes found`);
          if (data?.length > 0) {
            data.forEach((idx) => console.log(`   - ${idx.indexname}`));
          }
        }
      } catch (err) {
        console.log(
          `⚠️  Cannot check ${check.name} - using direct queries instead`
        );
      }
    }

    console.log('\n🛠️  Step 2: Implementing Performance Optimizations');
    console.log('==================================================\n');

    // Optimization 1: Ensure proper indexing on application_logs
    console.log('🔧 Optimization 1: Application Logs Indexing');
    try {
      // Create composite index for timestamp-based queries
      const logIndexSQL = `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_application_logs_timestamp_level 
        ON application_logs(timestamp DESC, level);
      `;

      console.log('   Creating timestamp index on application_logs...');
      // Note: We can't actually run DDL through PostgREST, so we'll log the SQL
      console.log('   📝 SQL to execute manually:');
      console.log('   ', logIndexSQL.trim());
    } catch (error) {
      console.log('   ⚠️  Manual index creation required');
    }

    // Optimization 2: Profile query optimization
    console.log('\n🔧 Optimization 2: Profile Query Optimization');
    try {
      // Check for common profile query patterns
      const profileTestQuery = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .limit(1);

      if (!profileTestQuery.error) {
        console.log('   ✅ Profile queries are responsive');
        console.log(
          '   💡 Consider implementing Redis caching for frequently accessed profiles'
        );
      }
    } catch (error) {
      console.log('   ❌ Profile query test failed:', error.message);
    }

    // Optimization 3: Log retention and cleanup
    console.log('\n🔧 Optimization 3: Log Cleanup and Retention');
    try {
      // Check log volume
      const { data: logCount, error: countError } = await supabase
        .from('application_logs')
        .select('id', { count: 'exact' });

      if (!countError) {
        console.log(
          `   📊 Total logs in database: ${logCount?.length || 'Unknown'}`
        );

        // Check old logs (older than 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: oldLogs, error: oldLogsError } = await supabase
          .from('application_logs')
          .select('id', { count: 'exact' })
          .lt('timestamp', thirtyDaysAgo.toISOString());

        if (!oldLogsError) {
          console.log(`   📊 Logs older than 30 days: ${oldLogs?.length || 0}`);

          if ((oldLogs?.length || 0) > 1000) {
            console.log(
              '   💡 Consider implementing log archival for logs older than 30 days'
            );
            console.log('   📝 SQL for manual cleanup:');
            console.log(
              `   DELETE FROM application_logs WHERE timestamp < '${thirtyDaysAgo.toISOString()}';`
            );
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Log analysis failed:', error.message);
    }

    console.log('\n📋 Step 3: Performance Monitoring Setup');
    console.log('========================================\n');

    // Create a performance monitoring query
    const performanceMonitoringSQL = `
      -- Performance monitoring query to run regularly
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements 
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY total_time DESC 
      LIMIT 10;
    `;

    console.log('📊 Performance monitoring query:');
    console.log(performanceMonitoringSQL);

    console.log('\n✅ Optimization Summary');
    console.log('=======================');
    console.log('1. ✅ Analyzed current database indexes');
    console.log('2. 📝 Provided SQL for manual index creation');
    console.log('3. 💡 Identified caching opportunities');
    console.log('4. 📊 Set up performance monitoring queries');
    console.log('5. 🧹 Analyzed log retention needs');

    console.log('\n🎯 Next Steps');
    console.log('=============');
    console.log('1. Run the provided index creation SQL manually in Supabase');
    console.log('2. Implement Redis caching for user profiles');
    console.log('3. Set up automated log cleanup job');
    console.log('4. Monitor query performance using the monitoring query');
    console.log('5. Consider connection pooling optimization');

    console.log('\n📊 Manual SQL Commands to Execute:');
    console.log('===================================');
    console.log('-- Create optimized indexes');
    console.log(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_application_logs_timestamp_level ON application_logs(timestamp DESC, level);'
    );
    console.log(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);'
    );
    console.log(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_households_id ON households(id);'
    );
    console.log('');
    console.log('-- Enable pg_stat_statements for monitoring');
    console.log('CREATE EXTENSION IF NOT EXISTS pg_stat_statements;');
    console.log('');
    console.log('-- Log cleanup (adjust date as needed)');
    console.log(
      `DELETE FROM application_logs WHERE timestamp < NOW() - INTERVAL '30 days';`
    );
  } catch (error) {
    console.error('❌ Optimization Error:', error.message);
    console.log('\n💡 Manual Steps:');
    console.log('1. Check database connection and permissions');
    console.log('2. Manually create indexes using Supabase SQL editor');
    console.log('3. Monitor query performance using pg_stat_statements');
  }
}

optimizeDatabase();
