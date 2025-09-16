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
 * SECURITY MONITORING DASHBOARD - Security Events & Compliance Tracking
 *
 * PURPOSE: Comprehensive security monitoring including authentication events,
 * suspicious activity detection, data access auditing, and compliance reporting
 *
 * FEATURES:
 * - Real-time security event monitoring and threat detection
 * - Authentication failure analysis and brute force detection
 * - Suspicious user behavior pattern recognition
 * - Data access audit trails and permission monitoring
 * - GDPR/CCPA compliance tracking and privacy event logging
 * - XSS/CSRF attempt detection and security vulnerability alerts
 * - IP geolocation tracking and anomalous access detection
 * - Security incident response and escalation workflows
 *
 * ACCESS: Security team and system administrators - Requires high-level security clearance
 *
 * TECHNICAL:
 * - Real-time security event processing with machine learning anomaly detection
 * - Integration with security information and event management (SIEM) systems
 * - Automated threat intelligence correlation and risk scoring
 * - Compliance framework integration and automated reporting
 *
 * NAVIGATION: Part of security operations center (SOC) suite
 * Links to: audit-logs, compliance-reports, incident-management
 */

'use client';

import { useState } from 'react';
import LoggingNav from '@/components/logging/LoggingNav';

export default function SecurityMonitoring() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock security data
  const mockData = {
    securityScore: 94,
    threatsBlocked: 127,
    authFailures: 23,
    suspiciousActivity: 8,
    complianceStatus: 'compliant',

    recentThreats: [
      {
        type: 'Brute Force Attack',
        severity: 'high',
        count: 15,
        lastSeen: '2 minutes ago',
        ip: '192.168.1.45',
        location: 'Unknown'
      },
      {
        type: 'XSS Attempt',
        severity: 'medium',
        count: 7,
        lastSeen: '15 minutes ago',
        ip: '10.0.0.23',
        location: 'San Francisco, CA'
      },
      {
        type: 'Unusual Login Pattern',
        severity: 'low',
        count: 3,
        lastSeen: '1 hour ago',
        ip: '172.16.0.8',
        location: 'New York, NY'
      }
    ],

    authenticationEvents: {
      totalLogins: 1847,
      failedLogins: 23,
      successRate: 98.8,
      mfaUsage: 76.3
    },

    complianceMetrics: {
      gdprCompliance: 97.2,
      dataRetention: 94.8,
      accessControls: 99.1,
      auditTrails: 100
    },

    riskLevels: {
      critical: 0,
      high: 2,
      medium: 8,
      low: 17
    }
  };

  const tabs = [
    { id: 'overview', label: '🛡️ Security Overview', icon: '📊' },
    { id: 'threats', label: '🚨 Threat Detection', icon: '⚠️' },
    { id: 'authentication', label: '🔐 Authentication', icon: '👤' },
    { id: 'compliance', label: '📋 Compliance', icon: '✅' },
    { id: 'audit', label: '📝 Audit Trails', icon: '📜' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <LoggingNav
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'}`}
      >
        <div className="p-6 max-w-full mx-auto bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🛡️ Security Monitoring Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time security event monitoring, threat detection, and
              compliance tracking
            </p>
          </div>

          {/* Security Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Security Score
                </h3>
                <div className="text-2xl">🛡️</div>
              </div>
              <div
                className={`text-3xl font-bold mb-2 ${getSecurityScoreColor(mockData.securityScore)}`}
              >
                {mockData.securityScore}
              </div>
              <div className="text-sm text-gray-500">
                Overall security health
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Threats Blocked
                </h3>
                <div className="text-2xl">🚫</div>
              </div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {mockData.threatsBlocked}
              </div>
              <div className="text-sm text-gray-500">Last 24 hours</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Auth Failures
                </h3>
                <div className="text-2xl">🔐</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {mockData.authFailures}
              </div>
              <div className="text-sm text-gray-500">Failed login attempts</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Suspicious Activity
                </h3>
                <div className="text-2xl">👁️</div>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {mockData.suspiciousActivity}
              </div>
              <div className="text-sm text-gray-500">Flagged events</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Compliance
                </h3>
                <div className="text-2xl">✅</div>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {mockData.complianceStatus === 'compliant' ? '✓' : '⚠️'}
              </div>
              <div className="text-sm text-gray-500">GDPR/CCPA status</div>
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Risk Level Distribution
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {mockData.riskLevels.critical}
                </div>
                <div className="text-sm text-red-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {mockData.riskLevels.high}
                </div>
                <div className="text-sm text-orange-600">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {mockData.riskLevels.medium}
                </div>
                <div className="text-sm text-yellow-600">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {mockData.riskLevels.low}
                </div>
                <div className="text-sm text-blue-600">Low</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🛡️ Security Overview
                  </h3>

                  {/* Recent Threats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Recent Security Events
                    </h4>
                    <div className="space-y-4">
                      {mockData.recentThreats.map((threat, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-4 rounded-lg border"
                        >
                          <div className="flex items-center space-x-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)}`}
                            >
                              {threat.severity.toUpperCase()}
                            </span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {threat.type}
                              </div>
                              <div className="text-sm text-gray-600">
                                {threat.count} attempts from {threat.ip} (
                                {threat.location})
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {threat.lastSeen}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Security Analytics Dashboard
                    </h4>
                    <p className="text-gray-600">
                      Real-time security metrics, threat intelligence feeds, and
                      automated response workflows.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'threats' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🚨 Threat Detection & Response
                  </h3>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h4 className="text-xl font-medium text-gray-900 mb-2">
                      Advanced Threat Detection
                    </h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Machine learning-powered threat detection, behavioral
                      analysis, and automated incident response.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>🤖 ML-based detection</div>
                      <div>📊 Behavioral analysis</div>
                      <div>🚨 Real-time alerts</div>
                      <div>🔄 Auto-response</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'authentication' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🔐 Authentication Security
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {mockData.authenticationEvents.totalLogins.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">Total Logins</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {mockData.authenticationEvents.failedLogins}
                      </div>
                      <div className="text-sm text-red-600">
                        Failed Attempts
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {mockData.authenticationEvents.successRate}%
                      </div>
                      <div className="text-sm text-green-600">Success Rate</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {mockData.authenticationEvents.mfaUsage}%
                      </div>
                      <div className="text-sm text-purple-600">MFA Usage</div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">👤</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Authentication Analytics
                    </h4>
                    <p className="text-gray-600">
                      Login pattern analysis, device fingerprinting, and
                      anomalous authentication detection.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📋 Compliance Monitoring
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">
                        {mockData.complianceMetrics.gdprCompliance}%
                      </div>
                      <div className="text-sm text-green-600">
                        GDPR Compliance
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {mockData.complianceMetrics.dataRetention}%
                      </div>
                      <div className="text-sm text-blue-600">
                        Data Retention
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {mockData.complianceMetrics.accessControls}%
                      </div>
                      <div className="text-sm text-purple-600">
                        Access Controls
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">
                        {mockData.complianceMetrics.auditTrails}%
                      </div>
                      <div className="text-sm text-green-600">Audit Trails</div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Compliance Automation
                    </h4>
                    <p className="text-gray-600">
                      Automated compliance reporting, policy enforcement, and
                      regulatory requirement tracking.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📝 Audit Trail Management
                  </h3>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">📜</div>
                    <h4 className="text-xl font-medium text-gray-900 mb-2">
                      Comprehensive Audit Logging
                    </h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Detailed audit trails for all system access, data
                      modifications, and administrative actions.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>📊 Access logs</div>
                      <div>🔄 Data changes</div>
                      <div>👥 User actions</div>
                      <div>⚙️ System events</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Implementation Status */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🚧</div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Security Implementation Roadmap
                </h3>
                <p className="text-red-700 mb-4">
                  Comprehensive security monitoring system will include:
                </p>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>
                    • Real-time threat detection with machine learning anomaly
                    analysis
                  </li>
                  <li>
                    • Authentication failure monitoring and brute force
                    detection
                  </li>
                  <li>
                    • Behavioral analysis for suspicious activity identification
                  </li>
                  <li>
                    • SIEM integration for centralized security event management
                  </li>
                  <li>
                    • Automated compliance reporting for GDPR, CCPA, and other
                    regulations
                  </li>
                  <li>• Audit trail management with tamper-proof logging</li>
                  <li>
                    • Incident response automation and escalation workflows
                  </li>
                  <li>• Threat intelligence feeds and IOC correlation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
