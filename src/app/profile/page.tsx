'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import ProfileSetup from '../../components/ProfileSetup';
import EnhancedProfileSetup from '../../components/EnhancedProfileSetup';
import ProfileEditModal from '../../components/ProfileEditModal';
import HouseholdEditModal from '../../components/HouseholdEditModal';
import HouseholdInvitationManager from '../../components/HouseholdInvitationManager';
import JoinHouseholdForm from '../../components/JoinHouseholdForm';
import HouseholdCodeDisplay from '../../components/HouseholdCodeDisplay';
import HouseholdDependentsManager from '../../components/HouseholdDependentsManager';
import HouseholdMap from '../../components/HouseholdMap';

interface Profile {
  id?: string;
  user_id: string;
  name: string;
  age?: number;
  date_of_birth?: string;
  profession?: string;
  household_id?: string;
  avatar_url?: string;
  profile_photo_url?: string;
  google_avatar_url?: string;
  dietary_preferences?: string[];
  household_status?: string;
  household_role?: string;
}

interface Household {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
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
  const [showInvitations, setShowInvitations] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showDependents, setShowDependents] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showHouseholdEdit, setShowHouseholdEdit] = useState(false);
  const [creatingHousehold, setCreatingHousehold] = useState(false);

  // Helper function to format date without timezone issues
  const formatDateString = (dateString: string) => {
    // Split the date string and create date parts directly
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString();
  };

  const createNewHousehold = async () => {
    if (!user || !profile) return;

    try {
      setCreatingHousehold(true);
      setError(null);

      // Create a new household
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert({
          name: `${profile.name}'s Household`,
          created_by: user.id,
          members_count: 1
        })
        .select()
        .single();

      if (householdError) {
        console.error('Error creating household:', householdError);
        setError('Failed to create household');
        return;
      }

      console.log('✅ Household created:', householdData);

      // Create an initial invitation code for the new household
      try {
        const { data: invitationData, error: invitationError } = await supabase.rpc('create_household_invitation', {
          household_id_param: householdData.id,
          invitee_name_param: null,
          invitee_email_param: null,
          role_param: 'member'
        });

        if (invitationError) {
          console.warn('Failed to create initial invitation code:', invitationError);
          // Don't throw - household creation succeeded
        } else if (invitationData?.success) {
          console.log('Initial invitation code created:', invitationData.invitation_code);
        }
      } catch (inviteErr) {
        console.warn('Error creating invitation code:', inviteErr);
        // Don't throw - household creation succeeded
      }

      // Update user's profile with the new household
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          household_id: householdData.id,
          household_role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        setError('Failed to update profile with household');
        return;
      }

      // Refresh the profile data
      setFetchedOnce(false);
      fetchProfileData();

    } catch (err) {
      console.error('Error in createNewHousehold:', err);
      setError('Failed to create household');
    } finally {
      setCreatingHousehold(false);
    }
  };

  const fetchProfileData = useCallback(async () => {
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
  }, [user]);

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
  }, [authLoading, user, isAuthenticated, router, fetchedOnce, fetchProfileData]);

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
  }, [authLoading, user, isAuthenticated, router, fetchedOnce, fetchProfileData]);

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
    return <EnhancedProfileSetup user={user} onComplete={handleSetupComplete} />;
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  title="Edit Profile"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm font-medium">Edit</span>
                </button>
              </div>
              
              <div className="flex items-start space-x-4 mb-6">
                {/* Profile Photo */}
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                  {profile.profile_photo_url || profile.google_avatar_url ? (
                    <img
                      src={profile.profile_photo_url || profile.google_avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-2xl">👤</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{profile.name}</h3>
                  <p className="text-gray-400">{user.email}</p>
                  {profile.profession && (
                    <p className="text-gray-300 mt-1">{profile.profession}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                  <p className="text-white">{profile.age || 'Not specified'}</p>
                </div>
                
                {profile.date_of_birth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                    <p className="text-white">{formatDateString(profile.date_of_birth)}</p>
                  </div>
                )}
                
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">🏠 Household</h2>
                {household && (
                  <button
                    onClick={() => setShowHouseholdEdit(true)}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    title="Edit Household"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                )}
              </div>
              
              {household ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Household Name</label>
                    <p className="text-white">{household.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Your Role</label>
                    <p className="text-white capitalize">
                      {profile.household_role === 'admin' ? 'Administrator' : 
                       profile.household_role === 'member' ? 'Member' : 
                       profile.household_role || 'Member'}
                    </p>
                  </div>

                  {/* Household Address */}
                  {(household.address || household.city || household.state) && (
                    <div className="pt-2 border-t border-gray-700">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                      <div className="text-white text-sm space-y-1">
                        {household.address && <p>{household.address}</p>}
                        {(household.city || household.state || household.zip) && (
                          <p>
                            {household.city && household.city}
                            {household.city && household.state && ', '}
                            {household.state && household.state}
                            {household.zip && ` ${household.zip}`}
                          </p>
                        )}
                      </div>
                      
                      {/* Embedded Map */}
                      <HouseholdMap
                        address={household.address}
                        city={household.city}
                        state={household.state}
                        zip={household.zip}
                      />
                    </div>
                  )}

                  {/* Household Code Display */}
                  <div className="pt-4">
                    <HouseholdCodeDisplay 
                      householdId={household.id}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Debug: Household ID = {household.id}
                    </div>
                  </div>

                  {/* Household Actions */}
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => setShowInvitations(true)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      👥 Manage Invitations
                    </button>
                    <button
                      onClick={() => setShowDependents(true)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      👨‍👩‍👧‍👦 Manage Family & Pets
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-400 text-4xl mb-4">🏠</div>
                  <p className="text-gray-400 mb-4">No household yet</p>
                  <p className="text-gray-300 text-sm mb-4">
                    Create your own household or join an existing one
                  </p>
                  <div className="space-y-2">
                    <button 
                      onClick={createNewHousehold}
                      disabled={creatingHousehold}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingHousehold ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating...</span>
                        </span>
                      ) : (
                        '🏠 Create My Household'
                      )}
                    </button>
                    <button
                      onClick={() => setShowJoinForm(true)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      🔗 Join Existing Household
                    </button>
                  </div>
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

      {/* Invitation Manager Modal */}
      {showInvitations && household && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <HouseholdInvitationManager 
              householdId={household.id}
              onClose={() => setShowInvitations(false)}
            />
          </div>
        </div>
      )}

      {/* Join Household Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <JoinHouseholdForm
            onSuccess={() => {
              setShowJoinForm(false);
              // Refresh profile data to show new household
              setFetchedOnce(false);
              fetchProfileData();
            }}
            onCancel={() => setShowJoinForm(false)}
          />
        </div>
      )}

      {/* Household Dependents Modal */}
      {showDependents && household && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <HouseholdDependentsManager 
              householdId={household.id}
              onClose={() => setShowDependents(false)}
            />
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && profile && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowProfileEdit(false)}
          onSuccess={() => {
            setShowProfileEdit(false);
            // Refresh profile data
            setFetchedOnce(false);
            fetchProfileData();
          }}
        />
      )}

      {/* Household Edit Modal */}
      {showHouseholdEdit && household && profile && (
        <HouseholdEditModal
          household={household}
          isOwner={household.created_by === user?.id || profile.household_role === 'admin'}
          onClose={() => setShowHouseholdEdit(false)}
          onSuccess={() => {
            setShowHouseholdEdit(false);
            // Refresh profile data
            setFetchedOnce(false);
            fetchProfileData();
          }}
        />
      )}
    </div>
  );
}
