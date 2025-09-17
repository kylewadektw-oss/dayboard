/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * (Optimized Profile View - Performance First)
 */

'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Save, Home, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/src/lib/types_db';
import { toastHelpers } from '@/utils/toast';

// Phone formatting utility
const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

// Lazy load heavy components to improve initial load time
const GoogleAddressInput = dynamic(
  () => import('@/components/ui/GoogleAddressInput').then(m => ({ default: m.GoogleAddressInput })),
  { 
    ssr: false,
    loading: () => <div className="h-10 bg-gray-100 rounded animate-pulse" />
  }
);

const HouseholdMapWidget = dynamic(
  () => import('@/components/dashboard/HouseholdMapWidget').then(m => ({ default: m.HouseholdMapWidget })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }
);

// Types
type ProfileFormState = {
  name: string;
  preferred_name: string;
  phone_number: string;
  bio: string;
  date_of_birth: string;
  pronouns: string;
  profession: string;
  family_role: string;
  timezone: string;
  language: string;
  dietary_preferences: string[];
  allergies: string[];
  notification_email: boolean;
  notification_push: boolean;
  notification_sms: boolean;
};

type HouseholdFormState = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates?: { lat: number; lng: number };
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default function OptimizedProfileView() {
  const { profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  // Simple state management
  const [activeTab, setActiveTab] = useState<'overview' | 'household'>('overview');
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Cache household data to prevent repeated fetches
  const [household, setHousehold] = useState<Database['public']['Tables']['households']['Row'] | null>(null);
  const [householdLoading, setHouseholdLoading] = useState(false);

  // Memoized form initial states to prevent unnecessary re-renders
  const profileForm = useMemo(() => {
    const notificationPrefs = profile?.notification_preferences as { email?: boolean; push?: boolean; sms?: boolean } || {};
    return {
      name: profile?.preferred_name || profile?.name || '',
      preferred_name: profile?.preferred_name || '',
      phone_number: profile?.phone_number || '',
      bio: profile?.bio || '',
      date_of_birth: profile?.date_of_birth || '',
      pronouns: profile?.pronouns || '',
      profession: profile?.profession || '',
      family_role: profile?.family_role || '',
      timezone: profile?.timezone || 'America/New_York',
      language: profile?.language || 'en',
      dietary_preferences: Array.isArray(profile?.dietary_preferences) ? profile.dietary_preferences : [],
      allergies: Array.isArray(profile?.allergies) ? profile.allergies : [],
      notification_email: notificationPrefs?.email ?? true,
      notification_push: notificationPrefs?.push ?? true,
      notification_sms: notificationPrefs?.sms ?? false,
    };
  }, [profile]);  const [profileFormState, setProfileFormState] = useState<ProfileFormState>(profileForm);

  const householdForm = useMemo(() => ({
    name: household?.name || '',
    address: household?.address || '',
    city: household?.city || '',
    state: household?.state || '',
    zip: household?.zip || '',
    coordinates: household?.coordinates ? JSON.parse(household.coordinates as string) : undefined,
  }), [household]);

  const [householdFormState, setHouseholdFormState] = useState<HouseholdFormState>(householdForm);

  // Optimized household fetch with caching
  const fetchHousehold = useCallback(async () => {
    if (!profile?.household_id) return;

    const cacheKey = `household_${profile.household_id}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      const householdData = JSON.parse(cached);
      setHousehold(householdData);
      setHouseholdFormState({
        name: householdData.name || '',
        address: householdData.address || '',
        city: householdData.city || '',
        state: householdData.state || '',
        zip: householdData.zip || '',
        coordinates: householdData.coordinates ? JSON.parse(householdData.coordinates as string) : undefined,
      });
      return;
    }

    setHouseholdLoading(true);
    try {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .eq('id', profile.household_id)
        .single();

      if (!error && data) {
        setHousehold(data);
        
        // Cache for 5 minutes
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setTimeout(() => sessionStorage.removeItem(cacheKey), 5 * 60 * 1000);

        setHouseholdFormState({
          name: data.name || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || '',
          coordinates: data.coordinates ? JSON.parse(data.coordinates as string) : undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching household:', error);
    } finally {
      setHouseholdLoading(false);
    }
  }, [profile?.household_id, supabase]);

  // Fetch household data on profile load
  useEffect(() => {
    if (profile?.household_id && !authLoading) {
      fetchHousehold();
    }
  }, [profile?.household_id, authLoading, fetchHousehold]);

  // Update profile form when profile changes (only on initial load)
  useEffect(() => {
    if (!profile || profileFormState.preferred_name) return; // Don't reset if form already has data
    
    const notificationPrefs = profile?.notification_preferences as { email?: boolean; push?: boolean; sms?: boolean } || {};
    const newFormState = {
      name: profile?.preferred_name || profile?.name || '',
      preferred_name: profile?.preferred_name || '',
      phone_number: formatPhoneNumber(profile?.phone_number || ''),
      bio: profile?.bio || '',
      date_of_birth: profile?.date_of_birth || '',
      pronouns: profile?.pronouns || '',
      profession: profile?.profession || '',
      family_role: profile?.family_role || '',
      timezone: profile?.timezone || 'America/New_York',
      language: profile?.language || 'en',
      dietary_preferences: Array.isArray(profile?.dietary_preferences) ? profile.dietary_preferences : [],
      allergies: Array.isArray(profile?.allergies) ? profile.allergies : [],
      notification_email: notificationPrefs?.email ?? true,
      notification_push: notificationPrefs?.push ?? true,
      notification_sms: notificationPrefs?.sms ?? false,
    };
    setProfileFormState(newFormState);
    setHasUnsavedChanges(false);
  }, [profile, profileFormState.preferred_name]);

  // Navigation guard - warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    // Handle browser navigation (close tab/window)
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // Handle internal app navigation - override link clicks
    const handleLinkClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.includes('#')) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave without saving?'
        );
        if (!confirmLeave) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Handle button clicks that might navigate (like sidebar buttons)
    const handleButtonClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;
      
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      
      // Check if it's a navigation button (contains navigation-related classes or data attributes)
      if (button && (
        button.textContent?.includes('Dashboard') ||
        button.textContent?.includes('Work') ||
        button.textContent?.includes('Projects') ||
        button.textContent?.includes('Lists') ||
        button.textContent?.includes('Meals') ||
        button.textContent?.includes('Daycare') ||
        button.textContent?.includes('Financial') ||
        button.textContent?.includes('Entertainment') ||
        button.closest('[data-navigation]') ||
        button.closest('.sidebar')
      )) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave without saving?'
        );
        if (!confirmLeave) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    if (hasUnsavedChanges) {
      document.addEventListener('click', handleLinkClick, true);
      document.addEventListener('click', handleButtonClick, true);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [hasUnsavedChanges]);

  // Track changes to show unsaved state
  const handleFormChange = (field: string, value: string | boolean | string[] | null) => {
    setProfileFormState(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleFormChange('phone_number', formatted);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Clean phone number for database storage
      const cleanPhone = profileFormState.phone_number.replace(/\D/g, '');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_name: profileFormState.preferred_name,
          phone_number: cleanPhone,
          bio: profileFormState.bio,
          date_of_birth: profileFormState.date_of_birth || null,
          pronouns: profileFormState.pronouns || null,
          profession: profileFormState.profession || null,
          family_role: profileFormState.family_role || null,
          timezone: profileFormState.timezone,
          language: profileFormState.language,
          dietary_preferences: profileFormState.dietary_preferences,
          allergies: profileFormState.allergies,
          notification_preferences: {
            email: profileFormState.notification_email,
            push: profileFormState.notification_push,
            sms: profileFormState.notification_sms,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toastHelpers.success('Profile updated successfully');
      setHasUnsavedChanges(false);
      
      // Don't refresh the page - let the user continue editing
    } catch (error) {
      console.error('Error updating profile:', error);
      toastHelpers.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    const confirmDiscard = window.confirm(
      'Are you sure you want to discard all unsaved changes?'
    );
    if (confirmDiscard) {
      // Reset form to original profile values
      const notificationPrefs = profile?.notification_preferences as { email?: boolean; push?: boolean; sms?: boolean } || {};
      setProfileFormState({
        name: profile?.preferred_name || profile?.name || '',
        preferred_name: profile?.preferred_name || '',
        phone_number: formatPhoneNumber(profile?.phone_number || ''),
        bio: profile?.bio || '',
        date_of_birth: profile?.date_of_birth || '',
        pronouns: profile?.pronouns || '',
        profession: profile?.profession || '',
        family_role: profile?.family_role || '',
        timezone: profile?.timezone || 'America/New_York',
        language: profile?.language || 'en',
        dietary_preferences: Array.isArray(profile?.dietary_preferences) ? profile.dietary_preferences : [],
        allergies: Array.isArray(profile?.allergies) ? profile.allergies : [],
        notification_email: notificationPrefs?.email ?? true,
        notification_push: notificationPrefs?.push ?? true,
        notification_sms: notificationPrefs?.sms ?? false,
      });
      setHasUnsavedChanges(false);
      toastHelpers.success('Changes discarded');
    }
  };

  const handleSaveHousehold = async () => {
    if (!household) return;

    setSaving(true);
    try {
      const updateData: Partial<Database['public']['Tables']['households']['Row']> = {
        name: householdFormState.name,
        address: householdFormState.address,
        city: householdFormState.city,
        state: householdFormState.state,
        zip: householdFormState.zip,
        updated_at: new Date().toISOString(),
      };

      if (householdFormState.coordinates) {
        updateData.coordinates = JSON.stringify(householdFormState.coordinates);
      }

      const { error } = await supabase
        .from('households')
        .update(updateData)
        .eq('id', household.id);

      if (error) throw error;

      // Clear cache
      const cacheKey = `household_${profile?.household_id}`;
      sessionStorage.removeItem(cacheKey);

      toastHelpers.success('Household updated successfully');
      await fetchHousehold(); // Refresh data
    } catch (error) {
      console.error('Error updating household:', error);
      toastHelpers.error('Failed to update household');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSelect = (addressData: {
    address: string;
    city: string;
    state: string;
    zip: string;
    formattedAddress: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    setHouseholdFormState(prev => ({
      ...prev,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zip,
      coordinates: addressData.coordinates,
    }));
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your personal and household information</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('household')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'household'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="h-4 w-4 inline mr-2" />
            Household
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <button
                    onClick={handleDiscardChanges}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Discard Changes
                  </button>
                )}
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !hasUnsavedChanges}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    hasUnsavedChanges && !saving
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={profileFormState.preferred_name}
                      onChange={(e) => handleFormChange('preferred_name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="How should we address you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileFormState.phone_number}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileFormState.date_of_birth}
                      onChange={(e) => handleFormChange('date_of_birth', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pronouns
                    </label>
                    <select
                      value={profileFormState.pronouns}
                      onChange={(e) => handleFormChange('pronouns', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select pronouns</option>
                      <option value="he/him">he/him</option>
                      <option value="she/her">she/her</option>
                      <option value="they/them">they/them</option>
                      <option value="other">other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession
                    </label>
                    <input
                      type="text"
                      value={profileFormState.profession}
                      onChange={(e) => handleFormChange('profession', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Software Developer, Teacher, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Family Role
                    </label>
                    <select
                      value={profileFormState.family_role}
                      onChange={(e) => handleFormChange('family_role', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select family role</option>
                      <option value="parent">Parent</option>
                      <option value="spouse">Spouse/Partner</option>
                      <option value="child">Child</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="sibling">Sibling</option>
                      <option value="roommate">Roommate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileFormState.bio}
                    onChange={(e) => handleFormChange('bio', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
              </div>

              {/* Preferences & Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Preferences & Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={profileFormState.timezone}
                      onChange={(e) => handleFormChange('timezone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/Anchorage">Alaska Time</option>
                      <option value="Pacific/Honolulu">Hawaii Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={profileFormState.language}
                      onChange={(e) => handleFormChange('language', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dietary Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Dietary Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Preferences
                    </label>
                    <div className="space-y-2">
                      {['vegetarian', 'vegan', 'pescatarian', 'gluten_free', 'dairy_free', 'keto', 'paleo'].map(pref => (
                        <label key={pref} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileFormState.dietary_preferences.includes(pref)}
                            onChange={(e) => {
                              const newPrefs = e.target.checked
                                ? [...profileFormState.dietary_preferences, pref]
                                : profileFormState.dietary_preferences.filter(p => p !== pref);
                              handleFormChange('dietary_preferences', newPrefs);
                            }}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900 capitalize">
                            {pref.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies
                    </label>
                    <div className="space-y-2">
                      {['peanuts', 'tree_nuts', 'shellfish', 'fish', 'milk', 'eggs', 'wheat', 'soy', 'sesame'].map(allergy => (
                        <label key={allergy} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileFormState.allergies.includes(allergy)}
                            onChange={(e) => {
                              const newAllergies = e.target.checked
                                ? [...profileFormState.allergies, allergy]
                                : profileFormState.allergies.filter(a => a !== allergy);
                              handleFormChange('allergies', newAllergies);
                            }}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900 capitalize">
                            {allergy.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileFormState.notification_email}
                      onChange={(e) => handleFormChange('notification_email', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                      <p className="text-xs text-gray-500">Receive important updates via email</p>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileFormState.notification_push}
                      onChange={(e) => handleFormChange('notification_push', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                      <p className="text-xs text-gray-500">Receive notifications in your browser</p>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileFormState.notification_sms}
                      onChange={(e) => handleFormChange('notification_sms', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
                      <p className="text-xs text-gray-500">Receive text messages for urgent updates</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'household' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Household Settings</h2>
                <button
                  onClick={handleSaveHousehold}
                  disabled={saving || householdLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {householdLoading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Household Name
                    </label>
                    <input
                      type="text"
                      value={householdFormState.name}
                      onChange={(e) => setHouseholdFormState(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Enter household name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Address
                    </label>
                    <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse" />}>
                      <GoogleAddressInput
                        onAddressSelect={handleAddressSelect}
                        initialValue={householdFormState.address}
                        placeholder="Start typing your address..."
                      />
                    </Suspense>
                    
                    {/* Display selected address information */}
                    {householdFormState.address && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Address:</h4>
                        <div className="space-y-1 text-sm text-gray-700">
                          <div><span className="font-medium">Full Address:</span> {householdFormState.address}</div>
                          {householdFormState.city && (
                            <div><span className="font-medium">City:</span> {householdFormState.city}</div>
                          )}
                          {householdFormState.state && (
                            <div><span className="font-medium">State:</span> {householdFormState.state}</div>
                          )}
                          {householdFormState.zip && (
                            <div><span className="font-medium">ZIP Code:</span> {householdFormState.zip}</div>
                          )}
                          {householdFormState.coordinates && (
                            <div className="text-xs text-gray-500 mt-2">
                              Coordinates: {householdFormState.coordinates.lat.toFixed(6)}, {householdFormState.coordinates.lng.toFixed(6)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Map Preview */}
            {householdFormState.coordinates && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Preview</h3>
                <Suspense fallback={
                  <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                    <span className="text-gray-900">Loading map...</span>
                  </div>
                }>
                  <HouseholdMapWidget className="h-64 rounded-lg border border-gray-200" />
                </Suspense>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}