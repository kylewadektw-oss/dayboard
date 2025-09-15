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
 * FEATURE ANALYTICS DASHBOARD - Feature Usage & Business Intelligence
 * 
 * PURPOSE: Comprehensive feature adoption analysis, A/B testing results, user journey
 * tracking, and business intelligence for product optimization and decision making
 * 
 * FEATURES:
 * - Feature adoption rates and usage patterns over time
 * - A/B test management, results tracking, and statistical significance analysis
 * - User journey mapping with conversion funnel analysis
 * - Drop-off point identification and optimization recommendations
 * - Feature discovery patterns and onboarding effectiveness
 * - Return user behavior analysis and retention metrics
 * - Business impact assessment and ROI tracking per feature
 * 
 * ACCESS: Product team, marketing team, and executive team - Requires business authentication
 * 
 * TECHNICAL:
 * - Event-driven analytics with real-time feature usage tracking
 * - Statistical analysis engines for A/B testing significance
 * - Cohort analysis and retention calculation algorithms
 * - Machine learning integration for pattern recognition
 * 
 * NAVIGATION: Part of business intelligence suite
 * Links to: user-analytics, business-intelligence, conversion-tracking
 */

'use client';

import { useState } from 'react';
import LoggingNav from '@/components/logging/LoggingNav';

