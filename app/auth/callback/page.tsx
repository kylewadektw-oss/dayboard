'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();
      
      try {
        console.log('🔄 [CLIENT] Processing OAuth callback');
        console.log('🔍 [CLIENT] Current URL:', window.location.href);
        
        setStatus('Processing OAuth callback...');

        // Check if there's an error in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlHash = new URLSearchParams(window.location.hash.replace('#', ''));
        
        const error = urlParams.get('error') || urlHash.get('error');
        const errorDescription = urlParams.get('error_description') || urlHash.get('error_description');
        
        if (error) {
          console.error('❌ [CLIENT] OAuth error in URL:', { error, errorDescription });
          setError(`OAuth error: ${error} - ${errorDescription || 'No description provided'}`);
          setStatus('OAuth authentication failed');
          
          setTimeout(() => {
            router.push(`/signin?error=${error}&message=${encodeURIComponent(errorDescription || 'OAuth authentication failed')}`);
          }, 3000);
          return;
        }

        // Check for auth code or tokens in URL
        const code = urlParams.get('code');
        const accessToken = urlHash.get('access_token');
        
        console.log('🔍 [CLIENT] URL parameters:', { 
          hasCode: !!code, 
          hasAccessToken: !!accessToken,
          codeLength: code?.length,
          searchParams: Array.from(urlParams.entries()),
          hashParams: Array.from(urlHash.entries())
        });

        setStatus('Establishing session...');

        // Wait a moment for Supabase to automatically process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to get the session multiple times with delays
        let session = null;
        const maxAttempts = 5;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`🔍 [CLIENT] Session check attempt ${attempt}/${maxAttempts}`);
          setStatus(`Verifying session (${attempt}/${maxAttempts})...`);
          
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error(`❌ [CLIENT] Session error on attempt ${attempt}:`, sessionError);
          } else if (data.session) {
            session = data.session;
            console.log('✅ [CLIENT] Session found!', {
              userId: session.user.id,
              email: session.user.email,
              hasTokens: !!(session.access_token && session.refresh_token)
            });
            break;
          }
          
          // Wait between attempts
          if (attempt < maxAttempts) {
            const delay = attempt * 500;
            console.log(`⏳ [CLIENT] Waiting ${delay}ms before next attempt`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

        if (session) {
          setStatus('Authentication successful! Redirecting...');
          
          // Redirect to success page for final processing
          setTimeout(() => {
            router.push('/auth/success');
          }, 1000);
        } else {
          console.warn('⚠️ [CLIENT] No session found after all attempts');
          setStatus('Session could not be established');
          setError('Authentication completed but no session was created');
          
          setTimeout(() => {
            router.push('/signin?error=SessionError&message=Session could not be established after OAuth callback');
          }, 3000);
        }
      } catch (err) {
        console.error('💥 [CLIENT] Unexpected error during auth callback:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Unexpected error occurred');
        
        setTimeout(() => {
          router.push('/signin?error=UnexpectedError&message=An unexpected error occurred during authentication');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="relative mb-6">
          {error ? (
            // Error icon
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 text-red-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          ) : (
            // Loading animation
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-3">
          {error ? 'Authentication Error' : 'Processing Authentication'}
        </h2>
        
        <p className="text-gray-300 mb-4 leading-relaxed">
          {status}
        </p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          {error ? 'Redirecting to sign-in page...' : 'Please wait while we complete your authentication'}
        </div>
      </div>
    </div>
  );
}