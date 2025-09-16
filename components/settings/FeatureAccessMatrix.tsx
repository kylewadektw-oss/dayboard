/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Feature Access Control Matrix Component
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Crown, 
  User,
  Save,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  featureAccessManager,
  FEATURE_DEFINITIONS, 
  type UserRole,
  type FeatureAccess,
  type FeatureName
} from '@/utils/feature-access';

interface FeatureAccessMatrixProps {
  mode?: 'super_admin' | 'admin';
  className?: string;
}

interface AccessState {
  [featureName: string]: {
    member: boolean;
    admin: boolean;
    super_admin: boolean;
  };
}

const FeatureAccessMatrix: React.FC<FeatureAccessMatrixProps> = ({ 
  className = ''
}) => {
  const { profile } = useAuth();
  const [accessState, setAccessState] = useState<AccessState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize access state from feature definitions
  useEffect(() => {
    const initialState: AccessState = {};
    
    Object.entries(FEATURE_DEFINITIONS).forEach(([featureName]) => {
      initialState[featureName] = {
        member: false,
        admin: false,
        super_admin: false
      };
    });

    setAccessState(initialState);
  }, []);

  // Load current access rules from database
  useEffect(() => {
    async function loadAccessRules() {
      if (!profile?.household_id) return;

      try {
        setLoading(true);
        setError(null);

        const accessRules = await featureAccessManager.getHouseholdFeatureAccess(profile.household_id);
        
        // Update state with database values
        const newState: AccessState = { ...accessState };
        accessRules.forEach((rule: FeatureAccess) => {
          if (newState[rule.feature_name]) {
            (newState[rule.feature_name] as Record<string, boolean>)[rule.role] = rule.available;
          }
        });

        setAccessState(newState);
      } catch (err) {
        setError('Failed to load feature access rules');
        console.error('Error loading access rules:', err);
      } finally {
        setLoading(false);
      }
    }

    if (Object.keys(accessState).length > 0) {
      loadAccessRules();
    }
  }, [profile?.household_id, accessState]);

  // Handle permission toggle
  const handleToggle = (featureName: string, role: UserRole) => {
    setAccessState(prev => ({
      ...prev,
      [featureName]: {
        ...prev[featureName],
        [role]: !prev[featureName][role]
      }
    }));
    setHasChanges(true);
    setSuccessMessage(null);
    setError(null);
  };

  // Save changes to database
  const handleSave = async () => {
    if (!profile?.household_id) {
      setError('No household found');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updates: Array<{
        featureName: FeatureName;
        role: UserRole;
        available: boolean;
      }> = [];

      // Prepare all updates
      Object.entries(accessState).forEach(([featureName, roleAccess]) => {
        const roles: UserRole[] = ['member', 'admin', 'super_admin'];
        roles.forEach(role => {
          updates.push({
            featureName: featureName as FeatureName,
            role,
            available: roleAccess[role]
          });
        });
      });

      // Batch update all permissions
      const success = await featureAccessManager.batchUpdateFeatureAccess(
        profile.household_id,
        updates
      );

      if (success) {
        setSuccessMessage('Feature access permissions updated successfully');
        setHasChanges(false);
      } else {
        setError('Failed to update some permissions');
      }
    } catch (err) {
      setError('Failed to save permissions');
      console.error('Error saving permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!profile?.household_id) return;

    try {
      setSaving(true);
      const success = await featureAccessManager.setupDefaultFeatureAccess(profile.household_id);
      
      if (success) {
        // Reload the data
        window.location.reload();
      } else {
        setError('Failed to reset to defaults');
      }
    } catch (err) {
      setError('Failed to reset permissions');
      console.error('Error resetting permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  // Group features by category
  const featuresByCategory = Object.entries(FEATURE_DEFINITIONS).reduce((acc, [featureName, definition]) => {
    const category = definition.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ name: featureName as FeatureName, definition });
    return acc;
  }, {} as Record<string, Array<{ name: FeatureName; definition: typeof FEATURE_DEFINITIONS[FeatureName] }>>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading feature access matrix...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Feature Access Control</h2>
              <p className="text-sm text-gray-600">
                Control which features are available to different user roles in your household
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Unsaved changes
              </div>
            )}
            
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <XCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Member</span>
            <span className="text-xs text-gray-500">Basic access</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Admin</span>
            <span className="text-xs text-gray-500">Household management</span>
          </div>
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Super Admin</span>
            <span className="text-xs text-gray-500">Full control</span>
          </div>
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="space-y-4">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 capitalize">
                {category === 'core' ? 'Core Features' : 
                 category === 'admin' ? 'Administrative Features' :
                 `${category.charAt(0).toUpperCase() + category.slice(1)} Features`}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {features.map(({ name: featureName, definition }) => (
                <div key={featureName} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{definition.label}</h4>
                        {definition.description && (
                          <div className="group relative">
                            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              {definition.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Member Toggle */}
                      <label className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <input
                          type="checkbox"
                          checked={accessState[featureName]?.member || false}
                          onChange={() => handleToggle(featureName, 'member')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </label>
                      
                      {/* Admin Toggle */}
                      <label className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <input
                          type="checkbox"
                          checked={accessState[featureName]?.admin || false}
                          onChange={() => handleToggle(featureName, 'admin')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </label>
                      
                      {/* Super Admin Toggle */}
                      <label className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-purple-600" />
                        <input
                          type="checkbox"
                          checked={accessState[featureName]?.super_admin || false}
                          onChange={() => handleToggle(featureName, 'super_admin')}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureAccessMatrix;