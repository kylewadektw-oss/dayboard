import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limiting store (for production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting (requests per window)
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // Auth rate limiting (more restrictive)
  AUTH_RATE_LIMIT: 5,
  AUTH_RATE_WINDOW: 5 * 60 * 1000, // 5 minutes
  
  // Sensitive routes requiring extra protection
  SENSITIVE_ROUTES: ['/credentials', '/api/credentials', '/profile', '/api/profile']
}

function getRateLimitKey(request: NextRequest): string {
  // Use X-Forwarded-For in production, fall back to IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return `rate_limit:${ip}`
}

function checkRateLimit(key: string, limit: number, window: number): boolean {
  const now = Date.now()
  const bucket = rateLimitStore.get(key)
  
  if (!bucket || bucket.resetTime < now) {
    // Reset or create new bucket
    rateLimitStore.set(key, { count: 1, resetTime: now + window })
    return true
  }
  
  if (bucket.count >= limit) {
    return false // Rate limit exceeded
  }
  
  bucket.count++
  return true
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams
  
  // Skip middleware for OAuth flows and Supabase auth callbacks
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.includes('/callback') ||
    pathname.includes('/oauth') ||
    searchParams.has('code') ||  // OAuth callback with code parameter
    searchParams.has('state') || // OAuth state parameter
    searchParams.has('error') || // OAuth error parameter
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }
  
  const isAuthRoute = pathname.includes('/signin')
  const isSensitiveRoute = SECURITY_CONFIG.SENSITIVE_ROUTES.some(route => 
    pathname.startsWith(route)
  )
  
  // Enhanced rate limiting for auth and sensitive routes
  const rateLimitKey = getRateLimitKey(request)
  let isAllowed = true
  
  if (isAuthRoute) {
    isAllowed = checkRateLimit(
      `auth:${rateLimitKey}`, 
      SECURITY_CONFIG.AUTH_RATE_LIMIT, 
      SECURITY_CONFIG.AUTH_RATE_WINDOW
    )
  } else if (isSensitiveRoute) {
    isAllowed = checkRateLimit(
      `sensitive:${rateLimitKey}`, 
      Math.floor(SECURITY_CONFIG.RATE_LIMIT_REQUESTS / 2), // Stricter for sensitive routes
      SECURITY_CONFIG.RATE_LIMIT_WINDOW
    )
  } else {
    isAllowed = checkRateLimit(
      rateLimitKey, 
      SECURITY_CONFIG.RATE_LIMIT_REQUESTS, 
      SECURITY_CONFIG.RATE_LIMIT_WINDOW
    )
  }
  
  if (!isAllowed) {
    return new NextResponse('Rate limit exceeded', { status: 429 })
  }

  // Handle trailing slashes - be less restrictive
  if (pathname.endsWith('/') && pathname !== '/' && pathname.length > 1) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(0, -1)
    return NextResponse.redirect(url)
  }

  // Security validation for sensitive routes (skip for auth flows)
  if (isSensitiveRoute && !isAuthRoute) {
    // Additional security checks for sensitive routes
    const userAgent = request.headers.get('user-agent')
    if (!userAgent || userAgent.length < 10) {
      return new NextResponse('Invalid request', { status: 400 })
    }
  }

  // Add comprehensive security headers
  const response = NextResponse.next()
  
  // Core security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Prevent DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Permissions policy (restrict dangerous features)
  response.headers.set('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', '))
  
  // Add rate limit headers
  const bucket = rateLimitStore.get(rateLimitKey)
  if (bucket) {
    response.headers.set('X-RateLimit-Limit', SECURITY_CONFIG.RATE_LIMIT_REQUESTS.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, SECURITY_CONFIG.RATE_LIMIT_REQUESTS - bucket.count).toString())
    response.headers.set('X-RateLimit-Reset', bucket.resetTime.toString())
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)  
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * And excluding OAuth callback URLs with query parameters
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
