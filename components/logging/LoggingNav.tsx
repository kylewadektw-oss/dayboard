'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, memo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Search, TestTube, Filter, Clock, Layers, Component, X, Zap } from 'lucide-react';
import { LogLevel } from '@/utils/logger';

const loggingRoutes = [
  {
    href: '/logs-dashboard',
    label: '📊 Logs Dashboard',
    description: 'Real-time console log monitoring',
    icon: BarChart3
  },
  {
    href: '/test-log-generation',
    label: '🧪 Log Generator',
    description: 'Generate realistic test logs',
    icon: Zap
  },
  {
    href: '/auto-log-review',
    label: '🔍 Auto Log Review',
    description: 'Automated analysis & insights',
    icon: Search
  },
  {
    href: '/test-console-logging',
    label: '🔧 Console Test',
    description: 'Basic console log testing',
    icon: TestTube
  }
];

const timeRangeOptions = [
  { value: '5m', label: '5 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '12h', label: '12 hours' },
  { value: '1d', label: '1 day' },
  { value: '1w', label: '1 week' },
  { value: 'all', label: 'All time' }
];

const logLevels = [
  { value: 'all', label: 'All Levels', emoji: '📝' },
  { value: 'error', label: 'Errors', emoji: '❌' },
  { value: 'warn', label: 'Warnings', emoji: '⚠️' },
  { value: 'info', label: 'Info', emoji: 'ℹ️' },
  { value: 'debug', label: 'Debug', emoji: '🐛' }
];

const sourceSides = [
  { value: 'all', label: 'All Sources', emoji: '🌍' },
  { value: 'client', label: 'Client', emoji: '🌐' },
  { value: 'server', label: 'Server', emoji: '⚙️' }
];

interface LoggingNavProps {
  variant?: 'horizontal' | 'sidebar';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // Filter props for logs dashboard
  selectedTimeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  selectedLevel?: string;
  onLevelChange?: (level: string) => void;
  selectedSide?: string;
  onSideChange?: (side: string) => void;
  selectedComponent?: string;
  onComponentChange?: (component: string) => void;
  availableComponents?: string[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onClearFilters?: () => void;
  // Log statistics for sidebar display
  logStats?: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
    debug: number;
  };
}

const LoggingNav = memo(function LoggingNav({ 
  variant = 'horizontal', 
  isCollapsed = false, 
  onToggleCollapse,
  selectedTimeRange = 'all',
  onTimeRangeChange,
  selectedLevel = 'all',
  onLevelChange,
  selectedSide = 'all',
  onSideChange,
  selectedComponent = 'all',
  onComponentChange,
  availableComponents = [],
  searchQuery = '',
  onSearchChange,
  onClearFilters,
  logStats
}: LoggingNavProps) {
  const pathname = usePathname();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  const isLogsPage = pathname === '/logs-dashboard';
  const hasActiveFilters = selectedTimeRange !== 'all' || selectedLevel !== 'all' || selectedSide !== 'all' || selectedComponent !== 'all' || searchQuery.trim() !== '';

  if (variant === 'sidebar') {
    return (
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-40 overflow-y-auto ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="font-semibold text-gray-800">🔧 Logging Tools</h2>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-2">
          {loggingRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;
            
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 group ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isCollapsed ? route.label : ''}
              >
                <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {route.label}
                    </div>
                    <div className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {route.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Dashboard Navigation */}
        {!isCollapsed && (
          <div className="p-2 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 group text-gray-700 hover:bg-gray-100"
            >
              <span className="text-lg">🏠</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-gray-900">
                  Back to Dashboard
                </div>
                <div className="text-xs truncate text-gray-500">
                  Return to main dashboard
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Filters Section for Logs Dashboard */}
        {isLogsPage && !isCollapsed && (
          <div className="border-t border-gray-200">
            {/* Time Range Filter - Button Grid */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">
                  Time Range
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onTimeRangeChange?.(option.value)}
                    className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 border ${
                      selectedTimeRange === option.value
                        ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Level Statistics - Quick Filters */}
            {!isCollapsed && logStats && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">
                    Quick Filters
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => onLevelChange?.(selectedLevel === 'all' ? 'all' : 'all')}
                    className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                      selectedLevel === 'all' ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <span className="text-sm font-medium text-gray-700">All Logs</span>
                      </div>
                      <span className="text-lg font-bold text-gray-700">{logStats.total}</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => onLevelChange?.(selectedLevel === LogLevel.ERROR ? 'all' : LogLevel.ERROR)}
                    className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                      selectedLevel === LogLevel.ERROR ? 'ring-2 ring-red-500 bg-red-50 border-red-200' : 'bg-white hover:bg-red-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">❌</span>
                        <span className="text-sm font-medium text-red-600">Errors</span>
                      </div>
                      <span className="text-lg font-bold text-red-600">{logStats.errors}</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => onLevelChange?.(selectedLevel === LogLevel.WARN ? 'all' : LogLevel.WARN)}
                    className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                      selectedLevel === LogLevel.WARN ? 'ring-2 ring-yellow-500 bg-yellow-50 border-yellow-200' : 'bg-white hover:bg-yellow-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <span className="text-sm font-medium text-yellow-600">Warnings</span>
                      </div>
                      <span className="text-lg font-bold text-yellow-600">{logStats.warnings}</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => onLevelChange?.(selectedLevel === LogLevel.INFO ? 'all' : LogLevel.INFO)}
                    className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                      selectedLevel === LogLevel.INFO ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'bg-white hover:bg-blue-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">ℹ️</span>
                        <span className="text-sm font-medium text-blue-600">Info</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{logStats.info}</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => onLevelChange?.(selectedLevel === LogLevel.DEBUG ? 'all' : LogLevel.DEBUG)}
                    className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                      selectedLevel === LogLevel.DEBUG ? 'ring-2 ring-gray-500 bg-gray-50 border-gray-200' : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🐛</span>
                        <span className="text-sm font-medium text-gray-600">Debug</span>
                      </div>
                      <span className="text-lg font-bold text-gray-600">{logStats.debug}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Main Filters Toggle */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  hasActiveFilters 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span className="font-medium text-gray-700">
                    Filters {hasActiveFilters && <span className="text-blue-600">({
                      [selectedLevel !== 'all', selectedSide !== 'all', selectedComponent !== 'all', searchQuery.trim()].filter(Boolean).length
                    })</span>}
                  </span>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`transition-transform ${filtersExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {filtersExpanded && (
                <div className="mt-3 space-y-4">
                  {/* Search Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">🔍 Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Search logs..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => onSearchChange?.('')}
                          className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">📊 Log Level</label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {logLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => onLevelChange?.(level.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            selectedLevel === level.value
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span>{level.emoji}</span>
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Source Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">🌍 Source</label>
                    <div className="space-y-1">
                      {sourceSides.map((side) => (
                        <button
                          key={side.value}
                          onClick={() => onSideChange?.(side.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            selectedSide === side.value
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span>{side.emoji}</span>
                          {side.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Component Filter */}
                  {availableComponents.length > 1 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">🧩 Component</label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {availableComponents.map((component) => (
                          <button
                            key={component}
                            onClick={() => onComponentChange?.(component)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedComponent === component
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {component === 'all' ? 'All Components' : component}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="pt-2 border-t border-gray-200">
                      <button
                        onClick={onClearFilters}
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                      >
                        🗑️ Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              💡 Real-time logging & monitoring
            </div>
          </div>
        )}
      </div>
    );
  }

  // Original horizontal navigation
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4">
          {loggingRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                pathname === route.href
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{route.label}</div>
              <div className="text-xs opacity-75">{route.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});

export default LoggingNav;
