/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * DEPRECATED: Project management has been consolidated into the Lists system
 * This page now redirects to /lists for better organization and functionality
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to lists page where projects are now managed
    router.replace('/lists');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Projects Moved!
        </h1>
        <p className="text-gray-600 mb-4">
          Project management has been consolidated into our enhanced Lists
          system for better organization.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you to the Lists page...
        </p>
      </div>
    </div>
  );
}
