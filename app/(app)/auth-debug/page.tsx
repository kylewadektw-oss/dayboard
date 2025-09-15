'use client';

import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { user, profile, loading } = useAuth();
  const [sessionData, setSessionData] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
        } else {
          setSessionData(session);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkSession();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth Context:</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
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

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Session Data:</h2>
          {error && <p className="text-red-600 mb-2">Error: {error}</p>}
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Environment Check:</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify({
              supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
              hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              origin: typeof window !== 'undefined' ? window.location.origin : 'server'
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}