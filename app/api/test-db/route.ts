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

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    console.log('🔍 Testing database connection and table existence...');

    // Test basic connection
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    console.log('Auth test:', {
      hasUser: !!user,
      authError: authError?.message
    });

    // Test if application_logs table exists by trying to get table info
    const { data, error } = await supabase
      .from('application_logs')
      .select('count')
      .limit(1);

    console.log('Table test result:', {
      success: !error,
      error: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      errorHint: error?.hint,
      hasData: !!data
    });

    // Test if we can query the table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('application_logs')
      .select('*')
      .limit(1);

    console.log('Table structure test:', {
      success: !tableError,
      error: tableError?.message,
      hasData: !!tableInfo,
      dataLength: tableInfo?.length
    });

    return NextResponse.json({
      success: true,
      auth: {
        hasUser: !!user,
        error: authError?.message
      },
      table: {
        exists: !error,
        error: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint,
        testData: tableInfo
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error,
          constructor: error?.constructor?.name,
          full: error
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
