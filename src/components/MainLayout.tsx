'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Full width for landing page and signin
  if (pathname === '/' || pathname === '/signin') {
    return <>{children}</>;
  }

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  // With sidebar for app pages - slight push when expanded
  return (
    <div className={`w-full transition-all duration-300 ${
      sidebarCollapsed ? 'ml-0' : 'ml-16'
    }`} id="main-content">
      {children}
    </div>
  );
}
