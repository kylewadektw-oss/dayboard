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

'use client';

import { Suspense, useEffect, lazy } from 'react';
import { authLogger } from '@/utils/logger';

// Lazy load all dashboard widgets for better performance
const WeatherWidget = lazy(() => import('@/components/dashboard/WeatherWidget').then(m => ({ default: m.WeatherWidget })));
const CalendarWidget = lazy(() => import('@/components/dashboard/CalendarWidget').then(m => ({ default: m.CalendarWidget })));
const MealsWidget = lazy(() => import('@/components/dashboard/MealsWidget').then(m => ({ default: m.MealsWidget })));
const GroceryWidget = lazy(() => import('@/components/dashboard/GroceryWidget').then(m => ({ default: m.GroceryWidget })));
const ProjectsWidget = lazy(() => import('@/components/dashboard/ProjectsWidget').then(m => ({ default: m.ProjectsWidget })));
const QuickActionsHub = lazy(() => import('@/components/dashboard/QuickActionsHub').then(m => ({ default: m.QuickActionsHub })));
const ProfileStatus = lazy(() => import('@/components/dashboard/ProfileStatus').then(m => ({ default: m.ProfileStatus })));
const DaycareWidget = lazy(() => import('@/components/dashboard/DaycareWidget').then(m => ({ default: m.DaycareWidget })));

// Optimized loading component
const WidgetSkeleton = () => (
  <div className="h-48 bg-white rounded-2xl shadow-lg animate-pulse">
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  // Skip authentication checks since Google auth is disabled
  // Use mock values for development
  const user = null; // Could be mocked if needed
  const profile = {
    id: 'dev-user',
    display_name: 'Development User',
    full_name: 'Dev User',
    role: 'household_admin',
    household_id: 'dev-household'
  };
  const permissions = { dashboard: true }; // Mock permissions
  const loading = false;

  // Log dashboard access
  useEffect(() => {
    // Skip logging during development since auth is disabled
    authLogger.info('🏠 Dashboard accessed successfully (dev mode)', {
      profileId: profile.id,
      displayName: profile.display_name,
      role: profile.role,
      householdId: profile.household_id,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    });
  }, [profile]);

  // Skip loading state since auth is disabled
  // Skip authentication checks since Google auth is disabled

  const canViewDashboard = permissions?.dashboard ?? true;

  if (!canViewDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-800 mb-2">Access Denied</h1>
            <p className="text-red-600">You don't have permission to access the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with greeting */}
        <div className="mb-6">
          <ProfileStatus />
          {/* User info display */}
          {profile && (
            <div className="mt-2 flex gap-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Role: {profile.role.replace('_', ' ').toUpperCase()}
              </div>
              {profile.household_id && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Household Member
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Top Row - Primary Widgets (Always Visible) */}
          <div className="lg:col-span-1">
            <Suspense fallback={<WidgetSkeleton />}>
              <WeatherWidget />
            </Suspense>
          </div>
          
          <div className="lg:col-span-1">
            <Suspense fallback={<WidgetSkeleton />}>
              <CalendarWidget />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <QuickActionsHub />
          </div>

          {/* Middle Row - Core Household Features */}
          <div className="lg:col-span-1">
            <Suspense fallback={<WidgetSkeleton />}>
              <MealsWidget />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<WidgetSkeleton />}>
              <GroceryWidget />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<WidgetSkeleton />}>
              <ProjectsWidget />
            </Suspense>
          </div>

          {/* Household Updates Row */}
          <div className="lg:col-span-2">
            <Suspense fallback={<WidgetSkeleton />}>
              <DaycareWidget />
            </Suspense>
          </div>
        </div>

        {/* Premium Widgets Row (Coming Soon) */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-dashed border-purple-300">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">✨ Premium Features Coming Soon</h3>
          <p className="text-purple-600 text-sm">
            Sports ticker, financial snapshot, package tracker, and AI-powered household coordination will be available with Premium subscription.
          </p>
        </div>

        {/* Development Note */}
        {profile && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Development Mode</h3>
            <p className="text-sm text-yellow-700">
              Welcome {profile.display_name || profile.full_name || 'Developer'}! 
              User role system is active with {profile.role} permissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
