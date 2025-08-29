"use client";

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface ProfileSetupProps {
  user: User;
  onComplete: () => void;
}

interface ProfileData {
  name: string;
  age: string;
  profession: string;
  householdName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export default function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user.user_metadata?.full_name || '',
    age: '',
    profession: '',
    householdName: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!profileData.householdName || !profileData.householdName.trim()) {
        alert('Household name is required');
        setLoading(false);
        return;
      }

      if (!user?.id) {
        alert('User authentication error. Please sign in again.');
        setLoading(false);
        return;
      }

      console.log('Creating household with data:', {
        name: profileData.householdName,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip: profileData.zip,
        created_by: user.id,
        members_count: 1
      });

      // Create household first
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: profileData.householdName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip: profileData.zip,
          created_by: user.id,
          members_count: 1
        })
        .select()
        .single();

      if (householdError) {
        console.error('Household creation error:', householdError);
        console.error('Detailed error:', JSON.stringify(householdError, null, 2));
        console.error('User ID:', user.id);
        console.error('Household data being inserted:', {
          name: profileData.householdName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip: profileData.zip,
          created_by: user.id,
          members_count: 1
        });
        alert(`Error creating household: ${householdError.message || 'Unknown error'}. Please try again.`);
        return;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: profileData.name,
          age: profileData.age ? parseInt(profileData.age) : null,
          profession: profileData.profession,
          household_id: household.id
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        alert('Error creating profile. Please try again.');
        return;
      }

      // Add user to household_members
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('Household member creation error:', memberError);
        // This is not critical, continue
      }

      onComplete();
    } catch (error) {
      console.error('Setup error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = profileData.name.trim() && profileData.age.trim();
  const isStep2Valid = profileData.householdName.trim();
  const isStep3Valid = profileData.address.trim() && profileData.city.trim() && profileData.state.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Welcome to Dayboard!</h1>
          <p className="text-blue-700">Let's set up your profile and household</p>
          
          {/* Progress bar */}
          <div className="mt-6 flex justify-center space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step >= stepNum ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-blue-600 mt-2">Step {step} of 3</p>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">👤 Tell us about yourself</h2>
            
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">Full Name *</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">Age *</label>
              <input
                type="number"
                value={profileData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter your age"
                min="1"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">Profession</label>
              <input
                type="text"
                value={profileData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="What do you do for work?"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!isStep1Valid}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Household Information */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">🏠 Set up your household</h2>
            
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">Household Name *</label>
              <input
                type="text"
                value={profileData.householdName}
                onChange={(e) => handleInputChange('householdName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., The Smith Family, Johnson Household"
              />
              <p className="text-xs text-blue-600 mt-1">This will be the name for your family's shared space</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">What's a household?</h3>
              <p className="text-sm text-blue-700">
                A household is your family's shared space for organizing meals, projects, credentials, and more. 
                You can invite other family members to join later.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-blue-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!isStep2Valid}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Address Information */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">📍 Where are you located?</h2>
            
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">Address *</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">City *</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">State *</label>
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="State"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">ZIP Code</label>
              <input
                type="text"
                value={profileData.zip}
                onChange={(e) => handleInputChange('zip', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="ZIP code"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-blue-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!isStep3Valid || loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
