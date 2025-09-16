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
 * 🔍 AUTO LOG REVIEW - Intelligent Log Analysis & Monitoring
 *
 * PURPOSE: Automated analysis of application logs to identify issues, patterns, and health metrics
 *
 * FEATURES:
 * - Comprehensive log analysis with health scoring (0-100)
 * - OAuth/authentication error detection and recommendations
 * - Repeated error pattern identification
 * - Performance issue detection (high-volume components, suspicious patterns)
 * - Auto-review mode (analyzes every 5 minutes, refreshes every 30 seconds)
 * - Component activity statistics and error categorization
 * - Actionable insights and recommendations
 *
 * ACCESS: Public - No authentication required (monitoring tool)
 *
 * TECHNICAL:
 * - Uses log-analyzer utility for intelligent pattern recognition
 * - Real-time analysis with configurable time ranges (default: 30 minutes)
 * - Background auto-review with cleanup functions
 * - Comprehensive error classification and health metrics
 *
 * NAVIGATION: Part of logging suite with LoggingNav sidebar
 * Best used with: logs-dashboard and test-console-logging for comprehensive monitoring
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { logAnalyzer, LogAnalysis } from '@/utils/log-analyzer';
import { type LogEntry } from '@/utils/logger';
import LoggingNav from '@/components/logging/LoggingNav';

