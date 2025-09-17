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

import { useState } from 'react';
import { logger } from '@/utils/logger';

export default function LoggingTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`
    ]);
  };

  const testConsoleLogging = () => {
    addResult('Testing console logging...');
    console.log('✅ Test console.log message');
    console.info('ℹ️ Test console.info message');
    console.warn('⚠️ Test console.warn message');
    console.error('❌ Test console.error message');
    addResult('Console logging tests completed');
  };

  const testDirectLogging = () => {
    addResult('Testing direct logger calls...');
    logger.info('📝 Direct logger info test', 'TestLogging', {
      testData: 'info test'
    });
    logger.warn('⚠️ Direct logger warn test', 'TestLogging', {
      testData: 'warn test'
    });
    logger.error('❌ Direct logger error test', 'TestLogging', {
      testData: 'error test'
    });
    addResult('Direct logging tests completed');
  };

  const testAsyncError = async () => {
    addResult('Testing async error...');
    try {
      await new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Test async error from setTimeout')),
          100
        );
      });
    } catch (error) {
      console.error('Caught async error:', error);
      addResult('Async error test completed');
    }
  };

  const testFetchError = async () => {
    addResult('Testing fetch error...');
    try {
      const response = await fetch('/api/nonexistent-endpoint');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Fetch error occurred:', error);
      addResult('Fetch error test completed');
    }
  };

  const testJavaScriptError = () => {
    addResult('Testing JavaScript error...');
    try {
      // This will cause a ReferenceError
      (
        window as unknown as { nonExistentFunction: () => void }
      ).nonExistentFunction();
    } catch (error) {
      console.error('JavaScript error occurred:', error);
      addResult('JavaScript error test completed');
    }
  };

  const testReactError = () => {
    addResult('Testing React error (this will crash the component)...');
    throw new Error('Test React component error');
  };

  const testCustomLogCategories = () => {
    addResult('Testing custom log categories...');
    logger.info('🔐 Authentication test', 'auth', { action: 'login' });
    logger.info('📊 Database test', 'database', {
      query: 'SELECT * FROM users'
    });
    logger.info('🌐 API test', 'api', { endpoint: '/test' });
    logger.info('🎨 UI test', 'ui', { element: 'button' });
    addResult('Custom log categories test completed');
  };

  const testLargeDataLogging = () => {
    addResult('Testing large data logging...');
    const largeObject = {
      message: 'Large test object',
      data: Array(100)
        .fill(0)
        .map((_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: `This is test item number ${i} with some description text`,
          metadata: {
            created: new Date().toISOString(),
            tags: ['test', 'large', 'data'],
            nested: {
              level1: { level2: { level3: `Deep nested value ${i}` } }
            }
          }
        }))
    };
    logger.info('📦 Large data test', 'TestLogging', largeObject);
    addResult('Large data logging test completed');
  };

  const checkDatabaseLogs = async () => {
    addResult('Checking database logs...');
    try {
      const response = await fetch('/api/logs?limit=5');
      const result = await response.json();

      if (result.success) {
        addResult(`Found ${result.count} logs in database`);
        console.log('Recent database logs:', result.logs);
      } else {
        addResult(`Database check failed: ${result.error?.message}`);
      }
    } catch (error) {
      console.error('Error checking database logs:', error);
      addResult('Database check failed with exception');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Logging System Test Suite
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Test Buttons */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Test Categories
              </h2>

              <button
                onClick={testConsoleLogging}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🖥️ Test Console Logging
              </button>

              <button
                onClick={testDirectLogging}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📝 Test Direct Logger
              </button>

              <button
                onClick={testAsyncError}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ⏰ Test Async Error
              </button>

              <button
                onClick={testFetchError}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🌐 Test Fetch Error
              </button>

              <button
                onClick={testJavaScriptError}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                💥 Test JavaScript Error
              </button>

              <button
                onClick={testCustomLogCategories}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🏷️ Test Custom Categories
              </button>

              <button
                onClick={testLargeDataLogging}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📦 Test Large Data
              </button>

              <button
                onClick={checkDatabaseLogs}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔍 Check Database Logs
              </button>

              <button
                onClick={testReactError}
                className="w-full bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ⚠️ Test React Error (Crashes Component)
              </button>
            </div>

            {/* Test Results */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Test Results
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 italic">
                    No tests run yet. Click a test button to start.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-700 font-mono"
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setTestResults([])}
                className="mt-3 w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📋 Instructions
            </h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Run various tests to generate different types of logs</li>
              <li>• Check browser console to see immediate logging output</li>
              <li>
                • Use &quot;Check Database Logs&quot; to verify logs are being
                stored
              </li>
              <li>
                • Visit <strong>/logs-dashboard</strong> to see all logs in the
                dashboard
              </li>
              <li>
                • React Error test will crash this component to test error
                boundaries
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
