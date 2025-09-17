# 📝 Dayboard Logging System - Complete Documentation

**Last Updated:** September 8, 2025  
**Version:** 2.0 Enhanced  
**File Location:** `/utils/logger.ts`

---

## 🎯 **Overview**

Dayboard uses a comprehensive, enterprise-grade logging system that automatically captures detailed diagnostic information to help debug issues, understand user behavior, and optimize performance. The system is designed to be non-intrusive while providing maximum insight into application health and user experience.

---

## 🏗️ **Architecture**

### **Core Components**
- **Logger Class**: Main logging engine with console interception
- **LogEntry Interface**: Comprehensive data structure for log entries
- **Specialized Loggers**: OAuth, Auth, and Enhanced logging helpers
- **Database Integration**: Supabase persistence with intelligent caching
- **Real-time Dashboard**: Live monitoring via `/logs-dashboard`

### **Data Flow**
```
User Action → Console Output → Logger Interception → Data Enhancement → 
Memory Storage → Database Persistence → Dashboard Display → Analytics
```

---

## 📊 **Current Data Capture (Comprehensive)**

### **1. Basic Log Information**
```typescript
{
  id?: string;                    // Unique log entry ID
  userId?: string;                // Current user ID
  sessionId: string;              // Session identifier
  level: LogLevel;                // ERROR, WARN, INFO, DEBUG
  message: string;                // Log message
  component?: string;             // Source component
  data?: any;                     // Additional context data
  stack?: string;                 // Error stack trace
  userAgent?: string;             // Browser user agent
  url?: string;                   // Current page URL
  timestamp: string;              // ISO timestamp
  side?: 'client' | 'server';     // Execution environment
}
```

### **2. User Information**
```typescript
userInfo?: {
  id?: string;                    // User database ID
  email?: string;                 // User email address
  role?: string;                  // User role/permissions
  displayName?: string;           // User display name
}
```

### **3. Device & Hardware Information**
```typescript
deviceInfo?: {
  platform?: string;             // Operating system
  browser?: string;               // Browser name
  version?: string;               // Browser version
  mobile?: boolean;               // Mobile device detection
  screenSize?: string;            // Screen resolution
  touchSupport?: boolean;         // Touch capability
  orientation?: string;           // Portrait/landscape
  deviceMemory?: number;          // Available device memory
  hardwareConcurrency?: number;   // CPU cores
  maxTouchPoints?: number;        // Multi-touch support
  colorScheme?: string;           // Light/dark preference
  reducedMotion?: boolean;        // Accessibility preference
}
```

### **4. Performance Metrics**
```typescript
performanceInfo?: {
  memoryUsage?: number;           // Current memory usage
  loadTime?: number;              // Page load time
  networkSpeed?: string;          // Connection speed
  renderTime?: number;            // Render performance
  domInteractive?: number;        // DOM ready time
  firstContentfulPaint?: number;  // FCP metric
  largestContentfulPaint?: number; // LCP metric
  cumulativeLayoutShift?: number; // CLS metric
  firstInputDelay?: number;       // FID metric
  totalBlockingTime?: number;     // TBT metric
}
```

### **5. Network & Connection Info**
```typescript
networkInfo?: {
  online?: boolean;               // Online status
  connectionType?: string;        // Connection type
  downlink?: number;              // Download speed
  rtt?: number;                   // Round trip time
  saveData?: boolean;             // Data saver mode
  userAgent?: string;             // User agent string
  language?: string;              // Primary language
  languages?: string[];           // All languages
  cookieEnabled?: boolean;        // Cookie support
  doNotTrack?: string;            // DNT header
  javaEnabled?: boolean;          // Java support
  plugins?: Array<{name: string; version?: string;}>; // Browser plugins
  mimeTypes?: string[];           // Supported MIME types
  oscpu?: string;                 // OS CPU info
  vendor?: string;                // Browser vendor
  vendorSub?: string;             // Vendor sub-info
  productSub?: string;            // Product sub-info
  appVersion?: string;            // App version
  buildID?: string;               // Build identifier
}
```

