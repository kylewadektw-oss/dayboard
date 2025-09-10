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


'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, UtensilsCrossed, ClipboardList, Briefcase, FolderOpen, User, Settings, ChevronLeft, ChevronRight, LogOut, FileText, Bug, Activity, UserCheck } from 'lucide-react';
import Logo from '@/components/icons/Logo';
import { useAuth } from '@/contexts/AuthContext';

export function AppNavigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, profile, signOut } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => { setHasHydrated(true); }, []);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to landing page after successful sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect even if there's an error
      window.location.href = '/';
    }
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: pathname === '/dashboard' },
    { name: 'Meals', href: '/meals', icon: UtensilsCrossed, current: pathname === '/meals' },
    { name: 'Lists', href: '/lists', icon: ClipboardList, current: pathname === '/lists' },
    { name: 'Work', href: '/work', icon: Briefcase, current: pathname === '/work' },
    { name: 'Projects', href: '/projects', icon: FolderOpen, current: pathname === '/projects' },
    { name: 'Profile', href: '/profile', icon: User, current: pathname === '/profile' },
  ];

  const devNavigation = [
    { name: 'Customer Review', href: '/customer-review', icon: UserCheck, current: pathname === '/customer-review' },
    { name: 'Logs Dashboard', href: '/logs-dashboard', icon: FileText, current: pathname === '/logs-dashboard' },
    { name: 'Simple Logging', href: '/test-logging-simple', icon: Activity, current: pathname === '/test-logging-simple' },
    { name: 'Auth Debug', href: '/auth-debug', icon: Bug, current: pathname === '/auth-debug' },
  ];
  return (
    <>
      {/* Left Sidebar Navigation - Desktop */}
      <div className={`hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-50 flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2 rounded-lg">
                <Logo className="scale-50" />
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2 rounded-lg">
                <Logo iconOnly className="w-6 h-6" />
              </div>
            </Link>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* User Info (deferred until after hydration to avoid SSR mismatch) */}
        {!isCollapsed && hasHydrated && user && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
              )}
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.preferred_name || profile?.name || user?.email || 'Guest'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.role?.replace('_', ' ').toUpperCase() || 'Member'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                    item.current
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border-r-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    item.current ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Development Section */}
          {!isCollapsed && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                      ? 'bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-700 border-r-2 border-orange-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    item.current ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Settings and Sign Out at Bottom */}
        <div className="p-2 border-t border-gray-200 flex-shrink-0 space-y-1">
          <Link 
            href="/settings"
            className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
              pathname === '/settings'
                ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border-r-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Settings className={`h-5 w-5 flex-shrink-0 ${
              pathname === '/settings' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
            }`} />
            {!isCollapsed && (
              <span className="ml-3 truncate">Settings</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </Link>

          {user && (
            <button
              onClick={handleSignOut}
              className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors relative ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500" />
              {!isCollapsed && (
                <span className="ml-3 truncate">Sign Out</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                  Sign Out
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
          <Link href="/dashboard" className="flex items-center">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-1 rounded-lg">
              <Logo className="scale-50" />
            </div>
          </Link>
          
          {user && (
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-6 py-1">
            {navigation.map((item) => {
              const Icon = item.icon;
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
