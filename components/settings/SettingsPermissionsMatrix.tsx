/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Settings Permissions Matrix
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Crown, 
  User, 
  Check,
  X,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

interface SettingPermission {
  setting_key: string;
  display_name: string;
  description: string;
  category_key: string;
  setting_type: string;
  member_view: boolean;
  member_edit: boolean;
  admin_view: boolean;
  admin_edit: boolean;
  super_admin_view: boolean;
  super_admin_edit: boolean;
}

interface SettingsPermissionsMatrixProps {
  className?: string;
  mode?: 'admin' | 'super_admin';
}

// PermissionIcons defined but not used in current implementation
// const PermissionIcons = {
//   view: Eye,
//   edit: Edit,
//   none: Lock
// };

export default function SettingsPermissionsMatrix({ className = '' }: SettingsPermissionsMatrixProps) {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<SettingPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const loadSettings = async () => {
      if (!profile?.id) return;

      try {
        setLoading(true);
        
        // Get all settings items
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings_items')
          .select('*')
          .order('category_key, sort_order');

        if (settingsError) throw settingsError;

        // Get current permission settings
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('user_settings')
          .select('setting_key, setting_value')
          .eq('user_id', profile.id)
          .like('setting_key', '%_permission%');

        if (permissionsError) console.warn('Permissions error:', permissionsError);

        // Build settings permission matrix
        const permissionsMap = (permissionsData || []).reduce((acc, permission) => {
          acc[permission.setting_key] = permission.setting_value as boolean;
          return acc;
        }, {} as Record<string, boolean>);

        const settingPermissions: SettingPermission[] = (settingsData || []).map(setting => {
          const memberViewKey = `${setting.setting_key}_member_view_permission`;
          const memberEditKey = `${setting.setting_key}_member_edit_permission`;
          const adminViewKey = `${setting.setting_key}_admin_view_permission`;
          const adminEditKey = `${setting.setting_key}_admin_edit_permission`;
          
          return {
            setting_key: setting.setting_key,
            display_name: setting.display_name,
            description: setting.description || '',
            category_key: setting.category_key,
            setting_type: setting.setting_type,
            member_view: permissionsMap[memberViewKey] ?? getDefaultPermission('member', 'view', setting.category_key),
            member_edit: permissionsMap[memberEditKey] ?? getDefaultPermission('member', 'edit', setting.category_key),
            admin_view: permissionsMap[adminViewKey] ?? getDefaultPermission('admin', 'view', setting.category_key),
            admin_edit: permissionsMap[adminEditKey] ?? getDefaultPermission('admin', 'edit', setting.category_key),
            super_admin_view: true, // Super admin always has view access
            super_admin_edit: true  // Super admin always has edit access
          };
        });

        setSettings(settingPermissions);
      } catch (err: unknown) {
        console.error('Error loading settings permissions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [profile?.id, supabase]);

  const getDefaultPermission = (role: string, action: string, category: string): boolean => {
    // Default permission rules
    switch (category) {
      case 'member':
        return role === 'member' ? true : true; // Members can see/edit their own settings
      case 'admin':
        return role === 'admin' || role === 'super_admin' ? true : false;
      case 'super_admin':
        return role === 'super_admin' ? true : false;
      default:
        return false;
    }
  };

  const handlePermissionChange = async (
    settingKey: string, 
    role: 'member' | 'admin', 
    action: 'view' | 'edit', 
    enabled: boolean
  ) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const permissionKey = `${settingKey}_${role}_${action}_permission`;
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: profile.id,
          setting_key: permissionKey,
          setting_value: enabled.toString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) throw error;

      // Update local state
      setSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, [`${role}_${action}`]: enabled }
          : setting
      ));

      console.log(`✅ Updated ${role} ${action} permission for ${settingKey}: ${enabled}`);
    } catch (err: unknown) {
      console.error('Error updating permission:', err);
      setError(`Failed to update permission: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category_key]) {
      acc[setting.category_key] = [];
    }
    acc[setting.category_key].push(setting);
    return acc;
  }, {} as Record<string, SettingPermission[]>);

  const getCategoryTitle = (categoryKey: string): string => {
    switch (categoryKey) {
      case 'member': return 'Personal Settings';
      case 'admin': return 'Administrative Settings';
      case 'super_admin': return 'System Settings';
      default: return categoryKey.replace('_', ' ').toUpperCase();
    }
  };

  const getCategoryColor = (categoryKey: string): string => {
    switch (categoryKey) {
      case 'member': return 'text-green-600 bg-green-50 border-green-200';
      case 'admin': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'super_admin': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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
            <h3 className="text-sm font-medium text-red-800">Error Loading Settings Permissions</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 text-gray-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Settings Permissions Matrix</h2>
          <p className="text-sm text-gray-600 mt-1">
            Control who can view and edit different settings. Use checkboxes to grant specific permissions to each role.
          </p>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="space-y-8">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <div key={category}>
            {/* Category Header */}
            <div className={`flex items-center mb-4 p-3 rounded-lg border ${getCategoryColor(category)}`}>
              <SettingsIcon className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-medium">
                {getCategoryTitle(category)}
              </h3>
            </div>

            {/* Settings Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                      Setting
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                      Type
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-green-600" />
                          Member
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <span className="text-xs text-gray-500">View</span>
                          <span className="text-xs text-gray-500">Edit</span>
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1 text-blue-600" />
                          Admin
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <span className="text-xs text-gray-500">View</span>
                          <span className="text-xs text-gray-500">Edit</span>
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center">
                          <Crown className="h-4 w-4 mr-1 text-purple-600" />
                          Super Admin
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <span className="text-xs text-gray-500">View</span>
                          <span className="text-xs text-gray-500">Edit</span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categorySettings.map((setting, index) => (
                    <tr key={setting.setting_key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {/* Setting Name */}
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">{setting.display_name}</div>
                          <div className="text-sm text-gray-600 mt-1">{setting.description}</div>
                        </div>
                      </td>

                      {/* Setting Type */}
                      <td className="px-4 py-3 border-b border-gray-200">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {setting.setting_type}
                        </span>
                      </td>

                      {/* Member Permissions */}
                      <td className="px-4 py-3 text-center border-b border-gray-200">
                        <div className="flex items-center justify-center space-x-3">
                          {/* View Permission */}
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={setting.member_view}
                              onChange={(e) => handlePermissionChange(setting.setting_key, 'member', 'view', e.target.checked)}
                              disabled={saving || setting.category_key === 'admin' || setting.category_key === 'super_admin'}
                              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
                            />
                            <span className="sr-only">Member view permission</span>
                          </label>

                          {/* Edit Permission */}
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={setting.member_edit}
                              onChange={(e) => handlePermissionChange(setting.setting_key, 'member', 'edit', e.target.checked)}
                              disabled={saving || setting.category_key === 'admin' || setting.category_key === 'super_admin' || !setting.member_view}
                              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
                            />
                            <span className="sr-only">Member edit permission</span>
                          </label>
                        </div>
                        {(setting.category_key === 'admin' || setting.category_key === 'super_admin') && (
                          <div className="flex justify-center mt-1" title="Not available for members">
                            <Info className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                      </td>

                      {/* Admin Permissions */}
                      <td className="px-4 py-3 text-center border-b border-gray-200">
                        <div className="flex items-center justify-center space-x-3">
                          {/* View Permission */}
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={setting.admin_view}
                              onChange={(e) => handlePermissionChange(setting.setting_key, 'admin', 'view', e.target.checked)}
                              disabled={saving || setting.category_key === 'super_admin'}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="sr-only">Admin view permission</span>
                          </label>

                          {/* Edit Permission */}
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={setting.admin_edit}
                              onChange={(e) => handlePermissionChange(setting.setting_key, 'admin', 'edit', e.target.checked)}
                              disabled={saving || setting.category_key === 'super_admin' || !setting.admin_view}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="sr-only">Admin edit permission</span>
                          </label>
                        </div>
                        {setting.category_key === 'super_admin' && (
                          <div className="flex justify-center mt-1" title="Super admin only">
                            <Info className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                      </td>

                      {/* Super Admin Permissions (Always Enabled) */}
                      <td className="px-4 py-3 text-center border-b border-gray-200">
                        <div className="flex items-center justify-center space-x-3">
                          <Check className="h-4 w-4 text-green-600" />
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Permission Rules:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Super Admin always has full view and edit access to all settings</li>
              <li>• Edit permission requires view permission to be enabled first</li>
              <li>• Members cannot access admin or super admin category settings</li>
              <li>• Admins cannot access super admin category settings</li>
              <li>• Settings marked as disabled show an info icon with explanation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
