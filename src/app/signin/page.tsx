"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showHouseholdCode, setShowHouseholdCode] = useState(false);
  const [householdCode, setHouseholdCode] = useState('');
  
  // Check for household code in URL params (for invitation links)
  const inviteCode = searchParams.get('code');

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/profile');
      }
    };
    checkUser();

    // Set household code from URL if present
    if (inviteCode) {
      setHouseholdCode(inviteCode);
      setShowHouseholdCode(true);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // If there's a household code, store it in session storage for after profile setup
        if (householdCode && householdCode.trim()) {
          sessionStorage.setItem('pending_household_code', householdCode.trim().toUpperCase());
        }
        router.push('/profile');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, inviteCode, householdCode]);

  const handleGoogleSignIn = async () => {
    try {
      console.log('Attempting Google sign in...');
      
      // Store household code in session storage if provided
      if (householdCode && householdCode.trim()) {
        sessionStorage.setItem('pending_household_code', householdCode.trim().toUpperCase());
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('Sign in response:', { data, error });
      
      if (error) {
        console.error('Error signing in:', error.message);
        alert(`Error signing in: ${error.message}`);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Dayboard</h1>
          <p className="text-gray-600">Your household command center</p>
        </div>

        {/* Household Code Section */}
        {inviteCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">🏠 You&apos;ve been invited!</h3>
            <p className="text-sm text-blue-700 mb-3">
              You&apos;ve been invited to join a household. Sign in to complete your request.
            </p>
            <div className="bg-white border border-blue-300 rounded px-3 py-2 font-mono text-center text-lg font-bold text-blue-900 tracking-wider">
              {inviteCode}
            </div>
          </div>
        )}

        {!inviteCode && showHouseholdCode && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">👨‍👩‍👧‍👦 Join a Household</h3>
            <p className="text-sm text-gray-600 mb-3">
              Have a household code? Enter it below to join after signing in.
            </p>
            <input
              type="text"
              value={householdCode}
              onChange={(e) => setHouseholdCode(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-center text-lg tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="XXXXXXXX"
              maxLength={8}
            />
          </div>
        )}
        
        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>

          {/* Toggle household code input */}
          {!inviteCode && !showHouseholdCode && (
            <button
              onClick={() => setShowHouseholdCode(true)}
              className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
            >
              Have a household code? Click here to enter it
            </button>
          )}

          {!inviteCode && showHouseholdCode && (
            <button
              onClick={() => {
                setShowHouseholdCode(false);
                setHouseholdCode('');
              }}
              className="w-full text-gray-500 hover:text-gray-600 text-sm py-2"
            >
              Skip for now
            </button>
          )}
          
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">🏠 Organize your family life in one place</p>
            <div className="flex justify-center space-x-4 text-xs">
              <span>📅 Meal Planning</span>
              <span>📋 Projects</span>
              <span>👨‍👩‍👧‍👦 Profiles</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-400 text-center">
              By continuing, you agree to create an account and join/create a household for shared family organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
