'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface HouseholdCodeManagerProps {
  householdId: string;
  userRole?: string;
  onCodeGenerated?: (code: string) => void;
}

interface HouseholdInvitation {
  id: string;
  invitation_code: string;
  status: string;
  expires_at: string;
  created_at: string;
  invitee_name?: string;
  invitee_email?: string;
}

export default function HouseholdCodeManager({ 
  householdId, 
  userRole = 'member',
  onCodeGenerated 
}: HouseholdCodeManagerProps) {
  const [activeCode, setActiveCode] = useState<HouseholdInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveCode();
  }, [householdId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchActiveCode = async () => {
    try {
      setLoading(true);
      
      // Look for any active invitation code for this household
      const { data: invitations, error } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('household_id', householdId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching invitation codes:', error);
        setError('Failed to load household code');
        return;
      }

      if (invitations && invitations.length > 0) {
        setActiveCode(invitations[0]);
      }

    } catch (err) {
      console.error('Error in fetchActiveCode:', err);
      setError('Failed to load household code');
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = async () => {
    try {
      setGenerating(true);
      setError(null);

      // Call the database function to create a new invitation
      const { data, error } = await supabase.rpc('create_household_invitation', {
        household_id_param: householdId,
        invitee_name_param: null,
        invitee_email_param: null,
        role_param: 'member'
      });

      if (error) {
        console.error('Error generating code:', error);
        setError('Failed to generate invitation code');
        return;
      }

      if (data && data.success) {
        // Refresh the active code
        await fetchActiveCode();
        if (onCodeGenerated) {
          onCodeGenerated(data.invitation_code);
        }
      } else {
        setError(data?.error || 'Failed to generate code');
      }

    } catch (err) {
      console.error('Error in generateNewCode:', err);
      setError('Failed to generate invitation code');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Expired';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${diffDays} days`;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🔗 Household Invitation Code</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">🔗 Household Invitation Code</h3>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {activeCode ? (
        <div className="space-y-4">
          {/* Active Code Display */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Current Code</span>
              <span className="text-gray-400 text-sm">
                {formatExpiryDate(activeCode.expires_at)}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gray-900 rounded-lg px-4 py-3 flex-1">
                <code className="text-green-400 text-xl font-mono tracking-wider">
                  {activeCode.invitation_code}
                </code>
              </div>
              
              <button
                onClick={() => copyToClipboard(activeCode.invitation_code)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <span className="text-sm">✅</span>
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">📋</span>
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">How to share:</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Share this code with family members</li>
              <li>• They can use it to join your household</li>
              <li>• Code expires in 7 days for security</li>
            </ul>
          </div>

          {/* Generate New Code (for admins) */}
          {(userRole === 'admin' || userRole === 'owner') && (
            <div className="pt-2">
              <button
                onClick={generateNewCode}
                disabled={generating}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </span>
                ) : (
                  '🔄 Generate New Code'
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-4">🔗</div>
          <p className="text-gray-400 mb-4">No active invitation code</p>
          <button
            onClick={generateNewCode}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </span>
            ) : (
              'Generate Invitation Code'
            )}
          </button>
        </div>
      )}
    </div>
  );
}