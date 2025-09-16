/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprieta// Log level// Log level options - modernized without emojis
const LOG_LEVELS_OLD = [
  { value: 'all', label: 'All Levels', color: 'gray', dot: true },
  { value: 'error', label: 'Errors', color: 'red', dot: true },
  { value: 'warn', label: 'Warnings', color: 'yellow', dot: true },
  { value: 'info', label: 'Info', color: 'blue', dot: true }
];

const sourceSides_OLD = [
  { value: 'all', label: 'All Sources', color: 'gray', dot: true },
  { value: 'client', label: 'Client', color: 'blue', dot: true },
  { value: 'server', label: 'Server', color: 'purple', dot: true }
];dernized without emojis
const LOG_LEVELS = [
  { value: 'all', label: 'All Levels', color: 'gray', dot: true },
  { value: 'error', label: 'Errors', color: 'red', dot: true },
  { value: 'warn', label: 'Warnings', color: 'yellow', dot: true },
  { value: 'info', label: 'Info', color: 'blue', dot: true }
];

const sourceSides = [
  { value: 'all', label: 'All Sources', color: 'gray', dot: true },
  { value: 'client', label: 'Client', color: 'blue', dot: true },
  { value: 'server', label: 'Server', color: 'purple', dot: true }
];command center application.
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
import { memo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Search,
  TestTube,
  Filter,
  Component,
  Zap,
  Settings
} from 'lucide-react';

const loggingRoutes = [
  {
    href: '/logs-dashboard',
    label: 'Logs Dashboard',
    description: 'Real-time console log monitoring',
    icon: BarChart3,
    color: 'blue'
  },
  {
    href: '/logs-dashboard/devtools',
    label: 'DevTools Monitor',
    description: 'Chrome DevTools-style monitoring',
    icon: Search,
    color: 'indigo'
  },
  {
    href: '/test-log-generation',
    label: 'Log Generator',
    description: 'Generate realistic test logs',
    icon: Zap,
    color: 'yellow'
  },
  {
    href: '/auto-log-review',
    label: 'Auto Log Review',
    description: 'Automated analysis & insights',
    icon: Search,
    color: 'green'
  },
  {
    href: '/test-console-logging',
    label: 'Console Test',
    description: 'Basic console log testing',
    icon: TestTube,
    color: 'purple'
  },
  {
    href: '/test-logging-simple',
    label: 'Simple Logging Tool',
    description: 'Basic logging test interface',
    icon: TestTube,
    color: 'orange'
  },
  {
    href: '/auth-debug',
    label: 'Auth Debug Tool',
    description: 'Authentication debugging tools',
    icon: Filter,
    color: 'red'
  }
];

const analyticsRoutes = [
  {
    href: '/logs-dashboard/user-analytics',
    label: 'User Analytics',
    description: 'User behavior & interaction tracking',
    icon: Component,
    color: 'indigo'
  },
  {
    href: '/logs-dashboard/performance-analytics',
    label: 'Performance Analytics',
    description: 'Core Web Vitals & performance metrics',
    icon: Zap,
    color: 'orange'
  },
  {
    href: '/logs-dashboard/feature-analytics',
    label: 'Feature Analytics',
    description: 'Feature adoption & A/B testing',
    icon: Settings,
    color: 'teal'
  },
  {
    href: '/logs-dashboard/security-monitoring',
    label: 'Security Monitoring',
    description: 'Security events & threat detection',
    icon: Filter,
    color: 'red'
  },
  {
    href: '/logs-dashboard/accessibility-metrics',
    label: 'Accessibility Metrics',
    description: 'WCAG compliance & inclusive design',
    icon: Search,
    color: 'pink'
  },
  {
    href: '/logs-dashboard/business-intelligence',
    label: 'Business Intelligence',
    description: 'KPIs & strategic business metrics',
    icon: BarChart3,
    color: 'emerald'
  },
  {
    href: '/logs-dashboard/system-health',
    label: 'System Health',
    description: 'Infrastructure & operational monitoring',
    icon: TestTube,
    color: 'cyan'
  }
];

// Unused constants removed to fix build errors
// const timeRangeOptions = [...];
// const LOG_LEVELS = [...];
// const sourceSides = [...];

interface LoggingNavProps {
  variant?: 'horizontal' | 'sidebar';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // All unused filter props removed to fix build errors
}

