#!/usr/bin/env node

/**
 * Weather Diagnostic Tool
 * Helps identify weather widget issues
 */

console.log('🌤️ Weather Widget Diagnostic Tool\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- NEXT_PUBLIC_OWM_API_KEY:', process.env.NEXT_PUBLIC_OWM_API_KEY ? 'SET ✅' : 'NOT SET ❌');
console.log('- API Key Length:', process.env.NEXT_PUBLIC_OWM_API_KEY?.length || 0);

console.log('\n🔧 Quick Fixes:');
console.log('1. Add to your .env.local file:');
console.log('   NEXT_PUBLIC_OWM_API_KEY="your_api_key_here"');
console.log('\n2. Get free API key from:');
console.log('   https://openweathermap.org/api');
console.log('\n3. Restart your development server after adding the key');

console.log('\n🧪 Test Weather API:');
console.log('   curl "http://localhost:3000/api/weather?lat=40.7128&lon=-74.0060"');

console.log('\n📍 Common Issues:');
console.log('- Household coordinates not set in profile');
console.log('- User not authenticated');
console.log('- API key missing or invalid');
console.log('- Mock data not displaying properly');

console.log('\n✅ Expected Behavior:');
console.log('- With API key: Real weather data');
console.log('- Without API key: Mock weather data (should still show temperature)');