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
 * 🧩 PAGE-NEW COMPONENT - Reusable UI Element
 * 
 * PURPOSE: Reusable page-new component for household management interfaces
 * 
 * PROPS:
 * - [List component props and their types]
 * - [Optional vs required properties]
 * - [Callback functions and event handlers]
 * 
 * FEATURES:
 * - [Interactive elements and behaviors]
 * - [Visual design and styling approach]
 * - [Data handling and display logic]
 * - [Accessibility considerations]
 * 
 * USAGE:
 * ```tsx
 * <🧩 
 *   prop1="value"
 *   onAction={handleAction}
 * />
 * ```
 * 
 * TECHNICAL:
 * - [Implementation details]
 * - [Performance considerations]
 * - [Testing approach]
 */


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
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LogLevel, type LogEntry } from '@/utils/logger';
import LoggingNav from '@/components/logging/LoggingNav';
import { logger } from '@/utils/logger';
import { ChevronLeft, ChevronRight, Filter, Search, Clock, Layers, Component, RotateCcw } from 'lucide-react';

export default function LogsDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | 'all'>('24h');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxLogs, setMaxLogs] = useState<number>(500);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [showStackTrace, setShowStackTrace] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [filterSidebarCollapsed, setFilterSidebarCollapsed] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
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
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000
      };
      const cutoff = now - timeRanges[selectedTimeRange];
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= cutoff);
    }
    
    // Level filtering
    if (selectedLevel !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === selectedLevel);
    }
    
    // Component filtering
    if (selectedComponent !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.component === selectedComponent);
    }
    
    // Text search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(query) ||
        (log.component && log.component.toLowerCase().includes(query)) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(query)) ||
        (log.stack && log.stack.toLowerCase().includes(query))
      );
    }
    
    // Sort
    filteredLogs.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    
    // Limit results
    filteredLogs = filteredLogs.slice(0, maxLogs);
    
    // Auto-scroll logic - only scroll if we got new logs AND user has auto-scroll enabled
    const newLogCount = filteredLogs.length;
    const shouldAutoScroll = autoScroll && newLogCount > lastLogCount;
    
    setLogs(filteredLogs);
    setLastLogCount(newLogCount);
    
    // Auto-scroll to bottom only when there are new logs and auto-scroll is enabled
    if (shouldAutoScroll && logsEndRef.current) {
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh && !isPaused) {
      refreshLogs(); // Initial load
      interval = setInterval(refreshLogs, 2000); // Refresh every 2 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedLevel, selectedComponent, selectedTimeRange, searchQuery, maxLogs, sortOrder, autoRefresh, isPaused]);

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    setLastLogCount(0);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const testConsoleLogging = () => {
    logger.debug('🧪 Test debug message', 'Test', { timestamp: new Date().toISOString() });
    logger.info('🧪 Test info message', 'Test', { action: 'test', status: 'success' });
    logger.warn('🧪 Test warning message', 'Test', { warning: 'This is just a test' });
    logger.error('🧪 Test error message', 'Test', { error: 'Simulated error for testing' });
  };

  // Get unique components for filtering
  const components = ['all', ...Array.from(new Set(logs.map(log => log.component).filter(Boolean)))];

  // Calculate log statistics
  const logStats = {
    total: logs.length,
    errors: logs.filter(log => log.level === LogLevel.ERROR).length,
    warnings: logs.filter(log => log.level === LogLevel.WARN).length,
    info: logs.filter(log => log.level === LogLevel.INFO).length,
    debug: logs.filter(log => log.level === LogLevel.DEBUG).length,
  };

  // Copy functions
  const copyAllVisibleLogs = () => {
    const logText = logs.map(log => 
      `[${formatTimestamp(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}` +
      (log.component ? ` (${log.component})` : '') +
      (log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : '') +
      (log.stack ? `\nStack: ${log.stack}` : '')
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      // Could add a toast notification here
      console.log('📋 All visible logs copied to clipboard');
    });
  };

  const copyMessagesOnly = () => {
    const messages = logs.map(log => `${log.message}`).join('\n');
    navigator.clipboard.writeText(messages).then(() => {
      console.log('📝 Log messages copied to clipboard');
    });
  };

  const copyLogEntry = (log: LogEntry) => {
    const logText = `[${formatTimestamp(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}` +
      (log.component ? ` (${log.component})` : '') +
      (log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : '') +
      (log.stack ? `\nStack: ${log.stack}` : '');
    
    navigator.clipboard.writeText(logText).then(() => {
      console.log('📋 Log entry copied to clipboard');
    });
  };

  // Scroll functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper functions
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR: return 'border-l-4 border-red-500';
      case LogLevel.WARN: return 'border-l-4 border-yellow-500';
      case LogLevel.INFO: return 'border-l-4 border-blue-500';
      case LogLevel.DEBUG: return 'border-l-4 border-gray-500';
      default: return '';
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

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    
    return date.toLocaleString();
  };

  return (
    <>
      <LoggingNav />
      <div className="flex h-screen bg-gray-50">
        {/* Filter Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
          filterSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            {!filterSidebarCollapsed ? (
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-2 rounded-lg">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">Filters</span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-2 rounded-lg">
                  <Filter className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
            
            <button
              onClick={() => setFilterSidebarCollapsed(!filterSidebarCollapsed)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label={filterSidebarCollapsed ? 'Expand filters' : 'Collapse filters'}
            >
              {filterSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Filter Controls */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-6">
              {/* Log Levels Section */}
              <div>
                {!filterSidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Log Levels
                  </h3>
                )}
                <div className="space-y-1">
                  {/* All Logs */}
                  <button
                    onClick={() => toggleLevelFilter('all')}
                    className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                      selectedLevel === 'all'
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 border-r-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Layers className={`h-5 w-5 flex-shrink-0 ${
                      selectedLevel === 'all' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    {!filterSidebarCollapsed && (
                      <>
                        <span className="ml-3 truncate">All Logs</span>
                        <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {logStats.total}
                        </span>
                      </>
                    )}
                    
                    {filterSidebarCollapsed && (
                      <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        All Logs ({logStats.total})
                      </div>
                    )}
                  </button>

                  {/* Errors */}
                  <button
                    onClick={() => toggleLevelFilter(LogLevel.ERROR)}
                    className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                      selectedLevel === LogLevel.ERROR
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-r-2 border-red-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-lg flex-shrink-0 ${
                      selectedLevel === LogLevel.ERROR ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>❌</span>
                    {!filterSidebarCollapsed && (
                      <>
                        <span className="ml-3 truncate">Errors</span>
                        <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          {logStats.errors}
                        </span>
                      </>
                    )}
                    
                    {filterSidebarCollapsed && (
                      <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        Errors ({logStats.errors})
                      </div>
                    )}
                  </button>

                  {/* Warnings */}
                  <button
                    onClick={() => toggleLevelFilter(LogLevel.WARN)}
                    className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                      selectedLevel === LogLevel.WARN
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-r-2 border-yellow-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-lg flex-shrink-0 ${
                      selectedLevel === LogLevel.WARN ? 'text-yellow-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>⚠️</span>
                    {!filterSidebarCollapsed && (
                      <>
                        <span className="ml-3 truncate">Warnings</span>
                        <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          {logStats.warnings}
                        </span>
                      </>
                    )}
                    
                    {filterSidebarCollapsed && (
                      <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        Warnings ({logStats.warnings})
                      </div>
                    )}
                  </button>

                  {/* Info */}
                  <button
                    onClick={() => toggleLevelFilter(LogLevel.INFO)}
                    className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                      selectedLevel === LogLevel.INFO
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-lg flex-shrink-0 ${
                      selectedLevel === LogLevel.INFO ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>ℹ️</span>
                    {!filterSidebarCollapsed && (
                      <>
                        <span className="ml-3 truncate">Info</span>
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {logStats.info}
                        </span>
                      </>
                    )}
                    
                    {filterSidebarCollapsed && (
                      <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        Info ({logStats.info})
                      </div>
                    )}
                  </button>

                  {/* Debug */}
                  <button
                    onClick={() => toggleLevelFilter(LogLevel.DEBUG)}
                    className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                      selectedLevel === LogLevel.DEBUG
                        ? 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-r-2 border-gray-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-lg flex-shrink-0 ${
                      selectedLevel === LogLevel.DEBUG ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>🐛</span>
                    {!filterSidebarCollapsed && (
                      <>
                        <span className="ml-3 truncate">Debug</span>
                        <span className="ml-auto text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {logStats.debug}
                        </span>
                      </>
                    )}
                    
                    {filterSidebarCollapsed && (
                      <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        Debug ({logStats.debug})
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Time Range Section */}
              <div>
                {!filterSidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Time Range
                  </h3>
                )}
                <div className="space-y-1">
                  {[
                    { value: '1h', label: 'Last Hour', icon: '🕐' },
                    { value: '6h', label: 'Last 6 Hours', icon: '🕕' },
                    { value: '24h', label: 'Last 24 Hours', icon: '📅' },
                    { value: 'all', label: 'All Time', icon: '⏰' }
                  ].map((timeRange) => (
                    <button
                      key={timeRange.value}
                      onClick={() => setSelectedTimeRange(timeRange.value as '1h' | '6h' | '24h' | 'all')}
                      className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                        selectedTimeRange === timeRange.value
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-r-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-lg flex-shrink-0 ${
                        selectedTimeRange === timeRange.value ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`}>{timeRange.icon}</span>
                      {!filterSidebarCollapsed && (
                        <span className="ml-3 truncate">{timeRange.label}</span>
                      )}
                      
                      {filterSidebarCollapsed && (
                        <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                          {timeRange.label}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Section */}
              {!filterSidebarCollapsed && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Search
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search logs..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Component Filter */}
              {!filterSidebarCollapsed && components.length > 1 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Component
                  </h3>
                  <select 
                    value={selectedComponent} 
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    {components.map(comp => (
                      <option key={comp} value={comp}>
                        {comp === 'all' ? 'All Components' : comp}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </nav>

          {/* Reset Filters Button */}
          <div className="p-3 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={() => {
                setSelectedLevel('all');
                setSelectedComponent('all');
                setSelectedTimeRange('24h');
                setSearchQuery('');
              }}
              className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors relative ${
                filterSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <RotateCcw className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
              {!filterSidebarCollapsed && (
                <span className="ml-3 truncate">Reset Filters</span>
              )}
              
              {filterSidebarCollapsed && (
                <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                  Reset Filters
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          filterSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-6 h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">📊 Enhanced Logs Dashboard</h1>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isPaused ? '⏸️ Paused' : '🔄 Live'}
                </div>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    isPaused ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedLevel !== 'all' || selectedTimeRange !== '24h' || searchQuery || selectedComponent !== 'all') && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {selectedLevel !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Level: {selectedLevel}
                    <button 
                      onClick={() => setSelectedLevel('all')}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedTimeRange !== '24h' && (
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    Time: {selectedTimeRange}
                    <button 
                      onClick={() => setSelectedTimeRange('24h')}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    Search: "{searchQuery}"
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedComponent !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Component: {selectedComponent}
                    <button 
                      onClick={() => setSelectedComponent('all')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Logs Display */}
            <div className="bg-white border rounded-lg shadow-sm flex-1 flex flex-col">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">
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
              
              <div className="flex-1 overflow-y-auto">
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
            <div className="mt-6 text-center">
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
        </div>
      </div>
    </>
  );
}
