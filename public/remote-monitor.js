/*
 * 🌐 REMOTE MONITORING SCRIPT for bentlolabs.com
 *
 * Deploy this script to bentlolabs.com to send monitoring data
 * back to your Dayboard logs dashboard
 */

(function () {
  'use strict';

  // Configuration - Update these URLs to your Dayboard deployment
  const DAYBOARD_API = 'https://monitor.bentlolabs.com'; // Production monitoring subdomain
  const SITE_NAME = 'bentlolabs.com';

  class RemoteMonitor {
    constructor() {
      this.data = {
        site: SITE_NAME,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        performance: {},
        errors: [],
        interactions: [],
        network: []
      };

      this.init();
    }

    init() {
      this.setupPerformanceObserver();
      this.setupErrorTracking();
      this.setupNetworkMonitoring();
      this.setupInteractionTracking();
      this.capturePageMetrics();

      // Send initial data
      setTimeout(() => this.sendData(), 2000);

      // Send data every 30 seconds
      setInterval(() => this.sendData(), 30000);
    }

    setupPerformanceObserver() {
      if ('PerformanceObserver' in window) {
        try {
          // Core Web Vitals
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'largest-contentful-paint') {
                this.data.performance.lcp = entry.startTime;
              }
              if (entry.entryType === 'first-input') {
                this.data.performance.fid =
                  entry.processingStart - entry.startTime;
              }
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                this.data.performance.cls =
                  (this.data.performance.cls || 0) + entry.value;
              }
            }
          });

          observer.observe({
            entryTypes: [
              'largest-contentful-paint',
              'first-input',
              'layout-shift'
            ]
          });
        } catch (e) {
          console.warn('Performance Observer not supported:', e);
        }
      }
    }

    setupErrorTracking() {
      window.addEventListener('error', (event) => {
        this.data.errors.push({
          type: 'javascript-error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString(),
          stack: event.error?.stack
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.data.errors.push({
          type: 'unhandled-promise-rejection',
          message: event.reason?.message || 'Unhandled Promise Rejection',
          timestamp: new Date().toISOString(),
          stack: event.reason?.stack
        });
      });
    }

    setupNetworkMonitoring() {
      if ('PerformanceObserver' in window) {
        try {
          const networkObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'navigation') {
                this.data.performance.navigation = {
                  dns: entry.domainLookupEnd - entry.domainLookupStart,
                  tcp: entry.connectEnd - entry.connectStart,
                  request: entry.responseStart - entry.requestStart,
                  response: entry.responseEnd - entry.responseStart,
                  dom: entry.domContentLoadedEventEnd - entry.responseEnd,
                  load: entry.loadEventEnd - entry.loadEventStart
                };
              }

              if (entry.entryType === 'resource') {
                this.data.network.push({
                  name: entry.name,
                  type: entry.initiatorType,
                  size: entry.transferSize,
                  duration: entry.duration,
                  timestamp: new Date().toISOString()
                });
              }
            }
          });

          networkObserver.observe({ entryTypes: ['navigation', 'resource'] });
        } catch (e) {
          console.warn('Network monitoring not supported:', e);
        }
      }
    }

    setupInteractionTracking() {
      // Track clicks
      document.addEventListener('click', (event) => {
        this.data.interactions.push({
          type: 'click',
          target: event.target.tagName,
          id: event.target.id,
          className: event.target.className,
          timestamp: new Date().toISOString(),
          x: event.clientX,
          y: event.clientY
        });
      });

      // Track form submissions
      document.addEventListener('submit', (event) => {
        this.data.interactions.push({
          type: 'form-submit',
          target: event.target.action || 'unknown',
          timestamp: new Date().toISOString()
        });
      });
    }

    capturePageMetrics() {
      // Memory usage
      if ('memory' in performance) {
        this.data.performance.memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }

      // Connection info
      if ('connection' in navigator) {
        this.data.performance.connection = {
          type: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        };
      }

      // Basic page info
      this.data.performance.basic = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        }
      };
    }

    async sendData() {
      try {
        // Send to unified Bentlolabs monitoring (internal endpoint)
        const response = await fetch('/api/bentlolabs-monitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...this.data,
            timestamp: new Date().toISOString(),
            batchId: Math.random().toString(36).substr(2, 9)
          })
        });

        if (response.ok) {
          console.log('✅ Monitoring data sent to Dayboard');
          // Reset accumulated data
          this.data.errors = [];
          this.data.interactions = [];
          this.data.network = [];
        } else {
          console.warn('⚠️ Failed to send monitoring data:', response.status);
        }
      } catch (error) {
        console.warn('❌ Error sending monitoring data:', error);
      }
    }
  }

  // Initialize monitoring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new RemoteMonitor());
  } else {
    new RemoteMonitor();
  }
})();
