/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Settings Management Utilities
 */

import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types_db';

type SupabaseClient = ReturnType<typeof createClient>;

export interface SettingsManager {
  getUserSetting: (settingKey: string, defaultValue?: any) => Promise<any>;
  setUserSetting: (settingKey: string, value: any) => Promise<void>;
  getHouseholdSetting: (settingKey: string, defaultValue?: any) => Promise<any>;
  setHouseholdSetting: (settingKey: string, value: any) => Promise<void>;
  getUserSettings: (settingKeys?: string[]) => Promise<Record<string, any>>;
  getHouseholdSettings: (settingKeys?: string[]) => Promise<Record<string, any>>;
  getSettingDefinition: (settingKey: string) => Promise<any>;
  getAllUserSettings: () => Promise<Record<string, any>>;
  getAllHouseholdSettings: () => Promise<Record<string, any>>;
}

class SettingsService implements SettingsManager {
  private supabase: SupabaseClient;
  private userId: string | null = null;
  private householdId: string | null = null;
  private settingsCache: Record<string, any> = {};

  constructor(userId?: string, householdId?: string) {
    this.supabase = createClient();
    this.userId = userId || null;
    this.householdId = householdId || null;
  }

  setContext(userId: string, householdId?: string) {
    this.userId = userId;
    this.householdId = householdId || null;
    this.settingsCache = {}; // Clear cache when context changes
  }

