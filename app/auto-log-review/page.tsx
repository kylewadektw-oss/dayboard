'use client';

import { useState, useEffect } from 'react';
import { logAnalyzer, LogAnalysis } from '@/utils/log-analyzer';
import LoggingNav from '@/components/logging/LoggingNav';

export default function AutoLogReview() {
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoReviewEnabled, setAutoReviewEnabled] = useState(false);
  const [autoReviewInterval, setAutoReviewInterval] = useState<(() => void) | null>(null);
  const [lastReviewTime, setLastReviewTime] = useState<string>('');

  const runAnalysis = async (timeRangeMinutes: number = 30) => {
    setIsAnalyzing(true);
    try {
      const result = await logAnalyzer.analyzeSession(undefined, timeRangeMinutes);
      setAnalysis(result);
      setLastReviewTime(new Date().toLocaleString());
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleAutoReview = async () => {
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
  };

  // Auto-refresh every 30 seconds when auto-review is enabled
  useEffect(() => {
    if (autoReviewEnabled) {
      const interval = setInterval(() => {
        runAnalysis();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoReviewEnabled]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getHealthScoreEmoji = (score: number) => {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️';
    return '❌';
  };

  return (
    <>
      <LoggingNav />
      <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🔍 Automated Log Review</h1>
        
        <div className="flex gap-4">
          <button
            onClick={() => runAnalysis(30)}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isAnalyzing ? '🔄 Analyzing...' : '📊 Analyze Last 30 Minutes'}
          </button>
          
          <button
            onClick={toggleAutoReview}
            className={`px-4 py-2 rounded ${
              autoReviewEnabled 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {autoReviewEnabled ? '🛑 Stop Auto Review' : '▶️ Start Auto Review'}
          </button>
        </div>
      </div>

      {autoReviewEnabled && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-lg">🤖</span>
            <div>
              <strong className="text-green-800">Auto Review Active</strong>
              <p className="text-sm text-green-700">
                Automatically analyzing logs every 5 minutes. Dashboard refreshes every 30 seconds.
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
              <h2 className="text-2xl font-bold">📈 Log Analysis Report</h2>
              <div className={`px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm`}>
                <span className="text-lg font-bold text-white">
                  {getHealthScoreEmoji(analysis.insights.healthScore)} {analysis.insights.healthScore}/100 Health
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-blue-100 text-sm">
              <strong>Analysis Period:</strong> {analysis.summary.timeRange.start} to {analysis.summary.timeRange.end} 
              <span className="ml-2">({analysis.summary.timeRange.duration})</span>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-gray-900">{analysis.summary.totalLogs}</div>
                <div className="text-sm text-gray-800 font-semibold">Total Logs</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-red-200">
                <div className="text-2xl font-bold text-red-800">{analysis.summary.errorCount}</div>
                <div className="text-sm text-red-800 font-bold">Errors</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-800">{analysis.summary.warningCount}</div>
                <div className="text-sm text-yellow-800 font-bold">Warnings</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-200">
                <div className="text-2xl font-bold text-blue-800">{analysis.summary.infoCount}</div>
                <div className="text-sm text-blue-800 font-bold">Info</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-gray-800">{analysis.summary.debugCount}</div>
                <div className="text-sm text-gray-800 font-semibold">Debug</div>
              </div>
            </div>
          </div>

          {/* OAuth Analysis */}
          {(analysis.oauth.authEvents.length > 0 || analysis.oauth.authErrors.length > 0) && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">🔐 OAuth & Authentication Analysis</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-800">{analysis.oauth.authEvents.length}</div>
                  <div className="text-sm text-blue-800 font-bold">Auth Events</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-800">{analysis.oauth.authErrors.length}</div>
                  <div className="text-sm text-red-800 font-bold">Auth Errors</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-2xl font-bold text-orange-800">{analysis.oauth.pkceIssues.length}</div>
                  <div className="text-sm text-orange-800 font-bold">PKCE Issues</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-2xl font-bold text-purple-800">{analysis.oauth.redirectIssues.length}</div>
                  <div className="text-sm text-purple-800 font-bold">Redirect Issues</div>
                </div>
              </div>

              {analysis.oauth.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">🔐 OAuth Recommendations:</h3>
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
          {(analysis.issues.errors.length > 0 || analysis.issues.repeatedErrors.length > 0) && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">🚨 Issues Detected</h2>

              {analysis.issues.repeatedErrors.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-red-900 mb-2">🔁 Repeated Errors:</h3>
                  <div className="space-y-2">
                    {analysis.issues.repeatedErrors.slice(0, 5).map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-red-900">{error.message}</div>
                            <div className="text-sm text-red-800 font-semibold">
                              Occurred {error.count} times in: {error.locations.join(', ')}
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

              {analysis.issues.performance.suspiciousPatterns.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-orange-800 mb-2">⚠️ Suspicious Patterns:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-orange-900 font-semibold bg-orange-50 border border-orange-200 rounded p-3">
                    {analysis.issues.performance.suspiciousPatterns.map((pattern, index) => (
                      <li key={index}>{pattern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.issues.performance.highVolumeComponents.length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">📊 High Volume Components:</h3>
                  <div className="space-y-1">
                    {analysis.issues.performance.highVolumeComponents.slice(0, 3).map((comp, index) => (
                      <div key={index} className="flex justify-between bg-yellow-50 border border-yellow-200 rounded p-2">
                        <span className="font-medium text-gray-900">{comp.component}</span>
                        <span className="text-yellow-900 font-semibold">{comp.logsPerMinute} logs/min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Insights & Recommendations */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">💡 Insights & Recommendations</h2>

            {analysis.insights.errorPatterns.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Error Patterns:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-900 font-semibold bg-blue-50 border border-blue-200 rounded p-3">
                  {analysis.insights.errorPatterns.map((pattern, index) => (
                    <li key={index}>{pattern}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.insights.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-800 mb-2">✅ Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 font-semibold bg-green-50 border border-green-200 rounded p-3">
                  {analysis.insights.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.insights.errorPatterns.length === 0 && analysis.insights.recommendations.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-gray-900 font-semibold">No specific insights or recommendations at this time.</p>
                <p className="text-sm text-gray-700 mt-1">This is good news - your logs look healthy!</p>
              </div>
            )}
          </div>

          {/* Top Components */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📊 Top Active Components</h2>
            {analysis.summary.topComponents.length > 0 ? (
              <div className="space-y-2">
                {analysis.summary.topComponents.map((comp, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-900">{comp.component}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-semibold">{comp.count} logs</span>
                      <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-sm font-bold">
                        {comp.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-900 font-semibold">No component activity data available.</p>
                <p className="text-sm text-gray-700 mt-1">Generate more logs to see component statistics.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">No Analysis Yet</h2>
          <p className="text-gray-900 mb-4 font-semibold">
            Run your first log analysis to see comprehensive insights about your app's behavior.
          </p>
          <button
            onClick={() => runAnalysis(30)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            📊 Analyze Recent Logs
          </button>
        </div>
      )}
      </div>
    </>
  );
}
