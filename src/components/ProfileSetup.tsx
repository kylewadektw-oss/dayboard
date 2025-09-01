'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface ProfileData {
  name: string;
  age: string;
  profession: string;
  householdName: string;
  householdCode: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface ProfileSetupProps {
  user: User | null;
  onComplete: () => void;
  isEditing?: boolean;
}

export default function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [householdOption, setHouseholdOption] = useState<'create' | 'join'>('create');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    age: '',
    profession: '',
    householdName: '',
    householdCode: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateHouseholdCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting profile setup for user:', user.id);

      // Handle household creation or joining
      let householdId = '';
      
      if (householdOption === 'create') {
        // Create new household
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .insert([{
            name: profileData.householdName,
            code: generateHouseholdCode(),
            created_by: user.id,
            address: profileData.address,
            city: profileData.city,
            state: profileData.state,
            zip_code: profileData.zipCode
          }])
          .select()
          .single();

        if (householdError || !householdData) {
          console.error('Household creation error:', householdError);
          throw new Error('Failed to create household');
        }

        householdId = householdData.id;
        console.log('Household created successfully:', householdId);
      } else {
        // Join existing household
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('id')
          .eq('code', profileData.householdCode.toUpperCase())
          .single();

        if (householdError || !householdData) {
          console.error('Household lookup error:', householdError);
          throw new Error('Invalid household code');
        }

        householdId = householdData.id;
        console.log('Found household:', householdId);
      }

      // Create/update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: profileData.name,
          age: parseInt(profileData.age),
          profession: profileData.profession,
          household_id: householdId,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        throw new Error('Failed to save profile');
      }

      console.log('Profile saved successfully');

      // Add user to household_members if not already there
      const { error: memberError } = await supabase
        .from('household_members')
        .upsert({
          household_id: householdId,
          user_id: user.id,
          role: householdOption === 'create' ? 'admin' : 'member'
        }, {
          onConflict: 'household_id,user_id'
        });

      if (memberError) {
        console.error('Household member error:', memberError);
        // Don&apos;t throw here as the core profile is saved
      } else {
        console.log('Household member created successfully');
      }

      console.log('Profile setup completed successfully');
      alert('Profile setup completed successfully!');
      onComplete();

    } catch (error) {
      console.error('Profile setup error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = profileData.name.trim() && profileData.age.trim();
  const isStep2Valid = householdOption === 'join' 
    ? profileData.householdCode.trim().length === 8
    : profileData.householdName.trim() && profileData.address.trim() && profileData.city.trim() && profileData.state.trim() && profileData.zipCode.trim();

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
                  currentStep >= stepNum ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-blue-600 mt-2">Step {currentStep} of 3</p>
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">👤 Tell us about yourself</h2>
            
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-blue-800 mb-2">Full Name *</label>
              <input
                id="profile-name"
                name="name"
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Your full name"
                autoComplete="name"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="profile-age" className="block text-sm font-medium text-blue-800 mb-2">Age *</label>
              <input
                id="profile-age"
                name="age"
                type="number"
                value={profileData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Your age"
                min="1"
                max="120"
                autoComplete="age"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="profile-profession" className="block text-sm font-medium text-blue-800 mb-2">Profession</label>
              <input
                id="profile-profession"
                name="profession"
                type="text"
                value={profileData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="What do you do for work?"
                autoComplete="organization-title"
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

        {/* Step 2: Household Setup */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">🏠 Household Setup</h2>
            
            {/* Household Option Selection */}
            <div className="space-y-4">
              <div 
                onClick={() => setHouseholdOption('create')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  householdOption === 'create' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    id="create-household"
                    name="householdOption"
                    value="create"
                    checked={householdOption === 'create'}
                    onChange={() => setHouseholdOption('create')}
                    className="mr-3"
                    aria-describedby="create-household-desc"
                  />
                  <label htmlFor="create-household" className="font-medium text-blue-900">Create New Household</label>
                </div>
                <p id="create-household-desc" className="text-sm text-gray-600 ml-6">Start a new household and invite family members later</p>
              </div>

              <div 
                onClick={() => setHouseholdOption('join')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  householdOption === 'join' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    id="join-household"
                    name="householdOption"
                    value="join"
                    checked={householdOption === 'join'}
                    onChange={() => setHouseholdOption('join')}
                    className="mr-3"
                    aria-describedby="join-household-desc"
                  />
                  <label htmlFor="join-household" className="font-medium text-blue-900">Join Existing Household</label>
                </div>
                <p id="join-household-desc" className="text-sm text-gray-600 ml-6">Use a household code to join your family</p>
              </div>
            </div>

            {/* Conditional Input Fields */}
            {householdOption === 'create' && (
              <div>
                <label htmlFor="household-name" className="block text-sm font-medium text-blue-800 mb-2">Household Name *</label>
                <input
                  id="household-name"
                  name="householdName"
                  type="text"
                  value={profileData.householdName}
                  onChange={(e) => handleInputChange('householdName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="e.g., The Smith Family"
                  autoComplete="organization"
                  aria-required="true"
                />
              </div>
            )}

            {householdOption === 'join' && (
              <div>
                <label htmlFor="household-code" className="block text-sm font-medium text-blue-800 mb-2">Household Code *</label>
                <input
                  id="household-code"
                  name="householdCode"
                  type="text"
                  value={profileData.householdCode}
                  onChange={(e) => handleInputChange('householdCode', e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-mono text-center text-lg tracking-wider"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  autoComplete="off"
                  aria-required="true"
                  aria-describedby="household-code-help"
                />
                <p id="household-code-help" className="text-xs text-blue-600 mt-1">Enter the 8-character code from your household admin</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
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
        {currentStep === 3 && (
          <div className="space-y-6">
            {householdOption === 'create' ? (
              <>
                <h2 className="text-xl font-semibold text-blue-900 mb-4">📍 Where are you located?</h2>
                
                <div>
                  <label htmlFor="profile-address" className="block text-sm font-medium text-blue-800 mb-2">Address *</label>
                  <input
                    id="profile-address"
                    name="address"
                    type="text"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Street address"
                    autoComplete="street-address"
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="profile-city" className="block text-sm font-medium text-blue-800 mb-2">City *</label>
                    <input
                      id="profile-city"
                      name="city"
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="City"
                      autoComplete="address-level2"
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-state" className="block text-sm font-medium text-blue-800 mb-2">State *</label>
                    <input
                      id="profile-state"
                      name="state"
                      type="text"
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      placeholder="State"
                      autoComplete="address-level1"
                      aria-required="true"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="profile-zip" className="block text-sm font-medium text-blue-800 mb-2">ZIP Code</label>
                  <input
                    id="profile-zip"
                    name="zip"
                    type="text"
                    value={profileData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="ZIP code"
                    autoComplete="postal-code"
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
                onClick={handlePrev}
                className="flex-1 bg-gray-200 text-blue-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
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
