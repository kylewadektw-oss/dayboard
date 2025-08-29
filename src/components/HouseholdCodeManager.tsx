"use client";

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Household, Profile } from '../lib/supabaseClient';

interface HouseholdCodeManagerProps {
  user: User;
  household: Household | null;
  profile: Profile | null;
  onProfileUpdate: (profile: Profile) => void;
}

export default function HouseholdCodeManager({ 
  user, 
  household, 
  profile, 
  onProfileUpdate 
}: HouseholdCodeManagerProps) {
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Copy household code to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Join household by code
  const joinHousehold = async () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a household code');
      return;
    }

    setLoading(true);
    setJoinError('');

    try {
      // Call the stored function to join household
      const { data, error } = await supabase
        .rpc('join_household_by_code', {
          p_household_code: joinCode.toUpperCase().trim(),
          p_user_id: user.id
        });

      if (error) {
        console.error('Join household error:', error);
        setJoinError('Error joining household. Please try again.');
        return;
      }

      if (!data.success) {
        setJoinError(data.error || 'Failed to join household');
        return;
      }

      // Refresh profile data
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Profile refresh error:', profileError);
      } else {
        onProfileUpdate(updatedProfile);
      }

      setShowJoinModal(false);
      setJoinCode('');
      
      // Show success message
      alert(`Join request sent to "${data.household_name}"! You'll be notified when an admin approves your request.`);

    } catch (error) {
      console.error('Join household error:', error);
      setJoinError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!profile) return null;

    switch (profile.household_status) {
      case 'pending':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Request Pending</h3>
                <p className="text-sm text-yellow-700">
                  Your request to join a household is pending approval from an admin.
                </p>
              </div>
            </div>
          </div>
        );
      case 'admin':
      case 'approved':
        return null; // Will show household info instead
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Household Status */}
      {profile?.household_status === 'pending' && getStatusDisplay()}

      {/* Household Code Display (for members/admins) */}
      {household && (profile?.household_status === 'approved' || profile?.household_status === 'admin') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🏠 Household Invitation Code
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Share this code with family members to invite them to join your household:
          </p>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-blue-300 rounded-lg px-4 py-3 font-mono text-xl font-bold text-blue-900 tracking-wider">
              {household.household_code}
            </div>
            <button
              onClick={() => copyToClipboard(household.household_code || '')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {copySuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-blue-600 mt-3">
            💡 Family members can use this code during sign-up or in their profile settings to request to join.
          </p>
        </div>
      )}

      {/* Join Household Option (for users not in a household) */}
      {(!household && profile?.household_status !== 'pending') && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            👨‍👩‍👧‍👦 Join a Household
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Have a household code? Enter it below to request to join an existing household.
          </p>
          
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Enter Household Code
          </button>
        </div>
      )}

      {/* Join Household Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Join a Household</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Household Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-lg tracking-wider text-center focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 8-character code provided by a household admin
                </p>
              </div>

              {joinError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{joinError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={joinHousehold}
                  disabled={loading || !joinCode.trim()}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : 'Request to Join'}
                </button>
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                    setJoinError('');
                  }}
                  disabled={loading}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
