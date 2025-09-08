'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Shield, AlertTriangle, Activity, Database, Clock, Users, TrendingUp, Eye } from 'lucide-react';

interface SupabaseLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  user_id?: string;
  category: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  data?: any;
}

// Helper functions for categorizing and analyzing logs
function categorizeSupabaseError(message: string, level: string) {
  const categories = [];
  const lowerMessage = message.toLowerCase();

  // Security categories
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('permission')) {
    categories.push('security');
  }

  // Performance categories
  if (lowerMessage.includes('slow') || lowerMessage.includes('timeout') || lowerMessage.includes('performance')) {
    categories.push('performance');
  }

  // Database categories
  if (lowerMessage.includes('postgres') || lowerMessage.includes('sql') || lowerMessage.includes('database')) {
    categories.push('database');
  }

  // RLS categories
  if (lowerMessage.includes('rls') || lowerMessage.includes('row level security')) {
    categories.push('rls');
  }

  // Connection categories
  if (lowerMessage.includes('connection') || lowerMessage.includes('pool')) {
    categories.push('connection');
  }

  return categories.length > 0 ? categories : ['general'];
}

function getSeverityLevel(level: string, message: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerLevel = level.toLowerCase();
  const lowerMessage = message.toLowerCase();

  // Critical level indicators
  if (lowerLevel === 'error' || lowerMessage.includes('critical') || lowerMessage.includes('fatal')) {
    return 'critical';
  }

  // High level indicators
  if (lowerLevel === 'warn' || lowerMessage.includes('security') || lowerMessage.includes('unauthorized')) {
    return 'high';
  }

  // Medium level indicators
  if (lowerLevel === 'info' && (lowerMessage.includes('slow') || lowerMessage.includes('performance'))) {
    return 'medium';
  }

  // Default to low
  return 'low';
}

interface SecurityEvent {
  type: 'auth_failure' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  timestamp: string;
}

interface PerformanceMetric {
  query_time: number;
  connection_count: number;
  cache_hit_rate: number;
  error_rate: number;
  timestamp: string;
}

export default function SupabaseMonitorPage() {
  const [logs, setLogs] = useState<SupabaseLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'errors' | 'security' | 'performance'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const supabase = createClient();

  const fetchSupabaseLogs = async () => {
    try {
      // Get application logs that relate to Supabase operations
      const { data: appLogs, error } = await supabase
        .from('application_logs')
        .select('*')
        .or('message.ilike.%supabase%,message.ilike.%database%,message.ilike.%auth%,message.ilike.%rls%')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform and categorize logs
      const transformedLogs: SupabaseLog[] = appLogs?.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        user_id: log.user_id || undefined,
        category: categorizeSupabaseError(log.message || '', log.level),
        severity: getSeverityLevel(log.level, log.message || ''),
        source: 'application',
        data: log.data
      })) || [];

      setLogs(transformedLogs);

      // Extract security events
      const secEvents = extractSecurityEvents(transformedLogs);
      setSecurityEvents(secEvents);

      // Calculate performance metrics
      const perfMetrics = calculatePerformanceMetrics(transformedLogs);
      setPerformanceMetrics(perfMetrics);

    } catch (error) {
      console.error('Failed to fetch Supabase logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractErrorCode = (message: string): string | undefined => {
    // Extract common Supabase error codes
    const patterns = [
      /PGRST\d+/,  // PostgREST errors
      /23\d{3}/,   // PostgreSQL constraint violations
      /42\d{3}/,   // PostgreSQL syntax errors
      /53\d{3}/,   // PostgreSQL resource errors
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) return match[0];
    }
    return undefined;
  };

  const extractSecurityEvents = (logs: SupabaseLog[]): SecurityEvent[] => {
    const events: SecurityEvent[] = [];

    logs.forEach(log => {
      const message = log.message.toLowerCase();
      
      // Authentication failures
      if (message.includes('auth') && (message.includes('failed') || message.includes('error'))) {
        events.push({
          type: 'auth_failure',
          severity: 'medium',
          details: { message: log.message, user_id: log.user_id },
          timestamp: log.timestamp
        });
      }

      // Unauthorized access attempts
      if (message.includes('unauthorized') || message.includes('permission denied')) {
        events.push({
          type: 'unauthorized_access',
          severity: 'high',
          details: { message: log.message, user_id: log.user_id },
          timestamp: log.timestamp
        });
      }

      // RLS policy violations
      if (message.includes('rls') || message.includes('row level security')) {
        events.push({
          type: 'suspicious_activity',
          severity: 'medium',
          details: { message: log.message, user_id: log.user_id },
          timestamp: log.timestamp
        });
      }

      // Rate limiting
      if (message.includes('rate limit') || message.includes('too many requests')) {
        events.push({
          type: 'rate_limit',
          severity: 'low',
          details: { message: log.message, user_id: log.user_id },
          timestamp: log.timestamp
        });
      }
    });

    return events.slice(0, 20); // Limit to recent events
  };

  const calculatePerformanceMetrics = (logs: SupabaseLog[]): PerformanceMetric => {
    const errorLogs = logs.filter(log => log.level === 'error');
    const totalLogs = logs.length;
    
    return {
      query_time: Math.random() * 100 + 50, // Mock data - replace with real metrics
      connection_count: Math.floor(Math.random() * 50) + 10,
      cache_hit_rate: 85 + Math.random() * 10,
      error_rate: totalLogs > 0 ? (errorLogs.length / totalLogs) * 100 : 0,
      timestamp: new Date().toISOString()
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'auth_failure': return <Shield className="w-4 h-4" />;
      case 'unauthorized_access': return <AlertTriangle className="w-4 h-4" />;
      case 'suspicious_activity': return <Eye className="w-4 h-4" />;
      case 'rate_limit': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'errors') return log.level === 'error';
    if (filter === 'security') return log.message.toLowerCase().includes('auth') || 
                                         log.message.toLowerCase().includes('unauthorized') ||
                                         log.message.toLowerCase().includes('rls');
    if (filter === 'performance') return log.message.toLowerCase().includes('slow') ||
                                           log.message.toLowerCase().includes('timeout') ||
                                           log.message.toLowerCase().includes('performance');
    return true;
  });

  useEffect(() => {
    fetchSupabaseLogs();
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSupabaseLogs();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Database className="w-12 h-12 mx-auto text-purple-600 animate-spin" />
            <p className="mt-4 text-gray-600">Loading Supabase monitoring data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Supabase Monitor</h1>
                <p className="text-gray-600">Real-time security and performance monitoring</p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Auto-refresh:</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {autoRefresh ? 'ON' : 'OFF'}
                </button>
              </div>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Query Time</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.query_time.toFixed(1)}ms</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Connections</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.connection_count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.cache_hit_rate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics.error_rate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Events */}
        {securityEvents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Recent Security Events
            </h2>
            <div className="space-y-3">
              {securityEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`p-2 rounded-full ${getSeverityColor(event.severity)}`}>
                      {getEventIcon(event.type)}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {event.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event.details.message.slice(0, 100)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {['all', 'errors', 'security', 'performance'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Supabase Logs Feed ({filteredLogs.length} entries)
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">{log.message}</p>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          View data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500 ml-4">
                    <p>{new Date(log.timestamp).toLocaleString()}</p>
                    {log.user_id && (
                      <p className="text-xs">User: {log.user_id.slice(0, 8)}...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4">
          <div className="flex justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🏠 Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
