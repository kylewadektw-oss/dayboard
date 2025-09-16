import { Database } from '@/src/lib/types_db';
import { SupabaseClient } from '@supabase/supabase-js';

export type UserRole = Database['public']['Enums']['user_role'];
export type FeatureName = string;

export interface FeatureAccess {
  id: string;
  feature_name: string;
  role: UserRole;
  available: boolean;
}

export class FeatureAccessManager {
  constructor(private supabase: SupabaseClient) {}

  async checkUserAccess(): Promise<boolean> {
    return true;
  }

  async getUserRole(): Promise<UserRole | null> {
    return 'member';
  }

  async getFeatureAccessRules(): Promise<FeatureAccess[]> {
    return [];
  }
}

export function createFeatureAccessManager(
  supabase: SupabaseClient
): FeatureAccessManager {
  return new FeatureAccessManager(supabase);
}

export const featureAccessManager = {
  checkUserAccess: () => Promise.resolve(true),
  getUserRole: (userId: string) => {
    console.log(`Mock: Getting role for user ${userId}`);
    return Promise.resolve('member' as UserRole);
  },
  getFeatureAccessRules: () => Promise.resolve([]),
  getHouseholdFeatureAccess: (householdId: string) => {
    console.log(`Mock: Getting feature access for household ${householdId}`);
    return Promise.resolve([]);
  },
  updateFeatureAccess: (
    featureName: string,
    role: string,
    available: boolean
  ) => {
    console.log(`Mock: Updating ${featureName} for ${role}: ${available}`);
    return Promise.resolve(true);
  },
  batchUpdateFeatureAccess: (householdId: string, updates: unknown[]) => {
    console.log(
      `Mock: Batch updating features for household ${householdId}`,
      updates
    );
    return Promise.resolve(true);
  },
  setupDefaultFeatureAccess: (householdId: string) => {
    console.log(
      `Mock: Setting up default features for household ${householdId}`
    );
    return Promise.resolve(true);
  }
};

// Additional stub functions for hooks
export const checkFeatureAccess = (userId: string, featureName: string) => {
  console.log(
    `Mock: Checking feature access for user ${userId} to ${featureName}`
  );
  return Promise.resolve(true);
};
export const checkMultipleFeatureAccess = (
  userId: string,
  featureNames: string[]
) => {
  console.log(
    `Mock: Checking multiple feature access for user ${userId}`,
    featureNames
  );
  const results: Record<string, boolean> = {};
  featureNames.forEach((name) => {
    results[name] = true;
  });
  return Promise.resolve(results);
};
export const getDefaultAccess = (role: string, featureName: string) => {
  console.log(`Mock: Getting default access for ${role} to ${featureName}`);
  return true;
};

export const FEATURE_DEFINITIONS: Record<
  string,
  {
    category: string;
    name?: string;
    label: string;
    description?: string;
  }
> = {
  dashboard: {
    category: 'core',
    name: 'Dashboard',
    label: 'Dashboard Access',
    description: 'Access to the main dashboard and overview features'
  },
  settings: {
    category: 'core',
    name: 'Settings',
    label: 'Settings Management',
    description: 'Access to application settings and configuration'
  }
};
