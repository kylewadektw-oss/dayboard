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

import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Shield, 
  Clock,
  Globe,
  Lock,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function AuthTestPage() {
  const { user, profile, loading, signOut, refreshUser } = useAuth();
  const [testResults, setTestResults] = useState<{[key: string]: boolean | null}>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const supabase = createClient();

  const runAuthTests = async () => {
    setIsRunningTests(true);
    const results: {[key: string]: boolean | null} = {};

    // Test 1: Check if user session exists
    try {
      const { data: { session } } = await supabase.auth.getSession();
      results.sessionExists = !!session;
    } catch {
      results.sessionExists = false;
    }

    // Test 2: Check if user data is accessible
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      results.userDataAccessible = !!authUser;
    } catch {
      results.userDataAccessible = false;
    }

    // Test 3: Check if profile exists in database
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        results.profileExists = !!data && !error;
      } catch {
        results.profileExists = false;
      }
    } else {
      results.profileExists = null;
    }

    // Test 4: Check if protected routes would be accessible
    try {
      const response = await fetch('/api/test-auth', { method: 'GET' });
      results.protectedRouteAccess = response.ok;
    } catch {
      results.protectedRouteAccess = false;
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setTestResults({});
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const TestResult = ({ test, result, description }: { 
    test: string; 
    result: boolean | null; 
    description: string; 
  }) => (
    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
      <div className="flex-shrink-0">
        {result === true && <CheckCircle className="h-5 w-5 text-green-500" />}
        {result === false && <XCircle className="h-5 w-5 text-red-500" />}
        {result === null && <div className="h-5 w-5 rounded-full bg-gray-300" />}
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{test}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <div className="text-sm font-medium">
        {result === true && <span className="text-green-600">PASS</span>}
        {result === false && <span className="text-red-600">FAIL</span>}
        {result === null && <span className="text-gray-400">N/A</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Test Dashboard
          </h1>
          <p className="text-gray-600">
            Verify that Google OAuth authentication is working correctly
          </p>
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Status
            </h2>
            <div className="flex items-center gap-2">
              {loading && <Clock className="h-4 w-4 animate-spin text-blue-500" />}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                loading 
                  ? 'bg-blue-100 text-blue-800' 
                  : user 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {loading ? 'Loading...' : user ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
          </div>

          {user ? (
            <div className="space-y-4">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">User ID</div>
                    <div className="font-medium text-gray-900 text-sm font-mono">
                      {user.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium text-gray-900">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Provider</div>
                    <div className="font-medium text-gray-900 capitalize">
                      {user.app_metadata?.provider || 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Last Sign In</div>
                    <div className="font-medium text-gray-900">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleString()
                        : 'Unknown'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              {profile && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Profile Data</h3>
                  <div className="text-sm text-green-700">
                    <div>Display Name: {profile.name || 'Not set'}</div>
                    <div>Role: {profile.role || 'Not set'}</div>
                    <div>Created: {profile.created_at ? new Date(profile.created_at).toLocaleString() : 'Not set'}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={refreshUser}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh User Data
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Not Authenticated</h3>
              <p className="text-gray-600 mb-6">
                You need to sign in to test authentication functionality
              </p>
              <a
                href="/signin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shield className="h-4 w-4" />
                Go to Sign In
              </a>
            </div>
          )}
        </div>

        {/* Authentication Tests */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Authentication Tests</h2>
            <button
              onClick={runAuthTests}
              disabled={isRunningTests}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isRunningTests && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isRunningTests ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>

          <div className="space-y-4">
            <TestResult
              test="Session Exists"
              result={testResults.sessionExists}
              description="Checks if a valid authentication session is present"
            />
            
            <TestResult
              test="User Data Accessible"
              result={testResults.userDataAccessible}
              description="Verifies that user data can be retrieved from Supabase"
            />
            
            <TestResult
              test="Profile in Database"
              result={testResults.profileExists}
              description="Confirms that user profile exists in the profiles table"
            />
            
            <TestResult
              test="Protected Route Access"
              result={testResults.protectedRouteAccess}
              description="Tests if protected API routes are accessible with current auth"
            />
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Test Summary</h3>
              <div className="text-sm text-blue-700">
                Passed: {Object.values(testResults).filter(r => r === true).length} / 
                Total: {Object.values(testResults).filter(r => r !== null).length}
              </div>
            </div>
          )}
        </div>

        {/* Route Protection Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Protection Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-green-600">✅ Public Routes</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>/ (Landing page)</div>
                <div>/auth/callback (OAuth callback)</div>
                <div>/auth/reset_password (Password reset)</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2 text-red-600">🔒 Protected Routes</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>/dashboard (Main dashboard)</div>
                <div>/profile (User profile)</div>
                <div>/meals (Meal planning)</div>
                <div>/lists (List management)</div>
                <div>/projects (Project tracking)</div>
                <div>/work (Work management)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Testing Instructions</h2>
          <div className="space-y-2 text-sm text-amber-800">
            <div>1. <strong>Test Public Access:</strong> Visit the landing page (/) - should load without authentication</div>
            <div>2. <strong>Test Protection:</strong> Try accessing /dashboard - should redirect to /signin</div>
            <div>3. <strong>Test Authentication:</strong> Sign in with Google OAuth</div>
            <div>4. <strong>Test Access:</strong> After signing in, try accessing protected routes</div>
            <div>5. <strong>Run Tests:</strong> Use the &ldquo;Run Tests&rdquo; button to verify all functionality</div>
          </div>
        </div>
      </div>
    </div>
  );
}
