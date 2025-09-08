'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createClient } from '../../utils/supabase/client';
import { 
  User, 
  Home, 
  Settings, 
  Shield, 
  Edit, 
  Save,
  Plus,
  X,
  Clock,
  Globe,
  Bell,
  UserCheck,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';

// Profile data interface matching actual database schema
interface ProfileData {
  user_id: string;
  name: string | null;
  preferred_name: string | null;
  age: number | null;
  date_of_birth: string | null;
  profession: string | null;
  role: string | null;
  bio: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  google_avatar_url: string | null;
  pronouns: string | null;
  is_active: boolean;
  household_status: string | null;
  household_role: string | null;
  family_role: string | null;
  onboarding_completed: boolean;
  profile_completion_percentage: number | null;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  timezone: string | null;
  language: string | null;
  dietary_preferences: string[] | null;
  dietary_restrictions: string[] | null;
  allergies: string[] | null;
  notification_preferences: Record<string, boolean> | null;
  privacy_settings: Record<string, boolean> | null;
}

// Default profile data
const createDefaultProfile = (userId: string): ProfileData => ({
  user_id: userId,
  name: null,
  preferred_name: null,
  age: null,
  date_of_birth: null,
  profession: null,
  role: 'member',
  bio: null,
  phone_number: null,
  avatar_url: null,
  google_avatar_url: null,
  pronouns: null,
  is_active: true,
  household_status: 'none',
  household_role: 'member',
  family_role: null,
  onboarding_completed: false,
  profile_completion_percentage: 0,
  last_seen_at: null,
  created_at: null,
  updated_at: null,
  timezone: 'America/New_York',
  language: 'en',
  dietary_preferences: [],
  dietary_restrictions: [],
  allergies: [],
  notification_preferences: {
    email_updates: true,
    push_notifications: true,
    family_activity: true,
    meal_reminders: true,
    task_reminders: true,
    weekly_summary: true
  },
  privacy_settings: {
    profile_visible: true,
    activity_visible: true,
    family_visible: true,
    contact_visible: false
  }
});

export default function ProfileManager() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'household' | 'preferences' | 'account'>('personal');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const supabase = createClient();

  // Initialize profile data
  useEffect(() => {
    if (user && profile) {
      const data: ProfileData = {
        user_id: user.id,
        name: profile.full_name || null,
        preferred_name: profile.display_name || null,
        age: null, // Not available in auth profile
        date_of_birth: profile.date_of_birth || null,
        profession: null, // Not available in auth profile
        role: 'member',
        bio: profile.bio || null,
        phone_number: profile.phone_number || null,
        avatar_url: profile.avatar_url || null,
        google_avatar_url: null, // Not available in auth profile
        pronouns: null,
        is_active: true,
        household_status: 'none',
        household_role: 'member',
        family_role: null,
        onboarding_completed: false,
        profile_completion_percentage: 25,
        last_seen_at: null,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        timezone: 'America/New_York',
        language: 'en',
        dietary_preferences: [],
        dietary_restrictions: [],
        allergies: [],
        notification_preferences: {
          email_updates: true,
          push_notifications: true,
          family_activity: true,
          meal_reminders: true,
          task_reminders: true,
          weekly_summary: true
        },
        privacy_settings: {
          profile_visible: true,
          activity_visible: true,
          family_visible: true,
          contact_visible: false
        }
      };
      setProfileData(data);
    } else if (user) {
      setProfileData(createDefaultProfile(user.id));
    }
  }, [user, profile]);

  const updateField = (field: keyof ProfileData, value: any) => {
    if (!profileData) return;
    setProfileData({ ...profileData, [field]: value });
  };

  const addToArray = (field: keyof ProfileData, value: string) => {
    if (!profileData) return;
    const currentArray = profileData[field] as string[] || [];
    updateField(field, [...currentArray, value]);
  };

  const removeFromArray = (field: keyof ProfileData, index: number) => {
    if (!profileData) return;
    const currentArray = profileData[field] as string[] || [];
    updateField(field, currentArray.filter((_, i) => i !== index));
  };

  const updateProfile = async () => {
    if (!profileData || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: profileData.user_id,
          name: profileData.name,
          preferred_name: profileData.preferred_name,
          age: profileData.age,
          date_of_birth: profileData.date_of_birth,
          profession: profileData.profession,
          bio: profileData.bio,
          phone_number: profileData.phone_number,
          avatar_url: profileData.avatar_url,
          pronouns: profileData.pronouns,
          timezone: profileData.timezone,
          language: profileData.language,
          dietary_preferences: profileData.dietary_preferences,
          dietary_restrictions: profileData.dietary_restrictions,
          allergies: profileData.allergies,
          notification_preferences: profileData.notification_preferences,
          privacy_settings: profileData.privacy_settings,
          updated_at: new Date().toISOString()
        } as any);

      if (error) throw error;
      
      setEditing(false);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        {[
          { key: 'personal', label: 'Personal Info', icon: User },
          { key: 'household', label: 'Household', icon: Home },
          { key: 'preferences', label: 'Preferences', icon: Settings },
          { key: 'account', label: 'Account', icon: Shield }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === key
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              {profileData.avatar_url || profileData.google_avatar_url ? (
                <img 
                  src={profileData.avatar_url || profileData.google_avatar_url || ''} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profileData.name || profileData.preferred_name || 'No name set'}
              </h2>
              <p className="text-gray-600">
                {profileData.profession || 'No profession set'} • {profileData.role || 'Member'}
              </p>
              {profileData.age && (
                <p className="text-sm text-gray-500">{profileData.age} years old</p>
              )}
            </div>
          </div>
          <button
            onClick={() => editing ? updateProfile() : setEditing(true)}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              editing 
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Saving...
              </>
            ) : editing ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Profile Completion */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm text-gray-600">{profileData.profile_completion_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profileData.profile_completion_percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name</label>
                <input
                  type="text"
                  value={profileData.preferred_name || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('preferred_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="What should we call you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={profileData.age || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('age', parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="Your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={profileData.date_of_birth || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                <input
                  type="text"
                  value={profileData.profession || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('profession', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="Your job or profession"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pronouns</label>
                <input
                  type="text"
                  value={profileData.pronouns || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('pronouns', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="e.g., he/him, she/her, they/them"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={profileData.bio || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone_number || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('phone_number', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled={true}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                  placeholder="Email from authentication"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
              </div>
            </div>
          </div>

          {/* Health & Dietary Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Health & Dietary Information</h3>
            
            <div className="space-y-6">
              {/* Dietary Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(profileData.dietary_preferences || []).map((pref, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <span>{pref}</span>
                      {editing && (
                        <button
                          onClick={() => removeFromArray('dietary_preferences', index)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {editing && (
                    <button
                      onClick={() => {
                        const pref = prompt('Add dietary preference:');
                        if (pref) addToArray('dietary_preferences', pref);
                      }}
                      className="px-3 py-1 border-2 border-dashed border-blue-300 text-blue-600 rounded-full text-sm hover:border-blue-400"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(profileData.dietary_restrictions || []).map((restriction, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      <span>{restriction}</span>
                      {editing && (
                        <button
                          onClick={() => removeFromArray('dietary_restrictions', index)}
                          className="hover:bg-red-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {editing && (
                    <button
                      onClick={() => {
                        const restriction = prompt('Add dietary restriction:');
                        if (restriction) addToArray('dietary_restrictions', restriction);
                      }}
                      className="px-3 py-1 border-2 border-dashed border-red-300 text-red-600 rounded-full text-sm hover:border-red-400"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Allergies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(profileData.allergies || []).map((allergy, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{allergy}</span>
                      {editing && (
                        <button
                          onClick={() => removeFromArray('allergies', index)}
                          className="hover:bg-orange-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {editing && (
                    <button
                      onClick={() => {
                        const allergy = prompt('Add allergy:');
                        if (allergy) addToArray('allergies', allergy);
                      }}
                      className="px-3 py-1 border-2 border-dashed border-orange-300 text-orange-600 rounded-full text-sm hover:border-orange-400"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Household Tab */}
      {activeTab === 'household' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Household Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Household Status</label>
                <select
                  value={profileData.household_status || 'none'}
                  disabled={!editing}
                  onChange={(e) => updateField('household_status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                >
                  <option value="none">No Household</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Household Role</label>
                <select
                  value={profileData.household_role || 'member'}
                  disabled={!editing}
                  onChange={(e) => updateField('household_role', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Role</label>
                <input
                  type="text"
                  value={profileData.family_role || ''}
                  disabled={!editing}
                  onChange={(e) => updateField('family_role', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  placeholder="e.g., parent, child, guardian"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center gap-2">
                  <UserCheck className={`h-5 w-5 ${profileData.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${profileData.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                    {profileData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Regional Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Timezone
                </label>
                <select
                  value={profileData.timezone || 'America/New_York'}
                  disabled={!editing}
                  onChange={(e) => updateField('timezone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Language
                </label>
                <select
                  value={profileData.language || 'en'}
                  disabled={!editing}
                  onChange={(e) => updateField('language', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              <Bell className="h-5 w-5 inline mr-2" />
              Notification Preferences
            </h3>
            
            <div className="space-y-4">
              {Object.entries(profileData.notification_preferences || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <button
                    disabled={!editing}
                    onClick={() => updateField('notification_preferences', {
                      ...profileData.notification_preferences,
                      [key]: !value
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-purple-600' : 'bg-gray-300'
                    } ${!editing ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              <Shield className="h-5 w-5 inline mr-2" />
              Privacy Settings
            </h3>
            
            <div className="space-y-4">
              {Object.entries(profileData.privacy_settings || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <button
                    disabled={!editing}
                    onClick={() => updateField('privacy_settings', {
                      ...profileData.privacy_settings,
                      [key]: !value
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-purple-600' : 'bg-gray-300'
                    } ${!editing ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={profileData.user_id}
                  disabled={true}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={profileData.role || 'member'}
                  disabled={true}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 capitalize"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Status</label>
                <div className="flex items-center gap-2">
                  <UserCheck className={`h-5 w-5 ${profileData.onboarding_completed ? 'text-green-500' : 'text-orange-500'}`} />
                  <span className={`text-sm ${profileData.onboarding_completed ? 'text-green-700' : 'text-orange-700'}`}>
                    {profileData.onboarding_completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Seen</label>
                <input
                  type="text"
                  value={profileData.last_seen_at ? new Date(profileData.last_seen_at).toLocaleString() : 'Never'}
                  disabled={true}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <input
                  type="text"
                  value={profileData.created_at ? new Date(profileData.created_at).toLocaleString() : 'Unknown'}
                  disabled={true}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <input
                  type="text"
                  value={profileData.updated_at ? new Date(profileData.updated_at).toLocaleString() : 'Unknown'}
                  disabled={true}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Download Data</h4>
                  <p className="text-sm text-gray-600">Export your profile data</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Reset Profile</h4>
                  <p className="text-sm text-gray-600">Clear all profile data</p>
                </div>
                <button className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors">
                  Reset
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-600">Permanently delete your account</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
