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

        console.log('🔍 [DEBUG] Final profile data:', profileData);
        setProfile(profileData ?? null);

        // Fetch permissions
        try {
          const { data: permissionsData, error: permissionsError } =
            await supabase
              .from('user_permissions')
              .select('*')
              .eq('user_id', currentUser.id)
              .maybeSingle();

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
            console.log('🔍 [DEBUG] Permissions data:', permissionsData);
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

      // Method 1: Get session from client
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
        fireError('❌ [AUTH] Session error: ' + sessionError.message);
      }

      // Method 2: If no session, try getUser as fallback
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
          fireError('❌ [AUTH] User retrieval error: ' + userError.message);
        }
      }

      if (user) {
        fireInfo('👤 [AUTH] User authenticated', {
          userId: user.id,
          email: user.email
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
        new URLSearchParams(window.location.search).has('code'));

    if (!isOAuthCallback) {
      // Normal initialization - check for existing session
      refreshUser();
    } else {
      fireInfo('🔄 [AUTH] OAuth callback detected - enhanced processing');
      // For OAuth callbacks, wait a bit longer and try multiple times
      setTimeout(() => {
        fireInfo('🔄 [AUTH] First OAuth session check attempt');
        refreshUser().then(() => {
          // If still no user after first attempt, try again
          if (!user) {
            fireInfo('🔄 [AUTH] No user found, retrying in 500ms');
            setTimeout(() => {
              fireInfo('🔄 [AUTH] Second OAuth session check attempt');
              refreshUser();
            }, 500);
          }
        });
      }, 500); // Increased wait time for OAuth processing
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
  
  // Debug logging for auth state
  console.log('🔧 [AUTH DEBUG] Context value:', {
    hasUser: !!user,
    userId: user?.id,
    hasProfile: !!profile,
    loading: value.loading,
    rawLoading: loading,
    initialLoadComplete
  });
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
