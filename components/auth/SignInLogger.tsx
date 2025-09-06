'use client';

import { useEffect } from 'react';
import { authLogger } from '@/utils/logger';

export default function SignInLogger() {
  useEffect(() => {
    // Test multiple logging methods
    console.log('🔍 DIRECT CONSOLE: Sign-in page visited');
    console.info('🔍 DIRECT CONSOLE INFO: User on sign-in page');
    
    authLogger.info('📝 User visited sign-in page', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Test regular logger too
    console.log('✅ Sign-in page logger component loaded');
    
    // Also test a delayed log to see if timing matters
    setTimeout(() => {
      console.log('⏰ DELAYED: Sign-in page timer test');
      authLogger.info('⏰ Delayed sign-in page log test');
    }, 1000);
  }, []);

  return null;
}
