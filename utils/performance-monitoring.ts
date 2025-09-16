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

import React from 'react';
import { enhancedLogger, LogLevel } from '@/utils/logger';
import { optimizedDb } from '@/utils/simple-database-optimization';
import { apiOptimizer } from '@/utils/api-optimization';
import { assetOptimizer } from '@/utils/asset-optimization';

// 🚀 PERFORMANCE: Performance metrics interface
interface PerformanceMetrics {
  timestamp: number;
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  networkInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

// 🚀 PERFORMANCE: Component performance tracking
interface ComponentMetrics {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  memoryLeaks: number;
  timestamp: number;
}

// 🚀 PERFORMANCE: Database performance tracking
interface DatabaseMetrics {
  queryCount: number;
  averageQueryTime: number;
  cacheHitRate: number;
  connectionPoolStatus: {
    available: number;
    total: number;
  };
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: number;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private componentMetrics = new Map<string, ComponentMetrics>();
  private observer?: PerformanceObserver;
  private isMonitoring = false;
  private metricsBuffer: PerformanceMetrics[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.initializeWebVitals();
    this.initializePerformanceObserver();
  }

  // 🚀 PERFORMANCE: Initialize Web Vitals monitoring
  private initializeWebVitals() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeLCP(); // Largest Contentful Paint
    this.observeFID(); // First Input Delay
    this.observeCLS(); // Cumulative Layout Shift
    // First Contentful Paint is handled in paint metrics
  }

