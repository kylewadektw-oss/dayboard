/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Complete logout and auth reset endpoint
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    console.log('🚪 [LOGOUT] Starting complete logout process');

    // Create Supabase client
    const supabase = await createClient();

    // Sign out from Supabase (this should clear server-side session)
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('❌ [LOGOUT] Supabase signout error:', signOutError);
    } else {
      console.log('✅ [LOGOUT] Supabase signout successful');
    }

    // Create response with redirect to signin
    const response = NextResponse.redirect(
      new URL('/signin', 'http://localhost:3000')
    );

    // Clear ALL possible auth cookies aggressively
    const cookiesToClear = [
      // Supabase cookies for different environments and project IDs
      'sb-127-auth-token',
      'sb-127-auth-token.0',
      'sb-127-auth-token.1',
      'sb-127-auth-token-code-verifier',
      'sb-127-refresh-token',
      'sb-localhost-auth-token',
      'sb-localhost-auth-token.0',
      'sb-localhost-auth-token.1',
      'sb-localhost-auth-token-code-verifier',
      'sb-localhost-refresh-token',
      'sb-csbwewirwzeitavhvykr-auth-token',
      'sb-csbwewirwzeitavhvykr-auth-token.0',
      'sb-csbwewirwzeitavhvykr-auth-token.1',
      'sb-csbwewirwzeitavhvykr-auth-token-code-verifier',
      'sb-csbwewirwzeitavhvykr-refresh-token',
      // Additional code verifier patterns we see in logs
      'sb-127-auth-token-code-verifier',
      'sb-localhost-auth-token-code-verifier',
      // Generic fallbacks
      'supabase-auth-token',
      'supabase-refresh-token',
      'sb-access-token',
      'sb-refresh-token',
      // Next.js session cookies
      'next-auth.session-token',
      'next-auth.csrf-token',
      // PKCE code verifiers and state cookies
      'sb-pkce-code-verifier',
      'sb-auth-state'
    ];

    console.log(`🧹 [LOGOUT] Clearing ${cookiesToClear.length} cookie types`);

    // Clear cookies with different configurations to ensure they're removed
    cookiesToClear.forEach((cookieName) => {
      // Default clear
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });

      // Clear with different domain configurations
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: 'localhost',
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      });

      // Clear without httpOnly (for client-side cookies)
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        secure: false,
        sameSite: 'lax'
      });

      // Clear for different paths
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/dashboard',
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      });
    });

    // Add headers to prevent caching
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('x-logout-complete', '1');

    console.log(
      '✅ [LOGOUT] Complete logout successful, redirecting to signin'
    );

    return response;
  } catch (error) {
    console.error('❌ [LOGOUT] Error during logout:', error);

    // Even if there's an error, still try to clear cookies and redirect
    const response = NextResponse.redirect(
      new URL('/signin', 'http://localhost:3000')
    );
    response.headers.set('x-logout-error', '1');

    return response;
  }
}

export async function POST() {
  // Allow both GET and POST for flexibility
  return GET();
}
