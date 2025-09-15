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
  '/signup',
  '/lists'  // Temporarily allow lists access for testing
]);

// API routes that should be accessible (will handle their own auth if needed)
const API_ROUTES = ['/api/'];

// Development routes that should be accessible without auth
const DEV_ROUTES = ['/logs-dashboard', '/dev-test', '/test-auth-debug'];

// Helper: check if path is an API route
function isApiRoute(pathname: string) {
  return API_ROUTES.some(route => pathname.startsWith(route));
}

// Helper: check if path is a development route
function isDevRoute(pathname: string) {
  return DEV_ROUTES.some(route => pathname.startsWith(route));
}

// Legacy auth routes list (kept in case of future branching)
const AUTH_ROUTES = ['/signin', '/signup'];

// Helper: detect any Supabase auth cookie variants
function hasSupabaseAuthCookie(req: NextRequest) {
  const cookies = req.cookies.getAll();
  const authCookies = cookies.filter(c => {
    const n = c.name;
    // Standard pattern sb-<project-ref>-auth-token (and numbered refresh tokens)
    if (n.startsWith('sb-') && (n.includes('-auth-token') || n.includes('-refresh-token'))) return true;
    // Fallback older generic name (rare)
    if (n === 'supabase-auth-token') return true;
    return false;
  });
  
  // Check if we have at least an auth token with a valid value
  const hasValidAuthToken = authCookies.some(c => 
    c.name.includes('-auth-token') && c.value && c.value.length > 10
  );
  
  return hasValidAuthToken;
}

export function updateSession(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Normalize: strip trailing slash except root
    const cleanPath = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    // Add debug headers for troubleshooting
    const userAgent = request.headers.get('user-agent') || '';
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // Loop guard: if a prior redirect count header exceeds threshold, allow pass-through
    const loopCount = Number(request.headers.get('x-auth-loop-count') || '0');
    if (loopCount > 5) {
      console.log(`🛑 [MIDDLEWARE] Loop guard triggered for ${cleanPath}, reqId: ${requestId}`);
      return NextResponse.next({
        headers: { 'x-auth-loop-bypass': '1', 'x-request-id': requestId }
      });
    }

    const authed = hasSupabaseAuthCookie(request);
    
    console.log(`🔍 [MIDDLEWARE] ${cleanPath} | Auth: ${authed} | Loops: ${loopCount} | ReqId: ${requestId}`);

    // If authenticated user hits the landing page '/', send them to dashboard
    if (authed && cleanPath === '/') {
      console.log(`🏠 [MIDDLEWARE] Redirecting authed user from root to dashboard, reqId: ${requestId}`);
      const url = new URL('/dashboard', request.url);
      const res = NextResponse.redirect(url, 307);
      res.headers.set('x-auth-redirect', 'root-to-dashboard');
      res.headers.set('x-request-id', requestId);
      return res;
    }

    // Always allow explicit public routes, API routes, and development routes
    if (PUBLIC_ROUTES.has(cleanPath) || isApiRoute(cleanPath) || isDevRoute(cleanPath)) {
      console.log(`✅ [MIDDLEWARE] Allowing public/API route: ${cleanPath}, reqId: ${requestId}`);
      return NextResponse.next({ headers: { 'x-auth-route': 'public', 'x-auth-user-cookie': authed ? '1':'0', 'x-request-id': requestId } });
    }

    const isAuthRoute = AUTH_ROUTES.some(r => cleanPath.startsWith(r));

    // Not authenticated & not an auth/public route => redirect to /signin
    if (!authed && !isAuthRoute) {
      console.log(`🔐 [MIDDLEWARE] Redirecting unauthed user to signin: ${cleanPath}, reqId: ${requestId}`);
      const url = new URL('/signin', request.url);
      const res = NextResponse.redirect(url, 307);
      res.headers.set('x-auth-redirect', 'signin');
      res.headers.set('x-auth-loop-count', String(loopCount + 1));
      res.headers.set('x-request-id', requestId);
      return res;
    }

    // Authenticated user hitting an auth route => send to dashboard
    if (authed && isAuthRoute) {
      console.log(`📱 [MIDDLEWARE] Redirecting authed user from auth route to dashboard: ${cleanPath}, reqId: ${requestId}`);
      const url = new URL('/dashboard', request.url);
      const res = NextResponse.redirect(url, 302); // Use 302 instead of 307 to prevent browser caching
      res.headers.set('x-auth-redirect', 'dashboard');
      res.headers.set('x-auth-loop-count', String(loopCount + 1));
      res.headers.set('x-request-id', requestId);
      res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res;
    }

    console.log(`🎯 [MIDDLEWARE] Allowing protected route: ${cleanPath}, reqId: ${requestId}`);
    return NextResponse.next({
      headers: {
        'x-auth-route': 'protected',
        'x-auth-user-cookie': authed ? '1' : '0',
        'x-request-id': requestId
      }
    });
  } catch (e) {
    console.error('[middleware:updateSession] edge-safe auth check failed', e);
    return NextResponse.next({ headers: { 'x-auth-error': '1' } });
  }
}
