import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bentlolabs Enterprise Dashboard',
  description:
    'Comprehensive monitoring and management for the Bentlolabs ecosystem'
};

export default function EnterpriseDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <header className="bg-black/20 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              🏢 Bentlolabs Enterprise
            </h1>
            <span className="text-xs bg-green-500/20 px-2 py-1 rounded">
              Production Dashboard
            </span>
          </div>
          <nav className="flex gap-8">
            <a
              href="/enterprise"
              className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded transition-all"
            >
              Dashboard
            </a>
            <a
              href="/enterprise/analytics"
              className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded transition-all"
            >
              Analytics
            </a>
            <a
              href="/enterprise/monitoring"
              className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded transition-all"
            >
              Monitoring
            </a>
            <a
              href="/enterprise/settings"
              className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded transition-all"
            >
              Settings
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <Suspense
          fallback={
            <div className="text-center py-16 text-xl opacity-80">
              Loading Enterprise Dashboard...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
