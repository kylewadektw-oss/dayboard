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


import { logger, LogLevel, LogEntry } from './logger';

export interface LogAnalysis {
  summary: {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    debugCount: number;
    timeRange: {
      start: string;
      end: string;
      duration: string;
    };
    topComponents: Array<{ component: string; count: number; percentage: number }>;
  };
  issues: {
    errors: LogEntry[];
    repeatedErrors: Array<{ message: string; count: number; locations: string[] }>;
    warnings: LogEntry[];
    performance: {
      highVolumeComponents: Array<{ component: string; logsPerMinute: number }>;
      suspiciousPatterns: string[];
    };
  };
  insights: {
    errorPatterns: string[];
    recommendations: string[];
    healthScore: number; // 0-100
  };
  oauth: {
    authEvents: LogEntry[];
    authErrors: LogEntry[];
    pkceIssues: LogEntry[];
    redirectIssues: LogEntry[];
    recommendations: string[];
  };
}

export class LogAnalyzer {
  
  async analyzeSession(sessionId?: string, timeRangeMinutes: number = 30): Promise<LogAnalysis> {
    // Get logs from the specified session or recent logs
    let logs: LogEntry[] = [];
    
    if (sessionId) {
      logs = await this.getSessionLogs(sessionId);
    } else {
      logs = await this.getRecentLogs(timeRangeMinutes);
    }

    return {
      summary: this.generateSummary(logs),
      issues: this.identifyIssues(logs),
      insights: this.generateInsights(logs),
      oauth: this.analyzeOAuthLogs(logs)
    };
  }

  /**
   * Get filtered logs for display purposes
   */
  async getFilteredLogs(level?: string, minutes: number = 30): Promise<LogEntry[]> {
    const logs = await this.getRecentLogs(minutes);
    
    if (!level || level === 'all') {
      return logs.slice(0, 100); // Limit for performance
    }
    
    return logs.filter(log => log.level === level).slice(0, 100);
  }

  private async getSessionLogs(sessionId: string): Promise<LogEntry[]> {
    try {
      // For now, get from memory logs that match session
      const allLogs = logger.getAllLogs();
      return allLogs.filter(log => log.sessionId === sessionId);
    } catch (error) {
      console.error('Failed to get session logs:', error);
      return [];
    }
  }

  private async getRecentLogs(minutes: number): Promise<LogEntry[]> {
    try {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
      const allLogs = await logger.getAllLogsIncludingDatabase();
      const recentLogs = allLogs.filter(log => new Date(log.timestamp) >= cutoffTime);
      
      // Limit each log level to 100 entries for better performance and focused analysis
      const limitedLogs: LogEntry[] = [];
      const limits = { error: 100, warn: 100, info: 100, debug: 100 };
      const counts = { error: 0, warn: 0, info: 0, debug: 0 };
      
      // Sort by timestamp (newest first) to get most recent logs
      const sortedLogs = recentLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      for (const log of sortedLogs) {
        const level = log.level.toLowerCase() as keyof typeof counts;
        if (counts[level] < limits[level]) {
          limitedLogs.push(log);
          counts[level]++;
        }
        
        // Stop if we've reached the total limit (400 logs max)
        if (limitedLogs.length >= 400) break;
      }
      
      // Sort back to chronological order for analysis
      return limitedLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get recent logs:', error);
      return logger.getAllLogs();
    }
  }

