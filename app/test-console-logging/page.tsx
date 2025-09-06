'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/utils/logger';
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
      // Simulate an API error
      throw new Error('Simulated API connection failed');
    } catch (error) {
      console.error('Caught API error:', error);
    }

    try {
      // Simulate a parsing error
      JSON.parse('{ invalid json }');
    } catch (error) {
      console.error('JSON parsing failed:', error);
    }
  };

  const testAsyncLogging = async () => {
    console.log('Starting async operation...');
    
    try {
      // Simulate async API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve('API call successful');
          } else {
            reject(new Error('API timeout'));
          }
        }, 1000);
      });
      console.log('✅ Async operation completed successfully');
    } catch (error) {
      console.error('❌ Async operation failed:', error);
    }
  };

  const testDatabaseLogging = () => {
    // Test the logger's direct methods (these should also go to database)
    logger.info('Direct logger.info() call', 'TestPage', { source: 'direct' });
    logger.warn('Direct logger.warn() call', 'TestPage', { source: 'direct' });
    logger.error('Direct logger.error() call', 'TestPage', { source: 'direct' });
    logger.debug('Direct logger.debug() call', 'TestPage', { source: 'direct' });
  };

  const testSpamLogging = () => {
    // Test high volume logging
    for (let i = 0; i < 10; i++) {
      console.log(`Spam log message ${i + 1}`);
    }
  };

  // Test automatic logging on component mount
  useEffect(() => {
    console.log('TestConsoleLogging component mounted');
    console.info('Component useEffect triggered');
    
    return () => {
      console.log('TestConsoleLogging component unmounting');
    };
  }, []);

  return (
    <>
      {/* Sidebar Navigation */}
      <LoggingNav 
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Console Logging Test Suite</h1>
        
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">Instructions</h2>
          <p className="text-sm text-blue-700">
            Open the <strong>Logs Dashboard</strong> in another tab or window to see all console output captured in real-time.
            Each test below will generate different types of console logs.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            🔗 <a href="/logs-dashboard" target="_blank" className="underline hover:text-blue-900">
              Open Logs Dashboard in New Tab
            </a>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          
          {/* Basic Logging Tests */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">📝 Basic Console Methods</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tests all standard console methods: log, info, warn, error, debug
            </p>
            <button
              onClick={testBasicLogging}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Basic Logging
            </button>
          </div>

          {/* Object Logging Tests */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">📊 Object & Array Logging</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tests logging complex objects and arrays
            </p>
            <button
              onClick={testObjectLogging}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Object Logging
            </button>
          </div>

          {/* Error Logging Tests */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">💥 Error & Exception Logging</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tests error handling and stack trace capture
            </p>
            <button
              onClick={testErrorLogging}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Test Error Logging
            </button>
          </div>

          {/* Async Logging Tests */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">⏱️ Async Operation Logging</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tests logging during async operations (random success/failure)
            </p>
            <button
              onClick={testAsyncLogging}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Async Logging
            </button>
          </div>

          {/* Direct Logger Tests */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">🎯 Direct Logger Methods</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tests logger.info(), logger.warn(), etc. (should also persist to DB)
            </p>
            <button
              onClick={testDatabaseLogging}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Test Direct Logger
            </button>
          </div>

          {/* Volume Tests */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">🚀 High Volume Logging</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tests performance with multiple rapid log entries
            </p>
            <button
              onClick={testSpamLogging}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Test Volume Logging
            </button>
          </div>

        </div>

        {/* Real-time Test */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-3">🔄 Continuous Testing</h3>
          <p className="text-sm text-gray-600 mb-3">
            Generate log entries every few seconds for real-time testing
          </p>
          <button
            onClick={() => {
              const interval = setInterval(() => {
                const timestamp = new Date().toLocaleTimeString();
                console.log(`⏰ Automatic log entry at ${timestamp}`);
              }, 3000);
              
              // Stop after 30 seconds
              setTimeout(() => {
                clearInterval(interval);
                console.log('🛑 Stopped continuous logging');
              }, 30000);
              
              console.log('▶️ Started continuous logging (30 seconds)');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Start Continuous Logging (30s)
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a 
            href="/logs-dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            📊 View Logs Dashboard
          </a>
        </div>
        </div>
      </div>
    </>
  );
}
