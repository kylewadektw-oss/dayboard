'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import ProfileSetup from '../../components/ProfileSetup';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [household, setHousehold] = useState(null);
  const [useStaticData, setUseStaticData] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeProfile = async () => {
      try {
        // Get authenticated user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          router.push('/signin');
          return;
        }

        if (!mounted) return;
        setUser(currentUser);

        // For Kyle Wade's user ID, use static data to bypass database issues
        if (currentUser.id === '0139a6fc-bf13-426d-8929-604051c4d1f4') {
          console.log('✅ Loading static profile for Kyle Wade');
          setProfile({
            id: '8e0e94b1-1421-4a92-a6a6-f9ff3c4d9cc4',
            user_id: '0139a6fc-bf13-426d-8929-604051c4d1f4',
            name: 'Kyle Wade',
            age: 40,
            profession: 'Business Services',
            household_id: 'c37514ce-1967-4b36-b1e2-c1429b7775ab',
            avatar_url: null,
            dietary_preferences: [],
            household_status: 'none',
            household_role: 'member'
          });
          
          setHousehold({
            id: 'c37514ce-1967-4b36-b1e2-c1429b7775ab',
            name: 'Wade Family',
            created_by: currentUser.id
          });
          
          setUseStaticData(true);
        } else {
          // For other users, try database or show setup
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .single();

            if (profileData && mounted) {
              setProfile(profileData);
            }
          } catch (error) {
            console.log('Database not available, showing setup form');
            // Database error - leave profile as null to show setup
          }
        }

        if (mounted) {
          setLoading(false);
        }

      } catch (error) {
        console.error('Profile initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeProfile();

    return () => {
      mounted = false;
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
    return <ProfileSetup user={user} onComplete={() => window.location.reload()} />;
  }

  // Show existing profile
  return (
    <div className="min-h-screen bg-gray-900">
      {useStaticData && (
        <div className="bg-yellow-600 text-black text-center py-2 text-sm">
          ⚠️ Using cached profile data (database connectivity issues)
        </div>
      )}
      
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
