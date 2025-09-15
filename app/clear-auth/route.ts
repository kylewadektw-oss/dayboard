import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Create a response that clears all Supabase auth cookies
  const response = NextResponse.redirect(new URL('/signin', request.url));
  
  // Clear all possible Supabase auth cookies
  const cookieOptions = {
    expires: new Date(0),
    path: '/',
    domain: undefined,
    secure: false,
    httpOnly: false,
    sameSite: 'lax' as const
  };
  
  // Clear common Supabase cookie patterns
  response.cookies.set('sb-auth-token', '', cookieOptions);
  response.cookies.set('supabase-auth-token', '', cookieOptions);
  
  // Clear any sb-*-auth-token patterns (try common project patterns)
  const commonPatterns = [
    'sb-localhost-auth-token',
    'sb-3000-auth-token',
    'sb-dev-auth-token'
  ];
  
  commonPatterns.forEach(pattern => {
    response.cookies.set(pattern, '', cookieOptions);
  });
  
  // Also try to clear refresh tokens
  response.cookies.set('sb-refresh-token', '', cookieOptions);
  response.cookies.set('sb-localhost-refresh-token', '', cookieOptions);
  
  return response;
}