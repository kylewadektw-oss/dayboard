/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 */

/*
 * 🔍 DEVTOOLS MONITOR - Comprehensive Browser Data Collection
 * 
 * PURPOSE: Capture all available browser performance, network, and interaction data
 * similar to Chrome DevTools for comprehensive application monitoring
 * 
 * FEATURES:
 * - Performance Observer API for Core Web Vitals and timing metrics
 * - Network Timing API for detailed request analysis
 * - Resource Timing API for asset loading performance
 * - User Timing API for custom performance marks
 * - Navigation Timing API for page load metrics
 * - Memory monitoring and leak detection
 * - User interaction tracking (clicks, scrolls, forms)
 * - Security monitoring (CSP violations, CORS errors)
 * - Console message interception and analysis
 * - Error tracking with stack traces and context
 * 
 * INTEGRATION: Works with existing logger to provide complete monitoring
 */

import { logger, LogLevel } from './logger';

// Performance Metrics Interfaces
export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
  inp?: number; // Interaction to Next Paint
}

export interface NavigationMetrics {
  redirectTime?: number;
  dnsLookupTime?: number;
  tcpConnectTime?: number;
  sslTime?: number;
  responseTime?: number;
  domParseTime?: number;
  domContentLoadedTime?: number;
  loadEventTime?: number;
  totalLoadTime?: number;
}

export interface ResourceMetrics {
  url: string;
  name: string;
  initiatorType: string;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  duration: number;
  startTime: number;
  responseEnd: number;
  blocked?: number;
  dns?: number;
  connect?: number;
  send?: number;
  wait?: number;
  receive?: number;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  statusText: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  startTime: number;
  endTime: number;
  duration: number;
  size: number;
  transferSize: number;
  cached: boolean;
  failed: boolean;
  error?: string;
  redirected: boolean;
  priority?: string;
  protocol?: string;
  remoteAddress?: string;
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'keyboard' | 'form' | 'focus' | 'hover' | 'resize';
  target: string;
  timestamp: number;
  coordinates?: { x: number; y: number };
  key?: string;
  scrollPosition?: { x: number; y: number };
  elementText?: string;
  formData?: Record<string, any>;
  duration?: number;
}

export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  pressure?: string;
  trend?: 'increasing' | 'decreasing' | 'stable';
  leakSuspicion?: boolean;
}

export interface SecurityEvent {
  type: 'csp-violation' | 'cors-error' | 'mixed-content' | 'xss-attempt' | 'auth-failure';
  details: string;
  url: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
  directive?: string;
  source?: string;
}

export interface ConsoleMessage {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  line?: number;
  column?: number;
  timestamp: number;
  stack?: string;
  count?: number;
  args?: any[];
}

export interface ErrorReport {
  message: string;
  source: string;
  line: number;
  column: number;
  error: Error;
  timestamp: number;
  stack?: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  breadcrumbs?: any[];
}

// Main Monitor Class
export class DevToolsMonitor {
  private isActive = false;
  private observers: PerformanceObserver[] = [];
  private originalFetch: typeof fetch;
  private originalXHR: typeof XMLHttpRequest;
  
  // Data stores
  private coreWebVitals: CoreWebVitals = {};
  private navigationMetrics: NavigationMetrics = {};
  private resourceMetrics: ResourceMetrics[] = [];
  private networkRequests: NetworkRequest[] = [];
  private userInteractions: UserInteraction[] = [];
  private memorySnapshots: MemoryUsage[] = [];
  private securityEvents: SecurityEvent[] = [];
  private consoleMessages: ConsoleMessage[] = [];
  private errors: ErrorReport[] = [];
  
  // Performance tracking
  private performanceMarks: Map<string, number> = new Map();
  private customTimings: Map<string, number> = new Map();
  
  constructor() {
    this.originalFetch = window.fetch;
    this.originalXHR = XMLHttpRequest;
  }

  // Start comprehensive monitoring
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.setupPerformanceObservers();
    this.setupNetworkMonitoring();
    this.setupUserInteractionTracking();
    this.setupMemoryMonitoring();
    this.setupSecurityMonitoring();
    this.setupConsoleMonitoring();
    this.setupErrorTracking();
    this.setupNavigationTracking();
    
