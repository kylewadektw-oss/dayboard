/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Navigation Access Control Matrix - Checkbox-based permission system
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Info, 
  Home,
  UtensilsCrossed,
  ClipboardList,
  Briefcase,
  FolderOpen,
  User,
  Settings as SettingsIcon,
  FileText,
  Activity,
  Bug,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

// Navigation feature definitions matching SQL schema
const NAVIGATION_FEATURES = [
  { 
    key: 'dashboard_access', 
    label: 'Dashboard', 
    description: 'Main dashboard overview and home page',
    icon: Home,
    category: 'main'
  },
  { 
    key: 'meals_access', 
    label: 'Meals', 
    description: 'Meal planning and recipe management',
    icon: UtensilsCrossed,
    category: 'main'
  },
  { 
    key: 'lists_access', 
    label: 'Lists', 
    description: 'Task lists and checklists management',
    icon: ClipboardList,
    category: 'main'
  },
  { 
    key: 'work_access', 
    label: 'Work', 
    description: 'Work-related tools and tracking',
    icon: Briefcase,
    category: 'main'
  },
  { 
    key: 'projects_access', 
    label: 'Projects', 
    description: 'Project management and collaboration',
    icon: FolderOpen,
    category: 'main'
  },
  { 
    key: 'profile_access', 
    label: 'Profile', 
    description: 'User profile management and settings',
    icon: User,
    category: 'main'
  },
  { 
    key: 'settings_access', 
    label: 'Settings', 
    description: 'Application settings and configuration',
    icon: SettingsIcon,
    category: 'admin'
  }
];

const DEVELOPMENT_FEATURES = [
  { 
    key: 'logs_dashboard_access', 
    label: 'Logs Dashboard', 
    description: 'System logs and monitoring interface',
    icon: FileText,
    category: 'development'
  },
  { 
    key: 'simple_logging_access', 
    label: 'Simple Logging', 
    description: 'Basic logging test and debug tool',
    icon: Activity,
    category: 'development'
  },
  { 
    key: 'auth_debug_access', 
    label: 'Auth Debug', 
    description: 'Authentication debugging and troubleshooting',
    icon: Bug,
    category: 'development'
  },
  { 
    key: 'customer_review_access', 
    label: 'Customer Review', 
    description: 'Review and approve new customer signups',
    icon: User,
    category: 'development'
  }
];

interface AccessSettings {
  [featureKey: string]: {
    memberAccess: boolean;
    adminAccess: boolean;
  };
}

interface NavigationAccessMatrixProps {
  className?: string;
}

