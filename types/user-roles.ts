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
 * 👥 USER ROLES & PERMISSIONS SYSTEM - Access Control Management
 *
 * PURPOSE: Comprehensive role-based access control (RBAC) system for the Dayboard application
 * Manages user permissions, household access, and feature availability across different user types
 *
 * FEATURES:
 * - Three-tier role system (super_admin, admin, member)
 * - Granular permission control for all features
 * - Household-based access management
 * - Subscription tier integration
 * - Dynamic navigation based on permissions
 * - Feature flag system for gradual rollouts
 *
 * ROLE HIERARCHY:
 * - SUPER_ADMIN: Full system access, global feature control, analytics
 * - ADMIN: Household management, user management, billing control
 * - MEMBER: Basic access with configurable features
 *
 * USAGE:
 * ```typescript
 * import { hasPermission, canAccessPage, getVisibleNavigationItems } from '@/types/user-roles';
 *
 * // Check specific permission
 * if (hasPermission(user.permissions, 'ai_features')) {
 *   // Show AI features
 * }
 *
 * // Check page access
 * const canViewWork = canAccessPage(user.role, user.permissions, 'work');
 *
 * // Get navigation items
 * const navItems = getVisibleNavigationItems(user.permissions, user.role);
 * ```
 *
 * PERMISSION CATEGORIES:
 * - Core Pages: dashboard, meals, lists, work, projects, profile
 * - Premium Features: sports_ticker, financial_tracking, ai_features
 * - Admin Features: household_management, user_management, feature_management, billing_management
 * - Super Admin: system_admin, global_feature_control, analytics_dashboard
 *
 * SECURITY:
 * - Server-side permission validation
 * - Row Level Security (RLS) integration
 * - Household-scoped data access
 * - Feature-level access control
 *
 * TECHNICAL:
 * - TypeScript-first design for compile-time safety
 * - Default permissions by role
 * - Helper functions for permission checks
 * - Integration with Supabase auth and database
 *
 * ACCESS: Used throughout the application for access control and feature gating
 */

// User Role System for Household Command Center
export type UserRole = 'super_admin' | 'admin' | 'member';

export interface UserPermissions {
  // Core Pages
  dashboard: boolean;
  meals: boolean;
  lists: boolean;
  work: boolean;
  projects: boolean;
  profile: boolean;

  // Premium Features
  sports_ticker: boolean;
  financial_tracking: boolean;
  ai_features: boolean;

  // Admin Features
  household_management: boolean;
  user_management: boolean;
  feature_management: boolean;
  billing_management: boolean;

  // Super Admin Features
  system_admin: boolean;
  global_feature_control: boolean;
  analytics_dashboard: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  household_id?: string;
  permissions: UserPermissions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HouseholdSettings {
  id: string;
  name: string;
  admin_id: string;
  enabled_features: Partial<UserPermissions>;
  subscription_tier: 'free' | 'premium' | 'household_plus';
  created_at: string;
  updated_at: string;
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: {
    // All permissions enabled for super admin
    dashboard: true,
    meals: true,
    lists: true,
    work: true,
    projects: true,
    profile: true,
    sports_ticker: true,
    financial_tracking: true,
    ai_features: true,
    household_management: true,
    user_management: true,
    feature_management: true,
    billing_management: true,
    system_admin: true,
    global_feature_control: true,
    analytics_dashboard: true
  },
  admin: {
    // Full household management but no system admin
    dashboard: true,
    meals: true,
    lists: true,
    work: true,
    projects: true,
    profile: true,
    sports_ticker: true,
    financial_tracking: true,
    ai_features: true,
    household_management: true,
    user_management: true,
    feature_management: true,
    billing_management: true,
    system_admin: false,
    global_feature_control: false,
    analytics_dashboard: false
  },
  member: {
    // Basic access, limited features
    dashboard: true,
    meals: true,
    lists: true,
    work: false, // Can be enabled by admin
    projects: true,
    profile: true,
    sports_ticker: false,
    financial_tracking: false,
    ai_features: false,
    household_management: false,
    user_management: false,
    feature_management: false,
    billing_management: false,
    system_admin: false,
    global_feature_control: false,
    analytics_dashboard: false
  }
};

// Helper functions
export function hasPermission(
  userPermissions: UserPermissions,
  feature: keyof UserPermissions
): boolean {
  return userPermissions[feature] === true;
}

export function canAccessPage(
  userRole: UserRole,
  userPermissions: UserPermissions,
  page: string
): boolean {
  switch (page) {
    case 'dashboard':
      return hasPermission(userPermissions, 'dashboard');
    case 'meals':
      return hasPermission(userPermissions, 'meals');
    case 'lists':
      return hasPermission(userPermissions, 'lists');
    case 'work':
      return hasPermission(userPermissions, 'work');
    case 'projects':
      return hasPermission(userPermissions, 'projects');
    case 'profile':
      return hasPermission(userPermissions, 'profile');
    case 'admin':
      return userRole === 'admin' || userRole === 'super_admin';
    case 'super-admin':
      return userRole === 'super_admin';
    default:
      return false;
  }
}

export function getVisibleNavigationItems(
  userPermissions: UserPermissions,
  userRole: UserRole
) {
  const items = [];

  if (hasPermission(userPermissions, 'dashboard')) {
    items.push({ name: 'Dashboard', path: '/dashboard', icon: 'Home' });
  }

  if (hasPermission(userPermissions, 'meals')) {
    items.push({ name: 'Meals', path: '/meals', icon: 'ChefHat' });
  }

  if (hasPermission(userPermissions, 'lists')) {
    items.push({ name: 'Lists', path: '/lists', icon: 'ListTodo' });
  }

  if (hasPermission(userPermissions, 'work')) {
    items.push({ name: 'Work', path: '/work', icon: 'Briefcase' });
  }

  if (hasPermission(userPermissions, 'projects')) {
    items.push({ name: 'Projects', path: '/projects', icon: 'FolderOpen' });
  }

  if (hasPermission(userPermissions, 'profile')) {
    items.push({ name: 'Profile', path: '/profile', icon: 'User' });
  }

  // Admin-only items
  if (userRole === 'admin' || userRole === 'super_admin') {
    items.push({ name: 'Household', path: '/admin/household', icon: 'Users' });
  }

  // Super Admin-only items
  if (userRole === 'super_admin') {
    items.push({ name: 'System Admin', path: '/super-admin', icon: 'Shield' });
  }

  return items;
}