    logger.info('DevTools Monitor started - comprehensive data collection active', 'DevToolsMonitor');
  }

  // Stop monitoring
  stop(): void {
    this.isActive = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Restore original functions
    window.fetch = this.originalFetch;
    (window as any).XMLHttpRequest = this.originalXHR;
    
    logger.info('DevTools Monitor stopped', 'DevToolsMonitor');
  }

  // Performance Observers Setup
  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    // Core Web Vitals - LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.coreWebVitals.lcp = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observation not supported');
    }

    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.coreWebVitals.fid = entry.processingStart - entry.startTime;
          this.reportMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observation not supported');
    }

    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.coreWebVitals.cls = clsValue;
            this.reportMetric('CLS', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observation not supported');
    }

    // Navigation Timing
    try {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.processNavigationTiming(entry);
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    } catch (e) {
      console.warn('Navigation timing not supported');
    }

    // Resource Timing
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.processResourceTiming(entry);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      console.warn('Resource timing not supported');
    }

    // User Timing (marks and measures)
    try {
      const userTimingObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.entryType === 'mark') {
            this.performanceMarks.set(entry.name, entry.startTime);
          } else if (entry.entryType === 'measure') {
            this.customTimings.set(entry.name, entry.duration);
          }
        });
      });
      userTimingObserver.observe({ entryTypes: ['mark', 'measure'] });
      this.observers.push(userTimingObserver);
    } catch (e) {
      console.warn('User timing observation not supported');
    }

    // Paint Timing
    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.coreWebVitals.fcp = entry.startTime;
            this.reportMetric('FCP', entry.startTime);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (e) {
      console.warn('Paint timing observation not supported');
    }
  }

  // Network Monitoring Setup
  private setupNetworkMonitoring(): void {
    // Monitor fetch requests
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      const method = args[1]?.method || 'GET';
      
      try {
        const response = await this.originalFetch(...args);
        const endTime = performance.now();
        
        const networkRequest: NetworkRequest = {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          requestHeaders: this.extractRequestHeaders(args[1]),
          responseHeaders: this.extractResponseHeaders(response),
          startTime,
          endTime,
          duration: endTime - startTime,
          size: this.getResponseSize(response),
          transferSize: this.getTransferSize(response),
          cached: response.headers.get('cf-cache-status') === 'HIT' || 
                  response.headers.get('x-cache') === 'HIT',
          failed: !response.ok,
          redirected: response.redirected,
          protocol: this.extractProtocol(response.url)
        };

        this.networkRequests.push(networkRequest);
        this.reportNetworkRequest(networkRequest);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        const failedRequest: NetworkRequest = {
          url,
          method,
          status: 0,
          statusText: 'Network Error',
          requestHeaders: this.extractRequestHeaders(args[1]),
          responseHeaders: {},
          startTime,
          endTime,
          duration: endTime - startTime,
          size: 0,
          transferSize: 0,
          cached: false,
          failed: true,
          error: (error as Error).message,
          redirected: false
        };

        this.networkRequests.push(failedRequest);
        this.reportNetworkRequest(failedRequest);
        
        throw error;
      }
    };

    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string, async: boolean = true, user?: string, password?: string) {
      (this as any)._devtools = { method, url, startTime: 0 };
      return originalXHROpen.call(this, method, url, async, user, password);
    };
    
    XMLHttpRequest.prototype.send = function(body?: any) {
      const devtools = (this as any)._devtools;
      if (devtools) {
        devtools.startTime = performance.now();
        devtools.requestBody = body;
        
        this.addEventListener('loadend', () => {
          const endTime = performance.now();
          const monitor = (window as any).devToolsMonitor;
          
          const networkRequest: NetworkRequest = {
            url: devtools.url,
            method: devtools.method,
            status: this.status,
            statusText: this.statusText,
            requestHeaders: {},
            responseHeaders: this.getAllResponseHeaders() ? 
              monitor?.parseResponseHeaders(this.getAllResponseHeaders()) || {} : {},
            startTime: devtools.startTime,
            endTime,
            duration: endTime - devtools.startTime,
            size: this.responseText?.length || 0,
            transferSize: this.responseText?.length || 0,
            cached: false,
            failed: this.status >= 400,
            redirected: false
          };

          (window as any).devToolsMonitor?.networkRequests.push(networkRequest);
          (window as any).devToolsMonitor?.reportNetworkRequest(networkRequest);
        });
      }
      
      return originalXHRSend.call(this, body);
    };
  }

  // User Interaction Tracking
  private setupUserInteractionTracking(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      const interaction: UserInteraction = {
        type: 'click',
        target: this.getElementSelector(event.target as Element),
        timestamp: performance.now(),
        coordinates: { x: event.clientX, y: event.clientY },
        elementText: (event.target as Element)?.textContent?.slice(0, 50) || ''
      };
      
      this.userInteractions.push(interaction);
      this.reportUserInteraction(interaction);
    }, { passive: true });

    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const interaction: UserInteraction = {
          type: 'scroll',
          target: 'window',
          timestamp: performance.now(),
          scrollPosition: { x: window.scrollX, y: window.scrollY }
        };
        
        this.userInteractions.push(interaction);
        this.reportUserInteraction(interaction);
      }, 100);
    }, { passive: true });

    // Keyboard tracking
    document.addEventListener('keydown', (event) => {
      const interaction: UserInteraction = {
        type: 'keyboard',
        target: this.getElementSelector(event.target as Element),
        timestamp: performance.now(),
        key: event.key
      };
      
      this.userInteractions.push(interaction);
    }, { passive: true });

    // Form interactions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const data: Record<string, any> = {};
      
      // Convert FormData to object safely
      const entries = Array.from(formData.keys());
      entries.forEach(key => {
        const value = formData.get(key);
        data[key] = typeof value === 'string' ? value : '[File]';
      });
      
      const interaction: UserInteraction = {
        type: 'form',
        target: this.getElementSelector(form),
        timestamp: performance.now(),
        formData: data
      };
      
      this.userInteractions.push(interaction);
      this.reportUserInteraction(interaction);
    });

    // Focus tracking
    document.addEventListener('focusin', (event) => {
      const interaction: UserInteraction = {
        type: 'focus',
        target: this.getElementSelector(event.target as Element),
        timestamp: performance.now()
      };
      
      this.userInteractions.push(interaction);
    }, { passive: true });

    // Window resize
    window.addEventListener('resize', () => {
      const interaction: UserInteraction = {
        type: 'resize',
        target: 'window',
        timestamp: performance.now(),
        coordinates: { x: window.innerWidth, y: window.innerHeight }
      };
      
      this.userInteractions.push(interaction);
      this.reportUserInteraction(interaction);
    }, { passive: true });
  }

  // Memory Monitoring
  private setupMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    let previousMemory = 0;
    const memorySnapshots: number[] = [];
    
    setInterval(() => {
      const memory = (performance as any).memory;
      const currentMemory = memory.usedJSHeapSize;
      
      memorySnapshots.push(currentMemory);
      if (memorySnapshots.length > 10) {
        memorySnapshots.shift();
      }
      
      const trend = this.calculateMemoryTrend(memorySnapshots);
      const leakSuspicion = this.detectMemoryLeak(memorySnapshots);
      
      const memoryUsage: MemoryUsage = {
        usedJSHeapSize: currentMemory,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        pressure: this.calculateMemoryPressure(currentMemory, memory.jsHeapSizeLimit),
        trend,
        leakSuspicion
      };
      
      this.memorySnapshots.push(memoryUsage);
      
      if (leakSuspicion) {
        this.reportMemoryLeak(memoryUsage);
      }
      
      previousMemory = currentMemory;
    }, 5000);
  }

  // Security Monitoring
  private setupSecurityMonitoring(): void {
    // CSP Violation monitoring
    document.addEventListener('securitypolicyviolation', (event) => {
      const securityEvent: SecurityEvent = {
        type: 'csp-violation',
        details: `Violated directive: ${event.violatedDirective}`,
        url: event.documentURI,
        timestamp: performance.now(),
        severity: this.assessCSPSeverity(event.violatedDirective),
        blocked: event.disposition === 'enforce',
        directive: event.violatedDirective,
        source: event.sourceFile || event.blockedURI
      };
      
      this.securityEvents.push(securityEvent);
      this.reportSecurityEvent(securityEvent);
    });

    // Mixed content detection
    if ('SecurityPolicyViolationEvent' in window) {
      // Additional security monitoring can be added here
    }
  }

  // Console Monitoring
  private setupConsoleMonitoring(): void {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    const interceptConsole = (level: keyof typeof originalConsole) => {
      console[level] = (...args: any[]) => {
        const message: ConsoleMessage = {
          level: level as any,
          message: args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' '),
          source: this.getCallerSource(),
          timestamp: performance.now(),
          args: args
        };
        
        this.consoleMessages.push(message);
        
        // Call original console method
        originalConsole[level](...args);
      };
    };

    Object.keys(originalConsole).forEach(level => {
      interceptConsole(level as keyof typeof originalConsole);
    });
  }

  // Error Tracking
  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      const errorReport: ErrorReport = {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        timestamp: performance.now(),
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      this.errors.push(errorReport);
      this.reportError(errorReport);
    });

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      const errorReport: ErrorReport = {
        message: event.reason?.message || 'Unhandled Promise Rejection',
        source: 'Promise',
        line: 0,
        column: 0,
        error: event.reason,
        timestamp: performance.now(),
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      this.errors.push(errorReport);
      this.reportError(errorReport);
    });
  }

  // Navigation Tracking
  private setupNavigationTracking(): void {
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      const interaction: UserInteraction = {
        type: 'focus',
        target: 'page',
        timestamp: performance.now()
      };
      
      this.userInteractions.push(interaction);
      
      logger.info(`Page visibility changed: ${document.hidden ? 'hidden' : 'visible'}`, 'DevToolsMonitor');
    });

    // History navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      logger.info(`Navigation: pushState to ${args[2]}`, 'DevToolsMonitor');
      return result;
    };
    
    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      logger.info(`Navigation: replaceState to ${args[2]}`, 'DevToolsMonitor');
      return result;
    };
  }

  // Helper Methods
  private processNavigationTiming(entry: PerformanceNavigationTiming): void {
    this.navigationMetrics = {
      redirectTime: entry.redirectEnd - entry.redirectStart,
      dnsLookupTime: entry.domainLookupEnd - entry.domainLookupStart,
      tcpConnectTime: entry.connectEnd - entry.connectStart,
      sslTime: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      responseTime: entry.responseEnd - entry.responseStart,
      domParseTime: entry.domContentLoadedEventStart - entry.responseEnd,
      domContentLoadedTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadEventTime: entry.loadEventEnd - entry.loadEventStart,
      totalLoadTime: entry.loadEventEnd - entry.fetchStart
    };

    this.coreWebVitals.ttfb = entry.responseStart - entry.requestStart;
  }

  private processResourceTiming(entry: PerformanceResourceTiming): void {
    const resource: ResourceMetrics = {
      url: entry.name,
      name: entry.name.split('/').pop() || entry.name,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      duration: entry.duration,
      startTime: entry.startTime,
      responseEnd: entry.responseEnd,
      blocked: entry.domainLookupStart - entry.fetchStart,
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      connect: entry.connectEnd - entry.connectStart,
      send: entry.responseStart - entry.requestStart,
      wait: entry.responseStart - entry.requestStart,
      receive: entry.responseEnd - entry.responseStart
    };
    
    this.resourceMetrics.push(resource);
  }

  private getElementSelector(element: Element): string {
    if (!element) return 'unknown';
    
    let selector = element.tagName.toLowerCase();
    
    if (element.id) {
      selector += `#${element.id}`;
    } else if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(Boolean);
      if (classes.length > 0) {
        selector += `.${classes[0]}`;
      }
    }
    
    return selector;
  }

  private calculateMemoryTrend(snapshots: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (snapshots.length < 3) return 'stable';
    
    const recent = snapshots.slice(-3);
    const increasing = recent.every((val, i) => i === 0 || val >= recent[i - 1]);
    const decreasing = recent.every((val, i) => i === 0 || val <= recent[i - 1]);
    
    if (increasing) return 'increasing';
    if (decreasing) return 'decreasing';
    return 'stable';
  }

  private detectMemoryLeak(snapshots: number[]): boolean {
    if (snapshots.length < 5) return false;
    
    const trend = this.calculateMemoryTrend(snapshots);
    const latestValue = snapshots[snapshots.length - 1];
    const firstValue = snapshots[0];
    const growthRate = (latestValue - firstValue) / firstValue;
    
    return trend === 'increasing' && growthRate > 0.5; // 50% growth indicates potential leak
  }

  private calculateMemoryPressure(used: number, limit: number): string {
    const percentage = (used / limit) * 100;
    
    if (percentage > 90) return 'critical';
    if (percentage > 75) return 'high';
    if (percentage > 50) return 'medium';
    return 'low';
  }

  private assessCSPSeverity(directive: string): 'low' | 'medium' | 'high' | 'critical' {
    if (directive.includes('script-src')) return 'critical';
    if (directive.includes('object-src') || directive.includes('frame-src')) return 'high';
    if (directive.includes('img-src') || directive.includes('style-src')) return 'medium';
    return 'low';
  }

  private extractRequestHeaders(options?: RequestInit): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }
    
    return headers;
  }

  private extractResponseHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    return headers;
  }

  private getResponseSize(response: Response): number {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  private getTransferSize(response: Response): number {
    // Approximate transfer size including headers
    const contentLength = this.getResponseSize(response);
    const headerSize = JSON.stringify(this.extractResponseHeaders(response)).length;
    return contentLength + headerSize;
  }

  private extractProtocol(url: string): string {
    try {
      return new URL(url).protocol;
    } catch {
      return 'unknown';
    }
  }

  private getCallerSource(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    
    const lines = stack.split('\n');
    const callerLine = lines[3]; // Skip Error, getCallerSource, and interceptConsole
    
    const match = callerLine?.match(/at (.+) \((.+):(\d+):(\d+)\)/);
    return match ? `${match[1]} (${match[2]}:${match[3]})` : 'unknown';
  }

  public parseResponseHeaders(headerString: string): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (!headerString) return headers;
    
    const lines = headerString.split('\r\n');
    lines.forEach(line => {
      const parts = line.split(': ');
      if (parts.length === 2) {
        headers[parts[0].toLowerCase()] = parts[1];
      }
    });
    
    return headers;
  }

  // Reporting Methods
  private reportMetric(name: string, value: number): void {
    logger.info(`Performance Metric - ${name}: ${Math.round(value)}ms`, 'DevToolsMonitor', {
      metric: name,
      value: Math.round(value),
      timestamp: performance.now()
    });
  }

  private reportNetworkRequest(request: NetworkRequest): void {
    const level = request.failed ? LogLevel.WARN : LogLevel.INFO;
    const status = request.failed ? 'FAILED' : 'SUCCESS';
    
    logger.logFromComponent(
      level,
      `Network ${status}: ${request.method} ${request.url} (${request.status}) - ${Math.round(request.duration)}ms`,
      'NetworkMonitor',
      {
        url: request.url,
        method: request.method,
        status: request.status,
        duration: Math.round(request.duration),
        size: request.size,
        cached: request.cached,
        failed: request.failed
      }
    );
  }

  private reportUserInteraction(interaction: UserInteraction): void {
    logger.info(`User Interaction: ${interaction.type} on ${interaction.target}`, 'InteractionTracker', {
      type: interaction.type,
      target: interaction.target,
      timestamp: interaction.timestamp,
      coordinates: interaction.coordinates,
      key: interaction.key
    });
  }

  private reportMemoryLeak(memory: MemoryUsage): void {
    logger.warn(`Potential Memory Leak Detected - Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`, 'MemoryMonitor', {
      usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      pressure: memory.pressure,
      trend: memory.trend
    });
  }

  private reportSecurityEvent(event: SecurityEvent): void {
    const level = event.severity === 'critical' || event.severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;
    
    logger.logFromComponent(
      level,
      `Security Event: ${event.type} - ${event.details}`,
      'SecurityMonitor',
      {
        type: event.type,
        severity: event.severity,
        blocked: event.blocked,
        directive: event.directive,
        source: event.source,
        url: event.url
      }
    );
  }

  private reportError(error: ErrorReport): void {
    logger.error(`JavaScript Error: ${error.message}`, 'ErrorTracker', {
      source: error.source,
      line: error.line,
      column: error.column,
      stack: error.stack,
      url: error.url,
      timestamp: error.timestamp
    });
  }

  // Public API Methods
  public getFullReport(): any {
    return {
      timestamp: new Date().toISOString(),
      performance: {
        coreWebVitals: this.coreWebVitals,
        navigation: this.navigationMetrics,
        customTimings: Object.fromEntries(this.customTimings),
        marks: Object.fromEntries(this.performanceMarks)
      },
      network: {
        requests: this.networkRequests.slice(-50), // Last 50 requests
        totalRequests: this.networkRequests.length,
        failedRequests: this.networkRequests.filter(r => r.failed).length,
        averageResponseTime: this.calculateAverageResponseTime()
      },
      resources: {
        total: this.resourceMetrics.length,
        totalSize: this.resourceMetrics.reduce((sum, r) => sum + r.transferSize, 0),
        largest: this.resourceMetrics.reduce((max, r) => r.transferSize > max.transferSize ? r : max, this.resourceMetrics[0])
      },
      interactions: {
        total: this.userInteractions.length,
        byType: this.groupInteractionsByType(),
        recent: this.userInteractions.slice(-20) // Last 20 interactions
      },
      memory: {
        current: this.memorySnapshots[this.memorySnapshots.length - 1],
        history: this.memorySnapshots.slice(-10) // Last 10 snapshots
      },
      security: {
        events: this.securityEvents,
        critical: this.securityEvents.filter(e => e.severity === 'critical').length,
        total: this.securityEvents.length
      },
      console: {
        messages: this.consoleMessages.slice(-100), // Last 100 messages
        errorCount: this.consoleMessages.filter(m => m.level === 'error').length,
        warningCount: this.consoleMessages.filter(m => m.level === 'warn').length
      },
      errors: {
        total: this.errors.length,
        recent: this.errors.slice(-10) // Last 10 errors
      }
    };
  }

  private calculateAverageResponseTime(): number {
    if (this.networkRequests.length === 0) return 0;
    
    const total = this.networkRequests.reduce((sum, req) => sum + req.duration, 0);
    return Math.round(total / this.networkRequests.length);
  }

  private groupInteractionsByType(): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    this.userInteractions.forEach(interaction => {
      grouped[interaction.type] = (grouped[interaction.type] || 0) + 1;
    });
    
    return grouped;
  }

  // Performance marking API
  public mark(name: string): void {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
    this.performanceMarks.set(name, performance.now());
  }

  public measure(name: string, startMark?: string, endMark?: string): number | undefined {
    if ('performance' in window && performance.measure) {
      try {
        if (startMark && endMark) {
          performance.measure(name, startMark, endMark);
        } else if (startMark) {
          performance.measure(name, startMark);
        } else {
          performance.measure(name);
        }
        
        const measures = performance.getEntriesByName(name, 'measure');
        const measure = measures[measures.length - 1];
        if (measure) {
          this.customTimings.set(name, measure.duration);
          return measure.duration;
        }
      } catch (e) {
        console.warn('Performance measure failed:', e);
      }
    }
    
    return undefined;
  }

  public clearMetrics(): void {
    this.resourceMetrics = [];
    this.networkRequests = [];
    this.userInteractions = [];
    this.memorySnapshots = [];
    this.securityEvents = [];
    this.consoleMessages = [];
    this.errors = [];
    this.performanceMarks.clear();
    this.customTimings.clear();
  }
}

