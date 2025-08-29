"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase, Profile, Household } from '../../lib/supabaseClient';
import ProfileSetup from '../../components/ProfileSetup';
import ProfilePhotoUpload from '../../components/ProfilePhotoUpload';
import HouseholdCodeManager from '../../components/HouseholdCodeManager';
import HouseholdMemberManager from '../../components/HouseholdMemberManager';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showHouseholdSetup, setShowHouseholdSetup] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/signin');
          return;
        }

        setUser(user);

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        } else if (profileData) {
          setProfile(profileData);

          // If user has a household, fetch it
          if (profileData.household_id) {
            fetchHousehold(profileData.household_id);
          }
        } else {
          // New user - show setup
          setIsFirstTimeUser(true);
        }

        // Check for pending household code from sign-in
        const pendingCode = sessionStorage.getItem('pending_household_code');
        if (pendingCode && profileData && !profileData.household_id && profileData.household_status !== 'pending') {
          // Auto-attempt to join household with the pending code
          try {
            const { data, error } = await supabase
              .rpc('join_household_by_code', {
                p_household_code: pendingCode,
                p_user_id: user.id
              });

            if (data?.success) {
              // Refresh profile to get updated status
              const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
              
              if (updatedProfile) {
                setProfile(updatedProfile);
              }
              
              alert(`Join request sent to "${data.household_name}"! You'll be notified when an admin approves your request.`);
            }
          } catch (error) {
            console.error('Auto-join error:', error);
          } finally {
            // Clear the pending code
            sessionStorage.removeItem('pending_household_code');
          }
        }
      } catch (error) {
        console.error('Data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSetupComplete = () => {
    setIsFirstTimeUser(false);
    // Refresh the page data
    window.location.reload();
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setProfile(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : prev);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    
    // If profile now has a household_id, fetch the household
    if (updatedProfile.household_id && !household) {
      fetchHousehold(updatedProfile.household_id);
    }
  };

  const fetchHousehold = async (householdId: string) => {
    try {
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', householdId)
        .single();

      if (householdError) {
        console.error('Household fetch error:', householdError);
      } else {
        setHousehold(householdData);
      }
    } catch (error) {
      console.error('Household fetch error:', error);
    }
  };

  const handleSaveProfile = async (formData: FormData) => {
    if (!user) return;

    setSaving(true);
    try {
      // Note: Removed dietary_preferences for now since the column doesn't exist in database
      // const dietaryPrefs = formData.get('dietary_preferences')?.toString().split(',').map(item => item.trim()).filter(Boolean) || [];
      
      const profileData = {
        user_id: user.id,
        name: formData.get('name')?.toString()?.trim() || '',
        age: Number(formData.get('age')) || null,
        profession: formData.get('profession')?.toString()?.trim() || '',
        // dietary_preferences: dietaryPrefs, // Commented out until database column is added
        household_id: profile?.household_id || null,
      };

      // Validate required fields
      if (!profileData.name) {
        alert('Name is required');
        setSaving(false);
        return;
      }

      console.log('Saving profile with data:', profileData);
      console.log('User ID:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Profile save error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Profile data being saved:', profileData);
        alert(`Error saving profile: ${error.message || 'Unknown error'}. Please try again.`);
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
    await supabase.auth.signOut();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
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
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign Out
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        name="name"
                        type="text"
                        defaultValue={profile?.name || ''}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                        <input
                          name="age"
                          type="number"
                          defaultValue={profile?.age || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                          placeholder="Age"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                        <input
                          name="profession"
                          type="text"
                          defaultValue={profile?.profession || ''}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                          placeholder="Your profession"
                        />
                      </div>
                    </div>

{/* Temporarily disabled until database column is added */}
                    {/* 
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                      <input
                        name="dietary_preferences"
                        type="text"
                        defaultValue={profile?.dietary_preferences?.join(', ') || ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Vegetarian, Gluten-free, No nuts (comma separated)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Used for meal planning and recipe suggestions</p>
                    </div>
                    */}

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
                    {/* Profile Photo Upload - Moved to top */}
                    <div className="flex justify-center pb-6 border-b border-gray-100">
                      <ProfilePhotoUpload
                        user={user}
                        currentAvatarUrl={profile?.avatar_url}
                        onAvatarUpdate={handleAvatarUpdate}
                      />
                    </div>

                    {/* User Information */}
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">{profile?.name || 'No name set'}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      {profile?.profession && <p className="text-gray-500 italic">{profile.profession}</p>}
                    </div>

                    {profile?.age && (
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {profile.age} years old
                        </span>
                      </div>
                    )}

                    {/* Temporarily disabled until database column is added
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
                    */}

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

          {/* Household Code Management */}
          <div className="mt-8">
            <HouseholdCodeManager
              user={user}
              household={household}
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>

          {/* Household Member Management (Admin Only) */}
          {household && profile?.household_role === 'admin' && (
            <div className="mt-8">
              <HouseholdMemberManager
                user={user}
                householdId={household.id!}
                userRole={profile.household_role}
              />
            </div>
          )}
        </div>            {/* Household Information */}
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
                  <button 
                    onClick={() => setShowHouseholdSetup(true)}
                    className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    🏠 Set Up Household
                  </button>
                )}
                <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  📱 Invite Family Members
                </button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Household Name</label>
                  <input
                    name="household_name"
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., The Smith Family"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                  <input
                    name="address"
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      name="city"
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      name="state"
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="CA"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      name="zip"
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
                    <input
                      name="members_count"
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
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
      </div>
    </div>
  );
}
