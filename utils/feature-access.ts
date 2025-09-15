/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Feature Access Management Utilities
 * 
 * This module provides comprehensive feature access control for role-based permissions.
 * It integrates with the Supabase database to manage which features are available
 * to different user roles (member, admin, super_admin).
 */

'use client';

import { createClient } from '@/utils/supabase/client';
import { logger } from '@/utils/logger';
import { Database } from '@/types_db';

// Type definitions
export type UserRole = Database['public']['Enums']['user_role'];
export type FeatureAccess = Database['public']['Tables']['feature_access']['Row'];
export type FeatureAccessInsert = Database['public']['Tables']['feature_access']['Insert'];
export type FeatureAccessUpdate = Database['public']['Tables']['feature_access']['Update'];

// Feature definitions - central source of truth for all features
export const FEATURE_DEFINITIONS = {
  // Core features (typically always available)
  dashboard: { category: 'core', label: 'Dashboard', description: 'Main dashboard view' },
  settings: { category: 'core', label: 'Settings', description: 'Application settings' },
  sign_out: { category: 'core', label: 'Sign Out', description: 'Sign out of the application' },
  
  // Main feature tabs
  meals_tab: { category: 'meals', label: 'Meals Tab', description: 'Access to meals section' },
  meals_favorites: { category: 'meals', label: 'Meal Favorites', description: 'Favorite meals feature' },
  meals_this_week: { category: 'meals', label: 'This Week Meals', description: 'Weekly meal planning' },
  meals_recipe_library: { category: 'meals', label: 'Recipe Library', description: 'Access to recipe collection' },
  meals_cocktails: { category: 'meals', label: 'Cocktails', description: 'Cocktail recipes and features' },
  meals_quick_meals: { category: 'meals', label: 'Quick Meals', description: 'Quick meal suggestions' },
  
  lists_tab: { category: 'lists', label: 'Lists Tab', description: 'Access to lists section' },
  lists_grocery: { category: 'lists', label: 'Grocery Lists', description: 'Grocery list management' },
  lists_todo: { category: 'lists', label: 'Todo Lists', description: 'Todo list management' },
  lists_shared: { category: 'lists', label: 'Shared Lists', description: 'Shared list collaboration' },
  
  budget_tab: { category: 'budget', label: 'Budget Tab', description: 'Access to budget section' },
  work_tab: { category: 'work', label: 'Work Tab', description: 'Access to work section' },
  projects_tab: { category: 'projects', label: 'Projects Tab', description: 'Access to projects section' },
  
  calendar_tab: { category: 'calendar', label: 'Calendar Tab', description: 'Access to calendar section' },
  calendar_events: { category: 'calendar', label: 'Calendar Events', description: 'Event management' },
  calendar_scheduling: { category: 'calendar', label: 'Calendar Scheduling', description: 'Advanced scheduling features' },
  
  // Admin features
  household_management: { category: 'admin', label: 'Household Management', description: 'Manage household settings and members' },
  user_management: { category: 'admin', label: 'User Management', description: 'Manage user roles and permissions' },
  role_management: { category: 'admin', label: 'Role Management', description: 'Assign and modify user roles' },
  feature_access_control: { category: 'admin', label: 'Feature Access Control', description: 'Control feature access for household members' }
} as const;

export type FeatureName = keyof typeof FEATURE_DEFINITIONS;

