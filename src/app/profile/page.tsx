'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import ProfileSetup from '../../components/ProfileSetup';

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
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) {
      console.log('⏳ Waiting for auth to complete...');
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated()) {
      console.log('🔒 Not authenticated, redirecting to signin');
      router.push('/signin');
      return;
    }

    // We have a user, now fetch their profile (only once)
    if (user && !fetchedOnce) {
      setFetchedOnce(true);
      fetchProfileData();
    }
  }, [authLoading, user, isAuthenticated, router, fetchedOnce]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      console.log('📊 Fetching profile for user:', user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('ℹ️ No profile found - new user needs setup');
          setProfile(null);
          setLoading(false);
          return;
        } else {
          console.error('❌ Profile fetch error:', profileError);
          setError(`Failed to load profile: ${profileError.message}`);
          setLoading(false);
          return;
        }
      }

      console.log('✅ Profile loaded:', profileData.name);
      setProfile(profileData);

      // Fetch household if exists
      if (profileData.household_id) {
        console.log('🏠 Fetching household:', profileData.household_id);
        
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', profileData.household_id)
          .single();

        if (householdError) {
          console.error('❌ Household fetch error:', householdError);
        } else {
          console.log('✅ Household loaded:', householdData.name);
          setHousehold(householdData);
        }
      }

      setLoading(false);

    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      setError('Failed to load profile. Please try refreshing the page.');
      setLoading(false);
    }
  };

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
    // Refresh the profile data after setup
    setFetchedOnce(false); // Allow refetch
    fetchProfileData();
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching profile data
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
              onClick={() => fetchProfileData()} 
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
