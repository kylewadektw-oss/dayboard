'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'member' | 'admin' | 'super_admin';

/**
 * Hook to get user role from profile
 */
export function useUserRole() {
  const { profile } = useAuth();

  const role = useMemo((): UserRole => {
    return (profile?.role as UserRole) || 'member';
  }, [profile?.role]);

  const isAdmin = useMemo(() => role === 'admin' || role === 'super_admin', [role]);
  const isSuperAdmin = useMemo(() => role === 'super_admin', [role]);

  return { role, isAdmin, isSuperAdmin };
}

/**
 * Hook to check access to a single feature
 */
export function useFeatureAccess(featureName: string) {
  const { user, profile } = useAuth();
  const { role } = useUserRole();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAccess = useCallback(async () => {
    if (!user?.id || !profile?.household_id || !role) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // For now, just allow access to basic features
      setHasAccess(true);
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.household_id, featureName, role]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return { hasAccess, loading, refetch: checkAccess };
}

/**
 * Component that conditionally renders children based on feature access
 */
interface FeatureGateProps {
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  showDisabled?: boolean;
  disabledClassName?: string;
}

export function FeatureGate({
  featureName,
  children,
  fallback = null,
  loadingComponent,
  showDisabled = false,
  disabledClassName = 'opacity-50 cursor-not-allowed'
}: FeatureGateProps) {
  const { hasAccess, loading } = useFeatureAccess(featureName);

  if (loading) {
    return loadingComponent || <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>;
  }

  if (!hasAccess) {
    if (showDisabled) {
      return (
        <div className={disabledClassName} title="Access restricted">
          {children}
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Utility functions for direct access checks (non-reactive)
 */
export const getFeatureAccess = (userRole: UserRole, featureName: string): boolean => {
  // For now, just return true for basic access
  return true;
};

export default useFeatureAccess;
