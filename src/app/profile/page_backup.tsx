"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Profile, Household } from '../../lib/supabaseClient';
import ProfileSetup from '../../components/ProfileSetup';
import HouseholdInvitationManager from '../../components/HouseholdInvitationManager';
import JoinHouseholdForm from '../../components/JoinHouseholdForm';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showHouseholdSetup, setShowHouseholdSetup] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showInvitationManager, setShowInvitationManager] = useState(false);
  const [showJoinHousehold, setShowJoinHousehold] = useState(false);

  // Fetch user data
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID available for data fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('� === DETAILED DEBUG SESSION ===');
      console.log('👤 Current user details:');
      console.log('  - ID:', user.id);
      console.log('  - Email:', user.email);
      console.log('  - Created:', user.created_at);
      console.log('  - Provider:', user.app_metadata?.provider);
        
        // Get user profile with detailed debugging
        console.log('📊 Querying profiles table for user_id:', user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('📋 Profile query result:');
        console.log('  - Data:', profileData);
        console.log('  - Error:', profileError);

        // Check what profiles exist in the database
        console.log('🔍 Checking ALL profiles in database:');
        const { data: allProfiles, error: allError } = await supabase
          .from('profiles')
          .select('user_id, name, email, created_at')
          .limit(10);
          
        if (allProfiles) {
          console.log('📋 Found', allProfiles.length, 'total profiles:');
          allProfiles.forEach((p, i) => {
            console.log(`  ${i + 1}. ID: ${p.user_id}, Name: ${p.name}, Email: ${p.email}`);
            console.log(`      Matches current user: ${p.user_id === user.id ? '✅ YES' : '❌ NO'}`);
          });
        } else {
          console.log('📭 No profiles found in database, error:', allError);
        }

        // Simplified error handling - treat any error or no data as new user
        if (profileError || !profileData) {
          console.log('⚠️ CONCLUSION: Treating as new user');
          console.log('   Reason: No matching profile found for current user ID');
          setIsFirstTimeUser(true);
        } else {
          console.log('✅ CONCLUSION: Existing user found');
          console.log('   Profile name:', profileData.name);
          setProfile(profileData);

          // If user has a household, fetch it with simplified error handling
          if (profileData.household_id) {
            console.log('🏠 Fetching household:', profileData.household_id);
            const { data: householdData, error: householdError } = await supabase
              .from('households')
              .select('*')
              .eq('id', profileData.household_id)
              .single();

            if (householdError || !householdData) {
              console.log('ℹ️ Household fetch issue - continuing without household data');
              if (householdError) {
                console.log('📋 Household error details:', householdError);
              }
              // Continue without household - not critical
            } else {
              console.log('✅ Household loaded:', householdData.name);
              setHousehold(householdData);
            }
          }
        }
      } catch (error) {
        console.error('❌ Data fetch error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        // On error, check if user is still authenticated
        if (!user || !user.id) {
          console.log('🔒 User session lost during fetch, redirecting to signin');
          router.push('/signin');
          return;
        }
        // Otherwise treat as new user to allow recovery
        setIsFirstTimeUser(true);
      } finally {
        console.log('🔍 === END DEBUG SESSION ===');
        setLoading(false);
      }
    }, [user, router, setProfile, setHousehold, setIsFirstTimeUser, setLoading]);

  // Single, simple authentication check to prevent pulsing
  useEffect(() => {
    // Handle OAuth callback if there's a code in the URL
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log('🔄 OAuth code detected, exchanging for session...');
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('❌ Error exchanging code for session:', error);
            router.push('/signin?error=' + encodeURIComponent(error.message));
            return;
          }
          console.log('✅ OAuth exchange successful:', data?.user?.email);
          // Clean URL by removing query params
          window.history.replaceState({}, '', '/profile');
          // Force a refresh to load user data properly
          window.location.reload();
          return;
        } catch (err) {
          console.error('❌ Unexpected error during OAuth exchange:', err);
          router.push('/signin?error=oauth_exchange_failed');
          return;
        }
      }
    };

    // Handle OAuth callback first
    handleOAuthCallback();

    // Normal auth logic
    if (!authLoading && (!user || !user.id)) {
      console.log('🔒 Authentication check: No authenticated user, redirecting to signin');
      router.push('/signin');
      return;
    }

    if (user?.id && !authLoading) {
      console.log('👤 User authenticated successfully, proceeding with profile page');
      fetchData();
    }
  }, [user, authLoading, router, fetchData]);

  const handleSetupComplete = () => {
    setIsFirstTimeUser(false);
    // Refresh the page data
    window.location.reload();
  };

  const handleSaveProfile = async (formData: FormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const dietaryPrefs = formData.get('dietary_preferences')?.toString().split(',').map(item => item.trim()).filter(Boolean) || [];
      
      const profileData = {
        user_id: user.id,
        name: formData.get('name')?.toString() || '',
        age: Number(formData.get('age')) || null,
        profession: formData.get('profession')?.toString() || '',
        dietary_preferences: dietaryPrefs,
        household_id: profile?.household_id || null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Profile save error:', error);
        alert('Error saving profile. Please try again.');
      } else {
        setProfile(data);
        setIsEditing(false);
        
        // If no household, prompt to create one
        if (!data.household_id) {
          setShowHouseholdSetup(true);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateHousehold = async (formData: FormData) => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const householdData = {
        name: formData.get('household_name')?.toString() || '',
        address: formData.get('address')?.toString() || '',
        city: formData.get('city')?.toString() || '',
        state: formData.get('state')?.toString() || '',
        zip: formData.get('zip')?.toString() || '',
        income: Number(formData.get('income')) || null,
        members_count: Number(formData.get('members_count')) || 1,
        created_by: user.id,
      };

      const { data: newHousehold, error: householdError } = await supabase
        .from('households')
        .insert(householdData)
        .select()
        .single();

      if (householdError) {
        console.error('Household creation error:', householdError);
        alert('Error creating household. Please try again.');
        return;
      }

      // Update profile with household_id
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ household_id: newHousehold.id })
        .eq('user_id', user.id);

      if (profileUpdateError) {
        console.error('Profile update error:', profileUpdateError);
      } else {
        setProfile({ ...profile, household_id: newHousehold.id });
        setHousehold(newHousehold);
        setShowHouseholdSetup(false);
      }
    } catch (error) {
      console.error('Household creation error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 Initiating sign out...');
      await signOut();
      console.log('✅ Sign out complete, redirecting...');
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if sign out fails
      router.push('/signin');
    }
  };

  // Show loading if auth is loading or profile data is loading
  if (authLoading || loading) {
    // Safety check: if not loading auth but no user, redirect immediately
    if (!authLoading && !user) {
      router.push('/signin');
      return null;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">
            {authLoading ? 'Checking authentication...' : 'Loading your profile...'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            User: {user?.email || 'Checking...'}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('🔄 Force refresh triggered');
                window.location.reload();
              }}
              className="block mx-auto text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Taking too long? Click to refresh
            </button>
            <button
              onClick={() => {
                console.log('🚨 Emergency profile setup triggered');
                setIsFirstTimeUser(true);
                setLoading(false);
              }}
              className="block mx-auto text-sm text-orange-600 hover:text-orange-700 underline"
            >
              Set up profile manually
            </button>
            <button
              onClick={() => {
                console.log('🔓 Manual redirect to signin');
                router.push('/signin');
              }}
              className="block mx-auto text-sm text-red-600 hover:text-red-700 underline"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (!user) {
    // Final safety check - should not reach here but redirect if it does
    router.push('/signin');
    return null;
  }

  // Show ProfileSetup for first-time users
  if (isFirstTimeUser) {
    return <ProfileSetup user={user} onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 Your Profile</h1>
            <p className="text-gray-600">Manage your personal information and household settings</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={authLoading}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProfile(new FormData(e.currentTarget));
                  }} className="space-y-6">
                    <div>
                      <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        id="profile-name"
                        name="name"
                        type="text"
                        defaultValue={profile?.name || ''}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="profile-age" className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                        <input
                          id="profile-age"
                          name="age"
                          type="number"
                          defaultValue={profile?.age || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Age"
                        />
                      </div>
                      <div>
                        <label htmlFor="profile-profession" className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                        <input
                          id="profile-profession"
                          name="profession"
                          type="text"
                          defaultValue={profile?.profession || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Your profession"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="profile-dietary" className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                      <input
                        id="profile-dietary"
                        name="dietary_preferences"
                        type="text"
                        defaultValue={profile?.dietary_preferences?.join(', ') || ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Vegetarian, Gluten-free, No nuts (comma separated)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Used for meal planning and recipe suggestions</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Profile'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{profile?.name || 'No name set'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {profile?.profession && <p className="text-sm text-gray-500">{profile.profession}</p>}
                      </div>
                    </div>

                    {profile?.age && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Age: </span>
                        <span className="text-sm text-gray-600">{profile.age} years old</span>
                      </div>
                    )}

                    {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Dietary Preferences: </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile.dietary_preferences.map((pref, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!profile && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Complete your profile to get started</p>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Set Up Profile
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Household Information */}
            {household && (
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">🏠 Household: {household.name}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {household.address && (
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <p className="text-gray-600">{household.address}</p>
                        {household.city && <p className="text-gray-600">{household.city}, {household.state} {household.zip}</p>}
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Members:</span>
                      <p className="text-gray-600">{household.members_count} people</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Sign In</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Complete</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.name && profile?.household_id ? '✅ Complete' : '⚠️ Incomplete'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
              <div className="space-y-3">
                {!household && (
                  <>
                    <button 
                      onClick={() => setShowHouseholdSetup(true)}
                      className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      🏠 Create New Household
                    </button>
                    <button 
                      onClick={() => setShowJoinHousehold(true)}
                      className="w-full bg-green-100 text-green-700 p-3 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      � Join Existing Household
                    </button>
                  </>
                )}
                {household && (
                  <button 
                    onClick={() => setShowInvitationManager(true)}
                    className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    📱 Manage Invitations
                  </button>
                )}
                <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  🔒 Privacy Settings
                </button>
                <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  📧 Export Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Household Setup Modal */}
        {showHouseholdSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏠 Set Up Your Household</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateHousehold(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div>
                  <label htmlFor="household-name" className="block text-sm font-medium text-gray-700 mb-1">Household Name</label>
                  <input
                    id="household-name"
                    name="household_name"
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., The Smith Family"
                  />
                </div>
                <div>
                  <label htmlFor="household-address" className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                  <input
                    id="household-address"
                    name="address"
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="household-city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      id="household-city"
                      name="city"
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label htmlFor="household-state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      id="household-state"
                      name="state"
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="CA"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="household-zip" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      id="household-zip"
                      name="zip"
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <label htmlFor="household-members" className="block text-sm font-medium text-gray-700 mb-1">Members</label>
                    <input
                      id="household-members"
                      name="members_count"
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create Household'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHouseholdSetup(false)}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invitation Manager Modal */}
        {showInvitationManager && household?.id && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <HouseholdInvitationManager 
                householdId={household.id} 
                onClose={() => setShowInvitationManager(false)} 
              />
            </div>
          </div>
        )}

        {/* Join Household Modal */}
        {showJoinHousehold && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full">
              <JoinHouseholdForm 
                onSuccess={() => {
                  setShowJoinHousehold(false);
                  // Refresh page to show new household
                  window.location.reload();
                }}
                onCancel={() => setShowJoinHousehold(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
