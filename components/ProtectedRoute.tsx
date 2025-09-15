'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User is not authenticated but auth is required
        router.push(redirectTo);
        return;
      }
      
      if (!requireAuth && user) {
        // User is authenticated but shouldn't be (e.g., on signin page)
        router.push('/dashboard');
        return;
      }
      
      // All checks passed, render the component
      setShouldRender(true);
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Only render children if all auth checks passed
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}