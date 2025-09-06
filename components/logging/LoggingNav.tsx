'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const loggingRoutes = [
  {
    href: '/logs-dashboard',
    label: '📊 Logs Dashboard',
    description: 'Real-time console log monitoring'
  },
  {
    href: '/auto-log-review',
    label: '🔍 Auto Log Review',
    description: 'Automated analysis & insights'
  },
  {
    href: '/test-console-logging',
    label: '🧪 Test Console',
    description: 'Generate test logs for debugging'
  }
];

export default function LoggingNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4">
          {loggingRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                pathname === route.href
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{route.label}</div>
              <div className="text-xs opacity-75">{route.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
