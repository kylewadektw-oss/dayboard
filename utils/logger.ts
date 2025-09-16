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
 * 📝 CENTRALIZED LOGGING UTILITY - Advanced Application Monitoring
 *
 * PURPOSE: Comprehensive logging system with real-time capture, enhanced user experience,
 * and intelligent diagnostic data collection for the Dayboard application
 *
 * FEATURES:
 * - Real-time console interception with circular reference protection
 * - Enhanced user identification and context tracking
 * - Layman's terms explanations for non-technical users
 * - Comprehensive device, performance, and context information
 * - Automatic severity and impact assessment
 * - Database persistence with intelligent caching
 * - OAuth and Auth-specific logging helpers
 * - Async logging with non-blocking performance
 * - Smart message categorization and source detection
 *
 * USAGE:
 * ```typescript
 * import { logger, oauthLogger, authLogger } from '@/utils/logger';
 *
 * // Basic logging
 * await logger.error('Database connection failed', 'DatabaseComponent', { errorCode: 'DB_001' });
 * await logger.warn('API response slow', 'APIClient', { responseTime: 2500 });
 * await logger.info('User action completed', 'UserInterface', { action: 'profile_update' });
 *
 * // Specialized logging
 * await oauthLogger.error('OAuth token expired', { provider: 'google' });
 * await authLogger.info('User signed in successfully', { userId: 'user123' });
 *
 * // Configure dashboard filtering
 * logger.setDashboardFilteringEnabled(false); // Disable filtering if needed
 * console.log(logger.isDashboardFilteringEnabled()); // Check current state
 * ```
 *
 * ENHANCED FEATURES:
 * - User Information: Automatic user ID, email, role, and display name collection
 * - Device Detection: Browser, OS, screen size, mobile/desktop identification
 * - Performance Metrics: Memory usage, load times, network speed monitoring
 * - Context Tracking: Current feature, user journey, referrer information
 * - Layman Explanations: Technical messages translated to user-friendly language
 * - Severity Assessment: Automatic priority classification (Critical, High, Medium, Low)
 * - Impact Analysis: Business impact assessment for each log entry
 * - Suggested Actions: Contextual recommendations for error resolution
 * - Dashboard Filtering: Automatic filtering of dashboard refresh alerts to reduce DB load
 *
 * TECHNICAL:
 * - Circular Reference Protection: Safe object serialization
 * - Console Interception: Automatic capture of all console methods
 * - Database Integration: Supabase persistence with intelligent caching
 * - Memory Management: Automatic log rotation and cleanup
 * - Performance Optimization: Throttled database writes and efficient filtering
 * - Error Handling: Graceful fallbacks and error recovery
 *
 * ACCESSIBILITY: Used throughout the application for monitoring and debugging
 */

// Centralized logging utility for the Dayboard app
// Usage: import { logger } from '@/utils/logger';

