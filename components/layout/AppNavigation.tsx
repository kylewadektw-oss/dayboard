'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, UtensilsCrossed, ClipboardList, Briefcase, FolderOpen, User, Settings, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

export function AppNavigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: pathname === '/dashboard' },
    { name: 'Meals', href: '/meals', icon: UtensilsCrossed, current: pathname === '/meals' },
    { name: 'Lists', href: '/lists', icon: ClipboardList, current: pathname === '/lists' },
    { name: 'Work', href: '/work', icon: Briefcase, current: pathname === '/work' },
    { name: 'Projects', href: '/projects', icon: FolderOpen, current: pathname === '/projects' },
    { name: 'Profile', href: '/profile', icon: User, current: pathname === '/profile' },
  ];
  return (
    <>
      {/* Left Sidebar Navigation - Desktop */}
      <div className={`hidden md:flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Family Hub
              </span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
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
        </nav>

        {/* Settings at Bottom */}
        <div className="p-2 border-t border-gray-200 flex-shrink-0">
          <button className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors relative ${
            isCollapsed ? 'justify-center' : ''
          }`}>
            <Settings className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
            {!isCollapsed && (
              <span className="ml-3 truncate">Settings</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
          <Link href="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Family Hub
            </span>
          </Link>
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
