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
import { logger } from '@/utils/logger';

export default function LoggerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure console interception is set up on the client side
    logger.setupConsoleInterception();
    
    // Add some initialization logging
    console.log('🚀 Dayboard application started - Logger initialized');
    console.log('📊 Visit /logs-dashboard to monitor real-time activity');
    
    // Cleanup function to restore console on unmount (though this rarely happens in practice)
    return () => {
      logger.restoreConsole();
    };
  }, []);

  return <>{children}</>;
}
