import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BentLo Labs - Software Design Group',
  description:
    'BentLo Labs is a boutique software design group crafting intelligent solutions that solve real-world problems. Custom development, consulting, and enterprise applications.'
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
              🏢 BentLo Labs
            </h1>
            <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">
              Software Design Group
            </span>
          </div>
          <nav className="flex gap-8">
            <a
              href="/enterprise"
              className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded transition-all"
            >
              Home
            </a>
            <a
              href="/enterprise#portfolio"
              className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded transition-all"
            >
              Portfolio
            </a>
            <a
              href="/enterprise#contact"
              className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded transition-all"
            >
              Contact
            </a>
            <a
              href="https://dayboard.bentlolabs.com"
              className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded transition-all"
            >
              Dayboard
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <Suspense
          fallback={
            <div className="text-center py-16 text-xl opacity-80">
              Loading BentLo Labs...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
