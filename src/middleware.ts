import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Get the response
  const response = NextResponse.next();
  
  // COMPLETELY REMOVE ALL CSP - DON'T SET ANY CSP AT ALL
  response.headers.delete('content-security-policy');
  response.headers.delete('content-security-policy-report-only');
  response.headers.delete('x-content-security-policy');
  response.headers.delete('x-webkit-csp');
  
  // DO NOT set any CSP - let it be completely unrestricted
  // This should allow eval() if there's no external CSP source
  
  // Add debug header to verify middleware is running
  response.headers.set('x-csp-override', 'disabled-completely');
  response.headers.set('x-debug-middleware', 'running');
  
  return response;
}

export const config = {
  matcher: [
    // Apply to all routes including the root
    '/(.*)',
  ],
};