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

import { useState } from 'react';

export default function SimpleOAuthTest() {
  const [result, setResult] = useState(
    'OAuth testing is currently disabled. Authentication can be set up later.'
  );

  const testOAuth = async () => {
    setResult(
      '🚧 OAuth Testing Disabled\n\nOAuth authentication has been temporarily disabled.\nYou can set up authentication providers later when needed.'
    );
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex flex-wrap gap-3">
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          ← Back to Dashboard
        </a>
        <a
          href="/auth-debug"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          🛡️ Auth Debug
        </a>
      </div>
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
        <h3 className="font-semibold text-yellow-800 mb-2">
          ℹ️ OAuth Disabled
        </h3>
        <p className="text-sm text-yellow-700">
          OAuth authentication has been removed to simplify development. You can
          configure authentication providers later when needed.
        </p>
      </div>
    </div>
  );
}
