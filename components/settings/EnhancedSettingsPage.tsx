/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Enhanced Settings Management System
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Crown, 
  XCircle,
  Home,
  Users,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types_db';
import NavigationAccessMatrix from './NavigationAccessMatrix';

type Json = Database['public']['Tables']['user_settings']['Row']['setting_value'];
import FeatureAccessMatrix from './FeatureAccessMatrix';
import SettingsPermissionsMatrix from './SettingsPermissionsMatrix';
import UserRoleMatrix from './UserRoleMatrix';

// Types
interface SettingsTab {
  category_key: string;
  display_name: string;
  description: string;
  icon: string;
  sort_order: number;
}

interface SettingsItem {
  category_key: string;
  setting_key: string;
  display_name: string;
  description: string | null;
  setting_type: string;
  default_value: unknown;
  options?: unknown;
  required_role: string;
  sort_order: number;
}

interface FeatureControl {
  feature_key: string;
  display_name: string;
  description: string | null;
  category: string;
  access_level: string;
  is_enabled_globally: boolean;
  requires_subscription: boolean;
  minimum_tier: string | null;
}

interface HouseholdFeatureSetting {
  feature_key: string;
  is_enabled: boolean;
  enabled_for_admins: boolean;
  enabled_for_members: boolean;
}

const IconMap = {
  User,
  Shield,
  Crown,
  Settings,
  Home,
  Users,
  Zap,
  Globe
};