export default function NavigationAccessMatrix({ className = '' }: NavigationAccessMatrixProps) {
  const { profile } = useAuth();
  const [accessSettings, setAccessSettings] = useState<AccessSettings>({});
  const [developmentEnabled, setDevelopmentEnabled] = useState({
    logs_dashboard: false,
    simple_logging: false,
    auth_debug: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Load current access settings
  useEffect(() => {
    const loadAccessSettings = async () => {
      if (!profile?.id) return;

      try {
        setLoading(true);
        
        // Load navigation access settings
        const { data: userSettings, error: settingsError } = await supabase
          .from('user_settings')
          .select('setting_key, setting_value')
          .eq('user_id', profile.id)
          .or(
            NAVIGATION_FEATURES.map(feature => 
              `setting_key.eq.${feature.key.replace('_access', '_member_access')},setting_key.eq.${feature.key.replace('_access', '_admin_access')}`
            ).join(',') + ',' +
            DEVELOPMENT_FEATURES.map(feature => 
              `setting_key.eq.enable_${feature.key.replace('_access', '')}`
            ).join(',')
          );

        if (settingsError) throw settingsError;

        // Transform settings into access matrix
        const accessMatrix: AccessSettings = {};
        const devSettings = { ...developmentEnabled };

        NAVIGATION_FEATURES.forEach(feature => {
          const memberKey = feature.key.replace('_access', '_member_access');
          const adminKey = feature.key.replace('_access', '_admin_access');
          
          const memberSetting = userSettings?.find(s => s.setting_key === memberKey);
          const adminSetting = userSettings?.find(s => s.setting_key === adminKey);
          
          accessMatrix[feature.key] = {
            memberAccess: memberSetting ? memberSetting.setting_value === 'true' : getDefaultAccess(feature.key, 'member'),
            adminAccess: adminSetting ? adminSetting.setting_value === 'true' : getDefaultAccess(feature.key, 'admin')
          };
        });

        DEVELOPMENT_FEATURES.forEach(feature => {
          const enableKey = `enable_${feature.key.replace('_access', '')}`;
          const setting = userSettings?.find(s => s.setting_key === enableKey);
          const devKey = feature.key.replace('_access', '') as keyof typeof devSettings;
          devSettings[devKey] = setting ? setting.setting_value === 'true' : false;
        });

        setAccessSettings(accessMatrix);
        setDevelopmentEnabled(devSettings);
      } catch (err: any) {
        console.error('Error loading access settings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccessSettings();
  }, [profile?.id, supabase]);

  // Get default access based on feature and role
  const getDefaultAccess = (featureKey: string, role: 'member' | 'admin'): boolean => {
    const defaults = {
      dashboard_access: { member: true, admin: true },
      meals_access: { member: true, admin: true },
      lists_access: { member: true, admin: true },
      work_access: { member: false, admin: true },
      projects_access: { member: false, admin: true },
      profile_access: { member: true, admin: true },
      settings_access: { member: false, admin: true }
    };
    
    return defaults[featureKey as keyof typeof defaults]?.[role] ?? false;
  };

  // Update access setting
  const updateAccessSetting = async (featureKey: string, role: 'member' | 'admin', enabled: boolean) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const settingKey = `${featureKey.replace('_access', '')}_${role}_access`;
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: profile.id,
          setting_key: settingKey,
          setting_value: enabled.toString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) throw error;

      // Update local state
      setAccessSettings(prev => ({
        ...prev,
        [featureKey]: {
          ...prev[featureKey],
          [`${role}Access`]: enabled
        }
      }));

      // toastHelpers.success(`${role.charAt(0).toUpperCase() + role.slice(1)} access updated`);
      console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} access updated`);
    } catch (err: any) {
      console.error('Error updating access setting:', err);
      // toastHelpers.error(`Failed to update access: ${err.message}`);
      console.error('Failed to update access:', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update development feature setting
  const updateDevelopmentSetting = async (featureKey: string, enabled: boolean) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const settingKey = `enable_${featureKey.replace('_access', '')}`;
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: profile.id,
          setting_key: settingKey,
          setting_value: enabled.toString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) throw error;

      // Update local state
      const devKey = featureKey.replace('_access', '') as keyof typeof developmentEnabled;
      setDevelopmentEnabled(prev => ({
        ...prev,
        [devKey]: enabled
      }));

      // toastHelpers.success(`Development feature ${enabled ? 'enabled' : 'disabled'}`);
      console.log(`Development feature ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      console.error('Error updating development setting:', err);
      // toastHelpers.error(`Failed to update setting: ${err.message}`);
      console.error('Failed to update setting:', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Render checkbox with proper styling
  const renderCheckbox = (checked: boolean, onChange: () => void, disabled: boolean = false, alwaysChecked: boolean = false) => {
    return (
      <button
        onClick={onChange}
        disabled={disabled || saving || alwaysChecked}
        className={`relative inline-flex items-center justify-center w-6 h-6 rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          alwaysChecked 
            ? 'bg-green-500 border-green-500 text-white cursor-not-allowed'
            : checked 
              ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'
              : 'bg-white border-gray-300 hover:border-gray-400'
        } ${disabled || saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={alwaysChecked ? 'Super Admin always has access' : checked ? 'Access granted' : 'Access denied'}
      >
        {(checked || alwaysChecked) && (
          <Check className="w-4 h-4" strokeWidth={3} />
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center">
          <X className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-sm font-medium text-red-800">Error Loading Access Settings</h3>
        </div>
        <p className="text-sm text-red-700 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Navigation Access Control Matrix
        </h2>
        <p className="text-sm text-gray-600">
          Control which navigation features are accessible to different user roles. Check/uncheck boxes to grant or deny access.
        </p>
      </div>

      {/* Access Control Matrix */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Home className="h-5 w-5 mr-2 text-green-600" />
          Main Navigation Features
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-900 border-b border-gray-200">Feature</th>
                <th className="text-left p-4 font-medium text-gray-900 border-b border-gray-200">Description</th>
                <th className="text-center p-4 font-medium text-gray-900 border-b border-gray-200 min-w-[100px]">
                  <div className="flex flex-col items-center">
                    <span>Member</span>
                    <span className="text-xs text-gray-500 font-normal">☐</span>
                  </div>
                </th>
                <th className="text-center p-4 font-medium text-gray-900 border-b border-gray-200 min-w-[100px]">
                  <div className="flex flex-col items-center">
                    <span>Admin</span>
                    <span className="text-xs text-gray-500 font-normal">☐</span>
                  </div>
                </th>
                <th className="text-center p-4 font-medium text-gray-900 border-b border-gray-200 min-w-[120px]">
                  <div className="flex flex-col items-center">
                    <span>Super Admin</span>
                    <span className="text-xs text-gray-500 font-normal">✅</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {NAVIGATION_FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                const settings = accessSettings[feature.key] || { memberAccess: false, adminAccess: false };
                
                return (
                  <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-2 text-gray-600" />
                        <span className="font-medium text-gray-900">{feature.label}</span>
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{feature.description}</span>
                    </td>
                    <td className="p-4 border-b border-gray-100 text-center">
                      {renderCheckbox(
                        settings.memberAccess,
                        () => updateAccessSetting(feature.key, 'member', !settings.memberAccess)
                      )}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-center">
                      {renderCheckbox(
                        settings.adminAccess,
                        () => updateAccessSetting(feature.key, 'admin', !settings.adminAccess)
                      )}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-center">
                      {renderCheckbox(true, () => {}, false, true)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Development Features */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Bug className="h-5 w-5 mr-2 text-orange-600" />
          Development Tools
        </h3>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-orange-800">Development Access Control</h4>
              <p className="text-sm text-orange-700 mt-1">
                These features are only available to Super Admins when enabled. Use caution when enabling development tools.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-900 border-b border-gray-200">Development Tool</th>
                <th className="text-left p-4 font-medium text-gray-900 border-b border-gray-200">Description</th>
                <th className="text-center p-4 font-medium text-gray-900 border-b border-gray-200">Member</th>
                <th className="text-center p-4 font-medium text-gray-900 border-b border-gray-200">Admin</th>
                <th className="text-center p-4 font-medium text-gray-900 border-b border-gray-200">
                  <div className="flex flex-col items-center">
                    <span>Super Admin</span>
                    <span className="text-xs text-gray-500 font-normal">Enable Tool</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {DEVELOPMENT_FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                const devKey = feature.key.replace('_access', '') as keyof typeof developmentEnabled;
                const isEnabled = developmentEnabled[devKey];
                
                return (
                  <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-2 text-gray-600" />
                        <span className="font-medium text-gray-900">{feature.label}</span>
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{feature.description}</span>
                    </td>
                    <td className="p-4 border-b border-gray-100 text-center">
                      <span className="text-gray-400 text-sm">N/A</span>
                    </td>
                    <td className="p-4 border-b border-gray-100 text-center">
                      <span className="text-gray-400 text-sm">N/A</span>
                    </td>
                    <td className="p-4 border-b border-gray-100 text-center">
                      {renderCheckbox(
                        isEnabled,
                        () => updateDevelopmentSetting(feature.key, !isEnabled)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-600 border border-purple-600 rounded mr-2 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span>Access Granted</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2"></div>
            <span>Access Denied</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 border border-green-500 rounded mr-2 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span>Always Granted (Super Admin)</span>
          </div>
        </div>
      </div>

      {/* Save Status */}
      {saving && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving changes...
        </div>
      )}
    </div>
  );
}
