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

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, Plus, ArrowRight, CheckCircle, UserCheck } from 'lucide-react';

type SetupStep = 'choose' | 'join' | 'create' | 'profile';

interface HouseholdInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface ProfileInfo {
  full_name: string;
  display_name: string;
  phone_number: string;
  date_of_birth: string;
  family_role: string;
  preferred_name: string;
}

export default function ProfileSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<SetupStep>('choose');
  const [householdCode, setHouseholdCode] = useState('');
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfo>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    full_name: '',
    display_name: '',
    phone_number: '',
    date_of_birth: '',
    family_role: '',
    preferred_name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  const generateHouseholdCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleJoinHousehold = async () => {
    if (!householdCode.trim()) {
      setError('Please enter a household code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Check if household exists
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('household_code', householdCode.toUpperCase())
        .maybeSingle();

      if (householdError || !household) {
        setError('Invalid household code. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', household.id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (existingMember) {
        setError('You are already a member of this household.');
        setIsSubmitting(false);
        return;
      }

      // Store household info and proceed to profile setup
      setHouseholdInfo({
        name: household.name,
        address: household.address || '',
        city: household.city || '',
        state: household.state || '',
        zip: household.zip || ''
      });
      setStep('profile');
    } catch (error) {
      console.error('Error joining household:', error);
      setError('Failed to join household. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateHousehold = () => {
    setStep('create');
  };

  const handleCreateHouseholdSubmit = () => {
    if (!householdInfo.name.trim()) {
      setError('Please enter a household name');
      return;
    }
    setStep('profile');
  };

  const handleProfileSubmit = async () => {
    if (!profileInfo.full_name.trim() || !profileInfo.display_name.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let householdId: string;

      if (step === 'profile' && householdCode) {
        // Joining existing household
        const { data: household, error: householdLookupError } = await supabase
          .from('households')
          .select('id')
          .eq('household_code', householdCode.toUpperCase())
          .single();
        
        if (householdLookupError || !household) {
          throw new Error('Household not found');
        }
        
        householdId = household.id;
      } else {
        // Creating new household
        const newHouseholdCode = generateHouseholdCode();
        const { data: household, error: householdError } = await supabase
          .from('households')
          .insert({
            name: householdInfo.name,
            address: householdInfo.address,
            city: householdInfo.city,
            state: householdInfo.state,
            zip: householdInfo.zip,
            household_code: newHouseholdCode,
            created_by: user!.id,
            admin_id: user!.id,
            members_count: 1
          })
          .select()
          .single();

        if (householdError) throw householdError;
        householdId = household.id;
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileInfo.full_name,
          display_name: profileInfo.display_name,
          preferred_name: profileInfo.preferred_name,
          phone_number: profileInfo.phone_number,
          date_of_birth: profileInfo.date_of_birth,
          family_role: profileInfo.family_role,
          household_id: householdId,
          onboarding_completed: true,
          profile_completion_percentage: 85
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      // Add user to household members
      const role = householdCode ? 'member' : 'admin';
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdId,
          user_id: user!.id,
          role: role
        });

      if (memberError) throw memberError;

      // Success! Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error setting up profile:', error);
      setError('Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'choose' && 'Welcome to Dayboard!'}
              {step === 'join' && 'Join a Household'}
              {step === 'create' && 'Create Your Household'}
              {step === 'profile' && 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600">
              {step === 'choose' && 'Let\'s get your household organized'}
              {step === 'join' && 'Enter your household code to join'}
              {step === 'create' && 'Set up your new household'}
              {step === 'profile' && 'Tell us about yourself'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Choose Option */}
          {step === 'choose' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('join')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Join an Existing Household</h3>
                    <p className="text-gray-600 text-sm">Use a household code to join family or roommates</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={handleCreateHousehold}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Create a New Household</h3>
                    <p className="text-gray-600 text-sm">Start fresh and invite others to join you</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </button>
            </div>
          )}

          {/* Join Household */}
          {step === 'join' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Household Code
                </label>
                <input
                  type="text"
                  value={householdCode}
                  onChange={(e) => setHouseholdCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code (e.g., AC4D8B)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  maxLength={8}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleJoinHousehold}
                  disabled={isSubmitting || !householdCode.trim()}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Joining...' : 'Join Household'}
                </button>
              </div>
            </div>
          )}

          {/* Create Household */}
          {step === 'create' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Household Name *
                </label>
                <input
                  type="text"
                  value={householdInfo.name}
                  onChange={(e) => setHouseholdInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., The Smith Family, Roommate House"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={householdInfo.address}
                    onChange={(e) => setHouseholdInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={householdInfo.city}
                    onChange={(e) => setHouseholdInfo(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={householdInfo.state}
                    onChange={(e) => setHouseholdInfo(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={householdInfo.zip}
                    onChange={(e) => setHouseholdInfo(prev => ({ ...prev, zip: e.target.value }))}
                    placeholder="ZIP"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateHouseholdSubmit}
                  disabled={!householdInfo.name.trim()}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Profile Information */}
          {step === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileInfo.full_name}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={profileInfo.display_name}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="How others see you"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Name
                  </label>
                  <input
                    type="text"
                    value={profileInfo.preferred_name}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, preferred_name: e.target.value }))}
                    placeholder="What you like to be called"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileInfo.phone_number}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="Your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileInfo.date_of_birth}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Role
                  </label>
                  <select
                    value={profileInfo.family_role}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, family_role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select role</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="partner">Partner</option>
                    <option value="roommate">Roommate</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(householdCode ? 'join' : 'create')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleProfileSubmit}
                  disabled={isSubmitting || !profileInfo.full_name.trim() || !profileInfo.display_name.trim()}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