const LoggingNav = memo(function LoggingNav({
  variant = 'horizontal',
  isCollapsed = false,
  onToggleCollapse
}: LoggingNavProps) {
  const pathname = usePathname();
  // Unused state variables removed

  const isLogsPage = pathname === '/logs-dashboard';

  if (variant === 'sidebar') {
    return (
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-40 overflow-y-auto ${
          isCollapsed ? 'w-16' : 'w-80'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors mb-2 group text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <div className="w-5 h-5 rounded-lg bg-gray-200 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                </div>
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
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-2">
          {/* Core Logging Tools */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              {!isCollapsed && 'Core Logging'}
            </h4>
            {loggingRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;

              const getColorClasses = (color: string, isActive: boolean) => {
                if (isActive) return 'bg-blue-500 text-white';

                const colorMap: { [key: string]: string } = {
                  blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
                  yellow: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
                  green: 'text-green-600 bg-green-50 hover:bg-green-100',
                  purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
                  orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
                  red: 'text-red-600 bg-red-50 hover:bg-red-100'
                };
                return (
                  colorMap[color] ||
                  'text-gray-600 bg-gray-50 hover:bg-gray-100'
                );
              };

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
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? 'bg-blue-400'
                        : getColorClasses(route.color, false).split(' ')[1] +
                          ' ' +
                          getColorClasses(route.color, false).split(' ')[2]
                    }`}
                  >
                    <Icon
                      size={14}
                      className={`${isActive ? 'text-white' : getColorClasses(route.color, false).split(' ')[0]}`}
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}
                      >
                        {route.label}
                      </div>
                      <div
                        className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-600'}`}
                      >
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
              {!isCollapsed && 'Analytics Dashboard'}
            </h4>
            {analyticsRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;

              const getColorClasses = (color: string, isActive: boolean) => {
                if (isActive) return 'bg-purple-500 text-white';

                const colorMap: { [key: string]: string } = {
                  indigo: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
                  orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
                  teal: 'text-teal-600 bg-teal-50 hover:bg-teal-100',
                  red: 'text-red-600 bg-red-50 hover:bg-red-100',
                  pink: 'text-pink-600 bg-pink-50 hover:bg-pink-100',
                  emerald:
                    'text-emerald-600 bg-emerald-50 hover:bg-emerald-100',
                  cyan: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'
                };
                return (
                  colorMap[color] ||
                  'text-purple-600 bg-purple-50 hover:bg-purple-100'
                );
              };

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
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? 'bg-purple-400'
                        : getColorClasses(route.color, false).split(' ')[1] +
                          ' ' +
                          getColorClasses(route.color, false).split(' ')[2]
                    }`}
                  >
                    <Icon
                      size={14}
                      className={`${isActive ? 'text-white' : getColorClasses(route.color, false).split(' ')[0]}`}
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}
                      >
                        {route.label}
                      </div>
                      <div
                        className={`text-xs truncate ${isActive ? 'text-purple-100' : 'text-gray-600'}`}
                      >
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
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                Understanding Logs
              </h4>

              <div className="space-y-3">
                {/* Console Messages */}
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <h5 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Console Messages (Normal)
                  </h5>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div>
                      • <strong>Info:</strong> Status updates and application
                      information
                    </div>
                    <div className="italic text-blue-600">
                      Expected monitoring data
                    </div>
                  </div>
                </div>

                {/* Issues */}
                <div className="bg-white p-3 rounded-lg border border-orange-200">
                  <h5 className="text-xs font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    Issues (Need Attention)
                  </h5>
                  <div className="space-y-1 text-xs text-orange-700">
                    <div>
                      • <strong>Warnings:</strong> Potential problems
                    </div>
                    <div>
                      • <strong>Errors:</strong> Broken functionality
                    </div>
                    <div className="italic text-orange-600">
                      Should be investigated
                    </div>
                  </div>
                </div>

                {/* Why Logs Come and Go */}
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <h5 className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    Why Logs Come & Go
                  </h5>
                  <div className="space-y-1 text-xs text-purple-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Page refresh fixed it</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Network reconnected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Temporary timing issue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-800 text-center font-semibold flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                Real-time logging & monitoring
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
          <h3 className="text-sm font-semibold text-gray-900 w-full mb-2 flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            Core Logging Tools
          </h3>
          {loggingRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                pathname === route.href
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 font-medium'
              }`}
            >
              <div
                className={`w-4 h-4 rounded ${pathname === route.href ? 'bg-blue-400' : `bg-${route.color}-100`} flex items-center justify-center`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${pathname === route.href ? 'bg-white' : `bg-${route.color}-500`}`}
                ></div>
              </div>
              <div>
                <div className="font-semibold">{route.label}</div>
                <div className="text-xs opacity-90 font-medium">
                  {route.description}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <h3 className="text-sm font-semibold text-gray-900 w-full mb-2 flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-purple-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            Analytics Dashboard
          </h3>
          {analyticsRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                pathname === route.href
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-purple-50 font-medium'
              }`}
            >
              <div
                className={`w-4 h-4 rounded ${pathname === route.href ? 'bg-purple-400' : `bg-${route.color}-100`} flex items-center justify-center`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${pathname === route.href ? 'bg-white' : `bg-${route.color}-500`}`}
                ></div>
              </div>
              <div>
                <div className="font-semibold">{route.label}</div>
                <div className="text-xs opacity-90 font-medium">
                  {route.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});

export default LoggingNav;
