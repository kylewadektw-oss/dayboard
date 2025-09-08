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
import { authLogger, LogLevel } from '@/utils/logger';

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

  const fetchUserData = async (currentUser: User) => {
    try {
      await authLogger.info(`🔍 [AUTH] Starting profile fetch for user: ${currentUser.id}`, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        userMetadata: currentUser.user_metadata
      });
      
      // Fetch profile - use user_id as foreign key to auth.users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle(); // Use maybeSingle to avoid error if no profile

      if (profileError) {
        await authLogger.error(`❌ [AUTH] Profile fetch error: ${profileError.message}`, {
          userId: currentUser.id,
          error: profileError,
          errorCode: profileError.code,
          errorDetails: profileError.details
        });
      } else if (profileData) {
        await authLogger.info(`✅ [AUTH] Profile loaded successfully for user: ${currentUser.email}`, {
          userId: currentUser.id,
          profileId: profileData.id,
          displayName: profileData.display_name,
          avatar: profileData.avatar_url
        });
        setProfile(profileData);
      } else {
        await authLogger.warn(`⚠️ [AUTH] No profile found for user: ${currentUser.email}`, {
          userId: currentUser.id,
          userEmail: currentUser.email,
          message: 'Profile might need to be created during initial signup'
        });
        setProfile(null);
      }

      // Try to fetch permissions (table might not exist yet)
      try {
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (permissionsError && permissionsError.message.includes("Could not find the table")) {
          await authLogger.warn(`⚠️ [AUTH] user_permissions table does not exist - using default permissions`, {
            userId: currentUser.id,
            fallbackAction: 'default_permissions'
          });
          setPermissions(null); // Will default to allowing access
        } else if (permissionsError) {
          await authLogger.error(`❌ [AUTH] Permissions fetch error: ${permissionsError.message}`, {
            userId: currentUser.id,
            error: permissionsError
          });
          setPermissions(null);
        } else {
          await authLogger.info(`✅ [AUTH] Permissions loaded for user: ${currentUser.email}`, {
            userId: currentUser.id,
            permissions: permissionsData
          });
          setPermissions(permissionsData);
        }
      } catch (permError) {
        await authLogger.warn(`⚠️ [AUTH] Permissions table access error - using defaults`, {
          userId: currentUser.id,
          error: permError,
          fallbackAction: 'default_permissions'
        });
        setPermissions(null); // Will default to allowing access
      }
    } catch (error) {
      await authLogger.error(`❌ [AUTH] Critical error in fetchUserData: ${error}`, {
        userId: currentUser.id,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  };

  const refreshUser = async () => {
    try {
      await authLogger.info(`🔄 [AUTH] Refreshing user session`);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        await authLogger.info(`✅ [AUTH] User session found: ${currentUser.email}`, {
          userId: currentUser.id,
          userEmail: currentUser.email,
          lastSignIn: currentUser.last_sign_in_at
        });
        await fetchUserData(currentUser);
      } else {
        await authLogger.info(`ℹ️ [AUTH] No active user session found`);
        setProfile(null);
        setPermissions(null);
      }
    } catch (error) {
      await authLogger.error(`❌ [AUTH] Error refreshing user session: ${error}`, {
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authLogger.info(`🚪 [AUTH] User signing out: ${user?.email || 'unknown'}`, {
        userId: user?.id,
        userEmail: user?.email
      });
      
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setPermissions(null);
      
      await authLogger.info(`✅ [AUTH] User signed out successfully`);
    } catch (error) {
      await authLogger.error(`❌ [AUTH] Error during sign out: ${error}`, {
        error: error,
        userId: user?.id
      });
    }
  };

  useEffect(() => {
    authLogger.info(`🚀 [AUTH] Initializing AuthContext`);
    
    // Get initial user
    refreshUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await authLogger.info(`🔄 [AUTH] Auth state changed: ${event}`, {
          event: event,
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        });

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await authLogger.info(`👤 [AUTH] User authenticated via ${event}: ${currentUser.email}`, {
            userId: currentUser.id,
            userEmail: currentUser.email,
            authEvent: event,
            provider: currentUser.app_metadata?.provider,
            lastSignIn: currentUser.last_sign_in_at
          });
          await fetchUserData(currentUser);
        } else {
          await authLogger.info(`🚪 [AUTH] User session ended via ${event}`, {
            authEvent: event
          });
          setProfile(null);
          setPermissions(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authLogger.info(`🧹 [AUTH] AuthContext cleanup`);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    permissions,
    loading,
    signOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
