import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();
  
  // FORCEFULLY REMOVE ALL CSP HEADERS
  response.headers.delete('content-security-policy');
  response.headers.delete('content-security-policy-report-only');
  response.headers.delete('x-content-security-policy');
  response.headers.delete('x-webkit-csp');
  
  // Set a completely permissive CSP to override any external ones
  response.headers.set(
    'content-security-policy',
    "default-src * 'unsafe-eval' 'unsafe-inline'; script-src * 'unsafe-eval' 'unsafe-inline'; style-src * 'unsafe-inline'; img-src * data: blob:; connect-src *; frame-src *; font-src *; object-src *; media-src *; child-src *; worker-src *; base-uri *;"
  );
  
  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};