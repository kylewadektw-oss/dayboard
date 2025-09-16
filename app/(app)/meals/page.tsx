/**
 * Dayboard - Family Management Platform
 * 
 * © 2025 BentLo Labs LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This source code is the proprietary and confidential property of BentLo Labs LLC.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * @company BentLo Labs LLC
 * @product Dayboard
 * @license Proprietary
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
        
        {/* BentLo Labs LLC Copyright Footer */}
        <footer className="text-sm text-gray-500 text-center py-4 border-t mt-8">
          © 2025 BentLo Labs LLC. All rights reserved. Dayboard™ is a trademark of BentLo Labs LLC.
        </footer>
      </div>
    </div>
  );
}
