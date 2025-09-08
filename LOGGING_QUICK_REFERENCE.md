# 🚀 Dayboard Logging - Quick Reference Guide

**Date:** September 8, 2025 | **For:** Development Team

---

## ⚡ **Quick Start**

```typescript
import { logger, oauthLogger, authLogger, enhancedLogger } from '@/utils/logger';

// Basic logging
await logger.error('Something broke', 'ComponentName', { details });
await logger.warn('Something suspicious', 'ComponentName', { data });
await logger.info('Something happened', 'ComponentName', { context });

// Enhanced logging with full context
await enhancedLogger.logWithFullContext(LogLevel.ERROR, 'Message', 'Component', data);
await enhancedLogger.debugSnapshot('Debug description');
await enhancedLogger.reportIssue('Title', 'Description', additionalData);

// Specialized logging
await oauthLogger.error('OAuth failed', { provider: 'google' }, error);
await authLogger.info('User signed in', { userId: 'user123' });
```

---

## 📊 **What We Currently Capture**

### **✅ Comprehensive Data (Already Implemented)**
- **User Context**: ID, email, role, display name
- **Device Info**: Platform, browser, mobile detection, screen size
- **Performance**: Memory usage, load times, Web Vitals
- **Network**: Connection type, speed, online status
- **Browser Capabilities**: Storage, APIs, feature support
- **User Behavior**: Clicks, scrolls, time on page, interactions
- **Error Context**: Stack traces, categorization, suggestions
- **Session Tracking**: Duration, page views, journey mapping
- **Security**: HTTPS status, permissions, token info

### **🔮 Planned Enhancements**
- **Accessibility Metrics**: Screen reader usage, contrast preferences
- **Advanced Security**: CSP violations, suspicious activity detection
- **Business Intelligence**: Conversion tracking, feature usage analytics
- **Performance Optimization**: Core Web Vitals, resource timing
- **Technical Context**: Build info, feature flags, environment details

---

## 🎯 **Key Features**

### **Smart Console Interception**
- Automatically captures all `console.log()`, `console.error()`, etc.
- Prevents dashboard refresh loops
- Handles circular references safely
- Non-blocking performance

### **Enhanced Dashboard** (`/logs-dashboard`)
- Real-time log streaming (2-second refresh)
- Advanced filtering (level, component, time, search)
- **Top 3 Analytics**: Problem components, error patterns, peak times
- Suggested fixes for common errors
- Export capabilities (JSON, CSV, TXT)
- Multi-selection and bulk operations

### **Intelligent Analysis**
- Automatic error categorization
- Severity assessment (Critical/High/Medium/Low)
- Impact analysis and user-friendly explanations
- Related error detection and pattern recognition

---

## 🔧 **Common Usage Patterns**

### **Error Handling**
```typescript
try {
  // Risky operation
  await processPayment(data);
} catch (error) {
  await logger.error(
    'Payment processing failed', 
    'Payment-Gateway', 
    {
      userId: user.id,
      amount: data.amount,
      paymentMethod: data.method,
      errorCode: error.code,
      attemptNumber: retryCount + 1
    }
  );
  throw error;
}
```

### **User Journey Tracking**
```typescript
// Track important user actions
await enhancedLogger.trackJourneyStep('Started checkout', { 
  cartValue: 99.99, 
  itemCount: 3 
});

await enhancedLogger.trackJourneyStep('Completed payment', { 
  orderId: 'order_123',
  paymentMethod: 'card'
});
```

### **Performance Monitoring**
```typescript
// Monitor slow operations
const startTime = performance.now();
await slowOperation();
const duration = performance.now() - startTime;

if (duration > 1000) {
  await logger.warn('Slow operation detected', 'SlowComponent', {
    operation: 'slowOperation',
    duration: Math.round(duration),
    threshold: 1000
  });
}
```

### **Feature Usage Tracking**
```typescript
// Track feature adoption
await logger.info('Feature used', 'FeatureTracker', {
  feature: 'meal-planning',
  userId: user.id,
  timestamp: new Date().toISOString(),
  context: 'dashboard-widget'
});
```

---

## 🎨 **Component Naming Convention**

Use descriptive, consistent component names:

