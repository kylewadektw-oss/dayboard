"use client";

import { useEffect, useState } from 'react';

export default function CSPDebugPage() {
  const [evalResult, setEvalResult] = useState<string>('Testing...');
  const [headers, setHeaders] = useState<string>('Loading headers...');

  useEffect(() => {
    // Test eval() functionality - only in browser, not during build
    if (typeof window !== 'undefined') {
      try {
        // Use indirect eval to avoid static analysis issues
        const globalEval = window.eval;
        const result = globalEval('2 + 2');
        setEvalResult(`✅ eval() works! Result: ${result}`);
      } catch (error) {
        setEvalResult(`❌ eval() blocked: ${error}`);
      }
    } else {
      setEvalResult('⏳ Running on server side...');
    }

    // Check response headers
    fetch(window.location.href)
      .then(response => {
        const headerInfo = [];
        headerInfo.push(`CSP: ${response.headers.get('content-security-policy') || 'NOT SET'}`);
        headerInfo.push(`X-CSP-Override: ${response.headers.get('x-csp-override') || 'NOT SET'}`);
        headerInfo.push(`X-Debug-Middleware: ${response.headers.get('x-debug-middleware') || 'NOT SET'}`);
        setHeaders(headerInfo.join('\n'));
      })
      .catch(error => {
        setHeaders(`Error checking headers: ${error}`);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CSP Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Eval Test:</h2>
        <pre>{evalResult}</pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Response Headers:</h2>
        <pre className="whitespace-pre-wrap">{headers}</pre>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h2 className="font-bold mb-2">Instructions:</h2>
        <p>
          1. Check the eval test result above<br/>
          2. Look at the response headers to see if middleware is working<br/>
          3. Open browser developer tools and check for CSP errors
        </p>
      </div>
    </div>
  );
}
