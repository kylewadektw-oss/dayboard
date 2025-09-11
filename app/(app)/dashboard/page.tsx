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

import { Suspense, useEffect, lazy } from 'react';
import { authLogger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load all dashboard widgets for better performance
const WeatherWidget = lazy(() => import('@/components/dashboard/WeatherWidget'));
const CalendarWidget = lazy(() => import('@/components/dashboard/CalendarWidget').then(m => ({ default: m.CalendarWidget })));
const MealsWidget = lazy(() => import('@/components/dashboard/MealsWidget').then(m => ({ default: m.MealsWidget })));
const GroceryWidget = lazy(() => import('@/components/dashboard/GroceryWidget').then(m => ({ default: m.GroceryWidget })));
const ProjectsWidget = lazy(() => import('@/components/dashboard/ProjectsWidget').then(m => ({ default: m.ProjectsWidget })));
const QuickActionsHub = lazy(() => import('@/components/dashboard/QuickActionsHub').then(m => ({ default: m.QuickActionsHub })));
const ProfileStatus = lazy(() => import('@/components/dashboard/ProfileStatus').then(m => ({ default: m.ProfileStatus })));
const DaycareWidget = lazy(() => import('@/components/dashboard/DaycareWidget').then(m => ({ default: m.DaycareWidget })));
const HouseholdMapWidget = lazy(() => import('@/components/dashboard/HouseholdMapWidget').then(m => ({ default: m.HouseholdMapWidget })));

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
  // Use real authentication context
  const { user, profile, permissions, loading } = useAuth();

  // Log dashboard access with real user data
  useEffect(() => {
    if (profile) {
      authLogger.info('🏠 Dashboard accessed successfully', {
        userId: user?.id,
        profileId: profile.id,
        displayName: profile.name,
        role: profile.role,
        householdId: profile.household_id,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });
    } else if (!loading) {
      authLogger.warn('⚠️ Dashboard accessed without profile data', {
        hasUser: !!user,
        loading,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });
    }
  }, [user, profile, loading]);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated (this should be handled by middleware, but good fallback)
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
          <a 
            href="/signin" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Check if profile is incomplete and redirect to setup
  if (!profile || !profile.household_id || !profile.onboarding_completed || !profile.name) {
    if (typeof window !== 'undefined') {
      window.location.href = '/profile/setup';
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Setup Required</h2>
          <p className="text-gray-600 mb-4">Please complete your profile and household setup.</p>
          <a 
            href="/profile/setup" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Complete Setup
          </a>
        </div>
      </div>
    );
  }

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
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Top Row - Primary Widgets (Always Visible) */}
          <div className="lg:col-span-1">
            <Suspense fallback={<WidgetSkeleton />}>
              <WeatherWidget />
            </Suspense>
          </div>

          {/* Household Location Map - Right below weather */}
          <div className="lg:col-span-1">
            <Suspense fallback={<WidgetSkeleton />}>
              <HouseholdMapWidget />
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
      </div>
    </div>
  );
}
