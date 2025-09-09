/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * (Lightweight edge-safe middleware version with loop guard)
 */

import { type NextRequest, NextResponse } from 'next/server';

// Public routes that never require auth (now includes signin/signup to prevent loops)
const PUBLIC_ROUTES = new Set([
  '/',
  '/auth/callback',
  '/auth/reset_password',
  '/signin',
  '/signup'
]);

// Legacy auth routes list (kept in case of future branching)
const AUTH_ROUTES = ['/signin', '/signup'];

// Helper: detect any Supabase auth cookie variants
function hasSupabaseAuthCookie(req: NextRequest) {
  const cookies = req.cookies.getAll();
  return cookies.some(c => {
    const n = c.name;
    // Standard pattern sb-<project-ref>-auth-token (and numbered refresh tokens)
    if (n.startsWith('sb-') && n.includes('-auth-token')) return true;
    // Fallback older generic name (rare)
    if (n === 'supabase-auth-token') return true;
    return false;
  });
}

export function updateSession(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Normalize: strip trailing slash except root
    const cleanPath = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    // Loop guard: if a prior redirect count header exceeds threshold, allow pass-through
    const loopCount = Number(request.headers.get('x-auth-loop-count') || '0');
    if (loopCount > 5) {
      return NextResponse.next({
        headers: { 'x-auth-loop-bypass': '1' }
      });
    }

    const authed = hasSupabaseAuthCookie(request);

    // If authenticated user hits the landing page '/', send them to dashboard
    if (authed && cleanPath === '/') {
      const url = new URL('/dashboard', request.url);
      const res = NextResponse.redirect(url, 307);
      res.headers.set('x-auth-redirect', 'root-to-dashboard');
      return res;
    }

    // Always allow explicit public routes
    if (PUBLIC_ROUTES.has(cleanPath)) {
      return NextResponse.next({ headers: { 'x-auth-route': 'public', 'x-auth-user-cookie': authed ? '1':'0' } });
    }

    const isAuthRoute = AUTH_ROUTES.some(r => cleanPath.startsWith(r));

    // Not authenticated & not an auth/public route => redirect to /signin
    if (!authed && !isAuthRoute) {
      const url = new URL('/signin', request.url);
      const res = NextResponse.redirect(url, 307);
      res.headers.set('x-auth-redirect', 'signin');
      res.headers.set('x-auth-loop-count', String(loopCount + 1));
      return res;
    }

    // Authenticated user hitting an auth route => send to dashboard
    if (authed && isAuthRoute) {
      const url = new URL('/dashboard', request.url);
      const res = NextResponse.redirect(url, 307);
      res.headers.set('x-auth-redirect', 'dashboard');
      res.headers.set('x-auth-loop-count', String(loopCount + 1));
      return res;
    }

    return NextResponse.next({
      headers: {
        'x-auth-route': 'protected',
        'x-auth-user-cookie': authed ? '1' : '0'
      }
    });
  } catch (e) {
    console.error('[middleware:updateSession] edge-safe auth check failed', e);
    return NextResponse.next({ headers: { 'x-auth-error': '1' } });
  }
}
