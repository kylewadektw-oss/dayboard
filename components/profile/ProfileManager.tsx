/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/*
 * 📋 PROFILE MANAGER TYPES - Type Definitions
 * 
 * PURPOSE: TypeScript type definitions for profile manager data structures
 * 
 * TYPES:
 * - [List main type definitions]
 * - [Interface declarations]
 * - [Enum definitions]
 * - [Utility types and generics]
 * 
 * USAGE:
 * ```typescript
 * import type { TypeName } from '@/types/ProfileManager';
 * 
 * const example: TypeName = {
 *   // properties
 * };
 * ```
 * 
 * FEATURES:
 * - [Type safety guarantees]
 * - [Validation patterns]
 * - [Extensibility and composition]
 * - [Integration with other types]
 * 
 * TECHNICAL:
 * - [Type system design]
 * - [Runtime validation]
 * - [Performance implications]
 * - [Compatibility considerations]
 */


/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { useState } from 'react';
import { User, Users, Settings, Bell, Shield, CreditCard, 
         Home, Calendar, Heart, Star, Award, Target, 
         Edit, Save, X, Plus, Trash2, Camera, Crown, 
         Baby, GraduationCap, Briefcase, MapPin, Phone } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child' | 'other';
  avatar?: string;
  age?: number;
  birthday?: string;
  grade?: string;
  school?: string;
  job?: string;
  phone?: string;
  email?: string;
  preferences: {
    favoriteColor: string;
    favoriteFood: string;
    hobbies: string[];
  };
  responsibilities: string[];
  achievements: string[];
}

interface HouseholdSettings {
  houseName: string;
  address: string;
  timezone: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    reports: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareCalendar: boolean;
    allowGuestAccess: boolean;
  };
}

const mockFamily: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Sarah Johnson',
    role: 'parent',
    age: 35,
    birthday: '1988-03-15',
    job: 'Marketing Director',
    phone: '+1-555-0123',
    email: 'sarah@example.com',
    preferences: {
      favoriteColor: 'Purple',
      favoriteFood: 'Italian',
      hobbies: ['Yoga', 'Reading', 'Cooking']
    },
    responsibilities: ['Meal Planning', 'School Events', 'Budget Management'],
    achievements: ['Completed Marathon', 'Promoted to Director', 'Published Article']
  },
  {
    id: 'm2',
    name: 'Mike Johnson',
    role: 'parent',
    age: 37,
    birthday: '1986-07-22',
    job: 'Software Engineer',
    phone: '+1-555-0124',
    email: 'mike@example.com',
    preferences: {
      favoriteColor: 'Blue',
      favoriteFood: 'Mexican',
      hobbies: ['Basketball', 'Gaming', 'DIY Projects']
    },
    responsibilities: ['Home Maintenance', 'Tech Support', 'Transportation'],
    achievements: ['Tech Lead Promotion', 'Completed Basement Renovation', 'Won Local Tournament']
  },
  {
    id: 'm3',
    name: 'Emma Johnson',
    role: 'child',
    age: 12,
    birthday: '2011-11-08',
    grade: '7th Grade',
    school: 'Lincoln Middle School',
    preferences: {
      favoriteColor: 'Pink',
      favoriteFood: 'Pizza',
      hobbies: ['Art', 'Soccer', 'Music']
    },
    responsibilities: ['Room Organization', 'Pet Care', 'Homework'],
    achievements: ['Honor Roll', 'Soccer Team Captain', 'Art Contest Winner']
  },
  {
    id: 'm4',
    name: 'Lucas Johnson',
    role: 'child',
    age: 8,
    birthday: '2015-05-30',
    grade: '3rd Grade',
    school: 'Maple Elementary',
    preferences: {
      favoriteColor: 'Green',
      favoriteFood: 'Mac & Cheese',
      hobbies: ['Lego', 'Swimming', 'Dinosaurs']
    },
    responsibilities: ['Toys Organization', 'Table Setting', 'Feed Fish'],
    achievements: ['Swimming Badge', 'Reading Challenge', 'Science Fair Participant']
  }
];

const mockHousehold: HouseholdSettings = {
  houseName: 'The Johnson Family',
  address: '123 Maple Street, Springfield, IL 62701',
  timezone: 'America/Chicago',
  currency: 'USD',
  language: 'English',
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    reminders: true,
    reports: false
  },
  privacy: {
    shareLocation: true,
    shareCalendar: true,
    allowGuestAccess: false
  }
};

