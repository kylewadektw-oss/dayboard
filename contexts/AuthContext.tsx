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

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  const supabase = createClient();
  const envValid = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const FAST_AUTH_LOG = process.env.NEXT_PUBLIC_FAST_AUTH_LOG === '1' || process.env.NEXT_PUBLIC_FAST_AUTH_LOG === 'true';

  // Lightweight no-wait wrappers
  const fireInfo = useCallback((msg: string, data?: Record<string, unknown>) => { try { if (!FAST_AUTH_LOG) authLogger.info(msg, data); } catch {} }, [FAST_AUTH_LOG]);
  const fireWarn = useCallback((msg: string, data?: Record<string, unknown>) => { try { if (!FAST_AUTH_LOG) authLogger.warn(msg, data); } catch {} }, [FAST_AUTH_LOG]);
  const fireError = useCallback((msg: string, data?: Record<string, unknown>) => { try { if (!FAST_AUTH_LOG) authLogger.error(msg, data); } catch {} }, [FAST_AUTH_LOG]);

  // Validate env early
  useEffect(() => {
    if (!envValid) {
      fireError('❌ [AUTH] Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)');
      setLoading(false);
    }
  }, [envValid, fireError]);

  // Fallback timeout to prevent infinite loading spinner
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => { if (loading) { fireWarn('⚠️ [AUTH] Loading timeout fallback (5s) – forcing UI continuation', { envValid }); setLoading(false); } }, 5000);
    const safety = setTimeout(() => { if (loading) { fireWarn('⚠️ [AUTH] Secondary safety timeout (12s)', { envValid }); setLoading(false); } }, 12000);
    return () => { clearTimeout(t); clearTimeout(safety); };
  }, [loading, envValid, fireWarn]);

  const fetchUserData = useCallback(async (currentUser: User) => {
    try {
      fireInfo('🔍 [AUTH] Fetching profile', { userId: currentUser.id });
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (profileError) fireError('❌ [AUTH] Profile fetch error', { userId: currentUser.id, error: profileError });
      console.log('🔍 [DEBUG] Profile data fetched:', profileData);
      setProfile(profileData ?? null);

      try {
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (permissionsError) {
          if (permissionsError.message.includes('Could not find the table')) fireWarn('⚠️ [AUTH] user_permissions table missing – using defaults', { userId: currentUser.id });
          else fireError('❌ [AUTH] Permissions fetch error', { userId: currentUser.id, error: permissionsError });
          setPermissions(null);
        } else setPermissions(permissionsData ?? null);
      } catch (permErr) { fireWarn('⚠️ [AUTH] Permissions fetch exception – defaults', { userId: currentUser.id, error: permErr }); setPermissions(null); }
    } catch (err) { fireError('❌ [AUTH] fetchUserData critical error', { userId: currentUser.id, error: err }); }
  }, [supabase, fireInfo, fireError, fireWarn]);

  const refreshUser = useCallback(async () => {
    try {
      fireInfo('🔄 [AUTH] Refreshing session');
      
      // First try to get the current session from storage/cookies
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        fireWarn('⚠️ [AUTH] Session error during refresh', { error: sessionError.message });
      }
      
      // If we have a valid session, use it
      if (session?.user && session?.access_token) {
        fireInfo('✅ [AUTH] Valid session found during refresh', { userId: session.user.id });
        setUser(session.user);
        await fetchUserData(session.user);
        return;
      }
      
      // If no session or session is invalid, try to get user directly
      // This will attempt to refresh the token if needed
      fireInfo('🔄 [AUTH] No valid session found, attempting token refresh');
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('Invalid Refresh Token') ||
            error.message?.includes('Refresh Token Not Found')) {
          fireWarn('🔄 [AUTH] Refresh token invalid - user needs to sign in again', { error: error.message });
          setUser(null); 
          setProfile(null); 
          setPermissions(null);
          return;
        }
        throw error;
      }
      
      setUser(currentUser);
      if (currentUser) {
        fireInfo('✅ [AUTH] User refreshed successfully', { userId: currentUser.id });
        await fetchUserData(currentUser);
      } else { 
        fireInfo('ℹ️ [AUTH] No user found after refresh');
        setProfile(null); 
        setPermissions(null); 
      }
    } catch (err) { 
      fireError('❌ [AUTH] refreshUser error', { error: err }); 
      setUser(null); 
      setProfile(null); 
      setPermissions(null); 
    }
    finally { 
      setLoading(false); 
    }
  }, [supabase, fireInfo, fireWarn, fireError, fetchUserData]);

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
    fireInfo('🚀 [AUTH] AuthContext init',{ FAST_AUTH_LOG });
    
    // Check if we're in an OAuth callback or have OAuth tokens in URL
    const isOAuthCallback = typeof window !== 'undefined' && 
      (window.location.hash.includes('access_token') || 
       window.location.hash.includes('refresh_token') ||
       window.location.pathname.includes('/auth/callback') ||
       new URLSearchParams(window.location.search).has('code'));
    
    if (!isOAuthCallback) {
      // Normal initialization - check for existing session
      refreshUser();
    } else {
      fireInfo('🔄 [AUTH] OAuth callback detected - waiting for Supabase to handle tokens');
      // For OAuth callbacks, wait a moment for Supabase to process the tokens
      // then set loading to false since the auth state change handler will take over
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        setLoading(false);
        
        // Clear any stale data and redirect to home if needed
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
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
        
        if (currentUser) {
          await fetchUserData(currentUser);
        } else {
          setProfile(null);
          setPermissions(null);
        }
        setLoading(false);
      }
    });
    
    return () => { 
      fireInfo('🧹 [AUTH] Cleanup'); 
      subscription.unsubscribe(); 
    };
  }, [envValid, FAST_AUTH_LOG, fetchUserData, fireInfo, refreshUser, supabase.auth]);

  const value = { user, profile, permissions, loading, signOut, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
