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
import { createClient } from '@/utils/supabase/client';

export default function TestDatabaseConnection() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Test basic connection
      const { data: tables, error: tableError } = await (supabase as any)
        .from('application_logs')
        .select('*')
        .limit(10);
      
      if (tableError) {
        throw new Error(`Table query failed: ${tableError.message}`);
      }
      
      setResults(tables || []);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const insertTestLog = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      const testLog = {
        user_id: null, // Allow null for testing
        session_id: 'test-session-' + Date.now(),
        level: 'info',
        message: 'Test log entry from database connection test',
        component: 'TestDatabaseConnection',
        data: { test: true, timestamp: new Date().toISOString() },
        stack_trace: null,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        side: 'client'
      };
      
      const { data, error } = await (supabase as any)
        .from('application_logs')
        .insert([testLog])
        .select();
      
      if (error) {
        throw new Error(`Insert failed: ${error.message}`);
      }
      
      setResults([...results, ...(data || [])]);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔌 Database Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Read Connection'}
            </button>
            
            <button
              onClick={insertTestLog}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Inserting...' : 'Insert Test Log'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Results ({results.length} logs):</h3>
            
            {results.length === 0 ? (
              <p className="text-gray-700 font-medium">No logs found. Try inserting a test log or check your database connection.</p>
            ) : (
              <div className="space-y-2">
                {results.map((log, index) => (
                  <div key={index} className="bg-gray-50 border rounded p-3 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className="text-gray-700 font-medium">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-medium">{log.message}</div>
                    {log.component && (
                      <div className="text-gray-600 mt-1">Component: {log.component}</div>
                    )}
                    {log.side && (
                      <div className="text-gray-600">Side: {log.side}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
