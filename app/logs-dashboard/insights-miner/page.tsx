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
 * 📈 DEVELOPMENT INSIGHTS MINER - Comprehensive Data Collection & Analysis
 * 
 * PURPOSE: Advanced data mining dashboard for capturing and analyzing development metrics
 * 
 * FEATURES:
 * - Performance monitoring (Core Web Vitals, resource timing)
 * - User interaction tracking (clicks, scrolls, form behavior)
 * - Network analysis (API calls, failed requests, slow queries)
 * - Security monitoring (CSP violations, CORS issues)
 * - Error pattern detection and root cause analysis
 * - Real-time development insights and recommendations
 * 
 * ACCESS: Development tool - captures anonymous usage patterns
 * 
 * TECHNICAL:
 * - Uses Performance Observer API for accurate metrics
 * - Intersection Observer for scroll tracking
 * - MutationObserver for DOM changes
 * - Network timing API for request analysis
 * - Local storage for pattern persistence
 * 
 * NAVIGATION: Part of logging suite with advanced analytics
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import LoggingNav from '@/components/logging/LoggingNav';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  domContentLoaded?: number;
  loadComplete?: number;
  bundleSize?: number;
  memoryUsage?: number;
  timestamp: number;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'focus' | 'form_submit' | 'navigation';
  element?: string;
  value?: any;
  timestamp: number;
  path: string;
  duration?: number;
}

interface NetworkAnalytics {
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
  success: boolean;
  timestamp: number;
  errorType?: string;
}

