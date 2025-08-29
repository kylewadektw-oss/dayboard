/**
 * Security Dashboard Component
 * Displays security metrics, audit logs, and security settings
 */

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { securityLogger } from '../lib/securityLogger';
import type { AuditEvent } from '../lib/securityLogger';

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  dataAccess: number;
  securityViolations: number;
  lastLogin?: Date;
  suspiciousActivity: boolean;
}

export default function SecurityDashboard() {
  const { user, sessionMetadata, isSecureSession } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalLogins: 0,
    failedLogins: 0,
    dataAccess: 0,
    securityViolations: 0,
    suspiciousActivity: false
  });
  const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([]);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Get recent security events
    const events = securityLogger.getEventsByUser(user.id, 20);
    setRecentEvents(events);

    // Calculate security metrics
    const authEvents = events.filter(e => e.event_type === 'auth');
    const failedAuth = authEvents.filter(e => !e.success);
    const dataEvents = events.filter(e => e.event_type === 'data_access');
    const violations = events.filter(e => e.event_type === 'security');

    // Check for suspicious activity
    const { suspicious } = securityLogger.detectSuspiciousActivity(user.id);

    setMetrics({
      totalLogins: authEvents.length,
      failedLogins: failedAuth.length,
      dataAccess: dataEvents.length,
      securityViolations: violations.length,
      lastLogin: sessionMetadata.loginTime,
      suspiciousActivity: suspicious
    });
  }, [user, sessionMetadata]);

  const getEventIcon = (event: AuditEvent) => {
    switch (event.event_type) {
      case 'auth':
        return event.success ? '✅' : '❌';
      case 'data_access':
        return '📖';
      case 'data_modify':
        return event.success ? '✏️' : '⚠️';
      case 'security':
        return '🚨';
      case 'error':
        return '💥';
      default:
        return '📋';
    }
  };

  const getSeverityColor = (severity: AuditEvent['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please sign in to view security dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔒 Security Dashboard</h1>
            <p className="text-gray-600">Monitor your account security and activity</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isSecureSession ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isSecureSession ? '🛡️ Secure Session' : '⚠️ Session Warning'}
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800 mb-1">Current Session</div>
            <div className="text-2xl font-bold text-blue-900">{sessionMetadata.deviceFingerprint?.slice(0, 8)}...</div>
            <div className="text-xs text-blue-600">Device ID</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-800 mb-1">Login Time</div>
            <div className="text-lg font-bold text-green-900">
              {sessionMetadata.loginTime ? sessionMetadata.loginTime.toLocaleTimeString() : 'Unknown'}
            </div>
            <div className="text-xs text-green-600">
              {sessionMetadata.loginTime ? sessionMetadata.loginTime.toLocaleDateString() : ''}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-800 mb-1">Last Activity</div>
            <div className="text-lg font-bold text-purple-900">
              {sessionMetadata.lastActivity ? formatEventTime(sessionMetadata.lastActivity.toISOString()) : 'Unknown'}
            </div>
            <div className="text-xs text-purple-600">Auto-lock in 30min</div>
          </div>
        </div>

        {/* Security Alert */}
        {metrics.suspiciousActivity && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-xl">🚨</span>
              <div>
                <div className="font-semibold">Suspicious Activity Detected</div>
                <div className="text-sm">Please review your recent activity and change your password if necessary.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Logins</h3>
            <span className="text-2xl">🔑</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.totalLogins}</div>
          <div className="text-sm text-gray-500">Authentication events</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Failed Logins</h3>
            <span className="text-2xl">❌</span>
          </div>
          <div className={`text-3xl font-bold mb-2 ${metrics.failedLogins > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.failedLogins}
          </div>
          <div className="text-sm text-gray-500">Security incidents</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Access</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">{metrics.dataAccess}</div>
          <div className="text-sm text-gray-500">Recent queries</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Violations</h3>
            <span className="text-2xl">🚨</span>
          </div>
          <div className={`text-3xl font-bold mb-2 ${metrics.securityViolations > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.securityViolations}
          </div>
          <div className="text-sm text-gray-500">Security alerts</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Security Events</h3>
          <button
            onClick={() => setShowDetailedLogs(!showDetailedLogs)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showDetailedLogs ? 'Show Less' : 'Show Details'}
          </button>
        </div>

        <div className="space-y-3">
          {recentEvents.slice(0, showDetailedLogs ? 20 : 10).map((event, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{getEventIcon(event)}</span>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{event.action}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {event.resource && `Resource: ${event.resource} • `}
                  {event.details && Object.keys(event.details).length > 0 && 
                    `Details: ${JSON.stringify(event.details).slice(0, 100)}...`
                  }
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {formatEventTime(event.timestamp!)}
              </div>
            </div>
          ))}
        </div>

        {recentEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recent security events
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Recommendations</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600">✅</span>
            <span className="text-green-800">Strong authentication enabled</span>
          </div>
          
          {metrics.failedLogins > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-800">Recent failed login attempts detected - monitor for suspicious activity</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-600">💡</span>
            <span className="text-blue-800">Enable two-factor authentication for enhanced security</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <span className="text-purple-600">🔄</span>
            <span className="text-purple-800">Regularly update your master password for credentials</span>
          </div>
        </div>
      </div>
    </div>
  );
}
