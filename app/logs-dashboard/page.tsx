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

// Enhanced error translation helper
const translateLogMessage = (log: LogEntry): { 
  userFriendly: string; 
  technicalDetails: string; 
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
} => {
  const message = log.message.toLowerCase();
  
  // Console vs Issues categorization
  let category = 'General';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let userFriendly = log.message;
  let technicalDetails = '';

  // Network/API Issues
  if (message.includes('fetch') || message.includes('network') || message.includes('cors') || message.includes('api')) {
    category = 'Network/API';
    userFriendly = '🌐 Network connection or API communication issue';
    technicalDetails = 'The app is having trouble connecting to external services or APIs';
    severity = message.includes('cors') ? 'high' : 'medium';
  }
  
  // Authentication Issues
  else if (message.includes('auth') || message.includes('token') || message.includes('unauthorized') || message.includes('403') || message.includes('401')) {
    category = 'Authentication';
    userFriendly = '🔐 User authentication or permission issue';
    technicalDetails = 'Problems with user login, session, or access permissions';
    severity = 'high';
  }
  
  // Database Issues
  else if (message.includes('database') || message.includes('sql') || message.includes('supabase') || message.includes('query')) {
    category = 'Database';
    userFriendly = '🗄️ Database connection or data retrieval issue';
    technicalDetails = 'Problems accessing or updating information in the database';
    severity = 'critical';
  }
  
  // React/UI Issues
  else if (message.includes('hydration') || message.includes('component') || message.includes('react') || message.includes('render')) {
    category = 'UI/Component';
    userFriendly = '🎨 User interface display or component issue';
    technicalDetails = 'Problems with how the page displays or interactive elements';
    severity = 'medium';
  }
  
  // JavaScript Errors
  else if (message.includes('undefined') || message.includes('null') || message.includes('typeerror') || message.includes('referenceerror')) {
    category = 'Code Logic';
    userFriendly = '⚠️ Programming logic error affecting functionality';
    technicalDetails = 'Code trying to use data that doesn\'t exist or is invalid';
    severity = 'high';
  }
  
  // Performance Issues
  else if (message.includes('slow') || message.includes('performance') || message.includes('timeout') || message.includes('memory')) {
    category = 'Performance';
    userFriendly = '🐌 Application performance or speed issue';
    technicalDetails = 'App is running slower than expected or using too many resources';
    severity = 'medium';
  }
  
  // Security Issues
  else if (message.includes('security') || message.includes('xss') || message.includes('injection') || message.includes('vulnerability')) {
    category = 'Security';
    userFriendly = '🛡️ Security vulnerability or protection issue';
    technicalDetails = 'Potential security risks that need immediate attention';
    severity = 'critical';
  }
  
  // Console vs Issues distinction
  if (log.level === 'debug' || log.level === 'info') {
    category = category + ' (Console Info)';
  } else if (log.level === 'warn' || log.level === 'error') {
    category = category + ' (Issue)';
  }

  return { userFriendly, technicalDetails, category, severity };
};

// Enhanced severity color helper
const getSeverityStyles = (severity: 'low' | 'medium' | 'high' | 'critical') => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-300';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Memoized log item component for better performance
const LogItem = memo(({ log, index, getSideIndicator, getLogLevelStyles, copyToClipboard }: {
  log: LogEntry;
  index: number;
  getSideIndicator: (side: 'client' | 'server' | undefined) => JSX.Element;
  getLogLevelStyles: (level: LogLevel) => string;
  copyToClipboard: (log: LogEntry) => void;
}) => {
  const translation = translateLogMessage(log);
  
  return (
    <div key={`${log.id}-${index}`} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 text-xs font-bold rounded ${getLogLevelStyles(log.level)}`}>
              {log.level.toUpperCase()}
            </span>
            {getSideIndicator(log.side)}
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityStyles(translation.severity)}`}>
              {translation.category}
            </span>
            {log.component && (
              <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full font-medium">
                {log.component}
              </span>
            )}
          </div>
          
          {/* Combined User-Friendly Translation and Technical Details */}
          <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-semibold text-blue-900 mb-2">📝 What this means:</div>
            <div className="text-sm text-blue-800 mb-3">{translation.userFriendly}</div>
            {translation.technicalDetails && (
              <div className="text-xs text-blue-700 mb-3 italic">{translation.technicalDetails}</div>
            )}
            
            {/* Technical Details */}
            <div className="border-t border-blue-200 pt-3">
              <div className="text-xs font-semibold text-blue-900 mb-1">🔧 Technical Details:</div>
              <div className="text-sm font-medium text-blue-900 break-words leading-relaxed">
                {log.message}
              </div>
              {log.stack && (
                <div className="mt-2 text-xs text-blue-800 font-medium">
                  <strong>Stack:</strong> {log.stack}
                </div>
              )}
            </div>
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
  );
});

