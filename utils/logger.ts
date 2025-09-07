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
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
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
  data?: any;
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
  };
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private originalConsole: any = {};
  private isIntercepting = false;
  private sessionId: string;
  private supabase = createClient();
  
  // Performance optimizations
  private dbLogsCache: LogEntry[] = [];
  private lastDbFetch: number = 0;
  private cacheTimeout: number = 30000; // 30 seconds cache
  private isDbLoading: boolean = false;
  private dbLoadPromise: Promise<LogEntry[]> | null = null;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupConsoleInterception();
    
    // Initialize global error capture on the client side
    if (typeof window !== 'undefined') {
      this.initializeGlobalErrorCapture();
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
      const { data: { user } } = await this.supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  // Enhanced user information collection
  private async getCurrentUserInfo(): Promise<any> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || user.app_metadata?.role || 'user',
        displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
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
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';

    // Detect mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

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

  private getBrowserVersion(ua: string): string {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  // Collect performance information
  private getPerformanceInfo(): any {
    if (typeof window === 'undefined' || !window.performance) return null;

    const memory = (performance as any).memory;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : null, // MB
      loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : null, // ms
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
      userJourney: this.detectUserJourney()
    };
  }

  private detectCurrentFeature(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const path = window.location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/auth') || path.includes('/signin') || path.includes('/login')) return 'Authentication';
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
        this.captureConsoleLog(LogLevel.DEBUG, args, 'Console');
        this.originalConsole.debug(...args);
      };
    }
  }

  private captureConsoleLog(level: LogLevel, args: any[], defaultComponent: string) {
    try {
      // Performance: Early exit for logs dashboard to prevent recursive logging
      if (typeof window !== 'undefined' && window.location.pathname.includes('/logs-dashboard')) {
        return; // Skip all dashboard logging to prevent performance issues
      }
      
      // Convert console arguments to a readable message (more efficient)
      const message = args.length === 1 && typeof args[0] === 'string' 
        ? args[0] 
        : args.map(arg => {
            if (typeof arg === 'string') return arg;
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg);
              } catch {
                return '[Circular Object]';
              }
            }
            return String(arg);
          }).join(' ');
      
      // Performance: Skip empty or very short messages
      if (!message || message.length < 3) return;

      // Enhanced component detection and tagging
      const component = this.detectMessageSource(message, args);
      const tags = this.generateMessageTags(message, args, level);

      // Extract any error objects for stack traces
      const error = args.find(arg => arg instanceof Error);

      // Safely serialize arguments to prevent circular reference issues
      const safeArgs = this.safeSerializeArgs(args);

      this.writeLog(this.createLogEntry(level, message, component, {
        originalArgs: safeArgs,
        tags: tags,
        messageType: this.categorizeMessage(message),
        source: this.detectThirdPartySource(message)
      }, error));
    } catch (err) {
      // Fallback to prevent infinite loops
      this.originalConsole.error('Logger error:', err);
    }
  }

  // Safe serialization to prevent circular reference errors
  private safeSerializeArgs(args: any[]): any {
    try {
      return args.map(arg => {
        if (arg === null || arg === undefined) return arg;
        if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') return arg;
        if (arg instanceof Error) {
          return {
            name: arg.name,
            message: arg.message,
            stack: arg.stack
          };
        }
        if (typeof arg === 'object') {
          // Check if it's a DOM element
          if (arg.nodeType && arg.nodeName) {
            return `[DOM Element: ${arg.nodeName}]`;
          }
          // Check if it's an HTMLElement
          if (arg instanceof HTMLElement) {
            return `[HTML Element: ${arg.tagName}]`;
          }
          // Check if it's a React component or has React Fiber properties
          if (arg._reactInternalFiber || arg.__reactFiber || 
              (arg.constructor && arg.constructor.name && 
               (arg.constructor.name.includes('Fiber') || arg.constructor.name.includes('React')))) {
            return '[React Component/Fiber]';
          }
          // Check for React Fiber properties in object keys
          const objectKeys = Object.keys(arg);
          if (objectKeys.some(key => key.includes('__reactFiber') || key.includes('_reactInternalFiber'))) {
            return '[React Fiber Object]';
          }
          // Try to safely serialize the object
          try {
            return JSON.parse(JSON.stringify(arg));
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


  // Enhanced message source detection
  private detectMessageSource(message: string, args: any[]): string {
    // Check for Next.js specific messages
    if (message.includes('[Fast Refresh]') || message.includes('Fast Refresh')) {
      return 'Next.js-HMR';
    }
    if (message.includes('Compiled') || message.includes('compiling')) {
      return 'Next.js-Build';
    }
    
    // Check for authentication/OAuth related
    if (message.includes('OAuth') || message.includes('auth') || message.includes('token') || message.includes('login')) {
      return 'Auth-System';
    }
    
    // Check for routing related
    if (message.includes('Route') || message.includes('router') || message.includes('navigation')) {
      return 'Routing';
    }
    
    // Check for API related
    if (message.includes('fetch') || message.includes('API') || message.includes('request')) {
      return 'API-Client';
    }
    
    // Check for database related
    if (message.includes('database') || message.includes('supabase') || message.includes('sql')) {
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
  private generateMessageTags(message: string, args: any[], level: LogLevel): string[] {
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
    if (message.includes('security') || message.includes('auth') || message.includes('token')) {
      tags.push('security');
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('request')) {
      tags.push('network');
    }
    if (message.includes('database') || message.includes('sql') || message.includes('query')) {
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
    if (message.includes('fetch') || message.includes('network') || message.includes('CORS')) {
      return 'network-request';
    }
    if (message.includes('OAuth') || message.includes('auth') || message.includes('token')) {
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
    if (message.includes('Google') || message.includes('googleapis') || message.includes('gapi')) {
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
    if (message.includes('analytics') || message.includes('gtag') || message.includes('ga.js')) {
      return 'Analytics-Service';
    }
    
    // CDN or external scripts
    if (message.includes('cdn.') || message.includes('unpkg.') || message.includes('jsdelivr.')) {
      return 'CDN-Resource';
    }
    
    // Browser APIs or extensions
    if (message.includes('chrome-extension') || message.includes('moz-extension')) {
      return 'Browser-Extension';
    }
    
    return 'App';
  }

  // Generate layman's terms explanation for technical messages
  private generateLaymanExplanation(message: string, level: LogLevel, component?: string): string {
    const lowerMessage = message.toLowerCase();

    // Authentication/Login errors
    if (lowerMessage.includes('auth') || lowerMessage.includes('token') || lowerMessage.includes('unauthorized')) {
      if (level === LogLevel.ERROR) {
        return "There was a problem signing you in or keeping you signed in. You might need to log in again.";
      }
      return "The app is working on your login status. This usually resolves automatically.";
    }

    // Network/Connection errors
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('timeout') || lowerMessage.includes('cors')) {
      if (level === LogLevel.ERROR) {
        return "The app couldn't connect to our servers. Please check your internet connection and try again.";
      }
      return "The app is communicating with our servers. Some features might be slower than usual.";
    }

    // Database errors
    if (lowerMessage.includes('database') || lowerMessage.includes('sql') || lowerMessage.includes('supabase')) {
      if (level === LogLevel.ERROR) {
        return "There was a problem saving or loading your data. Your information is safe, but some features might not work properly.";
      }
      return "The app is working with your data. Everything should work normally.";
    }

    // Build/Compilation errors (development)
    if (lowerMessage.includes('compiled') || lowerMessage.includes('[fast refresh]') || lowerMessage.includes('webpack')) {
      return "The development team is updating the app. You might see this message while we're making improvements.";
    }

    // React/Component errors
    if (lowerMessage.includes('react') || lowerMessage.includes('component') || lowerMessage.includes('hook') || lowerMessage.includes('hydration')) {
      if (level === LogLevel.ERROR) {
        return "A part of the app interface had trouble loading. Try refreshing the page if something doesn't look right.";
      }
      return "The app is setting up the page you're viewing. This is normal and usually happens quickly.";
    }

    // Performance issues
    if (lowerMessage.includes('slow') || lowerMessage.includes('performance') || lowerMessage.includes('memory')) {
      return "The app is running a bit slower than usual. This might be due to your device or internet connection.";
    }

    // Permission/Security issues
    if (lowerMessage.includes('permission') || lowerMessage.includes('security') || lowerMessage.includes('blocked')) {
      if (level === LogLevel.ERROR) {
        return "You don't have permission to do that action, or there's a security restriction in place.";
      }
      return "The app is checking your permissions to make sure everything is secure.";
    }

    // Payment/Stripe errors
    if (lowerMessage.includes('stripe') || lowerMessage.includes('payment')) {
      if (level === LogLevel.ERROR) {
        return "There was a problem processing your payment. Please check your payment information and try again.";
      }
      return "The app is processing payment information. This is secure and normal.";
    }

    // General error types by level
    switch (level) {
      case LogLevel.ERROR:
        return "Something went wrong with the app. Try refreshing the page or contact support if the problem continues.";
      case LogLevel.WARN:
        return "The app noticed something unusual but is handling it. You can continue using the app normally.";
      case LogLevel.INFO:
        return "The app is working normally and keeping track of what's happening.";
      case LogLevel.DEBUG:
        return "Technical information for developers. This doesn't affect your experience.";
      default:
        return "The app is running and monitoring its performance.";
    }
  }

  // Determine severity and impact
  private getSeverityAndImpact(message: string, level: LogLevel): { severity: string; impact: string; suggestedAction: string } {
    const lowerMessage = message.toLowerCase();

    // Critical issues
    if (level === LogLevel.ERROR && (
      lowerMessage.includes('auth') || 
      lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('payment') ||
      lowerMessage.includes('data loss') ||
      lowerMessage.includes('security')
    )) {
      return {
        severity: 'critical',
        impact: 'User cannot access account or complete important actions',
        suggestedAction: 'Contact support immediately or try logging in again'
      };
    }

    // High priority issues
    if (level === LogLevel.ERROR && (
      lowerMessage.includes('network') ||
      lowerMessage.includes('database') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('timeout')
    )) {
      return {
        severity: 'high',
        impact: 'Some features may not work properly or data may not save',
        suggestedAction: 'Check internet connection and refresh the page'
      };
    }

    // Medium priority issues
    if (level === LogLevel.ERROR || (level === LogLevel.WARN && lowerMessage.includes('performance'))) {
      return {
        severity: 'medium',
        impact: 'App functionality may be reduced or slower than normal',
        suggestedAction: 'Continue using the app, but watch for additional problems'
      };
    }

    // Low priority issues
    if (level === LogLevel.WARN) {
      return {
        severity: 'low',
        impact: 'Minor issue that doesn\'t affect main functionality',
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
    
    // Generate layman's explanation and severity info
    const laymanExplanation = this.generateLaymanExplanation(message, level, component);
    const { severity, impact, suggestedAction } = this.getSeverityAndImpact(message, level);

    // Track user action for journey mapping
    if (typeof window !== 'undefined') {
      const currentActions = JSON.parse(sessionStorage.getItem('userActions') || '[]');
      currentActions.push({
        timestamp: new Date().toISOString(),
        action: component || 'unknown',
        url: window.location.href
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
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
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
      contextInfo
    };
  }

  private async writeLog(entry: LogEntry | Promise<LogEntry>) {
    const resolvedEntry = await entry;
    this.logs.push(resolvedEntry);
    
    // Keep only last 500 logs in memory (reduced from 1000)
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(-500);
    }

    // Check for auto-review triggers (only for errors)
    if (resolvedEntry.level === LogLevel.ERROR) {
      this.checkForAutoReview();
    }

    // Persist to database asynchronously with throttling
    this.throttledPersistToDatabase(resolvedEntry);

    // Simplified console output in development
    if (this.isDev && resolvedEntry.level !== LogLevel.DEBUG) { // Skip debug logs in dev
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
    
    // Clear existing timeout
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
    }
    
    // Batch database writes every 2 seconds or when we have 10+ logs
    this.persistTimeout = setTimeout(() => {
      if (this.pendingLogs.length > 0) {
        this.batchPersistToDatabase([...this.pendingLogs]);
        this.pendingLogs = [];
      }
    }, this.pendingLogs.length >= 10 ? 100 : 2000);
  }

  private async batchPersistToDatabase(entries: LogEntry[]) {
    try {
      const userId = await this.getCurrentUserId();
      
      const insertData = entries.map(entry => ({
        user_id: userId,
        session_id: entry.sessionId,
        level: entry.level,
        message: entry.message,
        component: entry.component,
        data: this.safeSerializeForDatabase(entry.data),
        stack_trace: entry.stack,
        user_agent: entry.userAgent,
        url: entry.url,
        timestamp: entry.timestamp
        // Omitting 'side' column to avoid database errors
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
        console.log(`✅ Batch of ${entries.length} logs persisted to database`);
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
          timestamp: entry.timestamp
          // Omitting 'side' column to avoid database errors
        });

      if (error) {
        console.error('❌ Database logging error:', {
          error: error,
          message: entry.message.substring(0, 50) + '...'
        });
        throw error;
      } else {
        console.log('✅ Log persisted to database:', entry.message.substring(0, 50) + '...');
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
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (seen.has(obj)) return '[Circular Reference]';
    seen.add(obj);
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeCircularReferences(item, seen));
    }
    
    // Handle DOM elements
    if (obj.nodeType && obj.nodeName) {
      return `[DOM Element: ${obj.nodeName}]`;
    }
    
    // Handle React components/fibers - Enhanced detection
    if (obj._reactInternalFiber || obj.__reactFiber || 
        (obj.constructor && obj.constructor.name && 
         (obj.constructor.name.includes('Fiber') || obj.constructor.name.includes('React')))) {
      return '[React Component/Fiber]';
    }
    
    // Check for React Fiber properties in object keys
    const objectKeys = Object.keys(obj);
    if (objectKeys.some(key => key.includes('__reactFiber') || key.includes('_reactInternalFiber'))) {
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
  async loadLogsFromDatabase(limit: number = 100, timeRangeMs?: number): Promise<LogEntry[]> {
    // Skip cache if we have a time range filter
    if (timeRangeMs) {
      return this.fetchLogsFromDatabase(limit, timeRangeMs);
    }

    // Return cached results if recent enough (only for non-filtered requests)
    const now = Date.now();
    if (this.dbLogsCache.length > 0 && (now - this.lastDbFetch) < this.cacheTimeout) {
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

  private async fetchLogsFromDatabase(limit: number, timeRangeMs?: number): Promise<LogEntry[]> {
    try {
      let query = (this.supabase as any)
        .from('application_logs')
        .select('id, user_id, session_id, level, message, component, data, stack_trace, user_agent, url, timestamp, created_at')
        .order('timestamp', { ascending: false });

      // Apply time range filter if specified
      if (timeRangeMs) {
        const cutoffTime = new Date(Date.now() - timeRangeMs).toISOString();
        query = query.gte('timestamp', cutoffTime);
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }

      return data?.map((row: any) => ({
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
        side: 'client' // Default to 'client' since side column doesn't exist yet
      })) || [];
    } catch (error) {
      console.error('❌ Database fetch failed:', {
        errorMessage: (error as any)?.message || 'Unknown error',
        errorCode: (error as any)?.code || 'NO_CODE',
        errorDetails: (error as any)?.details || 'No details'
      });
      return [];
    }
  }

  // Optimized method to get combined logs with better performance
  async getAllLogsIncludingDatabase(limit: number = 100, timeRangeMs?: number): Promise<LogEntry[]> {
    try {
      // Get database logs (with optional time filtering)
      const dbLogs = await this.loadLogsFromDatabase(limit, timeRangeMs);
      
      // Get recent memory logs (apply time filter if specified)
      let recentMemoryLogs = this.logs;
      
      if (timeRangeMs) {
        const cutoff = Date.now() - timeRangeMs;
        recentMemoryLogs = this.logs.filter(log => new Date(log.timestamp).getTime() > cutoff);
      } else {
        // Only get recent memory logs if no time filter (to avoid duplicates)
        const cutoff = Date.now() - (5 * 60 * 1000); // Last 5 minutes
        recentMemoryLogs = this.logs.filter(log => {
          const logTime = new Date(log.timestamp).getTime();
          return logTime > cutoff;
        });
      }
      
      // Combine and deduplicate more efficiently
      const logMap = new Map<string, LogEntry>();
      
      // Add database logs first
      dbLogs.forEach(log => {
        const key = `${log.timestamp}-${log.message}-${log.component}`;
        logMap.set(key, log);
      });
      
      // Add memory logs (will overwrite duplicates)
      recentMemoryLogs.forEach(log => {
        const key = `${log.timestamp}-${log.message}-${log.component}`;
        logMap.set(key, log);
      });
      
      // Convert back to array and sort
      const allLogs = Array.from(logMap.values());
      return allLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
        
    } catch (error) {
      this.originalConsole?.error?.('❌ Failed to get combined logs:', error);
      // Fallback to memory logs only
      let fallbackLogs = this.logs;
      if (timeRangeMs) {
        const cutoff = Date.now() - timeRangeMs;
        fallbackLogs = this.logs.filter(log => new Date(log.timestamp).getTime() > cutoff);
      }
      return fallbackLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }
  }

  // Trigger automatic review after high error activity
  private checkForAutoReview() {
    const recentErrors = this.logs.filter(log => 
      log.level === LogLevel.ERROR && 
      new Date(log.timestamp) > new Date(Date.now() - 2 * 60 * 1000) // Last 2 minutes
    );

    // If we have 3+ errors in 2 minutes, suggest review
    if (recentErrors.length >= 3) {
      console.log('🚨 HIGH ERROR ACTIVITY DETECTED');
      console.log('💡 Consider running automated log analysis to identify issues');
      console.log('🔗 Visit /auto-log-review to see detailed analysis');
    }
  }

  async error(message: string, component?: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, component, details);
    await this.writeLog(entry);
  }

  async warn(message: string, component?: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, component, details);
    await this.writeLog(entry);
  }

  async info(message: string, component?: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, component, details);
    await this.writeLog(entry);
  }

  async debug(message: string, component?: string, details?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, component, details);
    await this.writeLog(entry);
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by component
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter(log => log.component === component);
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
  logFromComponent(level: LogLevel, message: string, component: string, data?: any) {
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
      
      history.pushState = function(...args) {
        try {
          return originalPushState.apply(this, args);
        } catch (error) {
          const message = `Route navigation error: ${(error as Error).message}`;
          logger.captureConsoleLog(LogLevel.ERROR, [message], 'next-router');
          throw error;
        }
      };
      
      history.replaceState = function(...args) {
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

  // ...existing methods...
}

// Singleton instance
export const logger = new Logger();

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
    await logger.debug(message, 'OAuth', data),
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
    await logger.debug(message, 'Auth', data),
};
