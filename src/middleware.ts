import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();
  
  // AGGRESSIVELY REMOVE ALL SECURITY HEADERS
  const headersToRemove = [
    'content-security-policy',
    'content-security-policy-report-only',
    'x-content-security-policy',
    'x-webkit-csp',
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
    'feature-policy',
    'x-xss-protection',
    'x-permitted-cross-domain-policies'
  ];
  
  headersToRemove.forEach(header => {
    response.headers.delete(header);
  });
  
  // Force a completely permissive CSP
  response.headers.set('content-security-policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src *; connect-src *; media-src *; object-src *; child-src *; frame-src *; worker-src *; frame-ancestors *; form-action *;");
  
  // Add debug headers
  response.headers.set('x-csp-debug', 'ultra-permissive');
  response.headers.set('x-middleware-run', 'true');
  
  return response;
}

export const config = {
  matcher: [
    // Apply to all routes including the root
    '/(.*)',
  ],
};