'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types_db';

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
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Fetch permissions
        const { data: permissionsData } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        setPermissions(permissionsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserData(currentUser);
      } else {
        setProfile(null);
        setPermissions(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setPermissions(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Get initial user
    refreshUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
    );

    return () => subscription.unsubscribe();
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
