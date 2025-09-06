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
