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
