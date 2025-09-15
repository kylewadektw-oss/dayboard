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
    
    // Also test a delayed log to see if timing matters
    setTimeout(() => {
      console.log('⏰ DELAYED: Sign-in page timer test');
      authLogger.info('⏰ Delayed sign-in page log test');
    }, 1000);
  }, []);

  return null;
}
