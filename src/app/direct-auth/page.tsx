'use client';

import { useState } from 'react';

export default function DirectAuthPage() {
  const [message, setMessage] = useState('Ready to test direct auth...');
  const [loading, setLoading] = useState(false);

  const testDirectGoogleAuth = () => {
    try {
      setLoading(true);
      setMessage('Testing direct Google OAuth...');
      
      // Direct Google OAuth without Supabase client
      const googleClientId = '1020647069536-8rkk7dvrgr3jrg57ol5t24kcq1bujthp.apps.googleusercontent.com';
      const redirectUri = `${window.location.origin}/auth-callback`;
      const scope = 'openid email profile';
      const responseType = 'code';
      const state = 'direct-auth-test';
      
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${responseType}&` +
        `state=${state}`;
      
      setMessage('✅ Redirecting to Google OAuth...');
      window.location.href = authUrl;
      
    } catch (error) {
      setMessage(`❌ Direct auth error: ${error}`);
      setLoading(false);
    }
  };

  const testSimpleSupabase = async () => {
    try {
      setLoading(true);
      setMessage('Testing simple Supabase without OAuth...');
      
      // Test basic Supabase connection without auth
      const response = await fetch('https://csbwewirwzeitavhvykr.supabase.co/rest/v1/', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setMessage('✅ Supabase REST API working');
      } else {
        setMessage(`❌ Supabase error: ${response.status}`);
      }
      
    } catch (error) {
      setMessage(`❌ Supabase test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Direct Auth Test (No Supabase Client)</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Status:</h2>
        <pre className="whitespace-pre-wrap">{message}</pre>
      </div>

      <div className="space-y-4">
        <button
          onClick={testDirectGoogleAuth}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg block w-full disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct Google OAuth (No Supabase)'}
        </button>
        
        <button
          onClick={testSimpleSupabase}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg block w-full disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Supabase REST API (No Client)'}
        </button>
      </div>

      <div className="mt-8 bg-yellow-100 p-4 rounded">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Unknown'}</p>
        <p>Origin: {typeof window !== 'undefined' ? window.location.origin : 'Unknown'}</p>
        <p>CSP Meta: {typeof document !== 'undefined' ? 
          (document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? 'Found' : 'Not found') : 
          'Unknown'}</p>
      </div>

      <div className="mt-6 bg-blue-100 p-4 rounded">
        <h3 className="font-bold mb-2">Theory:</h3>
        <p className="text-sm">
          The CSP error might be coming from the Supabase client library's OAuth implementation.
          This page tests direct OAuth without the Supabase client to isolate the issue.
        </p>
      </div>
    </div>
  );
}
