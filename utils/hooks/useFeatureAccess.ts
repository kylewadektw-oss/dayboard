/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Feature Access React Hook
 * 
 * This hook provides React components with access to role-based feature control.
 * It integrates with the authentication system and feature access database.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  featureAccessManager, 
  checkFeatureAccess,
  checkMultipleFeatureAccess,
  getDefaultAccess,
  type FeatureName,
  type UserRole 
} from '@/utils/feature-access';
import { logger } from '@/utils/logger';

interface FeatureAccessState {
  isLoading: boolean;
  error: string | null;
  userRole: UserRole;
  hasAccess: (featureName: FeatureName) => boolean;
  checkAccess: (featureName: FeatureName) => Promise<boolean>;
  checkMultiple: (featureNames: FeatureName[]) => Promise<Record<FeatureName, boolean>>;
  refreshAccess: () => Promise<void>;
}

/**
 * React hook for checking feature access in components
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasAccess, isLoading, userRole } = useFeatureAccess();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return (
 *     <div>
 *       {hasAccess('meals_tab') && <MealsTab />}
 *       {hasAccess('admin_panel') && <AdminPanel />}
 *       <p>User role: {userRole}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureAccess(): FeatureAccessState {
  const { user, loading: authLoading } = useAuth();
  const [accessCache, setAccessCache] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user role on mount or user change
  useEffect(() => {
    let isMounted = true;

    async function loadUserRole() {
      if (!user?.id) {
        setUserRole('member');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const role = await featureAccessManager.getUserRole(user.id);
        
        if (isMounted) {
          setUserRole(role);
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('Failed to load user role', 'useFeatureAccess', {
          error: err instanceof Error ? err.message : 'Unknown error',
          userId: user.id
        });

        if (isMounted) {
          setError('Failed to load user permissions');
          setUserRole('member'); // Safe fallback
          setIsLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadUserRole();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading]);

  // Check feature access with caching
  const checkAccess = useCallback(async (featureName: FeatureName): Promise<boolean> => {
    if (!user?.id) {
      // Return default access for non-authenticated users (typically core features only)
      return getDefaultAccess('member', featureName);
    }

    const cacheKey = `${user.id}:${featureName}`;
    
    // Return cached result if available
    if (cacheKey in accessCache) {
      return accessCache[cacheKey];
    }

    try {
      const hasAccess = await checkFeatureAccess(user.id, featureName);
      
      // Cache the result
      setAccessCache(prev => ({
        ...prev,
        [cacheKey]: hasAccess
      }));

      return hasAccess;
    } catch (err) {
      logger.error('Feature access check failed', 'useFeatureAccess', {
        error: err instanceof Error ? err.message : 'Unknown error',
        userId: user.id,
        featureName
      });

      // Fallback to default access for the user's role
      return getDefaultAccess(userRole, featureName);
    }
  }, [user?.id, accessCache, userRole]);

  // Check multiple features at once
  const checkMultiple = useCallback(async (featureNames: FeatureName[]): Promise<Record<FeatureName, boolean>> => {
    if (!user?.id) {
      // Return default access for non-authenticated users
      const results: Record<string, boolean> = {};
      featureNames.forEach(featureName => {
        results[featureName] = getDefaultAccess('member', featureName);
      });
      return results as Record<FeatureName, boolean>;
    }

    try {
      const results = await checkMultipleFeatureAccess(user.id, featureNames);
      
      // Cache all results
      const newCache: Record<string, boolean> = {};
      Object.entries(results).forEach(([featureName, hasAccess]) => {
        const cacheKey = `${user.id}:${featureName}`;
        newCache[cacheKey] = hasAccess;
      });

      setAccessCache(prev => ({
        ...prev,
        ...newCache
      }));

      return results;
    } catch (err) {
      logger.error('Multiple feature access check failed', 'useFeatureAccess', {
        error: err instanceof Error ? err.message : 'Unknown error',
        userId: user.id,
        featureCount: featureNames.length
      });

      // Fallback to default access for the user's role
      const results: Record<string, boolean> = {};
      featureNames.forEach(featureName => {
        results[featureName] = getDefaultAccess(userRole, featureName);
      });
      return results as Record<FeatureName, boolean>;
    }
  }, [user?.id, userRole]);

  // Synchronous access check using cache (for render-time decisions)
  const hasAccess = useCallback((featureName: FeatureName): boolean => {
    if (!user?.id) {
      return getDefaultAccess('member', featureName);
    }

    const cacheKey = `${user.id}:${featureName}`;
    
    // Use cached result if available
    if (cacheKey in accessCache) {
      return accessCache[cacheKey];
    }

    // Fallback to default role-based access if not cached
    return getDefaultAccess(userRole, featureName);
  }, [user?.id, accessCache, userRole]);

  // Refresh access cache
  const refreshAccess = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Clear cache to force fresh checks
      setAccessCache({});

      // Reload user role
      const role = await featureAccessManager.getUserRole(user.id);
      setUserRole(role);

      logger.info('Feature access cache refreshed', 'useFeatureAccess', {
        userId: user.id,
        newRole: role
      });
    } catch (err) {
      logger.error('Failed to refresh feature access', 'useFeatureAccess', {
        error: err instanceof Error ? err.message : 'Unknown error',
        userId: user.id
      });

      setError('Failed to refresh permissions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    isLoading: isLoading || authLoading,
    error,
    userRole,
    hasAccess,
    checkAccess,
    checkMultiple,
    refreshAccess
  };
}

/**
 * Hook for checking a single feature access
 * Automatically loads and caches the result
 */
export function useFeatureAccessCheck(featureName: FeatureName) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAccess() {
      if (!user?.id) {
        if (isMounted) {
          setHasAccess(getDefaultAccess('member', featureName));
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const access = await checkFeatureAccess(user.id, featureName);
        
        if (isMounted) {
          setHasAccess(access);
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('Single feature access check failed', 'useFeatureAccessCheck', {
          error: err instanceof Error ? err.message : 'Unknown error',
          userId: user.id,
          featureName
        });

        if (isMounted) {
          setError('Failed to check feature access');
          setHasAccess(false); // Safe fallback
          setIsLoading(false);
        }
      }
    }

    loadAccess();

    return () => {
      isMounted = false;
    };
  }, [user?.id, featureName]);

  return {
    hasAccess: hasAccess ?? false,
    isLoading,
    error
  };
}

/**
 * Hook for admin/super_admin role checks
 */
export function useAdminAccess() {
  const { userRole, isLoading } = useFeatureAccess();

  return {
    isAdmin: userRole === 'admin' || userRole === 'super_admin',
    isSuperAdmin: userRole === 'super_admin',
    canManageUsers: userRole === 'super_admin',
    canManageHousehold: userRole === 'admin' || userRole === 'super_admin',
    userRole,
    isLoading
  };
}