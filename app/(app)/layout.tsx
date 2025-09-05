import { PropsWithChildren } from 'react';
import { AppNavigation } from '@/components/layout/AppNavigation';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <>
      <AppNavigation />
      <div className="min-h-screen bg-gray-50">
        {/* Main content with responsive margin - CSS classes handle sidebar states */}
        <main className="pt-16 pb-20 md:pt-0 md:pb-0 md:ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
    </>
  );
}
