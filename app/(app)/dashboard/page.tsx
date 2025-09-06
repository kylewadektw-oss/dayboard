'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { MealsWidget } from '@/components/dashboard/MealsWidget';
import { GroceryWidget } from '@/components/dashboard/GroceryWidget';
import { ProjectsWidget } from '@/components/dashboard/ProjectsWidget';
import { QuickActionsHub } from '@/components/dashboard/QuickActionsHub';
import { ProfileStatus } from '@/components/dashboard/ProfileStatus';
import { DaycareWidget } from '@/components/dashboard/DaycareWidget';

export default function DashboardPage() {
  const { user, profile, permissions, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to sign in will be handled by middleware
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-blue-800 mb-2">Authentication Required</h1>
            <p className="text-blue-600">Redirecting to sign in...</p>
          </div>
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
            <Suspense fallback={<div className="h-48 bg-white rounded-2xl animate-pulse" />}>
              <WeatherWidget />
            </Suspense>
          </div>
          
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-48 bg-white rounded-2xl animate-pulse" />}>
              <CalendarWidget />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <QuickActionsHub />
          </div>

          {/* Middle Row - Core Family Features */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-48 bg-white rounded-2xl animate-pulse" />}>
              <MealsWidget />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-48 bg-white rounded-2xl animate-pulse" />}>
              <GroceryWidget />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-48 bg-white rounded-2xl animate-pulse" />}>
              <ProjectsWidget />
            </Suspense>
          </div>

          {/* Family Updates Row */}
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="h-48 bg-white rounded-2xl animate-pulse" />}>
              <DaycareWidget />
            </Suspense>
          </div>
        </div>

        {/* Premium Widgets Row (Coming Soon) */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-dashed border-purple-300">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">✨ Premium Features Coming Soon</h3>
          <p className="text-purple-600 text-sm">
            Sports ticker, financial snapshot, package tracker, and AI-powered family coordination will be available with Premium subscription.
          </p>
        </div>

        {/* Development Note */}
        {profile && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Development Mode</h3>
            <p className="text-sm text-yellow-700">
              Welcome {profile.display_name || profile.full_name || user.email}! 
              User role system is active with {profile.role} permissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
