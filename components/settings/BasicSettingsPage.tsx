/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Basic Settings Page - Fallback Implementation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Crown, 
  Info,
  XCircle,
  // Unused imports commented out to fix build errors:
  // Settings, 
  // CheckCircle,
  // Home,
  // Users,
  Zap,
  type LucideIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { toastHelpers } from '@/utils/toast';

// Basic types for existing system
// Unused interface commented out to fix build errors:
// interface UserRole {
//   role: 'member' | 'admin' | 'super_admin';
// }

interface Setting {
  key: string;
  display_name: string;
  type: 'boolean' | 'select' | 'text' | 'number';
  options?: Array<{ value: string; label: string }>;
  description?: string;
  default_value?: string | number | boolean;
}

interface TabConfig {
  key: string;
  display_name: string;
  description: string;
  icon: LucideIcon;
  available_for: string[];
}

const TABS: TabConfig[] = [
  {
    key: 'member',
    display_name: 'Member Settings',
    description: 'Personal preferences and account settings',
    icon: User,
    available_for: ['member', 'admin', 'super_admin']
  },
  {
    key: 'admin',
    display_name: 'Admin Settings',
    description: 'Household management and member permissions',
    icon: Shield,
    available_for: ['admin', 'super_admin']
  },
  {
    key: 'super_admin',
    display_name: 'Super Admin',
    description: 'System-wide controls and global settings',
    icon: Crown,
    available_for: ['super_admin']
  }
];

// Basic member settings
const MEMBER_SETTINGS: Setting[] = [
  {
    key: 'email_notifications',
    display_name: 'Email Notifications',
    description: 'Receive notifications via email',
    type: 'boolean' as const,
    default_value: true
  },
  {
    key: 'dark_mode',
    display_name: 'Dark Mode',
    description: 'Use dark theme interface',
    type: 'boolean' as const,
    default_value: false
  },
  {
    key: 'timezone',
    display_name: 'Timezone',
    description: 'Your preferred timezone',
    type: 'select' as const,
    options: [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'Eastern Time' },
      { value: 'America/Chicago', label: 'Central Time' },
      { value: 'America/Denver', label: 'Mountain Time' },
      { value: 'America/Los_Angeles', label: 'Pacific Time' }
    ],
    default_value: 'UTC'
  }
];

// Basic household settings
const HOUSEHOLD_SETTINGS: Setting[] = [
  {
    key: 'household_name',
    display_name: 'Household Name',
    description: 'Display name for your household',
    type: 'text' as const,
    default_value: ''
  },
  {
    key: 'invite_notifications',
    display_name: 'Invitation Notifications',
    description: 'Notify when new members join',
    type: 'boolean' as const,
    default_value: true
  },
  {
    key: 'auto_assign_chores',
    display_name: 'Auto-assign Chores',
    description: 'Automatically distribute chores to members',
    type: 'boolean' as const,
    default_value: false
  }
];

// Basic feature controls
const FEATURE_CONTROLS = [
  {
    key: 'meals_module',
    display_name: 'Meals Module',
    description: 'Meal planning and recipe management',
    category: 'core',
    access_level: 'all'
  },
  {
    key: 'chores_module',
    display_name: 'Chores Module',
    description: 'Task assignment and tracking',
    category: 'core',
    access_level: 'all'
  },
  {
    key: 'calendar_module',
    display_name: 'Calendar Module',
    description: 'Shared household calendar',
    category: 'core',
    access_level: 'all'
  },
  {
    key: 'budget_module',
    display_name: 'Budget Module',
    description: 'Expense tracking and budgeting',
    category: 'premium',
    access_level: 'admin_only'
  },
  {
    key: 'reports_module',
    display_name: 'Reports & Analytics',
    description: 'Detailed household insights',
    category: 'premium',
    access_level: 'admin_only'
  }
];