// Default access matrix for fallback scenarios
export const DEFAULT_ACCESS_MATRIX: Record<UserRole, Record<FeatureName, boolean>> = {
  member: {
    // Core features
    dashboard: true,
    settings: true,
    sign_out: true,
    
    // Main tabs - default accessible
    meals_tab: true,
    meals_favorites: true,
    meals_this_week: true,
    meals_recipe_library: true,
    meals_cocktails: false,
    meals_quick_meals: false,
    
    lists_tab: true,
    lists_grocery: true,
    lists_todo: true,
    lists_shared: false,
    
    budget_tab: false,
    work_tab: true,
    projects_tab: true,
    
    calendar_tab: true,
    calendar_events: true,
    calendar_scheduling: false,
    
    // Admin features - not accessible
    household_management: false,
    user_management: false,
    role_management: false,
    feature_access_control: false,
  },
  admin: {
    // Core features
    dashboard: true,
    settings: true,
    sign_out: true,
    
    // Main tabs - all accessible
    meals_tab: true,
    meals_favorites: true,
    meals_this_week: true,
    meals_recipe_library: true,
    meals_cocktails: true,
    meals_quick_meals: true,
    
    lists_tab: true,
    lists_grocery: true,
    lists_todo: true,
    lists_shared: true,
    
    budget_tab: true,
    work_tab: true,
    projects_tab: true,
    
    calendar_tab: true,
    calendar_events: true,
    calendar_scheduling: true,
    
    // Admin features - limited access
    household_management: true,
    user_management: false,
    role_management: false,
    feature_access_control: false,
  },
  super_admin: {
    // All features accessible
    dashboard: true,
    settings: true,
    sign_out: true,
    
    meals_tab: true,
    meals_favorites: true,
    meals_this_week: true,
    meals_recipe_library: true,
    meals_cocktails: true,
    meals_quick_meals: true,
    
    lists_tab: true,
    lists_grocery: true,
    lists_todo: true,
    lists_shared: true,
    
    budget_tab: true,
    work_tab: true,
    projects_tab: true,
    
    calendar_tab: true,
    calendar_events: true,
    calendar_scheduling: true,
    
    household_management: true,
    user_management: true,
    role_management: true,
    feature_access_control: true,
  }
};

/**
 * Feature Access Manager Class
 * Handles all feature access operations with the database
 */
export class FeatureAccessManager {
  private supabase = createClient();

  /**
   * Check if a user has access to a specific feature
   */
  async checkFeatureAccess(
    userId: string,
    featureName: FeatureName
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('check_feature_access', {
        user_id_param: userId,
        feature_name_param: featureName
      });

      if (error) {
        logger.error('Error checking feature access', 'FeatureAccessManager', {
          error: error.message,
          userId,
          featureName
        });
        
        // Fallback to default permissions
        return this.getFallbackAccess(featureName);
      }

      return data || false;
    } catch (error) {
      logger.error('Exception in checkFeatureAccess', 'FeatureAccessManager', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        featureName
      });
      
