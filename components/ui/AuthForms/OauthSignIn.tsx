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
    <div className="space-y-3">
      <Button
        variant="slim"
        type="button"
        loading={isSubmitting}
        onClick={handleGoogleSignIn}
        className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center justify-center gap-3">
          <Chrome className="w-5 h-5 text-blue-500" />
          <span className="font-medium">Continue with Google</span>
        </div>
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Secure authentication powered by Google OAuth 2.0
        </p>
      </div>
    </div>
  );
}
