/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

interface DebugInfo {
  environment?: Record<string, unknown>;
  auth?: {
    user?: { id: string; email?: string } | null;
    userError?: string;
    session?: { expires_at?: number } | null;
    sessionError?: string;
  };
  database?: Record<string, unknown>;
  timestamp?: string;
  error?: string;
}

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        
        // Check environment variables
        const envCheck = {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          currentOrigin: window.location.origin
        };

        // Check current auth status
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Test basic database connection
        let dbConnectionTest = null;
        try {
          const { error } = await supabase.from('profiles').select('count').limit(1);
          dbConnectionTest = { success: !error, error: error?.message };
        } catch (err) {
          dbConnectionTest = { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }

        setDebugInfo({
          environment: envCheck,
          auth: {
            user: user ? { id: user.id, email: user.email } : null,
            userError: userError?.message,
            session: session ? { expires_at: session.expires_at } : null,
            sessionError: sessionError?.message
          },
          database: dbConnectionTest,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        setDebugInfo({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [supabase]);

  const testGoogleSignIn = async () => {
    try {
      console.log('🚀 Testing Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('OAuth result:', { data, error });
      
      if (error) {
        alert(`OAuth Error: ${error.message}`);
      }
    } catch (error) {
      console.error('OAuth test error:', error);
      alert(`OAuth Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading debug information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Authentication Debug</h1>
          
          <div className="space-y-6">
            {/* Environment Variables */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Environment Variables</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.environment, null, 2)}
                </pre>
              </div>
            </div>

            {/* Authentication Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Authentication Status</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.auth, null, 2)}
                </pre>
              </div>
            </div>

            {/* Database Connection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Database Connection</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.database, null, 2)}
                </pre>
              </div>
            </div>

            {/* Test Actions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Test Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={testGoogleSignIn}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🔐 Test Google OAuth
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors ml-3"
                >
                  🔄 Refresh Debug Info
                </button>
              </div>
            </div>

            {/* Error Display */}
            {debugInfo.error && (
              <div>
                <h2 className="text-lg font-semibold text-red-800 mb-3">Error</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{debugInfo.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}