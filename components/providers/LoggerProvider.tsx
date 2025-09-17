/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export default function LoggerProvider({
  children
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Ensure console interception is set up on the client side
    logger.setupConsoleInterception();

    // Add some initialization logging
    console.log('🚀 Dayboard application started - Logger initialized');
    console.log('📊 Visit /logs-dashboard to monitor real-time activity');

    // Test if basic logging works
    setTimeout(() => {
      console.log('🧪 Test log entry for verification');
    }, 1000);

    // Test that logging is working
    (async () => {
      await logger.info('✅ Logger initialization complete', 'LoggerProvider', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        location: window.location.href
      });
    })();

    // Cleanup function to restore console on unmount (though this rarely happens in practice)
    return () => {
      logger.restoreConsole();
    };
  }, []);

  return <>{children}</>;
}
