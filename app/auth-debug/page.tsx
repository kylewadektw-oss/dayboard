'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function AuthStateDebug() {
  const [authState, setAuthState] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [profileInfo, setProfileInfo] = useState<any>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const supabase = createClient();
    
    try {
      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', { sessionData, sessionError });
      
      // Check user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('User check:', { userData, userError });
      
      setAuthState({
        session: sessionData.session,
        sessionError,
        user: userData.user,
        userError
      });
      
      if (userData.user) {
        setUserInfo(userData.user);
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .maybeSingle();
          
        console.log('Profile check:', { profile, profileError });
        setProfileInfo({ profile, profileError });
      }
    } catch (error: any) {
      console.error('Auth state check error:', error);
      setAuthState({ error: error.message });
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    console.log('🚪 Signing out...');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      alert(`Sign out error: ${error.message}`);
    } else {
      console.log('✅ Signed out successfully');
      alert('Signed out successfully! Refresh the page to test fresh sign-in.');
      // Clear local state
      setAuthState(null);
      setUserInfo(null);
      setProfileInfo(null);
    }
  };

  const clearLocalStorage = () => {
    // Clear all Supabase related localStorage
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(key => key.includes('supabase'));
    
    console.log('🧹 Clearing local storage...');
    console.log('Supabase keys found:', supabaseKeys);
    
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
    });
    
    alert(`Cleared ${supabaseKeys.length} localStorage items. Refresh the page.`);
  };

  const testSignIn = () => {
    window.location.href = '/signin';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication State Debug</h1>
      
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ OAuth Disabled</h3>
        <p className="text-sm text-yellow-700">
          OAuth authentication has been disabled for development. 
          This debug page will show no active sessions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-3">Current Auth State</h2>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
        
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold mb-3">User Info</h2>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-semibold mb-3">Profile Info</h2>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(profileInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-semibold mb-3">Current URL</h2>
          <p className="text-sm break-all">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={checkAuthState}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔍 Refresh Auth State
        </button>
        
        <button
          onClick={signOut}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Sign Out
        </button>
        
        <button
          onClick={clearLocalStorage}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          🧹 Clear Local Storage
        </button>
        
        <button
          onClick={testSignIn}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          🔑 Go to Sign In Page
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Debug Steps:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check current auth state above</li>
          <li>If you see a user/session, click "Sign Out"</li>
          <li>Click "Clear Local Storage" to remove any cached auth</li>
          <li>Refresh this page</li>
          <li>Click "Go to Sign In Page" to test fresh sign-in</li>
        </ol>
      </div>
    </div>
  );
}
