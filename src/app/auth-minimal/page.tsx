'use client';

import { useState } from 'react';

export default function MinimalAuthPage() {
  const [message, setMessage] = useState('Ready to test...');

  const testBasicAuth = async () => {
    try {
      setMessage('Testing basic fetch...');
      
      // Simple fetch test without any eval
      const response = await fetch('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setMessage('✅ Basic auth test passed');
      } else {
        setMessage('❌ Basic auth test failed');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    }
  };

  const testSupabaseMinimal = async () => {
    try {
      setMessage('Testing minimal Supabase...');
      
      // Import Supabase dynamically to avoid build-time issues
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = 'https://csbwewirwzeitavhvykr.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8';
      
      const client = createClient(supabaseUrl, supabaseKey);
      
      // Simple auth test
      const { error } = await client.auth.getSession();
      
      if (error) {
        setMessage(`❌ Supabase error: ${error.message}`);
      } else {
        setMessage('✅ Supabase connection successful');
      }
    } catch (error) {
      setMessage(`❌ Supabase test failed: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Minimal Auth Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Status:</h2>
        <pre className="whitespace-pre-wrap">{message}</pre>
      </div>

      <div className="space-y-4">
        <button
          onClick={testBasicAuth}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg block w-full"
        >
          Test Basic Fetch
        </button>
        
        <button
          onClick={testSupabaseMinimal}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg block w-full"
        >
          Test Supabase Connection
        </button>
      </div>

      <div className="mt-8 bg-yellow-100 p-4 rounded">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <p>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'}</p>
        <p>CSP Meta Tag: {typeof document !== 'undefined' ? (document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? 'Found' : 'Not found') : 'Unknown'}</p>
      </div>
    </div>
  );
}
