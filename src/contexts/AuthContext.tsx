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

  const fetchProfile = async (userId: string) => {
    // Validate userId before attempting fetch
    if (!userId || userId.length < 10) {
      console.log('⚠️ Invalid user ID, skipping profile fetch');
      return null;
    }

    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('📊 Query result:', { 
        hasData: !!data, 
        hasError: !!error,
        dataName: data?.name
      });

      // Any error or no data means no profile (normal for new users)
      if (error || !data) {
        console.log('ℹ️ No profile found - this is normal for new users');
        return null;
      }

      console.log('✅ Profile fetched successfully:', data.name || 'Unnamed');
      return data;

    } catch (error) {
      console.log('ℹ️ Profile fetch failed - treating as new user (timeout or other issue)');
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      try {
        console.log('🔄 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.log('ℹ️ Session retrieval error - treating as logged out');
          setUser(null);
          setSession(null);
        } else {
          console.log('✅ Initial session:', session?.user?.id || 'No user');
          setSession(session);
          setUser(session?.user ?? null);

          // Fetch profile if user exists
          if (session?.user) {
            console.log('👤 Fetching profile for user:', session.user.id);
            const profileData = await fetchProfile(session.user.id);
            if (isMounted) {
              console.log('📝 Profile data:', profileData ? 'Found' : 'Not found');
              setProfile(profileData);
            }
          } else {
            console.log('👻 No user in session');
          }
        }
              } catch (sessionError) {
          console.log('ℹ️ Session retrieval failed - treating as logged out');
          setUser(null);
          setProfile(null);
          setLoading(false);
        } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          console.log('🏁 Auth initialization complete');
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('🔄 Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile when user signs in
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData);
          }
        } else {
          // Clear profile when user signs out
          if (isMounted) {
            setProfile(null);
          }
        }

        if (isMounted && initialized) {
          setLoading(false);
        }
      }
    );

    // Listen for page visibility changes to refresh auth state
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('👁️ Page became visible, refreshing auth state');
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session?.user && user) {
            console.log('🔄 Session expired, clearing user state');
            setUser(null);
            setSession(null);
            setProfile(null);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialized, user]);

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (loading && !initialized) {
        console.warn('⚠️ Emergency: Forcing auth loading to false after 5 seconds');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000);

    return () => clearTimeout(emergencyTimeout);
  }, [loading, initialized]);

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      setLoading(true); // Show loading during sign out
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.log('ℹ️ Sign out failed, but cleared local state');
      setLoading(false);
    }
  };

  // Simple session validation that doesn't rely on database
  const isAuthenticated = () => {
    return !!(session?.user && user?.id);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    initialized,
    signOut,
    refreshProfile,
    isAuthenticated, // Add the new method
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