### **6. Browser Capabilities**
```typescript
browserCapabilities?: {
  localStorage?: boolean;         // Local storage support
  sessionStorage?: boolean;       // Session storage support
  indexedDB?: boolean;            // IndexedDB support
  geolocation?: boolean;          // Location services
  webWorkers?: boolean;           // Web Workers support
  serviceWorkers?: boolean;       // Service Workers support
  pushNotifications?: boolean;    // Push notification support
  notifications?: boolean;        // Notification API
  pixelRatio?: number;            // Display pixel ratio
  colorDepth?: number;            // Color depth
  screenResolution?: string;      // Screen resolution
  availableResolution?: string;   // Available screen space
  webGL?: boolean;                // WebGL support
  webGL2?: boolean;               // WebGL 2.0 support
  webAssembly?: boolean;          // WebAssembly support
  secureContext?: boolean;        // HTTPS context
  crossOriginIsolated?: boolean;  // Cross-origin isolation
  webRTC?: boolean;               // WebRTC support
  webSockets?: boolean;           // WebSocket support
  sharedArrayBuffer?: boolean;    // SharedArrayBuffer support
  broadcastChannel?: boolean;     // BroadcastChannel API
  intersectionObserver?: boolean; // Intersection Observer
  mutationObserver?: boolean;     // Mutation Observer
  resizeObserver?: boolean;       // Resize Observer
  performanceObserver?: boolean;  // Performance Observer
  paymentRequest?: boolean;       // Payment Request API
  webShare?: boolean;             // Web Share API
  webBluetooth?: boolean;         // Web Bluetooth
  webUSB?: boolean;               // Web USB
  webNFC?: boolean;               // Web NFC
  wakeLock?: boolean;             // Wake Lock API
  fileSystemAccess?: boolean;     // File System Access
  eyeDropper?: boolean;           // EyeDropper API
}
```

### **7. Context Information**
```typescript
contextInfo?: {
  referrer?: string;              // Previous page
  previousAction?: string;        // Last user action
  feature?: string;               // Current feature area
  userJourney?: string;           // User journey stage
  fullUrl?: string;               // Complete URL
  pathname?: string;              // URL pathname
  search?: string;                // Query parameters
  hash?: string;                  // URL hash
  origin?: string;                // Origin domain
  viewportSize?: string;          // Viewport dimensions
  scrollPosition?: string;        // Scroll coordinates
  documentTitle?: string;         // Page title
  sessionDuration?: number;       // Session length
  pageLoadTime?: number;          // Page load duration
  timeOnPage?: number;            // Time on current page
  lastClickTarget?: string;       // Last clicked element
  formFieldsInteracted?: string;  // Form interaction count
  buttonsClicked?: string;        // Button click count
  tabVisibility?: string;         // Tab visibility state
  focusState?: boolean;           // Window focus status
  batteryLevel?: number;          // Device battery level
  chargingStatus?: boolean;       // Charging state
  connectionDownlink?: number;    // Connection speed
  effectiveConnectionType?: string; // Connection quality
  timezone?: string;              // User timezone
  currentDateTime?: string;       // Current date/time
  pageVisibilityChanges?: number; // Tab switch count
  idleTime?: number;              // Idle duration
  mousePosition?: string;         // Mouse coordinates
  keyboardLayout?: string;        // Keyboard layout
  selectedText?: string;          // Selected text
  clipboardPermission?: boolean;  // Clipboard access
  notificationPermission?: string; // Notification permission
  geolocationPermission?: string; // Location permission
  cameraPermission?: string;      // Camera permission
  microphonePermission?: string;  // Microphone permission
}
```

### **8. Error Context**
```typescript
errorContext?: {
  name?: string;                  // Error name
  message?: string;               // Error message
  stack?: string;                 // Stack trace
  stackLines?: string[];          // Parsed stack lines
  sourceFile?: string;            // Source file
  lineNumber?: number;            // Line number
  columnNumber?: number;          // Column number
  category?: string;              // Error category
  commonCause?: string;           // Likely cause
  relatedErrors?: Array<{timestamp: string; message: string;}>; // Related errors
  errorBoundary?: string;         // React error boundary
  componentStack?: string;        // Component stack
  errorId?: string;               // Unique error ID
  errorFrequency?: number;        // How often this error occurs
  userRecoveryActions?: string[]; // Recovery steps taken
}
```

