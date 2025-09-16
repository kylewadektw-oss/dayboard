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

  useEffect(() => {
    // Once we've completed the initial load, don't go back to loading
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  useEffect(() => {
    // Only evaluate redirects after initial load is complete
    if (!initialLoadComplete || hasRedirected.current) {
      return;
    }

    if (requireAuth && !user) {
      // User is not authenticated but auth is required
      hasRedirected.current = true;
      router.push(redirectTo);
      return;
    }

    if (!requireAuth && user) {
      // User is authenticated but shouldn't be (e.g., on signin page)
      hasRedirected.current = true;
      router.push('/dashboard');
      return;
    }

    // All checks passed, render the component
    setShouldRender(true);
  }, [user, initialLoadComplete, requireAuth, redirectTo, router]);

  // Show loading state while doing initial auth check
  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  // Only render children if all auth checks passed and we haven't redirected
  if (!shouldRender || hasRedirected.current) {
    return null;
  }

  return <>{children}</>;
}
