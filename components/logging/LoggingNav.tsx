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
 * 🧭 LOGGING NAV - Navigation Component for Logging Suite
 * 
 * PURPOSE: Unified navigation and filtering interface for all logging-related pages
 * 
 * FEATURES:
 * - Sidebar and horizontal navigation modes
 * - Real-time log filtering and search
 * - Time range selection with quick buttons
 * - Log level filtering with statistics
 * - Component and source filtering
 * - Collapsible sidebar with responsive design
 * 
 * VARIANTS:
 * - sidebar: Full-featured sidebar with filters (used in logging pages)
 * - horizontal: Compact top navigation (fallback)
 * 
 * NAVIGATION ROUTES:
 * - /logs-dashboard: Real-time log monitoring
 * - /test-log-generation: Log generation testing
 * - /auto-log-review: Automated analysis
 * - /test-console-logging: Console testing suite
 * 
 * TECHNICAL:
 * - React.memo for performance optimization
 * - Next.js Link components for client-side navigation
 * - Responsive design with Tailwind CSS
 * - Lucide React icons for consistent UI
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, memo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Search, TestTube, Filter, Clock, Layers, Component, X, Zap, Settings } from 'lucide-react';
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

const analyticsRoutes = [
  {
    href: '/logs-dashboard/user-analytics',
    label: '👥 User Analytics',
    description: 'User behavior & interaction tracking',
    icon: Component
  },
  {
    href: '/logs-dashboard/performance-analytics',
    label: '⚡ Performance Analytics',
    description: 'Core Web Vitals & performance metrics',
    icon: Zap
  },
  {
    href: '/logs-dashboard/feature-analytics',
    label: '🎯 Feature Analytics',
    description: 'Feature adoption & A/B testing',
    icon: Settings
  },
  {
    href: '/logs-dashboard/security-monitoring',
    label: '🛡️ Security Monitoring',
    description: 'Security events & threat detection',
    icon: Filter
  },
  {
    href: '/logs-dashboard/accessibility-metrics',
    label: '♿ Accessibility Metrics',
    description: 'WCAG compliance & inclusive design',
    icon: Search
  },
  {
    href: '/logs-dashboard/business-intelligence',
    label: '💼 Business Intelligence',
    description: 'KPIs & strategic business metrics',
    icon: BarChart3
  },
  {
    href: '/logs-dashboard/system-health',
    label: '🏥 System Health',
    description: 'Infrastructure & operational monitoring',
    icon: TestTube
  }
];

const timeRangeOptions = [
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '10m', label: '10 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
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
  // Slider controls for log limits
  maxLogs?: number;
  onMaxLogsChange?: (max: number) => void;
  maxErrors?: number;
  onMaxErrorsChange?: (max: number) => void;
  maxWarnings?: number;
  onMaxWarningsChange?: (max: number) => void;
  maxInfo?: number;
  onMaxInfoChange?: (max: number) => void;
  maxDebug?: number;
  onMaxDebugChange?: (max: number) => void;
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
  logStats,
  maxLogs = 250,
  onMaxLogsChange,
  maxErrors = 50,
  onMaxErrorsChange,
  maxWarnings = 50,
  onMaxWarningsChange,
  maxInfo = 50,
  onMaxInfoChange,
  maxDebug = 50,
  onMaxDebugChange
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
            <div className="flex-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors mb-2 group text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="text-lg">🏠</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-gray-900">
                    Back to Dashboard
                  </div>
                </div>
              </Link>
            </div>
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
          {/* Core Logging Tools */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              {!isCollapsed && "Core Logging"}
            </h4>
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
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-700'}`} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {route.label}
                      </div>
                      <div className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-800 font-semibold'}`}>
                        {route.description}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Analytics Dashboard */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              {!isCollapsed && "Analytics Dashboard"}
            </h4>
            {analyticsRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;
              
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 group ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-700 hover:bg-purple-50'
                  }`}
                  title={isCollapsed ? route.label : ''}
                >
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {route.label}
                      </div>
                      <div className={`text-xs truncate ${isActive ? 'text-purple-100' : 'text-gray-800 font-semibold'}`}>
                        {route.description}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Filters Section for Logs Dashboard */}
        {isLogsPage && !isCollapsed && (
          <div className="border-t border-gray-200">
            {/* Time Range, Live Statistics, and Log Limits moved to Quick Actions section */}
          </div>
        )}

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="mt-auto border-t border-gray-200 bg-gray-50">
            {/* Understanding Log Types & Notifications */}
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                🔍 Understanding Logs
              </h4>
              
              <div className="space-y-3">
                {/* Console Messages */}
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <h5 className="text-xs font-semibold text-blue-800 mb-2">💬 Console Messages (Normal)</h5>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div>• <strong>Info:</strong> Status updates</div>
                    <div>• <strong>Debug:</strong> Technical details</div>
                    <div className="italic text-blue-600">Expected monitoring data</div>
                  </div>
                </div>
                
                {/* Issues */}
                <div className="bg-white p-3 rounded-lg border border-orange-200">
                  <h5 className="text-xs font-semibold text-orange-800 mb-2">⚠️ Issues (Need Attention)</h5>
                  <div className="space-y-1 text-xs text-orange-700">
                    <div>• <strong>Warnings:</strong> Potential problems</div>
                    <div>• <strong>Errors:</strong> Broken functionality</div>
                    <div className="italic text-orange-600">Should be investigated</div>
                  </div>
                </div>
                
                {/* Why Logs Come and Go */}
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <h5 className="text-xs font-semibold text-purple-800 mb-2">🔄 Why Logs Come & Go</h5>
                  <div className="space-y-1 text-xs text-purple-700">
                    <div>• 🔄 Page refresh fixed it</div>
                    <div>• 🌐 Network reconnected</div>
                    <div>• ⏱️ Temporary timing issue</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-800 text-center font-semibold">
                💡 Real-time logging & monitoring
              </div>
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
        <div className="flex flex-wrap gap-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 w-full mb-2">Core Logging Tools</h3>
          {loggingRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                pathname === route.href
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 font-medium'
              }`}
            >
              <div className="font-semibold">{route.label}</div>
              <div className="text-xs opacity-90 font-medium">{route.description}</div>
            </Link>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-4">
          <h3 className="text-sm font-semibold text-gray-900 w-full mb-2">Analytics Dashboard</h3>
          {analyticsRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                pathname === route.href
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-purple-50 font-medium'
              }`}
            >
              <div className="font-semibold">{route.label}</div>
              <div className="text-xs opacity-90 font-medium">{route.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});

export default LoggingNav;