### **9. Client Metrics**
```typescript
clientMetrics?: {
  domContentLoaded?: number;      // DOM ready time
  pageLoadComplete?: number;      // Full page load
  firstPaint?: number;            // First paint time
  resources?: number;             // Resource count
  navigationType?: string;        // Navigation type
  usedMemory?: number;            // Memory usage
  totalMemory?: number;           // Total memory
  memoryLimit?: number;           // Memory limit
  cpuUsage?: number;              // CPU usage
  frameRate?: number;             // Animation frame rate
  jsExecutionTime?: number;       // JS execution time
  domNodes?: number;              // DOM node count
  eventListeners?: number;        // Event listener count
  stylesheets?: number;           // CSS file count
  scripts?: number;               // JS file count
  images?: number;                // Image count
  iframes?: number;               // Iframe count
  webSockets?: number;            // WebSocket count
  serviceWorkerState?: string;    // SW state
  cacheUsage?: number;            // Cache usage
  quotaUsage?: number;            // Storage quota usage
  fontLoadTime?: number;          // Font loading time
  customMetrics?: Record<string, number>; // Custom metrics
}
```

### **10. Engagement Metrics**
```typescript
engagementMetrics?: {
  timeSpentOnSite?: number;       // Total session time
  pageViews?: number;             // Page view count
  interactionEvents?: number;     // Total interactions
  clickDepth?: number;            // Click count
  scrollDepth?: number;           // Scroll percentage
  bounceRate?: number;            // Bounce rate
  mouseMovements?: number;        // Mouse movement count
  keystrokes?: number;            // Keystroke count
  touchEvents?: number;           // Touch event count
  gestures?: number;              // Gesture count
  voiceCommands?: number;         // Voice command count
  formSubmissions?: number;       // Form submission count
  searchQueries?: number;         // Search count
  socialShares?: number;          // Share count
  downloads?: number;             // Download count
  printActions?: number;          // Print count
  copyPasteActions?: number;      // Copy/paste count
  rightClickActions?: number;     // Right-click count
  dragDropActions?: number;       // Drag/drop count
  shortcutUsage?: Record<string, number>; // Keyboard shortcuts
  featureUsage?: Record<string, number>; // Feature usage
  errorRecoveryActions?: number;  // Error recovery attempts
  helpSeeking?: number;           // Help requests
  feedbackGiven?: number;         // Feedback submissions
  sessionRating?: number;         // Session satisfaction
}
```

---

## 🚀 **Planned Enhancements**

### **1. Accessibility Information**
```typescript
accessibilityInfo?: {
  screenReaderActive?: boolean;        // Screen reader detection
  highContrastMode?: boolean;          // High contrast mode
  reduceMotionPreference?: boolean;    // Reduced motion preference
  fontSize?: string;                   // Font size setting
  zoomLevel?: number;                  // Zoom level
  keyboardNavigation?: boolean;        // Keyboard-only navigation
  voiceControlActive?: boolean;        // Voice control usage
  colorBlindnessAssist?: boolean;      // Color assistance
  assistiveTechnologies?: string[];    // AT software detected
  tabNavigationDepth?: number;         // Tab navigation usage
  focusVisibleUsage?: number;          // Focus indicator usage
  ariaLabelUsage?: number;             // ARIA label interactions
  skipLinkUsage?: number;              // Skip link usage
}
```