export default function AutoLogReview() {
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoReviewEnabled, setAutoReviewEnabled] = useState(false);
  const [autoReviewInterval, setAutoReviewInterval] = useState<
    (() => void) | null
  >(null);
  const [lastReviewTime, setLastReviewTime] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLogLevel, setSelectedLogLevel] = useState<string | null>(null);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);

  const runAnalysis = useCallback(async (timeRangeMinutes: number = 30) => {
    setIsAnalyzing(true);
    try {
      const result = await logAnalyzer.analyzeSession(
        undefined,
        timeRangeMinutes
      );
      setAnalysis(result);
      setLastReviewTime(new Date().toLocaleString());
    } catch (error) {
      console.error('Analysis failed:', error);
      // Show a user-friendly error message
      alert(
        'Analysis failed - this might be due to a database timeout. Please try again or check the browser console for details.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const toggleAutoReview = useCallback(async () => {
    if (autoReviewEnabled) {
      // Stop auto review
      if (autoReviewInterval) {
        autoReviewInterval();
        setAutoReviewInterval(null);
      }
      setAutoReviewEnabled(false);
    } else {
      // Start auto review
      const cleanup = await logAnalyzer.startAutoReview(5); // Every 5 minutes
      setAutoReviewInterval(() => cleanup);
      setAutoReviewEnabled(true);

      // Run initial analysis
      runAnalysis();
    }
  }, [autoReviewEnabled, autoReviewInterval, runAnalysis]);

  // Auto-refresh every 30 seconds when auto-review is enabled
  useEffect(() => {
    if (autoReviewEnabled) {
      const interval = setInterval(() => {
        runAnalysis();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoReviewEnabled, runAnalysis]);

  const getHealthScoreEmoji = useMemo(
    () => (score: number) => {
      if (score >= 80) return '✅';
      if (score >= 60) return '⚠️';
      return '❌';
    },
    []
  );

  const handleLogLevelClick = useCallback(
    async (level: string) => {
      if (selectedLogLevel === level) {
        setSelectedLogLevel(null);
        setFilteredLogs([]);
        return;
      }

      setSelectedLogLevel(level);
      try {
        const logs = await logAnalyzer.getFilteredLogs(level, 30); // Get last 30 minutes
        setFilteredLogs(logs);
      } catch (error) {
        console.error('Failed to fetch filtered logs:', error);
        setFilteredLogs([]);
      }
    },
    [selectedLogLevel]
  );

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
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                🔍 Automated Log Review
              </h1>

              <div className="flex gap-4">
                <button
                  onClick={() => runAnalysis(30)}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isAnalyzing
                    ? '🔄 Analyzing...'
                    : '📊 Analyze Last 30 Minutes'}
                </button>

                <button
                  onClick={toggleAutoReview}
                  className={`px-4 py-2 rounded ${
                    autoReviewEnabled
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {autoReviewEnabled
                    ? '🛑 Stop Auto Review'
                    : '▶️ Start Auto Review'}
                </button>
              </div>
            </div>

            {autoReviewEnabled && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">🤖</span>
                  <div>
                    <strong className="text-green-800">
                      Auto Review Active
                    </strong>
                    <p className="text-sm text-green-700">
                      Automatically analyzing logs every 5 minutes. Dashboard
                      refreshes every 30 seconds.
                      {lastReviewTime && ` Last review: ${lastReviewTime}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analysis && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      📈 Log Analysis Report
                    </h2>
                    <div
                      className={`px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm`}
                    >
                      <span className="text-lg font-bold text-white">
                        {getHealthScoreEmoji(analysis.insights.healthScore)}{' '}
                        {analysis.insights.healthScore}/100 Health
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 text-blue-100 text-sm">
                    <strong>Analysis Period:</strong>{' '}
                    {analysis.summary.timeRange.start} to{' '}
                    {analysis.summary.timeRange.end}
                    <span className="ml-2">
                      ({analysis.summary.timeRange.duration})
                    </span>
                  </div>
                </div>

                {/* Metrics Overview */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <button
                      onClick={() => handleLogLevelClick('all')}
                      className={`text-center p-4 bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                        selectedLogLevel === 'all'
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {analysis.summary.totalLogs}
                      </div>
                      <div className="text-sm text-gray-800 font-semibold">
                        Total Logs
                      </div>
                    </button>
                    <button
                      onClick={() => handleLogLevelClick('error')}
                      className={`text-center p-4 bg-white rounded-lg shadow-sm border border-red-200 transition-all hover:shadow-md ${
                        selectedLogLevel === 'error'
                          ? 'ring-2 ring-red-500 bg-red-50'
                          : ''
                      }`}
                    >
                      <div className="text-2xl font-bold text-red-800">
                        {analysis.summary.errorCount}
                      </div>
                      <div className="text-sm text-red-800 font-bold">
                        Errors
                      </div>
                    </button>
                    <button
                      onClick={() => handleLogLevelClick('warn')}
                      className={`text-center p-4 bg-white rounded-lg shadow-sm border border-yellow-200 transition-all hover:shadow-md ${
                        selectedLogLevel === 'warn'
                          ? 'ring-2 ring-yellow-500 bg-yellow-50'
                          : ''
                      }`}
                    >
                      <div className="text-2xl font-bold text-yellow-800">
                        {analysis.summary.warningCount}
                      </div>
                      <div className="text-sm text-yellow-800 font-bold">
                        Warnings
                      </div>
                    </button>
                    <button
                      onClick={() => handleLogLevelClick('info')}
                      className={`text-center p-4 bg-white rounded-lg shadow-sm border border-blue-200 transition-all hover:shadow-md ${
                        selectedLogLevel === 'info'
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className="text-2xl font-bold text-blue-800">
                        {analysis.summary.infoCount}
                      </div>
                      <div className="text-sm text-blue-800 font-bold">
                        Info
                      </div>
                    </button>
                    <button
                      onClick={() => handleLogLevelClick('debug')}
                      className={`text-center p-4 bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                        selectedLogLevel === 'debug'
                          ? 'ring-2 ring-gray-500 bg-gray-50'
                          : ''
                      }`}
                    >
                      <div className="text-2xl font-bold text-gray-800">
                        {analysis.summary.debugCount}
                      </div>
                      <div className="text-sm text-gray-800 font-semibold">
                        Debug
                      </div>
                    </button>
                  </div>
                </div>

                {/* Filtered Logs Window */}
                {selectedLogLevel && (
                  <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-900">
                        📋{' '}
                        {selectedLogLevel === 'all'
                          ? 'All Logs'
                          : `${selectedLogLevel.charAt(0).toUpperCase() + selectedLogLevel.slice(1)} Logs`}
                        <span className="ml-2 text-sm font-normal">
                          ({filteredLogs.length} entries)
                        </span>
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedLogLevel(null);
                          setFilteredLogs([]);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto bg-white rounded-lg border border-blue-200">
                      {filteredLogs.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {filteredLogs.map((log, index) => (
                            <div key={index} className="p-3 hover:bg-gray-50">
                              <div className="flex items-start gap-3">
                                <span
                                  className={`text-xs px-2 py-1 rounded font-bold ${
                                    log.level === 'error'
                                      ? 'bg-red-100 text-red-800'
                                      : log.level === 'warn'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : log.level === 'info'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {log.level.toUpperCase()}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 break-words">
                                    {log.message}
                                  </div>
                                  <div className="text-xs text-gray-700 mt-1 font-medium">
                                    {log.component} •{' '}
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-700 font-medium">
                          <div className="text-2xl mb-2">📭</div>
                          <p>No logs found for this filter</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* OAuth Analysis */}
                {(analysis.oauth.authEvents.length > 0 ||
                  analysis.oauth.authErrors.length > 0) && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                      🔐 OAuth & Authentication Analysis
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-2xl font-bold text-blue-800">
                          {analysis.oauth.authEvents.length}
                        </div>
                        <div className="text-sm text-blue-800 font-bold">
                          Auth Events
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="text-2xl font-bold text-red-800">
                          {analysis.oauth.authErrors.length}
                        </div>
                        <div className="text-sm text-red-800 font-bold">
                          Auth Errors
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="text-2xl font-bold text-orange-800">
                          {analysis.oauth.pkceIssues.length}
                        </div>
                        <div className="text-sm text-orange-800 font-bold">
                          PKCE Issues
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="text-2xl font-bold text-purple-800">
                          {analysis.oauth.redirectIssues.length}
                        </div>
                        <div className="text-sm text-purple-800 font-bold">
                          Redirect Issues
                        </div>
                      </div>
                    </div>

                    {analysis.oauth.recommendations.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                          🔐 OAuth Recommendations:
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-900 font-semibold">
                          {analysis.oauth.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Issues & Problems */}
                {(analysis.issues.errors.length > 0 ||
                  analysis.issues.repeatedErrors.length > 0) && (
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                      🚨 Issues Detected
                    </h2>

                    {analysis.issues.repeatedErrors.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-red-900 mb-2">
                          🔁 Repeated Errors:
                        </h3>
                        <div className="space-y-2">
                          {analysis.issues.repeatedErrors
                            .slice(0, 5)
                            .map((error, index) => (
                              <div
                                key={index}
                                className="bg-red-50 border border-red-200 rounded p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-red-900">
                                      {error.message}
                                    </div>
                                    <div className="text-sm text-red-800 font-semibold">
                                      Occurred {error.count} times in:{' '}
                                      {error.locations.join(', ')}
                                    </div>
                                  </div>
                                  <span className="bg-red-200 text-red-900 px-2 py-1 rounded text-sm font-bold">
                                    {error.count}x
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {analysis.issues.performance.suspiciousPatterns.length >
                      0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-orange-800 mb-2">
                          ⚠️ Suspicious Patterns:
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-orange-900 font-semibold bg-orange-50 border border-orange-200 rounded p-3">
                          {analysis.issues.performance.suspiciousPatterns.map(
                            (pattern, index) => (
                              <li key={index}>{pattern}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {analysis.issues.performance.highVolumeComponents.length >
                      0 && (
                      <div>
                        <h3 className="font-semibold text-yellow-800 mb-2">
                          📊 High Volume Components:
                        </h3>
                        <div className="space-y-1">
                          {analysis.issues.performance.highVolumeComponents
                            .slice(0, 3)
                            .map((comp, index) => (
                              <div
                                key={index}
                                className="flex justify-between bg-yellow-50 border border-yellow-200 rounded p-2"
                              >
                                <span className="font-medium text-gray-900">
                                  {comp.component}
                                </span>
                                <span className="text-yellow-900 font-semibold">
                                  {comp.logsPerMinute} logs/min
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Insights & Recommendations */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    💡 Insights & Recommendations
                  </h2>

                  {analysis.insights.errorPatterns.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-blue-800 mb-2">
                        📋 Error Patterns:
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-900 font-semibold bg-blue-50 border border-blue-200 rounded p-3">
                        {analysis.insights.errorPatterns.map(
                          (pattern, index) => (
                            <li key={index}>{pattern}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {analysis.insights.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">
                        ✅ Recommendations:
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-green-900 font-semibold bg-green-50 border border-green-200 rounded p-3">
                        {analysis.insights.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Always show section with conditional message */}
                  {analysis.insights.errorPatterns.length === 0 &&
                    analysis.insights.recommendations.length === 0 && (
                      <div className="text-center py-8 text-gray-700">
                        <div className="text-4xl mb-2">✨</div>
                        <p className="text-gray-900 font-semibold">
                          No specific insights or recommendations at this time.
                        </p>
                        <p className="text-sm text-gray-800 mt-1 font-medium">
                          This is good news - your logs look healthy!
                        </p>
                      </div>
                    )}

                  {/* Show warning-based insights when there are warnings */}
                  {analysis.summary.warningCount > 0 &&
                    analysis.insights.recommendations.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">
                          ⚠️ Warning Analysis:
                        </h3>
                        <p className="text-sm text-yellow-900 font-semibold mb-2">
                          Found {analysis.summary.warningCount} warnings in your
                          logs. Common causes:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-900 font-semibold">
                          <li>TypeScript type issues that need attention</li>
                          <li>Performance warnings from slow operations</li>
                          <li>Deprecated API usage that should be updated</li>
                          <li>Component lifecycle or hydration warnings</li>
                        </ul>
                        <p className="text-sm text-yellow-800 mt-2 font-medium">
                          💡 Click the &quot;Warnings&quot; button above to see
                          specific warning details.
                        </p>
                      </div>
                    )}
                </div>

                {/* Top Components */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    📊 Top Active Components
                  </h2>
                  {analysis.summary.topComponents.length > 0 ? (
                    <div className="space-y-2">
                      {analysis.summary.topComponents.map((comp, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded"
                        >
                          <span className="font-medium text-gray-900">
                            {comp.component}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 font-semibold">
                              {comp.count} logs
                            </span>
                            <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-sm font-bold">
                              {comp.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-700">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-900 font-semibold">
                        No component activity data available.
                      </p>
                      <p className="text-sm text-gray-800 mt-1 font-medium">
                        Generate more logs to see component statistics.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!analysis && !isAnalyzing && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  No Analysis Yet
                </h2>
                <p className="text-gray-900 mb-4 font-semibold">
                  Run your first log analysis to see comprehensive insights
                  about your app&apos;s behavior.
                </p>
                <button
                  onClick={() => runAnalysis(30)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  📊 Analyze Recent Logs
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/dashboard"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold transition-colors"
              >
                🏠 Back to Dashboard
              </a>
              <a
                href="/logs-dashboard"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold transition-colors"
              >
                📊 View Logs Dashboard
              </a>
              <a
                href="/test-console-logging"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-lg font-semibold transition-colors"
              >
                🧪 Test Console Logging
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
