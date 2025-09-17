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

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/signin'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const hasRedirected = useRef(false);
  
  console.log('🔒 [PROTECTED ROUTE DEBUG]:', {
    hasUser: !!user,
    loading,
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'server',
    hasRedirected: hasRedirected.current,
    shouldRender,
    initialLoadComplete
  });

  // Mark initial load as complete when loading finishes
  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  // Handle auth logic after initial load
  useEffect(() => {
    if (!initialLoadComplete) {
      return; // Wait for initial load to complete
    }

    // Reset redirect flag when auth state changes
    hasRedirected.current = false;

    if (requireAuth && !user) {
      // User is not authenticated but auth is required
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.push(redirectTo);
      }
      setShouldRender(false);
      return;
    }

    if (!requireAuth && user) {
      // User is authenticated but shouldn't be (e.g., on signin page)
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.push('/dashboard');
      }
      setShouldRender(false);
      return;
    }

    // All checks passed, render the component
    setShouldRender(true);
  }, [user, initialLoadComplete, requireAuth, redirectTo, router]);

  // Show loading state while doing initial auth check
  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirect is happening
  if (hasRedirected.current && !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  // Only render children if all auth checks passed
  return shouldRender ? <>{children}</> : null;
}
