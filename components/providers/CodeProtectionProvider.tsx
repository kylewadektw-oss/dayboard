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
import { initAllProtections } from '@/utils/code-protection';

/**
 * 🛡️ CODE PROTECTION COMPONENT
 * 
 * Initializes client-side code protection measures to prevent unauthorized
 * copying and inspection by large corporations or competing services.
 */
export default function CodeProtection() {
  useEffect(() => {
    // Initialize all protection measures
    initAllProtections();
    
    // Add additional runtime protection
    const originalLog = console.log;
    console.log = (...args) => {
      // Add ownership watermark to console logs
      if (args.length > 0 && typeof args[0] === 'string') {
        originalLog('🛡️ Dayboard Proprietary |', ...args);
      } else {
        originalLog(...args);
      }
    };
    
    // Detect automated scraping attempts
    let rapidRequests = 0;
    const requestTracker = () => {
      rapidRequests++;
      if (rapidRequests > 50) {
        console.warn('🛡️ Potential automated scraping detected');
        // Could implement rate limiting or other protections here
      }
      setTimeout(() => { rapidRequests = Math.max(0, rapidRequests - 1); }, 1000);
    };
    
    // Track page interactions
    document.addEventListener('click', requestTracker);
    document.addEventListener('keydown', requestTracker);
    
    return () => {
      console.log = originalLog;
      document.removeEventListener('click', requestTracker);
      document.removeEventListener('keydown', requestTracker);
    };
  }, []);

  return null; // This component doesn't render anything
}