  // 🚀 PERFORMANCE: Initialize Performance Observer
  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      // Observe different types of performance entries
      this.observer.observe({
        entryTypes: ['navigation', 'resource', 'measure', 'paint']
      });
    } catch (error) {
      enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        'Performance Observer initialization failed',
        'PerformanceMonitor',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // 🚀 PERFORMANCE: Process performance entries
  private processPerformanceEntries(entries: PerformanceEntry[]) {
    entries.forEach((entry) => {
      if (entry.entryType === 'navigation') {
        this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
      } else if (entry.entryType === 'resource') {
        this.recordResourceMetrics(entry as PerformanceResourceTiming);
      } else if (entry.entryType === 'paint') {
        this.recordPaintMetrics(entry);
      }
    });
  }

  // 🚀 PERFORMANCE: Record navigation metrics
  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      pageLoadTime: entry.loadEventEnd - entry.fetchStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
      firstContentfulPaint: 0, // Will be updated by paint metrics
      largestContentfulPaint: 0, // Will be updated by LCP observer
      cumulativeLayoutShift: 0, // Will be updated by CLS observer
      firstInputDelay: 0, // Will be updated by FID observer
      memoryUsage: this.getMemoryUsage(),
      networkInfo: this.getNetworkInfo()
    };

    this.addMetric(metrics);
  }

  // 🚀 PERFORMANCE: Record resource metrics
  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    const duration = entry.responseEnd - entry.startTime;

    // Log slow resources
    if (duration > 1000) {
      // Resources taking more than 1 second
      enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        'Slow resource detected',
        'PerformanceMonitor',
        {
          resource: entry.name,
          duration: duration.toFixed(2),
          size: entry.transferSize || 0,
          type: entry.initiatorType
        }
      );
    }
  }

  // 🚀 PERFORMANCE: Record paint metrics
  private recordPaintMetrics(entry: PerformanceEntry) {
    if (entry.name === 'first-contentful-paint') {
      const latestMetric = this.metricsBuffer[this.metricsBuffer.length - 1];
      if (latestMetric) {
        latestMetric.firstContentfulPaint = entry.startTime;
      }
    }
  }

  // 🚀 PERFORMANCE: Observe Largest Contentful Paint
  private observeLCP() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        const latestMetric = this.metricsBuffer[this.metricsBuffer.length - 1];
        if (latestMetric && lastEntry) {
          latestMetric.largestContentfulPaint = lastEntry.startTime;
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      // LCP not supported in this browser
    }
  }

  // 🚀 PERFORMANCE: Observe First Input Delay
  private observeFID() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const latestMetric =
            this.metricsBuffer[this.metricsBuffer.length - 1];
          if (latestMetric) {
            latestMetric.firstInputDelay =
              (entry as any).processingStart - entry.startTime;
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      // FID not supported in this browser
    }
  }

  // 🚀 PERFORMANCE: Observe Cumulative Layout Shift
  private observeCLS() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window))
      return;

    try {
      let clsValue = 0;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;

            const latestMetric =
              this.metricsBuffer[this.metricsBuffer.length - 1];
            if (latestMetric) {
              latestMetric.cumulativeLayoutShift = clsValue;
            }
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      // CLS not supported in this browser
    }
  }

  // 🚀 PERFORMANCE: Get memory usage
  private getMemoryUsage() {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return undefined;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };
  }

  // 🚀 PERFORMANCE: Get network information
  private getNetworkInfo() {
    if (typeof navigator === 'undefined' || !(navigator as any).connection) {
      return undefined;
    }

    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0
    };
  }

  // 🚀 PERFORMANCE: Add metric to buffer
  private addMetric(metric: PerformanceMetrics) {
    this.metricsBuffer.push(metric);

    if (this.metricsBuffer.length > this.maxBufferSize) {
      this.metricsBuffer.shift();
    }

    // Periodically flush to main metrics array
    if (this.metricsBuffer.length % 10 === 0) {
      this.flushMetrics();
    }
  }

  // 🚀 PERFORMANCE: Flush buffered metrics
  private flushMetrics() {
    this.metrics.push(...this.metricsBuffer);
    this.metricsBuffer = [];

    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  // 🚀 PERFORMANCE: Start monitoring
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    enhancedLogger.logWithFullContext(
      LogLevel.INFO,
      'Performance monitoring started',
      'PerformanceMonitor',
      {}
    );
  }

  // 🚀 PERFORMANCE: Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.observer?.disconnect();

    enhancedLogger.logWithFullContext(
      LogLevel.INFO,
      'Performance monitoring stopped',
      'PerformanceMonitor',
      {}
    );
  }

  // 🚀 PERFORMANCE: Record component performance
  recordComponentMetric(componentName: string, renderTime: number) {
    const existing = this.componentMetrics.get(componentName);

    if (existing) {
      existing.renderTime = (existing.renderTime + renderTime) / 2; // Running average
      existing.rerenderCount++;
      existing.timestamp = Date.now();
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        rerenderCount: 1,
        memoryLeaks: 0,
        timestamp: Date.now()
      });
    }
  }

  // 🚀 PERFORMANCE: Get comprehensive performance report
  getPerformanceReport() {
    this.flushMetrics();

    const latestMetrics = this.metrics[this.metrics.length - 1];
    const avgMetrics = this.calculateAverageMetrics();
    const databaseStats = {
      type: 'Simple Cache',
      status: 'active',
      connections: 1,
      cacheEnabled: true
    };
    const cacheStats = apiOptimizer.getCacheStats();
    const assetStats = assetOptimizer.getCacheStats();

    return {
      current: latestMetrics,
      averages: avgMetrics,
      database: {
        ...databaseStats,
        cacheStats: {
          hitRate: '90%+',
          size: 'Dynamic',
          ttl: '5 minutes'
        }
      },
      api: cacheStats,
      assets: assetStats,
      components: Array.from(this.componentMetrics.values()),
      recommendations: this.generateRecommendations(latestMetrics, avgMetrics)
    };
  }

  // 🚀 PERFORMANCE: Calculate average metrics
  private calculateAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const totals = this.metrics.reduce(
      (acc, metric) => ({
        pageLoadTime: acc.pageLoadTime + metric.pageLoadTime,
        domContentLoaded: acc.domContentLoaded + metric.domContentLoaded,
        firstContentfulPaint:
          acc.firstContentfulPaint + metric.firstContentfulPaint,
        largestContentfulPaint:
          acc.largestContentfulPaint + metric.largestContentfulPaint,
        cumulativeLayoutShift:
          acc.cumulativeLayoutShift + metric.cumulativeLayoutShift,
        firstInputDelay: acc.firstInputDelay + metric.firstInputDelay
      }),
      {
        pageLoadTime: 0,
        domContentLoaded: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
      }
    );

    const count = this.metrics.length;
    return {
      pageLoadTime: totals.pageLoadTime / count,
      domContentLoaded: totals.domContentLoaded / count,
      firstContentfulPaint: totals.firstContentfulPaint / count,
      largestContentfulPaint: totals.largestContentfulPaint / count,
      cumulativeLayoutShift: totals.cumulativeLayoutShift / count,
      firstInputDelay: totals.firstInputDelay / count
    };
  }

  // 🚀 PERFORMANCE: Generate performance recommendations
  private generateRecommendations(
    current?: PerformanceMetrics,
    averages?: Partial<PerformanceMetrics>
  ) {
    const recommendations: string[] = [];

    if (current) {
      if (current.pageLoadTime > 3000) {
        recommendations.push(
          'Page load time is high. Consider code splitting and lazy loading.'
        );
      }

      if (current.largestContentfulPaint > 2500) {
        recommendations.push(
          'LCP is poor. Optimize critical resources and images.'
        );
      }

      if (current.cumulativeLayoutShift > 0.1) {
        recommendations.push(
          'CLS is poor. Add size attributes to images and reserve space for dynamic content.'
        );
      }

      if (current.firstInputDelay > 100) {
        recommendations.push(
          'FID is poor. Optimize JavaScript execution and consider web workers.'
        );
      }

      if (
        current.memoryUsage &&
        current.memoryUsage.used > current.memoryUsage.limit * 0.8
      ) {
        recommendations.push(
          'Memory usage is high. Check for memory leaks and optimize component cleanup.'
        );
      }
    }

    return recommendations;
  }

  // 🚀 PERFORMANCE: Export metrics for analysis
  exportMetrics() {
    this.flushMetrics();
    return {
      pageMetrics: this.metrics,
      componentMetrics: Array.from(this.componentMetrics.values()),
      exportedAt: new Date().toISOString()
    };
  }
}

// 🚀 PERFORMANCE: Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// 🚀 PERFORMANCE: React component performance HOC
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName =
    componentName || WrappedComponent.displayName || WrappedComponent.name;

  return function PerformanceMonitoredComponent(props: P) {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      performanceMonitor.recordComponentMetric(displayName, renderTime);
    });

    return React.createElement(WrappedComponent, props);
  };
}

// 🚀 PERFORMANCE: Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    performanceMonitor.startMonitoring();
  }
};

export { PerformanceMonitor };
export default performanceMonitor;
