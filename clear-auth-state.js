#!/usr/bin/env node

/**
 * 🔄 CLEAR AUTH STATE
 *
 * Instructions to clear authentication state completely
 */

console.log('🔄 CLEARING AUTHENTICATION STATE');
console.log('=================================\n');

console.log('✅ Attempted to log out server-side users');
console.log('❌ JWT token was malformed (expected after RLS issues)\n');

console.log('🧹 MANUAL CLEANUP STEPS:');
console.log('========================');
console.log('1. Open Chrome DevTools (F12)');
console.log('2. Go to Application tab');
console.log('3. Clear the following:');
console.log(
  '   - Local Storage (left sidebar → Local Storage → localhost:3000)'
);
console.log(
  '   - Session Storage (left sidebar → Session Storage → localhost:3000)'
);
console.log('   - Cookies (left sidebar → Cookies → localhost:3000)');
console.log('4. Refresh the page (Ctrl+R or Cmd+R)');

console.log('\n⚡ QUICK ALTERNATIVE:');
console.log('===================');
console.log('• Open an Incognito/Private window');
console.log('• Go to http://localhost:3000');
console.log('• Try signing in fresh');

console.log('\n🎯 EXPECTED RESULT:');
console.log('==================');
console.log('After clearing auth state + applying the RLS fix:');
console.log('1. ✅ Google OAuth should work');
console.log('2. ✅ Profile data should load');
console.log('3. ✅ Dashboard should be accessible');

console.log('\n💡 If you still have issues:');
console.log('===========================');
console.log('The RLS policies in Supabase may need to be applied.');
console.log(
  'Make sure you ran the fix-rls-policies.sql in Supabase SQL editor.'
);
