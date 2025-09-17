'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      
      // Get all session-related data
      const sessionData = await supabase.auth.getSession();
      const userData = await supabase.auth.getUser();
      
      // Check localStorage for session data
      const localStorageData = {
        'sb-auth-token': localStorage.getItem('sb-auth-token'),
        allKeys: Object.keys(localStorage).filter(key => key.includes('sb') || key.includes('supabase'))
      };
      
      // Check cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key.includes('sb') || key.includes('supabase')) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        url: window.location.href,
        sessionData: {
          session: sessionData.data.session,
          error: sessionData.error,
          hasAccessToken: !!sessionData.data.session?.access_token,
          hasRefreshToken: !!sessionData.data.session?.refresh_token,
          expiresAt: sessionData.data.session?.expires_at,
          userId: sessionData.data.session?.user?.id
        },
        userData: {
          user: userData.data.user,
          error: userData.error,
          userId: userData.data.user?.id,
          email: userData.data.user?.email
        },
        localStorage: localStorageData,
        cookies,
        envCheck: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
        }
      });
    };
    
    checkAuth();
    
    // Set up interval to check every 2 seconds
    const interval = setInterval(checkAuth, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!debugInfo) {
    return <div className="p-4">Loading auth debug info...</div>;
  }
  
  return (
    <div className="p-4 bg-gray-900 text-white text-xs font-mono">
      <h2 className="text-lg font-bold mb-4">Auth Debug Information</h2>
      <pre className="whitespace-pre-wrap overflow-auto max-h-screen">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}