      return this.getFallbackAccess(featureName);
    }
  }

  /**
   * Get feature access for multiple features at once
   */
  async checkMultipleFeatureAccess(
    userId: string,
    featureNames: FeatureName[]
  ): Promise<Record<FeatureName, boolean>> {
    const results: Record<string, boolean> = {};

    // Check all features in parallel
    await Promise.all(
      featureNames.map(async (featureName) => {
        results[featureName] = await this.checkFeatureAccess(userId, featureName);
      })
    );

    return results as Record<FeatureName, boolean>;
  }

  /**
   * Get all feature access rules for a household
   */
  async getHouseholdFeatureAccess(householdId: string): Promise<FeatureAccess[]> {
    try {
      const { data, error } = await this.supabase
        .from('feature_access')
        .select('*')
        .eq('household_id', householdId);

      if (error) {
        logger.error('Error fetching household feature access', 'FeatureAccessManager', {
          error: error.message,
          householdId
        });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Exception in getHouseholdFeatureAccess', 'FeatureAccessManager', {
        error: error instanceof Error ? error.message : 'Unknown error',
        householdId
      });
      return [];
    }
  }

  /**
   * Update feature access for a household and role
   */
  async updateFeatureAccess(
    householdId: string,
    featureName: FeatureName,
    role: UserRole,
    available: boolean
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('feature_access')
        .upsert({
          household_id: householdId,
          feature_name: featureName,
          feature_category: FEATURE_DEFINITIONS[featureName].category,
          role,
          available,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'household_id,feature_name,role'
        });

      if (error) {
        logger.error('Error updating feature access', 'FeatureAccessManager', {
          error: error.message,
          householdId,
          featureName,
          role,
          available
        });
        return false;
      }

      logger.info('Feature access updated successfully', 'FeatureAccessManager', {
        householdId,
        featureName,
        role,
        available
      });

      return true;
    } catch (error) {
      logger.error('Exception in updateFeatureAccess', 'FeatureAccessManager', {
        error: error instanceof Error ? error.message : 'Unknown error',
        householdId,
        featureName,
        role,
        available
      });
      return false;
    }
  }

  /**
   * Batch update multiple feature access rules
   */
  async batchUpdateFeatureAccess(
    householdId: string,
    updates: Array<{
      featureName: FeatureName;
      role: UserRole;
      available: boolean;
    }>
  ): Promise<boolean> {
    try {
      const upsertData = updates.map(update => ({
        household_id: householdId,
        feature_name: update.featureName,
        feature_category: FEATURE_DEFINITIONS[update.featureName].category,
        role: update.role,
        available: update.available,
        updated_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('feature_access')
        .upsert(upsertData, {
          onConflict: 'household_id,feature_name,role'
        });

      if (error) {
        logger.error('Error in batch update feature access', 'FeatureAccessManager', {
          error: error.message,
          householdId,
          updateCount: updates.length
        });
        return false;
      }

      logger.info('Batch feature access update successful', 'FeatureAccessManager', {
        householdId,
        updateCount: updates.length
      });

      return true;
    } catch (error) {
      logger.error('Exception in batchUpdateFeatureAccess', 'FeatureAccessManager', {
        error: error instanceof Error ? error.message : 'Unknown error',
        householdId,
        updateCount: updates.length
      });
      return false;
    }
  }

  /**
   * Setup default feature access for a household
   */
  async setupDefaultFeatureAccess(householdId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('setup_default_feature_access', {
        household_id_param: householdId
      });

      if (error) {
        logger.error('Error setting up default feature access', 'FeatureAccessManager', {
          error: error.message,
          householdId
        });
        return false;
      }

      logger.info('Default feature access setup completed', 'FeatureAccessManager', {
        householdId
      });

      return true;
    } catch (error) {
      logger.error('Exception in setupDefaultFeatureAccess', 'FeatureAccessManager', {
        error: error instanceof Error ? error.message : 'Unknown error',
        householdId
      });
      return false;
    }
  }

  /**
   * Get user's role from their profile
   */
  async getUserRole(userId: string): Promise<UserRole> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user role', 'FeatureAccessManager', {
          error: error.message,
          userId
        });
        return 'member'; // Default fallback
      }

      return data?.role || 'member';
    } catch (error) {
      logger.error('Exception in getUserRole', 'FeatureAccessManager', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return 'member';
    }
  }

  /**
   * Get fallback access for core features
   */
  private getFallbackAccess(featureName: FeatureName): boolean {
    const feature = FEATURE_DEFINITIONS[featureName];
    // Core features are always accessible as fallback
    return feature.category === 'core';
  }

  /**
   * Get feature definition
   */
  getFeatureDefinition(featureName: FeatureName) {
    return FEATURE_DEFINITIONS[featureName];
  }

  /**
   * Get all feature definitions
   */
  getAllFeatureDefinitions() {
    return FEATURE_DEFINITIONS;
  }

  /**
   * Get features by category
   */
  getFeaturesByCategory(category: string): Array<{ name: FeatureName; definition: typeof FEATURE_DEFINITIONS[FeatureName] }> {
    return Object.entries(FEATURE_DEFINITIONS)
      .filter(([_, def]) => def.category === category)
      .map(([name, definition]) => ({ name: name as FeatureName, definition }));
  }
}

// Export singleton instance
export const featureAccessManager = new FeatureAccessManager();

// Utility functions for direct use
export const checkFeatureAccess = (userId: string, featureName: FeatureName) => 
  featureAccessManager.checkFeatureAccess(userId, featureName);

export const checkMultipleFeatureAccess = (userId: string, featureNames: FeatureName[]) => 
  featureAccessManager.checkMultipleFeatureAccess(userId, featureNames);

export const getDefaultAccess = (role: UserRole, featureName: FeatureName): boolean => 
  DEFAULT_ACCESS_MATRIX[role][featureName];