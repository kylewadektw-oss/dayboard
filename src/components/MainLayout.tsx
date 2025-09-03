'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Listen for sidebar state changes (must be before conditional return)
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  // Full width for landing page, signin, auth bypass, and debug pages (no auth required)
  if (pathname === '/' || pathname === '/signin' || pathname === '/auth-bypass' || pathname === '/auth-callback' || pathname === '/direct-auth' || pathname === '/auth-minimal' || pathname === '/test-auth' || pathname === '/oauth-debug' || pathname === '/auth-test' || pathname === '/csp-debug') {
    return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
  }

  // With sidebar for app pages - require authentication
  return (
    <ProtectedRoute>
      <div className={`w-full transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`} id="main-content">
        {children}
      </div>
    </ProtectedRoute>
  );
}