export default function BasicSettingsPage() {
  const { profile, refreshUser } = useAuth();
  // Unused variables commented out to fix build errors:
  // const { user, permissions } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('member');
  const [memberSettings, setMemberSettings] = useState<Record<string, unknown>>({});
  const [householdSettings, setHouseholdSettings] = useState<Record<string, unknown>>({});
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null); // Error handling coming soon

  const supabase = createClient();

  // Determine user role
  const userRole = profile?.role || 'member';

  // Get available tabs based on user role
  const availableTabs = TABS.filter(tab => 
    tab.available_for.includes(userRole)
  );

  // Load existing settings from profile
  useEffect(() => {
    if (profile) {
      // Load member settings from profile
      const notificationPrefs = typeof profile.notification_preferences === 'object' && profile.notification_preferences !== null 
        ? profile.notification_preferences as Record<string, unknown> : {};
      
      setMemberSettings({
        email_notifications: notificationPrefs.email ?? true,
        dark_mode: false, // Will add UI preferences to profile later
        timezone: profile.timezone || 'UTC'
      });

      // Load household settings (if admin)
      if (profile.household_id && (userRole === 'admin' || userRole === 'super_admin')) {
        // For now, use placeholder data - will be replaced when new tables are available
        setHouseholdSettings({
          household_name: profile.name || '',
          invite_notifications: true,
          auto_assign_chores: false
        });
      }

      // Initialize feature toggles
      const toggles: Record<string, boolean> = {};
      FEATURE_CONTROLS.forEach(feature => {
        toggles[feature.key] = true; // Default all features to enabled
      });
      setFeatureToggles(toggles);

      setLoading(false);
    }
  }, [profile, userRole]);

  const updateMemberSetting = async (settingKey: string, value: string | number | boolean) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      let updateData: Record<string, unknown> = {};

      switch (settingKey) {
        case 'email_notifications':
          const currentNotificationPrefs = typeof profile.notification_preferences === 'object' && profile.notification_preferences !== null 
            ? profile.notification_preferences as Record<string, unknown> : {};
          updateData = {
            notification_preferences: {
              ...currentNotificationPrefs,
              email: value
            }
          };
          break;
        case 'dark_mode':
          // Store in bio field as JSON for now (temporary solution)
          const currentBio = profile.bio || '{}';
          let bioData: Record<string, unknown> = {};
          try {
            bioData = JSON.parse(currentBio);
          } catch {
            bioData = {};
          }
          bioData.ui_preferences = { ...(bioData.ui_preferences as Record<string, unknown> || {}), dark_mode: value };
          updateData = { bio: JSON.stringify(bioData) };
          break;
        case 'timezone':
          updateData = { timezone: value };
          break;
        default:
          return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      setMemberSettings(prev => ({ ...prev, [settingKey]: value }));
      toastHelpers.success('Setting updated successfully');
      
      // Refresh user data to get updated profile
      await refreshUser();
    } catch (err: unknown) {
      console.error('Error updating member setting:', err);
      toastHelpers.error(`Failed to update setting: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const updateHouseholdSetting = async (settingKey: string, value: string | number | boolean) => {
    if (!profile?.household_id) return;

    setSaving(true);
    try {
      // For now, store in profile until household settings table is available
      let updateData = {};

      switch (settingKey) {
        case 'household_name':
          // This would update the household table when available
          updateData = { preferred_name: value }; // Placeholder
          break;
        default:
          // Store other settings in bio field as JSON (temporary solution)
          const currentBio = profile.bio || '{}';
          let bioData: Record<string, unknown> = {};
          try {
            bioData = JSON.parse(currentBio);
          } catch {
            bioData = {};
          }
          bioData.household_preferences = { ...(bioData.household_preferences as Record<string, unknown> || {}), [settingKey]: value };
          updateData = { bio: JSON.stringify(bioData) };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      setHouseholdSettings(prev => ({ ...prev, [settingKey]: value }));
      toastHelpers.success('Household setting updated successfully');
      
      await refreshUser();
    } catch (err: unknown) {
      console.error('Error updating household setting:', err);
      toastHelpers.error(`Failed to update setting: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const updateFeatureToggle = async (featureKey: string, enabled: boolean) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      // Store feature toggles in bio field as JSON (temporary solution)
      const currentBio = profile.bio || '{}';
      let bioData: Record<string, unknown> = {};
      try {
        bioData = JSON.parse(currentBio);
      } catch {
        bioData = {};
      }

      const currentToggles = (bioData.feature_toggles as Record<string, boolean>) || {};
      const updatedToggles = { ...currentToggles, [featureKey]: enabled };
      bioData.feature_toggles = updatedToggles;

      const { error } = await supabase
        .from('profiles')
        .update({ bio: JSON.stringify(bioData) })
        .eq('id', profile.id);

      if (error) throw error;

      setFeatureToggles(prev => ({ ...prev, [featureKey]: enabled }));
      toastHelpers.success('Feature toggle updated successfully');
      
      await refreshUser();
    } catch (err: unknown) {
      console.error('Error updating feature toggle:', err);
      toastHelpers.error(`Failed to update feature: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (
    setting: Setting, 
    value: string | number | boolean, 
    updateFn: (key: string, val: string | number | boolean) => void
  ) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <button
            onClick={() => updateFn(setting.key, !value)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-purple-600' : 'bg-gray-300'
            } ${saving ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'text':
        return (
          <input
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => updateFn(setting.key, e.target.value)}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
        );

      case 'select':
        return (
          <select
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => updateFn(setting.key, e.target.value)}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return <span className="text-gray-500">Unsupported setting type</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="flex space-x-4 mb-6">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Settings</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 p-4 md:p-8 text-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your preferences, household settings, and feature access
          </p>
          {userRole === 'super_admin' && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex">
                <Info className="h-5 w-5 text-purple-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-purple-800">Enhanced Permissions System Available</h3>
                  <p className="mt-2 text-sm text-purple-700">
                    A comprehensive permissions system is ready to be deployed. Apply the latest database migration to enable advanced feature controls.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none focus-visible:ring transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200 border-b-white -mb-px'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.display_name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Member Settings Tab */}
          {activeTab === 'member' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Preferences</h2>
                <div className="space-y-6">
                  {MEMBER_SETTINGS.map((setting) => (
                    <div key={setting.key} className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="text-sm font-medium text-gray-900">{setting.display_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      </div>
                      <div className="min-w-0">
                        {renderSettingInput(
                          setting, 
                          (memberSettings[setting.key] ?? setting.default_value) as string | number | boolean,
                          updateMemberSetting
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Admin Settings Tab */}
          {(activeTab === 'admin') && (userRole === 'admin' || userRole === 'super_admin') && (
            <div className="space-y-6">
              {/* Household Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Household Settings</h2>
                <div className="space-y-6">
                  {HOUSEHOLD_SETTINGS.map((setting) => (
                    <div key={setting.key} className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="text-sm font-medium text-gray-900">{setting.display_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      </div>
                      <div className="min-w-0">
                        {renderSettingInput(
                          setting, 
                          (householdSettings[setting.key] ?? setting.default_value) as string | number | boolean,
                          updateHouseholdSetting
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Access Control */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Access Control</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Control which features are available to household members. These are basic controls - enhanced permissions will be available after database migration.
                </p>
                
                <div className="space-y-4">
                  {FEATURE_CONTROLS.map((feature) => (
                    <div key={feature.key} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{feature.display_name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feature.category === 'core' ? 'bg-green-100 text-green-800' :
                              feature.category === 'premium' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {feature.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feature.access_level === 'admin_only' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {feature.access_level.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => updateFeatureToggle(feature.key, !featureToggles[feature.key])}
                          disabled={saving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            featureToggles[feature.key] ? 'bg-purple-600' : 'bg-gray-300'
                          } ${saving ? 'opacity-50' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              featureToggles[feature.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Super Admin Settings Tab */}
          {activeTab === 'super_admin' && userRole === 'super_admin' && (
            <div className="space-y-6">
              {/* System Notice */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="flex">
                  <Crown className="h-6 w-6 text-purple-600 mt-1" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-purple-900">Super Admin Controls</h3>
                    <p className="mt-2 text-sm text-purple-700">
                      You have access to system-wide controls. The enhanced permissions system provides granular feature toggles, 
                      role-based access controls, and comprehensive settings management.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          toastHelpers.info('Enhanced permissions system is ready for deployment. Apply the latest database migration to enable all features.');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Deploy Enhanced System
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Features */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Feature Control</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Basic global feature toggles. Enhanced controls will be available after database migration.
                </p>
                
                <div className="space-y-4">
                  {FEATURE_CONTROLS.map((feature) => (
                    <div key={feature.key} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{feature.display_name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feature.category === 'core' ? 'bg-green-100 text-green-800' :
                              feature.category === 'premium' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {feature.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => updateFeatureToggle(feature.key, !featureToggles[feature.key])}
                          disabled={saving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            featureToggles[feature.key] ? 'bg-green-600' : 'bg-gray-300'
                          } ${saving ? 'opacity-50' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              featureToggles[feature.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
