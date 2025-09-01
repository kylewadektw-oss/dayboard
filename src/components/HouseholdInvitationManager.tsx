"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase, HouseholdInvitation } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface HouseholdInvitationManagerProps {
  householdId: string;
  onClose?: () => void;
}

export default function HouseholdInvitationManager({ householdId, onClose }: HouseholdInvitationManagerProps) {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<HouseholdInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    invitee_name: '',
    invitee_email: '',
    role: 'member' as 'admin' | 'member'
  });

  const fetchInvitations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
      } else {
        setInvitations(data || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const createInvitation = async () => {
    if (!user || !newInvitation.invitee_name.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_household_invitation', {
        household_id_param: householdId,
        invitee_email_param: newInvitation.invitee_email || null,
        invitee_name_param: newInvitation.invitee_name,
        role_param: newInvitation.role
      });

      if (error) {
        console.error('Error creating invitation:', error);
        alert('Error creating invitation. Please try again.');
      } else if (data?.success) {
        alert(`Invitation created! Share this code: ${data.invitation_code}`);
        setNewInvitation({ invitee_name: '', invitee_email: '', role: 'member' });
        fetchInvitations(); // Refresh the list
      } else {
        alert('Error creating invitation: ' + (data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('household_invitations')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (error) {
        console.error('Error cancelling invitation:', error);
        alert('Error cancelling invitation. Please try again.');
      } else {
        fetchInvitations(); // Refresh the list
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Invitation code copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy. Code: ' + text);
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center text-gray-600 mt-2">Loading invitations...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">👥 Household Invitations</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Create New Invitation */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-4">📧 Invite New Member</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="invitee-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="invitee-name"
                type="text"
                value={newInvitation.invitee_name}
                onChange={(e) => setNewInvitation(prev => ({ ...prev, invitee_name: e.target.value }))}
                placeholder="Enter person's name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="invitee-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                id="invitee-email"
                type="email"
                value={newInvitation.invitee_email}
                onChange={(e) => setNewInvitation(prev => ({ ...prev, invitee_email: e.target.value }))}
                placeholder="Enter email address"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="invitee-role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="invitee-role"
                value={newInvitation.role}
                onChange={(e) => setNewInvitation(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={createInvitation}
                disabled={creating || !newInvitation.invitee_name.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Invitation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Invitations */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Existing Invitations</h3>
        
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No invitations yet. Create one above to invite family members!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {invitation.invitee_name || 'Unnamed Invite'}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {invitation.role}
                      </span>
                    </div>
                    
                    {invitation.invitee_email && (
                      <p className="text-sm text-gray-600 mb-2">📧 {invitation.invitee_email}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 Created: {new Date(invitation.created_at!).toLocaleDateString()}</span>
                      <span>⏰ Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                      {isExpired(invitation.expires_at) && (
                        <span className="text-red-600 font-medium">⚠️ Expired</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                      <>
                        <button
                          onClick={() => copyToClipboard(invitation.invitation_code)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          📋 Copy Code
                        </button>
                        <div className="text-xs text-center text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {invitation.invitation_code}
                        </div>
                        <button
                          onClick={() => cancelInvitation(invitation.id!)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {invitation.status === 'accepted' && invitation.used_at && (
                      <div className="text-xs text-green-600">
                        ✅ Joined: {new Date(invitation.used_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
