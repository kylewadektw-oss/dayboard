"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface JoinHouseholdFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function JoinHouseholdForm({ onSuccess, onCancel }: JoinHouseholdFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleJoinHousehold = async () => {
    if (!user || !invitationCode.trim()) {
      setError('Please enter an invitation code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.rpc('accept_household_invitation', {
        invitation_code_param: invitationCode.trim().toUpperCase(),
        user_id_param: user.id
      });

      if (error) {
        console.error('Error accepting invitation:', error);
        setError('Error joining household. Please check your invitation code and try again.');
      } else if (data?.success) {
        setSuccess('🎉 Successfully joined the household!');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/dashboard');
          }
        }, 2000);
      } else {
        setError(data?.error || 'Invalid or expired invitation code');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const formatted = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return formatted.slice(0, 8); // Limit to 8 characters
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setInvitationCode(formatted);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">🏠 Join a Household</h2>
        <p className="text-gray-600">Enter the invitation code shared by your family member</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700 mb-2">
            Invitation Code
          </label>
          <input
            id="invitation-code"
            type="text"
            value={invitationCode}
            onChange={handleCodeChange}
            placeholder="Enter 8-character code"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-lg font-mono tracking-widest uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={8}
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Example: ABC12345
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleJoinHousehold}
            disabled={loading || !invitationCode.trim() || invitationCode.length !== 8}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Joining...
              </div>
            ) : (
              'Join Household'
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ask a household member for their invitation code</li>
          <li>• Enter the 8-character code above</li>
          <li>• You'll automatically join their household</li>
          <li>• Start managing tasks and meals together!</li>
        </ul>
      </div>
    </div>
  );
}
