/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Comprehensive Settings Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Crown, 
  Save, 
  Eye,
  EyeOff,
  Info,
  CheckCircle,
  XCircle,
  Home,
  Users,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

// Types
interface SettingsCategory {
  category_key: string;
  display_name: string;
  description: string;
  icon: string;
  sort_order: number;
  required_role: string;
}

interface SettingsItem {
  id: string;
  category_key: string;
  setting_key: string;
  display_name: string;
  description: string | null;
  setting_type: string;
  default_value: any;
  options?: any;
  required_role: string;
  sort_order: number;
}

interface UserSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
}

interface HouseholdSetting {
  id: string;
  household_id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
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

export default function ComprehensiveSettingsDashboard() {
  const { user, profile, refreshUser } = useAuth();
  const [categories, setCategories] = useState<SettingsCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('member');
  const [settingsItems, setSettingsItems] = useState<SettingsItem[]>([]);
  const [userSettings, setUserSettings] = useState<Record<string, any>>({});
  const [householdSettings, setHouseholdSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Load available categories based on user role
  useEffect(() => {
    const loadCategories = async () => {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase.rpc('get_user_settings_tabs', {
          user_id_param: profile.id
        });

        if (error) throw error;
        setCategories(data || []);
        
        if (data && data.length > 0) {
          setActiveCategory(data[0].category_key);
        }
      } catch (err: any) {
        console.error('Error loading settings categories:', err);
        setError(err.message);
      }
    };

    loadCategories();
  }, [profile?.id, supabase]);

  // Load settings items for current category
  useEffect(() => {
    const loadSettingsItems = async () => {
      if (!activeCategory) return;

      try {
        const { data, error } = await supabase
          .from('settings_items')
          .select('*')
          .eq('category_key', activeCategory)
          .order('sort_order');

        if (error) throw error;
        setSettingsItems(data || []);
      } catch (err: any) {
        console.error('Error loading settings items:', err);
        setError(err.message);
      }
    };

    loadSettingsItems();
  }, [activeCategory, supabase]);

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
        }, {} as Record<string, any>);
        
        setUserSettings(settingsMap);
      } catch (err: any) {
        console.error('Error loading user settings:', err);
      }
    };

    loadUserSettings();
  }, [profile?.id, supabase]);

  // Load household settings (for admin categories)
  useEffect(() => {
    const loadHouseholdSettings = async () => {
      if (!profile?.household_id || activeCategory === 'member') return;

      try {
        const { data, error } = await supabase
          .from('household_settings')
          .select('*')
          .eq('household_id', profile.household_id);

        if (error) throw error;
        
        const settingsMap = (data || []).reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, any>);
        
        setHouseholdSettings(settingsMap);
      } catch (err: any) {
        console.error('Error loading household settings:', err);
      }
    };

    loadHouseholdSettings();
  }, [profile?.household_id, activeCategory, supabase]);

  useEffect(() => {
    if (categories.length > 0) {
      setLoading(false);
    }
  }, [categories]);

  const getSettingValue = (item: SettingsItem) => {
    const isHouseholdSetting = activeCategory !== 'member';
    const settings = isHouseholdSetting ? householdSettings : userSettings;
    
    return settings[item.setting_key] !== undefined 
      ? settings[item.setting_key] 
      : item.default_value;
  };

  const updateSetting = async (settingKey: string, value: any) => {
    if (!profile?.id) return;

    setSaving(prev => ({ ...prev, [settingKey]: true }));
    setError(null);
    
    try {
      const isHouseholdSetting = activeCategory !== 'member';
      
      if (isHouseholdSetting && profile.household_id) {
        // Update household setting
        const { error } = await supabase
          .from('household_settings')
          .upsert({
            household_id: profile.household_id,
            setting_key: settingKey,
            setting_value: value,
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
            setting_value: value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,setting_key'
          });

        if (error) throw error;
        setUserSettings(prev => ({ ...prev, [settingKey]: value }));
      }

      setSuccessMessage('Setting updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      console.error('Error updating setting:', err);
      setError(`Failed to update setting: ${err.message}`);
    } finally {
      setSaving(prev => ({ ...prev, [settingKey]: false }));
    }
  };

  const renderSettingInput = (item: SettingsItem) => {
    const value = getSettingValue(item);
    const isLoading = saving[item.setting_key];

    switch (item.setting_type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateSetting(item.setting_key, !value)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                value ? 'bg-purple-600' : 'bg-gray-300'
              } ${isLoading ? 'opacity-50' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
        );

      case 'string':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => updateSetting(item.setting_key, e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:bg-gray-50"
              placeholder={item.description || 'Enter value...'}
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <textarea
              value={value || ''}
              onChange={(e) => updateSetting(item.setting_key, e.target.value)}
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:bg-gray-50"
              placeholder={item.description || 'Enter text...'}
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
        );

      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={value || ''}
              onChange={(e) => updateSetting(item.setting_key, parseInt(e.target.value) || 0)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:bg-gray-50"
              placeholder="0"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
        );

      case 'select':
        return (
          <div className="flex items-center space-x-2">
            <select
              value={value || ''}
              onChange={(e) => updateSetting(item.setting_key, e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:bg-gray-50"
            >
              {item.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {item.options?.map((option: any) => (
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
                  disabled={isLoading}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />}
          </div>
        );

      default:
        return <span className="text-gray-500 italic">Unsupported setting type: {item.setting_type}</span>;
    }
  };

  const getTabIcon = (iconName: string) => {
    const Icon = IconMap[iconName as keyof typeof IconMap] || Settings;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryDescription = (categoryKey: string) => {
    const category = categories.find(c => c.category_key === categoryKey);
    return category?.description || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 p-4 md:p-8 text-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-purple-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your preferences and configure your Dayboard experience
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="ml-3 text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {categories.map((category) => (
              <button
                key={category.category_key}
                onClick={() => setActiveCategory(category.category_key)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus-visible:ring transition-all ${
                  activeCategory === category.category_key
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {getTabIcon(category.icon)}
                <span>{category.display_name}</span>
              </button>
            ))}
          </nav>
          <p className="text-sm text-gray-500 mt-2">
            {getCategoryDescription(activeCategory)}
          </p>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-8">
              {settingsItems.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No settings available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No settings are configured for this category.
                  </p>
                </div>
              ) : (
                settingsItems.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-6">
                        <h3 className="text-base font-medium text-gray-900">{item.display_name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <span>Key: {item.setting_key}</span>
                          <span className="mx-2">•</span>
                          <span>Type: {item.setting_type}</span>
                        </div>
                      </div>
                      <div className="min-w-0 w-72">
                        {renderSettingInput(item)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Settings are automatically saved when changed</p>
        </div>
      </div>
    </div>
  );
}
