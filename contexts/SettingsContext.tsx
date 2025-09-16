/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Settings Context Provider
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsService } from '@/utils/settings';
import type { Json } from '@/src/lib/types_db';

interface SettingsContextType {
  settingsService: SettingsService | null;
  userSettings: Record<string, unknown>;
  householdSettings: Record<string, unknown>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  getSetting: (key: string, defaultValue?: unknown) => unknown;
  setSetting: (key: string, value: Json, isHousehold?: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [settingsService, setSettingsService] = useState<SettingsService | null>(null);
  const [userSettings, setUserSettings] = useState<Record<string, unknown>>({});
  const [householdSettings, setHouseholdSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  // Initialize settings service when auth context changes
  useEffect(() => {
    if (profile?.id) {
      const service = new SettingsService(profile.id, profile.household_id || undefined);
      setSettingsService(service);
    } else {
      setSettingsService(null);
      setUserSettings({});
      setHouseholdSettings({});
      setLoading(false);
    }
  }, [profile?.id, profile?.household_id]);

  // Load settings when service is available
  useEffect(() => {
    const loadSettings = async () => {
      if (!settingsService) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [userSettingsData, householdSettingsData] = await Promise.all([
          settingsService.getAllUserSettings(),
          profile?.household_id ? settingsService.getAllHouseholdSettings() : Promise.resolve({})
        ]);

        setUserSettings(userSettingsData);
        setHouseholdSettings(householdSettingsData);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [settingsService, profile?.household_id]);

  const refreshSettings = async () => {
    if (!settingsService) return;

    try {
      setLoading(true);
      const [userSettingsData, householdSettingsData] = await Promise.all([
        settingsService.getAllUserSettings(),
        profile?.household_id ? settingsService.getAllHouseholdSettings() : Promise.resolve({})
      ]);

      setUserSettings(userSettingsData);
      setHouseholdSettings(householdSettingsData);
    } catch (error) {
      console.error('Error refreshing settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string, defaultValue: unknown = null) => {
    // Check user settings first, then household settings
    if (userSettings[key] !== undefined) {
      return userSettings[key];
    }
    if (householdSettings[key] !== undefined) {
      return householdSettings[key];
    }
    return defaultValue;
  };

  const setSetting = async (key: string, value: Json, isHousehold: boolean = false) => {
    if (!settingsService) return;

    try {
      if (isHousehold) {
        await settingsService.setHouseholdSetting(key, value);
        setHouseholdSettings(prev => ({ ...prev, [key]: value }));
      } else {
        await settingsService.setUserSetting(key, value);
        setUserSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  };

  const value: SettingsContextType = {
    settingsService,
    userSettings,
    householdSettings,
    loading,
    refreshSettings,
    getSetting,
    setSetting
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Convenience hooks for common settings
export function useDarkMode() {
  const { getSetting, setSetting } = useSettings();
  
  const isDarkMode = getSetting('dark_mode', false);
  const setDarkMode = (enabled: boolean) => setSetting('dark_mode', enabled);
  
  return { isDarkMode, setDarkMode };
}

export function useNotificationSettings() {
  const { getSetting, setSetting } = useSettings();
  
  const emailNotifications = getSetting('email_notifications', true);
  const pushNotifications = getSetting('push_notifications', true);
  const notificationFrequency = getSetting('notification_frequency', 'daily');
  
  const setEmailNotifications = (enabled: boolean) => setSetting('email_notifications', enabled);
  const setPushNotifications = (enabled: boolean) => setSetting('push_notifications', enabled);
  const setNotificationFrequency = (frequency: string) => setSetting('notification_frequency', frequency);
  
  return {
    emailNotifications,
    pushNotifications,
    notificationFrequency,
    setEmailNotifications,
    setPushNotifications,
    setNotificationFrequency
  };
}

export function useLanguageSettings() {
  const { getSetting, setSetting } = useSettings();
  
  const language = getSetting('language', 'en');
  const timezone = getSetting('timezone', 'UTC');
  const dateFormat = getSetting('date_format', 'MM/DD/YYYY');
  
  const setLanguage = (lang: string) => setSetting('language', lang);
  const setTimezone = (tz: string) => setSetting('timezone', tz);
  const setDateFormat = (format: string) => setSetting('date_format', format);
  
  return {
    language,
    timezone,
    dateFormat,
    setLanguage,
    setTimezone,
    setDateFormat
  };
}

export function useHouseholdSettings() {
  const { getSetting, setSetting } = useSettings();
  
  const householdName = getSetting('household_name', '');
  const householdDescription = getSetting('household_description', '');
  const inviteNotifications = getSetting('invite_notifications', true);
  const autoAssignChores = getSetting('auto_assign_chores', false);
  
  const setHouseholdName = (name: string) => setSetting('household_name', name, true);
  const setHouseholdDescription = (desc: string) => setSetting('household_description', desc, true);
  const setInviteNotifications = (enabled: boolean) => setSetting('invite_notifications', enabled, true);
  const setAutoAssignChores = (enabled: boolean) => setSetting('auto_assign_chores', enabled, true);
  
  return {
    householdName,
    householdDescription,
    inviteNotifications,
    autoAssignChores,
    setHouseholdName,
    setHouseholdDescription,
    setInviteNotifications,
    setAutoAssignChores
  };
}
