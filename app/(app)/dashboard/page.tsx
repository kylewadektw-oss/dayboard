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

'use client';

import { Suspense, useEffect, useState, lazy } from 'react';
import { authLogger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load all dashboard widgets for better performance
const WeatherWidget = lazy(
  () => import('@/components/dashboard/WeatherWidget')
);
const CalendarWidget = lazy(() =>
  import('@/components/dashboard/CalendarWidget').then((m) => ({
    default: m.CalendarWidget
  }))
);
const MealsWidget = lazy(() =>
  import('@/components/dashboard/MealsWidget').then((m) => ({
    default: m.MealsWidget
  }))
);
const GroceryWidget = lazy(() =>
  import('@/components/dashboard/GroceryWidget').then((m) => ({
    default: m.GroceryWidget
  }))
);
const ProjectsWidget = lazy(() =>
  import('@/components/dashboard/ProjectsWidget').then((m) => ({
    default: m.ProjectsWidget
  }))
);
const QuickActionsRibbon = lazy(() =>
  import('@/components/dashboard/QuickActionsRibbon').then((m) => ({
    default: m.QuickActionsRibbon
  }))
);
const ProfileStatus = lazy(
  () => import('@/components/dashboard/ProfileStatus')
);
const DaycareWidget = lazy(() =>
  import('@/components/dashboard/DaycareWidget').then((m) => ({
    default: m.DaycareWidget
  }))
);
const HouseholdMapWidget = lazy(() =>
  import('@/components/dashboard/HouseholdMapWidget').then((m) => ({
    default: m.HouseholdMapWidget
  }))
);
const FinancialWidget = lazy(() =>
  import('@/components/financial/FinancialWidget').then((m) => ({
    default: m.FinancialWidget
  }))
);
const EntertainmentWidget = lazy(
  () => import('@/components/dashboard/EntertainmentWidget')
);

// Optimized loading component
const WidgetSkeleton = () => (
  <div className="widget-container bg-white rounded-2xl shadow-lg animate-pulse">
    <div className="p-4 space-y-3 h-full flex flex-col">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  // Use real authentication context with stable state management
  const { user, profile, permissions, loading } = useAuth();

  // Stable auth state management to prevent loading oscillation
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [stableAuthState, setStableAuthState] = useState({
    user: null as typeof user,
    profile: null as typeof profile,
    permissions: null as typeof permissions,
    loading: true
  });

  // Update stable auth state when auth values change
  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
      setStableAuthState({ user, profile, permissions, loading });
    } else if (initialLoadComplete) {
      setStableAuthState({ user, profile, permissions, loading });
    }
  }, [user, profile, permissions, loading, initialLoadComplete]);

  // Use stable state for all auth-dependent operations
  const currentUser = stableAuthState.user;
  const currentProfile = stableAuthState.profile;
  const currentPermissions = stableAuthState.permissions;
  const isAuthLoading = !initialLoadComplete || stableAuthState.loading;

  // Log dashboard access with real user data using stable state
  useEffect(() => {
    if (currentProfile) {
      authLogger.info('🏠 Dashboard accessed successfully', {
        userId: currentUser?.id,
        profileId: currentProfile.id,
        displayName: currentProfile.name,
        role: currentProfile.role,
        householdId: currentProfile.household_id,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });
    } else if (!isAuthLoading) {
      authLogger.warn('⚠️ Dashboard accessed without profile data', {
        hasUser: !!currentUser,
        loading: isAuthLoading,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });
    }
  }, [currentUser, currentProfile, isAuthLoading]);

  const canViewDashboard =
    currentPermissions?.dashboard !== false
      ? true
      : currentPermissions === null
        ? true
        : false;

  if (!canViewDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-800 mb-2">
              Access Denied
            </h1>
            <p className="text-red-600">
              You don&apos;t have permission to access the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with greeting */}
          <div className="mb-6">
            <ProfileStatus />
          </div>

          {/* Quick Actions Ribbon */}
          <Suspense
            fallback={
              <div className="h-48 bg-white rounded-2xl shadow-lg animate-pulse mb-6"></div>
            }
          >
            <QuickActionsRibbon />
          </Suspense>

          {/* Main Dashboard Grid - Equal Height Cards per Row */}
          <div className="space-y-6">
            {/* Row 1 - Primary Widgets */}
            <div className="dashboard-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="dashboard-card">
                <Suspense fallback={<WidgetSkeleton />}>
                  <WeatherWidget />
                </Suspense>
              </div>

              <div className="dashboard-card">
                <Suspense fallback={<WidgetSkeleton />}>
                  <HouseholdMapWidget />
                </Suspense>
              </div>

              <div className="dashboard-card">
                <Suspense fallback={<WidgetSkeleton />}>
                  <CalendarWidget />
                </Suspense>
              </div>
            </div>

            {/* Row 2 - Core Household Features */}
            <div className="dashboard-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="dashboard-card">
                <Suspense fallback={<WidgetSkeleton />}>
                  <MealsWidget />
                </Suspense>
              </div>

              <div className="dashboard-card">
                <Suspense fallback={<WidgetSkeleton />}>
                  <GroceryWidget />
                </Suspense>
              </div>

              <div className="dashboard-card">
                <Suspense fallback={<WidgetSkeleton />}>
                  <ProjectsWidget />
                </Suspense>
              </div>

              <div className="dashboard-card">
                <Suspense fallback={<WidgetSkeleton />}>
                  <FinancialWidget />
                </Suspense>
              </div>
            </div>

            {/* Row 3 - Additional Widgets */}
            <div className="dashboard-row grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="dashboard-card">
                <Suspense fallback={<WidgetSkeleton />}>
                  <EntertainmentWidget />
                </Suspense>
              </div>

              {/* Daycare Widget - Wider span */}
              <div className="dashboard-card lg:col-span-3">
                <Suspense fallback={<WidgetSkeleton />}>
                  <DaycareWidget />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Premium Widgets Row (Coming Soon) */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-dashed border-purple-300">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              ✨ Premium Features Coming Soon
            </h3>
            <p className="text-purple-600 text-sm">
              Sports ticker, financial snapshot, package tracker, and AI-powered
              household coordination will be available with Premium
              subscription.
            </p>
          </div>
        </div>

        {/* BentLo Labs LLC Copyright Footer */}
        <footer className="text-sm text-gray-500 text-center py-4 border-t mt-8">
          © 2025 BentLo Labs LLC. All rights reserved. Dayboard™ is a
          trademark of BentLo Labs LLC.
        </footer>
      </div>
    </ProtectedRoute>
  );
}