import { createClient } from '@/utils/supabase/client';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  id?: string;
  userId?: string;
  sessionId: string;
  level: LogLevel;
  message: string;
  component?: string;
  data?: unknown;
  stack?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  side?: 'client' | 'server'; // New field to distinguish client vs server logs
  // Enhanced fields for better debugging and user experience
  userInfo?: {
    id?: string;
    email?: string;
    role?: string;
    displayName?: string;
  };
  laymanExplanation?: string; // Non-technical explanation
  severity?: 'critical' | 'high' | 'medium' | 'low';
  impact?: string; // What this affects for the user
  suggestedAction?: string; // What should be done
  deviceInfo?: {
    platform?: string;
    browser?: string;
    version?: string;
    mobile?: boolean;
    screenSize?: string;
  };
  performanceInfo?: {
    memoryUsage?: number;
    loadTime?: number;
    networkSpeed?: string;
  };
  contextInfo?: {
    referrer?: string;
    previousAction?: string;
    feature?: string;
    userJourney?: string;
    // Enhanced URL and routing context
    fullUrl?: string;
    pathname?: string;
    search?: string;
    hash?: string;
    origin?: string;
    // Browser context
    viewportSize?: string;
    scrollPosition?: string;
    documentTitle?: string;
    // Session context
    sessionDuration?: number;
    pageLoadTime?: number;
    timeOnPage?: number;
    // User interaction context
    lastClickTarget?: string;
    formFieldsInteracted?: string;
    buttonsClicked?: string;
  };
  // New enhanced fields
  networkInfo?: {
    online?: boolean;
    connectionType?: string;
    downlink?: number | null;
    rtt?: number | null;
    saveData?: boolean;
    userAgent?: string;
    language?: string;
    languages?: string[];
    cookieEnabled?: boolean;
    doNotTrack?: string | null;
  };
  browserCapabilities?: {
    localStorage?: boolean;
    sessionStorage?: boolean;
    indexedDB?: boolean;
    geolocation?: boolean;
    webWorkers?: boolean;
    serviceWorkers?: boolean;
    pushNotifications?: boolean;
    notifications?: boolean;
    pixelRatio?: number;
    colorDepth?: number | null;
    screenResolution?: string;
    availableResolution?: string;
    webGL?: boolean;
    webGL2?: boolean;
    webAssembly?: boolean;
    secureContext?: boolean;
    crossOriginIsolated?: boolean;
  };
  errorContext?: {
    name?: string;
    message?: string;
    stack?: string;
    stackLines?: string[];
    sourceFile?: string;
    lineNumber?: number;
    columnNumber?: number;
    category?: string;
    commonCause?: string;
  };
  clientMetrics?: {
    domContentLoaded?: number;
    pageLoadComplete?: number;
    firstPaint?: number;
    resources?: number;
    navigationType?: string;
    usedMemory?: number | null;
    totalMemory?: number | null;
    memoryLimit?: number | null;
  };
  engagementMetrics?: {
    timeSpentOnSite?: number;
    pageViews?: number;
    interactionEvents?: number;
    clickDepth?: number;
    scrollDepth?: number;
    bounceRate?: number;
  };
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private originalConsole: any = {};
  private isIntercepting = false;
  private sessionId: string;
  private supabase = createClient();

  // Configuration - Complete prevention of dashboard refresh alerts (not filterable)
  private filterDashboardRefreshAlerts: boolean = true; // Always enabled for complete prevention

  // Performance optimizations
  private dbLogsCache: LogEntry[] = [];
  private lastDbFetch: number = 0;
  private cacheTimeout: number = 30000; // 30 seconds cache
  private isDbLoading: boolean = false;
  private dbLoadPromise: Promise<LogEntry[]> | null = null;

  // Database logging throttling to prevent spam (32 logs/min)
  private databaseLogThrottle: Map<string, number> = new Map();
  private databaseLogThrottleWindow: number = 10000; // 10 seconds
  private maxDatabaseLogsPerWindow: number = 3; // Max 3 logs per 10 seconds per unique message

  // API-Client logging throttling to prevent spam during login (7 logs/min)
  private apiClientLogThrottle: Map<string, number> = new Map();
  private apiClientLogThrottleWindow: number = 15000; // 15 seconds
  private maxApiClientLogsPerWindow: number = 2; // Max 2 logs per 15 seconds per unique message

  // Localhost testing isolation
  private isLocalhost: boolean =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');
  private enableLocalhostIsolation: boolean = true; // Can be configured

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupConsoleInterception();

    // Initialize global error capture on the client side
    if (typeof window !== 'undefined') {
      this.initializeGlobalErrorCapture();
      this.initializeInteractionTracking();
      this.initializePageTracking();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    return this.sessionId;
  }

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const {
        data: { user }
      } = await this.supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  // Enhanced user information collection
  private async getCurrentUserInfo(): Promise<any> {
    try {
      const {
        data: { user }
      } = await this.supabase.auth.getUser();
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || user.app_metadata?.role || 'user',
        displayName:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Anonymous'
      };
    } catch {
      return null;
    }
  }

  // Collect device and browser information
  private getDeviceInfo(): any {
    if (typeof window === 'undefined') return null;

    const ua = window.navigator.userAgent;
    const platform = window.navigator.platform;

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome'))
      browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';

    // Detect mobile
    const mobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // Get screen size
    const screenSize = `${window.screen.width}x${window.screen.height}`;

    return {
      platform,
      browser,
      version: this.getBrowserVersion(ua),
      mobile,
      screenSize
    };
  }

  private getBrowserVersion(ua: string, browserName?: string): string {
    const regex =
      browserName === 'Chrome'
        ? /Chrome\/(\d+)/
        : browserName === 'Firefox'
          ? /Firefox\/(\d+)/
          : browserName === 'Safari'
            ? /Version\/(\d+)/
            : browserName === 'Edg'
              ? /Edg\/(\d+)/
              : null;

    const match = regex ? ua.match(regex) : null;
    return match ? match[1] : 'Unknown';
  }

  // Collect performance information
  private getPerformanceInfo(): any {
    if (typeof window === 'undefined' || !window.performance) return null;

    const memory = (performance as any).memory;
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    return {
      memoryUsage: memory
        ? Math.round(memory.usedJSHeapSize / 1024 / 1024)
        : null, // MB
      loadTime: navigation
        ? Math.round(navigation.loadEventEnd - navigation.fetchStart)
        : null, // ms
      networkSpeed: this.getNetworkSpeed()
    };
  }

  private getNetworkSpeed(): string {
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  // Collect context information
  private getContextInfo(): any {
    if (typeof window === 'undefined') return null;

    return {
      referrer: document.referrer || 'direct',
      previousAction: sessionStorage.getItem('lastAction') || 'unknown',
      feature: this.detectCurrentFeature(),
      userJourney: this.detectUserJourney(),
      // Enhanced URL and routing context
      fullUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin,
      // Browser context
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      scrollPosition: `${window.scrollX},${window.scrollY}`,
      documentTitle: document.title,
      // Session context
      sessionDuration: this.getSessionDuration(),
      pageLoadTime: this.getPageLoadTime(),
      timeOnPage: this.getTimeOnCurrentPage(),
      // User interaction context
      lastClickTarget: sessionStorage.getItem('lastClickTarget') || 'unknown',
      formFieldsInteracted:
        sessionStorage.getItem('formFieldsInteracted') || '0',
      buttonsClicked: sessionStorage.getItem('buttonsClicked') || '0'
    };
  }

  // Enhanced timing and session tracking methods
  private getSessionDuration(): number {
    if (typeof window === 'undefined') return 0;
    const sessionStart = sessionStorage.getItem('sessionStartTime');
    if (!sessionStart) {
      sessionStorage.setItem('sessionStartTime', Date.now().toString());
      return 0;
    }
    return Date.now() - parseInt(sessionStart);
  }

  private getPageLoadTime(): number {
    if (typeof window === 'undefined' || !window.performance) return 0;
    const navigation = window.performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      return navigation.loadEventEnd - navigation.fetchStart;
    }
    return 0;
  }

  private getTimeOnCurrentPage(): number {
    if (typeof window === 'undefined') return 0;
    const pageStartTime = sessionStorage.getItem('currentPageStartTime');
    if (!pageStartTime) {
      sessionStorage.setItem('currentPageStartTime', Date.now().toString());
      return 0;
    }
    return Date.now() - parseInt(pageStartTime);
  }

  // Enhanced user interaction tracking
  private initializeInteractionTracking(): void {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Safely get className - handle SVG elements and non-string className values
      let className = '';
      try {
        if (target.className) {
          if (typeof target.className === 'string') {
            className = target.className.split(' ')[0];
          } else if (target.className && 'baseVal' in target.className) {
            // SVG elements have className.baseVal
            className = (target.className as any).baseVal.split(' ')[0];
          } else {
            // Try to convert to string
            const classNameStr = String(target.className);
            if (classNameStr && classNameStr !== '[object Object]') {
              className = classNameStr.split(' ')[0];
            }
          }
        }
      } catch {
        // Fallback - just use empty string if we can't get className
        className = '';
      }

      sessionStorage.setItem(
        'lastClickTarget',
        target.tagName +
          (target.id ? `#${target.id}` : '') +
          (className ? `.${className}` : '')
      );

      // Increment button clicks if it's a button
      if (
        target.tagName === 'BUTTON' ||
        (target as HTMLInputElement).type === 'submit'
      ) {
        const current = parseInt(
          sessionStorage.getItem('buttonsClicked') || '0'
        );
        sessionStorage.setItem('buttonsClicked', (current + 1).toString());
      }
    });

    // Track form interactions
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        const current = parseInt(
          sessionStorage.getItem('formFieldsInteracted') || '0'
        );
        sessionStorage.setItem(
          'formFieldsInteracted',
          (current + 1).toString()
        );
      }
    });

    // Reset page timer when navigating
    const resetPageTimer = () => {
      sessionStorage.setItem('currentPageStartTime', Date.now().toString());
    };

    // Listen for page changes (for SPAs)
    let currentPath = window.location.pathname;
    const checkForPageChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        resetPageTimer();
      }
    };
    setInterval(checkForPageChange, 1000);
  }

  // Initialize page tracking for analytics
  private initializePageTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page views
    const currentPageViews = parseInt(
      sessionStorage.getItem('pageViews') || '0'
    );
    sessionStorage.setItem('pageViews', (currentPageViews + 1).toString());

    // Track total interactions
    const trackInteraction = () => {
      const current = parseInt(
        sessionStorage.getItem('totalInteractions') || '0'
      );
      sessionStorage.setItem('totalInteractions', (current + 1).toString());
    };

    // Track various interaction types
    ['click', 'keydown', 'scroll', 'touch'].forEach((eventType) => {
      document.addEventListener(eventType, trackInteraction, { passive: true });
    });

    // Track click depth
    document.addEventListener('click', () => {
      const current = parseInt(sessionStorage.getItem('clickDepth') || '0');
      sessionStorage.setItem('clickDepth', (current + 1).toString());
    });

    // Track referrer information
    if (document.referrer && !sessionStorage.getItem('sessionReferrer')) {
      sessionStorage.setItem('sessionReferrer', document.referrer);
    }

    // Track user agent if not already stored
    if (!sessionStorage.getItem('sessionUserAgent')) {
      sessionStorage.setItem('sessionUserAgent', navigator.userAgent);
    }
  }

  // Enhanced network information collection
  private getNetworkInfo(): any {
    if (typeof window === 'undefined' || !navigator) return null;

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      connectionType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false,
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages || [navigator.language],
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack
    };
  }

  // Browser capabilities and environment info
  private getBrowserCapabilities(): any {
    if (typeof window === 'undefined') return null;

    return {
      // Storage capabilities
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,

      // API capabilities
      geolocation: !!navigator.geolocation,
      webWorkers: !!window.Worker,
      serviceWorkers: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      notifications: 'Notification' in window,

      // Display and media
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth || null,
      screenResolution: `${screen.width}x${screen.height}`,
      availableResolution: `${screen.availWidth}x${screen.availHeight}`,

      // JavaScript features
      webGL: !!window.WebGLRenderingContext,
      webGL2: !!window.WebGL2RenderingContext,
      webAssembly: !!window.WebAssembly,

      // Security
      secureContext: window.isSecureContext,
      crossOriginIsolated: window.crossOriginIsolated || false
    };
  }

  // Enhanced error context with source mapping and call stack analysis
  private getEnhancedErrorContext(error?: Error, message?: string): any {
    if (!error) return null;

    const context: any = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      stackLines: error.stack ? error.stack.split('\n').slice(1, 6) : [] // Top 5 stack frames
    };

    // Try to extract file and line information
    if (error.stack) {
      const stackMatch = error.stack.match(/at.*\((.*):(\d+):(\d+)\)/);
      if (stackMatch) {
        context.sourceFile = stackMatch[1];
        context.lineNumber = parseInt(stackMatch[2]);
        context.columnNumber = parseInt(stackMatch[3]);
      }
    }

    // Categorize error type
    if (error.name === 'TypeError') {
      context.category = 'Type Error';
      context.commonCause = 'Variable is undefined/null or wrong type';
    } else if (error.name === 'ReferenceError') {
      context.category = 'Reference Error';
      context.commonCause = 'Variable or function not defined';
    } else if (error.name === 'SyntaxError') {
      context.category = 'Syntax Error';
      context.commonCause = 'Invalid JavaScript syntax';
    } else if (error.message?.includes('fetch')) {
      context.category = 'Network Error';
      context.commonCause = 'API call or network request failed';
    } else if (error.message?.includes('auth')) {
      context.category = 'Authentication Error';
      context.commonCause = 'Login or permission issue';
    } else {
      context.category = 'General Error';
      context.commonCause = 'Unknown error type';
    }

    return context;
  }

  // Collect client-side performance metrics
  private getClientMetrics(): any {
    if (typeof window === 'undefined' || !window.performance) return null;

    const timing = window.performance.timing;
    const navigation = window.performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    return {
      // Page load performance
      domContentLoaded:
        timing.domContentLoadedEventEnd - timing.navigationStart,
      pageLoadComplete: timing.loadEventEnd - timing.navigationStart,
      firstPaint: navigation?.responseStart - navigation?.requestStart || 0,

      // Resource performance
      resources: window.performance.getEntriesByType('resource').length,

      // Navigation type
      navigationType: navigation?.type || 'unknown',

      // Current memory usage (if available)
      usedMemory: (window.performance as any).memory?.usedJSHeapSize || null,
      totalMemory: (window.performance as any).memory?.totalJSHeapSize || null,
      memoryLimit: (window.performance as any).memory?.jsHeapSizeLimit || null
    };
  }

  // Track user engagement metrics
  private getUserEngagementMetrics(): any {
    if (typeof window === 'undefined') return null;

    const engagementData = {
      timeSpentOnSite: this.getSessionDuration(),
      pageViews: parseInt(sessionStorage.getItem('pageViews') || '1'),
      interactionEvents: parseInt(
        sessionStorage.getItem('totalInteractions') || '0'
      ),
      clickDepth: parseInt(sessionStorage.getItem('clickDepth') || '0'),
      scrollDepth: this.getScrollDepth(),
      bounceRate: this.calculateBounceRate()
    };

    return engagementData;
  }

  private getScrollDepth(): number {
    if (typeof window === 'undefined') return 0;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const windowHeight = window.innerHeight;
    return Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
  }

  private calculateBounceRate(): number {
    const sessionStart = sessionStorage.getItem('sessionStartTime');
    const pageViews = parseInt(sessionStorage.getItem('pageViews') || '1');

    if (!sessionStart || pageViews > 1) return 0; // Not a bounce if multiple pages viewed

    const sessionDuration = Date.now() - parseInt(sessionStart);
    return sessionDuration < 30000 ? 1 : 0; // Bounce if less than 30 seconds on single page
  }

  private detectCurrentFeature(): string {
    if (typeof window === 'undefined') return 'unknown';

    const path = window.location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (
      path.includes('/auth') ||
      path.includes('/signin') ||
      path.includes('/login')
    )
      return 'Authentication';
    if (path.includes('/profile')) return 'Profile Management';
    if (path.includes('/projects')) return 'Project Management';
    if (path.includes('/meals')) return 'Meal Planning';
    if (path.includes('/lists')) return 'List Management';
    if (path.includes('/work')) return 'Work Tracking';
    if (path.includes('/logs')) return 'System Monitoring';
    return 'General Navigation';
  }

  private detectUserJourney(): string {
    if (typeof window === 'undefined') return 'unknown';

    const sessionActions = sessionStorage.getItem('userActions');
    if (!sessionActions) return 'new-session';

    const actions = JSON.parse(sessionActions);
    if (actions.length < 3) return 'exploring';
    if (actions.length < 10) return 'engaged';
    return 'power-user';
  }

  // Check if message is a dashboard refresh alert - ALWAYS PREVENT (no longer configurable)
  private isDashboardRefreshAlert(message: string): boolean {
    // COMPLETE PREVENTION: Always check patterns, no configuration toggle needed
    // Use compiled regex for better performance instead of multiple includes()
    const refreshPatternRegex =
      /dashboard refresh|refreshing dashboard|dashboard updated|dashboard reload|dashboard data|auto-refresh|live updating|dashboard sync|dashboard polling|dashboard state|dashboard mounted|dashboard component|refreshing data|updating dashboard|dashboard load|dashboard ready|dayboard proprietary|batch of|logs persisted to database|dashboard refresh - time range:/i;

    const refreshEmojiRegex = /📊|🔄|⚡|🔃|↻|🛡️|✅/;

    return refreshPatternRegex.test(message) || refreshEmojiRegex.test(message);
  }

  // Public method to configure dashboard filtering (legacy compatibility - prevention always active)
  public setDashboardFilteringEnabled(enabled: boolean): void {
    this.filterDashboardRefreshAlerts = enabled;
    if (this.isDev && this.originalConsole.log) {
      this.originalConsole.log(
        `📊 Dashboard refresh alert prevention ${enabled ? 'enabled' : 'disabled'} (complete prevention always active)`
      );
    }
  }

  // Public method to configure localhost testing isolation
  public setLocalhostIsolationEnabled(enabled: boolean): void {
    this.enableLocalhostIsolation = enabled;
    if (this.isDev && this.originalConsole.log) {
      this.originalConsole.log(
        `🔧 Localhost testing isolation ${enabled ? 'enabled' : 'disabled'}`
      );
    }
  }

  // Public method to check if localhost isolation is enabled
  public isLocalhostIsolationEnabled(): boolean {
    return this.enableLocalhostIsolation;
  }

  // Public method to check if dashboard filtering is enabled (legacy compatibility)
  public isDashboardFilteringEnabled(): boolean {
    return this.filterDashboardRefreshAlerts;
  }

  // Intercept all console methods to capture logs
  // Make this public so components can call it
  public setupConsoleInterception() {
    if (typeof window !== 'undefined' && !this.isIntercepting) {
      this.isIntercepting = true;

      // Store original console methods
      this.originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
      };

      // Override console methods
      console.log = (...args: any[]) => {
        this.captureConsoleLog(LogLevel.INFO, args, 'Console');
        this.originalConsole.log(...args);
      };

      console.error = (...args: any[]) => {
        this.captureConsoleLog(LogLevel.ERROR, args, 'Console');
        this.originalConsole.error(...args);
      };

      console.warn = (...args: any[]) => {
        this.captureConsoleLog(LogLevel.WARN, args, 'Console');
        this.originalConsole.warn(...args);
      };

      console.info = (...args: any[]) => {
        this.captureConsoleLog(LogLevel.INFO, args, 'Console');
        this.originalConsole.info(...args);
      };

      console.debug = (...args: any[]) => {
        // Skip debug capture - not beneficial right now
        this.originalConsole.debug(...args);
      };
    }
  }

  private captureConsoleLog(
    level: LogLevel,
    args: any[],
    defaultComponent: string
  ) {
    try {
      // Skip debug logging entirely - not beneficial right now
      if (level === LogLevel.DEBUG) {
        return;
      }

      // Early performance optimization: convert args to string once
      const messageStr =
        args.length === 1 && typeof args[0] === 'string'
          ? args[0]
          : args.join(' ');

      // Performance: Skip empty or very short messages early
      if (!messageStr || messageStr.length < 3) return;

      // Performance: Early exit for dashboard-specific logs to prevent recursive logging
      if (
        typeof window !== 'undefined' &&
        window.location.pathname.includes('/logs-dashboard')
      ) {
        // Use a single regex for better performance instead of multiple includes()
        const dashboardPatterns =
          /📊|Dashboard|LogsDashboard|Refreshing logs|Retrieved|Time filter|Final result|🛡️ Dayboard Proprietary|✅ Batch of|logs persisted to database|Dashboard refresh - Time range:/;
        if (dashboardPatterns.test(messageStr)) {
          return; // Skip dashboard internal logging only
        }
      }

      // Use the helper method to check for dashboard refresh alerts - PREVENT CAPTURE ENTIRELY
      if (this.isDashboardRefreshAlert(messageStr)) {
        return; // COMPLETE PREVENTION: Do not capture, process, store, or make available
      }

      // Database logging throttling to prevent spam (32 logs/min)
      const isDatabaseLog =
        /database|supabase|sql|query|db|persist|fetch.*logs|api.*logs/i.test(
          messageStr
        );
      if (isDatabaseLog) {
        const messageKey = messageStr.substring(0, 50); // Use first 50 chars as key
        const now = Date.now();
        const lastLogTime = this.databaseLogThrottle.get(messageKey) || 0;

        if (now - lastLogTime < this.databaseLogThrottleWindow) {
          // Count how many times this message appeared in the window
          const windowStart = now - this.databaseLogThrottleWindow;
          const recentSimilarLogs = this.logs.filter(
            (log) =>
              log.timestamp &&
              new Date(log.timestamp).getTime() > windowStart &&
              log.message.substring(0, 50) === messageKey
          ).length;

          if (recentSimilarLogs >= this.maxDatabaseLogsPerWindow) {
            // Skip this log to prevent spam
            return;
          }
        }

        this.databaseLogThrottle.set(messageKey, now);

        // Clean up old throttle entries periodically
        if (this.databaseLogThrottle.size > 100) {
          const keysToDelete: string[] = [];
          this.databaseLogThrottle.forEach((time, key) => {
            if (now - time > this.databaseLogThrottleWindow * 2) {
              keysToDelete.push(key);
            }
          });
          keysToDelete.forEach((key) => this.databaseLogThrottle.delete(key));
        }
      }

      // API-Client logging throttling to prevent spam during login (7 logs/min)
      const isApiClientLog =
        /fetch|API|request|auth|login|oauth|token|signin/i.test(messageStr);
      if (isApiClientLog) {
        const messageKey = messageStr.substring(0, 50); // Use first 50 chars as key
        const now = Date.now();
        const lastLogTime = this.apiClientLogThrottle.get(messageKey) || 0;

        if (now - lastLogTime < this.apiClientLogThrottleWindow) {
          // Count how many times this message appeared in the window
          const windowStart = now - this.apiClientLogThrottleWindow;
          const recentSimilarLogs = this.logs.filter(
            (log) =>
              log.timestamp &&
              new Date(log.timestamp).getTime() > windowStart &&
              log.message.substring(0, 50) === messageKey
          ).length;

          if (recentSimilarLogs >= this.maxApiClientLogsPerWindow) {
            // Skip this log to prevent spam
            return;
          }
        }

        this.apiClientLogThrottle.set(messageKey, now);

        // Clean up old throttle entries periodically
        if (this.apiClientLogThrottle.size > 50) {
          const keysToDelete: string[] = [];
          this.apiClientLogThrottle.forEach((time, key) => {
            if (now - time > this.apiClientLogThrottleWindow * 2) {
              keysToDelete.push(key);
            }
          });
          keysToDelete.forEach((key) => this.apiClientLogThrottle.delete(key));
        }
      }

      // Localhost testing isolation - filter out test-specific logs in development
      if (this.enableLocalhostIsolation && this.isLocalhost) {
        const testPatterns =
          /test|spec|mock|stub|fixture|demo|example|localhost.*testing|development.*testing/i;
        if (testPatterns.test(messageStr)) {
          // Only log to console for development, don't persist to database
          if (this.isDev && this.originalConsole.log) {
            this.originalConsole.log('[TEST]', messageStr);
          }
          return;
        }
      }

      // Enhanced component detection and tagging (only if we're going to process)
      const component = this.detectMessageSource(messageStr, args);
      const tags = this.generateMessageTags(messageStr, args, level);

      // Extract any error objects for stack traces
      const error = args.find((arg) => arg instanceof Error);

      // Safely serialize arguments to prevent circular reference issues
      const safeArgs = this.safeSerializeArgs(args);

      this.writeLog(
        this.createLogEntry(
          level,
          messageStr,
          component,
          {
            originalArgs: safeArgs,
            tags: tags,
            messageType: this.categorizeMessage(messageStr),
            source: this.detectThirdPartySource(messageStr)
          },
          error
        )
      );
    } catch (err) {
      // Fallback to prevent infinite loops
      this.originalConsole.error('Logger error:', err);
    }
  }

  // Safe serialization to prevent circular reference errors
  // Safe serialization to prevent circular reference errors - optimized for performance
  private safeSerializeArgs(args: any[]): any {
    // Early exit for empty or single primitive arguments
    if (args.length === 0) return [];
    if (args.length === 1) {
      const arg = args[0];
      if (
        arg === null ||
        arg === undefined ||
        typeof arg === 'string' ||
        typeof arg === 'number' ||
        typeof arg === 'boolean'
      ) {
        return [arg];
      }
    }

    try {
      return args.map((arg) => {
        // Fast path for primitives
        if (
          arg === null ||
          arg === undefined ||
          typeof arg === 'string' ||
          typeof arg === 'number' ||
          typeof arg === 'boolean'
        ) {
          return arg;
        }

        // Handle Errors
        if (arg instanceof Error) {
          return {
            name: arg.name,
            message: arg.message,
            stack: arg.stack
          };
        }

        // Handle objects
        if (typeof arg === 'object') {
          // DOM element checks (most common first)
          if (arg.nodeType) {
            return `[DOM Element: ${arg.nodeName || 'Unknown'}]`;
          }

          // React component checks (use single regex for better performance)
          if (
            arg._reactInternalFiber ||
            arg.__reactFiber ||
            (arg.constructor?.name && /Fiber|React/.test(arg.constructor.name))
          ) {
            return '[React Component/Fiber]';
          }

          // Quick check for React Fiber in keys (limited to first few keys for performance)
          const keys = Object.keys(arg);
          if (
            keys.length > 0 &&
            keys
              .slice(0, 5)
              .some(
                (key) =>
                  key.includes('__reactFiber') ||
                  key.includes('_reactInternalFiber')
              )
          ) {
            return '[React Fiber Object]';
          }

          // Try to serialize (with size limit for performance)
          try {
            const str = JSON.stringify(arg);
            return str.length > 1000 ? '[Large Object]' : JSON.parse(str);
          } catch {
            return '[Circular Object]';
          }
        }

        return String(arg);
      });
    } catch {
      return ['[Serialization Error]'];
    }
  }

  // Enhanced message source detection - optimized with regex patterns
  private detectMessageSource(message: string, args: any[]): string {
    // Use compiled regex patterns for better performance
    if (/\[Fast Refresh\]|Fast Refresh/i.test(message)) {
      return 'Next.js-HMR';
    }
    if (/Compiled|compiling/i.test(message)) {
      return 'Next.js-Build';
    }
    if (/OAuth|auth|token|login/i.test(message)) {
      return 'Auth-System';
    }
    if (/Route|router|navigation/i.test(message)) {
      return 'Routing';
    }
    if (/fetch|API|request/i.test(message)) {
      return 'API-Client';
    }
    if (/database|supabase|sql/i.test(message)) {
      return 'Database';
    }

    // Check for third-party libraries
    const thirdPartySource = this.detectThirdPartySource(message);
    if (thirdPartySource !== 'App') {
      return thirdPartySource;
    }

    return 'App-Console';
  }

  // Generate contextual tags for messages
  private generateMessageTags(
    message: string,
    args: any[],
    level: LogLevel
  ): string[] {
    const tags: string[] = [];

    // Level-based tags
    tags.push(level.toLowerCase());

    // Content-based tags
    if (message.includes('error') || level === LogLevel.ERROR) {
      tags.push('error');
    }
    if (message.includes('warning') || level === LogLevel.WARN) {
      tags.push('warning');
    }
    if (message.includes('deprecated')) {
      tags.push('deprecated');
    }
    if (message.includes('performance') || message.includes('slow')) {
      tags.push('performance');
    }
    if (
      message.includes('security') ||
      message.includes('auth') ||
      message.includes('token')
    ) {
      tags.push('security');
    }
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('request')
    ) {
      tags.push('network');
    }
    if (
      message.includes('database') ||
      message.includes('sql') ||
      message.includes('query')
    ) {
      tags.push('database');
    }

    // Framework-specific tags
    if (message.includes('React') || message.includes('Hook')) {
      tags.push('react');
    }
    if (message.includes('Next.js') || message.includes('[Fast Refresh]')) {
      tags.push('nextjs');
    }
    if (message.includes('Turbopack') || message.includes('webpack')) {
      tags.push('bundler');
    }

    // Third-party tags
    if (message.includes('Google') || message.includes('OAuth')) {
      tags.push('third-party', 'oauth');
    }
    if (message.includes('Stripe')) {
      tags.push('third-party', 'payment');
    }
    if (message.includes('Supabase')) {
      tags.push('third-party', 'backend');
    }

    return Array.from(new Set(tags)); // Remove duplicates
  }

  // Categorize message type
  private categorizeMessage(message: string): string {
    if (message.includes('[Fast Refresh]') || message.includes('Compiled')) {
      return 'build-system';
    }
    if (message.includes('Route') || message.includes('Static')) {
      return 'routing-error';
    }
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('CORS')
    ) {
      return 'network-request';
    }
    if (
      message.includes('OAuth') ||
      message.includes('auth') ||
      message.includes('token')
    ) {
      return 'authentication';
    }
    if (message.includes('database') || message.includes('sql')) {
      return 'database-operation';
    }
    if (message.includes('permission') || message.includes('security')) {
      return 'security-issue';
    }
    if (message.includes('performance') || message.includes('slow')) {
      return 'performance-issue';
    }

    return 'general';
  }

  // Detect third-party vs app messages
  private detectThirdPartySource(message: string): string {
    // Google/OAuth related
    if (
      message.includes('Google') ||
      message.includes('googleapis') ||
      message.includes('gapi')
    ) {
      return 'Google-Services';
    }

    // Stripe related
    if (message.includes('Stripe') || message.includes('stripe.com')) {
      return 'Stripe-Payment';
    }

    // Supabase related
    if (message.includes('Supabase') || message.includes('supabase.co')) {
      return 'Supabase-Backend';
    }

    // Vercel/Next.js related
    if (message.includes('Vercel') || message.includes('vercel.app')) {
      return 'Vercel-Platform';
    }

    // Analytics related
    if (
      message.includes('analytics') ||
      message.includes('gtag') ||
      message.includes('ga.js')
    ) {
      return 'Analytics-Service';
    }

    // CDN or external scripts
    if (
      message.includes('cdn.') ||
      message.includes('unpkg.') ||
      message.includes('jsdelivr.')
    ) {
      return 'CDN-Resource';
    }

    // Browser APIs or extensions
    if (
      message.includes('chrome-extension') ||
      message.includes('moz-extension')
    ) {
      return 'Browser-Extension';
    }

    return 'App';
  }

  // Generate layman's terms explanation for technical messages
  private generateLaymanExplanation(
    message: string,
    level: LogLevel,
    component?: string
  ): string {
    const lowerMessage = message.toLowerCase();

    // Authentication/Login errors
    if (
      lowerMessage.includes('auth') ||
      lowerMessage.includes('token') ||
      lowerMessage.includes('unauthorized')
    ) {
      if (level === LogLevel.ERROR) {
        return 'There was a problem signing you in or verifying your account. Please try logging in again.';
      }
      return 'The app is checking your login information. This helps keep your account secure.';
    }

    // Network/Connection errors
    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('cors')
    ) {
      if (level === LogLevel.ERROR) {
        return "The app couldn't connect to our servers. Please check your internet connection and try again.";
      }
      return 'The app is communicating with our servers. Some features might be slower than usual.';
    }

    // Database errors
    if (
      lowerMessage.includes('database') ||
      lowerMessage.includes('sql') ||
      lowerMessage.includes('supabase')
    ) {
      if (level === LogLevel.ERROR) {
        return 'There was a problem saving or loading your data. Your information is safe, but some features might not work properly.';
      }
      return 'The app is working with your data. Everything should work normally.';
    }

    // Build/Compilation errors (development)
    if (
      lowerMessage.includes('compiled') ||
      lowerMessage.includes('[fast refresh]') ||
      lowerMessage.includes('webpack')
    ) {
      return "The development team is updating the app. You might see this message while we're making improvements.";
    }

    // React/Component errors
    if (
      lowerMessage.includes('react') ||
      lowerMessage.includes('component') ||
      lowerMessage.includes('hook') ||
      lowerMessage.includes('hydration')
    ) {
      if (level === LogLevel.ERROR) {
        return "A part of the app interface had trouble loading. Try refreshing the page if something doesn't look right.";
      }
      return 'The app is setting up the page you&apos;re viewing. This is normal and usually happens quickly.';
    }

    // Performance issues
    if (
      lowerMessage.includes('slow') ||
      lowerMessage.includes('performance') ||
      lowerMessage.includes('memory')
    ) {
      return 'The app is running a bit slower than usual. This might be due to your device or internet connection.';
    }

    // Permission/Security issues
    if (
      lowerMessage.includes('permission') ||
      lowerMessage.includes('security') ||
      lowerMessage.includes('blocked')
    ) {
      if (level === LogLevel.ERROR) {
        return "You don't have permission to do that action, or there's a security restriction in place.";
      }
      return 'The app is checking your permissions to make sure everything is secure.';
    }

    // Payment/Stripe errors
    if (lowerMessage.includes('stripe') || lowerMessage.includes('payment')) {
      if (level === LogLevel.ERROR) {
        return 'There was a problem processing your payment. Please check your payment information and try again.';
      }
      return 'The app is processing payment information. This is secure and normal.';
    }

    // General error types by level
    switch (level) {
      case LogLevel.ERROR:
        return 'Something went wrong with the app. Try refreshing the page or contact support if the problem continues.';
      case LogLevel.WARN:
        return 'The app noticed something unusual but is handling it. You can continue using the app normally.';
      case LogLevel.INFO:
        return "The app is working normally and keeping track of what's happening.";
      case LogLevel.DEBUG:
        return "Technical information for developers. This doesn't affect your experience.";
      default:
        return 'The app is running and monitoring its performance.';
    }
  }

  // Determine severity and impact assessment for logged messages
  private getSeverityAndImpact(
    message: string,
    level: LogLevel
  ): { severity: string; impact: string; suggestedAction: string } {
    const lowerMessage = message.toLowerCase();

    // Critical issues
    if (
      level === LogLevel.ERROR &&
      (lowerMessage.includes('auth') ||
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('payment') ||
        lowerMessage.includes('data loss') ||
        lowerMessage.includes('security'))
    ) {
      return {
        severity: 'critical',
        impact: 'User cannot access account or complete important actions',
        suggestedAction: 'Contact support immediately or try logging in again'
      };
    }

    // High priority issues
    if (
      level === LogLevel.ERROR &&
      (lowerMessage.includes('network') ||
        lowerMessage.includes('database') ||
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('timeout'))
    ) {
      return {
        severity: 'high',
        impact: 'Some features may not work properly or data may not save',
        suggestedAction: 'Check internet connection and refresh the page'
      };
    }

    // Medium priority issues
    if (
      level === LogLevel.ERROR ||
      (level === LogLevel.WARN && lowerMessage.includes('performance'))
    ) {
      return {
        severity: 'medium',
        impact: 'App functionality may be reduced or slower than normal',
        suggestedAction:
          'Continue using the app, but watch for additional problems'
      };
    }

    // Low priority issues
    if (level === LogLevel.WARN) {
      return {
        severity: 'low',
        impact: "Minor issue that doesn't affect main functionality",
        suggestedAction: 'No action needed, but developers will investigate'
      };
    }

    // Info/Debug
    return {
      severity: 'low',
      impact: 'No impact on user experience',
      suggestedAction: 'No action needed - this is normal app behavior'
    };
  }

  // Method to restore original console (for cleanup)
  public restoreConsole() {
    if (this.isIntercepting && typeof window !== 'undefined') {
      console.log = this.originalConsole.log;
      console.error = this.originalConsole.error;
      console.warn = this.originalConsole.warn;
      console.info = this.originalConsole.info;
      console.debug = this.originalConsole.debug;
      this.isIntercepting = false;
    }
  }

  private async createLogEntry(
    level: LogLevel,
    message: string,
    component?: string,
    data?: any,
    error?: Error
  ): Promise<LogEntry> {
    // Get enhanced user information
    const userInfo = await this.getCurrentUserInfo();
    const deviceInfo = this.getDeviceInfo();
    const performanceInfo = this.getPerformanceInfo();
    const contextInfo = this.getContextInfo();
    const networkInfo = this.getNetworkInfo();
    const browserCapabilities = this.getBrowserCapabilities();
    const errorContext = this.getEnhancedErrorContext(error, message);
    const clientMetrics = this.getClientMetrics();
    const engagementMetrics = this.getUserEngagementMetrics();

    // Generate layman's explanation and severity info
    const laymanExplanation = this.generateLaymanExplanation(
      message,
      level,
      component
    );
    const { severity, impact, suggestedAction } = this.getSeverityAndImpact(
      message,
      level
    );

    // Track user action for journey mapping
    if (typeof window !== 'undefined') {
      const currentActions = JSON.parse(
        sessionStorage.getItem('userActions') || '[]'
      );
      currentActions.push({
        timestamp: new Date().toISOString(),
        action: component || 'unknown',
        url: window.location.href,
        pageTitle: document.title
      });
      // Keep only last 20 actions
      if (currentActions.length > 20) {
        currentActions.splice(0, currentActions.length - 20);
      }
      sessionStorage.setItem('userActions', JSON.stringify(currentActions));
      sessionStorage.setItem('lastAction', component || 'unknown');
    }

    return {
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      component,
      data,
      stack: error?.stack,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      side: 'client', // Mark all client-side logger entries as client
      // Enhanced fields
      userInfo,
      laymanExplanation,
      severity: severity as 'critical' | 'high' | 'medium' | 'low',
      impact,
      suggestedAction,
      deviceInfo,
      performanceInfo,
      contextInfo,
      networkInfo,
      browserCapabilities,
      errorContext,
      clientMetrics,
      engagementMetrics
    };
  }

  private async writeLog(entry: LogEntry | Promise<LogEntry>) {
    const resolvedEntry = await entry;
    this.logs.push(resolvedEntry);

    // More aggressive memory management: keep only last 300 logs and trim more frequently
    if (this.logs.length > 300) {
      this.logs = this.logs.slice(-250); // Keep fewer logs for better performance
    }

    // Check for auto-review triggers (only for errors)
    if (resolvedEntry.level === LogLevel.ERROR) {
      this.checkForAutoReview();
    }

    // Persist to database asynchronously with throttling
    this.throttledPersistToDatabase(resolvedEntry);

    // Simplified console output in development
    if (this.isDev && resolvedEntry.level !== LogLevel.DEBUG) {
      // Skip debug logs in dev
      const emoji = {
        [LogLevel.ERROR]: '❌',
        [LogLevel.WARN]: '⚠️',
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.DEBUG]: '🐛'
      };

      const prefix = `${emoji[resolvedEntry.level]} [${resolvedEntry.component || 'APP'}]`;

      switch (resolvedEntry.level) {
        case LogLevel.ERROR:
          this.originalConsole?.error?.(prefix, resolvedEntry.message);
          break;
        case LogLevel.WARN:
          this.originalConsole?.warn?.(prefix, resolvedEntry.message);
          break;
        default:
          this.originalConsole?.info?.(prefix, resolvedEntry.message);
          break;
      }
    }
  }

  // Throttled database persistence to prevent overwhelming the database
  private pendingLogs: LogEntry[] = [];
  private persistTimeout: NodeJS.Timeout | null = null;

  private throttledPersistToDatabase(entry: LogEntry) {
    this.pendingLogs.push(entry);

    // Clear existing timeout only if we're about to create a new one
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
      this.persistTimeout = null;
    }

    // More aggressive batching: batch immediately at 15+ logs, or after 1.5 seconds for smaller batches
    const batchSize = this.pendingLogs.length;
    const timeout = batchSize >= 15 ? 50 : batchSize >= 5 ? 800 : 1500;

    this.persistTimeout = setTimeout(() => {
      if (this.pendingLogs.length > 0) {
        const logsToProcess = [...this.pendingLogs];
        this.pendingLogs = []; // Clear immediately to prevent race conditions
        this.batchPersistToDatabase(logsToProcess);
      }
      this.persistTimeout = null;
    }, timeout);
  }

  private async batchPersistToDatabase(entries: LogEntry[]) {
    try {
      const userId = await this.getCurrentUserId();

      const insertData = entries.map((entry) => ({
        user_id: userId,
        session_id: entry.sessionId,
        level: entry.level,
        message: entry.message,
        component: entry.component,
        data: this.safeSerializeForDatabase(entry.data),
        stack_trace: entry.stack,
        user_agent: entry.userAgent,
        url: entry.url,
        timestamp: entry.timestamp,
        side: entry.side || 'client' // Now that the column exists, we can use it
      }));

      const { error } = await (this.supabase as any)
        .from('application_logs')
        .insert(insertData);

      if (error) {
        // Use safe serialization for error logging to prevent circular references
        const safeError = this.safeSerializeForDatabase({
          error: error,
          entryCount: entries.length
        });
        console.error('❌ Batch database write failed:', safeError);
        throw error;
      } else {
        // Database persistence successful - no need to log success
      }
    } catch (error) {
      // Enhanced error logging for debugging with safe serialization
      const safeErrorInfo = this.safeSerializeForDatabase({
        errorMessage: (error as any)?.message || 'Unknown error',
        errorCode: (error as any)?.code || 'NO_CODE',
        entryCount: entries.length,
        originalError: error
      });
      console.error('❌ Batch database write failed:', safeErrorInfo);
    }
  }

  private async persistToDatabase(entry: LogEntry) {
    try {
      const userId = await this.getCurrentUserId();

      // Insert without 'side' column since it doesn't exist in remote database yet
      const { error } = await (this.supabase as any)
        .from('application_logs')
        .insert({
          user_id: userId,
          session_id: entry.sessionId,
          level: entry.level,
          message: entry.message,
          component: entry.component,
          data: entry.data,
          stack_trace: entry.stack,
          user_agent: entry.userAgent,
          url: entry.url,
          timestamp: entry.timestamp,
          side: entry.side || 'client' // Now that the column exists, we can use it
        });

      if (error) {
        console.error('❌ Database logging error:', {
          error: error,
          message: entry.message.substring(0, 50) + '...'
        });
        throw error;
      } else {
        // Log persistence successful - no need to log success
      }
    } catch (error) {
      // Log database write errors to console for debugging
      console.error('❌ Failed to persist log to database:', error);
      // Silently fail database writes to avoid impacting app performance
      // For now, we'll just keep logs in memory
    }
  }

  // Safe serialization specifically for database storage
  private safeSerializeForDatabase(data: any): any {
    if (data === null || data === undefined) return null;

    try {
      // First, clean the data of any circular references
      const cleanData = this.removeCircularReferences(data);

      // Then stringify and parse to ensure it's fully serializable
      const serialized = JSON.stringify(cleanData);
      return JSON.parse(serialized);
    } catch (error) {
      // If all else fails, return a safe representation
      return {
        error: 'Failed to serialize data',
        originalType: typeof data,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Remove circular references from objects
  private removeCircularReferences(obj: any, seen = new WeakSet()): any {
    if (obj === null || obj === undefined) return obj;

    // Handle primitive types
    if (typeof obj !== 'object') {
      // Convert functions to string representation
      if (typeof obj === 'function') return '[Function]';
      // Handle symbols
      if (typeof obj === 'symbol') return obj.toString();
      return obj;
    }

    // Handle special objects that can't be serialized
    if (obj instanceof Error) {
      return {
        name: obj.name,
        message: obj.message,
        stack: obj.stack?.substring(0, 200)
      };
    }

    if (obj instanceof Date) return obj.toISOString();
    if (obj instanceof RegExp) return obj.toString();

    // Check for circular references
    if (seen.has(obj)) return '[Circular Reference]';
    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeCircularReferences(item, seen));
    }

    // Handle DOM elements
    if (obj.nodeType && obj.nodeName) {
      return `[DOM Element: ${obj.nodeName}]`;
    }

    // Handle React components/fibers - Enhanced detection
    if (
      obj._reactInternalFiber ||
      obj.__reactFiber ||
      (obj.constructor &&
        obj.constructor.name &&
        (obj.constructor.name.includes('Fiber') ||
          obj.constructor.name.includes('React')))
    ) {
      return '[React Component/Fiber]';
    }

    // Check for React Fiber properties in object keys
    const objectKeys = Object.keys(obj);
    if (
      objectKeys.some(
        (key) =>
          key.includes('__reactFiber') || key.includes('_reactInternalFiber')
      )
    ) {
      return '[React Fiber Object]';
    }

    // Handle HTMLElement objects
    if (obj instanceof HTMLElement || (obj.nodeType && obj.nodeType === 1)) {
      return `[HTML Element: ${obj.tagName || obj.nodeName || 'Unknown'}]`;
    }

    // Handle Error objects
    if (obj instanceof Error) {
      return {
        name: obj.name,
        message: obj.message,
        stack: obj.stack
      };
    }

    // Handle regular objects
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        try {
          result[key] = this.removeCircularReferences(obj[key], seen);
        } catch {
          result[key] = '[Serialization Error]';
        }
      }
    }

    return result;
  }

  // Optimized method to load logs from database with caching
  async loadLogsFromDatabase(
    limit: number = 100,
    timeRangeMs?: number
  ): Promise<LogEntry[]> {
    // Skip cache if we have a time range filter
    if (timeRangeMs) {
      return this.fetchLogsFromDatabase(limit, timeRangeMs);
    }

    // Return cached results if recent enough (only for non-filtered requests)
    const now = Date.now();
    if (
      this.dbLogsCache.length > 0 &&
      now - this.lastDbFetch < this.cacheTimeout
    ) {
      return this.dbLogsCache.slice(0, limit);
    }

    // If already loading, return the existing promise
    if (this.isDbLoading && this.dbLoadPromise) {
      try {
        return await this.dbLoadPromise;
      } catch {
        return [];
      }
    }

    // Start new database load
    this.isDbLoading = true;
    this.dbLoadPromise = this.fetchLogsFromDatabase(limit, undefined); // No time filter for cache

    try {
      const logs = await this.dbLoadPromise;
      this.dbLogsCache = logs;
      this.lastDbFetch = now;
      return logs;
    } catch (error) {
      console.error('❌ Cache database load failed:', error);
      return [];
    } finally {
      this.isDbLoading = false;
      this.dbLoadPromise = null;
    }
  }

  private async fetchLogsFromDatabase(
    limit: number,
    timeRangeMs?: number
  ): Promise<LogEntry[]> {
    try {
      // Removed verbose debug logging for routine database operations

      // Try direct database access first
      let query = (this.supabase as any)
        .from('application_logs')
        .select(
          'id, user_id, session_id, level, message, component, data, stack_trace, user_agent, url, timestamp, created_at, side'
        )
        .order('timestamp', { ascending: false });

      // Apply time range filter if specified
      if (timeRangeMs) {
        const cutoffTime = new Date(Date.now() - timeRangeMs).toISOString();
        query = query.gte('timestamp', cutoffTime);
      }

      query = query.limit(limit);

      // Removed verbose query execution logging

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Database query timeout after 8 seconds')),
          8000
        )
      );

      const queryPromise = query;
      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise
      ])) as any;

      // Removed verbose result logging

      if (error) {
        if (this.isDev && this.originalConsole.warn) {
          this.originalConsole.warn(
            '⚠️ Direct database access failed, trying API fallback:',
            error
          );
        }
        // Fallback to API endpoint
        return await this.fetchLogsFromAPI(limit, timeRangeMs);
      }

      return (
        data?.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          sessionId: row.session_id,
          level: row.level,
          message: row.message,
          component: row.component,
          data: row.data,
          stack: row.stack_trace,
          userAgent: row.user_agent,
          url: row.url,
          timestamp: row.timestamp,
          side: row.side || 'client' // Use the side column from database
        })) || []
      );
    } catch (error) {
      if (this.isDev && this.originalConsole.warn) {
        this.originalConsole.warn(
          '⚠️ Direct database access failed, trying API fallback:',
          error
        );
      }
      // Fallback to API endpoint
      return await this.fetchLogsFromAPI(limit, timeRangeMs);
    }
  }

  // New method to fetch logs via API endpoint
  private async fetchLogsFromAPI(
    limit: number,
    timeRangeMs?: number
  ): Promise<LogEntry[]> {
    try {
      // Removed debug logging - no need to log routine operations

      const params = new URLSearchParams({
        limit: limit.toString()
      });

      if (timeRangeMs) {
        params.append('timeRangeMs', timeRangeMs.toString());
      }

      const response = await fetch(`/api/logs?${params}`);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          `API error: ${result.error?.message || 'Unknown error'}`
        );
      }

      // API fetch successful - no need to log success
      return result.logs || [];
    } catch (error) {
      // More detailed error logging
      const errorInfo = {
        errorMessage: (error as any)?.message || 'Unknown error',
        errorCode: (error as any)?.code || 'NO_CODE',
        errorDetails: (error as any)?.details || 'No details',
        errorHint: (error as any)?.hint || 'No hint',
        isTimeout: (error as any)?.message?.includes('timeout'),
        fullError: error,
        hasSupabaseClient: !!this.supabase,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name
      };

      console.error('❌ API logs fetch failed:', errorInfo);

      // Also log to console for debugging
      console.error('Full error object:', error);

      return [];
    }
  }

  // Optimized method to get combined logs with better performance
  async getAllLogsIncludingDatabase(
    limit: number = 100,
    timeRangeMs?: number
  ): Promise<LogEntry[]> {
    try {
      // Get database logs (with optional time filtering)
      const dbLogs = await this.loadLogsFromDatabase(limit, timeRangeMs);

      // Get recent memory logs (apply time filter if specified)
      let recentMemoryLogs = this.logs;

      if (timeRangeMs) {
        const cutoff = Date.now() - timeRangeMs;
        recentMemoryLogs = this.logs.filter(
          (log) => new Date(log.timestamp).getTime() > cutoff
        );
      } else {
        // Only get recent memory logs if no time filter (to avoid duplicates)
        const cutoff = Date.now() - 5 * 60 * 1000; // Last 5 minutes
        recentMemoryLogs = this.logs.filter((log) => {
          const logTime = new Date(log.timestamp).getTime();
          return logTime > cutoff;
        });
      }

      // Combine and deduplicate more efficiently
      const logMap = new Map<string, LogEntry>();

      // Add database logs first
      dbLogs.forEach((log) => {
        const key = `${log.timestamp}-${log.message}-${log.component}`;
        logMap.set(key, log);
      });

      // Add memory logs (will overwrite duplicates)
      recentMemoryLogs.forEach((log) => {
        const key = `${log.timestamp}-${log.message}-${log.component}`;
        logMap.set(key, log);
      });

      // Convert back to array and sort
      const allLogs = Array.from(logMap.values());
      return allLogs
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      this.originalConsole?.error?.('❌ Failed to get combined logs:', error);
      // Fallback to memory logs only
      let fallbackLogs = this.logs;
      if (timeRangeMs) {
        const cutoff = Date.now() - timeRangeMs;
        fallbackLogs = this.logs.filter(
          (log) => new Date(log.timestamp).getTime() > cutoff
        );
      }
      return fallbackLogs
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);
    }
  }

  // Trigger automatic review after high error activity
  private checkForAutoReview() {
    const recentErrors = this.logs.filter(
      (log) =>
        log.level === LogLevel.ERROR &&
        new Date(log.timestamp) > new Date(Date.now() - 2 * 60 * 1000) // Last 2 minutes
    );

    // If we have 3+ errors in 2 minutes, suggest review
    if (recentErrors.length >= 3) {
      if (this.isDev && this.originalConsole.log) {
        this.originalConsole.log('🚨 HIGH ERROR ACTIVITY DETECTED');
        this.originalConsole.log(
          '💡 Consider running automated log analysis to identify issues'
        );
      }
      console.log('🔗 Visit /auto-log-review to see detailed analysis');
    }
  }

  async error(message: string, component?: string, details?: any) {
    // COMPLETE PREVENTION: Dashboard refresh alerts are never captured
    if (this.isDashboardRefreshAlert(message)) {
      return; // Do not capture, process, store, or make available
    }
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      message,
      component,
      details
    );
    await this.writeLog(entry);
  }

  async warn(message: string, component?: string, details?: any) {
    // COMPLETE PREVENTION: Dashboard refresh alerts are never captured
    if (this.isDashboardRefreshAlert(message)) {
      return; // Do not capture, process, store, or make available
    }
    const entry = this.createLogEntry(
      LogLevel.WARN,
      message,
      component,
      details
    );
    await this.writeLog(entry);
  }

  async info(message: string, component?: string, details?: any) {
    // COMPLETE PREVENTION: Dashboard refresh alerts are never captured
    if (this.isDashboardRefreshAlert(message)) {
      return; // Do not capture, process, store, or make available
    }
    const entry = this.createLogEntry(
      LogLevel.INFO,
      message,
      component,
      details
    );
    await this.writeLog(entry);
  }

  async debug(message: string, component?: string, details?: any) {
    // COMPLETE PREVENTION: Dashboard refresh alerts are never captured
    if (this.isDashboardRefreshAlert(message)) {
      return; // Do not capture, process, store, or make available
    }
    const entry = this.createLogEntry(
      LogLevel.DEBUG,
      message,
      component,
      details
    );
    await this.writeLog(entry);
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  // Get logs by component
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter((log) => log.component === component);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.clearDbCache();
  }

  // Clear database cache
  clearDbCache() {
    this.dbLogsCache = [];
    this.lastDbFetch = 0;
  }

  // Export logs as JSON for analysis
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Get all logs (including console logs)
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Method to manually log from components
  logFromComponent(
    level: LogLevel,
    message: string,
    component: string,
    data?: any
  ) {
    this.writeLog(this.createLogEntry(level, message, component, data));
  }

  // Capture uncaught JavaScript errors
  private initializeGlobalErrorCapture(): void {
    // Capture uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      const message = event.message || 'Uncaught JavaScript Error';
      const source = this.detectMessageSource(message, []);
      const tags = this.generateMessageTags(message, [], LogLevel.ERROR);
      const category = this.categorizeMessage(message);

      this.captureConsoleLog(LogLevel.ERROR, [message], source);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason?.toString() || 'Unhandled Promise Rejection';
      const source = this.detectMessageSource(reason, []);
      const tags = this.generateMessageTags(reason, [], LogLevel.ERROR);
      const category = this.categorizeMessage(reason);

      this.captureConsoleLog(LogLevel.ERROR, [reason], source);
    });

    // Capture Next.js route errors
    if (typeof window !== 'undefined' && (window as any).next) {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function (...args) {
        try {
          return originalPushState.apply(this, args);
        } catch (error) {
          const message = `Route navigation error: ${(error as Error).message}`;
          logger.captureConsoleLog(LogLevel.ERROR, [message], 'next-router');
          throw error;
        }
      };

      history.replaceState = function (...args) {
        try {
          return originalReplaceState.apply(this, args);
        } catch (error) {
          const message = `Route replace error: ${(error as Error).message}`;
          logger.captureConsoleLog(LogLevel.ERROR, [message], 'next-router');
          throw error;
        }
      };
    }
  }

  // Enhanced debugging summary for developers
  async getDebugSummary(includeFullContext: boolean = false): Promise<any> {
    const userInfo = await this.getCurrentUserInfo();
    const deviceInfo = this.getDeviceInfo();
    const contextInfo = this.getContextInfo();
    const networkInfo = this.getNetworkInfo();
    const browserCapabilities = this.getBrowserCapabilities();
    const clientMetrics = this.getClientMetrics();
    const engagementMetrics = this.getUserEngagementMetrics();

    const summary = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',

      // Essential context
      user: userInfo,
      environment: {
        platform: deviceInfo?.platform,
        browser: deviceInfo?.browser,
        online: networkInfo?.online,
        connectionType: networkInfo?.connectionType
      },

      // Performance snapshot
      performance: {
        memoryUsage: clientMetrics?.usedMemory,
        pageLoadTime: clientMetrics?.pageLoadComplete,
        resourceCount: clientMetrics?.resources
      },

      // User behavior
      engagement: engagementMetrics,

      // Recent activity
      recentLogs: this.logs.slice(-10).map((log) => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        component: log.component,
        severity: log.severity
      }))
    };

    if (includeFullContext) {
      return {
        ...summary,
        fullContext: {
          deviceInfo,
          contextInfo,
          networkInfo,
          browserCapabilities,
          clientMetrics
        },
        allLogs: this.logs
      };
    }

    return summary;
  }

  // Enhanced error reporting with full context
  async reportCriticalIssue(
    description: string,
    additionalData?: any
  ): Promise<void> {
    const debugSummary = await this.getDebugSummary(true);

    await this.error(
      `CRITICAL ISSUE REPORT: ${description}`,
      'Critical-Issue-Reporter',
      {
        reportedAt: new Date().toISOString(),
        additionalData,
        fullDebugContext: debugSummary,
        automaticDiagnostics: {
          suspectedCauses: this.analyzePotentialCauses(debugSummary),
          recommendedActions: this.getRecommendedActions(debugSummary)
        }
      }
    );
  }

  private analyzePotentialCauses(debugSummary: any): string[] {
    const causes: string[] = [];

    if (!debugSummary.environment.online) {
      causes.push('Network connectivity issues');
    }

    if (debugSummary.performance.memoryUsage > 50000000) {
      // 50MB
      causes.push('High memory usage may be causing performance issues');
    }

    if (debugSummary.performance.pageLoadTime > 5000) {
      // 5 seconds
      causes.push('Slow page load times detected');
    }

    if (debugSummary.engagement.bounceRate === 1) {
      causes.push(
        'User may be experiencing usability issues (high bounce rate)'
      );
    }

    const errorLogs = debugSummary.recentLogs.filter(
      (log: any) => log.level === 'error'
    );
    if (errorLogs.length > 3) {
      causes.push('Multiple recent errors detected');
    }

    return causes.length > 0
      ? causes
      : ['Unknown - requires manual investigation'];
  }

  private getRecommendedActions(debugSummary: any): string[] {
    const actions: string[] = [];

    if (!debugSummary.environment.online) {
      actions.push('Check internet connection and retry');
    }

    if (debugSummary.performance.memoryUsage > 50000000) {
      actions.push('Consider refreshing the page to clear memory');
    }

    if (!debugSummary.user?.id) {
      actions.push('User authentication may need to be verified');
    }

    actions.push('Contact support with this debug report if issue persists');

    return actions;
  }

  // ...existing methods...
}

