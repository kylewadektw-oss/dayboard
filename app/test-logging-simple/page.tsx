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

'use client';

import { useState } from 'react';
import { logger } from '@/utils/logger';

export default function TestLoggingPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`
    ]);
  };

  const testBasicLogging = async () => {
    try {
      addResult('Starting basic logging test...');

      // Test console.log
      console.log('Test console.log message');
      addResult('✅ console.log executed');

      // Test console.error
      console.error('Test console.error message');
      addResult('✅ console.error executed');

      // Test direct logger
      await logger.info('Direct logger test message', 'TestComponent', {
        test: true
      });
      addResult('✅ Direct logger executed');

      // Test logger error
      await logger.error('Direct logger error test', 'TestComponent', {
        test: true,
        errorObject: new Error('Test error')
      });
      addResult('✅ Direct logger error executed');

      addResult('✅ All logging tests completed');
    } catch (error) {
      addResult(`❌ Error during test: ${error}`);
      console.error('Test error:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple Logging Test</h1>

      <div className="space-y-4">
        <button
          onClick={testBasicLogging}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Basic Logging Test
        </button>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            {testResults.length === 0 ? (
              <p className="text-gray-700 font-medium">No test results yet</p>
            ) : (
              <ul className="space-y-1">
                {testResults.map((result, index) => (
                  <li key={index} className="text-sm font-mono">
                    {result}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Check the browser console (F12) for any error messages during
            testing. Also check the Enhanced Logs Dashboard to see if logs
            appear there.
          </p>
        </div>
      </div>
    </div>
  );
}
