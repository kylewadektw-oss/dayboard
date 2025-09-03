'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface HouseholdCodeDisplayProps {
  householdId: string;
  compact?: boolean;
  showActions?: boolean;
}

export default function HouseholdCodeDisplay({ 
  householdId, 
  compact = false,
  showActions = true 
}: HouseholdCodeDisplayProps) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchCurrentCode = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching invitation code for household:', householdId);
      
      const { data: invitations, error } = await supabase
        .from('household_invitations')
        .select('invitation_code, expires_at')
        .eq('household_id', householdId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error fetching invitation code:', error);
        return;
      }

      console.log('📋 Invitation codes found:', invitations);

      if (invitations && invitations.length > 0) {
        console.log('✅ Using invitation code:', invitations[0].invitation_code);
        setCode(invitations[0].invitation_code);
        setExpiresAt(invitations[0].expires_at);
      } else {
        console.log('ℹ️ No active invitation codes found');
        setCode(null);
        setExpiresAt(null);
      }

    } catch (error) {
      console.error('❌ Error in fetchCurrentCode:', error);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    fetchCurrentCode();
  }, [fetchCurrentCode]);

  const generateCode = async () => {
    try {
      setGenerating(true);
      console.log('🔧 Generating new invitation code for household:', householdId);

      const { data, error } = await supabase.rpc('create_household_invitation', {
        household_id_param: householdId,
        invitee_name_param: null,
        invitee_email_param: null,
        role_param: 'member'
      });

      if (error) {
        console.error('❌ Error generating code:', error);
        return;
      }

      if (data && data.success) {
        console.log('✅ New invitation code generated:', data.invitation_code);
        setCode(data.invitation_code);
        setExpiresAt(data.expires_at);
      } else {
        console.error('❌ Failed to generate code:', data);
      }

    } catch (error) {
      console.error('❌ Error in generateCode:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers - avoid document.execCommand due to CSP
      try {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // Try to copy without execCommand
        const success = document.execCommand && document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          // If all else fails, just show the code is selected
          console.log('Copy to clipboard not supported');
        }
      } catch {
        // Final fallback - just indicate the action was attempted
        console.log('Copy to clipboard not supported');
      }
    }
  };

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-gray-700 rounded-lg animate-pulse`}>
        <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-gray-700 rounded-lg text-center`}>
        <p className="text-gray-400 text-sm mb-3">No active invitation code</p>
        {showActions && (
          <button
            onClick={generateCode}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-400 text-xs mb-1">Household Code</p>
            <code className="text-green-400 font-mono text-sm tracking-wider">
              {code}
            </code>
          </div>
          {showActions && (
            <button
              onClick={copyToClipboard}
              className="ml-3 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              {copied ? '✅' : '📋'}
            </button>
          )}
        </div>
        {expiresAt && (
          <p className="text-gray-500 text-xs mt-1">
            Expires {formatExpiry(expiresAt)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium">Household Invitation Code</h4>
        {expiresAt && (
          <span className="text-gray-400 text-sm">
            Expires {formatExpiry(expiresAt)}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="bg-gray-900 rounded-lg px-4 py-3 flex-1">
          <code className="text-green-400 text-xl font-mono tracking-wider">
            {code}
          </code>
        </div>
        
        {showActions && (
          <button
            onClick={copyToClipboard}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg transition-colors"
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        )}
      </div>
      
      <p className="text-gray-400 text-sm mt-3">
        Share this code with family members to invite them to your household
      </p>
    </div>
  );
}
