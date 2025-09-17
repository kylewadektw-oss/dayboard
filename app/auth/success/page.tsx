'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthSuccessPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Verifying session...');
  const { refreshUser, user, loading } = useAuth();
  
  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      console.log('🔄 Auth callback success - coordinating with auth context');
      setStatusMessage('Coordinating authentication state...');
      
      const supabase = createClient();
      
      try {
        // Step 1: If user is already authenticated via context, redirect immediately
        if (user && !loading) {
          console.log('✅ User already authenticated in context, redirecting');
          setStatusMessage('Authentication confirmed! Loading dashboard...');
          router.push('/dashboard');
          return;
        }
        
        // Step 2: Wait for auth context to finish loading if it's still initializing
        if (loading) {
          console.log('⏳ Waiting for auth context to finish initializing...');
          setStatusMessage('Waiting for authentication context...');
          // Wait for auth context to settle
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check again after waiting
          if (user) {
            console.log('✅ User authenticated during wait, redirecting');
            router.push('/dashboard');
            return;
          }
        }
        
        // Step 3: Force session refresh to trigger auth state change events
        console.log('🔄 Forcing session refresh to trigger auth state change');
        setStatusMessage('Refreshing authentication state...');
        await supabase.auth.refreshSession();
        
        // Step 4: Wait for auth state change events to propagate to context
        console.log('⏳ Waiting for auth state change to propagate...');
        setStatusMessage('Processing authentication events...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 5: Check session state with progressive retries
        let sessionFound = false;
        const maxAttempts = 6;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`🔍 Session verification attempt ${attempt}/${maxAttempts}`);
          setStatusMessage(`Verifying authentication (${attempt}/${maxAttempts})...`);
          
          // Check both Supabase session and auth context state
          const [sessionResult, userResult] = await Promise.all([
            supabase.auth.getSession(),
            supabase.auth.getUser()
          ]);
          
          const hasSession = !!sessionResult.data?.session;
          const hasUserData = !!userResult.data?.user && !userResult.error;
          const contextHasUser = !!user;
          
          console.log(`📊 Attempt ${attempt} status:`, {
            hasSession,
            hasUserData,
            contextHasUser,
            contextLoading: loading,
            sessionError: sessionResult.error?.message,
            userError: userResult.error?.message
          });
          
          // Success conditions
          if (contextHasUser) {
            console.log('✅ Auth context confirms user authentication');
            sessionFound = true;
            break;
          } else if (hasSession && hasUserData) {
            console.log('✅ Session confirmed, triggering context refresh');
            await refreshUser();
            // Wait a bit for context to update
            await new Promise(resolve => setTimeout(resolve, 500));
            sessionFound = true;
            break;
          } else if (hasUserData && attempt >= 4) {
            console.log('⚠️ Have user data but waiting for context sync - triggering refresh');
            await refreshUser();
            await new Promise(resolve => setTimeout(resolve, 500));
            sessionFound = true;
            break;
          }
          
          // Progressive wait times
          const waitTime = attempt <= 2 ? 500 : attempt <= 4 ? 800 : 1200;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        if (sessionFound) {
          console.log('🎉 Authentication verified - redirecting to dashboard');
          setStatusMessage('Authentication complete! Loading dashboard...');
          
          // Clear session indicator cookie if it exists
          document.cookie = 'sb-session-exists=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Final context refresh to ensure state is current
          if (!user) {
            await refreshUser();
            await new Promise(resolve => setTimeout(resolve, 400));
          }
          
          router.push('/dashboard');
          
        } else {
          // Failed to establish session
          console.log('❌ Authentication verification failed');
          setStatusMessage('Authentication verification failed');
          router.push('/signin?error=session_timeout&message=Authentication session could not be verified. Please sign in again.');
        }
        
      } catch (error) {
        console.error('💥 Authentication coordination failed:', error);
        setStatusMessage('Authentication error occurred');
        router.push('/signin?error=session_failed&message=Authentication error occurred. Please try again.');
      } finally {
        setIsChecking(false);
      }
    };
    
    // Start the check process
    checkSessionAndRedirect();
  }, [router, refreshUser, user, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="relative mb-6">
          {/* Animated authentication icon */}
          <div className="relative">
            {/* Outer ring */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 mx-auto"></div>
            {/* Middle ring */}
            <div className="absolute top-2 left-2 animate-spin rounded-full h-12 w-12 border-2 border-transparent border-l-green-400 border-b-blue-400" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
            {/* Inner pulsing core */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-3">
          Completing Authentication
        </h2>
        
        <p className="text-gray-300 mb-4 leading-relaxed">
          {isChecking ? statusMessage : 'Redirecting to dashboard...'}
        </p>
        
        <div className="text-sm text-gray-500">
          Coordinating with authentication system
        </div>
        
        {/* Multi-layer progress indicator */}
        <div className="mt-6 space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full animate-pulse w-4/5"></div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-0.5">
            <div className="bg-gradient-to-r from-green-400 to-blue-400 h-0.5 rounded-full animate-pulse w-3/5" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}