'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Emit event for MainLayout to listen to
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  // Handle mobile detection and auto-collapse on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Meals', href: '/meals', icon: '🍽️' },
    { name: 'Lists', href: '/lists', icon: '📋' },
    { name: 'Daycare', href: '/daycare', icon: '🎒' },
    { name: 'Work', href: '/work', icon: '💼' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  // Don't show sidebar on landing page or signin page
  if (pathname === '/' || pathname === '/signin') {
    return null;
  }

  return (
    <>
      {/* Sidebar */}
<div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${isMobile && !isCollapsed ? 'shadow-2xl' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📋</span>
              <span className="text-xl font-bold text-gray-900">Dayboard</span>
            </div>
          )}
          {isCollapsed && (
            <span className="text-2xl mx-auto">📋</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">SJ</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">Sarah Johnson</div>
                <div className="text-xs text-gray-500 truncate">sarah@example.com</div>
              </div>
            )}
          </div>
          
          {/* Sign Out Button */}
          <Link
            href="/signin"
            className={`mt-2 flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <span className="text-lg">🚪</span>
            {!isCollapsed && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile overlay only */}
      {!isCollapsed && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
