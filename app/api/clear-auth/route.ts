/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * API endpoint to forcefully clear all auth cookies
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧹 [CLEAR-AUTH] Starting aggressive auth clearing process');

    const response = NextResponse.redirect(
      new URL('/signin', 'http://localhost:3000')
    );

    // Even more aggressive cookie clearing - all possible variations
    const cookiesToClear = [
      // Current problematic cookies from terminal logs
      'sb-127-auth-token-code-verifier',
      'sb-localhost-auth-token-code-verifier',
      'sb-csbwewirwzeitavhvykr-auth-token.0',
      'sb-csbwewirwzeitavhvykr-auth-token.1',
      'sb-csbwewirwzeitavhvykr-auth-token-code-verifier',

      // All possible variations
      'sb-127-auth-token',
      'sb-127-auth-token.0',
      'sb-127-auth-token.1',
      'sb-127-refresh-token',
      'sb-localhost-auth-token',
      'sb-localhost-auth-token.0',
      'sb-localhost-auth-token.1',
      'sb-localhost-refresh-token',
      'sb-csbwewirwzeitavhvykr-auth-token',
      'sb-csbwewirwzeitavhvykr-refresh-token',

      // Generic fallbacks
      'supabase-auth-token',
      'supabase-refresh-token',
      'sb-access-token',
      'sb-refresh-token'
    ];

    console.log(
      `🧹 [CLEAR-AUTH] Clearing ${cookiesToClear.length} cookie types with multiple configurations`
    );

    cookiesToClear.forEach((cookieName) => {
      // Multiple clearing strategies to ensure removal

      // Strategy 1: HttpOnly secure
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });

      // Strategy 2: HttpOnly insecure for localhost
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: 'localhost',
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      });

      // Strategy 3: Non-HttpOnly (client-side accessible)
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        secure: false,
        sameSite: 'lax'
      });

      // Strategy 4: Different path variations
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/dashboard',
        secure: false,
        sameSite: 'lax'
      });

      // Strategy 5: Maxage approach
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        path: '/',
        secure: false,
        sameSite: 'lax'
      });
    });

    // Add aggressive cache prevention headers
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate, private'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('x-clear-auth-complete', '1');

    console.log(
      '✅ [CLEAR-AUTH] Aggressive cookie clearing complete, redirecting to signin'
    );

    return response;
  } catch (error) {
    console.error('❌ [CLEAR-AUTH] Error clearing cookies:', error);
    const response = NextResponse.redirect(
      new URL('/signin', 'http://localhost:3000')
    );
    response.headers.set('x-clear-auth-error', '1');
    return response;
  }
}
