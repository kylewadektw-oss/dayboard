"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabaseClient';

interface PendingMember extends Profile {
  name: string;
  created_at: string;
}

interface HouseholdMemberManagerProps {
  user: User;
  householdId: string;
  userRole: 'admin' | 'member';
}

export default function HouseholdMemberManager({ 
  user, 
  householdId, 
  userRole 
}: HouseholdMemberManagerProps) {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch pending members (admin only)
  const fetchPendingMembers = async () => {
    if (userRole !== 'admin') return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('requested_household_id', householdId)
        .eq('household_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending members:', error);
        return;
      }

      setPendingMembers(data || []);
    } catch (error) {
      console.error('Error fetching pending members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle member approval/rejection
  const handleMemberAction = async (memberUserId: string, action: 'approve' | 'reject') => {
    setActionLoading(memberUserId);

    try {
      const { data, error } = await supabase
        .rpc('manage_household_member', {
          p_member_user_id: memberUserId,
          p_action: action,
          p_admin_user_id: user.id
        });

      if (error) {
        console.error(`Error ${action}ing member:`, error);
        alert(`Error ${action}ing member. Please try again.`);
        return;
      }

      if (!data.success) {
        alert(data.error || `Failed to ${action} member`);
        return;
      }

      // Remove member from pending list
      setPendingMembers(prev => prev.filter(member => member.user_id !== memberUserId));
      
      // Show success message
      const actionText = action === 'approve' ? 'approved' : 'rejected';
      alert(`Member ${actionText} successfully!`);

    } catch (error) {
      console.error(`Error ${action}ing member:`, error);
      alert(`Something went wrong. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchPendingMembers();
  }, [householdId, userRole]);

  // Don't show anything if user is not an admin
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          👥 Pending Member Requests
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve new household members
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingMembers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No pending member requests</p>
            <p className="text-xs text-gray-400 mt-1">
              Share your household code for family members to join
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingMembers.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {member.name || 'Unknown User'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {member.profession && `${member.profession} • `}
                      Requested {new Date(member.created_at || '').toLocaleDateString()}
                    </p>
                    {member.age && (
                      <p className="text-xs text-gray-400">{member.age} years old</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleMemberAction(member.user_id, 'reject')}
                    disabled={actionLoading === member.user_id}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === member.user_id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      'Reject'
                    )}
                  </button>
                  <button
                    onClick={() => handleMemberAction(member.user_id, 'approve')}
                    disabled={actionLoading === member.user_id}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === member.user_id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Approve'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
