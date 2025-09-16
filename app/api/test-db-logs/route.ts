/*
 * Test API endpoint to check if logs database is working
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing database connection and logs table...');

    const supabase = await createClient();

    // Test 1: Check if application_logs table exists and get count
    console.log('📋 Checking application_logs table...');
    const {
      data: logs,
      error: selectError,
      count
    } = await supabase
      .from('application_logs')
      .select('id, message, timestamp', { count: 'exact' })
      .limit(5)
      .order('timestamp', { ascending: false });

    if (selectError) {
      console.error('❌ Table query failed:', selectError.message);
      return NextResponse.json({
        success: false,
        error: 'Table query failed: ' + selectError.message,
        tableExists: false
      });
    }

    console.log(`✅ application_logs table exists with ${count} total logs`);
    console.log('📋 Recent logs:', logs?.slice(0, 2));

    // Test 2: Try to insert a test log
    console.log('🧪 Inserting test log entry...');
    const { data: insertData, error: insertError } = await supabase
      .from('application_logs')
      .insert({
        user_id: 'db-test',
        session_id: 'db-test-session',
        level: 'info',
        message: '🧪 Database connectivity test - ' + new Date().toISOString(),
        component: 'DatabaseTest',
        timestamp: new Date().toISOString(),
        side: 'server'
      })
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return NextResponse.json({
        success: false,
        error: 'Insert failed: ' + insertError.message,
        tableExists: true,
        currentCount: count,
        recentLogs: logs
      });
    }

    console.log('✅ Test log inserted successfully');

    return NextResponse.json({
      success: true,
      message: 'Database logging is working correctly',
      tableExists: true,
      currentCount: count,
      recentLogs: logs,
      testInsert: insertData
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