  async getUserSetting(settingKey: string, defaultValue: any = null): Promise<any> {
    if (!this.userId) {
      throw new Error('User ID not set. Call setContext() first.');
    }

    // Check cache first
    const cacheKey = `user:${this.userId}:${settingKey}`;
    if (this.settingsCache[cacheKey] !== undefined) {
      return this.settingsCache[cacheKey];
    }

    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', this.userId)
        .eq('setting_key', settingKey)
        .maybeSingle();

      if (error) throw error;

      const value = data?.setting_value ?? defaultValue;
      this.settingsCache[cacheKey] = value;
      return value;
    } catch (error) {
      console.error(`Error getting user setting ${settingKey}:`, error);
      return defaultValue;
    }
  }

  async setUserSetting(settingKey: string, value: any): Promise<void> {
    if (!this.userId) {
      throw new Error('User ID not set. Call setContext() first.');
    }

    try {
      const { error } = await this.supabase
        .from('user_settings')
        .upsert({
          user_id: this.userId,
          setting_key: settingKey,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) throw error;

      // Update cache
      const cacheKey = `user:${this.userId}:${settingKey}`;
      this.settingsCache[cacheKey] = value;
    } catch (error) {
      console.error(`Error setting user setting ${settingKey}:`, error);
      throw error;
    }
  }

  async getHouseholdSetting(settingKey: string, defaultValue: any = null): Promise<any> {
    if (!this.householdId) {
      throw new Error('Household ID not set. Call setContext() first.');
    }

    // Check cache first
    const cacheKey = `household:${this.householdId}:${settingKey}`;
    if (this.settingsCache[cacheKey] !== undefined) {
      return this.settingsCache[cacheKey];
    }

    try {
      const { data, error } = await this.supabase
        .from('household_settings')
        .select('setting_value')
        .eq('household_id', this.householdId)
        .eq('setting_key', settingKey)
        .maybeSingle();

      if (error) throw error;

      const value = data?.setting_value ?? defaultValue;
      this.settingsCache[cacheKey] = value;
      return value;
    } catch (error) {
      console.error(`Error getting household setting ${settingKey}:`, error);
      return defaultValue;
    }
  }

  async setHouseholdSetting(settingKey: string, value: any): Promise<void> {
    if (!this.householdId) {
      throw new Error('Household ID not set. Call setContext() first.');
    }

    try {
      const { error } = await this.supabase
        .from('household_settings')
        .upsert({
          household_id: this.householdId,
          setting_key: settingKey,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'household_id,setting_key'
        });

      if (error) throw error;

      // Update cache
      const cacheKey = `household:${this.householdId}:${settingKey}`;
      this.settingsCache[cacheKey] = value;
    } catch (error) {
      console.error(`Error setting household setting ${settingKey}:`, error);
      throw error;
    }
  }

  async getUserSettings(settingKeys?: string[]): Promise<Record<string, any>> {
    if (!this.userId) {
      throw new Error('User ID not set. Call setContext() first.');
    }

    try {
      let query = this.supabase
        .from('user_settings')
        .select('setting_key, setting_value')
        .eq('user_id', this.userId);

      if (settingKeys && settingKeys.length > 0) {
        query = query.in('setting_key', settingKeys);
      }

      const { data, error } = await query;
      if (error) throw error;

      const settings = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        // Update cache
        const cacheKey = `user:${this.userId}:${setting.setting_key}`;
        this.settingsCache[cacheKey] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      return settings;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {};
    }
  }

  async getHouseholdSettings(settingKeys?: string[]): Promise<Record<string, any>> {
    if (!this.householdId) {
      throw new Error('Household ID not set. Call setContext() first.');
    }

    try {
      let query = this.supabase
        .from('household_settings')
        .select('setting_key, setting_value')
        .eq('household_id', this.householdId);

      if (settingKeys && settingKeys.length > 0) {
        query = query.in('setting_key', settingKeys);
      }

      const { data, error } = await query;
      if (error) throw error;

      const settings = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        // Update cache
        const cacheKey = `household:${this.householdId}:${setting.setting_key}`;
        this.settingsCache[cacheKey] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      return settings;
    } catch (error) {
      console.error('Error getting household settings:', error);
      return {};
    }
  }

  async getSettingDefinition(settingKey: string) {
    try {
      const { data, error } = await this.supabase
        .from('settings_items')
        .select('*')
        .eq('setting_key', settingKey)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error getting setting definition for ${settingKey}:`, error);
      return null;
    }
  }

  async getAllUserSettings(): Promise<Record<string, any>> {
    return this.getUserSettings();
  }

  async getAllHouseholdSettings(): Promise<Record<string, any>> {
    return this.getHouseholdSettings();
  }

  // Utility methods
  clearCache() {
    this.settingsCache = {};
  }

  async getSettingWithFallback(settingKey: string, defaultValue: any = null): Promise<any> {
    // Try user setting first, then household setting, then default
    try {
      if (this.userId) {
        const userValue = await this.getUserSetting(settingKey, undefined);
        if (userValue !== undefined && userValue !== null) {
          return userValue;
        }
      }

      if (this.householdId) {
        const householdValue = await this.getHouseholdSetting(settingKey, undefined);
        if (householdValue !== undefined && householdValue !== null) {
          return householdValue;
        }
      }

      return defaultValue;
    } catch (error) {
      console.error(`Error getting setting with fallback ${settingKey}:`, error);
      return defaultValue;
    }
  }
}

// Hook for using settings in React components
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function useSettings() {
  const { user, profile } = useAuth();
  const [settingsService, setSettingsService] = useState<SettingsService | null>(null);

  useEffect(() => {
    if (profile?.id) {
      const service = new SettingsService(profile.id, profile.household_id || undefined);
      setSettingsService(service);
    }
  }, [profile?.id, profile?.household_id]);

  return settingsService;
}

// Utility functions for common settings
export const SettingsUtils = {
  // Theme settings
  async isDarkMode(settingsService: SettingsService): Promise<boolean> {
    return await settingsService.getUserSetting('dark_mode', false);
  },

  async setDarkMode(settingsService: SettingsService, enabled: boolean): Promise<void> {
    await settingsService.setUserSetting('dark_mode', enabled);
  },

  // Notification settings
  async getNotificationSettings(settingsService: SettingsService) {
    return {
      email: await settingsService.getUserSetting('email_notifications', true),
      push: await settingsService.getUserSetting('push_notifications', true),
      frequency: await settingsService.getUserSetting('notification_frequency', 'daily')
    };
  },

  // Language and locale settings
  async getLanguage(settingsService: SettingsService): Promise<string> {
    return await settingsService.getUserSetting('language', 'en');
  },

  async getTimezone(settingsService: SettingsService): Promise<string> {
    return await settingsService.getUserSetting('timezone', 'UTC');
  },

  async getDateFormat(settingsService: SettingsService): Promise<string> {
    return await settingsService.getUserSetting('date_format', 'MM/DD/YYYY');
  },

  // Household settings
  async getHouseholdName(settingsService: SettingsService): Promise<string> {
    return await settingsService.getHouseholdSetting('household_name', '');
  },

  async isAutoAssignChoresEnabled(settingsService: SettingsService): Promise<boolean> {
    return await settingsService.getHouseholdSetting('auto_assign_chores', false);
  },

  // System settings
  async isMaintenanceMode(settingsService: SettingsService): Promise<boolean> {
    return await settingsService.getHouseholdSetting('maintenance_mode', false);
  },

  async isRegistrationEnabled(settingsService: SettingsService): Promise<boolean> {
    return await settingsService.getHouseholdSetting('registration_enabled', true);
  }
};

export default SettingsService;
export { SettingsService };
