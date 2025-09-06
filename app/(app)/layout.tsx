import { PropsWithChildren, Suspense } from 'react';
import { AppNavigation } from '@/components/layout/AppNavigation';
import { AuthProvider } from '@/contexts/AuthContext';

// Layout loading component
const LayoutSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="fixed top-0 left-0 w-64 h-full bg-white border-r border-gray-200"></div>
    <div className="ml-64 p-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-white rounded-2xl shadow-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <Suspense fallback={<LayoutSkeleton />}>
        <AppNavigation />
        <div className="min-h-screen bg-gray-50">
          {/* Main content with responsive margin - CSS classes handle sidebar states */}
          <main className="pt-16 pb-20 md:pt-0 md:pb-0 md:ml-64 transition-all duration-300">
            {children}
          </main>
        </div>
      </Suspense>
    </AuthProvider>
  );
}
