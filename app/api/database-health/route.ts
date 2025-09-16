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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * 🔧 DATABASE HEALTH CHECK API
 *
 * Tests database connectivity and helps diagnose "Failed to fetch" issues.
 * Provides detailed diagnostic information for troubleshooting production issues.
 */
export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: request.url,
    tests: {} as Record<string, Record<string, unknown>>,
    summary: {
      overall: 'unknown',
      issues: [] as string[],
      recommendations: [] as string[]
    }
  };

  try {
    // Test 1: Environment Variables
    diagnostics.tests.environment = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      status: 'pass'
    };

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      diagnostics.tests.environment.status = 'fail';
      diagnostics.summary.issues.push(
        'Missing required Supabase environment variables'
      );
      diagnostics.summary.recommendations.push(
        'Check Vercel environment variable configuration'
      );
    }

    // Test 2: Supabase Client Creation
    let supabase;
    try {
      supabase = await createClient();
      diagnostics.tests.clientCreation = { status: 'pass' };
    } catch (error) {
      diagnostics.tests.clientCreation = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      diagnostics.summary.issues.push('Failed to create Supabase client');
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // Test 3: Simple Database Query (avoiding RLS issues)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        diagnostics.tests.databaseQuery = {
          status: 'fail',
          error: error.message,
          code: error.code
        };
        diagnostics.summary.issues.push(
          `Database query failed: ${error.message}`
        );

        if (error.message.includes('infinite recursion')) {
          diagnostics.summary.recommendations.push(
            'Fix Row Level Security policies to avoid recursion'
          );
        }
      } else {
        diagnostics.tests.databaseQuery = {
          status: 'pass',
          recordsFound: data?.length || 0
        };
      }
    } catch (error) {
      diagnostics.tests.databaseQuery = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Network error'
      };
      diagnostics.summary.issues.push(
        'Network connectivity issue with database'
      );
      diagnostics.summary.recommendations.push(
        'Check Vercel-Supabase network connectivity'
      );
    }

    // Test 4: Authentication System
    try {
      const {
        data: { session },
        error: authError
      } = await supabase.auth.getSession();

      if (authError) {
        diagnostics.tests.authentication = {
          status: 'fail',
          error: authError.message
        };
        diagnostics.summary.issues.push(
          `Authentication system error: ${authError.message}`
        );
      } else {
        diagnostics.tests.authentication = {
          status: 'pass',
          hasSession: !!session
        };
      }
    } catch (error) {
      diagnostics.tests.authentication = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Auth check failed'
      };
    }

    // Test 5: CORS and Headers
    const headers = request.headers;
    diagnostics.tests.cors = {
      origin: headers.get('origin'),
      userAgent: headers.get('user-agent'),
      referer: headers.get('referer'),
      status: 'pass'
    };

    // Summary
    const failedTests = Object.values(diagnostics.tests).filter(
      (test: Record<string, unknown>) =>
        typeof test === 'object' && test !== null && test.status === 'fail'
    ).length;

    if (failedTests === 0) {
      diagnostics.summary.overall = 'healthy';
    } else if (failedTests < 3) {
      diagnostics.summary.overall = 'degraded';
    } else {
      diagnostics.summary.overall = 'unhealthy';
    }

    // Add general recommendations
    if (diagnostics.summary.issues.length === 0) {
      diagnostics.summary.recommendations.push(
        'Database connection is healthy'
      );
    } else {
      diagnostics.summary.recommendations.push(
        'Review Supabase dashboard for project status'
      );
      diagnostics.summary.recommendations.push(
        'Verify RLS policies are not causing infinite recursion'
      );
      diagnostics.summary.recommendations.push(
        'Check Vercel function logs for additional errors'
      );
    }

    const status =
      diagnostics.summary.overall === 'healthy'
        ? 200
        : diagnostics.summary.overall === 'degraded'
          ? 207
          : 500;

    return NextResponse.json(diagnostics, {
      status,
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    diagnostics.tests.unexpected = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unexpected error'
    };
    diagnostics.summary.overall = 'unhealthy';
    diagnostics.summary.issues.push('Unexpected error during diagnostics');

    return NextResponse.json(diagnostics, { status: 500 });
  }
}
