'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { logger, LogLevel, LogEntry } from '@/utils/logger';
import LoggingNav from '@/components/logging/LoggingNav';
import { ChevronLeft, ChevronRight, Filter, Search, Clock, Layers, Component, RotateCcw } from 'lucide-react';

export default function LogsDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxLogs, setMaxLogs] = useState(500);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | 'all'>('24h'); // Changed default to 24h
  const [showStackTrace, setShowStackTrace] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterSidebarCollapsed, setFilterSidebarCollapsed] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false); // Default to false for less glitchy behavior
  const [lastLogCount, setLastLogCount] = useState(0);

  // Toggle function for level filtering
  const toggleLevelFilter = (level: LogLevel | 'all') => {
    if (selectedLevel === level) {
      setSelectedLevel('all'); // If clicking the same level, clear filter
    } else {
      setSelectedLevel(level); // Otherwise, set the new filter
    }
  };

  const refreshLogs = async () => {
    if (isPaused) return;
    
    // Try to get logs from database + memory, fallback to memory only
    let allLogs: LogEntry[] = [];
    try {
      allLogs = await logger.getAllLogsIncludingDatabase();
    } catch (error) {
      // Fallback to memory logs only
      allLogs = logger.getAllLogs();
    }
    
    let filteredLogs = [...allLogs];
    
    // Time range filtering
    if (selectedTimeRange !== 'all') {
      const now = Date.now();
      const timeMap = { '1h': 3600000, '6h': 21600000, '24h': 86400000 };
      const cutoff = now - timeMap[selectedTimeRange];
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() > cutoff);
    }
    
    // Level filtering
    if (selectedLevel !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === selectedLevel);
    }
    
    // Component filtering
    if (selectedComponent !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.component === selectedComponent);
    }
    
    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(query) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(query)) ||
        (log.component && log.component.toLowerCase().includes(query)) ||
        (log.stack && log.stack.toLowerCase().includes(query))
      );
    }
    
    // Sort by timestamp
    filteredLogs.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    
    setLogs(filteredLogs.slice(0, maxLogs));
  };

  useEffect(() => {
    // Setup console interception when component mounts
    logger.setupConsoleInterception();
    
    // Initial load
    refreshLogs();
    
    if (autoRefresh && !isPaused) {
      const interval = setInterval(() => {
        refreshLogs();
      }, 2000); // Refresh every 2 seconds instead of 1 for smoother experience
      return () => clearInterval(interval);
    }
  }, [selectedLevel, selectedComponent, autoRefresh, searchQuery, maxLogs, isPaused, selectedTimeRange, sortOrder]);

  // Auto-scroll to bottom when new logs arrive (only if count actually increased)
  useEffect(() => {
    if (autoScroll && autoRefresh && !isPaused && logs.length > lastLogCount) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setLastLogCount(logs.length);
  }, [logs.length]); // Only depend on log count, not the entire logs array

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
    return ['all', ...Array.from(new Set(logs.map(log => log.component).filter(Boolean)))];
  }, [logs]);

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const testConsoleLogging = () => {
    console.log('✅ Test console.log message');
    console.error('❌ Test console.error message'); 
    console.warn('⚠️ Test console.warn message');
    console.info('ℹ️ Test console.info message');
    console.debug('🐛 Test console.debug message');
    
    // Test with objects
    console.log('Object test:', { test: 'data', timestamp: new Date() });
    
    // Test with error
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
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    const logsContainer = document.querySelector('.max-h-96.overflow-y-auto');
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
      // Show temporary feedback
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
      // Show temporary feedback
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
      case LogLevel.DEBUG: return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
      <LoggingNav />
      <div className="p-4 max-w-full mx-auto bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">📊 Enhanced Logs Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {isPaused ? '⏸️ Paused' : '🔄 Live'}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              {isCollapsed ? '🔼 Expand' : '🔽 Collapse'}
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                isPaused ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
          </div>
        </div>
        
        {/* Statistics Panel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <button 
            onClick={() => toggleLevelFilter('all')}
            title="Click to show all logs"
            className={`p-4 bg-white rounded-lg shadow-sm border text-center hover:bg-gray-50 transition-colors cursor-pointer ${
              selectedLevel === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-gray-700">{logStats.total}</div>
            <div className="text-sm text-gray-500">Total Logs</div>
          </button>
          <button 
            onClick={() => toggleLevelFilter(LogLevel.ERROR)}
            title={selectedLevel === LogLevel.ERROR ? "Click to clear error filter" : "Click to filter errors only"}
            className={`p-4 bg-white rounded-lg shadow-sm border text-center hover:bg-red-50 transition-colors cursor-pointer ${
              selectedLevel === LogLevel.ERROR ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-red-600">{logStats.errors}</div>
            <div className="text-sm text-red-500">❌ Errors</div>
          </button>
          <button 
            onClick={() => toggleLevelFilter(LogLevel.WARN)}
            title={selectedLevel === LogLevel.WARN ? "Click to clear warning filter" : "Click to filter warnings only"}
            className={`p-4 bg-white rounded-lg shadow-sm border text-center hover:bg-yellow-50 transition-colors cursor-pointer ${
              selectedLevel === LogLevel.WARN ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-yellow-600">{logStats.warnings}</div>
            <div className="text-sm text-yellow-500">⚠️ Warnings</div>
          </button>
          <button 
            onClick={() => toggleLevelFilter(LogLevel.INFO)}
            title={selectedLevel === LogLevel.INFO ? "Click to clear info filter" : "Click to filter info logs only"}
            className={`p-4 bg-white rounded-lg shadow-sm border text-center hover:bg-blue-50 transition-colors cursor-pointer ${
              selectedLevel === LogLevel.INFO ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-blue-600">{logStats.info}</div>
            <div className="text-sm text-blue-500">ℹ️ Info</div>
          </button>
          <button 
            onClick={() => toggleLevelFilter(LogLevel.DEBUG)}
            title={selectedLevel === LogLevel.DEBUG ? "Click to clear debug filter" : "Click to filter debug logs only"}
            className={`p-4 bg-white rounded-lg shadow-sm border text-center hover:bg-gray-50 transition-colors cursor-pointer ${
              selectedLevel === LogLevel.DEBUG ? 'ring-2 ring-gray-500 bg-gray-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-gray-600">{logStats.debug}</div>
            <div className="text-sm text-gray-500">🐛 Debug</div>
          </button>
        </div>

        {/* Quick Filters Bar */}
        <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-semibold text-gray-700">🔧 Quick Filters:</h3>
              
              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">📅 Time:</label>
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(e.target.value as '1h' | '6h' | '24h' | 'all')}
                  className={`px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition-colors ${
                    selectedTimeRange !== 'all' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'
                  }`}
                >
                  <option value="1h">Last Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Active Filters Display */}
              {(selectedLevel !== 'all' || selectedTimeRange !== 'all' || searchQuery.trim()) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Active:</span>
                  {selectedLevel !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Level: {selectedLevel}
                    </span>
                  )}
                  {selectedTimeRange !== 'all' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Time: {selectedTimeRange}
                    </span>
                  )}
                  {searchQuery.trim() && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Search: "{searchQuery.slice(0, 15)}{searchQuery.length > 15 ? '...' : ''}"
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Clear All Filters */}
            {(selectedLevel !== 'all' || selectedTimeRange !== 'all' || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setSelectedLevel('all');
                  setSelectedTimeRange('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Clear all filters"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Controls Panel */}

        {!isCollapsed && (
          <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🎛️ Controls & Filters</h3>
            
            {/* Primary Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">🔍 Search Logs</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages, data, components..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">📊 Log Level</label>
                <select 
                  value={selectedLevel} 
                  onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="all">All Levels</option>
                  <option value={LogLevel.ERROR}>❌ Errors Only</option>
                  <option value={LogLevel.WARN}>⚠️ Warnings Only</option>
                  <option value={LogLevel.INFO}>ℹ️ Info Only</option>
                  <option value={LogLevel.DEBUG}>🐛 Debug Only</option>
                </select>
              </div>

              {/* Component Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">🧩 Component</label>
                <select 
                  value={selectedComponent} 
                  onChange={(e) => setSelectedComponent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {components.map(comp => (
                    <option key={comp} value={comp}>
                      {comp === 'all' ? 'All Components' : comp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">⏰ Time Range</label>
                <select 
                  value={selectedTimeRange} 
                  onChange={(e) => setSelectedTimeRange(e.target.value as '1h' | '6h' | '24h' | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="1h">Last Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            {/* Secondary Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              {/* Max Logs */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">📈 Max Logs</label>
                <select 
                  value={maxLogs} 
                  onChange={(e) => setMaxLogs(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={2000}>2,000</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">🔄 Sort</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">🔄 Actions</label>
                <button 
                  onClick={refreshLogs}
                  disabled={isPaused}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm disabled:bg-gray-400 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">🗑️ Clear</label>
                <button 
                  onClick={clearLogs}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm transition-colors"
                >
                  🗑️ Clear All
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">📁 Export</label>
                <button 
                  onClick={exportLogs}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors"
                >
                  📁 Export JSON
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">🧪 Test</label>
                <button 
                  onClick={testConsoleLogging}
                  className="w-full px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm transition-colors"
                >
                  🧪 Generate Test Logs
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                🔄 Auto Refresh (2s)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                📜 Auto Scroll (only on new logs)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  checked={showStackTrace}
                  onChange={(e) => setShowStackTrace(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                🔍 Show Stack Traces by Default
              </label>
            </div>
          </div>
        )}

        {/* Logs Display */}
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">
              📋 Recent Logs ({logs.length} shown{selectedLevel !== 'all' ? ` - ${selectedLevel} filter active` : ''})
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
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
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
              <div className="text-sm text-gray-500">
                {autoRefresh && !isPaused && '🔄 Live updating'}
                {isPaused && '⏸️ Updates paused'}
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <div className="text-lg font-medium mb-1">No logs found</div>
                <div className="text-sm">Try adjusting your filters or generate some test logs</div>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={`${log.timestamp}-${index}`} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getLevelColor(log.level)} group relative`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getLevelEmoji(log.level)}</span>
                      <span className="font-medium text-sm uppercase tracking-wide">
                        {log.level}
                      </span>
                      {log.component && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          {log.component}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyLogEntry(log)}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-all"
                        title="Copy this log entry"
                      >
                        📋 Copy
                      </button>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium mb-2 text-gray-800">
                    {log.message}
                  </div>
                  
                  {log.data && (
                    <details className="mb-2">
                      <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800 font-medium">
                        📊 Show Data
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto border">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {log.stack && (
                    <details className={showStackTrace ? 'open' : ''}>
                      <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800 font-medium">
                        🔍 Stack Trace
                      </summary>
                      <pre className="mt-2 p-3 bg-red-50 rounded text-xs overflow-x-auto border border-red-200 text-red-800">
                        {log.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-4 text-center">
          <a 
            href="/test-console-logging"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold transition-colors mr-4"
          >
            🧪 Test Console Logging
          </a>
          <a 
            href="/auto-log-review"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-lg font-semibold transition-colors"
          >
            🔍 Auto Log Analysis
          </a>
        </div>
      </div>
    </>
  );
}
