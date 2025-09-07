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

/*
 *  LOGS DASHBOARD - Real-time Log Monitoring & Analysis
 * 
 * PURPOSE: Central hub for viewing, filtering, and analyzing all application logs in real-time
 * 
 * FEATURES:
 * - Real-time log streaming with auto-refresh (every 2 seconds)
 * - Advanced filtering by log level (ERROR, WARN, INFO, DEBUG), component, and side (client/server)
 * - Export functionality (JSON, CSV, TXT formats)
 * - Performance metrics and component statistics
 * - Color-coded log levels with search highlighting
 * - Responsive design with collapsible sidebar navigation
 * 
 * ACCESS: Public - No authentication required
 * 
 * TECHNICAL:
 * - Uses enhanced logger with circular reference protection
 * - Efficient rendering with useMemo for large log datasets
 * - Auto-scroll to latest logs with manual override
 * - Keyboard shortcuts and accessibility features
 * 
 * NAVIGATION: Part of logging suite with LoggingNav sidebar
 * Links to: test-log-generation, auto-log-review, test-console-logging
 */

'use client';

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { LogLevel, LogEntry, logger } from '@/utils/logger';
import LoggingNav from '@/components/logging/LoggingNav';

// Memoized log item component for better performance
const LogItem = memo(({ log, index, getSideIndicator, getLogLevelStyles, copyToClipboard }: {
  log: LogEntry;
  index: number;
  getSideIndicator: (side: 'client' | 'server' | undefined) => JSX.Element;
  getLogLevelStyles: (level: LogLevel) => string;
  copyToClipboard: (log: LogEntry) => void;
}) => (
  <div key={`${log.id}-${index}`} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs font-bold rounded ${getLogLevelStyles(log.level)}`}>
            {log.level.toUpperCase()}
          </span>
          {getSideIndicator(log.side)}
          {log.component && (
            <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full font-medium">
              {log.component}
            </span>
          )}
        </div>
        <div className="mb-2 text-xs text-gray-800 font-medium">
          <strong>Stack:</strong> {log.stack || 'N/A'}
        </div>
        <div className="text-sm font-medium text-gray-900 break-words leading-relaxed mb-2">
          {log.message}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-800 whitespace-nowrap font-semibold">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        <button
          onClick={() => copyToClipboard(log)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Copy log details"
        >
          📋
        </button>
      </div>
    </div>
  </div>
));

export default function LogsDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [selectedSide, setSelectedSide] = useState<'client' | 'server' | 'all'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxLogs, setMaxLogs] = useState(150); // Changed default from 500 to 150
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h'); // Changed default from '1d' to '1h'
  const [showStackTrace, setShowStackTrace] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLogForFix, setSelectedLogForFix] = useState<LogEntry | null>(null);
  const [showFixPopout, setShowFixPopout] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false);
  const [lastLogCount, setLastLogCount] = useState(0);

  // Convert time range string to milliseconds
  const getTimeRangeMs = (range: string): number => {
    const timeMap: { [key: string]: number } = {
      '1m': 1 * 60 * 1000,
      '5m': 5 * 60 * 1000,
      '10m': 10 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return timeMap[range] || 0;
  };

  // Helper function to get log level styles for memoized component
  const getLogLevelStyles = useCallback((level: LogLevel): string => {
    switch (level) {
      case LogLevel.ERROR: return 'text-red-800 bg-red-100 border-red-200 font-bold';
      case LogLevel.WARN: return 'text-yellow-800 bg-yellow-100 border-yellow-200 font-semibold';
      case LogLevel.INFO: return 'text-blue-800 bg-blue-100 border-blue-200 font-medium';
      case LogLevel.DEBUG: return 'text-gray-700 bg-gray-50 border-gray-200 font-medium';
      default: return 'text-gray-700 bg-gray-50 border-gray-200 font-medium';
    }
  }, []);

  // Helper function to get side indicator
  const getSideIndicator = (side: 'client' | 'server' | undefined) => {
    const actualSide = side || 'client';
    const isClient = actualSide === 'client';
    return (
      <span 
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          isClient 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'
        }`}
      >
        {isClient ? '🌐 Client' : '⚙️ Server'}
      </span>
    );
  };

  // Generate suggested fixes for errors and warnings
  const getSuggestedFixes = (log: LogEntry): string[] => {
    const message = log.message.toLowerCase();
    const fixes: string[] = [];

    // Network and CORS errors
    if (message.includes('cors') || message.includes('cross-origin')) {
      fixes.push('Check CORS configuration in your API server');
      fixes.push('Ensure the request origin is allowed in CORS policy');
      fixes.push('Verify the request method (GET, POST, etc.) is permitted');
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      fixes.push('Check if the authentication token is valid and not expired');
      fixes.push('Verify the user has proper permissions for this action');
      fixes.push('Ensure the authentication header is properly set');
    }

    // Database errors
    if (message.includes('database') || message.includes('sql') || message.includes('supabase')) {
      fixes.push('Check database connection and credentials');
      fixes.push('Verify the table/column names are correct');
      fixes.push('Ensure proper database permissions are set');
    }

    // React/Component errors
    if (message.includes('hydration') || message.includes('hydrate')) {
      fixes.push('Check for server-client rendering mismatches');
      fixes.push('Ensure consistent data between SSR and client-side rendering');
      fixes.push('Verify useEffect dependencies are properly set');
    }

    // Circular reference errors
    if (message.includes('circular') || message.includes('json')) {
      fixes.push('Remove circular references from objects before serialization');
      fixes.push('Use JSON.stringify with a replacer function');
      fixes.push('Consider using a library like "flatted" for circular object serialization');
    }

    // Network/Fetch errors
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      fixes.push('Check your internet connection');
      fixes.push('Verify the API endpoint URL is correct');
      fixes.push('Consider implementing retry logic for network requests');
    }

    // Build/Compilation errors
    if (message.includes('module') || message.includes('import') || message.includes('export')) {
      fixes.push('Check if the module path is correct');
      fixes.push('Ensure the imported function/component is properly exported');
      fixes.push('Verify node_modules dependencies are installed');
    }

    // Generic error suggestions if no specific match
    if (fixes.length === 0) {
      if (log.level === LogLevel.ERROR) {
        fixes.push('Check the browser console for additional error details');
        fixes.push('Review the stack trace for the exact line causing the error');
        fixes.push('Try refreshing the page or clearing browser cache');
      } else if (log.level === LogLevel.WARN) {
        fixes.push('This warning may not break functionality but should be addressed');
        fixes.push('Review the code path that generated this warning');
        fixes.push('Consider updating deprecated methods or configurations');
      }
    }

    return fixes;
  };

  // Copy entire error portion to clipboard
  const copyErrorDetails = async (log: LogEntry) => {
    const errorDetails = {
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      component: log.component,
      url: log.url,
      userAgent: log.userAgent,
      data: log.data,
      stack: log.stack,
      suggestedFixes: getSuggestedFixes(log)
    };

    const formattedText = `
=== ERROR LOG DETAILS ===
Timestamp: ${new Date(log.timestamp).toLocaleString()}
Level: ${log.level.toUpperCase()}
URL: ${log.url || 'N/A'}
Component: ${log.component || 'Unknown'}
Message: ${log.message}

${log.data ? `Data: ${JSON.stringify(log.data, null, 2)}` : ''}

${log.stack ? `Stack Trace: ${log.stack}` : ''}

Suggested Fixes:
${getSuggestedFixes(log).map((fix, i) => `${i + 1}. ${fix}`).join('\n')}

User Agent: ${log.userAgent || 'N/A'}
=== END ERROR LOG ===
    `.trim();

    try {
      await navigator.clipboard.writeText(formattedText);
      // Show a brief success indicator
      console.log('✅ Error details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: select text for manual copy
      const textArea = document.createElement('textarea');
      textArea.value = formattedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const refreshLogs = useCallback(async () => {
    if (isPaused) return;
    
    let allLogs: LogEntry[] = [];
    try {
      // Convert time range to milliseconds for database query
      const timeRangeMs = selectedTimeRange !== 'all' ? getTimeRangeMs(selectedTimeRange) : undefined;
      console.log(`📊 Refreshing logs with time range: ${selectedTimeRange} (${timeRangeMs}ms), max: ${maxLogs}`);
      
      // Get logs from database with time filtering (use maxLogs instead of hardcoded 300)
      allLogs = await logger.getAllLogsIncludingDatabase(maxLogs * 2, timeRangeMs); // Get 2x to allow for filtering
      console.log(`📊 Retrieved ${allLogs.length} logs from database`);
    } catch (error) {
      console.error('❌ Failed to load logs:', error);
      // Fallback to memory logs only
      allLogs = logger.getAllLogs().slice(0, maxLogs);
    }
    
    let filteredLogs = [...allLogs];
    
    // Additional time range filtering for memory logs if needed
    if (selectedTimeRange !== 'all' && filteredLogs.length > 0) {
      const now = Date.now();
      const cutoff = now - getTimeRangeMs(selectedTimeRange);
      const beforeFilter = filteredLogs.length;
      
      filteredLogs = filteredLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime > cutoff;
      });
      
      console.log(`📊 Time filter: ${beforeFilter} -> ${filteredLogs.length} logs (range: ${selectedTimeRange}, cutoff: ${new Date(cutoff).toISOString()})`);
    }
    
    // Level filtering
    if (selectedLevel !== 'all') {
      const beforeFilter = filteredLogs.length;
      filteredLogs = filteredLogs.filter(log => log.level === selectedLevel);
      console.log(`📊 Level filter (${selectedLevel}): ${beforeFilter} -> ${filteredLogs.length} logs`);
    }

    // Side filtering (client/server)
    if (selectedSide !== 'all') {
      const beforeFilter = filteredLogs.length;
      filteredLogs = filteredLogs.filter(log => (log.side || 'client') === selectedSide);
      console.log(`📊 Side filter (${selectedSide}): ${beforeFilter} -> ${filteredLogs.length} logs`);
    }
    
    // Component filtering
    if (selectedComponent !== 'all') {
      const beforeFilter = filteredLogs.length;
      filteredLogs = filteredLogs.filter(log => log.component === selectedComponent);
      console.log(`📊 Component filter (${selectedComponent}): ${beforeFilter} -> ${filteredLogs.length} logs`);
    }
    
    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const beforeFilter = filteredLogs.length;
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(query) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(query)) ||
        (log.component && log.component.toLowerCase().includes(query)) ||
        (log.stack && log.stack.toLowerCase().includes(query))
      );
      console.log(`📊 Search filter ("${query}"): ${beforeFilter} -> ${filteredLogs.length} logs`);
    }
    
    // Sort by timestamp
    filteredLogs.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    
    // Apply max logs limit
    const finalLogs = filteredLogs.slice(0, maxLogs);
    console.log(`📊 Final result: ${finalLogs.length} logs displayed (max: ${maxLogs})`);
    
    setLogs(finalLogs);
  }, [isPaused, selectedTimeRange, maxLogs, selectedLevel, selectedComponent, selectedSide, searchQuery, sortOrder]);

  useEffect(() => {
    logger.setupConsoleInterception();
    refreshLogs();
    
    if (autoRefresh && !isPaused) {
      const interval = setInterval(() => {
        refreshLogs();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedLevel, selectedComponent, selectedSide, autoRefresh, searchQuery, maxLogs, isPaused, selectedTimeRange, sortOrder]);

  useEffect(() => {
    if (autoScroll && autoRefresh && !isPaused && logs.length > lastLogCount) {
      setTimeout(() => {
        // Use container scrolling instead of scrollIntoView to avoid fixed element warnings
        const logsContainer = document.querySelector('.logs-container');
        if (logsContainer) {
          logsContainer.scrollTop = logsContainer.scrollHeight;
        }
      }, 100);
    }
    setLastLogCount(logs.length);
  }, [logs.length, autoScroll, autoRefresh, isPaused, lastLogCount]);

  // Computed statistics
  const logStats = useMemo(() => {
    const total = logs.length;
    const errors = logs.filter(log => log.level === LogLevel.ERROR).length;
    const warnings = logs.filter(log => log.level === LogLevel.WARN).length;
    const info = logs.filter(log => log.level === LogLevel.INFO).length;
    const debug = logs.filter(log => log.level === LogLevel.DEBUG).length;
    
    return { total, errors, warnings, info, debug };
  }, [logs]);

  const components = useMemo(() => {
    return ['all', ...Array.from(new Set(logs.map(log => log.component).filter(Boolean) as string[]))];
  }, [logs]);

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const clearAllFilters = () => {
    setSelectedLevel('all');
    setSelectedComponent('all');
    setSelectedSide('all');
    setSelectedTimeRange('1h'); // Reset to default
    setSearchQuery('');
  };

  const testConsoleLogging = () => {
    console.log('✅ Test console.log message');
    console.error('❌ Test console.error message'); 
    console.warn('⚠️ Test console.warn message');
    console.info('ℹ️ Test console.info message');
    console.debug('🐛 Test console.debug message');
    
    console.log('Object test:', { test: 'data', timestamp: new Date() });
    
    try {
      throw new Error('Test error for logging');
    } catch (error) {
      console.error('Caught error:', error);
    }
  };

  const exportLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayboard-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToBottom = () => {
    const logsContainer = document.querySelector('.logs-container');
    if (logsContainer) {
      logsContainer.scrollTo({ top: logsContainer.scrollHeight, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    const logsContainer = document.querySelector('.logs-container');
    logsContainer?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyLogEntry = async (log: LogEntry) => {
    const logText = `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()}: ${log.message}${log.component ? ` (${log.component})` : ''}${log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''}${log.stack ? `\nStack: ${log.stack}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(logText);
      // Show temporary feedback
      const button = document.activeElement as HTMLElement;
      const originalText = button?.textContent;
      if (button) {
        button.textContent = '✅ Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to copy log entry:', err);
    }
  };

  const copyAllVisibleLogs = async () => {
    const allLogsText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()}: ${log.message}${log.component ? ` (${log.component})` : ''}${log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''}${log.stack ? `\nStack: ${log.stack}` : ''}`
    ).join('\n\n---\n\n');
    
    try {
      await navigator.clipboard.writeText(allLogsText);
      const button = document.activeElement as HTMLElement;
      const originalText = button?.textContent;
      if (button) {
        button.textContent = '✅ Copied All!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy all logs:', err);
    }
  };

  const copyMessagesOnly = async () => {
    const messagesText = logs.map(log => 
      `[${formatTimestamp(log.timestamp)}] ${log.level}: ${log.message}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(messagesText);
      const button = document.activeElement as HTMLElement;
      const originalText = button?.textContent;
      if (button) {
        button.textContent = '✅ Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy messages:', err);
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR: return 'text-red-600 bg-red-50 border-red-200';
      case LogLevel.WARN: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case LogLevel.INFO: return 'text-blue-600 bg-blue-50 border-blue-200';
      case LogLevel.DEBUG: return 'text-gray-700 bg-gray-50 border-gray-200 font-medium';
      default: return 'text-gray-700 bg-gray-50 border-gray-200 font-medium';
    }
  };

  const getLevelEmoji = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR: return '❌';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.DEBUG: return '🐛';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleString();
  };

  return (
    <>
      {/* Enhanced Sidebar Navigation with Filters */}
      <LoggingNav 
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
        selectedLevel={selectedLevel}
        onLevelChange={(level) => setSelectedLevel(level as LogLevel | 'all')}
        selectedSide={selectedSide}
        onSideChange={(side) => setSelectedSide(side as 'client' | 'server' | 'all')}
        selectedComponent={selectedComponent}
        onComponentChange={setSelectedComponent}
        availableComponents={components}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearAllFilters}
        logStats={logStats}
      />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-80'
      }`}>
        <div className="p-4 max-w-full mx-auto bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">📊 Enhanced Logs Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {isPaused ? '⏸️ Paused' : '🔄 Live'}
              </div>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  isPaused ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={() => {
                  logger.clearDbCache();
                  refreshLogs();
                }}
                className="px-3 py-1 text-sm rounded bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                title="Clear cache and refresh from database"
              >
                🔄 Refresh Cache
              </button>
            </div>
          </div>
          
          {/* Statistics Panel */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <button 
              onClick={() => setSelectedLevel(selectedLevel === 'all' ? 'all' : 'all')}
              className={`p-4 bg-white rounded-lg shadow-sm border text-center transition-all hover:shadow-md ${
                selectedLevel === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{logStats.total}</div>
              <div className="text-sm text-gray-800 font-semibold">Total Logs</div>
            </button>
            <button 
              onClick={() => setSelectedLevel(selectedLevel === LogLevel.ERROR ? 'all' : LogLevel.ERROR)}
              className={`p-4 bg-white rounded-lg shadow-sm border text-center transition-all hover:shadow-md ${
                selectedLevel === LogLevel.ERROR ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-red-50'
              }`}
            >
              <div className="text-2xl font-bold text-red-600">{logStats.errors}</div>
              <div className="text-sm text-red-600 font-semibold">❌ Errors</div>
            </button>
            <button 
              onClick={() => setSelectedLevel(selectedLevel === LogLevel.WARN ? 'all' : LogLevel.WARN)}
              className={`p-4 bg-white rounded-lg shadow-sm border text-center transition-all hover:shadow-md ${
                selectedLevel === LogLevel.WARN ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:bg-yellow-50'
              }`}
            >
              <div className="text-2xl font-bold text-yellow-600">{logStats.warnings}</div>
              <div className="text-sm text-yellow-600 font-semibold">⚠️ Warnings</div>
            </button>
            <button 
              onClick={() => setSelectedLevel(selectedLevel === LogLevel.INFO ? 'all' : LogLevel.INFO)}
              className={`p-4 bg-white rounded-lg shadow-sm border text-center transition-all hover:shadow-md ${
                selectedLevel === LogLevel.INFO ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-blue-50'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600">{logStats.info}</div>
              <div className="text-sm text-blue-600 font-semibold">ℹ️ Info</div>
            </button>
            <button 
              onClick={() => setSelectedLevel(selectedLevel === LogLevel.DEBUG ? 'all' : LogLevel.DEBUG)}
              className={`p-4 bg-white rounded-lg shadow-sm border text-center transition-all hover:shadow-md ${
                selectedLevel === LogLevel.DEBUG ? 'ring-2 ring-gray-500 bg-gray-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-gray-700">{logStats.debug}</div>
              <div className="text-sm text-gray-800 font-semibold">🐛 Debug</div>
            </button>
          </div>

          {/* Insights and Recommendations Section - Show when there are warnings or errors */}
          {(logStats.errors > 0 || logStats.warnings > 0) && (
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💡</span>
                <h2 className="text-lg font-bold text-gray-900">Insights & Recommendations</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Error Analysis */}
                {logStats.errors > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">🚨</span>
                      Error Analysis ({logStats.errors} errors)
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-red-700">
                        <span>•</span>
                        <span>High priority: Review and fix critical errors immediately</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-700">
                        <span>•</span>
                        <span>Check for patterns in error messages and components</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-700">
                        <span>•</span>
                        <span>Verify proper error handling is implemented</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Analysis */}
                {logStats.warnings > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      Warning Analysis ({logStats.warnings} warnings)
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <span>•</span>
                        <span>Address warnings to prevent future errors</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-700">
                        <span>•</span>
                        <span>Review deprecation warnings and update code</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-700">
                        <span>•</span>
                        <span>Check for performance-related warnings</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* System Health Status */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏥</span>
                    <span className="font-semibold text-gray-900">System Health</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    logStats.errors === 0 && logStats.warnings < 5 
                      ? 'bg-green-100 text-green-800' 
                      : logStats.errors > 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {logStats.errors === 0 && logStats.warnings < 5 
                      ? '✅ Healthy' 
                      : logStats.errors > 0 
                        ? '🚨 Needs Attention' 
                        : '⚠️ Monitor Closely'}
                  </div>
                </div>
                {(logStats.errors === 0 && logStats.warnings < 5) && (
                  <div className="mt-2 text-sm text-gray-800 font-medium">
                    <span>💡 Consider reviewing UI contrast ratios and accessibility for optimal user experience</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions & Controls */}
          <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-semibold text-gray-900">🎛️ Quick Actions:</h3>
                
                <button 
                  onClick={refreshLogs}
                  disabled={isPaused}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm disabled:bg-gray-400 transition-colors"
                >
                  🔄 Refresh
                </button>

                <button 
                  onClick={clearLogs}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm transition-colors"
                >
                  🗑️ Clear All
                </button>

                <button 
                  onClick={exportLogs}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors"
                >
                  📁 Export JSON
                </button>

                <button 
                  onClick={testConsoleLogging}
                  className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm transition-colors"
                >
                  🧪 Generate Test Logs
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Max Logs Control */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-900 font-semibold">📊 Max Logs:</label>
                  <select
                    value={maxLogs}
                    onChange={(e) => setMaxLogs(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={150}>150</option>
                    <option value={300}>300</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                    <option value={2000}>2000</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  🔄 Auto Refresh
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  📜 Auto Scroll
                </label>
              </div>
            </div>
          </div>

          {/* Logs Display */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">
                📋 Recent Logs ({logs.length} shown)
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyMessagesOnly}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                  title="Copy just messages (compact format)"
                >
                  📝 Messages
                </button>
                <button
                  onClick={copyAllVisibleLogs}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                  title="Copy all visible logs to clipboard"
                >
                  📋 Full Details
                </button>
                <button
                  onClick={scrollToTop}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-800 hover:bg-gray-200 rounded transition-colors font-medium"
                  title="Scroll to top"
                >
                  ⬆️ Top
                </button>
                <button
                  onClick={scrollToBottom}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                  title="Scroll to bottom"
                >
                  ⬇️ Bottom
                </button>
                <div className="text-sm text-gray-800 font-semibold">
                  {autoRefresh && !isPaused && '🔄 Live updating'}
                  {isPaused && '⏸️ Updates paused'}
                </div>
              </div>
            </div>
            
            <div className="logs-container max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-gray-800 font-medium">
                  <div className="text-4xl mb-2">📝</div>
                  <div className="text-lg font-medium mb-1">No logs found</div>
                  <div className="text-sm">Try adjusting your filters or generate some test logs</div>
                </div>
              ) : (
                logs.map((log, index) => (
                  <LogItem
                    key={`${log.timestamp}-${index}`}
                    log={log}
                    index={index}
                    getSideIndicator={getSideIndicator}
                    getLogLevelStyles={getLogLevelStyles}
                    copyToClipboard={copyLogEntry}
                  />
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Quick Actions Footer - Enhanced */}
          <div className="mt-6 p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              🛠️ Quick Testing & Analysis Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/test-console-logging"
                className="group relative overflow-hidden p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="relative z-10">
                  <div className="text-2xl mb-2">🧪</div>
                  <h4 className="text-xl font-bold mb-2">Test Console Logging</h4>
                  <p className="text-blue-100 text-sm">
                    Generate various types of console logs to test the logging system. 
                    Perfect for debugging console interception and log capture functionality.
                  </p>
                  <div className="mt-3 text-xs text-blue-200 font-medium">
                    ▶️ Features: Error simulation, console override testing, message formatting
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-300"></div>
              </a>
              
              <a 
                href="/auto-log-review"
                className="group relative overflow-hidden p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="relative z-10">
                  <div className="text-2xl mb-2">🔍</div>
                  <h4 className="text-xl font-bold mb-2">Auto Log Analysis</h4>
                  <p className="text-purple-100 text-sm">
                    Intelligent analysis of log patterns, error detection, and automated insights. 
                    AI-powered log review for proactive issue identification.
                  </p>
                  <div className="mt-3 text-xs text-purple-200 font-medium">
                    ▶️ Features: Pattern detection, anomaly alerts, performance insights
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-300"></div>
              </a>
            </div>
            
            {/* Additional Tools Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <a 
                href="/test-log-generation"
                className="group p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <div className="text-xl mb-1">⚡</div>
                <h5 className="font-semibold text-green-800 text-sm">Log Generator</h5>
                <p className="text-green-600 text-xs mt-1">Generate test logs with various scenarios</p>
              </a>
              
              <button
                onClick={testConsoleLogging}
                className="group p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center"
              >
                <div className="text-xl mb-1">🎯</div>
                <h5 className="font-semibold text-orange-800 text-sm">Quick Test</h5>
                <p className="text-orange-600 text-xs mt-1">Generate sample logs right here</p>
              </button>
              
              <button
                onClick={exportLogs}
                className="group p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-center"
              >
                <div className="text-xl mb-1">�</div>
                <h5 className="font-semibold text-indigo-800 text-sm">Export Data</h5>
                <p className="text-indigo-600 text-xs mt-1">Download logs as JSON file</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Fixes Popout Modal */}
      {showFixPopout && selectedLogForFix && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  🔧 Suggested Fixes
                  <span className="text-lg">{getLevelEmoji(selectedLogForFix.level)}</span>
                </h3>
                <button
                  onClick={() => setShowFixPopout(false)}
                  className="text-gray-700 hover:text-gray-900 text-2xl font-semibold"
                >
                  ×
                </button>
              </div>

              {/* Error Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Timestamp:</strong> {new Date(selectedLogForFix.timestamp).toLocaleString()}
                </div>
                {selectedLogForFix.url && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>URL:</strong>{' '}
                    <a 
                      href={selectedLogForFix.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedLogForFix.url}
                    </a>
                  </div>
                )}
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Component:</strong> {selectedLogForFix.component || 'Unknown'}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  <strong>Message:</strong> {selectedLogForFix.message}
                </div>
              </div>

              {/* Suggested Fixes */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">💡 Suggested Solutions:</h4>
                <ul className="space-y-2">
                  {getSuggestedFixes(selectedLogForFix).map((fix, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">{index + 1}.</span>
                      <span className="text-gray-700">{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => copyErrorDetails(selectedLogForFix)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  📋 Copy Full Error Details
                </button>
                <button
                  onClick={() => setShowFixPopout(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