  private generateSummary(logs: LogEntry[]) {
    const errorCount = logs.filter(l => l.level === LogLevel.ERROR).length;
    const warningCount = logs.filter(l => l.level === LogLevel.WARN).length;
    const infoCount = logs.filter(l => l.level === LogLevel.INFO).length;
    const debugCount = logs.filter(l => l.level === LogLevel.DEBUG).length;

    // Calculate time range
    const timestamps = logs.map(l => new Date(l.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    const start = timestamps[0];
    const end = timestamps[timestamps.length - 1];
    const duration = start && end ? this.formatDuration(end.getTime() - start.getTime()) : 'N/A';

    // Top components
    const componentCounts = logs.reduce((acc, log) => {
      const comp = log.component || 'Unknown';
      acc[comp] = (acc[comp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topComponents = Object.entries(componentCounts)
      .map(([component, count]) => ({
        component,
        count,
        percentage: Math.round((count / logs.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalLogs: logs.length,
      errorCount,
      warningCount,
      infoCount,
      debugCount,
      timeRange: {
        start: start?.toLocaleString() || 'N/A',
        end: end?.toLocaleString() || 'N/A',
        duration
      },
      topComponents
    };
  }

  private identifyIssues(logs: LogEntry[]) {
    const errors = logs.filter(l => l.level === LogLevel.ERROR);
    const warnings = logs.filter(l => l.level === LogLevel.WARN);

    // Find repeated errors
    const errorMessages = errors.reduce((acc, error) => {
      const key = this.normalizeErrorMessage(error.message);
      if (!acc[key]) {
        acc[key] = { message: key, count: 0, locations: [] };
      }
      acc[key].count++;
      acc[key].locations.push(error.component || 'Unknown');
      return acc;
    }, {} as Record<string, { message: string; count: number; locations: string[] }>);

    const repeatedErrors = Object.values(errorMessages)
      .filter(e => e.count > 1)
      .sort((a, b) => b.count - a.count);

    // Performance analysis
    const componentActivity = logs.reduce((acc, log) => {
      const comp = log.component || 'Unknown';
      if (!acc[comp]) acc[comp] = [];
      acc[comp].push(new Date(log.timestamp));
      return acc;
    }, {} as Record<string, Date[]>);

    const highVolumeComponents = Object.entries(componentActivity)
      .map(([component, timestamps]) => {
        const timeSpan = Math.max(...timestamps.map(t => t.getTime())) - Math.min(...timestamps.map(t => t.getTime()));
        const minutes = timeSpan / (1000 * 60);
        const logsPerMinute = minutes > 0 ? Math.round(timestamps.length / minutes) : timestamps.length;
        return { component, logsPerMinute };
      })
      .filter(c => c.logsPerMinute > 5) // Flag components with >5 logs per minute
      .sort((a, b) => b.logsPerMinute - a.logsPerMinute);

    const suspiciousPatterns = this.detectSuspiciousPatterns(logs);

    return {
      errors,
      repeatedErrors,
      warnings,
      performance: {
        highVolumeComponents,
        suspiciousPatterns
      }
    };
  }

  private generateInsights(logs: LogEntry[]) {
    const errorPatterns = this.detectErrorPatterns(logs);
    const recommendations = this.generateRecommendations(logs);
    const healthScore = this.calculateHealthScore(logs);

    return {
      errorPatterns,
      recommendations,
      healthScore
    };
  }

  private analyzeOAuthLogs(logs: LogEntry[]) {
    // OAuth-specific analysis
    const oauthKeywords = ['oauth', 'auth', 'login', 'supabase', 'token', 'pkce', 'redirect'];
    
    const authEvents = logs.filter(log => 
      oauthKeywords.some(keyword => 
        log.message.toLowerCase().includes(keyword) ||
        (log.component && log.component.toLowerCase().includes('auth'))
      )
    );

    const authErrors = authEvents.filter(log => log.level === LogLevel.ERROR);
    
    const pkceIssues = logs.filter(log => 
      log.message.toLowerCase().includes('pkce') ||
      log.message.toLowerCase().includes('code_challenge') ||
      log.message.toLowerCase().includes('code_verifier')
    );

    const redirectIssues = logs.filter(log =>
      log.message.toLowerCase().includes('redirect') ||
      log.message.toLowerCase().includes('callback') ||
      log.message.toLowerCase().includes('uri')
    );

    const oauthRecommendations = this.generateOAuthRecommendations(authErrors, pkceIssues, redirectIssues);

    return {
      authEvents,
      authErrors,
      pkceIssues,
      redirectIssues,
      recommendations: oauthRecommendations
    };
  }

  private normalizeErrorMessage(message: string): string {
    // Remove timestamps, UUIDs, and other variable parts to group similar errors
    return message
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '[TIMESTAMP]')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[UUID]')
      .replace(/\d{10,}/g, '[ID]')
      .replace(/line \d+/g, 'line [NUM]');
  }

  private detectSuspiciousPatterns(logs: LogEntry[]): string[] {
    const patterns: string[] = [];

    // Check for rapid repeated errors
    const recentErrors = logs.filter(l => 
      l.level === LogLevel.ERROR && 
      new Date(l.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );

    if (recentErrors.length > 10) {
      patterns.push('High error rate detected in last 5 minutes');
    }

    // Check for infinite loops (same message repeated rapidly)
    const messageFrequency = logs.reduce((acc, log) => {
      acc[log.message] = (acc[log.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(messageFrequency).forEach(([message, count]) => {
      if (count > 20) {
        patterns.push(`Possible infinite loop: "${message.substring(0, 50)}..." repeated ${count} times`);
      }
    });

    return patterns;
  }

  private detectErrorPatterns(logs: LogEntry[]): string[] {
    const errors = logs.filter(l => l.level === LogLevel.ERROR);
    const patterns: string[] = [];

    // Common error categories
    const networkErrors = errors.filter(e => 
      e.message.toLowerCase().includes('fetch') ||
      e.message.toLowerCase().includes('network') ||
      e.message.toLowerCase().includes('connection')
    ).length;

    const authErrors = errors.filter(e =>
      e.message.toLowerCase().includes('auth') ||
      e.message.toLowerCase().includes('unauthorized') ||
      e.message.toLowerCase().includes('forbidden')
    ).length;

    const parseErrors = errors.filter(e =>
      e.message.toLowerCase().includes('parse') ||
      e.message.toLowerCase().includes('json') ||
      e.message.toLowerCase().includes('syntax')
    ).length;

    if (networkErrors > 0) patterns.push(`${networkErrors} network/connection errors`);
    if (authErrors > 0) patterns.push(`${authErrors} authentication errors`);
    if (parseErrors > 0) patterns.push(`${parseErrors} parsing/syntax errors`);

    return patterns;
  }

  private generateRecommendations(logs: LogEntry[]): string[] {
    const recommendations: string[] = [];
    const errors = logs.filter(l => l.level === LogLevel.ERROR);
    const warnings = logs.filter(l => l.level === LogLevel.WARN);

    // Specific error pattern analysis with actionable recommendations
    const errorMessages = errors.map(e => e.message.toLowerCase());
    const warningMessages = warnings.map(w => w.message.toLowerCase());

    // Database/Supabase specific issues
    const dbErrors = errors.filter(e => 
      e.message.toLowerCase().includes('supabase') ||
      e.message.toLowerCase().includes('database') ||
      e.message.toLowerCase().includes('connection') ||
      e.message.toLowerCase().includes('timeout')
    );
    if (dbErrors.length > 0) {
      recommendations.push(`�️ Database Issues (${dbErrors.length} errors):`);
      recommendations.push(`  → Check Supabase connection status and API keys`);
      recommendations.push(`  → Review database query timeouts and connection limits`);
      recommendations.push(`  → Consider implementing connection pooling or retry logic`);
    }

    // Authentication/OAuth specific issues
    const authErrors = errors.filter(e =>
      e.message.toLowerCase().includes('auth') ||
      e.message.toLowerCase().includes('oauth') ||
      e.message.toLowerCase().includes('token') ||
      e.message.toLowerCase().includes('unauthorized') ||
      e.message.toLowerCase().includes('403') ||
      e.message.toLowerCase().includes('401')
    );
    if (authErrors.length > 0) {
      recommendations.push(`🔐 Authentication Issues (${authErrors.length} errors):`);
      recommendations.push(`  → Verify OAuth configuration and redirect URLs`);
      recommendations.push(`  → Check token expiration and refresh logic`);
      recommendations.push(`  → Review PKCE implementation for OAuth flows`);
    }

    // Network/API specific issues
    const networkErrors = errors.filter(e =>
      e.message.toLowerCase().includes('fetch') ||
      e.message.toLowerCase().includes('network') ||
      e.message.toLowerCase().includes('cors') ||
      e.message.toLowerCase().includes('500') ||
      e.message.toLowerCase().includes('502') ||
      e.message.toLowerCase().includes('503')
    );
    if (networkErrors.length > 0) {
      recommendations.push(`🌐 Network/API Issues (${networkErrors.length} errors):`);
      recommendations.push(`  → Check API endpoint availability and status`);
      recommendations.push(`  → Review CORS configuration for cross-origin requests`);
      recommendations.push(`  → Implement proper error handling and retry mechanisms`);
    }

    // React/Hydration specific issues
    const reactErrors = errors.filter(e =>
      e.message.toLowerCase().includes('hydration') ||
      e.message.toLowerCase().includes('react') ||
      e.message.toLowerCase().includes('hook') ||
      e.message.toLowerCase().includes('component')
    );
    if (reactErrors.length > 0) {
      recommendations.push(`⚛️ React/Component Issues (${reactErrors.length} errors):`);
      recommendations.push(`  → Fix hydration mismatches between server and client`);
      recommendations.push(`  → Review useEffect dependencies and cleanup functions`);
      recommendations.push(`  → Ensure proper component lifecycle management`);
    }

    // Type/TypeScript specific warnings
    const typeWarnings = warnings.filter(w =>
      w.message.toLowerCase().includes('type') ||
      w.message.toLowerCase().includes('typescript') ||
      w.message.toLowerCase().includes('any') ||
      w.message.toLowerCase().includes('unknown')
    );
    if (typeWarnings.length > 0) {
      recommendations.push(`📝 TypeScript Issues (${typeWarnings.length} warnings):`);
      recommendations.push(`  → Add proper type definitions for better type safety`);
      recommendations.push(`  → Replace 'any' types with specific interfaces`);
      recommendations.push(`  → Run 'npm run lint' to identify and fix type issues`);
    }

    // Performance specific warnings
    const performanceWarnings = warnings.filter(w =>
      w.message.toLowerCase().includes('slow') ||
      w.message.toLowerCase().includes('performance') ||
      w.message.toLowerCase().includes('timeout') ||
      w.message.toLowerCase().includes('memory')
    );
    if (performanceWarnings.length > 0) {
      recommendations.push(`⚡ Performance Issues (${performanceWarnings.length} warnings):`);
      recommendations.push(`  → Optimize slow queries and API calls`);
      recommendations.push(`  → Implement proper caching strategies`);
      recommendations.push(`  → Consider code splitting and lazy loading`);
    }

    // Deprecation warnings
    const deprecationWarnings = warnings.filter(w =>
      w.message.toLowerCase().includes('deprecat') ||
      w.message.toLowerCase().includes('legacy')
    );
    if (deprecationWarnings.length > 0) {
      recommendations.push(`� Deprecation Issues (${deprecationWarnings.length} warnings):`);
      recommendations.push(`  → Update deprecated APIs and libraries to latest versions`);
      recommendations.push(`  → Review migration guides for breaking changes`);
      recommendations.push(`  → Plan upgrade timeline for deprecated features`);
    }

    // Component-specific analysis with specific actions
    const componentErrors = errors.reduce((acc, error) => {
      const comp = error.component || 'Unknown';
      acc[comp] = (acc[comp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const problemComponents = Object.entries(componentErrors)
      .filter(([_, count]) => count > 2)
      .sort(([,a], [,b]) => b - a);

    if (problemComponents.length > 0) {
      recommendations.push(`🔧 Component-Specific Actions:`);
      problemComponents.forEach(([component, count]) => {
        recommendations.push(`  → ${component}: ${count} errors - Add error boundaries and defensive coding`);
      });
    }

    // Urgent vs Non-urgent classification
    if (errors.length > 10) {
      recommendations.push(`🚨 URGENT: ${errors.length} errors detected - Immediate action required`);
      recommendations.push(`  → Stop new deployments until critical errors are resolved`);
      recommendations.push(`  → Set up error monitoring alerts for real-time notifications`);
    } else if (errors.length > 0) {
      recommendations.push(`⚠️ MODERATE: ${errors.length} errors need attention within 24 hours`);
    }

    // Success case with specific improvements
    if (errors.length === 0 && warnings.length < 3) {
      recommendations.push(`✅ System Health: Excellent - Consider these enhancements:`);
      recommendations.push(`  → Implement accessibility improvements (ARIA labels, focus management)`);
      recommendations.push(`  → Add end-to-end testing for critical user flows`);
      recommendations.push(`  → Review and optimize bundle size and loading times`);
      recommendations.push(`  → Consider implementing advanced monitoring (performance metrics, user analytics)`);
    }

    return recommendations;
  }

  private categorizeWarning(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('deprecat') || lowerMessage.includes('legacy')) {
      return 'deprecation';
    }
    if (lowerMessage.includes('performance') || lowerMessage.includes('slow')) {
      return 'performance';
    }
    if (lowerMessage.includes('accessibility') || lowerMessage.includes('contrast')) {
      return 'accessibility';
    }
    if (lowerMessage.includes('security') || lowerMessage.includes('unsafe')) {
      return 'security';
    }
    if (lowerMessage.includes('type') || lowerMessage.includes('typescript')) {
      return 'type safety';
    }
    
    return 'general';
  }

  private generateOAuthRecommendations(authErrors: LogEntry[], pkceIssues: LogEntry[], redirectIssues: LogEntry[]): string[] {
    const recommendations: string[] = [];

    if (pkceIssues.length > 0) {
      recommendations.push('PKCE configuration issues detected. Check Supabase OAuth settings.');
    }

    if (redirectIssues.length > 0) {
      recommendations.push('Redirect URI issues found. Verify OAuth redirect URIs match your application URLs.');
    }

    if (authErrors.length > 0) {
      recommendations.push('Authentication errors present. Check environment variables and OAuth provider configuration.');
    }

    return recommendations;
  }

  private calculateHealthScore(logs: LogEntry[]): number {
    if (logs.length === 0) return 100;

    const errorCount = logs.filter(l => l.level === LogLevel.ERROR).length;
    const warningCount = logs.filter(l => l.level === LogLevel.WARN).length;
    
    const errorPenalty = Math.min(errorCount * 10, 50); // Max 50 points off for errors
    const warningPenalty = Math.min(warningCount * 2, 20); // Max 20 points off for warnings
    
    return Math.max(0, 100 - errorPenalty - warningPenalty);
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Auto-analysis after user activity
  async startAutoReview(intervalMinutes: number = 5): Promise<() => void> {
    const intervalId = setInterval(async () => {
      try {
        const analysis = await this.analyzeSession(undefined, intervalMinutes);
        
        // Only report if there are significant findings
        if (analysis.summary.errorCount > 0 || analysis.summary.warningCount > 5) {
          this.reportFindings(analysis);
        }
      } catch (error) {
        console.error('Auto-review failed:', error);
      }
    }, intervalMinutes * 60 * 1000);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  private reportFindings(analysis: LogAnalysis) {
    console.log('🔍 AUTOMATED LOG REVIEW FINDINGS:');
    console.log(`📊 Health Score: ${analysis.insights.healthScore}/100`);
    
    if (analysis.summary.errorCount > 0) {
      console.log(`❌ ${analysis.summary.errorCount} errors detected`);
    }
    
    if (analysis.oauth.authErrors.length > 0) {
      console.log(`🔐 ${analysis.oauth.authErrors.length} OAuth errors found`);
      analysis.oauth.recommendations.forEach(rec => console.log(`   💡 ${rec}`));
    }

    if (analysis.issues.repeatedErrors.length > 0) {
      console.log('🔁 Repeated errors:');
      analysis.issues.repeatedErrors.slice(0, 3).forEach(err => 
        console.log(`   ${err.message} (${err.count} times)`)
      );
    }

    if (analysis.insights.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      analysis.insights.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
  }
}

// Export singleton instance
export const logAnalyzer = new LogAnalyzer();
