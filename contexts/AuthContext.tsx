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

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/src/lib/types_db';
import { authLogger } from '@/utils/logger';

// Types
type Profile = Database['public']['Tables']['profiles']['Row'];
type UserPermissions = Database['public']['Tables']['user_permissions']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  permissions: UserPermissions | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const supabase = createClient();
  const envValid = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const FAST_AUTH_LOG =
    process.env.NEXT_PUBLIC_FAST_AUTH_LOG === '1' ||
    process.env.NEXT_PUBLIC_FAST_AUTH_LOG === 'true';

  // Lightweight no-wait wrappers
  const fireInfo = useCallback(
    (msg: string, data?: Record<string, unknown>) => {
      try {
        if (!FAST_AUTH_LOG) authLogger.info(msg, data);
      } catch {}
    },
    [FAST_AUTH_LOG]
  );
  const fireWarn = useCallback(
    (msg: string, data?: Record<string, unknown>) => {
      try {
        if (!FAST_AUTH_LOG) authLogger.warn(msg, data);
      } catch {}
    },
    [FAST_AUTH_LOG]
  );
  const fireError = useCallback(
    (msg: string, data?: Record<string, unknown>) => {
      try {
        if (!FAST_AUTH_LOG) authLogger.error(msg, data);
      } catch {}
    },
    [FAST_AUTH_LOG]
  );

  // Stable loading state management to prevent oscillation
  const setLoadingStable = useCallback(
    (newLoading: boolean) => {
      if (newLoading && initialLoadComplete) {
        // Once initial load is complete, don't go back to loading unless explicitly needed
        return;
      }
      if (!newLoading && !initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      setLoading(newLoading);
    },
    [initialLoadComplete]
  );

  // Validate env early
  useEffect(() => {
    if (!envValid) {
      fireError(
        '❌ [AUTH] Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)'
      );
      setLoadingStable(false);
    }
  }, [envValid, fireError, setLoadingStable]);

  // Fallback timeout to prevent infinite loading spinner
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      if (loading) {
        fireWarn(
          '⚠️ [AUTH] Loading timeout fallback (5s) – forcing UI continuation',
          { envValid }
        );
        setLoadingStable(false);
      }
    }, 5000);
    const safety = setTimeout(() => {
      if (loading) {
        fireWarn('⚠️ [AUTH] Secondary safety timeout (12s)', { envValid });
        setLoadingStable(false);
      }
    }, 12000);
    return () => {
      clearTimeout(t);
      clearTimeout(safety);
    };
  }, [loading, envValid, fireWarn, setLoadingStable]);

  const fetchUserData = useCallback(
    async (currentUser: User) => {
      try {
        fireInfo('🔍 [AUTH] Fetching profile', { userId: currentUser.id });

        // Add retry logic for profile fetching
        let profileData = null;
        let profileError = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          profileData = data;
          profileError = error;

          fireInfo(`🔍 [AUTH] Profile fetch attempt ${attempt}`, {
            userId: currentUser.id,
            hasProfile: !!profileData,
            hasError: !!profileError,
            profileId: profileData?.id,
            errorMessage: profileError?.message
          });

          if (profileData || !profileError) break;

          // Wait between retries
          if (attempt < 3) {
            fireInfo(
              `⏱️ [AUTH] Retrying profile fetch in 1s (attempt ${attempt + 1}/3)`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        if (profileError) {
          fireError(
            '❌ [AUTH] Profile fetch error after retries: ' +
              profileError.message
          );
        }

        // Disable debug logging for performance
        // console.log('🔍 [DEBUG] Final profile data:', profileData);
        setProfile(profileData ?? null);

        // Fetch permissions - use profile.id instead of user_id for foreign key
        try {
          // First try with profile.id (correct foreign key)
          let permissionsData = null;
          let permissionsError = null;
          
          if (profileData?.id) {
            const { data, error } = await supabase
              .from('user_permissions')
              .select('*')
              .eq('user_id', profileData.id)
              .maybeSingle();
            permissionsData = data;
            permissionsError = error;
          }

          if (permissionsError) {
            if (permissionsError.message.includes('Could not find the table'))
              fireWarn(
                '⚠️ [AUTH] user_permissions table missing – using defaults',
                { userId: currentUser.id }
              );
            else
              fireError(
                '❌ [AUTH] Permissions fetch error: ' + permissionsError.message
              );
            setPermissions(null);
          } else {
            // Disable debug logging for performance
            // console.log('🔍 [DEBUG] Permissions data:', permissionsData);
            setPermissions(permissionsData ?? null);
          }
        } catch (permErr) {
          const errorMsg =
            permErr instanceof Error ? permErr.message : 'Unknown error';
          fireWarn(
            '⚠️ [AUTH] Permissions fetch exception – defaults: ' + errorMsg
          );
          setPermissions(null);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        fireError('❌ [AUTH] fetchUserData critical error: ' + errorMsg);
      }
    },
    [supabase, fireInfo, fireError, fireWarn]
  );

  const refreshUser = useCallback(async () => {
    try {
      fireInfo('🔄 [AUTH] Starting session check', { FAST_AUTH_LOG });
      setLoadingStable(true);

      // Try multiple session retrieval methods for better reliability
      let session = null;
      let user = null;

      // Method 1: Force session refresh first to ensure we have the latest state
      fireInfo('🔄 [AUTH] Forcing session refresh for latest state');
      const refreshResult = await supabase.auth.refreshSession();
      if (refreshResult.data?.session && !refreshResult.error) {
        session = refreshResult.data.session;
        user = session.user;
        fireInfo('✅ [AUTH] Session found via refreshSession', {
          userId: user?.id,
          method: 'refreshSession',
          hasTokens: !!(session.access_token && session.refresh_token)
        });
      } else if (refreshResult.error && !refreshResult.error.message.includes('session_not_found')) {
        fireWarn('⚠️ [AUTH] Session refresh error: ' + refreshResult.error.message);
      }

      // Method 2: Get session from client if refresh didn't work
      if (!session) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionData?.session && !sessionError) {
          session = sessionData.session;
          user = session.user;
          fireInfo('✅ [AUTH] Session found via getSession', {
            userId: user?.id,
            method: 'getSession',
            hasTokens: !!(session.access_token && session.refresh_token)
          });
        } else if (sessionError) {
          // Handle session errors gracefully
          if (sessionError.message.includes('Auth session missing') || 
              sessionError.message.includes('session_not_found') ||
              sessionError.message.includes('invalid_token')) {
            fireInfo('ℹ️ [AUTH] No valid session found during getSession');
          } else {
            fireError('❌ [AUTH] Session error: ' + sessionError.message);
          }
        }
      }

      // Method 3: If no session, try getUser as fallback
      if (!user) {
        fireInfo('🔄 [AUTH] Trying getUser as fallback');
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userData?.user && !userError) {
          user = userData.user;
          fireInfo('✅ [AUTH] User found via getUser', {
            userId: user.id,
            method: 'getUser'
          });
        } else if (userError) {
          // Handle session missing gracefully - this is normal when not logged in
          if (userError.message.includes('Auth session missing') || 
              userError.message.includes('session_not_found') ||
              userError.message.includes('invalid_token')) {
            fireInfo('ℹ️ [AUTH] No valid session found - user not authenticated');
          } else {
            fireError('❌ [AUTH] User retrieval error: ' + userError.message);
          }
        }
      }

      if (user) {
        fireInfo('👤 [AUTH] User authenticated', {
          userId: user.id,
          email: user.email,
          hasSession: !!session
        });
        setUser(user);
        setLoadingStable(false); // Set loading to false immediately for faster UI

        // Fetch profile in background for better performance
        fetchUserData(user).catch((err) =>
          fireError(
            '❌ [AUTH] Background profile fetch failed: ' +
              (err?.message || 'Unknown error')
          )
        );
      } else {
        fireInfo('👤 [AUTH] No authenticated user found');
        
        // Try to refresh the session if we have refresh tokens
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshData?.session && !refreshError) {
            fireInfo('✅ [AUTH] Session refreshed successfully');
            setUser(refreshData.session.user);
            setLoadingStable(false);
            
            // Fetch profile data for refreshed user
            fetchUserData(refreshData.session.user).catch((err) =>
              fireError('❌ [AUTH] Profile fetch after refresh failed: ' + (err?.message || 'Unknown error'))
            );
            return; // Exit early since we found a valid session
          } else if (refreshError && !refreshError.message.includes('session_not_found')) {
            fireWarn('⚠️ [AUTH] Session refresh failed: ' + refreshError.message);
          }
        } catch {
          fireInfo('ℹ️ [AUTH] No session to refresh');
        }
        
        // Clear all auth state if no valid session
        setUser(null);
        setProfile(null);
        setPermissions(null);
        setLoadingStable(false);
      }
    } catch (error) {
      fireError(
        '💥 [AUTH] Critical refresh error: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
      setUser(null);
      setProfile(null);
      setPermissions(null);
      setLoadingStable(false);
    }
  }, [
    supabase.auth,
    fetchUserData,
    fireInfo,
    fireError,
    fireWarn,
    FAST_AUTH_LOG,
    setLoadingStable
  ]);

  const signOut = async () => {
    try {
      fireInfo('🚪 [AUTH] Signing out', { userId: user?.id });
      // Clear auth state immediately
      setUser(null);
      setProfile(null);
      setPermissions(null);
      // Sign out from Supabase (this clears cookies)
      await supabase.auth.signOut();
      fireInfo('✅ [AUTH] Sign out complete');
    } catch (err) {
      fireError('❌ [AUTH] signOut error', { error: err });
      // Even if signOut fails, clear local state
      setUser(null);
      setProfile(null);
      setPermissions(null);
    }
  };

  useEffect(() => {
    if (!envValid) return;
    fireInfo('🚀 [AUTH] AuthContext init', { FAST_AUTH_LOG });

    // Check if we're in an OAuth callback
    const isOAuthCallback =
      typeof window !== 'undefined' &&
      (window.location.hash.includes('access_token') ||
        window.location.hash.includes('refresh_token') ||
        window.location.pathname.includes('/auth/callback') ||
        window.location.pathname.includes('/auth/success') ||
        new URLSearchParams(window.location.search).has('code') ||
        document.cookie.includes('sb-session-exists=true'));

    fireInfo('🔄 [AUTH] Initializing auth context', {
      isOAuthCallback,
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
      hasCodeParam: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).has('code') : false,
      hasSessionCookie: typeof window !== 'undefined' ? document.cookie.includes('sb-session-exists=true') : false,
      hasHashTokens: typeof window !== 'undefined' ? (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token')) : false
    });

    if (!isOAuthCallback) {
      // Normal initialization - check for existing session
      refreshUser();
    } else {
      fireInfo('🔄 [AUTH] OAuth callback detected - enhanced processing');
      // For OAuth callbacks, use more aggressive session detection
      const attemptSessionRecovery = async () => {
        // Try multiple times with different methods
        for (let attempt = 1; attempt <= 5; attempt++) {
          fireInfo(`🔄 [AUTH] OAuth session recovery attempt ${attempt}/5`);
          
          // Force refresh session first to ensure latest state
          const refreshResult = await supabase.auth.refreshSession();
          if (refreshResult.data?.session) {
            fireInfo('✅ [AUTH] Session recovered via refreshSession');
          }
          
          // Then try to get user
          await refreshUser();
          
          // Check if we now have a user
          if (user) {
            fireInfo('✅ [AUTH] OAuth session recovered successfully');
            return;
          }
          
          // Wait between attempts, increasing delay
          const delay = attempt * 400;
          fireInfo(`⏳ [AUTH] Waiting ${delay}ms before next attempt`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        fireWarn('⚠️ [AUTH] OAuth session recovery failed after all attempts');
      };
      
      // Start recovery process after a brief delay
      setTimeout(attemptSessionRecovery, 300);
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      fireInfo('🔄 [AUTH] Auth state change', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        hasAccessToken: !!session?.access_token,
        hasRefreshToken: !!session?.refresh_token
      });

      if (event === 'SIGNED_OUT' || !session) {
        fireInfo('👋 [AUTH] User signed out or session lost');
        setUser(null);
        setProfile(null);
        setPermissions(null);
        setLoadingStable(false);

        // Clear any stale data and redirect to home if needed
        if (
          typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/dashboard')
        ) {
          window.location.href = '/';
        }
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fireInfo('✅ [AUTH] User authenticated', {
          event,
          userId: session?.user?.id,
          hasValidTokens: !!(session?.access_token && session?.refresh_token)
        });
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoadingStable(false); // Set loading to false immediately for faster UI

        if (currentUser) {
          // Fetch profile in background for better performance
          fetchUserData(currentUser).catch((err) =>
            fireError('❌ [AUTH] Background profile fetch failed', {
              error: err
            })
          );
        } else {
          setProfile(null);
          setPermissions(null);
        }
      }
    });

    return () => {
      fireInfo('🧹 [AUTH] Cleanup');
      subscription.unsubscribe();
    };
  }, [
    envValid,
    FAST_AUTH_LOG,
    fetchUserData,
    fireInfo,
    fireError,
    fireWarn,
    refreshUser,
    supabase.auth,
    user,
    setLoadingStable
  ]);

  const value = { 
    user, 
    profile, 
    permissions, 
    loading: loading && !initialLoadComplete, // Don't show loading after initial load
    signOut, 
    refreshUser 
  };
  
  // Debug logging removed for performance
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
