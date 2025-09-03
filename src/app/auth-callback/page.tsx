'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Processing OAuth callback...');
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setMessage(`❌ OAuth error: ${error}`);
      return;
    }

    if (code && state === 'direct-auth-test') {
      setMessage(`✅ Direct OAuth successful! Authorization code received: ${code.substring(0, 20)}...`);
      
      // Here you would normally exchange the code for tokens
      // But for testing, we just confirm we got the code without CSP issues
      
    } else {
      setMessage('❌ Invalid callback - missing code or state');
    }
  }, [searchParams]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">OAuth Callback</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Callback Status:</h2>
        <pre className="whitespace-pre-wrap">{message}</pre>
      </div>

      <div className="bg-green-100 p-4 rounded">
        <h3 className="font-bold mb-2">Success!</h3>
        <p className="text-sm">
          If you see this page with a success message, it means the direct OAuth flow 
          worked without CSP violations. The issue was likely with Supabase's client library.
        </p>
      </div>

      <div className="mt-6">
        <a 
          href="/direct-auth" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg inline-block"
        >
          ← Back to Direct Auth Test
        </a>
      </div>
    </div>
  );
}
