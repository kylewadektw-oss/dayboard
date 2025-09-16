'use client';

import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { user, profile, loading } = useAuth();
  const [sessionData, setSessionData] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authChecks, setAuthChecks] = useState<string[]>([]);

  useEffect(() => {
    const addCheck = (message: string) => {
      setAuthChecks(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const checkSession = async () => {
      try {
        addCheck('Starting session check...');
        const supabase = createClient();
        
        addCheck('Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          addCheck(`Session error: ${error.message}`);
          setError(error.message);
        } else {
          addCheck(`Session result: ${session ? 'Found' : 'None'}`);
          setSessionData(session);
        }

        addCheck('Getting user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          addCheck(`User error: ${userError.message}`);
        } else {
          addCheck(`User result: ${user ? 'Found' : 'None'}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        addCheck(`Critical error: ${message}`);
        setError(message);
      }
    };

    addCheck('Component mounted');
    checkSession();
  }, []);

  useEffect(() => {
    setAuthChecks(prev => [...prev, `${new Date().toLocaleTimeString()}: Auth loading state: ${loading}`]);
  }, [loading]);

  useEffect(() => {
    setAuthChecks(prev => [...prev, `${new Date().toLocaleTimeString()}: User state: ${user ? 'Present' : 'None'}`]);
  }, [user]);

  useEffect(() => {
    setAuthChecks(prev => [...prev, `${new Date().toLocaleTimeString()}: Profile state: ${profile ? 'Present' : 'None'}`]);
  }, [profile]);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Auth Debug</h1>
      
      <div className="space-y-8">
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Auth Context:</h2>
          <div className="bg-white p-4 rounded border overflow-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {JSON.stringify({
                loading,
                hasUser: !!user,
                userId: user?.id,
                userEmail: user?.email,
                hasProfile: !!profile,
                profileName: profile?.name
              }, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Session Data:</h2>
          {error && <p className="text-red-600 mb-4 font-medium">Error: {error}</p>}
          <div className="bg-white p-4 rounded border overflow-auto max-h-96">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Environment Check:</h2>
          <div className="bg-white p-4 rounded border overflow-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {JSON.stringify({
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
                hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                origin: typeof window !== 'undefined' ? window.location.origin : 'server'
              }, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Auth Timeline:</h2>
          <div className="bg-white p-4 rounded border overflow-auto max-h-64">
            {authChecks.map((check, index) => (
              <div key={index} className="text-sm text-gray-700 font-mono py-1 border-b border-gray-100">
                {check}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}