export default function LogsDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [selectedSide, setSelectedSide] = useState<'client' | 'server' | 'all'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxLogs, setMaxLogs] = useState(250); // Changed default from 150 to 250
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h'); // Changed default from '1d' to '1h'
  const [showStackTrace, setShowStackTrace] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false); // Collapsed by default
  const [selectedLogForFix, setSelectedLogForFix] = useState<LogEntry | null>(null);
  const [showFixPopout, setShowFixPopout] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false);
  const [lastLogCount, setLastLogCount] = useState(0);

  // New slider controls for log limits
  const [maxErrors, setMaxErrors] = useState(50);
  const [maxWarnings, setMaxWarnings] = useState(50);
  const [maxInfo, setMaxInfo] = useState(50);
  const [maxDebug, setMaxDebug] = useState(50);

  // Load advanced configuration if available
  useEffect(() => {
    const savedConfig = localStorage.getItem('logs_dashboard_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        // Apply relevant configurations to existing state
        if (config.timeRangeHours <= 24) {
          const timeRangeMap: { [key: number]: string } = {
            1: '1h',
            24: '1d'
          };
          const closestRange = timeRangeMap[config.timeRangeHours] || '1h';
          setSelectedTimeRange(closestRange);
        }
        
        // Set max logs based on combined limits from config
        const totalConfiguredLogs = config.maxErrors + config.maxWarnings + config.maxInfo + config.maxDebug;
        if (totalConfiguredLogs > 0) {
          setMaxLogs(Math.min(totalConfiguredLogs, 1000)); // Cap at 1000 for performance
        }
      } catch (error) {
        console.error('Failed to load advanced dashboard config:', error);
      }
    }
  }, []);

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
      // Show a brief success indicator (removed console.log to prevent feedback loop)
    } catch (err) {
      // Failed to copy to clipboard (removed console.error to prevent feedback loop)
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
      // Use direct logger to avoid console interception feedback loop
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`📊 Dashboard refresh - Time range: ${selectedTimeRange} (${timeRangeMs}ms), max: ${maxLogs}`, 'LogsDashboard');
      }
      
      // Get logs from database with time filtering (use maxLogs instead of hardcoded 300)
      allLogs = await logger.getAllLogsIncludingDatabase(maxLogs * 2, timeRangeMs); // Get 2x to allow for filtering
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`📊 Dashboard refresh - Retrieved ${allLogs.length} logs from database`, 'LogsDashboard');
      }
    } catch (error) {
      logger.error('❌ Failed to load logs:', 'LogsDashboard', { error: error instanceof Error ? error.message : String(error) });
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
      
      // Removed dashboard internal logging to prevent feedback loop
    }
    
    // Apply slider-based filtering by log type
    const errorLogs = filteredLogs.filter(log => log.level === LogLevel.ERROR).slice(0, maxErrors);
    const warnLogs = filteredLogs.filter(log => log.level === LogLevel.WARN).slice(0, maxWarnings);
    const infoLogs = filteredLogs.filter(log => log.level === LogLevel.INFO).slice(0, maxInfo);
    const debugLogs = filteredLogs.filter(log => log.level === LogLevel.DEBUG).slice(0, maxDebug);
    
    // Combine filtered logs
    filteredLogs = [...errorLogs, ...warnLogs, ...infoLogs, ...debugLogs];
    
    // Level filtering (if specific level is selected, override slider filtering)
    if (selectedLevel !== 'all') {
      const beforeFilter = filteredLogs.length;
      filteredLogs = filteredLogs.filter(log => log.level === selectedLevel);
      // Removed dashboard internal logging to prevent feedback loop
    }

    // Side filtering (client/server)
    if (selectedSide !== 'all') {
      const beforeFilter = filteredLogs.length;
      filteredLogs = filteredLogs.filter(log => (log.side || 'client') === selectedSide);
      // Removed dashboard internal logging to prevent feedback loop
    }
    
    // Component filtering
    if (selectedComponent !== 'all') {
      const beforeFilter = filteredLogs.length;
      filteredLogs = filteredLogs.filter(log => log.component === selectedComponent);
      // Removed dashboard internal logging to prevent feedback loop
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
      // Removed dashboard internal logging to prevent feedback loop
    }
    
    // Sort by timestamp
    filteredLogs.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    
    // Apply final max logs limit
    const finalLogs = filteredLogs.slice(0, maxLogs);
    // Removed dashboard internal logging to prevent feedback loop
    setLogs(finalLogs);
  }, [isPaused, selectedTimeRange, maxLogs, selectedLevel, selectedComponent, selectedSide, searchQuery, sortOrder, maxErrors, maxWarnings, maxInfo, maxDebug]);

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
    
    // Console vs Issues breakdown
    const consoleMessages = logs.filter(log => log.level === LogLevel.INFO || log.level === LogLevel.DEBUG).length;
    const issues = logs.filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.WARN).length;
    
    return { total, errors, warnings, info, debug, consoleMessages, issues };
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
    // Reset slider values to defaults
    setMaxLogs(250);
    setMaxErrors(50);
    setMaxWarnings(50);
    setMaxInfo(50);
    setMaxDebug(50);
  };

  const testConsoleLogging = () => {
    // Simple direct logging that will be captured properly
    logger.info('✅ Test message from dashboard', 'Dashboard');
    logger.error('❌ Test error from dashboard', 'Dashboard'); 
    logger.warn('⚠️ Test warning from dashboard', 'Dashboard');
    
    logger.info('Object test from dashboard', 'Dashboard', { test: 'data', timestamp: new Date() });
    
    try {
      throw new Error('Test error for logging from dashboard');
    } catch (error) {
      logger.error('Caught error from dashboard test', 'Dashboard', { error: error instanceof Error ? error.message : String(error) });
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
      // Failed to copy log entry (removed console.error to prevent feedback loop)
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
      // Failed to copy all logs (removed console.error to prevent feedback loop)
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
      // Failed to copy messages (removed console.error to prevent feedback loop)
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
        maxLogs={maxLogs}
        onMaxLogsChange={setMaxLogs}
        maxErrors={maxErrors}
        onMaxErrorsChange={setMaxErrors}
        maxWarnings={maxWarnings}
        onMaxWarningsChange={setMaxWarnings}
        maxInfo={maxInfo}
        onMaxInfoChange={setMaxInfo}
        maxDebug={maxDebug}
        onMaxDebugChange={setMaxDebug}
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
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-4">
            <button 
              onClick={() => setSelectedLevel(selectedLevel === 'all' ? 'all' : 'all')}
              className={`p-4 bg-white rounded-lg shadow-sm border text-center transition-all hover:shadow-md ${
                selectedLevel === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{logStats.total}</div>
              <div className="text-sm text-gray-800 font-semibold">Total Logs</div>
            </button>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">{logStats.consoleMessages}</div>
              <div className="text-sm text-blue-600 font-semibold">💬 Console</div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-orange-600">{logStats.issues}</div>
              <div className="text-sm text-orange-600 font-semibold">⚠️ Issues</div>
            </div>
            
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
            <div className="mb-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <h2 className="text-sm font-bold text-gray-900">Smart Insights & Issue Translation</h2>
                </div>
                <button
                  onClick={() => setInsightsCollapsed(!insightsCollapsed)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  {insightsCollapsed ? '▼' : '▲'}
                </button>
              </div>
              
              {!insightsCollapsed && (
                <div className="space-y-4">
                  {/* Console vs Issues Breakdown */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <span>📊</span>
                      What You're Seeing: Console Messages vs Real Issues
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-lg font-bold text-blue-900">{logStats.consoleMessages}</div>
                        <div className="text-sm font-semibold text-blue-800">💬 Console Messages</div>
                        <div className="text-xs text-blue-700 mt-1">
                          Normal information and debugging data - these are expected
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="text-lg font-bold text-orange-900">{logStats.issues}</div>
                        <div className="text-sm font-semibold text-orange-800">⚠️ Actual Issues</div>
                        <div className="text-xs text-orange-700 mt-1">
                          Problems that may affect user experience - needs attention
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {/* Error Analysis */}
                    {logStats.errors > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2 text-sm">
                          <span>🚨</span>
                          Critical Issues ({logStats.errors} errors)
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1 text-red-700">
                            <span>•</span>
                            <span>These break functionality and frustrate users</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-700">
                            <span>•</span>
                            <span>Check for patterns in error messages and affected pages</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-700">
                            <span>•</span>
                            <span>Look at the "What this means" section above for each error</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warning Analysis */}
                    {logStats.warnings > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2 text-sm">
                          <span>⚠️</span>
                          Potential Problems ({logStats.warnings} warnings)
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1 text-yellow-700">
                            <span>•</span>
                            <span>May become errors if not addressed</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-700">
                            <span>•</span>
                            <span>Often related to deprecated code or accessibility</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-700">
                            <span>•</span>
                            <span>Can impact performance or user experience</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Health Status - Always visible but compact */}
              <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏥</span>
                    <span className="font-semibold text-gray-900 text-sm">System Health</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <span>💡 System running smoothly! Consider checking accessibility analytics for optimization opportunities.</span>
                  </div>
                )}
              </div>
            </div>
          )}



          {/* Quick Actions & Controls - Enhanced with Filters and Additional Controls */}
          <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
            <div className="space-y-4">
              {/* Action Buttons Row */}
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

                  <button 
                    onClick={clearAllFilters}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm transition-colors"
                  >
                    🗑️ Clear Filters
                  </button>
                </div>
              </div>

              {/* Live Statistics and Controls Row */}
              <div className="border-t pt-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h4 className="text-sm font-medium text-gray-700">📊 Live Statistics & Controls:</h4>
                    
                    <label htmlFor="auto-refresh" className="flex items-center gap-2 text-sm text-gray-700">
                      <input 
                        id="auto-refresh"
                        name="auto-refresh"
                        type="checkbox" 
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      🔄 Auto Refresh
                    </label>
                    
                    <label htmlFor="auto-scroll" className="flex items-center gap-2 text-sm text-gray-700">
                      <input 
                        id="auto-scroll"
                        name="auto-scroll"
                        type="checkbox" 
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      📜 Auto Scroll
                    </label>
                  </div>

                  {/* Time Range Control */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="time-range" className="text-sm font-medium text-gray-700">⏰ Time Range:</label>
                    <select
                      id="time-range"
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1m">Last 1 min</option>
                      <option value="5m">Last 5 min</option>
                      <option value="10m">Last 10 min</option>
                      <option value="30m">Last 30 min</option>
                      <option value="1h">Last 1 hour</option>
                      <option value="1d">Last 24 hours</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Log Limits Controls */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label htmlFor="max-logs" className="block text-xs font-medium text-gray-600 mb-1">📊 Max Total Logs</label>
                    <input
                      id="max-logs"
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={maxLogs}
                      onChange={(e) => setMaxLogs(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center">{maxLogs}</div>
                  </div>
                  
                  <div>
                    <label htmlFor="max-errors" className="block text-xs font-medium text-gray-600 mb-1">❌ Max Errors</label>
                    <input
                      id="max-errors"
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={maxErrors}
                      onChange={(e) => setMaxErrors(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center">{maxErrors}</div>
                  </div>
                  
                  <div>
                    <label htmlFor="max-warnings" className="block text-xs font-medium text-gray-600 mb-1">⚠️ Max Warnings</label>
                    <input
                      id="max-warnings"
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={maxWarnings}
                      onChange={(e) => setMaxWarnings(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center">{maxWarnings}</div>
                  </div>
                  
                  <div>
                    <label htmlFor="max-info" className="block text-xs font-medium text-gray-600 mb-1">ℹ️ Max Info</label>
                    <input
                      id="max-info"
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={maxInfo}
                      onChange={(e) => setMaxInfo(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center">{maxInfo}</div>
                  </div>
                  
                  <div>
                    <label htmlFor="max-debug" className="block text-xs font-medium text-gray-600 mb-1">🐛 Max Debug</label>
                    <input
                      id="max-debug"
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={maxDebug}
                      onChange={(e) => setMaxDebug(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center">{maxDebug}</div>
                  </div>
                </div>
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
            
            <div className="logs-container h-[calc(100vh-24rem)] overflow-y-auto">
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
