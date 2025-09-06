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

  private captureConsoleLog(level: LogLevel, args: any[], component: string) {
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

      // Extract any error objects for stack traces
      const error = args.find(arg => arg instanceof Error);

      this.writeLog(this.createLogEntry(level, message, component, args.length > 1 ? args : args[0], error));
    } catch (err) {
      // Fallback to prevent infinite loops
      this.originalConsole.error('Logger error:', err);
    }
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
  
  private createLogEntry(
    level: LogLevel, 
    message: string, 
    component?: string, 
    data?: any,
    error?: Error
  ): LogEntry {
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
      side: 'client' // Mark all client-side logger entries as client
    };
  }

  private async writeLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only last 500 logs in memory (reduced from 1000)
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(-500);
    }

    // Check for auto-review triggers (only for errors)
    if (entry.level === LogLevel.ERROR) {
      this.checkForAutoReview();
    }

    // Persist to database asynchronously with throttling
    this.throttledPersistToDatabase(entry);

    // Simplified console output in development
    if (this.isDev && entry.level !== LogLevel.DEBUG) { // Skip debug logs in dev
      const emoji = {
        [LogLevel.ERROR]: '❌',
        [LogLevel.WARN]: '⚠️',
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.DEBUG]: '🐛'
      };

      const prefix = `${emoji[entry.level]} [${entry.component || 'APP'}]`;
      
      switch (entry.level) {
        case LogLevel.ERROR:
          this.originalConsole?.error?.(prefix, entry.message);
          break;
        case LogLevel.WARN:
          this.originalConsole?.warn?.(prefix, entry.message);
          break;
        default:
          this.originalConsole?.info?.(prefix, entry.message);
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
        data: entry.data,
        stack_trace: entry.stack,
        user_agent: entry.userAgent,
        url: entry.url,
        timestamp: entry.timestamp,
        side: entry.side || 'client'
      }));

      const { error } = await (this.supabase as any)
        .from('application_logs')
        .insert(insertData);

      if (error) {
        throw error;
      }
    } catch (error) {
      // Silently fail database writes to avoid impacting app performance
      this.originalConsole?.error?.('❌ Batch database write failed:', error);
    }
  }

  private async persistToDatabase(entry: LogEntry) {
    try {
      const userId = await this.getCurrentUserId();
      
      // Since this is using the same database as before, side column should exist
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
          side: entry.side || 'client' // Should work since database has this column
        });

      if (error) {
        console.error('❌ Database logging error:', error);
        throw error;
      }
    } catch (error) {
      // Log database write errors to console for debugging
      console.error('❌ Failed to persist log to database:', error);
      // Silently fail database writes to avoid impacting app performance
      // For now, we'll just keep logs in memory
    }
  }

  // Optimized method to load logs from database with caching
  async loadLogsFromDatabase(limit: number = 100): Promise<LogEntry[]> {
    // Return cached results if recent enough
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
    this.dbLoadPromise = this.fetchLogsFromDatabase(limit);

    try {
      const logs = await this.dbLoadPromise;
      this.dbLogsCache = logs;
      this.lastDbFetch = now;
      return logs;
    } catch (error) {
      return [];
    } finally {
      this.isDbLoading = false;
      this.dbLoadPromise = null;
    }
  }

  private async fetchLogsFromDatabase(limit: number): Promise<LogEntry[]> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('application_logs')
        .select('id, user_id, session_id, level, message, component, data, stack_trace, user_agent, url, timestamp, side')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

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
        side: row.side || 'client'
      })) || [];
    } catch (error) {
      this.originalConsole?.error?.('❌ Database fetch failed:', error);
      return [];
    }
  }

  // Optimized method to get combined logs with better performance
  async getAllLogsIncludingDatabase(limit: number = 100): Promise<LogEntry[]> {
    try {
      // Get database logs (cached if possible)
      const dbLogs = await this.loadLogsFromDatabase(limit);
      
      // Get recent memory logs (only recent ones to avoid duplicates)
      const recentMemoryLogs = this.logs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const cutoff = Date.now() - (5 * 60 * 1000); // Last 5 minutes
        return logTime > cutoff;
      });
      
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
      return this.logs
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

  error(message: string, component?: string, data?: any, error?: Error) {
    this.writeLog(this.createLogEntry(LogLevel.ERROR, message, component, data, error));
  }

  warn(message: string, component?: string, data?: any) {
    this.writeLog(this.createLogEntry(LogLevel.WARN, message, component, data));
  }

  info(message: string, component?: string, data?: any) {
    this.writeLog(this.createLogEntry(LogLevel.INFO, message, component, data));
  }

  debug(message: string, component?: string, data?: any) {
    this.writeLog(this.createLogEntry(LogLevel.DEBUG, message, component, data));
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
}

// Singleton instance
export const logger = new Logger();

// OAuth-specific logging helpers
export const oauthLogger = {
  error: (message: string, data?: any, error?: Error) => 
    logger.error(message, 'OAuth', data, error),
  
  warn: (message: string, data?: any) => 
    logger.warn(message, 'OAuth', data),
  
  info: (message: string, data?: any) => 
    logger.info(message, 'OAuth', data),
  
  debug: (message: string, data?: any) => 
    logger.debug(message, 'OAuth', data),
};

// Auth-specific logging helpers
export const authLogger = {
  error: (message: string, data?: any, error?: Error) => 
    logger.error(message, 'Auth', data, error),
  
  warn: (message: string, data?: any) => 
    logger.warn(message, 'Auth', data),
  
  info: (message: string, data?: any) => 
    logger.info(message, 'Auth', data),
  
  debug: (message: string, data?: any) => 
    logger.debug(message, 'Auth', data),
};
