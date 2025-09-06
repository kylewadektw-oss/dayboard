'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Search, TestTube } from 'lucide-react';

const loggingRoutes = [
  {
    href: '/logs-dashboard',
    label: '📊 Logs Dashboard',
    description: 'Real-time console log monitoring',
    icon: BarChart3
  },
  {
    href: '/auto-log-review',
    label: '🔍 Auto Log Review',
    description: 'Automated analysis & insights',
    icon: Search
  },
  {
    href: '/test-console-logging',
    label: '🧪 Test Console',
    description: 'Generate test logs for debugging',
    icon: TestTube
  }
];

interface LoggingNavProps {
  variant?: 'horizontal' | 'sidebar';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function LoggingNav({ 
  variant = 'horizontal', 
  isCollapsed = false, 
  onToggleCollapse 
}: LoggingNavProps) {
  const pathname = usePathname();

  if (variant === 'sidebar') {
    return (
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
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

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
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
}