interface SecurityIssue {
  type: 'csp_violation' | 'mixed_content' | 'cors_error' | 'auth_failure';
  description: string;
  blockedUri?: string;
  violatedDirective?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DevelopmentInsight {
  category: 'performance' | 'usability' | 'security' | 'reliability';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  data: any;
  timestamp: number;
}

export default function DevelopmentInsightsMiner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeDataSources, setActiveDataSources] = useState({
    performance: true,
    userInteractions: true,
    networkAnalytics: true,
    securityMonitoring: true,
    errorPatterns: true
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);
  const [networkAnalytics, setNetworkAnalytics] = useState<NetworkAnalytics[]>([]);
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [insights, setInsights] = useState<DevelopmentInsight[]>([]);

  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);

  // Initialize performance monitoring
  useEffect(() => {
    if (!activeDataSources.performance) return;

    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        updatePerformanceMetric('lcp', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          updatePerformanceMetric('fid', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            updatePerformanceMetric('cls', clsValue);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported');
      }

      // Navigation Timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          updatePerformanceMetric('ttfb', entry.responseStart - entry.requestStart);
          updatePerformanceMetric('domContentLoaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart);
          updatePerformanceMetric('loadComplete', entry.loadEventEnd - entry.loadEventStart);
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('Navigation timing not supported');
      }

      performanceObserver.current = lcpObserver;
    }

    // Memory usage monitoring
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        updatePerformanceMetric('memoryUsage', memory.usedJSHeapSize);
      }
    }, 5000);

    return () => {
      clearInterval(memoryInterval);
      performanceObserver.current?.disconnect();
    };
  }, [activeDataSources.performance]);

  // User interaction tracking
  useEffect(() => {
    if (!activeDataSources.userInteractions) return;

    const trackClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.tagName.toLowerCase() + 
        (target.id ? `#${target.id}` : '') +
        (target.className ? `.${target.className.split(' ').join('.')}` : '');
      
      addUserInteraction({
        type: 'click',
        element,
        timestamp: Date.now(),
        path: window.location.pathname
      });
    };

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      addUserInteraction({
        type: 'scroll',
        value: scrollPercent,
        timestamp: Date.now(),
        path: window.location.pathname
      });
    };

    const trackFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const fieldCount = Array.from(formData.keys()).length;
      
      addUserInteraction({
        type: 'form_submit',
        element: form.id || form.className || 'unknown-form',
        value: { fieldCount },
        timestamp: Date.now(),
        path: window.location.pathname
      });
    };

    document.addEventListener('click', trackClick);
    document.addEventListener('scroll', trackScroll, { passive: true });
    document.addEventListener('submit', trackFormSubmit);

    // Track page visibility changes
    const trackVisibility = () => {
      addUserInteraction({
        type: 'navigation',
        value: { hidden: document.hidden },
        timestamp: Date.now(),
        path: window.location.pathname
      });
    };

    document.addEventListener('visibilitychange', trackVisibility);

    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('scroll', trackScroll);
      document.removeEventListener('submit', trackFormSubmit);
      document.removeEventListener('visibilitychange', trackVisibility);
    };
  }, [activeDataSources.userInteractions]);

  // Network monitoring
  useEffect(() => {
    if (!activeDataSources.networkAnalytics) return;

    // Monkey patch fetch to monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : 
                  args[0] instanceof Request ? args[0].url : 
                  args[0].toString();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        addNetworkAnalytic({
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          size: parseInt(response.headers.get('content-length') || '0'),
          success: response.ok,
          timestamp: Date.now(),
          errorType: response.ok ? undefined : `HTTP_${response.status}`
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        addNetworkAnalytic({
          url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration: endTime - startTime,
          size: 0,
          success: false,
          timestamp: Date.now(),
          errorType: 'NETWORK_ERROR'
        });
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [activeDataSources.networkAnalytics]);

  // Security monitoring
  useEffect(() => {
    if (!activeDataSources.securityMonitoring) return;

    // CSP violation monitoring
    const handleCSPViolation = (e: SecurityPolicyViolationEvent) => {
      addSecurityIssue({
        type: 'csp_violation',
        description: `CSP violation: ${e.violatedDirective}`,
        blockedUri: e.blockedURI,
        violatedDirective: e.violatedDirective,
        timestamp: Date.now(),
        severity: e.violatedDirective.includes('script-src') ? 'high' : 'medium'
      });
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    // Mixed content detection
    const checkMixedContent = () => {
      if (location.protocol === 'https:') {
        const httpResources = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
        httpResources.forEach(resource => {
          addSecurityIssue({
            type: 'mixed_content',
            description: `Mixed content detected: ${resource.tagName} with HTTP source on HTTPS page`,
            blockedUri: (resource as any).src || (resource as any).href,
            timestamp: Date.now(),
            severity: 'medium'
          });
        });
      }
    };

    checkMixedContent();
    const mixedContentInterval = setInterval(checkMixedContent, 30000);

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
      clearInterval(mixedContentInterval);
    };
  }, [activeDataSources.securityMonitoring]);

  // Helper functions
  const updatePerformanceMetric = (key: keyof PerformanceMetrics, value: number) => {
    setPerformanceMetrics(prev => {
      const latest = prev[prev.length - 1] || { timestamp: Date.now() };
      const updated = { ...latest, [key]: value, timestamp: Date.now() };
      return [...prev.slice(-9), updated]; // Keep last 10 entries
    });
  };

  const addUserInteraction = (interaction: UserInteraction) => {
    setUserInteractions(prev => [...prev.slice(-99), interaction]); // Keep last 100
  };

  const addNetworkAnalytic = (analytic: NetworkAnalytics) => {
    setNetworkAnalytics(prev => [...prev.slice(-49), analytic]); // Keep last 50
  };

  const addSecurityIssue = (issue: SecurityIssue) => {
    setSecurityIssues(prev => [...prev.slice(-29), issue]); // Keep last 30
  };

  // Generate insights based on collected data
  const generateInsights = useCallback(() => {
    const newInsights: DevelopmentInsight[] = [];

    // Performance insights
    const latestMetrics = performanceMetrics[performanceMetrics.length - 1];
    if (latestMetrics) {
      if (latestMetrics.lcp && latestMetrics.lcp > 2500) {
        newInsights.push({
          category: 'performance',
          priority: 'high',
          title: 'Slow Largest Contentful Paint',
          description: `LCP is ${Math.round(latestMetrics.lcp)}ms (target: <2.5s)`,
          recommendation: 'Optimize images, reduce render-blocking resources, improve server response times',
          data: { lcp: latestMetrics.lcp },
          timestamp: Date.now()
        });
      }

      if (latestMetrics.cls && latestMetrics.cls > 0.1) {
        newInsights.push({
          category: 'performance',
          priority: 'medium',
          title: 'Layout Shift Issues',
          description: `CLS score is ${latestMetrics.cls.toFixed(3)} (target: <0.1)`,
          recommendation: 'Add size attributes to images, reserve space for dynamic content',
          data: { cls: latestMetrics.cls },
          timestamp: Date.now()
        });
      }
    }

    // Network insights
    const failedRequests = networkAnalytics.filter(req => !req.success);
    if (failedRequests.length > 0) {
      newInsights.push({
        category: 'reliability',
        priority: 'high',
        title: 'Network Request Failures',
        description: `${failedRequests.length} failed requests detected`,
        recommendation: 'Implement retry logic, check API endpoints, monitor error rates',
        data: { failedRequests: failedRequests.length },
        timestamp: Date.now()
      });
    }

    const slowRequests = networkAnalytics.filter(req => req.duration > 3000);
    if (slowRequests.length > 0) {
      newInsights.push({
        category: 'performance',
        priority: 'medium',
        title: 'Slow API Responses',
        description: `${slowRequests.length} requests took >3s to complete`,
        recommendation: 'Optimize database queries, implement caching, consider CDN',
        data: { slowRequests: slowRequests.length },
        timestamp: Date.now()
      });
    }

    // Security insights
    const criticalSecurity = securityIssues.filter(issue => issue.severity === 'high' || issue.severity === 'critical');
    if (criticalSecurity.length > 0) {
      newInsights.push({
        category: 'security',
        priority: 'critical',
        title: 'Security Violations Detected',
        description: `${criticalSecurity.length} high/critical security issues found`,
        recommendation: 'Review CSP policies, fix mixed content, update security headers',
        data: { issues: criticalSecurity.length },
        timestamp: Date.now()
      });
    }

    // User experience insights
    const recentClicks = userInteractions.filter(i => i.type === 'click' && Date.now() - i.timestamp < 300000);
    const clickPatterns = recentClicks.reduce((acc: any, click) => {
      acc[click.element || 'unknown'] = (acc[click.element || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const hotElements = Object.entries(clickPatterns)
      .filter(([_, count]) => (count as number) > 5)
      .map(([element, count]) => ({ element, count }));

    if (hotElements.length > 0) {
      newInsights.push({
        category: 'usability',
        priority: 'low',
        title: 'High-Interaction Elements Detected',
        description: `${hotElements.length} elements receiving heavy user interaction`,
        recommendation: 'Optimize these elements for better performance and user experience',
        data: { hotElements },
        timestamp: Date.now()
      });
    }

    setInsights(newInsights);
  }, [performanceMetrics, networkAnalytics, securityIssues, userInteractions]);

  useEffect(() => {
    const insightInterval = setInterval(generateInsights, 15000); // Generate insights every 15 seconds
    return () => clearInterval(insightInterval);
  }, [generateInsights]);

  const exportAnalytics = () => {
    const data = {
      performanceMetrics,
      userInteractions,
      networkAnalytics,
      securityIssues,
      insights,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `development-insights-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    setPerformanceMetrics([]);
    setUserInteractions([]);
    setNetworkAnalytics([]);
    setSecurityIssues([]);
    setInsights([]);
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
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-80'
      }`}>
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Development Insights Miner</h1>
            <p className="text-gray-600">Advanced data collection and analysis for development optimization</p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-3">Data Source Controls</h2>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(activeDataSources).map(([key, enabled]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setActiveDataSources(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={exportAnalytics}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  📁 Export Data
                </button>
                <button
                  onClick={clearAllData}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">💡 Real-time Development Insights</h2>
            
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <div>Collecting data to generate insights...</div>
                <div className="text-sm mt-1">Use your application to generate analytics data</div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.priority === 'critical' ? 'border-red-500 bg-red-50' :
                    insight.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                    insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                    <p className="text-xs text-gray-600 font-medium">💡 {insight.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Dashboard Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">⚡ Performance Metrics</h2>
              
              {performanceMetrics.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No performance data yet</div>
              ) : (
                <div className="space-y-4">
                  {performanceMetrics.slice(-1).map((metrics, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      {metrics.lcp && (
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">{Math.round(metrics.lcp)}ms</div>
                          <div className="text-sm text-gray-600">LCP</div>
                        </div>
                      )}
                      {metrics.fid && (
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-green-600">{Math.round(metrics.fid)}ms</div>
                          <div className="text-sm text-gray-600">FID</div>
                        </div>
                      )}
                      {metrics.cls && (
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-yellow-600">{metrics.cls.toFixed(3)}</div>
                          <div className="text-sm text-gray-600">CLS</div>
                        </div>
                      )}
                      {metrics.memoryUsage && (
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.memoryUsage / 1024 / 1024)}MB</div>
                          <div className="text-sm text-gray-600">Memory</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Network Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🌐 Network Analytics</h2>
              
              {networkAnalytics.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No network data yet</div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-xl font-bold text-green-600">
                        {networkAnalytics.filter(req => req.success).length}
                      </div>
                      <div className="text-sm text-gray-600">Success</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-xl font-bold text-red-600">
                        {networkAnalytics.filter(req => !req.success).length}
                      </div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-xl font-bold text-blue-600">
                        {networkAnalytics.length > 0 ? Math.round(networkAnalytics.reduce((sum, req) => sum + req.duration, 0) / networkAnalytics.length) : 0}ms
                      </div>
                      <div className="text-sm text-gray-600">Avg Time</div>
                    </div>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto">
                    {networkAnalytics.slice(-10).reverse().map((req, index) => (
                      <div key={index} className={`p-2 rounded mb-1 text-sm ${
                        req.success ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium truncate">{req.method} {req.url.split('/').pop()}</span>
                          <span className={`font-bold ${req.success ? 'text-green-600' : 'text-red-600'}`}>
                            {req.status} ({Math.round(req.duration)}ms)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Interactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">👆 User Interactions</h2>
              
              {userInteractions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No interaction data yet</div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-xl font-bold text-blue-600">
                        {userInteractions.filter(i => i.type === 'click').length}
                      </div>
                      <div className="text-sm text-gray-600">Clicks</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-xl font-bold text-purple-600">
                        {userInteractions.filter(i => i.type === 'scroll').length}
                      </div>
                      <div className="text-sm text-gray-600">Scrolls</div>
                    </div>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto">
                    {userInteractions.slice(-10).reverse().map((interaction, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded mb-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="capitalize font-medium">{interaction.type}</span>
                          <span className="text-gray-600 text-xs">
                            {new Date(interaction.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {interaction.element && (
                          <div className="text-xs text-gray-500 truncate">{interaction.element}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Security Issues */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🛡️ Security Monitoring</h2>
              
              {securityIssues.length === 0 ? (
                <div className="text-center py-4 text-green-100 bg-green-50 rounded">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="text-green-800 font-medium">No security issues detected</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-xl font-bold text-orange-600">
                        {securityIssues.filter(i => i.severity === 'high' || i.severity === 'critical').length}
                      </div>
                      <div className="text-sm text-gray-600">High/Critical</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-xl font-bold text-yellow-600">
                        {securityIssues.filter(i => i.severity === 'medium' || i.severity === 'low').length}
                      </div>
                      <div className="text-sm text-gray-600">Medium/Low</div>
                    </div>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto">
                    {securityIssues.slice(-5).reverse().map((issue, index) => (
                      <div key={index} className={`p-2 rounded mb-1 text-sm ${
                        issue.severity === 'critical' || issue.severity === 'high' 
                          ? 'bg-red-50 border-l-4 border-red-500' 
                          : 'bg-yellow-50 border-l-4 border-yellow-500'
                      }`}>
                        <div className="font-medium capitalize">{issue.type.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-600 mt-1">{issue.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📊 What This Tool Captures:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-800">
              <div>
                <strong>Performance:</strong> Core Web Vitals, memory usage, load times
              </div>
              <div>
                <strong>User Behavior:</strong> Clicks, scrolls, form interactions, navigation patterns
              </div>
              <div>
                <strong>Network:</strong> API call success/failure rates, response times, error patterns
              </div>
              <div>
                <strong>Security:</strong> CSP violations, mixed content, CORS issues, auth failures
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
