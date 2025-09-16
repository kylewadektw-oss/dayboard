/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Streamlined Settings Dashboard Component - Simple role-based settings
 */

'use client';

import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useFeatureAccess';
import FeatureAccessMatrix from './FeatureAccessMatrix';
import {
  Settings,
  Shield,
  User,
  Users,
  Crown,
  Home,
  Bell,
  Moon,
  Globe
} from 'lucide-react';

interface StreamlinedSettingsDashboardProps {
  className?: string;
}

const StreamlinedSettingsDashboard: React.FC<
  StreamlinedSettingsDashboardProps
> = ({ className = '' }) => {
  const { isAdmin, isSuperAdmin } = useUserRole();

  // State for feature toggles - Main Features (shared across all user types)
  const [mealPlanningEnabled, setMealPlanningEnabled] = useState(true);
  const [listSharingEnabled, setListSharingEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [personalNotificationsEnabled, setPersonalNotificationsEnabled] =
    useState(true);

  // State for new roadmap features
  const [entertainmentEnabled, setEntertainmentEnabled] = useState(true);
  const [financialEnabled, setFinancialEnabled] = useState(true);
  const [weatherEnhancedEnabled, setWeatherEnhancedEnabled] = useState(true);
  const [choresEnabled, setChoresEnabled] = useState(true);
  const [projectsEnabled, setProjectsEnabled] = useState(true); // Existing projects feature
  const [workManagementEnabled, setWorkManagementEnabled] = useState(true);

  // Settings visibility preferences (shared across all user types)
  const [hideDisabledFeatures, setHideDisabledFeatures] = useState(false);
  const [showDeveloperMode, setShowDeveloperMode] = useState(false);

  // Super Admin Settings - Feature Access Control Matrix
  if (isSuperAdmin) {
    return (
      <div className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Super Admin Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Control which features are available to different user roles in
                your household
              </p>
            </div>
          </div>
        </div>

        {/* Feature Access Matrix */}
        <FeatureAccessMatrix mode="super_admin" />

        {/* Quick Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">
                How Feature Access Works
              </h3>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>
                  • <strong>Super Admin:</strong> Always has access to all
                  features (cannot be disabled)
                </li>
                <li>
                  • <strong>Admin:</strong> Gets access only when you enable
                  their checkbox for each feature
                </li>
                <li>
                  • <strong>Member:</strong> Gets access only when you enable
                  their checkbox for each feature
                </li>
                <li>
                  • Users can choose to hide disabled features entirely or see
                  them as &quot;Coming Soon&quot;
                </li>
                <li>
                  • Developer mode shows preview of upcoming features currently
                  in development
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Settings - Limited household management
  if (isAdmin) {
    return (
      <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage household settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Household Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Home className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Household Management
            </h2>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Household Name
                </label>
                <input
                  type="text"
                  placeholder="The Smith Family"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Zone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Core Features
              </h3>

              {/* Meal Planning */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mealPlanningEnabled}
                        onChange={(e) =>
                          setMealPlanningEnabled(e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Enable Meal Planning
                      </span>
                    </label>
                  </div>
                </div>

                {mealPlanningEnabled && (
                  <div className="ml-6 space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Weekly meal planning by default
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Auto-generate grocery lists from meal plans
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Send meal planning reminders
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* List Sharing */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={listSharingEnabled}
                        onChange={(e) =>
                          setListSharingEnabled(e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Enable List Sharing
                      </span>
                    </label>
                  </div>
                </div>

                {listSharingEnabled && (
                  <div className="ml-6 space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Share new lists with all household members by default
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Allow real-time collaborative editing
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Notify members when lists are shared with them
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* New Dashboard Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Dashboard Features
              </h3>

              {/* Entertainment Module */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entertainmentEnabled}
                        onChange={(e) =>
                          setEntertainmentEnabled(e.target.checked)
                        }
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        🎬 Entertainment & Events
                      </span>
                    </label>
                  </div>
                </div>

                {entertainmentEnabled && (
                  <div className="ml-6 space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Local movie theater showtimes
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Community events and festivals
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Family decision polling for activities
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Calendar integration for events
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Financial Dashboard */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={financialEnabled}
                        onChange={(e) => setFinancialEnabled(e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        💰 Financial Dashboard
                      </span>
                    </label>
                  </div>
                </div>

                {financialEnabled && (
                  <div className="ml-6 space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Monthly budget tracking
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Bill reminders and due dates
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Kids allowance and chore payments
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Savings goals tracking
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Enhanced Weather */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={weatherEnhancedEnabled}
                        onChange={(e) =>
                          setWeatherEnhancedEnabled(e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        🌤️ Enhanced Weather
                      </span>
                    </label>
                  </div>
                </div>

                {weatherEnhancedEnabled && (
                  <div className="ml-6 space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        6-day weather forecast
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Moon phases and astronomy for kids
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Weather-based activity suggestions
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Severe weather alerts
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Chores & Kids System */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={choresEnabled}
                        onChange={(e) => setChoresEnabled(e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        🏆 Chores & Kids System
                      </span>
                    </label>
                  </div>
                </div>

                {choresEnabled && (
                  <div className="ml-6 space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Gamified chore assignments with points
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Reward catalog and redemption system
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Allowance tracking and automation
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Age-appropriate chore templates
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Additional Features
              </h3>

              {/* Projects Management */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={projectsEnabled}
                        onChange={(e) => setProjectsEnabled(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        📁 Project Management (in Lists)
                      </span>
                    </label>
                  </div>
                </div>

                {projectsEnabled && (
                  <div className="ml-6 space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Home improvement project tracking
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Project timers and time tracking
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Task assignment to family members
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Work Management */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={workManagementEnabled}
                        onChange={(e) =>
                          setWorkManagementEnabled(e.target.checked)
                        }
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        💼 Work Management
                      </span>
                    </label>
                  </div>
                </div>

                {workManagementEnabled && (
                  <div className="ml-6 space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Work schedule and calendar integration
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Time tracking for work projects
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        Work-life balance analytics
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Save Household Settings
            </button>
          </div>
        </div>

        {/* Settings Display Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Display Preferences
            </h2>
          </div>

          <div className="space-y-4">
            {/* Hide Disabled Features Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideDisabledFeatures}
                    onChange={(e) => setHideDisabledFeatures(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Hide Disabled Features
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  When enabled, disabled features will be completely hidden
                  instead of showing &quot;Coming Soon&quot;
                </p>
              </div>
            </div>

            {/* Developer Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDeveloperMode}
                    onChange={(e) => setShowDeveloperMode(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Show Development Features
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Display features that are still in development with clear
                  &quot;Coming Soon&quot; labels
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Save Display Settings
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotificationsEnabled}
                      onChange={(e) =>
                        setEmailNotificationsEnabled(e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Enable Email Notifications
                    </span>
                  </label>
                </div>
              </div>

              {emailNotificationsEnabled && (
                <div className="ml-6 space-y-2 text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      Email notifications for new household members
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      Email digest of weekly household activity
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      Emergency notifications via email
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Save Notification Settings
            </button>
          </div>
        </div>

        {/* Coming Soon Features - Enhanced with hide/show logic */}
        {(!hideDisabledFeatures || showDeveloperMode) && (
          <div
            className={`border rounded-lg p-6 ${showDeveloperMode ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Settings
                className={`h-6 w-6 ${showDeveloperMode ? 'text-blue-500' : 'text-gray-400'}`}
              />
              <div>
                <h2
                  className={`text-xl font-medium ${showDeveloperMode ? 'text-blue-900' : 'text-gray-600'}`}
                >
                  {showDeveloperMode ? 'Development Features' : 'Coming Soon'}
                </h2>
                {showDeveloperMode && (
                  <p className="text-sm text-blue-700 mt-1">
                    Features currently in development
                  </p>
                )}
              </div>
            </div>

            {showDeveloperMode ? (
              <div className="space-y-3">
                <div className="bg-white rounded-md p-3 border border-blue-200">
                  <h3 className="font-medium text-blue-900">
                    🔐 Advanced Security Dashboard
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Real-time security monitoring and threat detection for
                    household data
                  </p>
                </div>
                <div className="bg-white rounded-md p-3 border border-blue-200">
                  <h3 className="font-medium text-blue-900">
                    📊 Analytics & Insights
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Comprehensive household activity analytics and optimization
                    suggestions
                  </p>
                </div>
                <div className="bg-white rounded-md p-3 border border-blue-200">
                  <h3 className="font-medium text-blue-900">
                    🏠 Smart Home Integration
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Connect household devices and automate routines
                  </p>
                </div>
                <div className="bg-white rounded-md p-3 border border-blue-200">
                  <h3 className="font-medium text-blue-900">
                    👥 Multi-Household Management
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Manage multiple households and extended family coordination
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Advanced admin features like user role management, billing
                settings, and analytics are being developed. Check back soon for
                more administrative tools.
              </p>
            )}

            {hideDisabledFeatures && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You have &quot;Hide Disabled
                  Features&quot; enabled. Toggle this off in Display Preferences
                  to see all upcoming features.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Member Settings - Basic profile and preferences
  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your personal profile and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Profile Information
          </h2>
        </div>

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Email changes require admin approval
            </p>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Change Picture
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            Save Profile
          </button>
        </div>
      </div>

      {/* Personal Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Personal Preferences
          </h2>
        </div>

        <div className="space-y-6">
          {/* Theme and Language */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Moon className="h-4 w-4 inline mr-2" />
                Theme Preference
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4 inline mr-2" />
                Language
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personalNotificationsEnabled}
                      onChange={(e) =>
                        setPersonalNotificationsEnabled(e.target.checked)
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      <Bell className="h-4 w-4 inline mr-2" />
                      Enable Personal Notifications
                    </span>
                  </label>
                </div>
              </div>

              {personalNotificationsEnabled && (
                <div className="ml-6 space-y-2 text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      Email me when I&apos;m assigned to a task
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      Email me daily meal planning reminders
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      Show browser notifications for urgent tasks
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      Weekly summary of completed tasks
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            Save Preferences
          </button>
        </div>
      </div>

      {/* Display Preferences for Members */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Display Preferences
          </h2>
        </div>

        <div className="space-y-4">
          {/* Hide Disabled Features Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideDisabledFeatures}
                  onChange={(e) => setHideDisabledFeatures(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">
                  Hide Disabled Features
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                When enabled, features not available to you will be completely
                hidden
              </p>
            </div>
          </div>

          {/* Developer Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeveloperMode}
                  onChange={(e) => setShowDeveloperMode(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">
                  Show Development Preview
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Preview upcoming features that are currently in development
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            Save Display Settings
          </button>
        </div>
      </div>

      {/* Coming Soon Features - Enhanced with hide/show logic */}
      {(!hideDisabledFeatures || showDeveloperMode) && (
        <div
          className={`border rounded-lg p-6 ${showDeveloperMode ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <Settings
              className={`h-6 w-6 ${showDeveloperMode ? 'text-green-500' : 'text-gray-400'}`}
            />
            <div>
              <h2
                className={`text-xl font-medium ${showDeveloperMode ? 'text-green-900' : 'text-gray-600'}`}
              >
                {showDeveloperMode
                  ? 'Personal Features in Development'
                  : 'Coming Soon'}
              </h2>
              {showDeveloperMode && (
                <p className="text-sm text-green-700 mt-1">
                  Personal features being developed for you
                </p>
              )}
            </div>
          </div>

          {showDeveloperMode ? (
            <div className="space-y-3">
              <div className="bg-white rounded-md p-3 border border-green-200">
                <h3 className="font-medium text-green-900">
                  📅 Personal Calendar Integration
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Sync your personal calendar with household events and tasks
                </p>
              </div>
              <div className="bg-white rounded-md p-3 border border-green-200">
                <h3 className="font-medium text-green-900">
                  ⚡ Custom Quick Actions
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Create personalized shortcuts for your most common household
                  tasks
                </p>
              </div>
              <div className="bg-white rounded-md p-3 border border-green-200">
                <h3 className="font-medium text-green-900">
                  🎯 Personal Goals & Habits
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Track personal goals and build habits within the household
                  context
                </p>
              </div>
              <div className="bg-white rounded-md p-3 border border-green-200">
                <h3 className="font-medium text-green-900">
                  📱 Mobile App & Notifications
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Enhanced mobile experience with smart notifications
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              Additional personal features like calendar integration, custom
              shortcuts, and advanced notification settings are in development.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamlinedSettingsDashboard;
