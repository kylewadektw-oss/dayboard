import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Get the response
  const response = NextResponse.next();
  
  // COMPLETELY REMOVE ALL CSP AND SECURITY HEADERS
  response.headers.delete('content-security-policy');
  response.headers.delete('content-security-policy-report-only');
  response.headers.delete('x-content-security-policy');
  response.headers.delete('x-webkit-csp');
  response.headers.delete('strict-transport-security');
  response.headers.delete('x-frame-options');
  response.headers.delete('x-content-type-options');
  response.headers.delete('referrer-policy');
  response.headers.delete('permissions-policy');
  
  // Explicitly set a permissive CSP that allows everything
  response.headers.set('content-security-policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src *; connect-src *; media-src *; object-src *; child-src *; frame-src *; worker-src *; frame-ancestors *; form-action *; upgrade-insecure-requests");
  
  return response;
}

export const config = {
  matcher: [
    // Apply to all routes including the root
    '/(.*)',
  ],
};