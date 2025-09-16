/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * User Role Management Matrix
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Crown, 
  User, 
  Check,
  X,
  Info,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

interface HouseholdUser {
  id: string;
  user_id: string;
  name: string | null;
  role: string | null;
  created_at: string | null;
  last_seen_at: string | null;
  can_manage_members: boolean;
  can_manage_admins: boolean;
  can_view_analytics: boolean;
  can_manage_billing: boolean;
  can_manage_features: boolean;
  can_export_data: boolean;
}

interface UserRoleMatrixProps {
  className?: string;
}

const RoleColors = {
  'member': 'text-green-600 bg-green-50 border-green-200',
  'admin': 'text-blue-600 bg-blue-50 border-blue-200',
  'super_admin': 'text-purple-600 bg-purple-50 border-purple-200'
};

const RoleIcons = {
  'member': User,
  'admin': Shield,
  'super_admin': Crown
};

const PermissionLabels = {
  can_manage_members: 'Manage Members',
  can_manage_admins: 'Manage Admins',
  can_view_analytics: 'View Analytics',
  can_manage_billing: 'Manage Billing',
  can_manage_features: 'Manage Features',
  can_export_data: 'Export Data'
};

export default function UserRoleMatrix({ className = '' }: UserRoleMatrixProps) {
  const { profile } = useAuth();
  const [users, setUsers] = useState<HouseholdUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');

  const supabase = createClient();

  useEffect(() => {
    const loadHouseholdUsers = async () => {
      if (!profile?.household_id) return;

      try {
        setLoading(true);
        
                // Get users in the household
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id,
            user_id,
            name,
            preferred_name,
            avatar_url,
            role,
            is_active,
            onboarding_completed,
            created_at,
            updated_at,
            last_seen_at
          `)
          .eq('household_id', profile.household_id)
          .order('role', { ascending: false })
          .order('created_at');

        if (usersError) throw usersError;

        // Get user permissions
        const userIds = (usersData || []).map(u => u.user_id);
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('user_settings')
          .select('user_id, setting_key, setting_value')
          .in('user_id', userIds)
          .in('setting_key', Object.keys(PermissionLabels));

        if (permissionsError) console.warn('Permissions error:', permissionsError);

        // Build user permission matrix
        const permissionsMap = (permissionsData || []).reduce((acc, perm) => {
          if (!acc[perm.user_id]) acc[perm.user_id] = {};
          acc[perm.user_id][perm.setting_key] = perm.setting_value === 'true' || perm.setting_value === true;
          return acc;
        }, {} as Record<string, Record<string, boolean>>);

        const householdUsers: HouseholdUser[] = (usersData || []).map(user => ({
          ...user,
          role: user.role || 'member', // Ensure role is never null
          can_manage_members: permissionsMap[user.user_id]?.can_manage_members ?? getDefaultPermission(user.role || 'member', 'can_manage_members'),
          can_manage_admins: permissionsMap[user.user_id]?.can_manage_admins ?? getDefaultPermission(user.role || 'member', 'can_manage_admins'),
          can_view_analytics: permissionsMap[user.user_id]?.can_view_analytics ?? getDefaultPermission(user.role || 'member', 'can_view_analytics'),
          can_manage_billing: permissionsMap[user.user_id]?.can_manage_billing ?? getDefaultPermission(user.role || 'member', 'can_manage_billing'),
          can_manage_features: permissionsMap[user.user_id]?.can_manage_features ?? getDefaultPermission(user.role || 'member', 'can_manage_features'),
          can_export_data: permissionsMap[user.user_id]?.can_export_data ?? getDefaultPermission(user.role || 'member', 'can_export_data')
        }));

        setUsers(householdUsers);
      } catch (err: unknown) {
        console.error('Error loading household users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadHouseholdUsers();
  }, [profile?.household_id, supabase]);

  const getDefaultPermission = (role: string, permission: string): boolean => {
    switch (role) {
      case 'super_admin':
        return true; // Super admin has all permissions
      case 'admin':
        switch (permission) {
          case 'can_manage_members': return true;
          case 'can_manage_admins': return false;
          case 'can_view_analytics': return true;
          case 'can_manage_billing': return false;
          case 'can_manage_features': return false;
          case 'can_export_data': return true;
          default: return false;
        }
      case 'member':
        return false; // Members have no special permissions by default
      default:
        return false;
    }
  };

  const handlePermissionChange = async (userId: string, permission: string, enabled: boolean) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          setting_key: permission,
          setting_value: enabled.toString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, [permission]: enabled }
          : user
      ));

      console.log(`✅ Updated ${permission} for user ${userId}: ${enabled}`);
    } catch (err: unknown) {
      console.error('Error updating permission:', err);
      setError(`Failed to update permission: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as 'member' | 'admin' | 'super_admin' })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              role: newRole,
              // Reset permissions to defaults for new role
              can_manage_members: getDefaultPermission(newRole, 'can_manage_members'),
              can_manage_admins: getDefaultPermission(newRole, 'can_manage_admins'),
              can_view_analytics: getDefaultPermission(newRole, 'can_view_analytics'),
              can_manage_billing: getDefaultPermission(newRole, 'can_manage_billing'),
              can_manage_features: getDefaultPermission(newRole, 'can_manage_features'),
              can_export_data: getDefaultPermission(newRole, 'can_export_data')
            }
          : user
      ));

      console.log(`✅ Updated role for user ${userId}: ${newRole}`);
    } catch (err: unknown) {
      console.error('Error updating role:', err);
      setError(`Failed to update role: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInviteUser = async () => {
    if (!profile?.household_id || !inviteEmail) return;

    setSaving(true);
    try {
      // TODO: Implement invite user functionality
      // This would typically involve sending an email invitation
      console.log(`Inviting ${inviteEmail} as ${inviteRole}`);
      
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (err: unknown) {
      console.error('Error inviting user:', err);
      setError(`Failed to invite user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const canEditUser = (targetUser: HouseholdUser): boolean => {
    if (!profile) return false;
    
    // Super admin can edit anyone except other super admins
    if (profile.role === 'super_admin') {
      return targetUser.role !== 'super_admin' || targetUser.id === profile.id;
    }
    
    // Admin can edit members and themselves
    if (profile.role === 'admin') {
      return targetUser.role === 'member' || targetUser.id === profile.id;
    }
    
    // Members can only edit themselves
    return targetUser.id === profile.id;
  };

  const canChangeRole = (targetUser: HouseholdUser): boolean => {
    if (!profile) return false;
    
    // Only super admin can change roles
    return profile.role === 'super_admin' && targetUser.id !== profile.id;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center">
          <X className="h-5 w-5 text-red-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Users</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Role Management Matrix</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage household members, roles, and individual permissions. Use checkboxes to control specific capabilities.
            </p>
          </div>
        </div>
        
        {profile?.role === 'super_admin' && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </button>
        )}
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                disabled={!inviteEmail || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                User
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                Role
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                Manage Members
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                Manage Admins
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                View Analytics
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                Manage Billing
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                Manage Features
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                Export Data
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const RoleIcon = RoleIcons[user.role as keyof typeof RoleIcons] || User;
              const roleColor = RoleColors[user.role as keyof typeof RoleColors] || RoleColors.member;
              const canEdit = canEditUser(user);
              const canChangeUserRole = canChangeRole(user);
              
              return (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {/* User Info */}
                  <td className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <RoleIcon className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {user.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-600">ID: {user.user_id}</div>
                        {user.last_seen_at && (
                          <div className="text-xs text-gray-500">
                            Last active: {new Date(user.last_seen_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3 text-center border-b border-gray-200">
                    {canChangeUserRole ? (
                      <select
                        value={user.role || 'member'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={saving}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${roleColor}`}>
                        {(user.role || 'member').replace('_', ' ')}
                      </span>
                    )}
                  </td>

                  {/* Permission Checkboxes */}
                  {Object.keys(PermissionLabels).map((permission) => (
                    <td key={permission} className="px-4 py-3 text-center border-b border-gray-200">
                      {user.role === 'super_admin' ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={user[permission as keyof HouseholdUser] as boolean}
                            onChange={(e) => handlePermissionChange(user.id, permission, e.target.checked)}
                            disabled={saving || !canEdit || (permission === 'can_manage_admins' && user.role !== 'admin')}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="sr-only">{PermissionLabels[permission as keyof typeof PermissionLabels]}</span>
                        </label>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Role & Permission Rules:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Super Admin always has all permissions (cannot be unchecked)</li>
              <li>• Only Super Admin can change user roles or manage admin permissions</li>
              <li>• Admins can manage member permissions but not other admins</li>
              <li>• Members can only view and edit their own basic profile settings</li>
              <li>• Role changes reset permissions to defaults for that role</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
