'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackSuccess() {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      console.log('🔄 Auth callback success - checking for session');
      const supabase = createClient();
      
      // Force refresh the auth context
      console.log('🔄 Forcing auth context refresh...');
      await refreshUser();
      
      // Check if we have the session indicator cookie
      const hasSessionCookie = document.cookie.includes('sb-session-exists=true');
      console.log('🍪 Session cookie present:', hasSessionCookie);
      
      // Wait a bit for session to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Check for session multiple times with retries
        let session = null;
        let attempts = 0;
        const maxAttempts = 8; // Increased attempts
        
        while (!session && attempts < maxAttempts) {
          attempts++;
          console.log(`🔍 Session check attempt ${attempts}/${maxAttempts}`);
          
          // Try both getSession and getUser
          const [sessionResult, userResult] = await Promise.all([
            supabase.auth.getSession(),
            supabase.auth.getUser()
          ]);
          
          if (sessionResult.data?.session) {
            session = sessionResult.data.session;
            console.log('✅ Session found via getSession!', {
              userId: session.user?.id,
              hasTokens: !!(session.access_token && session.refresh_token)
            });
            break;
          } else if (userResult.data?.user) {
            console.log('✅ User found via getUser - creating session context', {
              userId: userResult.data.user.id
            });
            // User exists but session might not be fully loaded yet
            if (attempts >= 3) {
              // After a few attempts, proceed anyway
              console.log('🎯 Proceeding with user data even without full session');
              break;
            }
          } else if (sessionResult.error) {
            console.error('❌ Session check error:', sessionResult.error);
          }
          
          // Wait longer between retries for later attempts
          const waitTime = attempts < 3 ? 500 : 1000;
          console.log(`⏳ No session yet, waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        if (session || hasSessionCookie) {
          console.log('🎉 Authentication confirmed, redirecting to dashboard');
          // Clear the session indicator cookie
          document.cookie = 'sb-session-exists=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          // Force one more auth refresh before redirecting
          await refreshUser();
          // Use router.push for client-side navigation
          router.push('/dashboard');
        } else {
          console.log('❌ No session found after retries, redirecting to signin');
          router.push('/signin?error=session_timeout');
        }
      } catch (error) {
        console.error('💥 Session check failed:', error);
        router.push('/signin?error=session_failed');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkSessionAndRedirect();
  }, [router, refreshUser]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">
          {isChecking ? 'Verifying your session...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}