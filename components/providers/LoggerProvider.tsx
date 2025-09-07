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

/*
 * 🧩 LOGGER PROVIDER COMPONENT - Reusable UI Element
 * 
 * PURPOSE: Reusable logger provider component for household management interfaces
 * 
 * PROPS:
 * - [List component props and their types]
 * - [Optional vs required properties]
 * - [Callback functions and event handlers]
 * 
 * FEATURES:
 * - [Interactive elements and behaviors]
 * - [Visual design and styling approach]
 * - [Data handling and display logic]
 * - [Accessibility considerations]
 * 
 * USAGE:
 * ```tsx
 * <🧩 
 *   prop1="value"
 *   onAction={handleAction}
 * />
 * ```
 * 
 * TECHNICAL:
 * - [Implementation details]
 * - [Performance considerations]
 * - [Testing approach]
 */


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

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
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
