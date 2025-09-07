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
 * 🧩 PAGE COMPONENT - Reusable UI Element
 * 
 * PURPOSE: Reusable page component for household management interfaces
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

import { Suspense } from 'react';
import { MealTabs } from '@/components/meals/MealTabs';
import { MealPlanningHeader } from '@/components/meals/MealPlanningHeader';

export default function MealsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <MealPlanningHeader />
        <Suspense fallback={<div className="h-96 bg-white rounded-2xl animate-pulse" />}>
          <MealTabs />
        </Suspense>
      </div>
    </div>
  );
}
