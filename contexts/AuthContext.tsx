/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types_db';
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
  const fireInfo = (msg: string, data?: any) => { try { if (!FAST_AUTH_LOG) (authLogger as any).info(msg, data); } catch {} };
  const fireWarn = (msg: string, data?: any) => { try { if (!FAST_AUTH_LOG) (authLogger as any).warn(msg, data); } catch {} };
  const fireError = (msg: string, data?: any) => { try { if (!FAST_AUTH_LOG) (authLogger as any).error(msg, data); } catch {} };

  // Validate env early
  useEffect(() => {
    if (!envValid) {
      fireError('❌ [AUTH] Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)');
      setLoading(false);
    }
  }, [envValid]);

  // Fallback timeout to prevent infinite loading spinner
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => { if (loading) { fireWarn('⚠️ [AUTH] Loading timeout fallback (5s) – forcing UI continuation', { envValid }); setLoading(false); } }, 5000);
    const safety = setTimeout(() => { if (loading) { fireWarn('⚠️ [AUTH] Secondary safety timeout (12s)', { envValid }); setLoading(false); } }, 12000);
    return () => { clearTimeout(t); clearTimeout(safety); };
  }, [loading, envValid]);

  const fetchUserData = async (currentUser: User) => {
    try {
      fireInfo('🔍 [AUTH] Fetching profile', { userId: currentUser.id });
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (profileError) fireError('❌ [AUTH] Profile fetch error', { userId: currentUser.id, error: profileError });
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
  };

  const refreshUser = async () => {
    try {
      fireInfo('🔄 [AUTH] Refreshing session');
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error && error.message?.includes('refresh_token_not_found')) {
        fireWarn('🔄 [AUTH] Refresh token expired – clearing session');
        setUser(null); setProfile(null); setPermissions(null); await supabase.auth.signOut(); return; }
      if (error) throw error;
      setUser(currentUser);
      if (currentUser) await fetchUserData(currentUser); else { setProfile(null); setPermissions(null); }
    } catch (err) { fireError('❌ [AUTH] refreshUser error', { error: err }); setUser(null); setProfile(null); setPermissions(null); }
    finally { setLoading(false); }
  };

  const signOut = async () => { try { fireInfo('🚪 [AUTH] Signing out', { userId: user?.id }); await supabase.auth.signOut(); setUser(null); setProfile(null); setPermissions(null); fireInfo('✅ [AUTH] Sign out complete'); } catch (err) { fireError('❌ [AUTH] signOut error', { error: err }); } };

  useEffect(() => {
    if (!envValid) return;
    fireInfo('🚀 [AUTH] AuthContext init',{ FAST_AUTH_LOG });
    refreshUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      fireInfo('🔄 [AUTH] Auth state change', { event, hasSession: !!session });
      const currentUser = session?.user ?? null; setUser(currentUser);
      if (currentUser) await fetchUserData(currentUser); else { setProfile(null); setPermissions(null); }
      setLoading(false);
    });
    return () => { fireInfo('🧹 [AUTH] Cleanup'); subscription.unsubscribe(); };
  }, [envValid]);

  const value = { user, profile, permissions, loading, signOut, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
