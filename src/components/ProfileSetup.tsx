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
  householdCode: string;
}

export default function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [householdOption, setHouseholdOption] = useState<'create' | 'join'>('create');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user.user_metadata?.full_name || '',
    age: '',
    profession: '',
    householdName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    householdCode: ''
  });

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 2 && householdOption === 'join') {
      // Skip step 3 for join option, go directly to completion
      setStep(3);
    } else if (step < 3) {
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
      if (!profileData.name || !profileData.name.trim()) {
        alert('Name is required');
        setLoading(false);
        return;
      }

      if (householdOption === 'create' && (!profileData.householdName || !profileData.householdName.trim())) {
        alert('Household name is required');
        setLoading(false);
        return;
      }

      if (householdOption === 'join' && (!profileData.householdCode || !profileData.householdCode.trim())) {
        alert('Household code is required');
        setLoading(false);
        return;
      }

      if (!user?.id) {
        alert('User authentication error. Please sign in again.');
        setLoading(false);
        return;
      }

      let householdId: string | null;

      if (householdOption === 'create') {
        // Create new household
        console.log('Creating household with data:', {
          name: profileData.householdName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip: profileData.zip,
          created_by: user.id,
          members_count: 1
        });

        const { data: household, error: householdError } = await supabase
          .from('households')
          .insert({
            name: profileData.householdName.trim(),
            address: profileData.address.trim() || null,
            city: profileData.city.trim() || null,
            state: profileData.state.trim() || null,
            zip: profileData.zip.trim() || null,
            created_by: user.id,
            members_count: 1
          })
          .select()
          .single();

        if (householdError) {
          console.error('Household creation error:', householdError);
          alert(`Error creating household: ${householdError.message || 'Unknown error'}. Please try again.`);
          return;
        }

        householdId = household.id;

        // Add user to household_members as admin
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
      } else {
        // Join existing household using code
        const { data, error } = await supabase.rpc('join_household_by_code', {
          p_household_code: profileData.householdCode.trim().toUpperCase(),
          p_user_id: user.id
        });

        if (error || !data?.success) {
          console.error('Join household error:', error || data?.error);
          alert(data?.error || 'Invalid household code. Please check and try again.');
          setLoading(false);
          return;
        }

        // For joining, we don't set household_id directly in the profile yet
        // It will be set when an admin approves the request
        householdId = null;
        
        alert(`Join request sent to "${data.household_name}"! You'll be notified when an admin approves your request.`);
      }

      // Create profile
      const profilePayload = {
        user_id: user.id,
        name: profileData.name.trim(),
        age: profileData.age ? parseInt(profileData.age) : null,
        profession: profileData.profession.trim() || null,
        household_id: householdId, // Will be null for join requests until approved
        household_status: householdOption === 'create' ? 'admin' : 'pending',
        household_role: householdOption === 'create' ? 'admin' : 'member'
      };

      console.log('Creating profile with data:', profilePayload);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'user_id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        alert(`Error creating profile: ${profileError.message || 'Unknown error'}. Please try again.`);
        return;
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
  const isStep2Valid = householdOption === 'create' 
    ? profileData.householdName.trim() 
    : profileData.householdCode.trim();
  const isStep3Valid = householdOption === 'create' 
    ? profileData.address.trim() && profileData.city.trim() && profileData.state.trim()
    : true; // Skip address for join option

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Welcome to Dayboard!</h1>
          <p className="text-blue-700">Let&apos;s set up your profile and household</p>
          
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
            
            {/* Household Option Selection */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setHouseholdOption('create')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    householdOption === 'create'
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🏗️</div>
                  <div className="font-medium">Create New Household</div>
                  <div className="text-xs mt-1 opacity-75">Start your family&apos;s shared space</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setHouseholdOption('join')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    householdOption === 'join'
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🤝</div>
                  <div className="font-medium">Join Existing Household</div>
                  <div className="text-xs mt-1 opacity-75">Use a family invitation code</div>
                </button>
              </div>
            </div>

            {/* Create Household Form */}
            {householdOption === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Household Name *</label>
                  <input
                    type="text"
                    value={profileData.householdName}
                    onChange={(e) => handleInputChange('householdName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="e.g., The Smith Family, Johnson Household"
                  />
                  <p className="text-xs text-blue-600 mt-1">This will be the name for your family&apos;s shared space</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">What&apos;s a household?</h3>
                  <p className="text-sm text-blue-700">
                    A household is your family&apos;s shared space for organizing meals, projects, credentials, and more. 
                    You can invite other family members to join later.
                  </p>
                </div>
              </div>
            )}

            {/* Join Household Form */}
            {householdOption === 'join' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">Household Code *</label>
                  <input
                    type="text"
                    value={profileData.householdCode}
                    onChange={(e) => handleInputChange('householdCode', e.target.value.toUpperCase())}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-mono text-lg tracking-wider text-center"
                    placeholder="ENTER CODE"
                    maxLength={8}
                  />
                  <p className="text-xs text-blue-600 mt-1">Enter the 8-character code shared by your family member</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">💡 How to get a household code?</h3>
                  <p className="text-sm text-green-700">
                    Ask a family member who&apos;s already using Dayboard to share their household invitation code with you.
                    They can find it in their profile settings.
                  </p>
                </div>
              </div>
            )}

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
                {householdOption === 'join' ? 'Join Household' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Address Information or Join Completion */}
        {step === 3 && (
          <div className="space-y-6">
            {householdOption === 'create' ? (
              <>
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
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-blue-900 mb-4">🎉 Ready to join!</h2>
                
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-4xl mb-3">🤝</div>
                  <h3 className="font-semibold text-blue-900 mb-2">Join Household Request</h3>
                  <p className="text-blue-700 mb-4">
                    You&apos;re about to request to join a household using code: 
                    <span className="font-mono font-bold text-lg ml-2">{profileData.householdCode}</span>
                  </p>
                  <div className="text-sm text-blue-600 bg-white p-3 rounded border">
                    After clicking &quot;Send Request&quot;, a household admin will need to approve your request. 
                    You&apos;ll be notified once you&apos;re approved!
                  </div>
                </div>
              </>
            )}

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
                {loading ? 'Setting up...' : (householdOption === 'join' ? 'Send Request' : 'Complete Setup')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
