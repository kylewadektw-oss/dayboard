import { createClient } from '@/utils/supabase/server';
import { UserRole, UserPermissions, UserProfile, DEFAULT_PERMISSIONS } from '@/types/user-roles';

// Mock function for development - replace with real DB queries after migration
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // TODO: Replace with real profile query after migration
  // For now, return a mock admin user for development
  return {
    id: user.id,
    email: user.email || '',
    full_name: 'Developer User',
    role: 'super_admin', // Default to super admin for development
    household_id: 'mock-household-id',
    permissions: DEFAULT_PERMISSIONS.super_admin,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function hasPermission(feature: keyof UserPermissions): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return user.permissions[feature] === true;
}

export async function requirePermission(feature: keyof UserPermissions): Promise<void> {
  const hasAccess = await hasPermission(feature);
  if (!hasAccess) {
    throw new Error(`Access denied: Missing permission for ${feature}`);
  }
}

export async function requireRole(requiredRole: UserRole | UserRole[]): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!requiredRoles.includes(user.role)) {
    throw new Error(`Access denied: Required role ${requiredRoles.join(' or ')}`);
  }
}

export async function canAccessPage(page: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  switch (page) {
    case 'dashboard':
      return user.permissions.dashboard;
    case 'meals':
      return user.permissions.meals;
    case 'lists':
      return user.permissions.lists;
    case 'work':
      return user.permissions.work;
    case 'projects':
      return user.permissions.projects;
    case 'profile':
      return user.permissions.profile;
    case 'admin':
      return user.role === 'admin' || user.role === 'super_admin';
    case 'super-admin':
      return user.role === 'super_admin';
    default:
      return false;
  }
}
