'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import ProfileSetup from '../../components/ProfileSetup';

interface User {
  id: string;
  email: string;
  created_at?: string;
  app_metadata?: any;
  user_metadata?: any;
}

interface Profile {
  id?: string;
  user_id: string;
  name: string;
  age?: number;
  profession?: string;
  household_id?: string;
  avatar_url?: string;
  dietary_preferences?: string[];
  household_status?: string;
  household_role?: string;
}

interface Household {
  id: string;
  name: string;
  created_by?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent multiple concurrent requests
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Prevent multiple initializations
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    const initializeProfile = async () => {
      try {
        console.log('🔄 Starting profile initialization...');
        
        // Get authenticated user first
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          console.log('🔒 No authenticated user, redirecting to signin');
          router.push('/signin');
          return;
        }

        if (!mountedRef.current) return;
        
        setUser(currentUser as User);
        console.log('✅ User authenticated:', currentUser.email);

        // Add a small delay to prevent request flooding
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mountedRef.current) return;

        // Fetch profile data with proper error handling
        console.log('📊 Fetching profile for user:', currentUser.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (!mountedRef.current) return;

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.log('ℹ️ No profile found - new user needs setup');
            setProfile(null);
          } else {
            console.error('❌ Profile fetch error:', profileError);
            setError(`Failed to load profile: ${profileError.message}`);
          }
        } else {
          console.log('✅ Profile loaded:', profileData.name);
          setProfile(profileData);

          // Fetch household if exists - with delay to prevent resource exhaustion
          if (profileData.household_id) {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            if (!mountedRef.current) return;
            
            console.log('🏠 Fetching household:', profileData.household_id);
            
            const { data: householdData, error: householdError } = await supabase
              .from('households')
              .select('*')
              .eq('id', profileData.household_id)
              .single();

            if (!mountedRef.current) return;

            if (householdError) {
              console.error('❌ Household fetch error:', householdError);
              // Continue without household - not critical
            } else {
              console.log('✅ Household loaded:', householdData.name);
              setHousehold(householdData);
            }
          }
        }

        if (mountedRef.current) {
          setLoading(false);
        }

      } catch (error) {
        console.error('❌ Profile initialization error:', error);
        if (mountedRef.current) {
          setError('Failed to initialize profile. Please try refreshing the page.');
          setLoading(false);
        }
      } finally {
        isLoadingRef.current = false;
      }
    };

    initializeProfile();

    return () => {
      mountedRef.current = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      router.push('/signin');
    }
  };

  const handleSetupComplete = () => {
    // Refresh the page to load the new profile
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your profile...</p>
          <p className="text-sm text-gray-400 mt-2">User: {user?.email}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-500"
            >
              Try Again
            </button>
            <br />
            <button 
              onClick={() => router.push('/signin')} 
              className="text-blue-400 hover:underline"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Show ProfileSetup for first-time users
  if (!profile) {
    return <ProfileSetup user={user as any} onComplete={handleSetupComplete} />;
  }

  // Show existing profile
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">👤 Your Profile</h1>
            <p className="text-gray-400">Welcome back, {profile.name}!</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <p className="text-white">{profile.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                  <p className="text-white">{profile.age || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Profession</label>
                  <p className="text-white">{profile.profession || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Household Information */}
          <div>
            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🏠 Household</h2>
              
              {household ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Household Name</label>
                    <p className="text-white">{household.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Your Role</label>
                    <p className="text-white capitalize">{profile.household_role || 'Member'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🏠</div>
                  <p className="text-gray-400 mb-4">No household yet</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                    Create Household
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/meals')}
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-500 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🍽️</div>
              <div className="font-semibold">Meal Planning</div>
              <div className="text-sm opacity-80">Plan your weekly meals</div>
            </button>
            
            <button 
              onClick={() => router.push('/projects')}
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-500 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">Projects</div>
              <div className="text-sm opacity-80">Manage family projects</div>
            </button>
            
            <button 
              onClick={() => router.push('/lists')}
              className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-500 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold">Lists</div>
              <div className="text-sm opacity-80">Shopping & todo lists</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
