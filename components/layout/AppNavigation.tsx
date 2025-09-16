/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c)   // Memoize display name from profile
  const displayName = useMemo(() => 
    profile?.display_name || profile?.full_name || user?.email || 'Guest',
    [profile?.display_name, profile?.full_name, user?.email]
  );

  // Get user role for display (keep the display version)
  const displayRole = useMemo(() => 
    profile?.role?.replace('_', ' ').toUpperCase() || 'Member',
    [profile?.role]
  );ade (kyle.wade.ktw@gmail.com)
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


'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Home, UtensilsCrossed, ClipboardList, Briefcase, User, Settings, ChevronLeft, ChevronRight, LogOut, FileText, UserCheck, DollarSign, Lock, Gamepad2, Calendar } from 'lucide-react';
import Logo from '@/components/icons/Logo';
import { useAuth } from '@/contexts/AuthContext';
import SidebarWeather from '@/components/layout/SidebarWeather';

function AppNavigationComponent() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, profile, signOut } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(false);
  
  useEffect(() => { setHasHydrated(true); }, []);

    // Get user's role for permission checking
  const userRole = (profile?.role as string) || 'member';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  // Define navigation items with basic access control
  const navigationItems = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: pathname === '/dashboard', disabled: false },
    { name: 'Calendar', href: '/calendar', icon: Calendar, current: pathname?.startsWith('/calendar'), disabled: false },
    { name: 'Meals', href: '/meals', icon: UtensilsCrossed, current: pathname?.startsWith('/meals'), disabled: false },
    { name: 'Lists', href: '/lists', icon: ClipboardList, current: pathname?.startsWith('/lists'), disabled: false },
    { name: 'Entertainment', href: '/entertainment', icon: Gamepad2, current: pathname?.startsWith('/entertainment'), disabled: false },
    { name: 'Financial', href: '/financial', icon: DollarSign, current: pathname?.startsWith('/financial'), disabled: !isAdmin }, // Admin feature
    { name: 'Work', href: '/work', icon: Briefcase, current: pathname?.startsWith('/work'), disabled: false },
    { name: 'Settings', href: '/settings', icon: Settings, current: pathname?.startsWith('/settings'), disabled: false },
  ], [pathname, isAdmin]);

  // Memoize dev navigation items
  const devNavigation = useMemo(() => [
    { name: 'Logs Dashboard', href: '/logs-dashboard', icon: FileText, current: pathname === '/logs-dashboard' },
    { name: 'Customer Review', href: '/customer-review', icon: UserCheck, current: pathname === '/customer-review' },
    { name: 'Logout', href: '/api/logout', icon: LogOut, current: false },
  ], [pathname]);

  // Memoize user display name
  const displayName = useMemo(() => 
    profile?.preferred_name || profile?.name || user?.email || 'Guest',
    [profile?.preferred_name, profile?.name, user?.email]
  );

  // Get user role for display
  const displayRole = useMemo(() => 
    profile?.role?.replace('_', ' ').toUpperCase() || 'Member',
    [profile?.role]
  );

  // Add class to body to adjust main content
  useEffect(() => {
    const body = document.body;
    if (isCollapsed) {
      body.classList.add('sidebar-collapsed');
      body.classList.remove('sidebar-expanded');
    } else {
      body.classList.add('sidebar-expanded');
      body.classList.remove('sidebar-collapsed');
    }
    
    // Cleanup on unmount
    return () => {
      body.classList.remove('sidebar-collapsed', 'sidebar-expanded');
    };
  }, [isCollapsed]);

  // Memoize the sign out handler to prevent recreation
  const handleSignOut = useCallback(async () => {
    try {
      console.log('🚪 Starting sign out process...');
      await signOut();
      console.log('✅ Sign out completed, redirecting to landing page...');
      
      // Redirect to root path after successful sign out
      // The middleware should allow this since auth cookies are now cleared
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Still redirect even if there's an error
      window.location.href = '/';
    }
  }, [signOut]);

  return (
    <>
      {/* Left Sidebar Navigation - Desktop */}
      <div className={`hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-50 flex-col bg-gradient-to-b from-gray-900 to-black border-r border-gray-700 shadow-xl transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo and Toggle - Black Background with White Text */}
        <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <Link href="/dashboard" className="flex items-center">
                <Logo className="scale-75" />
              </Link>
            ) : (
              <Link href="/dashboard" className="flex items-center justify-center w-full">
                <Logo iconOnly className="w-8 h-8 text-white" />
              </Link>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* User Info (deferred until after hydration to avoid SSR mismatch) */}
        {!isCollapsed && hasHydrated && user && (
          <Link href="/profile" className="block px-4 py-3 border-b border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={32} height={32} className="h-8 w-8 rounded-full border-2 border-gray-600" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                  <User className="h-4 w-4 text-gray-300" />
                </div>
              )}
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  {displayRole}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Simple Weather Display */}
        {!isCollapsed && hasHydrated && (
          <SidebarWeather />
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isDisabled = item.disabled;
              
              if (isDisabled) {
                // Render as disabled div instead of link
                return (
                  <div
                    key={item.name}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative cursor-not-allowed opacity-60 ${
                      item.current
                        ? 'bg-gray-700 text-gray-400'
                        : 'text-gray-500'
                    }`}
                    title={`Access to ${item.name} is restricted for your role (${userRole})`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-600" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 truncate">{item.name}</span>
                        <Lock className="ml-auto h-4 w-4 text-gray-600" />
                      </>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 bg-red-100 text-red-800 text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {item.name} (Restricted)
                      </div>
                    )}
                  </div>
                );
              }
              
              // Render as normal link for accessible items
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                    item.current
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 bg-white text-black text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Development Section */}
          {!isCollapsed && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Development
              </h3>
            </div>
          )}
          
          <div className="space-y-1 mt-2">
            {devNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                    item.current
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 bg-white text-black text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Settings and Sign Out at Bottom */}
        <div className="p-2 border-t border-gray-700 flex-shrink-0 space-y-1">
          {/* Profile Link */}
          <Link
            href="/profile"
            className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
              pathname?.startsWith('/profile')
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <User className={`h-5 w-5 flex-shrink-0 ${
              pathname?.startsWith('/profile') ? 'text-white' : 'text-gray-400 group-hover:text-white'
            }`} />
            {!isCollapsed && (
              <span className="ml-3 truncate">Profile</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 bg-white text-black text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                Profile
              </div>
            )}
          </Link>

          {user && (
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('🔘 Sign out button clicked');
                handleSignOut();
              }}
              className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-400" />
              {!isCollapsed && (
                <span className="ml-3 truncate">Sign Out</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 bg-white text-black text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  Sign Out
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header - Matching Black Background */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700 px-4 py-3 flex items-center justify-between z-50">
          <Link href="/dashboard" className="flex items-center">
            <Logo className="scale-75" />
          </Link>
          
          {user && (
            <div className="flex items-center space-x-2">
              <Link
                href="/profile"
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('📱 Mobile sign out button clicked');
                  handleSignOut();
                }}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-4 gap-x-1 py-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isDisabled = item.disabled;
              
              if (isDisabled) {
                // Render as disabled div for mobile
                return (
                  <div
                    key={item.name}
                    className="flex flex-col items-center justify-center py-2 px-1 text-xs cursor-not-allowed opacity-50 text-gray-400"
                    title={`Access to ${item.name} is restricted for your role (${userRole})`}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5 mb-1" />
                      <Lock className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>
                );
              }
              
              // Render as normal link for accessible items
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors ${
                    item.current
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const AppNavigation = memo(AppNavigationComponent);
