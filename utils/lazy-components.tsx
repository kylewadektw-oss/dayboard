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

import { lazy, Suspense, ComponentType } from 'react';
import { createLazyWrapper } from '@/utils/lazy-loading';

// 🚀 PERFORMANCE: Lazy load calendar components
export const LazyHouseholdCalendar = createLazyWrapper(
  () => import('@/components/calendar/HouseholdCalendar'),
  { 
    fallbackType: 'page', 
    logComponentName: 'HouseholdCalendar',
    retryAttempts: 2
  }
);

export const LazyQuickAddEvent = createLazyWrapper(
  () => import('@/components/calendar/QuickAddEvent'),
  { 
    fallbackType: 'widget', 
    logComponentName: 'QuickAddEvent',
    retryAttempts: 2
  }
);

// 🚀 PERFORMANCE: Lazy load major app sections
export const LazyMealsPage = createLazyWrapper(
  () => import('@/app/(app)/meals/page'),
  { 
    fallbackType: 'page', 
    logComponentName: 'MealsPage',
    retryAttempts: 2
  }
);

export const LazyListsPage = createLazyWrapper(
  () => import('@/app/(app)/lists/page'),
  { 
    fallbackType: 'page', 
    logComponentName: 'ListsPage',
    retryAttempts: 2
  }
);

export const LazyFinancialPage = createLazyWrapper(
  () => import('@/app/(app)/financial/page'),
  { 
    fallbackType: 'page', 
    logComponentName: 'FinancialPage',
    retryAttempts: 2
  }
);

export const LazyWorkPage = createLazyWrapper(
  () => import('@/app/(app)/work/page'),
  { 
    fallbackType: 'page', 
    logComponentName: 'WorkPage',
    retryAttempts: 2
  }
);

export const LazyEntertainmentPage = createLazyWrapper(
  () => import('@/app/(app)/entertainment/page'),
  { 
    fallbackType: 'page', 
    logComponentName: 'EntertainmentPage',
    retryAttempts: 2
  }
);

export const LazySettingsPage = createLazyWrapper(
  () => import('@/app/(app)/settings/page'),
  { 
    fallbackType: 'page', 
    logComponentName: 'SettingsPage',
    retryAttempts: 2
  }
);

// 🚀 PERFORMANCE: Lazy load dashboard widgets
export const LazyAnalyticsDashboard = createLazyWrapper(
  () => import('@/components/analytics/EnhancedAnalyticsDashboard'),
  { 
    fallbackType: 'widget', 
    logComponentName: 'AnalyticsDashboard',
    retryAttempts: 2
  }
);

export const LazyBudgetDashboard = createLazyWrapper(
  () => import('@/components/budget/BudgetDashboard'),
  { 
    fallbackType: 'widget', 
    logComponentName: 'BudgetDashboard',
    retryAttempts: 2
  }
);

// 🚀 PERFORMANCE: Lazy load FullCalendar (heavy external dependency)
export const LazyFullCalendar = lazy(() => import('@fullcalendar/react'));

// 🚀 PERFORMANCE: Preload critical components for better UX
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined') {
    // Preload components that are likely to be used soon
    import('@/components/calendar/HouseholdCalendar');
    import('@/components/calendar/QuickAddEvent');
    import('@/components/dashboard/QuickActionsHub');
  }
}

// 🚀 PERFORMANCE: Route-based preloading
export function preloadRouteComponents(route: string) {
  if (typeof window !== 'undefined') {
    switch (route) {
      case '/calendar':
        import('@/components/calendar/HouseholdCalendar');
        import('@/components/calendar/QuickAddEvent');
        import('@fullcalendar/react');
        break;
      case '/meals':
        import('@/components/meals/EnhancedMealPlanWrapper');
        break;
      case '/lists':
        import('@/components/lists/EnhancedListsManager');
        break;
      case '/financial':
        import('@/components/budget/BudgetDashboard');
        break;
      case '/entertainment':
        import('@/components/dashboard/Magic8BallWidget');
        break;
    }
  }
}