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

import Button from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { Chrome } from 'lucide-react';
import { oauthLogger, LogLevel } from '@/utils/logger';

export default function OauthSignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      
      await oauthLogger.info('🚀 [OAUTH] Google OAuth sign-in initiated', {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        currentOrigin: window.location.origin,
        redirectUrl: `${window.location.origin}/auth/callback`,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      await oauthLogger.info('🔍 [OAUTH] Supabase OAuth response received', { 
        data, 
        error,
        hasData: !!data,
        hasError: !!error
      });

      if (error) {
        await oauthLogger.error('❌ [OAUTH] Google OAuth error', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error,
          userEmail: 'N/A - during sign-in',
          provider: 'google'
        });
        alert('Error signing in with Google. Please try again.');
      } else if (data?.url) {
        await oauthLogger.info('✅ [OAUTH] OAuth redirect initiated', {
          redirectUrl: data.url,
          provider: 'google'
        });
      }
    } catch (error) {
      await oauthLogger.error('❌ [OAUTH] Critical OAuth error', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        provider: 'google'
      });
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleGoogleSignIn}
        className="w-full bg-white border border-gray-300 rounded-xl px-6 py-4 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <div className="flex items-center justify-center gap-3">
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span className="font-medium text-gray-700">
            {isSubmitting ? 'Signing in...' : 'Continue with Google'}
          </span>
        </div>
      </button>
    </div>
  );
}
