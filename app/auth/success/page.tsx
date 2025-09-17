'use client';

import { useEffect } from 'react';

export default function AuthCallbackSuccess() {
  useEffect(() => {
    // Force a page refresh to ensure session is properly loaded
    if (typeof window !== 'undefined') {
      console.log('🔄 Auth callback success - refreshing to load session');
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  );
}