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
 * BUSINESS INTELLIGENCE DASHBOARD - KPIs & Strategic Metrics
 * 
 * PURPOSE: Comprehensive business intelligence including revenue tracking,
 * user engagement metrics, and strategic decision-making analytics
 * 
 * FEATURES:
 * - Revenue analytics and financial performance tracking
 * - User engagement and retention analysis with cohort studies
 * - Conversion funnel optimization and A/B testing results
 * - Customer lifetime value (CLV) and acquisition cost (CAC) metrics
 * - Market penetration analysis and competitive intelligence
 * - Operational efficiency metrics and cost optimization insights
 * - Predictive analytics for growth forecasting and trend analysis
 * - Strategic KPI dashboards for executive decision-making
 * 
 * ACCESS: Executive team, product managers, and business analysts
 * 
 * TECHNICAL:
 * - Real-time business metrics aggregation and visualization
 * - Integration with revenue tracking and analytics platforms
 * - Advanced statistical analysis and predictive modeling
 * - Executive-level reporting with drill-down capabilities
 * 
 * NAVIGATION: Part of strategic business analytics suite
 * Links to: financial-reports, user-analytics, performance-metrics
 */

'use client';

import { useState } from 'react';
import LoggingNav from '@/components/logging/LoggingNav';

export default function BusinessIntelligence() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock business intelligence data
  const mockData = {
    revenue: {
      current: 147850,
      growth: 12.8,
      target: 165000,
      recurring: 89.2
    },
    
    users: {
      total: 2847,
      active: 1923,
      new: 156,
      churn: 3.2
    },
    
    conversion: {
      signupToTrial: 68.4,
      trialToPaid: 23.7,
      overallConversion: 16.2,
      averageOrderValue: 89.50
    },
    
    retention: {
      day1: 87.3,
      day7: 62.1,
      day30: 45.8,
      day90: 38.2
    },
    
    financial: {
      mrr: 98750,
      arr: 1185000,
      cac: 45.20,
      clv: 567.80,
      ltv_cac_ratio: 12.6
    },
    
    topFeatures: [
      { name: 'Dashboard Views', usage: 89.4, revenue: '$23,450' },
      { name: 'Project Management', usage: 76.2, revenue: '$18,920' },
      { name: 'Team Collaboration', usage: 68.7, revenue: '$15,340' },
      { name: 'Analytics Reports', usage: 54.3, revenue: '$12,780' },
      { name: 'Mobile Access', usage: 43.9, revenue: '$8,965' }
    ],
    
    revenueStreams: [
      { name: 'Subscription Plans', amount: 89450, percentage: 60.5 },
      { name: 'Premium Features', amount: 34200, percentage: 23.1 },
      { name: 'Enterprise Licenses', amount: 18900, percentage: 12.8 },
      { name: 'Consulting Services', amount: 5300, percentage: 3.6 }
    ],
    
    marketMetrics: {
      marketShare: 8.7,
      competitorGap: '+2.3%',
      brandAwareness: 34.2,
      customerSatisfaction: 4.6
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Business Overview', icon: '💼' },
    { id: 'revenue', label: '💰 Revenue Analytics', icon: '📈' },
    { id: 'users', label: '👥 User Intelligence', icon: '👤' },
    { id: 'conversion', label: '🎯 Conversion Funnels', icon: '🔄' },
    { id: 'forecasting', label: '🔮 Predictive Analytics', icon: '📊' }
  ];

  const getGrowthColor = (value: number) => {
    if (value > 10) return 'text-green-600';
    if (value > 0) return 'text-blue-600';
    if (value > -5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (value: number, benchmark: number = 50) => {
    if (value >= benchmark * 1.2) return 'text-green-600';
    if (value >= benchmark) return 'text-blue-600';
    if (value >= benchmark * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💼 Business Intelligence Dashboard</h1>
            <p className="text-gray-600">
              Strategic KPIs, revenue analytics, and business performance insights for data-driven decision making
            </p>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                <div className="text-2xl">💰</div>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(mockData.revenue.current)}
              </div>
              <div className={`text-sm ${getGrowthColor(mockData.revenue.growth)}`}>
                +{mockData.revenue.growth}% vs last month
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</h3>
                <div className="text-2xl">🔄</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(mockData.financial.mrr)}
              </div>
              <div className="text-sm text-gray-500">ARR: {formatCurrency(mockData.financial.arr)}</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
                <div className="text-2xl">👥</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {mockData.users.active.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                of {mockData.users.total.toLocaleString()} total
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
                <div className="text-2xl">🎯</div>
              </div>
              <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(mockData.conversion.overallConversion, 15)}`}>
                {mockData.conversion.overallConversion}%
              </div>
              <div className="text-sm text-gray-500">End-to-end conversion</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">LTV:CAC Ratio</h3>
                <div className="text-2xl">⚖️</div>
              </div>
              <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(mockData.financial.ltv_cac_ratio, 3)}`}>
                {mockData.financial.ltv_cac_ratio}:1
              </div>
              <div className="text-sm text-gray-500">Healthy: 3:1+</div>
            </div>
          </div>

          {/* Revenue Streams */}
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Stream Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockData.revenueStreams.map((stream, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(stream.amount)}</div>
                  <div className="text-sm text-green-600 font-medium">{stream.percentage}%</div>
                  <div className="text-xs text-gray-600 mt-1">{stream.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Position */}
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Market Position & Competitive Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{mockData.marketMetrics.marketShare}%</div>
                <div className="text-sm text-blue-600">Market Share</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{mockData.marketMetrics.competitorGap}</div>
                <div className="text-sm text-green-600">vs Competitors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{mockData.marketMetrics.brandAwareness}%</div>
                <div className="text-sm text-purple-600">Brand Awareness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{mockData.marketMetrics.customerSatisfaction}/5</div>
                <div className="text-sm text-orange-600">Customer Satisfaction</div>
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
                  <h3 className="text-lg font-semibold text-gray-900">💼 Executive Dashboard</h3>
                  
                  {/* Top Features by Revenue */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">🚀 Top Features by Revenue Impact</h4>
                    <div className="space-y-4">
                      {mockData.topFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{feature.name}</div>
                              <div className="text-sm text-gray-600">Usage: {feature.usage}% of users</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{feature.revenue}</div>
                            <div className="text-sm text-gray-500">monthly revenue</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Strategic Business Intelligence</h4>
                    <p className="text-gray-600">
                      Comprehensive business analytics with real-time KPI tracking and strategic decision support.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">💰 Revenue Analytics & Financial Performance</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-4">Revenue Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-green-700">Current Month</span>
                          <span className="font-semibold text-green-900">{formatCurrency(mockData.revenue.current)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Target</span>
                          <span className="font-semibold text-green-900">{formatCurrency(mockData.revenue.target)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Recurring %</span>
                          <span className="font-semibold text-green-900">{mockData.revenue.recurring}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-4">Customer Economics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-blue-700">CAC</span>
                          <span className="font-semibold text-blue-900">${mockData.financial.cac}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">CLV</span>
                          <span className="font-semibold text-blue-900">${mockData.financial.clv}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">AOV</span>
                          <span className="font-semibold text-blue-900">${mockData.conversion.averageOrderValue}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-4">Growth Indicators</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Revenue Growth</span>
                          <span className="font-semibold text-purple-900">+{mockData.revenue.growth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">User Growth</span>
                          <span className="font-semibold text-purple-900">+{mockData.users.new}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Churn Rate</span>
                          <span className="font-semibold text-purple-900">{mockData.users.churn}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Advanced Revenue Analytics</h4>
                    <p className="text-gray-600">
                      Detailed financial performance tracking with revenue attribution and forecasting models.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">👥 User Intelligence & Engagement</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{mockData.retention.day1}%</div>
                      <div className="text-sm text-blue-600">Day 1 Retention</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{mockData.retention.day7}%</div>
                      <div className="text-sm text-green-600">Day 7 Retention</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{mockData.retention.day30}%</div>
                      <div className="text-sm text-yellow-600">Day 30 Retention</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{mockData.retention.day90}%</div>
                      <div className="text-sm text-purple-600">Day 90 Retention</div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">👤</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">User Intelligence Platform</h4>
                    <p className="text-gray-600">
                      Advanced user behavior analysis, cohort studies, and engagement optimization insights.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'conversion' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">🎯 Conversion Funnel Optimization</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600">{mockData.conversion.signupToTrial}%</div>
                      <div className="text-sm text-blue-600">Signup → Trial</div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600">{mockData.conversion.trialToPaid}%</div>
                      <div className="text-sm text-green-600">Trial → Paid</div>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-600">{mockData.conversion.overallConversion}%</div>
                      <div className="text-sm text-purple-600">Overall Conversion</div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">🔄</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Conversion Optimization Suite</h4>
                    <p className="text-gray-600">
                      Advanced funnel analysis, A/B testing integration, and conversion rate optimization tools.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'forecasting' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">🔮 Predictive Analytics & Forecasting</h3>
                  
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h4 className="text-xl font-medium text-gray-900 mb-2">Advanced Predictive Modeling</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Machine learning-powered forecasting, trend analysis, and strategic planning insights for data-driven growth.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>📈 Revenue forecasting</div>
                      <div>👥 User growth prediction</div>
                      <div>🎯 Market opportunity sizing</div>
                      <div>⚡ Trend identification</div>
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
                <h3 className="text-lg font-semibold text-green-800 mb-2">Business Intelligence Implementation Roadmap</h3>
                <p className="text-green-700 mb-4">
                  Comprehensive business intelligence system will include:
                </p>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Real-time revenue tracking and financial performance monitoring</li>
                  <li>• Advanced customer analytics with lifetime value and acquisition cost analysis</li>
                  <li>• Conversion funnel optimization with A/B testing integration</li>
                  <li>• Predictive analytics for growth forecasting and trend identification</li>
                  <li>• Market intelligence and competitive analysis dashboards</li>
                  <li>• Executive KPI tracking with automated reporting and alerts</li>
                  <li>• Strategic planning tools with scenario modeling and what-if analysis</li>
                  <li>• Business intelligence API integration with third-party platforms</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
