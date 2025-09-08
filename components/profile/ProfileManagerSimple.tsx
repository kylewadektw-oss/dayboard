'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createClient } from '../../utils/supabase/client';
import { 
  User, 
  Edit, 
  Save,
  Phone,
  Mail,
  Globe,
  Clock,
  Shield,
  Bell
} from 'lucide-react';

export default function ProfileManager() {
  const { user, profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    bio: '',
    phone_number: '',
    pronouns: '',
    timezone: 'America/New_York',
    language: 'en'
  });

  const supabase = createClient();

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        phone_number: profile.phone_number || '',
        pronouns: profile.pronouns || '',
        timezone: profile.timezone || 'America/New_York',
        language: profile.language || 'en'
      });
    }
  }, [profile]);

  const updateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          display_name: formData.display_name,
          bio: formData.bio,
          phone_number: formData.phone_number,
          pronouns: formData.pronouns,
          timezone: formData.timezone,
          language: formData.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setEditing(false);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
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

      {/* Profile Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.full_name || formData.display_name || 'No name set'}
              </h2>
              <p className="text-gray-600">
                {user.email}
              </p>
              {profile?.onboarding_completed && (
                <p className="text-sm text-green-600">Profile Complete</p>
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
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              disabled={!editing}
              onChange={(e) => updateField('full_name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              disabled={!editing}
              onChange={(e) => updateField('display_name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              placeholder="What should we call you?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pronouns</label>
            <input
              type="text"
              value={formData.pronouns}
              disabled={!editing}
              onChange={(e) => updateField('pronouns', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              placeholder="e.g., he/him, she/her, they/them"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              disabled={!editing}
              onChange={(e) => updateField('phone_number', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              disabled={!editing}
              onChange={(e) => updateField('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-4 w-4 inline mr-2" />
              Timezone
            </label>
            <select
              value={formData.timezone}
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
              value={formData.language}
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

      {/* Account Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled={true}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={user.id}
              disabled={true}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Created</label>
            <input
              type="text"
              value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              disabled={true}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
            <input
              type="text"
              value={profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
              disabled={true}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
