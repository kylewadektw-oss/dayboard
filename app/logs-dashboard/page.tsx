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
 * - Advanced filtering by log level (ERROR, WARN, INFO), component, and side (client/server)
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
const translateLogMessage = (
  log: LogEntry
): {
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
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('cors') ||
    message.includes('api')
  ) {
    category = 'Network/API';
    userFriendly = 'Network connection or API communication issue';
    technicalDetails =
      'The app is having trouble connecting to external services or APIs';
    severity = message.includes('cors') ? 'high' : 'medium';
  }

  // Authentication Issues
  else if (
    message.includes('auth') ||
    message.includes('token') ||
    message.includes('unauthorized') ||
    message.includes('403') ||
    message.includes('401')
  ) {
    category = 'Authentication';
    userFriendly = 'User authentication or permission issue';
    technicalDetails =
      'Problems with user login, session, or access permissions';
    severity = 'high';
  }

  // Database Issues
  else if (
    message.includes('database') ||
    message.includes('sql') ||
    message.includes('supabase') ||
    message.includes('query')
  ) {
    category = 'Database';
    userFriendly = 'Database connection or data retrieval issue';
    technicalDetails =
      'Problems accessing or updating information in the database';
    severity = 'critical';
  }

  // React/UI Issues
  else if (
    message.includes('hydration') ||
    message.includes('component') ||
    message.includes('react') ||
    message.includes('render')
  ) {
    category = 'UI/Component';
    userFriendly = 'User interface display or component issue';
    technicalDetails =
      'Problems with how the page displays or interactive elements';
    severity = 'medium';
  }

  // JavaScript Errors
  else if (
    message.includes('undefined') ||
    message.includes('null') ||
    message.includes('typeerror') ||
    message.includes('referenceerror')
  ) {
    category = 'Code Logic';
    userFriendly = 'Programming logic error affecting functionality';
    technicalDetails =
      "Code trying to use data that doesn't exist or is invalid";
    severity = 'high';
  }

  // Performance Issues
  else if (
    message.includes('slow') ||
    message.includes('performance') ||
    message.includes('timeout') ||
    message.includes('memory')
  ) {
    category = 'Performance';
    userFriendly = 'Application performance or speed issue';
    technicalDetails =
      'App is running slower than expected or using too many resources';
    severity = 'medium';
  }

  // Security Issues
  else if (
    message.includes('security') ||
    message.includes('xss') ||
    message.includes('injection') ||
    message.includes('vulnerability')
  ) {
    category = 'Security';
    userFriendly = 'Security vulnerability or protection issue';
    technicalDetails = 'Potential security risks that need immediate attention';
    severity = 'critical';
  }

  // Console vs Issues distinction
  if (log.level === 'info') {
    category = category + ' (Console Info)';
  } else if (log.level === 'warn' || log.level === 'error') {
    category = category + ' (Issue)';
  }

  return { userFriendly, technicalDetails, category, severity };
};

// Enhanced severity color helper
const getSeverityStyles = (
  severity: 'low' | 'medium' | 'high' | 'critical'
) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Memoized log item component with completely new design
const LogItem = memo(
  ({
    log,
    index,
    getSideIndicator,
    getLogLevelStyles,
    copyToClipboard,
    isSelected,
    onToggleSelection
  }: {
    log: LogEntry;
    index: number;
    getSideIndicator: (side: 'client' | 'server' | undefined) => JSX.Element;
    getLogLevelStyles: (level: LogLevel) => string;
    copyToClipboard: (log: LogEntry) => void;
    isSelected: boolean;
    onToggleSelection: (logId: string) => void;
  }): React.ReactElement => {
    const typedLog = log as LogEntry;
    const translation = translateLogMessage(typedLog);
    const logId = `${log.timestamp}-${index}`;

    return (
      <div
        className={`border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-4 overflow-hidden ${
          isSelected
            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
            : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelection(logId)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="sr-only">Select this log entry</span>
              </label>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${getLogLevelStyles(log.level)}`}
              >
                {log.level.toUpperCase()}
              </span>
              {getSideIndicator(log.side)}
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityStyles(translation.severity)}`}
              >
                {translation.category}
              </span>
              {log.component ? (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                  {log.component}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <button
                onClick={() => copyToClipboard(log)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                title="Copy log details"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* User-Friendly Message */}
          <div className="mb-4">
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {translation.userFriendly}
            </div>
            {translation.technicalDetails ? (
              <div className="text-sm text-gray-600 italic">
                {translation.technicalDetails}
              </div>
            ) : null}
          </div>

          {/* Collapsible Technical Details */}
          <details className="group">
            <summary className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors mb-3">
              <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full group-open:bg-blue-100 group-open:text-blue-600 transition-colors">
                🔧
              </span>
              Technical Details
              <span className="ml-auto text-xs text-gray-500 group-open:hidden">
                Click to expand
              </span>
            </summary>

            <div className="space-y-4 pl-7 border-l-2 border-gray-100">
              {/* Enhanced Data in Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* User Information */}
                {log.userInfo ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
                      <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs">
                        👤
                      </span>
                      User Information
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">ID:</span>
                        <span className="text-blue-800">
                          {log.userInfo.id || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">
                          Email:
                        </span>
                        <span className="text-blue-800">
                          {log.userInfo.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">Role:</span>
                        <span className="text-blue-800">
                          {log.userInfo.role || 'user'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">Name:</span>
                        <span className="text-blue-800">
                          {log.userInfo.displayName || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Device Information */}
                {log.deviceInfo ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold text-green-900 mb-3">
                      <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs">
                        📱
                      </span>
                      Device Detection
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700 font-medium">
                          Browser:
                        </span>
                        <span className="text-green-800">
                          {log.deviceInfo.browser} {log.deviceInfo.version}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 font-medium">
                          Platform:
                        </span>
                        <span className="text-green-800">
                          {log.deviceInfo.platform}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 font-medium">
                          Screen:
                        </span>
                        <span className="text-green-800">
                          {log.deviceInfo.screenSize}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 font-medium">
                          Mobile:
                        </span>
                        <span className="text-green-800">
                          {log.deviceInfo.mobile ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Performance Metrics */}
                {log.performanceInfo ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold text-yellow-900 mb-3">
                      <span className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-xs">
                        ⚡
                      </span>
                      Performance
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700 font-medium">
                          Memory:
                        </span>
                        <span className="text-yellow-800">
                          {log.performanceInfo.memoryUsage
                            ? `${log.performanceInfo.memoryUsage} MB`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700 font-medium">
                          Load Time:
                        </span>
                        <span className="text-yellow-800">
                          {log.performanceInfo.loadTime
                            ? `${log.performanceInfo.loadTime} ms`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700 font-medium">
                          Network:
                        </span>
                        <span className="text-yellow-800">
                          {log.performanceInfo.networkSpeed || 'unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Network Information */}
                {log.networkInfo ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 font-semibold text-purple-900 mb-3">
                      <span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-xs">
                        🌐
                      </span>
                      Network Status
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700 font-medium">
                          Online:
                        </span>
                        <span className="text-purple-800">
                          {log.networkInfo.online ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700 font-medium">
                          Type:
                        </span>
                        <span className="text-purple-800">
                          {log.networkInfo.connectionType || 'unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700 font-medium">
                          Speed:
                        </span>
                        <span className="text-purple-800">
                          {log.networkInfo.downlink
                            ? `${log.networkInfo.downlink} Mbps`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700 font-medium">
                          Language:
                        </span>
                        <span className="text-purple-800">
                          {log.networkInfo.language || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Error context temporarily disabled due to TypeScript issue */}

              {/* Raw Data */}
              {log.data ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                    <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      📦
                    </span>
                    Raw Data
                  </div>
                  <pre className="text-xs text-gray-700 font-mono bg-white p-3 rounded border overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ) : null}

              {/* Stack Trace */}
              {log.stack ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                    <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      📋
                    </span>
                    Stack Trace
                  </div>
                  <pre className="text-xs text-gray-700 font-mono bg-white p-3 rounded border overflow-x-auto">
                    {log.stack}
                  </pre>
                </div>
              ) : null}
            </div>
          </details>
        </div>
      </div>
    );
  }
);

LogItem.displayName = 'LogItem';

export default function LogsDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [selectedSide, setSelectedSide] = useState<'client' | 'server' | 'all'>(
    'all'
  );
  const [autoRefresh, setAutoRefresh] = useState(false); // Temporarily disabled to prevent infinite loops
  const [searchQuery, setSearchQuery] = useState('');
  const [maxLogs, setMaxLogs] = useState(1000); // Increased default to max
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1m');
  const [sortOrder] = useState<'desc' | 'asc'>('desc');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [insightsCollapsed, setInsightsCollapsed] = useState(true);
  const [selectedLogForFix] = useState<LogEntry | null>(null);
  const [showFixPopout, setShowFixPopout] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false);
  const [lastLogCount, setLastLogCount] = useState(0);

  // Updated slider controls - removed debug entirely
  const [maxErrors, setMaxErrors] = useState(200); // Increased to max
  const [maxWarnings, setMaxWarnings] = useState(200); // Increased to max
  const [maxInfo, setMaxInfo] = useState(200); // Increased to max

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
          const closestRange = timeRangeMap[config.timeRangeHours] || '1m';
          setSelectedTimeRange(closestRange);
        }

        // Set max logs based on combined limits from config
        const totalConfiguredLogs =
          config.maxErrors + config.maxWarnings + config.maxInfo;
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
      case LogLevel.ERROR:
        return 'text-red-800 bg-red-100 border-red-200 font-bold';
      case LogLevel.WARN:
        return 'text-yellow-800 bg-yellow-100 border-yellow-200 font-semibold';
      case LogLevel.INFO:
        return 'text-blue-800 bg-blue-100 border-blue-200 font-medium';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 font-medium';
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
        <div
          className={`w-2 h-2 rounded-full mr-1 ${isClient ? 'bg-blue-500' : 'bg-purple-500'}`}
        ></div>
        {isClient ? 'Client' : 'Server'}
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
    if (
      message.includes('auth') ||
      message.includes('token') ||
      message.includes('unauthorized')
    ) {
      fixes.push('Check if the authentication token is valid and not expired');
      fixes.push('Verify the user has proper permissions for this action');
      fixes.push('Ensure the authentication header is properly set');
    }

    // Database errors
    if (
      message.includes('database') ||
      message.includes('sql') ||
      message.includes('supabase')
    ) {
      fixes.push('Check database connection and credentials');
      fixes.push('Verify the table/column names are correct');
      fixes.push('Ensure proper database permissions are set');
    }

    // React/Component errors
    if (message.includes('hydration') || message.includes('hydrate')) {
      fixes.push('Check for server-client rendering mismatches');
      fixes.push(
        'Ensure consistent data between SSR and client-side rendering'
      );
      fixes.push('Verify useEffect dependencies are properly set');
    }

    // Circular reference errors
    if (message.includes('circular') || message.includes('json')) {
      fixes.push(
        'Remove circular references from objects before serialization'
      );
      fixes.push('Use JSON.stringify with a replacer function');
      fixes.push(
        'Consider using a library like "flatted" for circular object serialization'
      );
    }

    // Network/Fetch errors
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('timeout')
    ) {
      fixes.push('Check your internet connection');
      fixes.push('Verify the API endpoint URL is correct');
      fixes.push('Consider implementing retry logic for network requests');
    }

    // Build/Compilation errors
    if (
      message.includes('module') ||
      message.includes('import') ||
      message.includes('export')
    ) {
      fixes.push('Check if the module path is correct');
      fixes.push('Ensure the imported function/component is properly exported');
      fixes.push('Verify node_modules dependencies are installed');
    }

    // Generic error suggestions if no specific match
    if (fixes.length === 0) {
      if (log.level === LogLevel.ERROR) {
        fixes.push('Check the browser console for additional error details');
        fixes.push(
          'Review the stack trace for the exact line causing the error'
        );
        fixes.push('Try refreshing the page or clearing browser cache');
      } else if (log.level === LogLevel.WARN) {
        fixes.push(
          'This warning may not break functionality but should be addressed'
        );
        fixes.push('Review the code path that generated this warning');
        fixes.push('Consider updating deprecated methods or configurations');
      }
    }

    return fixes;
  };

  // Copy entire error portion to clipboard
  const copyErrorDetails = async (log: LogEntry) => {
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
${getSuggestedFixes(log)
  .map((fix, i) => `${i + 1}. ${fix}`)
  .join('\n')}

User Agent: ${log.userAgent || 'N/A'}
=== END ERROR LOG ===
    `.trim();

    try {
      await navigator.clipboard.writeText(formattedText);
      // Show a brief success indicator (removed console.log to prevent feedback loop)
    } catch {
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
      const timeRangeMs =
        selectedTimeRange !== 'all'
          ? getTimeRangeMs(selectedTimeRange)
          : undefined;
      // Use direct logger to avoid console interception feedback loop
      if (process.env.NODE_ENV === 'development') {
        logger.debug(
          `📊 Dashboard refresh - Time range: ${selectedTimeRange} (${timeRangeMs}ms), max: ${maxLogs}`,
          'LogsDashboard'
        );
      }

      // Get logs from database with time filtering (use maxLogs instead of hardcoded 300)
      // Add timeout protection
      const timeoutPromise = new Promise<LogEntry[]>(
        (_, reject) =>
          setTimeout(() => reject(new Error('Logs refresh timeout')), 12000) // 12 second timeout
      );

      const logsPromise = logger.getAllLogsIncludingDatabase(
        maxLogs * 2,
        timeRangeMs
      ); // Get 2x to allow for filtering

      try {
        allLogs = await Promise.race([logsPromise, timeoutPromise]);
        if (process.env.NODE_ENV === 'development') {
          logger.debug(
            `📊 Dashboard refresh - Retrieved ${allLogs.length} logs from database`,
            'LogsDashboard'
          );
        }
      } catch (dbError) {
        console.warn(
          'Database query failed or timed out, falling back to memory logs:',
          dbError
        );
        // Fallback to memory logs only
        allLogs = logger.getAllLogs().slice(0, maxLogs);
      }
    } catch (error) {
      logger.error('❌ Failed to load logs:', 'LogsDashboard', {
        error: error instanceof Error ? error.message : String(error)
      });
      // Fallback to memory logs only
      allLogs = logger.getAllLogs().slice(0, maxLogs);
    }

    let filteredLogs = [...allLogs];

    // Additional time range filtering for memory logs if needed
    if (selectedTimeRange !== 'all' && filteredLogs.length > 0) {
      const now = Date.now();
      const cutoff = now - getTimeRangeMs(selectedTimeRange);

      filteredLogs = filteredLogs.filter((log) => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime > cutoff;
      });

      // Removed dashboard internal logging to prevent feedback loop
    }

    // Apply slider-based filtering by log type (removed debug)
    const errorLogs = filteredLogs
      .filter((log) => log.level === LogLevel.ERROR)
      .slice(0, maxErrors);
    const warnLogs = filteredLogs
      .filter((log) => log.level === LogLevel.WARN)
      .slice(0, maxWarnings);
    const infoLogs = filteredLogs
      .filter((log) => log.level === LogLevel.INFO)
      .slice(0, maxInfo);

    // Combine filtered logs
    filteredLogs = [...errorLogs, ...warnLogs, ...infoLogs];

    // Level filtering (if specific level is selected, override slider filtering)
    if (selectedLevel !== 'all') {
      filteredLogs = filteredLogs.filter((log) => log.level === selectedLevel);
      // Removed dashboard internal logging to prevent feedback loop
    }

    // Side filtering (client/server)
    if (selectedSide !== 'all') {
      filteredLogs = filteredLogs.filter(
        (log) => (log.side || 'client') === selectedSide
      );
      // Removed dashboard internal logging to prevent feedback loop
    }

    // Component filtering
    if (selectedComponent !== 'all') {
      filteredLogs = filteredLogs.filter(
        (log) => log.component === selectedComponent
      );
      // Removed dashboard internal logging to prevent feedback loop
    }

    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          (log.data &&
            JSON.stringify(log.data).toLowerCase().includes(query)) ||
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
  }, [
    isPaused,
    selectedTimeRange,
    maxLogs,
    selectedLevel,
    selectedComponent,
    selectedSide,
    searchQuery,
    sortOrder,
    maxErrors,
    maxWarnings,
    maxInfo
  ]);

  useEffect(() => {
    logger.setupConsoleInterception();
    refreshLogs();
  }, [
    selectedLevel,
    selectedComponent,
    selectedSide,
    searchQuery,
    maxLogs,
    selectedTimeRange,
    sortOrder,
    refreshLogs
  ]);

  // Separate useEffect for auto-refresh interval to prevent restart on filter changes
  useEffect(() => {
    if (autoRefresh && !isPaused) {
      const interval = setInterval(() => {
        refreshLogs();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isPaused, refreshLogs]);

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

  // Computed statistics with enhanced analytics
  const logStats = useMemo(() => {
    const total = logs.length;
    const errors = logs.filter((log) => log.level === LogLevel.ERROR).length;
    const warnings = logs.filter((log) => log.level === LogLevel.WARN).length;
    const info = logs.filter((log) => log.level === LogLevel.INFO).length;

    // Console vs Issues breakdown
    const consoleMessages = logs.filter(
      (log) => log.level === LogLevel.INFO
    ).length;
    const issues = logs.filter(
      (log) => log.level === LogLevel.ERROR || log.level === LogLevel.WARN
    ).length;

    return { total, errors, warnings, info, consoleMessages, issues };
  }, [logs]);

  // Enhanced analytics for Top 3 insights
  const getTop3Analytics = useMemo(() => {
    if (logs.length === 0)
      return { components: [], errorTypes: [], timeHotspots: [] };

    // Top 3 Components by Issue Count
    const componentIssues = logs
      .filter(
        (log) => log.level === LogLevel.ERROR || log.level === LogLevel.WARN
      )
      .reduce(
        (acc, log) => {
          const comp = log.component || 'Unknown';
          acc[comp] = (acc[comp] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const topComponents = Object.entries(componentIssues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([component, count]) => ({ component, count }));

    // Top 3 Error Types/Patterns
    const errorPatterns = logs
      .filter((log) => log.level === LogLevel.ERROR)
      .reduce(
        (acc, log) => {
          const message = log.message.toLowerCase();
          let pattern = 'Unknown Error';

          if (message.includes('cors') || message.includes('cross-origin'))
            pattern = 'CORS/Network Issues';
          else if (
            message.includes('auth') ||
            message.includes('token') ||
            message.includes('unauthorized')
          )
            pattern = 'Authentication Failures';
          else if (
            message.includes('database') ||
            message.includes('sql') ||
            message.includes('supabase')
          )
            pattern = 'Database Connection Issues';
          else if (
            message.includes('hydration') ||
            message.includes('component') ||
            message.includes('react')
          )
            pattern = 'React Hydration/Component Issues';
          else if (
            message.includes('undefined') ||
            message.includes('null') ||
            message.includes('reference')
          )
            pattern = 'Null/Undefined References';
          else if (
            message.includes('fetch') ||
            message.includes('network') ||
            message.includes('timeout')
          )
            pattern = 'API/Network Timeouts';
          else if (
            message.includes('parse') ||
            message.includes('json') ||
            message.includes('syntax')
          )
            pattern = 'Data Parsing Errors';

          acc[pattern] = (acc[pattern] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const topErrorTypes = Object.entries(errorPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    // Top 3 Time Hotspots (hours of day with most issues)
    const hourlyIssues = logs
      .filter(
        (log) => log.level === LogLevel.ERROR || log.level === LogLevel.WARN
      )
      .reduce(
        (acc, log) => {
          const hour = new Date(log.timestamp).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

    const topTimeHotspots = Object.entries(hourlyIssues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        timeRange: `${hour.padStart(2, '0')}:00-${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
      }));

    return {
      components: topComponents,
      errorTypes: topErrorTypes,
      timeHotspots: topTimeHotspots
    };
  }, [logs]);

  // Get specific fixes for top error patterns
  const getSpecificFixes = (errorType: string): string[] => {
    const fixesMap: Record<string, string[]> = {
      'CORS/Network Issues': [
        'Add proper CORS headers in your API: Access-Control-Allow-Origin, Access-Control-Allow-Methods',
        'Configure proxy in next.config.js for API calls during development',
        'Ensure your API server is running and accessible from the client domain'
      ],
      'Authentication Failures': [
        'Check if tokens are properly stored in localStorage/cookies and not expired',
        'Implement token refresh logic before API calls',
        'Verify Supabase auth configuration and session management'
      ],
      'Database Connection Issues': [
        'Check Supabase connection string and API keys in environment variables',
        'Verify database is not hitting connection limits or is temporarily down',
        'Implement connection retry logic with exponential backoff'
      ],
      'React Hydration/Component Issues': [
        'Ensure server and client render the same content initially',
        'Use useEffect for client-only code that differs from server',
        'Check for missing dependencies in useEffect arrays'
      ],
      'Null/Undefined References': [
        'Add null/undefined checks before accessing object properties',
        'Use optional chaining (?.) and nullish coalescing (??)',
        'Initialize variables with default values'
      ],
      'API/Network Timeouts': [
        'Increase timeout values for slow API endpoints',
        'Add retry logic for failed network requests',
        'Implement loading states and error boundaries'
      ],
      'Data Parsing Errors': [
        'Validate API response structure before parsing',
        'Use try-catch blocks around JSON.parse operations',
        'Add schema validation for incoming data'
      ]
    };

    return (
      fixesMap[errorType] || [
        'Review the specific error message for clues',
        'Check browser console for stack traces',
        'Consider adding more detailed error logging'
      ]
    );
  };

  // Helper to get unique components

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const clearAllFilters = () => {
    setSelectedLevel('all');
    setSelectedComponent('all');
    setSelectedSide('all');
    setSelectedTimeRange('1m'); // Reset to 1 minute default
    setSearchQuery('');
    // Reset slider values to defaults
    setMaxLogs(1000); // Reset to max default
    setMaxErrors(200);
    setMaxWarnings(200);
    setMaxInfo(200);
  };

  const testConsoleLogging = () => {
    // Simple direct logging that will be captured properly
    logger.info('✅ Test message from dashboard', 'Dashboard');
    logger.error('❌ Test error from dashboard', 'Dashboard');
    logger.warn('⚠️ Test warning from dashboard', 'Dashboard');

    logger.info('Object test from dashboard', 'Dashboard', {
      test: 'data',
      timestamp: new Date()
    });

    try {
      throw new Error('Test error for logging from dashboard');
    } catch (error) {
      logger.error('Caught error from dashboard test', 'Dashboard', {
        error: error instanceof Error ? error.message : String(error)
      });
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
      logsContainer.scrollTo({
        top: logsContainer.scrollHeight,
        behavior: 'smooth'
      });
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
    } catch {
      // Failed to copy log entry (removed console.error to prevent feedback loop)
    }
  };

  const copyAllVisibleLogs = async () => {
    const allLogsText = logs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()}: ${log.message}${log.component ? ` (${log.component})` : ''}${log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''}${log.stack ? `\nStack: ${log.stack}` : ''}`
      )
      .join('\n\n---\n\n');

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
    } catch {
      // Failed to copy all logs (removed console.error to prevent feedback loop)
    }
  };

  const copyMessagesOnly = async () => {
    const messagesText = logs
      .map(
        (log) =>
          `[${formatTimestamp(log.timestamp)}] ${log.level}: ${log.message}`
      )
      .join('\n');

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
    } catch {
      // Failed to copy messages (removed console.error to prevent feedback loop)
    }
  };

  const getLevelEmoji = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'ERR';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.INFO:
        return 'INFO';
      default:
        return 'LOG';
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

  // Multi-selection functions
  const toggleLogSelection = (logId: string) => {
    const newSelection = new Set(selectedLogIds);
    if (newSelection.has(logId)) {
      newSelection.delete(logId);
    } else {
      newSelection.add(logId);
    }
    setSelectedLogIds(newSelection);
  };

  const selectAllVisibleLogs = () => {
    const allVisibleIds = new Set(
      logs.map((_, index) => `${logs[index].timestamp}-${index}`)
    );
    setSelectedLogIds(allVisibleIds);
  };

  const clearSelection = () => {
    setSelectedLogIds(new Set());
  };

  const exportSelectedLogs = () => {
    const selectedLogs = logs.filter((_, index) =>
      selectedLogIds.has(`${logs[index].timestamp}-${index}`)
    );
    if (selectedLogs.length === 0) {
      alert('No logs selected for export');
      return;
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      total_selected: selectedLogs.length,
      logs: selectedLogs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-logs-${selectedLogs.length}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Clear selection after export
    clearSelection();
  };

  return (
    <>
      {/* Enhanced Sidebar Navigation with Filters */}
      <LoggingNav
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area - Completely Revamped */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-80'
        }`}
      >
        <div className="p-6 max-w-full mx-auto bg-gradient-to-br from-gray-50 to-blue-50 h-screen overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 flex-shrink-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application Logs
              </h1>
              <p className="text-gray-600">
                Real-time monitoring and diagnostics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInsightsCollapsed(!insightsCollapsed)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md ${
                  logStats.errors === 0 && logStats.warnings < 5
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : logStats.errors > 0
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
                title={`Click to ${insightsCollapsed ? 'view' : 'hide'} detailed health insights`}
              >
                <span className="w-2 h-2 rounded-full bg-current inline-block mr-2"></span>
                {logStats.errors === 0 && logStats.warnings < 5
                  ? 'Healthy'
                  : logStats.errors > 0
                    ? 'Critical'
                    : 'Warning'}
              </button>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isPaused
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full inline-block mr-2 ${
                    isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'
                  }`}
                ></span>
                {isPaused ? 'Paused' : 'Live'}
              </div>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  isPaused
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>

          {/* Statistics Cards - Streamlined */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 flex-shrink-0">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`p-6 bg-white rounded-2xl shadow-sm border-2 text-center transition-all hover:shadow-lg ${
                selectedLevel === 'all'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {logStats.total}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Logs
              </div>
            </button>

            <button
              onClick={() =>
                setSelectedLevel(
                  selectedLevel === LogLevel.INFO ? 'all' : LogLevel.INFO
                )
              }
              className={`p-6 rounded-2xl shadow-sm border-2 text-center transition-all hover:shadow-lg ${
                selectedLevel === LogLevel.INFO
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-blue-200 hover:border-blue-300 bg-gradient-to-r from-green-50 to-blue-50'
              }`}
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {logStats.consoleMessages}
              </div>
              <div className="text-sm text-blue-600 font-medium flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Console
              </div>
            </button>

            <button
              onClick={() =>
                setSelectedLevel(
                  selectedLevel === LogLevel.ERROR ? 'all' : LogLevel.ERROR
                )
              }
              className={`p-6 bg-white rounded-2xl shadow-sm border-2 text-center transition-all hover:shadow-lg ${
                selectedLevel === LogLevel.ERROR
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="text-3xl font-bold text-red-600 mb-2">
                {logStats.errors}
              </div>
              <div className="text-sm text-red-600 font-medium flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                Errors
              </div>
            </button>

            <button
              onClick={() =>
                setSelectedLevel(
                  selectedLevel === LogLevel.WARN ? 'all' : LogLevel.WARN
                )
              }
              className={`p-6 bg-white rounded-2xl shadow-sm border-2 text-center transition-all hover:shadow-lg ${
                selectedLevel === LogLevel.WARN
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {logStats.warnings}
              </div>
              <div className="text-sm text-yellow-600 font-medium flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                Warnings
              </div>
            </button>
          </div>

          {/* Enhanced System Health Alert with Top 3 Analytics */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 mb-8 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg bg-gray-800 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  System Health & Analytics
                </h2>
              </div>
              <button
                onClick={() => setInsightsCollapsed(!insightsCollapsed)}
                className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
              >
                {insightsCollapsed
                  ? '▼ Show Insights & Fixes'
                  : '▲ Hide Insights'}
              </button>
            </div>

            {!insightsCollapsed && (
              <div className="space-y-8">
                {/* Top 3 Analytics Row */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Top 3 Problem Components */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                      Top 3 Problem Components
                    </h4>
                    {getTop3Analytics.components.length > 0 ? (
                      <ul className="space-y-2">
                        {getTop3Analytics.components.map((comp, idx) => (
                          <li
                            key={comp.component}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium text-purple-700">
                              {idx + 1}. {comp.component}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                              {comp.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-purple-600">
                        No problematic components identified
                      </p>
                    )}
                  </div>

                  {/* Top 3 Error Types */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      Top 3 Error Patterns
                    </h4>
                    {getTop3Analytics.errorTypes.length > 0 ? (
                      <ul className="space-y-2">
                        {getTop3Analytics.errorTypes.map((error, idx) => (
                          <li
                            key={error.type}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium text-red-700">
                              {idx + 1}. {error.type}
                            </span>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                              {error.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-red-600">
                        No error patterns detected
                      </p>
                    )}
                  </div>

                  {/* Top 3 Time Hotspots */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                    <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      Top 3 Problem Times
                    </h4>
                    {getTop3Analytics.timeHotspots.length > 0 ? (
                      <ul className="space-y-2">
                        {getTop3Analytics.timeHotspots.map((time, idx) => (
                          <li
                            key={time.hour}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium text-orange-700">
                              {idx + 1}. {time.timeRange}
                            </span>
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                              {time.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-orange-600">
                        No time patterns detected
                      </p>
                    )}
                  </div>
                </div>

                {/* Actionable Fixes Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  {logStats.errors > 0 && (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-5">
                      <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        🚨 Critical Issues ({logStats.errors} errors)
                      </h4>

                      {/* Top Error Pattern Fixes */}
                      {getTop3Analytics.errorTypes.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-red-700 mb-2">
                            Quick Fix for: {getTop3Analytics.errorTypes[0].type}
                          </h5>
                          <ul className="space-y-1 text-sm text-red-600">
                            {getSpecificFixes(
                              getTop3Analytics.errorTypes[0].type
                            )
                              .slice(0, 2)
                              .map((fix, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-red-500 font-bold">
                                    ⚡
                                  </span>
                                  <span>{fix}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      <div className="border-t border-red-200 pt-3">
                        <h5 className="text-sm font-semibold text-red-700 mb-2">
                          General Actions:
                        </h5>
                        <ul className="space-y-1 text-sm text-red-600">
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>
                              These break functionality and impact users
                              directly
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Requires immediate developer attention</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>
                              Check stack traces for exact failure points
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {logStats.warnings > 0 && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5">
                      <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        ⚠️ Potential Problems ({logStats.warnings} warnings)
                      </h4>
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-yellow-700 mb-2">
                          Recommended Actions:
                        </h5>
                        <ul className="space-y-1 text-sm text-yellow-600">
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500 font-bold">
                              🔧
                            </span>
                            <span>
                              Schedule fixes during next maintenance window
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500 font-bold">
                              📊
                            </span>
                            <span>Monitor for escalation to errors</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500 font-bold">
                              🔍
                            </span>
                            <span>Review for deprecated code patterns</span>
                          </li>
                        </ul>
                      </div>
                      <div className="border-t border-yellow-200 pt-3">
                        <h5 className="text-sm font-semibold text-yellow-700 mb-2">
                          Prevention Tips:
                        </h5>
                        <ul className="space-y-1 text-sm text-yellow-600">
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Update dependencies regularly</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Run linters in pre-commit hooks</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Add TypeScript strict mode checks</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                {(getTop3Analytics.errorTypes.length > 0 ||
                  getTop3Analytics.components.length > 0) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">
                      Quick Filter Actions:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {getTop3Analytics.errorTypes.slice(0, 2).map((error) => (
                        <button
                          key={error.type}
                          onClick={() => {
                            setSearchQuery(
                              error.type.split(' ')[0].toLowerCase()
                            );
                            setSelectedLevel(LogLevel.ERROR);
                          }}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          Filter {error.type} ({error.count})
                        </button>
                      ))}
                      {getTop3Analytics.components.slice(0, 2).map((comp) => (
                        <button
                          key={comp.component}
                          onClick={() => {
                            setSelectedComponent(comp.component);
                          }}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                        >
                          Filter {comp.component} ({comp.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 mb-8 flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-gray-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              Quick Actions
            </h3>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={refreshLogs}
                disabled={isPaused}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
              >
                Refresh
              </button>

              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Clear All
              </button>

              <button
                onClick={exportLogs}
                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                Export
              </button>

              <button
                onClick={testConsoleLogging}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
              >
                Test Logs
              </button>

              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Clear Filters
              </button>

              <a
                href="/logs-dashboard/devtools"
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium flex items-center gap-2"
              >
                🔍 DevTools Monitor
              </a>

              <button
                onClick={() => {
                  setSelectedComponent('RemoteMonitor');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium flex items-center gap-2"
              >
                🌐 Remote Sites
              </button>

              <a
                href="/REMOTE_MONITORING_SETUP.md"
                target="_blank"
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
              >
                📖 Setup Guide
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Auto Refresh
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Auto Scroll
              </label>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Time Range:
                </label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
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

          {/* Logs Display */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-gray-200 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                  </div>
                  Recent Logs ({logs.length} shown)
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={copyMessagesOnly}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors font-medium"
                    title="Copy just messages"
                  >
                    Messages
                  </button>
                  <button
                    onClick={copyAllVisibleLogs}
                    className="px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors font-medium"
                    title="Copy all visible logs"
                  >
                    Full Details
                  </button>
                  <button
                    onClick={scrollToTop}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    title="Scroll to top"
                  >
                    Top
                  </button>
                  <button
                    onClick={scrollToBottom}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors font-medium"
                    title="Scroll to bottom"
                  >
                    Bottom
                  </button>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                    Multi-Selection:
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedLogIds.size} of {logs.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllVisibleLogs}
                    className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors font-medium"
                    title="Select all visible logs"
                  >
                    All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    title="Clear selection"
                    disabled={selectedLogIds.size === 0}
                  >
                    Clear
                  </button>
                  <button
                    onClick={exportSelectedLogs}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors font-medium"
                    title="Export selected logs as JSON"
                    disabled={selectedLogIds.size === 0}
                  >
                    Export ({selectedLogIds.size})
                  </button>
                </div>
              </div>
            </div>

            <div className="logs-container flex-1 overflow-y-auto p-6 bg-gray-50 min-h-0">
              {logs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-2">
                    No logs found
                  </div>
                  <div className="text-gray-600">
                    Try adjusting your filters or generate some test logs
                  </div>
                </div>
              ) : (
                logs.map((log, index) => {
                  const logId = `${log.timestamp}-${index}`;
                  return (
                    <LogItem
                      key={logId}
                      log={log}
                      index={index}
                      getSideIndicator={getSideIndicator}
                      getLogLevelStyles={getLogLevelStyles}
                      copyToClipboard={copyLogEntry}
                      isSelected={selectedLogIds.has(logId)}
                      onToggleSelection={toggleLogSelection}
                    />
                  );
                })
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
                  <div className="w-5 h-5 rounded-lg bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  Suggested Fixes
                  <span className="text-lg font-mono text-gray-600">
                    {getLevelEmoji(selectedLogForFix.level)}
                  </span>
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
                  <strong>Timestamp:</strong>{' '}
                  {new Date(selectedLogForFix.timestamp).toLocaleString()}
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
                  <strong>Component:</strong>{' '}
                  {selectedLogForFix.component || 'Unknown'}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  <strong>Message:</strong> {selectedLogForFix.message}
                </div>
              </div>

              {/* Suggested Fixes */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  Suggested Solutions:
                </h4>
                <ul className="space-y-2">
                  {getSuggestedFixes(selectedLogForFix).map((fix, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">
                        {index + 1}.
                      </span>
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
                  <div className="w-3 h-3 border border-white rounded"></div>
                  Copy Full Error Details
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