### **2. Security Information**
```typescript
securityInfo?: {
  httpsEnabled?: boolean;              // HTTPS usage
  mixedContentWarnings?: number;       // Mixed content issues
  cspViolations?: Array<{              // CSP violations
    directive: string; 
    blockedURI: string; 
    timestamp: string;
  }>;
  xssAttempts?: number;                // XSS attempt detection
  suspiciousActivity?: Array<{         // Suspicious behavior
    type: string; 
    details: string; 
    timestamp: string;
  }>;
  sessionTokens?: {                    // Token security
    count: number; 
    isSecure: boolean; 
    expiryStatus: string;
  };
  cookieSecurity?: {                   // Cookie security
    secure: number; 
    httpOnly: number; 
    sameSite: number;
  };
  corsIssues?: Array<{                 // CORS problems
    origin: string; 
    method: string; 
    timestamp: string;
  }>;
  featurePolicyViolations?: Array<{    // Feature policy violations
    feature: string; 
    source: string; 
    timestamp: string;
  }>;
  permissionsPolicy?: Record<string, boolean>; // Permissions policy
  trustedTypesViolations?: number;     // Trusted Types violations
  integrityErrors?: Array<{            // Resource integrity errors
    resource: string; 
    expected: string; 
    actual: string;
  }>;
}
```

### **3. Business Metrics**
```typescript
businessMetrics?: {
  conversionFunnelStep?: string;       // Funnel position
  purchaseIntent?: number;             // Purchase likelihood
  cartValue?: number;                  // Shopping cart value
  productViews?: Array<{               // Product interactions
    id: string; 
    name: string; 
    duration: number;
  }>;
  searchSuccess?: boolean;             // Search effectiveness
  recommendationClicks?: number;       // Recommendation clicks
  socialProof?: Array<{                // Social proof elements
    type: string; 
    value: string;
  }>;
  trustSignals?: Array<{               // Trust indicators
    type: string; 
    present: boolean;
  }>;
  exitIntent?: boolean;                // Exit intent detection
  returnVisitor?: boolean;             // Return visitor flag
  loyaltyTier?: string;                // Customer loyalty level
  referralSource?: string;             // Traffic source
  campaignTracking?: Record<string, string>; // Marketing campaigns
  abTestVariant?: string;              // A/B test variant
  personalizationApplied?: boolean;    // Personalization usage
  contentEngagement?: Record<string, number>; // Content interaction
}
```

### **4. Technical Context**
```typescript
technicalContext?: {
  nodeVersion?: string;                // Node.js version
  nextjsVersion?: string;              // Next.js version
  reactVersion?: string;               // React version
  buildInfo?: {                        // Build information
    version: string; 
    commit: string; 
    buildDate: string;
  };
  environment?: string;                // Environment (dev/prod)
  deploymentId?: string;               // Deployment identifier
  serverRegion?: string;               // Server region
  cdnHit?: boolean;                    // CDN cache hit
  cacheStatus?: string;                // Cache status
  databaseLatency?: number;            // DB response time
  apiLatency?: Record<string, number>; // API response times
  thirdPartyLatency?: Record<string, number>; // 3rd party latency
  featureFlags?: Record<string, boolean>; // Feature flags
  experiments?: Array<{                // A/B experiments
    id: string; 
    variant: string;
  }>;
  customDimensions?: Record<string, any>; // Custom tracking
  debugMode?: boolean;                 // Debug mode status
  sourceMap?: boolean;                 // Source maps enabled
  hotReload?: boolean;                 // Hot reload status
  serverSideProps?: boolean;           // SSR usage
  staticGeneration?: boolean;          // SSG usage
}
```

---

## 🔧 **Usage Examples**

### **Basic Logging**
```typescript
import { logger, oauthLogger, authLogger } from '@/utils/logger';

// Simple error logging
await logger.error('Database connection failed', 'DatabaseComponent', { 
  errorCode: 'DB_001' 
});

// Warning with context
await logger.warn('API response slow', 'APIClient', { 
  responseTime: 2500 
});

// Info logging
await logger.info('User action completed', 'UserInterface', { 
  action: 'profile_update' 
});
```

