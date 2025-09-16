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
import Link from 'next/link';
import LoggingNav from '@/components/logging/LoggingNav';

export default function TestLogGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const generateTestLogs = async () => {
    setIsGenerating(true);
    setGeneratedCount(0);

    const testScenarios = [
      // Error logs
      () => {
        logger.error('Database connection failed', 'DatabaseService', {
          error: 'Connection timeout after 30 seconds',
          host: 'postgres.example.com',
          port: 5432,
          attempts: 3
        });
      },
      () => {
        logger.error('Authentication failed for user', 'AuthService', {
          userId: 'user_123',
          reason: 'Invalid credentials',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/140.0.0.0'
        });
      },
      () => {
        logger.error('Payment processing failed', 'StripeService', {
          paymentId: 'pi_1234567890',
          amount: 2999,
          currency: 'usd',
          errorCode: 'card_declined',
          message: 'Your card was declined'
        });
      },
      () => {
        try {
          throw new Error('Unexpected null reference in user profile');
        } catch (error) {
          const errorObj = error as Error;
          logger.error('Critical application error', 'ProfileComponent', {
            errorMessage: errorObj.message,
            stackTrace: errorObj.stack,
            context: 'User profile rendering',
            errorObject: error
          });
        }
      },

      // Warning logs
      () => {
        logger.warn('High memory usage detected', 'PerformanceMonitor', {
          currentUsage: '85%',
          threshold: '80%',
          recommendedAction: 'Consider clearing cache or restarting services'
        });
      },
      () => {
        logger.warn('API rate limit approaching', 'ExternalAPIService', {
          service: 'OpenWeather API',
          currentRequests: 950,
          maxRequests: 1000,
          resetTime: '2025-09-06T22:00:00Z'
        });
      },
      () => {
        logger.warn('Deprecated function usage detected', 'LegacyComponent', {
          function: 'getUserPreferences()',
          replacement: 'useUserPreferences() hook',
          deprecationDate: '2025-12-01',
          file: 'components/profile/Settings.tsx'
        });
      },

      // Info logs
      () => {
        logger.info('User successfully logged in', 'AuthService', {
          userId: 'user_456',
          email: 'john.doe@example.com',
          loginMethod: 'Google OAuth',
          location: 'San Francisco, CA',
          sessionId: 'sess_' + Date.now()
        });
      },
      () => {
        logger.info('Meal plan updated', 'MealPlanningComponent', {
          userId: 'user_789',
          mealDate: '2025-09-07',
          mealType: 'dinner',
          recipe: 'Grilled Salmon with Asparagus',
          servings: 4,
          prepTime: '25 minutes'
        });
      },
      () => {
        logger.info('Household invitation sent', 'HouseholdService', {
          inviterUserId: 'user_101',
          inviteeEmail: 'family@example.com',
          householdName: 'The Smith Family',
          role: 'member',
          expiresAt: '2025-09-13T21:30:00Z'
        });
      },
      () => {
        logger.info('Project task completed', 'ProjectsComponent', {
          taskId: 'task_555',
          projectName: 'Kitchen Renovation',
          taskName: 'Install new cabinets',
          completedBy: 'user_202',
          duration: '3 hours 45 minutes',
          completedAt: new Date().toISOString()
        });
      },

      // Debug logs
      () => {
        logger.debug('Component render cycle', 'DashboardWidget', {
          componentName: 'WeatherWidget',
          renderTime: '12ms',
          propsChanged: ['location', 'temperature'],
          childComponents: 3,
          memoryUsage: '2.1MB'
        });
      },
      () => {
        logger.debug('API request trace', 'HTTPClient', {
          method: 'GET',
          url: '/api/meals/favorites',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer [REDACTED]'
          },
          responseTime: '145ms',
          statusCode: 200,
          cacheHit: false
        });
      },
      () => {
        logger.debug('State update trace', 'ListsManager', {
          action: 'ADD_ITEM',
          listType: 'grocery',
          itemCount: 12,
          previousState: 'idle',
          newState: 'updating',
          timestamp: Date.now()
        });
      }
    ];

    // Generate logs with realistic timing
    for (let i = 0; i < testScenarios.length; i++) {
      setTimeout(() => {
        testScenarios[i]();
        setGeneratedCount(i + 1);

        if (i === testScenarios.length - 1) {
          setTimeout(() => {
            setIsGenerating(false);
          }, 500);
        }
      }, i * 200); // Stagger logs every 200ms
    }
  };

  const generateCriticalErrorBurst = () => {
    setIsGenerating(true);

    // Simulate a critical system failure with multiple related errors
    const errors = [
      'Redis connection lost',
      'Session store unavailable',
      'User authentication failing',
      'Database query timeout',
      'Cache miss causing performance degradation'
    ];

    errors.forEach((errorMsg, index) => {
      setTimeout(() => {
        logger.error(errorMsg, 'SystemCritical', {
          severity: 'critical',
          cascadeEffect: true,
          timestamp: new Date().toISOString(),
          systemLoad: Math.random() * 100,
          errorSequence: index + 1
        });

        if (index === errors.length - 1) {
          setTimeout(() => setIsGenerating(false), 200);
        }
      }, index * 100);
    });
  };

  const generateHighVolumeTraffic = () => {
    setIsGenerating(true);
    let count = 0;

    const generateLog = () => {
      const logTypes = [
        () =>
          logger.info('Page view', 'Analytics', {
            page: '/dashboard',
            userId: `user_${Math.floor(Math.random() * 1000)}`
          }),
        () =>
          logger.info('API call', 'HTTPLogger', {
            endpoint: '/api/meals',
            method: 'GET',
            responseTime: Math.floor(Math.random() * 200) + 'ms'
          }),
        () =>
          logger.debug('Component mount', 'ReactProfiler', {
            component: 'MealWidget',
            renderTime: Math.floor(Math.random() * 50) + 'ms'
          }),
        () =>
          logger.warn('Slow query', 'DatabaseMonitor', {
            query: 'SELECT * FROM meals',
            duration: Math.floor(Math.random() * 1000) + 500 + 'ms'
          })
      ];

      const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)];
      randomLog();
      count++;

      if (count < 20) {
        setTimeout(generateLog, Math.random() * 100 + 50); // Random interval 50-150ms
      } else {
        setIsGenerating(false);
      }
    };

    generateLog();
  };

  return (
    <>
      {/* Sidebar Navigation */}
      <LoggingNav
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-80'
        }`}
      >
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                🧪 Log Generation Testing
              </h1>
              <Link
                href="/logs-dashboard"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                📊 View Logs Dashboard
              </Link>
            </div>

            <div className="grid gap-6">
              {/* Comprehensive Test Suite */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🎯 Comprehensive Test Suite
                </h2>
                <p className="text-gray-600 mb-4">
                  Generates a variety of realistic logs including errors,
                  warnings, info, and debug messages across different components
                  and services.
                </p>
                <button
                  onClick={generateTestLogs}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating
                    ? `Generating... (${generatedCount}/15)`
                    : 'Generate Test Logs'}
                </button>
              </div>

              {/* Critical Error Simulation */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🚨 Critical Error Simulation
                </h2>
                <p className="text-gray-600 mb-4">
                  Simulates a cascading system failure with multiple related
                  critical errors to test error handling and alerting systems.
                </p>
                <button
                  onClick={generateCriticalErrorBurst}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating
                    ? 'Generating Critical Errors...'
                    : 'Simulate System Failure'}
                </button>
              </div>

              {/* High Volume Traffic */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  📈 High Volume Traffic Test
                </h2>
                <p className="text-gray-600 mb-4">
                  Generates rapid-fire logs to test dashboard performance and
                  filtering under high-volume conditions.
                </p>
                <button
                  onClick={generateHighVolumeTraffic}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating
                    ? 'Generating High Volume...'
                    : 'Generate Traffic Burst'}
                </button>
              </div>

              {/* Quick Individual Tests */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  ⚡ Quick Individual Tests
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() =>
                      logger.error('Test error message', 'TestComponent', {
                        testData: 'error test'
                      })
                    }
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    ❌ Error
                  </button>
                  <button
                    onClick={() =>
                      logger.warn('Test warning message', 'TestComponent', {
                        testData: 'warning test'
                      })
                    }
                    className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    ⚠️ Warning
                  </button>
                  <button
                    onClick={() =>
                      logger.info('Test info message', 'TestComponent', {
                        testData: 'info test'
                      })
                    }
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    ℹ️ Info
                  </button>
                  <button
                    onClick={() =>
                      logger.debug('Test debug message', 'TestComponent', {
                        testData: 'debug test'
                      })
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    🐛 Debug
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  📋 Testing Instructions
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li>
                    • <strong>Comprehensive Test:</strong> Generates 15
                    realistic logs across all levels
                  </li>
                  <li>
                    • <strong>Critical Errors:</strong> Tests error handling
                    with cascading failures
                  </li>
                  <li>
                    • <strong>High Volume:</strong> Tests dashboard performance
                    with rapid log generation
                  </li>
                  <li>
                    • <strong>Individual Tests:</strong> Quick single-log
                    generation for specific testing
                  </li>
                  <li>
                    • Open the <strong>Logs Dashboard</strong> to see real-time
                    results
                  </li>
                  <li>
                    • Test the new <strong>time range buttons</strong> to filter
                    by time periods
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
