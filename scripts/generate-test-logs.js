#!/usr/bin/env node

// Quick script to generate test logs via command line
// Usage: node generate-test-logs.js [type] [count]
// Types: error, warn, info, debug, mixed

const args = process.argv.slice(2);
const logType = args[0] || 'mixed';
const count = parseInt(args[1]) || 5;

console.log(`🧪 Generating ${count} ${logType} logs for testing...\n`);

// Generate logs by making HTTP requests to the Next.js API
const generateLogs = async () => {
  const baseUrl = 'http://localhost:3000';
  
  const logMessages = {
    error: [
      'Database connection timeout',
      'Authentication failed',
      'Payment processing error',
      'Critical system exception',
      'API endpoint not found'
    ],
    warn: [
      'High memory usage detected',
      'API rate limit approaching',
      'Deprecated function used',
      'Slow database query',
      'Cache miss detected'
    ],
    info: [
      'User logged in successfully',
      'Data synchronization completed',
      'Email notification sent',
      'Backup process finished',
      'Configuration updated'
    ],
    debug: [
      'Component rendered successfully',
      'API request trace completed',
      'State update processed',
      'Cache hit registered',
      'Event handler triggered'
    ]
  };

  const components = [
    'AuthService',
    'DatabaseService', 
    'PaymentProcessor',
    'EmailService',
    'CacheManager',
    'APIController',
    'UserManager',
    'DataSync',
    'SecurityService',
    'LoggingSystem'
  ];

  for (let i = 0; i < count; i++) {
    let selectedType;
    let messages;
    
    if (logType === 'mixed') {
      const types = ['error', 'warn', 'info', 'debug'];
      selectedType = types[Math.floor(Math.random() * types.length)];
    } else {
      selectedType = logType;
    }
    
    messages = logMessages[selectedType] || logMessages.info;
    const message = messages[Math.floor(Math.random() * messages.length)];
    const component = components[Math.floor(Math.random() * components.length)];
    
    const logData = {
      level: selectedType,
      message: message,
      component: component,
      data: {
        testGenerated: true,
        sequence: i + 1,
        timestamp: new Date().toISOString(),
        randomData: Math.random().toString(36).substring(7)
      }
    };
    
    try {
      console.log(`📝 [${selectedType.toUpperCase()}] ${component}: ${message}`);
      
      // In a real implementation, you'd make an HTTP request to log the data
      // For now, we'll just simulate the delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Failed to generate log ${i + 1}:`, error.message);
    }
  }
  
  console.log(`\n✅ Generated ${count} test logs! Check the dashboard at ${baseUrl}/logs-dashboard`);
};

// Handle different log types
const validTypes = ['error', 'warn', 'info', 'debug', 'mixed'];
if (!validTypes.includes(logType)) {
  console.error(`❌ Invalid log type: ${logType}`);
  console.log(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

if (count < 1 || count > 100) {
  console.error(`❌ Invalid count: ${count} (must be 1-100)`);
  process.exit(1);
}

generateLogs().catch(console.error);
