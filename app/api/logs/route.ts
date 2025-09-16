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

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const timeRangeMs = searchParams.get('timeRangeMs')
      ? parseInt(searchParams.get('timeRangeMs')!)
      : undefined;

    const supabase = await createClient();

    let query = supabase
      .from('customer_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply time range filter if specified
    if (timeRangeMs) {
      const cutoffTime = new Date(Date.now() - timeRangeMs).toISOString();
      query = query.gte('timestamp', cutoffTime);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('❌ API Database query error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }
        },
        { status: 500 }
      );
    }

    const logs =
      data?.map((row: unknown) => {
        const logRow = row as Record<string, unknown>;
        return {
          id: logRow.id,
          userId: logRow.user_id,
          sessionId: logRow.session_id,
          level: logRow.level,
          message: logRow.message,
          component: logRow.component,
          data: logRow.data,
          stack: logRow.stack_trace,
          userAgent: logRow.user_agent,
          url: logRow.url,
          timestamp: logRow.timestamp,
          side: logRow.side || 'client'
        };
      }) || [];

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ API Logs fetch failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error,
          constructor: error?.constructor?.name
        }
      },
      { status: 500 }
    );
  }
}
