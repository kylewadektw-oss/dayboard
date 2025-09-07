// Simple test to check if console logging is working
const testLogging = () => {
  console.log('🧪 [TEST] Basic console.log test');
  console.error('🧪 [TEST] Basic console.error test');
  console.warn('🧪 [TEST] Basic console.warn test');
  
  // Test with some data
  console.log('🧪 [TEST] Object test:', { 
    message: 'This is test data',
    timestamp: new Date().toISOString(),
    level: 'info'
  });
  
  console.log('🧪 [TEST] Console logging test completed');
};

// Run the test
testLogging();
