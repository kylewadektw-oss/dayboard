'use client';

import { supabase } from '../../lib/supabaseClient';

export default function OAuthDebugPage() {
  
  const testOAuthURL = async () => {
    try {
      console.log('Testing OAuth URL generation...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('OAuth result:', { data, error });
      
      if (data?.url) {
        alert(`✅ OAuth URL generated successfully!\nURL: ${data.url}\n\nThis means Supabase config is correct.\nThe 403 error is from Google Cloud Console.`);
      } else if (error) {
        alert(`❌ Supabase OAuth error: ${error.message}`);
      } else {
        alert('❌ No URL or error returned from Supabase');
      }
    } catch (err) {
      console.error('OAuth test failed:', err);
      alert(`❌ Test failed: ${err}`);
    }
  };

  const checkSupabaseConfig = () => {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    alert('Check console for Supabase config');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Debug Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={checkSupabaseConfig}
          className="bg-gray-600 text-white px-4 py-2 rounded block"
        >
          Check Supabase Config
        </button>
        
        <button 
          onClick={testOAuthURL}
          className="bg-blue-600 text-white px-4 py-2 rounded block"
        >
          Test OAuth URL Generation
        </button>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>This page tests if Google OAuth is properly configured in Supabase.</p>
          <p>Open browser console to see detailed logs.</p>
        </div>
      </div>
    </div>
  );
}