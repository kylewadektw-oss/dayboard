/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoggingNav from '@/components/logging/LoggingNav';

export default function TestConsoleLogging() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const testBasicLogging = () => {
    console.log('✅ This is a test console.log message');
    console.info('ℹ️ This is a test console.info message');
    console.warn('⚠️ This is a test console.warn message');
    console.error('❌ This is a test console.error message');
    console.debug('🐛 This is a test console.debug message');
  };

  const testObjectLogging = () => {
    const testUser = {
      id: 123,
      name: 'Test User',
      email: 'test@example.com',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };

    console.log('User object test:', testUser);
    console.info('Array test:', [1, 2, 3, 'test', { nested: true }]);
  };

  const testErrorLogging = () => {
    try {
      throw new Error('Simulated API connection failed');
    } catch (error) {
      console.error('Caught API error:', error);
    }

    try {
      JSON.parse('{ invalid json }');
    } catch (error) {
      console.error('JSON parsing failed:', error);
    }
  };

  useEffect(() => {
    console.log('TestConsoleLogging component mounted');
    console.info('Component useEffect triggered');

    return () => {
      console.log('TestConsoleLogging component unmounting');
    };
  }, []);

  return (
    <>
      <LoggingNav
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-80'
        }`}
      >
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                🧪 Console Logging Test Suite
              </h1>
              <Link
                href="/logs-dashboard"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                📊 View Logs Dashboard
              </Link>
            </div>

            <div className="grid gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  📋 Testing Instructions
                </h3>
                <ul className="space-y-2 text-blue-900 font-semibold">
                  <li>
                    • Open the <strong>Logs Dashboard</strong> in another tab to
                    see console output in real-time
                  </li>
                  <li>
                    • Each test below generates different types of console logs
                  </li>
                  <li>
                    • All console logs are automatically captured and stored
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  📝 Basic Console Methods
                </h2>
                <p className="text-gray-900 font-semibold mb-4">
                  Tests all standard console methods: log, info, warn, error,
                  debug
                </p>
                <button
                  onClick={testBasicLogging}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Test Basic Logging
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  📊 Object & Array Logging
                </h2>
                <p className="text-gray-900 font-semibold mb-4">
                  Tests logging complex objects and arrays
                </p>
                <button
                  onClick={testObjectLogging}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Test Object Logging
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  💥 Error & Exception Logging
                </h2>
                <p className="text-gray-900 font-semibold mb-4">
                  Tests error handling and stack trace capture
                </p>
                <button
                  onClick={testErrorLogging}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Test Error Logging
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
