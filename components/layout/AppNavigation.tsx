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
    { name: 'Settings', href: '/settings', icon: Settings, current: pathname === '/settings' },
  ];

  const devNavigation = [
    { name: 'Logs Dashboard', href: '/logs-dashboard', icon: FileText, current: pathname === '/logs-dashboard' },
    { name: 'Customer Review', href: '/customer-review', icon: UserCheck, current: pathname === '/customer-review' },
  ];
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
                <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full border-2 border-gray-600" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                  <User className="h-4 w-4 text-gray-300" />
                </div>
              )}
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.preferred_name || profile?.name || user?.email || 'Guest'}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  {profile?.role?.replace('_', ' ').toUpperCase() || 'Member'}
                </p>
              </div>
            </div>
          </Link>
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
          {user && (
            <button
              onClick={handleSignOut}
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
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-300 hover:text-white transition-colors"
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
