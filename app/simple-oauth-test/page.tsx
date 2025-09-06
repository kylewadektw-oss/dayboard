'use client';

import { useState } from 'react';

export default function SimpleOAuthTest() {
  const [result, setResult] = useState('OAuth testing is currently disabled. Authentication can be set up later.');

  const testOAuth = async () => {
    setResult('🚧 OAuth Testing Disabled\n\nOAuth authentication has been temporarily disabled.\nYou can set up authentication providers later when needed.');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Test (Disabled)</h1>
      
      <button
        onClick={testOAuth}
        className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed mb-4"
        disabled
      >
        � OAuth Test (Disabled)
      </button>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Result:</h2>
        <pre className="text-sm whitespace-pre-wrap">{result}</pre>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ OAuth Disabled</h3>
        <p className="text-sm text-yellow-700">
          OAuth authentication has been removed to simplify development.
          You can configure authentication providers later when needed.
        </p>
      </div>
    </div>
  );
}
