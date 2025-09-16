/*
 * 🛡️ DAYBOARD PROPRIETAinterface TabData {
  id: sinterface TabData {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

export default function DevToolsPage() {: string;
  icon: string;
  count?: number;
}

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 */

/*
 * 🔍 DEVTOOLS DASHBOARD - Comprehensive Browser Monitoring Interface
 *
 * PURPOSE: Chrome DevTools-style interface for comprehensive application monitoring
 * displaying all performance, network, console, and interaction data
 *
 * FEATURES:
 * - Performance tab with Core Web Vitals and timing metrics
 * - Network tab with detailed request analysis
 * - Console tab with advanced message filtering
 * - Security tab with CSP violations and security events
 * - Memory tab with usage tracking and leak detection
 * - User Interactions tab with click/scroll tracking
 * - Real-time data updates and comprehensive export capabilities
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';
import {
  DevToolsMonitor as DevToolsMonitorClass,
  NetworkRequest,
  ConsoleMessage,
  SecurityEvent,
  MemoryUsage,
  UserInteraction,
  ErrorReport
} from '@/utils/devtools-monitor';
import LoggingNav from '@/components/logging/LoggingNav';

interface MemoryData {
  current: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    pressure: 'critical' | 'high' | 'medium' | 'low';
    leakSuspicion: boolean;
  };
  history: MemoryUsage[]; // MemoryUsage array
}

interface InteractionData {
  total: number;
  byType: Record<string, number>;
  recent: UserInteraction[]; // UserInteraction array
}

interface MonitorData {
  timestamp: string;
  performance: {
    coreWebVitals: Record<string, number>;
    navigation: Record<string, number>;
    customTimings: Record<string, number>;
    marks: Record<string, number>;
  };
  network: {
    requests: NetworkRequest[]; // NetworkRequest array
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
  resources: {
    total: number;
    totalSize: number;
    largest: Record<string, unknown>; // ResourceMetrics - TODO: import if needed
  };
  interactions: InteractionData;
  memory: MemoryData;
  security: {
    events: SecurityEvent[]; // SecurityEvent array
    critical: number;
    total: number;
  };
  console: {
    messages: ConsoleMessage[]; // ConsoleMessage array
    errorCount: number;
    warningCount: number;
  };
  errors: {
    total: number;
    recent: ErrorReport[]; // ErrorReport array
  };
}

interface TabData {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

export default function DevToolsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [devToolsMonitor, setDevToolsMonitor] =
    useState<DevToolsMonitorClass | null>(null);
  const refreshInterval = useRef<NodeJS.Timeout>();

  // Initialize DevTools monitor only on client side
  useEffect(() => {
    let monitor: DevToolsMonitorClass | null = null;

    const initializeMonitor = async () => {
      try {
        const { devToolsMonitor: monitorInstance } = await import(
          '@/utils/devtools-monitor'
        );
        monitor = monitorInstance;
        setDevToolsMonitor(monitorInstance);

        // Start monitoring
        monitorInstance.start();

        logger.info('DevTools Dashboard initialized', 'DevToolsDashboard');
      } catch (error) {
        logger.error(
          'Failed to initialize DevTools monitor',
          'DevToolsDashboard',
          { error }
        );
      }
    };

    initializeMonitor();

    return () => {
      if (monitor) {
        monitor.stop();
      }
    };
  }, []);

  // Refresh data from DevTools monitor
  const refreshData = useCallback(() => {
    if (isMonitoring && devToolsMonitor) {
      const data = devToolsMonitor.getFullReport();
      setMonitorData(data);
    }
  }, [isMonitoring, devToolsMonitor]);

  useEffect(() => {
    // Initial data load
    if (devToolsMonitor) {
      refreshData();
    }

    // Setup auto-refresh
    if (autoRefresh && devToolsMonitor) {
      refreshInterval.current = setInterval(refreshData, 2000);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, isMonitoring, devToolsMonitor, refreshData]);

  const toggleMonitoring = () => {
    if (!devToolsMonitor) return;

    if (isMonitoring) {
      devToolsMonitor.stop();
    } else {
      devToolsMonitor.start();
    }
    setIsMonitoring(!isMonitoring);
  };

  const clearData = () => {
    if (devToolsMonitor) {
      devToolsMonitor.clearMetrics();
    }
    setMonitorData(null);
  };

  const exportData = () => {
    if (!devToolsMonitor) return;
    const data = devToolsMonitor.getFullReport();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: TabData[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    {
      id: 'performance',
      label: 'Performance',
      icon: '⚡',
      count: monitorData?.performance
        ? Object.keys(monitorData.performance.coreWebVitals).length
        : 0
    },
    {
      id: 'network',
      label: 'Network',
      icon: '🌐',
      count: monitorData?.network?.totalRequests || 0
    },
    {
      id: 'console',
      label: 'Console',
      icon: '💬',
      count: monitorData?.console?.messages?.length || 0
    },
    {
      id: 'security',
      label: 'Security',
      icon: '🔒',
      count: monitorData?.security?.total || 0
    },
    { id: 'memory', label: 'Memory', icon: '💾' },
    {
      id: 'interactions',
      label: 'Interactions',
      icon: '👆',
      count: monitorData?.interactions?.total || 0
    }
  ];

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceScoreColor = (metric: string, value: number): string => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric.toLowerCase()];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!monitorData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DevTools Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoggingNav
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'}`}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🔍 DevTools Monitor
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      isMonitoring
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isMonitoring ? 'RECORDING' : 'STOPPED'}
                  </span>
                </h1>
                <p className="text-gray-600">
                  Comprehensive browser performance and behavior monitoring
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    autoRefresh
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
                </button>

                <button
                  onClick={refreshData}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  🔄 Refresh
                </button>

                <button
                  onClick={toggleMonitoring}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isMonitoring
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isMonitoring ? '⏹️ Stop' : '▶️ Start'}
                </button>

                <button
                  onClick={exportData}
                  className="px-3 py-2 text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  📥 Export
                </button>

                <button
                  onClick={clearData}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Performance Summary */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        ⚡ Performance
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {
                          Object.keys(monitorData.performance.coreWebVitals)
                            .length
                        }
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {monitorData.performance.coreWebVitals.lcp && (
                        <div className="flex justify-between">
                          <span>LCP:</span>
                          <span
                            className={getPerformanceScoreColor(
                              'lcp',
                              monitorData.performance.coreWebVitals.lcp
                            )}
                          >
                            {formatDuration(
                              monitorData.performance.coreWebVitals.lcp
                            )}
                          </span>
                        </div>
                      )}
                      {monitorData.performance.coreWebVitals.fid && (
                        <div className="flex justify-between">
                          <span>FID:</span>
                          <span
                            className={getPerformanceScoreColor(
                              'fid',
                              monitorData.performance.coreWebVitals.fid
                            )}
                          >
                            {formatDuration(
                              monitorData.performance.coreWebVitals.fid
                            )}
                          </span>
                        </div>
                      )}
                      {monitorData.performance.coreWebVitals.cls && (
                        <div className="flex justify-between">
                          <span>CLS:</span>
                          <span
                            className={getPerformanceScoreColor(
                              'cls',
                              monitorData.performance.coreWebVitals.cls
                            )}
                          >
                            {monitorData.performance.coreWebVitals.cls.toFixed(
                              3
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Network Summary */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        🌐 Network
                      </h3>
                      <span className="text-2xl font-bold text-green-600">
                        {monitorData.network.totalRequests}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Failed:</span>
                        <span className="text-red-600">
                          {monitorData.network.failedRequests}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Time:</span>
                        <span className="text-blue-600">
                          {formatDuration(
                            monitorData.network.averageResponseTime
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="text-green-600">
                          {monitorData.network.totalRequests > 0
                            ? Math.round(
                                ((monitorData.network.totalRequests -
                                  monitorData.network.failedRequests) /
                                  monitorData.network.totalRequests) *
                                  100
                              )
                            : 100}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Memory Summary */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">💾 Memory</h3>
                      <span className="text-2xl font-bold text-purple-600">
                        {monitorData.memory.current
                          ? formatBytes(
                              monitorData.memory.current.usedJSHeapSize
                            )
                          : 'N/A'}
                      </span>
                    </div>
                    {monitorData.memory.current && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Used:</span>
                          <span>
                            {formatBytes(
                              monitorData.memory.current.usedJSHeapSize
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span>
                            {formatBytes(
                              monitorData.memory.current.totalJSHeapSize
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pressure:</span>
                          <span
                            className={`font-medium ${
                              monitorData.memory.current.pressure === 'critical'
                                ? 'text-red-600'
                                : monitorData.memory.current.pressure === 'high'
                                  ? 'text-orange-600'
                                  : monitorData.memory.current.pressure ===
                                      'medium'
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                            }`}
                          >
                            {monitorData.memory.current.pressure}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security Summary */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        🔒 Security
                      </h3>
                      <span className="text-2xl font-bold text-orange-600">
                        {monitorData.security.total}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Critical:</span>
                        <span className="text-red-600">
                          {monitorData.security.critical}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Events:</span>
                        <span className="text-orange-600">
                          {monitorData.security.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span
                          className={
                            monitorData.security.critical > 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          {monitorData.security.critical > 0
                            ? 'Issues'
                            : 'Secure'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    📈 Recent Activity
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Network Requests */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Latest Network Requests
                      </h4>
                      <div className="space-y-2">
                        {monitorData.network.requests
                          .slice(-5)
                          .map((request: NetworkRequest, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${request.failed ? 'bg-red-500' : 'bg-green-500'}`}
                                ></span>
                                <span className="font-mono text-xs">
                                  {request.method}
                                </span>
                                <span className="truncate max-w-xs">
                                  {new URL(request.url).pathname}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    request.failed
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  }
                                >
                                  {request.status}
                                </span>
                                <span className="text-gray-500">
                                  {formatDuration(request.duration)}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Recent Console Messages */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Latest Console Messages
                      </h4>
                      <div className="space-y-2">
                        {monitorData.console.messages
                          .slice(-5)
                          .map((message: ConsoleMessage, index: number) => (
                            <div
                              key={index}
                              className="text-sm p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    message.level === 'error'
                                      ? 'bg-red-100 text-red-800'
                                      : message.level === 'warn'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {message.level.toUpperCase()}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {message.source}
                                </span>
                              </div>
                              <p className="text-gray-800 truncate">
                                {message.message}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                {/* Core Web Vitals */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    ⚡ Core Web Vitals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(monitorData.performance.coreWebVitals).map(
                      ([metric, value]) => (
                        <div key={metric} className="text-center">
                          <div
                            className={`text-3xl font-bold mb-2 ${getPerformanceScoreColor(metric, value as number)}`}
                          >
                            {metric === 'cls'
                              ? (value as number).toFixed(3)
                              : formatDuration(value as number)}
                          </div>
                          <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                            {metric.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {metric === 'lcp' && 'Largest Contentful Paint'}
                            {metric === 'fid' && 'First Input Delay'}
                            {metric === 'cls' && 'Cumulative Layout Shift'}
                            {metric === 'fcp' && 'First Contentful Paint'}
                            {metric === 'ttfb' && 'Time to First Byte'}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Navigation Timing */}
                {monitorData.performance.navigation && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      🚀 Navigation Timing
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(monitorData.performance.navigation).map(
                        ([phase, time]) => (
                          <div
                            key={phase}
                            className="text-center p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="text-lg font-bold text-blue-600">
                              {formatDuration(time as number)}
                            </div>
                            <div className="text-sm text-gray-700 capitalize">
                              {phase.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Timings */}
                {Object.keys(monitorData.performance.customTimings).length >
                  0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      ⏱️ Custom Timings
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(
                        monitorData.performance.customTimings
                      ).map(([name, duration]) => (
                        <div
                          key={name}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded"
                        >
                          <span className="font-medium text-gray-800">
                            {name}
                          </span>
                          <span className="font-mono text-blue-600">
                            {formatDuration(duration as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Network Tab */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      🌐 Network Requests
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Total: {monitorData.network.totalRequests}</span>
                      <span>Failed: {monitorData.network.failedRequests}</span>
                      <span>
                        Avg Response:{' '}
                        {formatDuration(
                          monitorData.network.averageResponseTime
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            URL
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {monitorData.network.requests
                          .slice(-20)
                          .map((request: NetworkRequest, index: number) => (
                            <tr
                              key={index}
                              className={request.failed ? 'bg-red-50' : ''}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    request.method === 'GET'
                                      ? 'bg-green-100 text-green-800'
                                      : request.method === 'POST'
                                        ? 'bg-blue-100 text-blue-800'
                                        : request.method === 'PUT'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : request.method === 'DELETE'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {request.method}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                                {new URL(request.url).pathname}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`font-medium ${
                                    request.status >= 200 &&
                                    request.status < 300
                                      ? 'text-green-600'
                                      : request.status >= 300 &&
                                          request.status < 400
                                        ? 'text-yellow-600'
                                        : 'text-red-600'
                                  }`}
                                >
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {formatDuration(request.duration)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatBytes(request.size)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {request.cached && (
                                  <span className="text-green-600">Cached</span>
                                )}
                                {request.failed && (
                                  <span className="text-red-600">Failed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Console Tab */}
            {activeTab === 'console' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      💬 Console Messages
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Total: {monitorData.console.messages.length}</span>
                      <span>Errors: {monitorData.console.errorCount}</span>
                      <span>Warnings: {monitorData.console.warningCount}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    {monitorData.console.messages
                      .slice(-50)
                      .map((message: ConsoleMessage, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded border-l-4 ${
                            message.level === 'error'
                              ? 'bg-red-50 border-red-400'
                              : message.level === 'warn'
                                ? 'bg-yellow-50 border-yellow-400'
                                : message.level === 'info'
                                  ? 'bg-blue-50 border-blue-400'
                                  : 'bg-gray-50 border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${
                                message.level === 'error'
                                  ? 'bg-red-100 text-red-800'
                                  : message.level === 'warn'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : message.level === 'info'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {message.level.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {message.source}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {new Date(
                                message.timestamp +
                                  Date.now() -
                                  performance.now()
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-gray-800 font-mono text-sm whitespace-pre-wrap">
                            {message.message}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {monitorData.security.events.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        🔒 Security Events
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Total: {monitorData.security.total}</span>
                        <span>Critical: {monitorData.security.critical}</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {monitorData.security.events.map(
                        (event: SecurityEvent, index: number) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              event.severity === 'critical'
                                ? 'bg-red-50 border-red-200'
                                : event.severity === 'high'
                                  ? 'bg-orange-50 border-orange-200'
                                  : event.severity === 'medium'
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  event.severity === 'critical'
                                    ? 'bg-red-100 text-red-800'
                                    : event.severity === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : event.severity === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {event.type.toUpperCase()}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  event.blocked
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {event.blocked ? 'BLOCKED' : 'ALLOWED'}
                              </span>
                            </div>
                            <div className="text-gray-800 text-sm mb-2">
                              {event.details}
                            </div>
                            {event.source && (
                              <div className="text-gray-600 text-xs">
                                Source: {event.source}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-4xl mb-4">🛡️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Security Events
                    </h3>
                    <p className="text-gray-600">
                      Your application appears to be secure with no detected
                      violations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Memory Tab */}
            {activeTab === 'memory' && (
              <div className="space-y-6">
                {monitorData.memory.current ? (
                  <>
                    {/* Current Memory Usage */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        💾 Current Memory Usage
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {formatBytes(
                              monitorData.memory.current.usedJSHeapSize
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            Used Heap Size
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {formatBytes(
                              monitorData.memory.current.totalJSHeapSize
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            Total Heap Size
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-600 mb-2">
                            {formatBytes(
                              monitorData.memory.current.jsHeapSizeLimit
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            Heap Size Limit
                          </div>
                        </div>
                      </div>

                      {/* Memory Pressure Indicator */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Memory Pressure
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              monitorData.memory.current.pressure === 'critical'
                                ? 'text-red-600'
                                : monitorData.memory.current.pressure === 'high'
                                  ? 'text-orange-600'
                                  : monitorData.memory.current.pressure ===
                                      'medium'
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                            }`}
                          >
                            {monitorData.memory.current.pressure?.toUpperCase()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              monitorData.memory?.current.pressure ===
                              'critical'
                                ? 'bg-red-500'
                                : monitorData.memory?.current.pressure ===
                                    'high'
                                  ? 'bg-orange-500'
                                  : monitorData.memory?.current.pressure ===
                                      'medium'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                            }`}
                            style={{
                              width: `${monitorData.memory?.current ? (monitorData.memory.current.usedJSHeapSize / monitorData.memory.current.jsHeapSizeLimit) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Memory Leak Warning */}
                      {monitorData.memory?.current.leakSuspicion && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-red-600">⚠️</span>
                            <span className="font-medium text-red-800">
                              Potential Memory Leak Detected
                            </span>
                          </div>
                          <p className="text-red-700 text-sm mt-1">
                            Memory usage has been consistently increasing.
                            Consider investigating for memory leaks.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Memory History */}
                    {monitorData.memory.history.length > 1 && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          📈 Memory History
                        </h3>
                        <div className="space-y-2">
                          {monitorData.memory.history.map(
                            (snapshot: MemoryUsage, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="text-sm text-gray-600">
                                  Sample {index + 1}
                                </span>
                                <div className="flex items-center gap-4 text-sm">
                                  <span>
                                    Used: {formatBytes(snapshot.usedJSHeapSize)}
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      snapshot.trend === 'increasing'
                                        ? 'text-red-600'
                                        : snapshot.trend === 'decreasing'
                                          ? 'text-green-600'
                                          : 'text-gray-600'
                                    }`}
                                  >
                                    {snapshot.trend === 'increasing'
                                      ? '↗️'
                                      : snapshot.trend === 'decreasing'
                                        ? '↘️'
                                        : '➡️'}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-4xl mb-4">💾</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Memory Monitoring Unavailable
                    </h3>
                    <p className="text-gray-600">
                      Memory API is not supported in this browser.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Interactions Tab */}
            {activeTab === 'interactions' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    👆 User Interactions
                  </h3>

                  {/* Interaction Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {monitorData.interactions &&
                    typeof monitorData.interactions === 'object' &&
                    'byType' in monitorData.interactions &&
                    typeof monitorData.interactions.byType === 'object' &&
                    monitorData.interactions.byType !== null
                      ? Object.entries(monitorData.interactions.byType).map(
                          ([type, count]) => (
                            <div
                              key={type}
                              className="text-center p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="text-2xl font-bold text-blue-600">
                                {count as number}
                              </div>
                              <div className="text-sm text-gray-700 capitalize">
                                {type}
                              </div>
                            </div>
                          )
                        )
                      : null}
                  </div>

                  {/* Recent Interactions */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      Recent Interactions
                    </h4>
                    <div className="space-y-2">
                      {monitorData.interactions &&
                      typeof monitorData.interactions === 'object' &&
                      'recent' in monitorData.interactions &&
                      Array.isArray(monitorData.interactions.recent)
                        ? monitorData.interactions.recent.map(
                            (interaction: unknown, index: number) => {
                              const inter = interaction as {
                                type: string;
                                element?: string;
                                timestamp: number;
                              };
                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                      {inter.type === 'click'
                                        ? '👆'
                                        : inter.type === 'scroll'
                                          ? '📜'
                                          : inter.type === 'keyboard'
                                            ? '⌨️'
                                            : inter.type === 'form'
                                              ? '📝'
                                              : inter.type === 'focus'
                                                ? '🎯'
                                                : '🔄'}
                                    </span>
                                    <div>
                                      <div className="font-medium text-gray-800 capitalize">
                                        {inter.type}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {inter.element || 'Unknown'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-500">
                                      {new Date(
                                        inter.timestamp +
                                          Date.now() -
                                          performance.now()
                                      ).toLocaleTimeString()}
                                    </div>
                                    {typeof inter === 'object' &&
                                      inter !== null &&
                                      'coordinates' in inter && (
                                        <div className="text-xs text-gray-400">
                                          {String(
                                            (inter as UserInteraction)
                                              .coordinates?.x || 0
                                          )}
                                          ,{' '}
                                          {String(
                                            (inter as UserInteraction)
                                              .coordinates?.y || 0
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              );
                            }
                          )
                        : null}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