export default function EnhancedSettingsPage() {
  const { profile } = useAuth();
  const [availableTabs, setAvailableTabs] = useState<SettingsTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>('member');
  const [settingsItems, setSettingsItems] = useState<SettingsItem[]>([]);
  const [userSettings, setUserSettings] = useState<Record<string, unknown>>({});
  const [householdSettings, setHouseholdSettings] = useState<Record<string, unknown>>({});
  const [featureControls, setFeatureControls] = useState<FeatureControl[]>([]);
  const [householdFeatures, setHouseholdFeatures] = useState<HouseholdFeatureSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Collapsible sections state (default collapsed for super admin)
  const [systemSettingsCollapsed, setSystemSettingsCollapsed] = useState(true);
  const [superAdminFeaturesCollapsed, setSuperAdminFeaturesCollapsed] = useState(true);

  const supabase = createClient();

  // Load available tabs based on user role
  useEffect(() => {
    const loadTabs = async () => {
      if (!profile?.id) {
        console.log('❌ No profile ID available:', profile);
        return;
      }

      console.log('🔍 Loading tabs for profile ID:', profile.id);

      try {
        const { data, error } = await supabase.rpc('get_user_settings_tabs', {
          user_id_param: profile.id
        });

        console.log('📊 Tabs RPC result:', { data, error });

        if (error) throw error;
        setAvailableTabs(data || []);
        
        // Set default active tab to the first available tab
        if (data && data.length > 0) {
          setActiveTab(data[0].category_key);
          console.log('✅ Set active tab to:', data[0].category_key);
        } else {
          console.log('⚠️ No tabs available');
        }
      } catch (err: unknown) {
        console.error('Error loading settings tabs:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadTabs();
  }, [profile?.id, supabase, profile]);

  // Load settings items for current tab
  useEffect(() => {
    const loadSettingsItems = async () => {
      if (!activeTab) return;

      try {
        const { data, error } = await supabase
          .from('settings_items')
          .select('*')
          .eq('category_key', activeTab)
          .order('sort_order');

        if (error) throw error;
        setSettingsItems(data || []);
      } catch (err: unknown) {
        console.error('Error loading settings items:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    loadSettingsItems();
  }, [activeTab, supabase]);

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', profile.id);

        if (error) throw error;
        
        const settingsMap = (data || []).reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, unknown>);
        
        setUserSettings(settingsMap);
      } catch (err: unknown) {
        console.error('Error loading user settings:', err);
      }
    };

    loadUserSettings();
  }, [profile?.id, supabase]);

  // Load household settings (for admin tabs)
  useEffect(() => {
    const loadHouseholdSettings = async () => {
      if (!profile?.household_id || activeTab === 'member') return;

      try {
        const { data, error } = await supabase
          .from('household_settings')
          .select('*')
          .eq('household_id', profile.household_id);

        if (error) throw error;
        
        const settingsMap = (data || []).reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, unknown>);
        
        setHouseholdSettings(settingsMap);
      } catch (err: unknown) {
        console.error('Error loading household settings:', err);
      }
    };

    loadHouseholdSettings();
  }, [profile?.household_id, activeTab, supabase]);

  // Load feature controls (for admin and super admin)
  useEffect(() => {
    const loadFeatureControls = async () => {
      if (activeTab === 'member') return;

      try {
        let query = supabase
          .from('global_feature_control')
          .select('*');

        if (activeTab === 'admin') {
          query = query.in('category', ['core', 'premium', 'admin']);
        } else if (activeTab === 'super_admin') {
          query = query.neq('category', 'member'); // All except member-specific
        }

        const { data, error } = await query.order('category').order('display_name');

        if (error) throw error;
        setFeatureControls(data || []);

        // Load household feature settings for admin tab
        if (activeTab === 'admin' && profile?.household_id) {
          const { data: householdData, error: householdError } = await supabase
            .from('household_feature_settings')
            .select('*')
            .eq('household_id', profile.household_id);

          if (!householdError) {
            setHouseholdFeatures(householdData || []);
          }
        }
      } catch (err: unknown) {
        console.error('Error loading feature controls:', err);
      }
    };

    loadFeatureControls();
  }, [activeTab, profile?.household_id, supabase]);

  useEffect(() => {
    if (availableTabs.length > 0 && settingsItems.length >= 0) {
      setLoading(false);
    }
  }, [availableTabs, settingsItems]);

  const getSettingValue = (item: SettingsItem) => {
    const isHouseholdSetting = activeTab !== 'member';
    const settings = isHouseholdSetting ? householdSettings : userSettings;
    
    return settings[item.setting_key] !== undefined 
      ? settings[item.setting_key] 
      : item.default_value;
  };

  const updateSetting = async (settingKey: string, value: string | number | boolean | null | unknown[]) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const isHouseholdSetting = activeTab !== 'member';
      
      if (isHouseholdSetting && profile.household_id) {
        // Update household setting
        const { error } = await supabase
          .from('household_settings')
          .upsert({
            household_id: profile.household_id,
            setting_key: settingKey,
            setting_value: value as Json,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'household_id,setting_key'
          });

        if (error) throw error;
        setHouseholdSettings(prev => ({ ...prev, [settingKey]: value }));
      } else {
        // Update user setting
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: profile.id,
            setting_key: settingKey,
            setting_value: value as Json,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,setting_key'
          });

        if (error) throw error;
        setUserSettings(prev => ({ ...prev, [settingKey]: value }));
      }

      console.log('✅ Setting updated successfully');
    } catch (err: unknown) {
      console.error('Error updating setting:', err);
      console.error(`Failed to update setting: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for navigation settings
  // Note: getUserSetting and handleSettingChange removed as they were unused

  const updateFeatureControl = async (featureKey: string, updates: Partial<FeatureControl | HouseholdFeatureSetting>) => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      if (activeTab === 'super_admin') {
        // Update global feature control
        const { error } = await supabase
          .from('global_feature_control')
          .update(updates)
          .eq('feature_key', featureKey);

        if (error) throw error;
        
        setFeatureControls(prev => prev.map(fc => 
          fc.feature_key === featureKey 
            ? { ...fc, ...updates }
            : fc
        ));
      } else if (activeTab === 'admin' && profile.household_id) {
        // Update household feature setting
        const { error } = await supabase
          .from('household_feature_settings')
          .upsert({
            household_id: profile.household_id,
            feature_key: featureKey,
            ...updates,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'household_id,feature_key'
          });

        if (error) throw error;
        
        setHouseholdFeatures(prev => {
          const existing = prev.find(hf => hf.feature_key === featureKey);
          if (existing) {
            return prev.map(hf => 
              hf.feature_key === featureKey 
                ? { ...hf, ...updates }
                : hf
            );
          } else {
            return [...prev, { 
              feature_key: featureKey,
              is_enabled: true,
              enabled_for_admins: true,
              enabled_for_members: true,
              ...updates
            } as HouseholdFeatureSetting];
          }
        });
      }

      console.log('✅ Feature setting updated successfully');
    } catch (err: unknown) {
      console.error('Error updating feature control:', err);
      console.error(`Failed to update feature: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (item: SettingsItem) => {
    const value = getSettingValue(item);

    switch (item.setting_type) {
      case 'boolean':
        return (
          <button
            onClick={() => updateSetting(item.setting_key, !value)}
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

      case 'string':
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => updateSetting(item.setting_key, e.target.value)}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={Number(value) || ''}
            onChange={(e) => updateSetting(item.setting_key, parseInt(e.target.value) || 0)}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
        );

      case 'select':
        return (
          <select
            value={String(value || '')}
            onChange={(e) => updateSetting(item.setting_key, e.target.value)}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {(item.options as {value: string; label: string}[])?.map((option: {value: string; label: string}) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {(item.options as {value: string; label: string}[])?.map((option: {value: string; label: string}) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    updateSetting(item.setting_key, newValue);
                  }}
                  disabled={saving}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return <span className="text-gray-500">Unsupported setting type</span>;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderFeatureControl = (feature: FeatureControl) => {
    if (activeTab === 'super_admin') {
      return (
        <div key={feature.feature_key} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{feature.display_name}</h4>
              <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  feature.category === 'core' ? 'bg-green-100 text-green-800' :
                  feature.category === 'premium' ? 'bg-purple-100 text-purple-800' :
                  feature.category === 'admin' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {feature.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  feature.access_level === 'super_admin_only' ? 'bg-red-100 text-red-800' :
                  feature.access_level === 'admin_only' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {feature.access_level.replace('_', ' ')}
                </span>
                {feature.requires_subscription && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {feature.minimum_tier}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => updateFeatureControl(feature.feature_key, { 
                is_enabled_globally: !feature.is_enabled_globally 
              })}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                feature.is_enabled_globally ? 'bg-green-600' : 'bg-gray-300'
              } ${saving ? 'opacity-50' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  feature.is_enabled_globally ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'admin') {
      const householdSetting = householdFeatures.find(hf => hf.feature_key === feature.feature_key);
      const isEnabled = householdSetting?.is_enabled ?? true;
      const enabledForAdmins = householdSetting?.enabled_for_admins ?? true;
      const enabledForMembers = householdSetting?.enabled_for_members ?? true;

      return (
        <div key={feature.feature_key} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{feature.display_name}</h4>
              <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
            </div>
            <button
              onClick={() => updateFeatureControl(feature.feature_key, { 
                is_enabled: !isEnabled 
              })}
              disabled={saving || !feature.is_enabled_globally}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled && feature.is_enabled_globally ? 'bg-purple-600' : 'bg-gray-300'
              } ${saving || !feature.is_enabled_globally ? 'opacity-50' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled && feature.is_enabled_globally ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {isEnabled && feature.is_enabled_globally && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Admin Access</span>
                <button
                  onClick={() => updateFeatureControl(feature.feature_key, { 
                    enabled_for_admins: !enabledForAdmins 
                  })}
                  disabled={saving}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    enabledForAdmins ? 'bg-blue-600' : 'bg-gray-300'
                  } ${saving ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      enabledForAdmins ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Member Access</span>
                <button
                  onClick={() => updateFeatureControl(feature.feature_key, { 
                    enabled_for_members: !enabledForMembers 
                  })}
                  disabled={saving || feature.access_level === 'admin_only'}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    enabledForMembers && feature.access_level !== 'admin_only' ? 'bg-green-600' : 'bg-gray-300'
                  } ${saving || feature.access_level === 'admin_only' ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      enabledForMembers && feature.access_level !== 'admin_only' ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
          
          {!feature.is_enabled_globally && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              This feature has been disabled globally by a super admin.
            </div>
          )}
        </div>
      );
    }
  };

  const getTabIcon = (iconName: string) => {
    const Icon = IconMap[iconName as keyof typeof IconMap] || Settings;
    return <Icon className="h-4 w-4" />;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groupedFeatures = featureControls.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureControl[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 p-4 md:p-8 text-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your preferences, household settings, and feature access
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200">
          {availableTabs.map((tab) => (
            <button
              key={tab.category_key}
              onClick={() => setActiveTab(tab.category_key)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none focus-visible:ring transition-colors ${
                activeTab === tab.category_key
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200 border-b-white -mb-px'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTabIcon(tab.icon)}
              <span>{tab.display_name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Member Settings Tab */}
          {activeTab === 'member' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Preferences</h2>
                <div className="space-y-6">
                  {settingsItems.map((item) => (
                    <div key={item.setting_key} className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="text-sm font-medium text-gray-900">{item.display_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="min-w-0">
                        {renderSettingInput(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Admin Settings Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              {/* Household Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Household Settings</h2>
                <div className="space-y-6">
                  {settingsItems.map((item) => (
                    <div key={item.setting_key} className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="text-sm font-medium text-gray-900">{item.display_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="min-w-0">
                        {renderSettingInput(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Access Control - Enhanced with Matrix */}
              <FeatureAccessMatrix mode="admin" className="mb-6" />
            </div>
          )}

          {/* Super Admin Settings Tab */}
          {activeTab === 'super_admin' && (
            <div className="space-y-6">
              {/* System Settings - Collapsible */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <button
                  onClick={() => setSystemSettingsCollapsed(!systemSettingsCollapsed)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
                    <span className="text-sm text-gray-500">({settingsItems.length} items)</span>
                  </div>
                  {systemSettingsCollapsed ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {!systemSettingsCollapsed && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="space-y-6 mt-6">
                      {settingsItems.map((item) => (
                        <div key={item.setting_key} className="flex items-start justify-between">
                          <div className="flex-1 mr-4">
                            <h3 className="text-sm font-medium text-gray-900">{item.display_name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>
                          <div className="min-w-0">
                            {renderSettingInput(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Super Admin Features - Collapsible */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <button
                  onClick={() => setSuperAdminFeaturesCollapsed(!superAdminFeaturesCollapsed)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Super Admin Features</h2>
                    <span className="text-sm text-gray-500">(Advanced Controls)</span>
                  </div>
                  {superAdminFeaturesCollapsed ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {!superAdminFeaturesCollapsed && (
                  <div className="px-6 pb-6 border-t border-gray-100 space-y-6 mt-6">
                    {/* Global Feature Control - Enhanced with Matrix */}
                    <FeatureAccessMatrix mode="super_admin" className="mb-6" />

                    {/* Settings Permissions Control */}
                    <SettingsPermissionsMatrix className="mb-6" />

                    {/* User Role Management */}
                    <UserRoleMatrix className="mb-6" />

                    {/* Navigation Access Control */}
                    <NavigationAccessMatrix className="mb-6" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
