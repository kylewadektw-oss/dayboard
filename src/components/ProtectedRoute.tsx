"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSetup from './ProfileSetup';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireProfile = false 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push('/signin');
    }
  }, [user, loading, requireAuth, router]);

  // For non-auth pages, don't wait for auth to load
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication (but only briefly)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in, don't render children
  if (requireAuth && !user) {
    return null; // Will redirect to signin in useEffect
  }

  // If profile is required but user doesn't have one, show ProfileSetup
  if (requireProfile && user && !profile) {
    return <ProfileSetup user={user} onComplete={() => window.location.reload()} />;
  }

  return <>{children}</>;
}