export function ProfileManager() {
  const [family, setFamily] = useState<FamilyMember[]>(mockFamily);
  const [household, setHousehold] = useState<HouseholdSettings>(mockHousehold);
  const [activeTab, setActiveTab] = useState<'family' | 'household' | 'account'>('family');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editingHousehold, setEditingHousehold] = useState(false);

  const updateMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamily(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));
  };

  const addResponsibility = (memberId: string, responsibility: string) => {
    if (!responsibility.trim()) return;
    updateMember(memberId, {
      responsibilities: [...(family.find(m => m.id === memberId)?.responsibilities || []), responsibility]
    });
  };

  const removeResponsibility = (memberId: string, index: number) => {
    const member = family.find(m => m.id === memberId);
    if (member) {
      const newResponsibilities = member.responsibilities.filter((_, i) => i !== index);
      updateMember(memberId, { responsibilities: newResponsibilities });
    }
  };

  const addHobby = (memberId: string, hobby: string) => {
    if (!hobby.trim()) return;
    const member = family.find(m => m.id === memberId);
    if (member) {
      updateMember(memberId, {
        preferences: {
          ...member.preferences,
          hobbies: [...member.preferences.hobbies, hobby]
        }
      });
    }
  };

  const getRoleIcon = (role: FamilyMember['role']) => {
    switch (role) {
      case 'parent': return <Crown className="h-4 w-4" />;
      case 'child': return <Baby className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: FamilyMember['role']) => {
    switch (role) {
      case 'parent': return 'from-purple-400 to-purple-500';
      case 'child': return 'from-blue-400 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Profile</h1>
        <p className="text-gray-600">Manage household members, settings, and preferences</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        {[
          { key: 'family', label: 'Family Members', icon: Users },
          { key: 'household', label: 'Household Settings', icon: Home },
          { key: 'account', label: 'Account & Billing', icon: CreditCard }
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

      {/* Family Members Tab */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          {/* Household Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{household.houseName}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Springfield, IL</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{family.filter(m => m.role === 'parent').length}</div>
                <div className="text-sm text-gray-600">Parents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{family.filter(m => m.role === 'child').length}</div>
                <div className="text-sm text-gray-600">Children</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Years Together</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">4.9</div>
                <div className="text-sm text-gray-600">Family Rating ⭐</div>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div className="grid gap-6">
            {family.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Member Header */}
                <div className={`bg-gradient-to-r ${getRoleColor(member.role)} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{member.name}</h3>
                        <div className="flex items-center gap-2 text-white/90">
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                          {member.age && <span>• {member.age} years old</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {editingMember === member.id ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Member Details */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        {member.birthday && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Birthday: {new Date(member.birthday).toLocaleDateString()}</span>
                          </div>
                        )}
                        {member.school && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span>{member.grade} at {member.school}</span>
                          </div>
                        )}
                        {member.job && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span>{member.job}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preferences */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Preferences</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Favorite Color: </span>
                          <span className="font-medium">{member.preferences.favoriteColor}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Favorite Food: </span>
                          <span className="font-medium">{member.preferences.favoriteFood}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hobbies: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.preferences.hobbies.map((hobby, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                                {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Responsibilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.responsibilities.map((resp, index) => (
                        <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          <span>{resp}</span>
                          {editingMember === member.id && (
                            <button
                              onClick={() => removeResponsibility(member.id, index)}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      {editingMember === member.id && (
                        <button
                          onClick={() => {
                            const resp = prompt('Enter new responsibility:');
                            if (resp) addResponsibility(member.id, resp);
                          }}
                          className="px-3 py-1 border-2 border-dashed border-blue-300 text-blue-600 rounded-full text-sm hover:border-blue-400"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Achievements</h4>
                    <div className="space-y-2">
                      {member.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Member */}
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200 border-dashed">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Add Family Member</h3>
            <p className="text-gray-600 mb-4">Invite someone new to join your family dashboard</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* Household Settings Tab */}
      {activeTab === 'household' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Household Settings</h2>
              <button
                onClick={() => setEditingHousehold(!editingHousehold)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  editingHousehold 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {editingHousehold ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Edit Settings
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">General</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Name</label>
                  <input
                    type="text"
                    value={household.houseName}
                    disabled={!editingHousehold}
                    onChange={(e) => setHousehold(prev => ({ ...prev, houseName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={household.address}
                    disabled={!editingHousehold}
                    onChange={(e) => setHousehold(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={household.timezone}
                    disabled={!editingHousehold}
                    onChange={(e) => setHousehold(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  >
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Denver">Mountain Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={household.currency}
                    disabled={!editingHousehold}
                    onChange={(e) => setHousehold(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="CAD">Canadian Dollar (CAD)</option>
                  </select>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                
                <div className="space-y-3">
                  {Object.entries(household.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <button
                        disabled={!editingHousehold}
                        onClick={() => setHousehold(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [key]: !value }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-purple-600' : 'bg-gray-300'
                        } ${!editingHousehold ? 'opacity-50' : ''}`}
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

                <h3 className="text-lg font-medium text-gray-900 mt-6">Privacy</h3>
                
                <div className="space-y-3">
                  {Object.entries(household.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <button
                        disabled={!editingHousehold}
                        onClick={() => setHousehold(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, [key]: !value }
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-purple-600' : 'bg-gray-300'
                        } ${!editingHousehold ? 'opacity-50' : ''}`}
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
          </div>
        </div>
      )}

      {/* Account & Billing Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Account Status</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Crown className="h-4 w-4" />
                Free Plan
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-600">Family Members</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">∞</div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">30</div>
                <div className="text-sm text-gray-600">Days Used</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Upgrade to Premium</h3>
                  <p className="text-white/90 text-sm">
                    Unlock advanced features, unlimited storage, and priority support
                  </p>
                </div>
                <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security & Privacy</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Enable 2FA
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Data Export</h3>
                  <p className="text-sm text-gray-600">Download a copy of your family's data</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Export Data
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Account Deletion</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Information</h2>
            
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Billing Information</h3>
              <p className="text-gray-600 mb-4">You're currently on the free plan</p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="h-4 w-4" />
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
