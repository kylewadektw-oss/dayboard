/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * (Lightweight edge-safe middleware version)
 */

import { type NextRequest, NextResponse } from 'next/server';

// Public routes that never require auth
const PUBLIC_ROUTES = new Set([
  '/',
  '/auth/callback',
  '/auth/reset_password'
]);

// Auth routes (signin/signup) that should be skipped when unauthenticated
const AUTH_ROUTES = ['/signin', '/signup'];

/**
 * Edge-safe session/update check WITHOUT importing supabase-js (removes build warnings).
 * We only look for the presence of Supabase auth cookies (sb-*-auth-token pattern).
 */
export function updateSession(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Early allow auth routes explicitly to avoid accidental loops
    const isAuthRoute = AUTH_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
    if (isAuthRoute) return NextResponse.next();

    // Allow public assets / public routes early
    if (PUBLIC_ROUTES.has(pathname)) {
      return NextResponse.next();
    }

    // Detect any Supabase auth cookie. Format: sb-<project-ref>-auth-token
    const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

    if (!hasAuthCookie) {
      if (pathname !== '/signin') {
        return NextResponse.redirect(new URL('/signin', request.url));
      }
      return NextResponse.next();
    }

    // If authenticated and hits auth route (handled above) we would redirect, but already returned.
    return NextResponse.next();
  } catch (e) {
    // Fail open (no hard block) to prevent lockouts if cookie parsing logic changes
    console.error('[middleware:updateSession] edge-safe auth check failed', e);
    return NextResponse.next();
  }
}
