'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AuthTestPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [sessionData, setSessionData] = useState<{
    session: import('@supabase/supabase-js').Session | null;
    error: import('@supabase/supabase-js').AuthError | null;
  } | null>(null);

  useEffect(() => {
    // Check what Supabase thinks about the current session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Direct session check:', { session, error });
      setSessionData({ session, error });
    };
    
    checkSession();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      <p className="text-gray-600 mb-6">This page shows the current authentication state.</p>
      
      <div className="space-y-4 bg-gray-100 p-4 rounded-lg font-mono text-sm">
        <div>
          <strong>Auth Context:</strong>
          <div className="ml-4">
            <div>Loading: {loading ? 'true' : 'false'}</div>
            <div>User ID: {user?.id || 'null'}</div>
            <div>User Email: {user?.email || 'null'}</div>
            <div>Session exists: {user ? 'true' : 'false'}</div>
            <div>isAuthenticated(): {isAuthenticated() ? 'true' : 'false'}</div>
          </div>
        </div>
        
        <div>
          <strong>Direct Supabase Check:</strong>
          <div className="ml-4">
            <div>Session: {sessionData?.session ? 'exists' : 'null'}</div>
            <div>User: {sessionData?.session?.user?.email || 'null'}</div>
            <div>Error: {sessionData?.error?.message || 'none'}</div>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => window.location.href = '/profile'}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
          >
            Go to Profile
          </button>
          <button 
            onClick={() => window.location.href = '/signin'}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Go to Signin
          </button>
        </div>
      </div>
    </div>
  );
}