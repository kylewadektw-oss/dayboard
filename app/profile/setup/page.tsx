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

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, ArrowRight, CheckCircle, UserCheck, ArrowLeft } from 'lucide-react';
import { Json } from '@/src/lib/types_db';

type SetupStep = 'choose' | 'join' | 'create' | 'profile';

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  preferred_name: string | null;
  age?: number | null;
  profession?: string | null;
  household_id: string | null;
  avatar_url?: string | null;
  onboarding_completed?: boolean;
  notification_preferences?: Json;
  role?: string;
  [key: string]: unknown; // For additional Supabase fields
}

// Household living situation categories
type HouseholdType = 
  | 'solo_user' 
  | 'roommate_household' 
  | 'couple_no_kids' 
  | 'family_household' 
  | 'single_parent_household' 
  | 'multi_generational_household';

// Individual roles within the household
type FamilyRole = 
  | 'parent_guardian' 
  | 'mom' 
  | 'dad' 
  | 'child' 
  | 'spouse_partner' 
  | 'roommate' 
  | 'guest' 
  | 'caregiver' 
  | 'pet';

interface HouseholdInfo {
  name: string;
  household_type: HouseholdType;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface ProfileInfo {
  full_name: string;
  display_name: string;
  preferred_name: string;
  phone_number: string;
  date_of_birth: string;
  family_role: FamilyRole;
  dietary_preferences: string[];
  allergies: string[];
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    daycare_pickup_backup: boolean;
  };
}

function ProfileSetupContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const editMode = searchParams.get('edit') === 'true';
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<SetupStep>('choose');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfo>({
    name: '',
    household_type: 'solo_user',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    full_name: '',
    display_name: '',
    preferred_name: '',
    phone_number: '',
    date_of_birth: '',
    family_role: 'parent_guardian',
    dietary_preferences: [],
    allergies: [],
    notification_preferences: {
      email: true,
      push: true,
      sms: false,
      daycare_pickup_backup: false,
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  const checkExistingProfile = useCallback(async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          households!household_id (
            id,
            name,
            household_type,
            household_code,
            address,
            city,
            state,
            zip
          )
        `)
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        // If onboarding completed and NOT edit mode, send to dashboard immediately
        if (profile.onboarding_completed && !editMode) {
          router.replace('/dashboard');
          return; // prevent further state changes
        }
        setUserProfile({
          ...profile,
          onboarding_completed: profile.onboarding_completed ?? undefined,
          role: profile.role ?? undefined
        } as UserProfile);
        
        if (editMode) {
          setCurrentStep('profile');
          const notificationPrefs = profile.notification_preferences as Record<string, boolean>;
          setProfileInfo(prev => ({
            ...prev,
            full_name: profile.name || '',
            display_name: profile.name || '',
            preferred_name: profile.preferred_name || '',
            phone_number: profile.phone_number || '',
            date_of_birth: profile.date_of_birth || '',
            family_role: (profile.family_role as FamilyRole) || 'parent_guardian',
            dietary_preferences: (Array.isArray(profile.dietary_preferences) ? profile.dietary_preferences : []).filter((item): item is string => typeof item === 'string'),
            allergies: (Array.isArray(profile.allergies) ? profile.allergies : []).filter((item): item is string => typeof item === 'string'),
            notification_preferences: {
              email: notificationPrefs?.email ?? true,
              push: notificationPrefs?.push ?? true,
              sms: notificationPrefs?.sms ?? false,
              daycare_pickup_backup: notificationPrefs?.daycare_pickup_backup ?? false,
            },
          }));
          
          if (profile.households && Array.isArray(profile.households) && profile.households.length > 0) {
            const household = profile.households[0];
            setHouseholdInfo({
              name: household.name || '',
              household_type: household.household_type || 'solo_user',
              address: household.address || '',
              city: household.city || '',
              state: household.state || '',
              zip: household.zip || '',
            });
          }
        } else {
          setCurrentStep('profile');
        }
      } else {
        // No profile found, start setup
        setCurrentStep('choose');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, user, editMode, router, setUserProfile, setCurrentStep, setProfileInfo, setHouseholdInfo, setLoading]);

  // Check existing profile
  useEffect(() => {
    if (!authLoading && user) {
      checkExistingProfile();
    }
  }, [user, authLoading, checkExistingProfile]);

  const handleJoinHousehold = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a household code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Find household by join code
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('household_code', joinCode.trim())
        .single();

      if (householdError || !household) {
        setError('Invalid household code. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      // Create profile and link to household
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user!.id,
          household_id: household.id,
          name: profileInfo.full_name,
          preferred_name: profileInfo.preferred_name,
          phone_number: profileInfo.phone_number,
          date_of_birth: profileInfo.date_of_birth,
          family_role: profileInfo.family_role,
          dietary_preferences: profileInfo.dietary_preferences,
          allergies: profileInfo.allergies,
          notification_preferences: profileInfo.notification_preferences,
          onboarding_completed: true,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError('Failed to join household. Please try again.');
        setIsSubmitting(false);
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error joining household:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCreateHousehold = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Generate unique join code
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: householdInfo.name,
          household_type: householdInfo.household_type,
          address: householdInfo.address,
          city: householdInfo.city,
          state: householdInfo.state,
          zip: householdInfo.zip,
          household_code: joinCode,
          created_by: user!.id,
        })
        .select()
        .single();

      if (householdError) {
        console.error('Error creating household:', householdError);
        setError('Failed to create household. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user!.id,
          household_id: household.id,
          name: profileInfo.full_name,
          preferred_name: profileInfo.preferred_name,
          phone_number: profileInfo.phone_number,
          date_of_birth: profileInfo.date_of_birth,
          family_role: profileInfo.family_role,
          dietary_preferences: profileInfo.dietary_preferences,
          allergies: profileInfo.allergies,
          notification_preferences: profileInfo.notification_preferences,
          onboarding_completed: true,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError('Failed to create profile. Please try again.');
        setIsSubmitting(false);
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating household:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profileInfo.full_name,
          preferred_name: profileInfo.preferred_name,
          phone_number: profileInfo.phone_number,
          date_of_birth: profileInfo.date_of_birth,
          family_role: profileInfo.family_role,
          dietary_preferences: profileInfo.dietary_preferences,
          allergies: profileInfo.allergies,
          notification_preferences: profileInfo.notification_preferences,
        })
        .eq('user_id', user!.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        setError('Failed to update profile. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Update household if user has one
      if (userProfile?.household_id && Object.values(householdInfo).some(v => v)) {
        const { error: householdError } = await supabase
          .from('households')
          .update({
            name: householdInfo.name,
            household_type: householdInfo.household_type,
            address: householdInfo.address,
            city: householdInfo.city,
            state: householdInfo.state,
            zip: householdInfo.zip,
          })
          .eq('id', userProfile.household_id);

        if (householdError) {
          console.error('Error updating household:', householdError);
          // Don't fail the whole operation for household update
        }
      }

      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderChooseStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Dayboard! 🏠
        </h1>
        <p className="text-lg text-gray-600">
          Let&apos;s get your household set up. Choose how you&apos;d like to get started:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => setCurrentStep('join')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
        >
          <div className="text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Join Existing Household
            </h3>
            <p className="text-gray-600">
              Someone in your household already set up Dayboard? Join them with a household code.
            </p>
          </div>
        </button>

        <button
          onClick={() => setCurrentStep('create')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
        >
          <div className="text-center">
            <Home className="h-12 w-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create New Household
            </h3>
            <p className="text-gray-600">
              Start fresh! Set up a new household and invite family members or roommates later.
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderJoinStep = () => (
    <div className="max-w-md mx-auto">
      <button
        onClick={() => setCurrentStep('choose')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to options
      </button>

      <div className="text-center mb-8">
        <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Join Your Household
        </h1>
        <p className="text-gray-600">
          Enter the household code shared by your family member or roommate.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-2">
            Household Code
          </label>
          <input
            type="text"
            id="joinCode"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono uppercase bg-white text-gray-900 placeholder-gray-400"
            maxLength={6}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={() => setCurrentStep('profile')}
          disabled={!joinCode.trim() || joinCode.length < 6}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          Continue to Profile
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderCreateStep = () => (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setCurrentStep('choose')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to options
      </button>

      <div className="text-center mb-8">
        <Home className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create Your Household
        </h1>
        <p className="text-gray-600">
          Tell us about your household so we can personalize your experience.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 mb-2">
            Household Name
          </label>
          <input
            type="text"
            id="householdName"
            value={householdInfo.name}
            onChange={(e) => setHouseholdInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="The Smith Family, Apartment 4B, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="householdType" className="block text-sm font-medium text-gray-700 mb-2">
            Household Type
          </label>
          <select
            id="householdType"
            value={householdInfo.household_type}
            onChange={(e) => setHouseholdInfo(prev => ({ ...prev, household_type: e.target.value as HouseholdType }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
          >
            <option value="solo_user">Solo User</option>
            <option value="roommate_household">Roommate Household</option>
            <option value="couple_no_kids">Couple (No Kids)</option>
            <option value="family_household">Family Household</option>
            <option value="single_parent_household">Single Parent Household</option>
            <option value="multi_generational_household">Multi-Generational</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={householdInfo.address}
              onChange={(e) => setHouseholdInfo(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              id="city"
              value={householdInfo.city}
              onChange={(e) => setHouseholdInfo(prev => ({ ...prev, city: e.target.value }))}
              placeholder="City"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              id="state"
              value={householdInfo.state}
              onChange={(e) => setHouseholdInfo(prev => ({ ...prev, state: e.target.value }))}
              placeholder="State"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip"
              value={householdInfo.zip}
              onChange={(e) => setHouseholdInfo(prev => ({ ...prev, zip: e.target.value }))}
              placeholder="12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        <button
          onClick={() => setCurrentStep('profile')}
          disabled={!householdInfo.name.trim()}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          Continue to Profile
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="max-w-2xl mx-auto">
      {!editMode && (
        <button
          onClick={() => setCurrentStep(currentStep === 'profile' ? 'choose' : currentStep)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      )}

      <div className="text-center mb-8">
        <UserCheck className="h-16 w-16 text-purple-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {editMode ? 'Edit Your Profile' : 'Complete Your Profile'}
        </h1>
        <p className="text-gray-600">
          {editMode ? 'Update your information' : 'Tell us about yourself to personalize your Dayboard experience.'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={profileInfo.full_name}
              onChange={(e) => setProfileInfo(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="John Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={profileInfo.display_name}
              onChange={(e) => setProfileInfo(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="John"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Name
            </label>
            <input
              type="text"
              id="preferredName"
              value={profileInfo.preferred_name}
              onChange={(e) => setProfileInfo(prev => ({ ...prev, preferred_name: e.target.value }))}
              placeholder="Johnny"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={profileInfo.phone_number}
              onChange={(e) => setProfileInfo(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={profileInfo.date_of_birth}
              onChange={(e) => setProfileInfo(prev => ({ ...prev, date_of_birth: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="familyRole" className="block text-sm font-medium text-gray-700 mb-2">
              Family Role
            </label>
            <select
              id="familyRole"
              value={profileInfo.family_role}
              onChange={(e) => setProfileInfo(prev => ({ ...prev, family_role: e.target.value as FamilyRole }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
            >
              <option value="parent_guardian">Parent/Guardian</option>
              <option value="mom">Mom</option>
              <option value="dad">Dad</option>
              <option value="child">Child</option>
              <option value="spouse_partner">Spouse/Partner</option>
              <option value="roommate">Roommate</option>
              <option value="guest">Guest</option>
              <option value="caregiver">Caregiver</option>
            </select>
          </div>
        </div>

        {/* Household Info for Edit Mode */}
        {editMode && userProfile?.household_id && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Household Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="editHouseholdName" className="block text-sm font-medium text-gray-700 mb-2">
                  Household Name
                </label>
                <input
                  type="text"
                  id="editHouseholdName"
                  value={householdInfo.name}
                  onChange={(e) => setHouseholdInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="The Smith Family"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="editHouseholdType" className="block text-sm font-medium text-gray-700 mb-2">
                  Household Type
                </label>
                <select
                  id="editHouseholdType"
                  value={householdInfo.household_type}
                  onChange={(e) => setHouseholdInfo(prev => ({ ...prev, household_type: e.target.value as HouseholdType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                >
                  <option value="solo_user">Solo User</option>
                  <option value="roommate_household">Roommate Household</option>
                  <option value="couple_no_kids">Couple (No Kids)</option>
                  <option value="family_household">Family Household</option>
                  <option value="single_parent_household">Single Parent Household</option>
                  <option value="multi_generational_household">Multi-Generational</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={editMode ? handleUpdateProfile : (currentStep === 'join' ? handleJoinHousehold : handleCreateHousehold)}
          disabled={!profileInfo.full_name.trim() || isSubmitting}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              {editMode ? 'Save Changes' : 'Complete Setup'}
              <CheckCircle className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        {!editMode && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'choose' ? 'bg-blue-600 text-white' : 
                ['join', 'create', 'profile'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300'
              }`}>
                1
              </div>
              <div className={`h-1 w-16 ${
                ['join', 'create', 'profile'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ['join', 'create'].includes(currentStep) ? 'bg-blue-600 text-white' : 
                currentStep === 'profile' ? 'bg-green-600 text-white' : 'bg-gray-300'
              }`}>
                2
              </div>
              <div className={`h-1 w-16 ${
                currentStep === 'profile' ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-300'
              }`}>
                3
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {currentStep === 'choose' && renderChooseStep()}
        {currentStep === 'join' && renderJoinStep()}
        {currentStep === 'create' && renderCreateStep()}
        {currentStep === 'profile' && renderProfileStep()}
      </div>
    </div>
  );
}

export default function ProfileSetup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ProfileSetupContent />
    </Suspense>
  );
}
