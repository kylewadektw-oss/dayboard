/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Feature Access Control Matrix
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown, 
  User, 
  Home,
  Zap,
  Globe,
  Settings as SettingsIcon,
  Check,
  X,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

interface FeaturePermission {
  feature_key: string;
  display_name: string;
  description: string;
  category: string;
  access_level: string;
  requires_subscription: boolean;
  member_access: boolean;
  admin_access: boolean;
  super_admin_access: boolean;
}

interface FeatureAccessMatrixProps {
  className?: string;
  mode?: 'admin' | 'super_admin';
}

const CategoryIcons = {
  'core': Home,
  'premium': Zap,
  'admin': Shield,
  'super_admin': Crown,
  'navigation': SettingsIcon,
  'development': Globe
};

const CategoryColors = {
  'core': 'text-green-600 bg-green-50 border-green-200',
  'premium': 'text-purple-600 bg-purple-50 border-purple-200',
  'admin': 'text-blue-600 bg-blue-50 border-blue-200',
  'super_admin': 'text-red-600 bg-red-50 border-red-200',
  'navigation': 'text-gray-600 bg-gray-50 border-gray-200',
  'development': 'text-orange-600 bg-orange-50 border-orange-200'
};

export default function FeatureAccessMatrix({ className = '', mode = 'admin' }: FeatureAccessMatrixProps) {
  const { user, profile } = useAuth();
  const [features, setFeatures] = useState<FeaturePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const loadFeatures = async () => {
      if (!profile?.id) return;

      try {
        setLoading(true);
        
        // Get features based on mode
        const { data: featureData, error: featureError } = await supabase
          .from('global_feature_control')
          .select('*')
          .in('category', mode === 'super_admin' 
            ? ['core', 'premium', 'admin', 'super_admin'] 
            : ['core', 'premium', 'admin']
          )
          .order('category, display_name');

        if (featureError) throw featureError;

        // Get current permission settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('setting_key, setting_value')
          .eq('user_id', mode === 'super_admin' ? profile.id : profile.id) // TODO: Get super admin ID for admin mode
          .like('setting_key', '%_access');

        if (settingsError) console.warn('Settings error:', settingsError);

        // Build feature permission matrix
        const settingsMap = (settingsData || []).reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value === 'true' || setting.setting_value === true;
          return acc;
        }, {} as Record<string, boolean>);

        const featurePermissions: FeaturePermission[] = (featureData || []).map(feature => {
          const memberKey = `${feature.feature_key.replace('_access', '')}_member_access`;
          const adminKey = `${feature.feature_key.replace('_access', '')}_admin_access`;
          
          return {
            feature_key: feature.feature_key,
            display_name: feature.display_name,
            description: feature.description || '',
            category: feature.category,
            access_level: feature.access_level,
            requires_subscription: feature.requires_subscription,
            member_access: settingsMap[memberKey] ?? getDefaultAccess('member', feature.access_level),
            admin_access: settingsMap[adminKey] ?? getDefaultAccess('admin', feature.access_level),
            super_admin_access: true // Super admin always has access
          };
        });

        setFeatures(featurePermissions);
      } catch (err: any) {
        console.error('Error loading features:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();
  }, [profile?.id, mode, supabase]);

  const getDefaultAccess = (role: string, accessLevel: string): boolean => {
    switch (role) {
      case 'member':
        return ['all', 'member_plus'].includes(accessLevel);
      case 'admin':
        return ['all', 'member_plus', 'admin_only'].includes(accessLevel);
      case 'super_admin':
        return true;
      default:
        return false;
    }
  };

  const handlePermissionChange = async (featureKey: string, role: 'member' | 'admin', enabled: boolean) => {
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
      setFeatures(prev => prev.map(feature => 
        feature.feature_key === featureKey 
          ? { ...feature, [`${role}_access`]: enabled }
          : feature
      ));

      console.log(`✅ Updated ${role} access for ${featureKey}: ${enabled}`);
    } catch (err: any) {
      console.error('Error updating permission:', err);
      setError(`Failed to update permission: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeaturePermission[]>);

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
            <h3 className="text-sm font-medium text-red-800">Error Loading Feature Access</h3>
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
        <Shield className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'super_admin' ? 'Global Feature Access Matrix' : 'Household Feature Access Matrix'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Control which features are accessible to different user roles. Check/uncheck boxes to grant or deny access.
          </p>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="space-y-8">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
          const CategoryIcon = CategoryIcons[category as keyof typeof CategoryIcons] || Shield;
          const categoryClass = CategoryColors[category as keyof typeof CategoryColors] || CategoryColors.admin;
          
          return (
            <div key={category}>
              {/* Category Header */}
              <div className={`flex items-center mb-4 p-3 rounded-lg border ${categoryClass}`}>
                <CategoryIcon className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-medium capitalize">
                  {category.replace('_', ' ')} Features
                </h3>
              </div>

              {/* Feature Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                        Feature
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                        Description
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                          <User className="h-4 w-4 mr-1 text-green-600" />
                          Member
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                          <Shield className="h-4 w-4 mr-1 text-blue-600" />
                          Admin
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                          <Crown className="h-4 w-4 mr-1 text-purple-600" />
                          Super Admin
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryFeatures.map((feature, index) => (
                      <tr key={feature.feature_key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {/* Feature Name */}
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center">
                            <div className="font-medium text-gray-900">
                              {feature.display_name}
                            </div>
                            {feature.requires_subscription && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                Premium
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3 border-b border-gray-200">
                          <span className="text-sm text-gray-600">{feature.description}</span>
                        </td>

                        {/* Member Access Checkbox */}
                        <td className="px-4 py-3 text-center border-b border-gray-200">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={feature.member_access}
                              onChange={(e) => handlePermissionChange(feature.feature_key, 'member', e.target.checked)}
                              disabled={saving || feature.access_level === 'admin_only' || feature.access_level === 'super_admin_only'}
                              className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="sr-only">Member access for {feature.display_name}</span>
                          </label>
                          {(feature.access_level === 'admin_only' || feature.access_level === 'super_admin_only') && (
                            <div className="flex justify-center mt-1" title="Not available for members">
                              <Info className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </td>

                        {/* Admin Access Checkbox */}
                        <td className="px-4 py-3 text-center border-b border-gray-200">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={feature.admin_access}
                              onChange={(e) => handlePermissionChange(feature.feature_key, 'admin', e.target.checked)}
                              disabled={saving || feature.access_level === 'super_admin_only'}
                              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="sr-only">Admin access for {feature.display_name}</span>
                          </label>
                          {feature.access_level === 'super_admin_only' && (
                            <div className="flex justify-center mt-1" title="Super admin only">
                              <Info className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </td>

                        {/* Super Admin Access (Always Enabled) */}
                        <td className="px-4 py-3 text-center border-b border-gray-200">
                          <div className="flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="sr-only">Super admin always has access</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Permission Rules:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Super Admin always has access to all features (cannot be unchecked)</li>
              <li>• Admin-only features cannot be enabled for Members</li>
              <li>• Super Admin-only features are exclusive to Super Admins</li>
              <li>• Changes take effect immediately for new feature requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