export default function FeatureAnalytics() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('adoption');

  // Mock feature analytics data
  const mockData = {
    featureAdoption: [
      { feature: 'Dashboard', users: 2847, adoption: 94.2, trend: '+2.3%' },
      { feature: 'Project Management', users: 2156, adoption: 71.4, trend: '+5.7%' },
      { feature: 'Meal Planning', users: 1893, adoption: 62.6, trend: '+8.1%' },
      { feature: 'List Management', users: 1654, adoption: 54.7, trend: '+3.2%' },
      { feature: 'Work Tracking', users: 1321, adoption: 43.7, trend: '+12.4%' }
    ],
    abTests: [
      { 
        name: 'New Dashboard Layout', 
        status: 'running', 
        confidence: 87.3, 
        lift: '+12.4%',
        participants: 1247,
        startDate: '2025-08-15'
      },
      { 
        name: 'Onboarding Flow V2', 
        status: 'completed', 
        confidence: 95.2, 
        lift: '+23.7%',
        participants: 2156,
        startDate: '2025-07-20'
      },
      { 
        name: 'Mobile Navigation', 
        status: 'planning', 
        confidence: 0, 
        lift: 'TBD',
        participants: 0,
        startDate: '2025-09-10'
      }
    ],
    conversionFunnel: [
      { stage: 'Landing Page Visit', users: 5000, conversion: 100, dropOff: 0 },
      { stage: 'Sign Up Started', users: 3750, conversion: 75, dropOff: 25 },
      { stage: 'Account Created', users: 3125, conversion: 62.5, dropOff: 16.7 },
      { stage: 'First Feature Used', users: 2500, conversion: 50, dropOff: 20 },
      { stage: 'Regular User', users: 1875, conversion: 37.5, dropOff: 25 }
    ],
    retentionCohorts: {
      week1: 78.5,
      week2: 65.3,
      week4: 52.7,
      week8: 43.2,
      week12: 38.9
    }
  };

  const tabs = [
    { id: 'adoption', label: '📈 Feature Adoption', icon: '🎯' },
    { id: 'ab-tests', label: '🧪 A/B Testing', icon: '⚗️' },
    { id: 'funnels', label: '🔄 Conversion Funnels', icon: '📊' },
    { id: 'retention', label: '💎 User Retention', icon: '🔄' },
    { id: 'discovery', label: '🔍 Feature Discovery', icon: '💡' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  return (
    <>
      <LoggingNav 
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'}`}>
        <div className="p-6 max-w-full mx-auto bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Feature Analytics Dashboard</h1>
            <p className="text-gray-600">
              Feature adoption tracking, A/B testing results, and business intelligence for product optimization
            </p>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Active Features</h3>
                <div className="text-2xl">🎯</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
              <div className="text-sm text-gray-500">In production</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Average Adoption</h3>
                <div className="text-2xl">📊</div>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">65.3%</div>
              <div className="text-sm text-green-500">+4.2% this week</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Active A/B Tests</h3>
                <div className="text-2xl">🧪</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
              <div className="text-sm text-gray-500">2 completing soon</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">User Retention</h3>
                <div className="text-2xl">💎</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">78.5%</div>
              <div className="text-sm text-gray-500">Week 1 retention</div>
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
              {activeTab === 'adoption' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">📈 Feature Adoption Analysis</h3>
                  
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900">Feature Usage Statistics</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Users</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adoption Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mockData.featureAdoption.map((feature, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{feature.feature}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{feature.users.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{feature.adoption}%</div>
                                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${feature.adoption}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${getTrendColor(feature.trend)}`}>
                                  {feature.trend}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900 text-sm">View Details</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Feature Usage Timeline</h4>
                    <p className="text-gray-600">
                      Interactive charts showing feature adoption trends, seasonal patterns, and correlation analysis.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'ab-tests' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">🧪 A/B Testing Dashboard</h3>
                  
                  <div className="grid gap-6">
                    {mockData.abTests.map((test, index) => (
                      <div key={index} className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{test.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.status)}`}>
                            {test.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">Confidence Level</div>
                            <div className="text-xl font-bold text-gray-900">{test.confidence}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Performance Lift</div>
                            <div className={`text-xl font-bold ${test.lift.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                              {test.lift}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Participants</div>
                            <div className="text-xl font-bold text-gray-900">{test.participants.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Start Date</div>
                            <div className="text-xl font-bold text-gray-900">{test.startDate}</div>
                          </div>
                        </div>
                        
                        {test.status === 'running' && (
                          <div className="mt-4 flex space-x-3">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                              View Details
                            </button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                              Stop Test
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">⚗️</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Statistical Analysis Engine</h4>
                    <p className="text-gray-600">
                      Advanced statistical significance testing, Bayesian analysis, and confidence interval calculations.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'funnels' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">🔄 Conversion Funnel Analysis</h3>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">User Onboarding Funnel</h4>
                    <div className="space-y-4">
                      {mockData.conversionFunnel.map((stage, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-16 text-center">
                            <div className="text-2xl">{index + 1}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{stage.stage}</h5>
                              <div className="text-sm text-gray-600">
                                {stage.users.toLocaleString()} users ({stage.conversion}%)
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div
                                className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${stage.conversion}%` }}
                              >
                                {stage.dropOff > 0 && (
                                  <span className="text-xs text-white font-medium">-{stage.dropOff}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Advanced Funnel Analytics</h4>
                    <p className="text-gray-600">
                      Cohort-based funnels, time-to-conversion analysis, and drop-off point optimization recommendations.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'retention' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">💎 User Retention Analysis</h3>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-6">Cohort Retention Rates</h4>
                    <div className="grid grid-cols-5 gap-4">
                      {Object.entries(mockData.retentionCohorts).map(([period, rate]) => (
                        <div key={period} className="text-center">
                          <div className="text-sm text-gray-600 mb-2">{period.replace('week', 'Week ')}</div>
                          <div className="text-2xl font-bold text-blue-600">{rate}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">🔄</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Retention Cohort Analysis</h4>
                    <p className="text-gray-600">
                      Detailed cohort tables, retention curves, and predictive analytics for user lifecycle management.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'discovery' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">🔍 Feature Discovery Patterns</h3>
                  
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">💡</div>
                    <h4 className="text-xl font-medium text-gray-900 mb-2">Feature Discovery Analytics</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Analysis of how users discover new features, onboarding effectiveness, and feature discoverability optimization.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>🎯 Discovery paths</div>
                      <div>📚 Onboarding effectiveness</div>
                      <div>💡 Feature highlights</div>
                      <div>🔄 Usage patterns</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Implementation Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🚧</div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Business Intelligence Implementation</h3>
                <p className="text-green-700 mb-4">
                  Feature analytics system will provide comprehensive business insights including:
                </p>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Real-time feature usage tracking with event-driven analytics</li>
                  <li>• A/B testing framework with statistical significance engines</li>
                  <li>• Conversion funnel analysis with cohort segmentation</li>
                  <li>• User retention analytics and churn prediction</li>
                  <li>• Feature discovery optimization and onboarding analytics</li>
                  <li>• Business impact measurement and ROI calculation</li>
                  <li>• Predictive analytics for feature success forecasting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
