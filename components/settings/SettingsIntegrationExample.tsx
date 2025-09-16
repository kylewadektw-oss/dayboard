/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Settings Integration Example
 */

'use client';

import React from 'react';
import {
  useSettings,
  useDarkMode,
  useNotificationSettings
} from '@/contexts/SettingsContext';

export function SettingsIntegrationExample() {
  const { loading } = useSettings();
  const { isDarkMode, setDarkMode } = useDarkMode();
  const { emailNotifications, setEmailNotifications } =
    useNotificationSettings();

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        Settings Integration Example
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Dark Mode</label>
          <button
            onClick={() => setDarkMode(!isDarkMode)}
            className={`px-3 py-1 rounded text-sm ${
              isDarkMode
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {isDarkMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Email Notifications</label>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`px-3 py-1 rounded text-sm ${
              emailNotifications
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {emailNotifications ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            These settings are automatically synced with your Supabase profile
            and persist across sessions. The settings context makes it easy to
            use settings throughout your application.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsIntegrationExample;
