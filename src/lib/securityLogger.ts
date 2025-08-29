/**
 * Security Audit Logger
 * Tracks security-relevant events for compliance and monitoring
 */

export interface AuditEvent {
  id?: string;
  user_id?: string;
  event_type: 'auth' | 'data_access' | 'data_modify' | 'security' | 'error';
  action: string;
  resource?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
}

class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private events: AuditEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  private constructor() {}

  public static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  /**
   * Log a security event
   */
  public async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event
    };

    // Add to in-memory store
    this.events.push(auditEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // In production, you would store this in a database or send to a logging service
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Audit:', auditEvent);
    }

    // For critical events, you might want to alert immediately
    if (event.severity === 'critical') {
      await this.handleCriticalEvent(auditEvent);
    }
  }

  /**
   * Get recent security events (for admin dashboard)
   */
  public getRecentEvents(limit: number = 50): AuditEvent[] {
    return this.events.slice(-limit).reverse();
  }

  /**
   * Get events by user
   */
  public getEventsByUser(userId: string, limit: number = 20): AuditEvent[] {
    return this.events
      .filter(event => event.user_id === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get events by type
   */
  public getEventsByType(eventType: AuditEvent['event_type'], limit: number = 50): AuditEvent[] {
    return this.events
      .filter(event => event.event_type === eventType)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get failed authentication attempts
   */
  public getFailedAuthAttempts(timeWindow: number = 15 * 60 * 1000): AuditEvent[] {
    const cutoff = Date.now() - timeWindow;
    return this.events.filter(event => 
      event.event_type === 'auth' && 
      !event.success &&
      new Date(event.timestamp!).getTime() > cutoff
    );
  }

  /**
   * Check for suspicious activity patterns
   */
  public detectSuspiciousActivity(userId?: string): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const recentEvents = userId 
      ? this.getEventsByUser(userId, 20)
      : this.getRecentEvents(50);

    // Check for rapid failed auth attempts
    const failedAuth = recentEvents.filter(e => 
      e.event_type === 'auth' && !e.success &&
      Date.now() - new Date(e.timestamp!).getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (failedAuth.length >= 5) {
      reasons.push('Multiple failed authentication attempts');
    }

    // Check for unusual data access patterns
    const dataAccess = recentEvents.filter(e => e.event_type === 'data_access');
    if (dataAccess.length > 20) {
      reasons.push('Unusually high data access frequency');
    }

    // Check for access from multiple IPs
    const uniqueIPs = new Set(recentEvents.map(e => e.ip_address).filter(Boolean));
    if (uniqueIPs.size > 3) {
      reasons.push('Access from multiple IP addresses');
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Handle critical security events
   */
  private async handleCriticalEvent(event: AuditEvent): Promise<void> {
    console.error('🚨 CRITICAL SECURITY EVENT:', event);
    
    // In production, implement:
    // - Send alert to security team
    // - Trigger automatic response (e.g., temporary account lock)
    // - Log to external security monitoring system
    
    // For now, just ensure it's prominently logged
    if (typeof window !== 'undefined') {
      // Client-side: Store critical events in sessionStorage for debugging
      const criticalEvents = JSON.parse(sessionStorage.getItem('critical_security_events') || '[]');
      criticalEvents.push(event);
      sessionStorage.setItem('critical_security_events', JSON.stringify(criticalEvents.slice(-10)));
    }
  }

  /**
   * Clear old events (cleanup method)
   */
  public clearOldEvents(olderThanDays: number = 30): void {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => 
      new Date(event.timestamp!).getTime() > cutoff
    );
  }
}

// Export singleton instance
export const securityLogger = SecurityAuditLogger.getInstance();

// Convenience functions for common security events
export const logAuthAttempt = (success: boolean, userId?: string, details?: Record<string, any>) => {
  securityLogger.logEvent({
    event_type: 'auth',
    action: success ? 'login_success' : 'login_failed',
    user_id: userId,
    details,
    severity: success ? 'low' : 'medium',
    success
  });
};

export const logDataAccess = (resource: string, userId: string, action: string = 'read') => {
  securityLogger.logEvent({
    event_type: 'data_access',
    action,
    resource,
    user_id: userId,
    severity: 'low',
    success: true
  });
};

export const logDataModification = (resource: string, userId: string, action: string, success: boolean = true) => {
  securityLogger.logEvent({
    event_type: 'data_modify',
    action,
    resource,
    user_id: userId,
    severity: success ? 'low' : 'medium',
    success
  });
};

export const logSecurityViolation = (action: string, userId?: string, details?: Record<string, any>) => {
  securityLogger.logEvent({
    event_type: 'security',
    action,
    user_id: userId,
    details,
    severity: 'high',
    success: false
  });
};

export const logError = (action: string, error: Error, userId?: string) => {
  securityLogger.logEvent({
    event_type: 'error',
    action,
    user_id: userId,
    details: {
      error_message: error.message,
      error_stack: error.stack
    },
    severity: 'medium',
    success: false
  });
};
