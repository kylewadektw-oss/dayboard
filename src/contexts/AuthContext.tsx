"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  isAuthenticated: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refreshProfile = async () => {
    // Profile refreshing is handled by individual pages
    console.log('ℹ️ Profile refresh requested - handled by pages');
  };

  useEffect(() => {
    let isMounted = true;
    
    // Only run once - prevent infinite loops
    if (initialized) return;

    const getInitialSession = async () => {
      try {
        console.log('🔄 AuthContext: Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        console.log('✅ Initial session found:', session?.user?.id || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
      } catch {
        console.log('ℹ️ Session retrieval failed - treating as logged out');
        if (isMounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          console.log('🏁 AuthContext initialization complete');
        }
      }
    };

    getInitialSession();

    // Set up auth state listener (only once)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('🔄 Auth state change:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]); // Empty dependency array - run only once

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      console.log('✅ Signed out successfully');
    } catch {
      console.log('ℹ️ Sign out completed (with cleanup)');
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!(session?.user && user?.id);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