- **`Auth-System`** - Authentication & authorization
- **`API-Client`** - External API communications
- **`Database`** - Database operations & queries
- **`Payment-Gateway`** - Payment processing
- **`UI-Dashboard`** - Dashboard interface
- **`UI-Meals`** - Meal planning interface
- **`UI-Projects`** - Project management interface
- **`UI-Lists`** - List management interface
- **`Navigation`** - Routing & navigation
- **`Performance`** - Performance monitoring
- **`Security`** - Security-related events

---

## 📱 **Dashboard Quick Guide**

### **Access**: `http://localhost:3000/logs-dashboard`

### **Key Features**
1. **Statistics Cards**: Total, Console, Errors, Warnings
2. **Health Insights**: Top 3 analytics with actionable fixes
3. **Real-time Logs**: Live updating with search/filter
4. **Quick Actions**: Export, clear, test logs, filter presets

### **Pro Tips**
- Use **Time Range** filter for recent issues (default: 1 minute)
- Click **Health Status** button to expand/collapse detailed insights
- Use **Search** for specific error messages or user IDs
- **Multi-select** logs for bulk export
- **Component Filter** to focus on specific areas

---

## 🚨 **Emergency Debugging**

### **Critical Issue Investigation**
```typescript
// Get comprehensive debug snapshot
const debugInfo = await logger.getDebugSummary(true);
console.log('Debug Info:', debugInfo);

// Report critical issue with full context
await enhancedLogger.reportIssue(
  'Critical System Failure',
  'Detailed description of the issue',
  { additionalContext: 'any relevant data' }
);

// Get recent error patterns
const recentErrors = logger.getLogsByLevel(LogLevel.ERROR);
console.log('Recent Errors:', recentErrors.slice(-10));
```

### **Performance Investigation**
```typescript
// Check memory usage
const performanceInfo = logger.getPerformanceInfo();
if (performanceInfo?.memoryUsage > 100) { // 100MB threshold
  await logger.warn('High memory usage detected', 'Performance', {
    memoryUsage: performanceInfo.memoryUsage,
    timestamp: new Date().toISOString()
  });
}
```

### **User Issue Investigation**
```typescript
// Search for user-specific logs
const userLogs = logger.getAllLogs().filter(log => 
  log.userInfo?.id === 'specific-user-id'
);

// Get user journey for specific session
const sessionLogs = logger.getAllLogs().filter(log => 
  log.sessionId === 'specific-session-id'
);
```

---

## ⚙️ **Configuration & Maintenance**

### **Database Maintenance**
```sql
-- Clean up old logs (run monthly)
DELETE FROM application_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Check log volume
SELECT 
  DATE(created_at) as date,
  level,
  COUNT(*) as count
FROM application_logs 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), level
ORDER BY date DESC, level;
```

### **Performance Tuning**
```typescript
// Adjust cache timeout (default: 30 seconds)
logger.cacheTimeout = 60000; // 60 seconds

// Clear database cache if needed
logger.clearDbCache();

// Check if dashboard filtering is enabled
console.log('Dashboard filtering:', logger.isDashboardFilteringEnabled());
```

---

## 🔍 **Troubleshooting Checklist**

### **Logs Not Appearing**
- [ ] Console interception enabled: `logger.setupConsoleInterception()`
- [ ] Supabase connection working
- [ ] Check browser console for errors
- [ ] Verify database permissions
- [ ] Check RLS policies

### **Dashboard Issues**
- [ ] Time range filter appropriate (try "1 hour" vs "1 minute")
- [ ] Clear browser cache
- [ ] Check for JavaScript errors in console
- [ ] Verify WebSocket connections for real-time updates

### **Performance Issues**
- [ ] Memory usage under 500 logs
- [ ] Database cache working (check timestamps)
- [ ] No circular reference errors
- [ ] Dashboard filtering enabled for heavy traffic

---

## 📞 **Quick Support**

### **Files to Check**
- `/utils/logger.ts` - Main implementation
- `/app/logs-dashboard/page.tsx` - Dashboard
- `LOGGING_SYSTEM_DOCUMENTATION.md` - Full docs

### **Useful Commands**
```bash
# View recent logs in terminal
npm run logs:recent

# Export logs for analysis
npm run logs:export

# Clean development logs
npm run logs:clean

# Test logging system
npm run logs:test
```

### **Environment Variables**
```bash
NODE_ENV=development  # Enable verbose logging
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

**💡 Remember**: The logging system is designed to be invisible to users while providing maximum insight to developers. Always prioritize user experience over logging completeness.

---

**Last Updated:** September 8, 2025 | **Version:** 2.0 Enhanced