### **Enhanced Logging**
```typescript
import { enhancedLogger } from '@/utils/logger';

// Log with automatic URL capture
await enhancedLogger.logWithFullContext(
  LogLevel.ERROR, 
  'Payment failed', 
  'Checkout', 
  errorData
);

// Quick debugging snapshot
await enhancedLogger.debugSnapshot('User authentication issue');

// Report critical issue with full diagnostic data
await enhancedLogger.reportIssue(
  'Payment Processing', 
  'Credit card validation failed', 
  { cardType, amount }
);

// Track user journey
await enhancedLogger.trackJourneyStep(
  'Started checkout process', 
  { productId, quantity }
);
```

### **Specialized Logging**
```typescript
// OAuth specific logging
await oauthLogger.error('Token refresh failed', { 
  tokenExpiry, 
  attemptCount 
}, refreshError);

// Auth specific logging
await authLogger.warn('Multiple login attempts detected', { 
  attempts, 
  timeWindow 
});
```

### **Advanced Usage**
```typescript
// Get full debug context
const fullContext = await logger.getDebugSummary(true);
console.log('Full diagnostic data:', fullContext);

// Configure dashboard filtering
logger.setDashboardFilteringEnabled(false);

// Export logs for analysis
const exportedLogs = logger.exportLogs();

// Clear logs
logger.clearLogs();

// Get recent logs
const recentLogs = logger.getRecentLogs(50);

// Get logs by level
const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);

// Get logs by component
const authLogs = logger.getLogsByComponent('Auth');
```

---

## 📱 **Dashboard Integration**

### **Live Monitoring**
Access real-time logs at: `/logs-dashboard`

### **Features**
- **Real-time log streaming** (auto-refresh every 2 seconds)
- **Advanced filtering** by level, component, side (client/server)
- **Time range filtering** (1m, 5m, 10m, 30m, 1h, 1d)
- **Search functionality** across messages and data
- **Export capabilities** (JSON, CSV, TXT formats)
- **Performance metrics** and component statistics
- **Color-coded log levels** with search highlighting
- **System health insights** with Top 3 analytics
- **Suggested fixes** for common errors
- **Multi-selection** and bulk operations

### **Top 3 Analytics**
1. **Top 3 Problem Components** - Components generating most issues
2. **Top 3 Error Patterns** - Most common error types
3. **Top 3 Problem Times** - Peak error occurrence times

---

## 🏆 **Best Practices**

### **When to Use Each Log Level**
- **ERROR**: Critical issues that break functionality
- **WARN**: Potential problems that should be monitored
- **INFO**: General application behavior and user actions
- **DEBUG**: Detailed technical information (rarely used)

### **Component Naming**
Use descriptive component names:
- `Auth-System` - Authentication related
- `API-Client` - API communication
- `Database` - Database operations
- `UI-Component` - User interface elements
- `Payment-Processing` - Payment related

### **Data Structure**
Keep additional data structured and meaningful:
```typescript
await logger.error('Payment failed', 'Payment-Processing', {
  userId: user.id,
  amount: 29.99,
  paymentMethod: 'card',
  errorCode: 'INSUFFICIENT_FUNDS',
  attemptNumber: 2,
  metadata: {
    sessionId: 'sess_123',
    correlationId: 'corr_456'
  }
});
```

---

## 🔒 **Privacy & Security**

### **Data Protection**
- **No sensitive data**: Passwords, credit cards, SSNs automatically filtered
- **User consent**: Logging respects user privacy preferences
- **Data retention**: Logs automatically purged after 30 days
- **Encryption**: All logs encrypted in transit and at rest

### **GDPR Compliance**
- **Right to be forgotten**: User data can be purged on request
- **Data minimization**: Only necessary data is collected
- **Consent management**: Users can opt-out of detailed logging

---

## 🚀 **Performance Optimization**

### **Efficiency Features**
- **Throttled database writes** - Batched every 2 seconds
- **Memory management** - Only 500 most recent logs kept in memory
- **Smart caching** - Database results cached for 30 seconds
- **Dashboard filtering** - Automatic prevention of dashboard refresh loops
- **Circular reference protection** - Safe object serialization
- **Non-blocking logging** - Async operations don't impact app performance

