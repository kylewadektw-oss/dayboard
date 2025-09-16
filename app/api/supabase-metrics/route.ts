import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface SupabaseMetrics {
  database_health: {
    active_connections: number;
    slow_queries: number;
    cache_hit_rate: number;
    error_rate: number;
  };
  security_events: {
    failed_auth_attempts: number;
    unauthorized_access: number;
    rls_violations: number;
    suspicious_activities: number;
  };
  performance_stats: {
    avg_query_time: number;
    total_requests: number;
    error_count: number;
    uptime_percentage: number;
  };
  recent_logs: Array<Record<string, unknown>>;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1h';

    // Calculate time filter based on range
    const now = new Date();
    const timeFilter = new Date();

    switch (timeRange) {
      case '1h':
        timeFilter.setHours(now.getHours() - 1);
        break;
      case '6h':
        timeFilter.setHours(now.getHours() - 6);
        break;
      case '24h':
        timeFilter.setDate(now.getDate() - 1);
        break;
      case '7d':
        timeFilter.setDate(now.getDate() - 7);
        break;
    }

    // Get application logs related to Supabase operations
    const { data: logs, error: logsError } = await supabase
      .from('application_logs')
      .select('*')
      .gte('timestamp', timeFilter.toISOString())
      .or(
        'message.ilike.%supabase%,message.ilike.%database%,message.ilike.%auth%,message.ilike.%rls%,message.ilike.%postgres%'
      )
      .order('timestamp', { ascending: false })
      .limit(200);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
    }

    const recentLogs = logs || [];

    // Analyze logs for security and performance metrics
    const securityEvents = analyzeSecurityEvents(recentLogs);
    const performanceStats = analyzePerformanceStats(recentLogs);
    const databaseHealth = analyzeDatabaseHealth(recentLogs);

    // Get database connection info (mock data - replace with real metrics if available)
    const connectionMetrics = await getDatabaseConnectionMetrics();

    const metrics: SupabaseMetrics = {
      database_health: {
        active_connections: connectionMetrics.connections,
        slow_queries: databaseHealth.slow_queries,
        cache_hit_rate: 85 + Math.random() * 10, // Mock - replace with real cache metrics
        error_rate: performanceStats.error_rate
      },
      security_events: securityEvents,
      performance_stats: performanceStats,
      recent_logs: recentLogs.slice(0, 50) // Return recent 50 logs
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Supabase monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Supabase metrics' },
      { status: 500 }
    );
  }
}

function analyzeSecurityEvents(logs: Array<Record<string, unknown>>) {
  let failed_auth_attempts = 0;
  let unauthorized_access = 0;
  let rls_violations = 0;
  let suspicious_activities = 0;

  logs.forEach((log) => {
    const message = String(log.message || '').toLowerCase();

    // Authentication failures
    if (
      message.includes('auth') &&
      (message.includes('failed') ||
        message.includes('error') ||
        message.includes('invalid'))
    ) {
      failed_auth_attempts++;
    }

    // Unauthorized access
    if (
      message.includes('unauthorized') ||
      message.includes('permission denied') ||
      message.includes('access denied')
    ) {
      unauthorized_access++;
    }

    // RLS violations
    if (
      message.includes('rls') ||
      message.includes('row level security') ||
      message.includes('policy violation')
    ) {
      rls_violations++;
    }

    // Suspicious activities
    if (
      message.includes('suspicious') ||
      message.includes('anomaly') ||
      message.includes('security')
    ) {
      suspicious_activities++;
    }
  });

  return {
    failed_auth_attempts,
    unauthorized_access,
    rls_violations,
    suspicious_activities
  };
}

function analyzePerformanceStats(logs: Array<Record<string, unknown>>) {
  const errorLogs = logs.filter((log) => log.level === 'error');
  const warnLogs = logs.filter((log) => log.level === 'warn');
  const totalLogs = logs.length;

  // Extract query times from logs (look for patterns like "query took 150ms")
  const queryTimes: number[] = [];
  logs.forEach((log) => {
    const message = String(log.message || '');
    const timeMatch = message.match(/(\d+)ms/);
    if (timeMatch) {
      queryTimes.push(parseInt(timeMatch[1]));
    }
  });

  const avgQueryTime =
    queryTimes.length > 0
      ? queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length
      : Math.random() * 100 + 50; // Fallback mock data

  return {
    avg_query_time: avgQueryTime,
    total_requests: totalLogs,
    error_count: errorLogs.length + warnLogs.length,
    error_rate:
      totalLogs > 0
        ? ((errorLogs.length + warnLogs.length) / totalLogs) * 100
        : 0,
    uptime_percentage: Math.max(
      95,
      100 - (errorLogs.length / Math.max(totalLogs, 1)) * 100
    )
  };
}

function analyzeDatabaseHealth(logs: Array<Record<string, unknown>>) {
  let slow_queries = 0;

  logs.forEach((log) => {
    const message = String(log.message || '').toLowerCase();

    // Look for slow query indicators
    if (
      message.includes('slow') ||
      message.includes('timeout') ||
      message.includes('performance')
    ) {
      slow_queries++;
    }
  });

  return {
    slow_queries
  };
}

async function getDatabaseConnectionMetrics() {
  // Mock connection metrics - in a real app, you'd get these from Supabase API or pg_stat_activity
  return {
    connections: Math.floor(Math.random() * 50) + 10,
    max_connections: 100,
    idle_connections: Math.floor(Math.random() * 20) + 5
  };
}

// Enhanced error categorization (unused function)
