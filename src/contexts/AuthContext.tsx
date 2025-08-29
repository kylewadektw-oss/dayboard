"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabaseClient';
import { securityLogger, logAuthAttempt, logSecurityViolation } from '../lib/securityLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSecureSession: boolean;
  sessionMetadata: {
    loginTime?: Date;
    lastActivity?: Date;
    deviceFingerprint?: string;
  };
}

// Session security configuration
const SESSION_CONFIG = {
  MAX_IDLE_TIME: 30 * 60 * 1000, // 30 minutes
  SESSION_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
};

// Generate a simple device fingerprint
function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('security-fingerprint', 2, 2);
  const canvasFingerprint = canvas.toDataURL();
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasFingerprint.slice(-50) // Last 50 chars
  };
  
  // Simple hash of fingerprint data
  return btoa(JSON.stringify(fingerprint)).slice(0, 32);
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  isSecureSession: false,
  sessionMetadata: {},
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
  const [sessionMetadata, setSessionMetadata] = useState<AuthContextType['sessionMetadata']>({});
  const [isSecureSession, setIsSecureSession] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Validate session security
  const validateSessionSecurity = (session: Session | null): boolean => {
    if (!session) return false;
    
    const now = Date.now();
    const sessionStart = sessionMetadata.loginTime?.getTime() || now;
    const lastActivity = sessionMetadata.lastActivity?.getTime() || now;
    
    // Check session duration
    if (now - sessionStart > SESSION_CONFIG.MAX_SESSION_DURATION) {
      logSecurityViolation('session_duration_exceeded', session.user.id, {
        sessionDuration: now - sessionStart,
        maxDuration: SESSION_CONFIG.MAX_SESSION_DURATION
      });
      return false;
    }
    
    // Check idle time
    if (now - lastActivity > SESSION_CONFIG.MAX_IDLE_TIME) {
      logSecurityViolation('session_idle_timeout', session.user.id, {
        idleTime: now - lastActivity,
        maxIdleTime: SESSION_CONFIG.MAX_IDLE_TIME
      });
      return false;
    }
    
    return true;
  };

  // Update last activity timestamp
  const updateActivity = () => {
    setSessionMetadata(prev => ({
      ...prev,
      lastActivity: new Date()
    }));
  };

  // Initialize activity tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const throttledUpdate = (() => {
      let timeout: NodeJS.Timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(updateActivity, 1000); // Throttle to once per second
      };
    })();

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdate, true);
      });
    };
  }, []);

  // Session validation interval
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const isValid = validateSessionSecurity(session);
      setIsSecureSession(isValid);
      
      if (!isValid) {
        signOut();
      }
    }, SESSION_CONFIG.SESSION_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [session, sessionMetadata]);

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        logAuthAttempt(false, undefined, { error: error.message });
      } else {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Initialize session metadata
          const fingerprint = generateDeviceFingerprint();
          setSessionMetadata({
            loginTime: new Date(),
            lastActivity: new Date(),
            deviceFingerprint: fingerprint
          });
          setIsSecureSession(true);

          // Fetch profile
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          
          logAuthAttempt(true, session.user.id, {
            deviceFingerprint: fingerprint,
            loginMethod: 'session_recovery'
          });
        }
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Initialize or update session metadata
          const fingerprint = generateDeviceFingerprint();
          
          if (event === 'SIGNED_IN') {
            setSessionMetadata({
              loginTime: new Date(),
              lastActivity: new Date(),
              deviceFingerprint: fingerprint
            });
            setIsSecureSession(true);
            
            logAuthAttempt(true, session.user.id, {
              deviceFingerprint: fingerprint,
              loginMethod: event
            });
          }

          // Fetch profile when user signs in
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          // Clear session metadata on sign out
          setSessionMetadata({});
          setProfile(null);
          setIsSecureSession(false);
          
          if (event === 'SIGNED_OUT') {
            logAuthAttempt(true, undefined, { action: 'logout' });
          }
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const currentUserId = user?.id;
      
      // Log the logout attempt
      logAuthAttempt(true, currentUserId, { action: 'manual_logout' });
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear session data
      setSessionMetadata({});
      setIsSecureSession(false);
      
      // Clear sensitive data from browser
      if (typeof window !== 'undefined') {
        // Clear any cached sensitive data
        sessionStorage.clear();
        
        // Clear specific auth-related localStorage items
        const authKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('auth')
        );
        authKeys.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Sign out error:', error);
      logSecurityViolation('logout_failed', user?.id, { error: (error as Error).message });
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
    isSecureSession,
    sessionMetadata,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
