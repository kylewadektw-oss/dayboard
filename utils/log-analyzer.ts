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
      return allLogs.filter(log => new Date(log.timestamp) >= cutoffTime);
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

    if (errors.length > 5) {
      recommendations.push('High error count detected. Review error logs for patterns and fix critical issues.');
    }

    if (warnings.length > 10) {
      recommendations.push('Many warnings detected. Consider addressing these to prevent future errors.');
    }

    // Check for missing error handling
    const uncaughtErrors = errors.filter(e => 
      e.message.toLowerCase().includes('uncaught') ||
      !e.stack
    );

    if (uncaughtErrors.length > 0) {
      recommendations.push('Add proper error handling to prevent uncaught exceptions.');
    }

    return recommendations;
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