### **Database Schema**
```sql
-- Supabase table: application_logs
CREATE TABLE application_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  component TEXT,
  data JSONB,
  stack_trace TEXT,
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_application_logs_timestamp ON application_logs(timestamp);
CREATE INDEX idx_application_logs_level ON application_logs(level);
CREATE INDEX idx_application_logs_user_id ON application_logs(user_id);
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Development vs Production
NODE_ENV=development  # Enables verbose console output

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### **Logger Configuration**
```typescript
// Disable dashboard refresh filtering (if needed)
logger.setDashboardFilteringEnabled(false);

// Check current filtering status
console.log(logger.isDashboardFilteringEnabled());
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Logs Not Appearing in Dashboard**
1. Check if console interception is enabled: `logger.setupConsoleInterception()`
2. Verify Supabase connection and credentials
3. Check browser console for database write errors
4. Ensure logs table exists and has proper permissions

#### **High Memory Usage**
1. Logs are automatically limited to 500 in memory
2. Database caching is limited to 30 seconds
3. Consider reducing log frequency for high-traffic components

#### **Circular Reference Errors**
The logger automatically handles circular references, but if you encounter issues:
1. Use `logger.safeSerializeArgs()` for complex objects
2. Avoid logging DOM elements or React components directly
3. Use string representations for complex objects

#### **Database Write Failures**
1. Check Supabase connection status
2. Verify RLS (Row Level Security) policies
3. Ensure database table schema matches expected structure
4. Check for network connectivity issues

### **Debug Commands**
```typescript
// Get comprehensive debug information
const debugInfo = await logger.getDebugSummary(true);

// Check logger health
console.log('Session ID:', logger.getSessionId());
console.log('Recent logs:', logger.getRecentLogs(10));
console.log('Error logs:', logger.getLogsByLevel(LogLevel.ERROR));

// Test database connectivity
await logger.info('Database connectivity test', 'Debug');
```

---

## 📈 **Analytics & Insights**

### **Available Metrics**
- **Error frequency** and patterns
- **User journey** tracking
- **Performance bottlenecks**
- **Feature usage** statistics
- **User engagement** metrics
- **Security incidents**
- **Accessibility** usage patterns

### **Automated Analysis**
The system provides automatic:
- **Error categorization** (Network, Auth, Database, etc.)
- **Severity assessment** (Critical, High, Medium, Low)
- **Impact analysis** (User experience impact)
- **Suggested actions** (Troubleshooting steps)
- **Related error detection** (Pattern recognition)

---

## 🔮 **Future Enhancements**

### **Planned Features**
1. **ML-powered error prediction** - Predict issues before they occur
2. **Advanced anomaly detection** - Automatically detect unusual patterns
3. **Real-time alerting** - Slack/email notifications for critical errors
4. **Custom dashboards** - Personalized monitoring views
5. **Performance regression detection** - Automatic performance monitoring
6. **User behavior analytics** - Advanced user journey analysis
7. **Integration with APM tools** - Datadog, New Relic integration
8. **A/B testing analytics** - Experiment result tracking

### **API Integrations**
- **Slack notifications** for critical errors
- **Email alerts** for system administrators
- **Webhook support** for external monitoring tools
- **REST API** for programmatic access to logs
- **GraphQL API** for complex log queries

---

## 📚 **References**

### **Related Files**
- `/utils/logger.ts` - Main logger implementation
- `/app/logs-dashboard/page.tsx` - Dashboard interface
- `/components/logging/LoggingNav.tsx` - Dashboard navigation
- `/components/auth/SignInLogger.tsx` - Auth-specific logging

### **Dependencies**
- **Supabase** - Database and authentication
- **Next.js** - Application framework
- **React** - UI framework
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### **Documentation Links**
- [Supabase Logging Guide](https://supabase.com/docs/guides/logging)
- [Next.js Error Handling](https://nextjs.org/docs/advanced-features/error-handling)
- [Web Vitals Documentation](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

---

**© 2025 Dayboard - BentLo Labs LLC. All rights reserved.**
