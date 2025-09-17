'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function OAuthDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  
  useEffect(() => {
    const runDiagnostics = async () => {
      const supabase = createClient();
      
      // Check current URL and parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      
      // Check environment
      const envCheck = {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        urlHost: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname,
        currentOrigin: window.location.origin,
        expectedCallbackUrl: `${window.location.origin}/auth/callback`
      };
      
      // Check current auth state
      const sessionCheck = await supabase.auth.getSession();
      const userCheck = await supabase.auth.getUser();
      
      // Check localStorage for auth data
      const authStorage = {
        authToken: localStorage.getItem('sb-auth-token'),
        allSupabaseKeys: Object.keys(localStorage).filter(key => 
          key.includes('sb-') || key.includes('supabase')
        ).map(key => ({
          key,
          value: localStorage.getItem(key)?.substring(0, 50) + '...'
        }))
      };
      
      // Check cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key.includes('sb-') || key.includes('supabase')) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      setDiagnostics({
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
        urlParams: Object.fromEntries(urlParams),
        hashParams: Object.fromEntries(hashParams),
        environment: envCheck,
        authState: {
          session: {
            hasSession: !!sessionCheck.data.session,
            error: sessionCheck.error?.message,
            userId: sessionCheck.data.session?.user?.id,
            hasTokens: !!(sessionCheck.data.session?.access_token && sessionCheck.data.session?.refresh_token),
            expiresAt: sessionCheck.data.session?.expires_at
          },
          user: {
            hasUser: !!userCheck.data.user,
            error: userCheck.error?.message,
            userId: userCheck.data.user?.id,
            email: userCheck.data.user?.email
          }
        },
        storage: authStorage,
        cookies: cookies,
        oauthTestUrls: {
          google: `https://${envCheck.urlHost}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(envCheck.expectedCallbackUrl)}`,
          redirectToCallback: envCheck.expectedCallbackUrl
        }
      });
    };
    
    runDiagnostics();
  }, []);
  
  const testOAuthFlow = async () => {
    const supabase = createClient();
    
    console.log('🧪 Testing OAuth flow manually...');
    
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      console.log('🧪 OAuth test result:', result);
    } catch (error) {
      console.error('🧪 OAuth test error:', error);
    }
  };
  
  if (!diagnostics) {
    return <div className="p-4 text-white">Running OAuth diagnostics...</div>;
  }
  
  return (
    <div className="p-4 bg-gray-900 text-white text-xs font-mono max-h-screen overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">OAuth Diagnostics</h2>
        <button 
          onClick={testOAuthFlow}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          Test OAuth Flow
        </button>
      </div>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(diagnostics, null, 2)}
      </pre>
    </div>
  );
}