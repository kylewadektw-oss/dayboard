import { PropsWithChildren } from 'react';
import { AppNavigation } from '@/components/layout/AppNavigation';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <AppNavigation />
      <main className="flex-1 overflow-auto pt-16 pb-20 md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}