// Singleton instance
export const logger = new Logger();

// Enhanced logging helpers with full context capture
export const enhancedLogger = {
  // Log with automatic web address and full context
  async logWithFullContext(
    level: LogLevel,
    message: string,
    component?: string,
    data?: any
  ) {
    const currentUrl =
      typeof window !== 'undefined' ? window.location.href : 'N/A';
    const enhancedMessage = `[${currentUrl}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        await logger.error(enhancedMessage, component, data);
        break;
      case LogLevel.WARN:
        await logger.warn(enhancedMessage, component, data);
        break;
      case LogLevel.INFO:
        await logger.info(enhancedMessage, component, data);
        break;
      case LogLevel.DEBUG:
        await logger.debug(enhancedMessage, component, data);
        break;
    }
  },

  // Quick debug snapshot
  async debugSnapshot(description: string, includeFullData: boolean = false) {
    const summary = await logger.getDebugSummary(includeFullData);
    console.group(`🔍 Debug Snapshot: ${description}`);
    console.log('📊 Summary:', summary);
    console.log('🌐 Current URL:', summary.currentUrl);
    console.log('👤 User:', summary.user);
    console.log('⚡ Performance:', summary.performance);
    console.log('📈 Engagement:', summary.engagement);
    console.groupEnd();

    await logger.info(
      `Debug snapshot: ${description}`,
      'Enhanced-Logger',
      summary
    );
  },

  // Report issue with full diagnostic data
  async reportIssue(title: string, description: string, additionalData?: any) {
    await logger.reportCriticalIssue(
      `${title}: ${description}`,
      additionalData
    );
  },

  // Track user journey with context
  async trackJourneyStep(stepName: string, stepData?: any) {
    const currentUrl =
      typeof window !== 'undefined' ? window.location.href : 'N/A';
    const context = {
      step: stepName,
      url: currentUrl,
      timestamp: new Date().toISOString(),
      data: stepData
    };

    await logger.info(`Journey Step: ${stepName}`, 'User-Journey', context);
  }
};

// OAuth-specific logging helpers
export const oauthLogger = {
  error: async (message: string, data?: any, error?: Error) => {
    const details = { data, error };
    await logger.error(message, 'OAuth', details);
  },

  warn: async (message: string, data?: any) =>
    await logger.warn(message, 'OAuth', data),

  info: async (message: string, data?: any) =>
    await logger.info(message, 'OAuth', data),

  debug: async (message: string, data?: any) =>
    await logger.debug(message, 'OAuth', data)
};

// Auth-specific logging helpers
export const authLogger = {
  error: async (message: string, data?: any, error?: Error) => {
    const details = { data, error };
    await logger.error(message, 'Auth', details);
  },

  warn: async (message: string, data?: any) =>
    await logger.warn(message, 'Auth', data),

  info: async (message: string, data?: any) =>
    await logger.info(message, 'Auth', data),

  debug: async (message: string, data?: any) =>
    await logger.debug(message, 'Auth', data)
};

/*
 * ENHANCED LOGGING USAGE EXAMPLES:
 *
 * // Basic logging with automatic URL capture
 * await enhancedLogger.logWithFullContext(LogLevel.ERROR, 'Payment failed', 'Checkout', errorData);
 *
 * // Quick debugging snapshot
 * await enhancedLogger.debugSnapshot('User authentication issue');
 *
 * // Report critical issue with full diagnostic data
 * await enhancedLogger.reportIssue('Payment Processing', 'Credit card validation failed', { cardType, amount });
 *
 * // Track user journey
 * await enhancedLogger.trackJourneyStep('Started checkout process', { productId, quantity });
 *
 * // Get full debug context
 * const fullContext = await logger.getDebugSummary(true);
 * console.log('Full diagnostic data:', fullContext);
 *
 * // OAuth specific logging
 * await oauthLogger.error('Token refresh failed', { tokenExpiry, attemptCount }, refreshError);
 * await authLogger.warn('Multiple login attempts detected', { attempts, timeWindow });
 *
 * CAPTURED DATA INCLUDES:
 * ✅ Exact web address/URL where issue occurred
 * ✅ User information and authentication state
 * ✅ Device and browser capabilities
 * ✅ Network connection details
 * ✅ Page performance metrics
 * ✅ User engagement and interaction data
 * ✅ Memory usage and resource loading
 * ✅ Error stack traces with source mapping
 * ✅ User journey and action history
 * ✅ Session duration and page timing
 * ✅ Scroll depth and click tracking
 * ✅ Viewport size and screen resolution
 * ✅ Browser feature support detection
 * ✅ Automatic error categorization
 * ✅ Layman explanations for technical issues
 * ✅ Suggested troubleshooting actions
 */
