// Server-side logging utility for API routes and server components
import { createClient } from '@/utils/supabase/server';
import { LogLevel, LogEntry } from './logger';
import { cookies } from 'next/headers';

class ServerLogger {
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `server_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  private createLogEntry(level: LogLevel, message: string, component?: string, data?: any, error?: Error): LogEntry {
    return {
      sessionId: this.sessionId,
      level,
      message,
      component: component || 'Server',
      data: data || undefined,
      stack: error?.stack || undefined,
      userAgent: undefined, // Not available on server
      url: undefined, // Could be passed in if needed
      timestamp: new Date().toISOString(),
      side: 'server' // Mark all server-side logger entries as server
    };
  }

  private async writeLogToDatabase(entry: LogEntry) {
    try {
      const userId = await this.getCurrentUserId();
      const supabase = await createClient();
      
      const { error } = await (supabase as any)
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
          side: entry.side || 'server' // Explicitly mark as server
        });

      if (error) {
        console.error('❌ Failed to save server log to database:', error);
        throw error;
      }
      
      console.log(`✅ Server log saved: [${entry.level.toUpperCase()}] ${entry.message}`);
    } catch (error) {
      // Always output to console as fallback, but don't block the process
      console.error('❌ Server database logging failed:', error);
      console.log(`📝 [${entry.level.toUpperCase()}] ${entry.message}`, entry.data);
    }
  }

  // Fire-and-forget logging methods that don't block execution
  error(message: string, component?: string, data?: any, error?: Error) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, component, data, error);
    // Fire and forget - don't await
    this.writeLogToDatabase(entry).catch(() => {
      // Fallback logging if database fails
      console.error(`🚨 [SERVER ERROR] ${message}`, data);
    });
    // Immediate console logging for development
    console.error(`🚨 [SERVER ERROR] ${message}`, data);
  }

  warn(message: string, component?: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, component, data);
    this.writeLogToDatabase(entry).catch(() => {
      console.warn(`⚠️ [SERVER WARN] ${message}`, data);
    });
    console.warn(`⚠️ [SERVER WARN] ${message}`, data);
  }

  info(message: string, component?: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, component, data);
    this.writeLogToDatabase(entry).catch(() => {
      console.info(`ℹ️ [SERVER INFO] ${message}`, data);
    });
    console.info(`ℹ️ [SERVER INFO] ${message}`, data);
  }

  debug(message: string, component?: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, component, data);
    this.writeLogToDatabase(entry).catch(() => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`🔍 [SERVER DEBUG] ${message}`, data);
      }
    });
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🔍 [SERVER DEBUG] ${message}`, data);
    }
  }
}

// Singleton instance for server-side use
export const serverLogger = new ServerLogger();

// Server-side auth logging helpers
export const serverAuthLogger = {
  error: (message: string, data?: any, error?: Error) => 
    serverLogger.error(message, 'Auth', data, error),
  
  warn: (message: string, data?: any) => 
    serverLogger.warn(message, 'Auth', data),
  
  info: (message: string, data?: any) => 
    serverLogger.info(message, 'Auth', data),
  
  debug: (message: string, data?: any) => 
    serverLogger.debug(message, 'Auth', data),
};

// Server-side OAuth logging helpers
export const serverOAuthLogger = {
  error: (message: string, data?: any, error?: Error) => 
    serverLogger.error(message, 'OAuth', data, error),
  
  warn: (message: string, data?: any) => 
    serverLogger.warn(message, 'OAuth', data),
  
  info: (message: string, data?: any) => 
    serverLogger.info(message, 'OAuth', data),
  
  debug: (message: string, data?: any) => 
    serverLogger.debug(message, 'OAuth', data),
};