// Global instance
export const devToolsMonitor = new DevToolsMonitor();

// Auto-start if in browser
if (typeof window !== 'undefined') {
  // Make globally accessible for debugging
  (window as any).devToolsMonitor = devToolsMonitor;
  
  // Auto-start monitoring
  devToolsMonitor.start();
  
  logger.info('DevTools Monitor initialized and started', 'DevToolsMonitor');
}

// Performance timing utilities
export const performanceUtils = {
  // Mark the start of an operation
  markStart: (name: string) => devToolsMonitor.mark(`${name}-start`),
  
  // Mark the end and measure duration
  markEnd: (name: string) => {
    devToolsMonitor.mark(`${name}-end`);
    return devToolsMonitor.measure(name, `${name}-start`, `${name}-end`);
  },
  
  // Measure time between two marks
  measure: (name: string, startMark: string, endMark: string) => 
    devToolsMonitor.measure(name, startMark, endMark),
  
  // Get current Core Web Vitals
  getCoreWebVitals: () => devToolsMonitor.getFullReport().performance.coreWebVitals,
  
  // Get network performance summary
  getNetworkSummary: () => devToolsMonitor.getFullReport().network,
  
  // Get memory usage
  getMemoryUsage: () => devToolsMonitor.getFullReport().memory.current
};