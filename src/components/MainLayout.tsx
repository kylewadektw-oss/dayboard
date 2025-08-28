'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

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

  // Full width for landing page and signin
  if (pathname === '/' || pathname === '/signin') {
    return <>{children}</>;
  }

  // With sidebar for app pages - slight push when expanded
  return (
    <div className={`w-full transition-all duration-300 ${
      sidebarCollapsed ? 'ml-16' : 'ml-64'
    }`} id="main-content">
      {children}
    </div>
  );
}
