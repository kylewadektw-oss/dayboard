import { createClient } from '@supabase/supabase-js'
import { addCacheBustingHeaders } from './cacheUtils'
import { globalRateLimiter } from './rateLimiter'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Default values for development (replace with your actual values)
const fallbackUrl = 'https://csbwewirwzeitavhvykr.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYndld2lyd3plaXRhdmh2eWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTg3NjIsImV4cCI6MjA3MTkzNDc2Mn0.Jc3FO8nDvw5VtIKPH29V7cwDm-XX4Lniqn_PjFROXR8'

// Use environment variables if available, otherwise use fallback values
const finalUrl = supabaseUrl || fallbackUrl
const finalKey = supabaseKey || fallbackKey

// Validate that we have proper values
if (!finalUrl || !finalKey || finalUrl.includes('placeholder')) {
  console.error('Supabase configuration error. Please check your environment variables.')
}

// Rate-limited fetch function for Supabase requests
const rateLimitedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  // Skip rate limiting for authentication endpoints
  const isAuthEndpoint = url.includes('/auth/') || 
                         url.includes('/token') || 
                         url.includes('grant_type=') ||
                         url.includes('refresh_token') ||
                         (init && init.method === 'POST' && url.includes('supabase.co/auth'));
  
  if (!isAuthEndpoint) {
    const requestKey = `supabase-${url}`;
    
    // Check if we can make the request
    if (!globalRateLimiter.canMakeRequest(requestKey)) {
      const waitTime = globalRateLimiter.getTimeUntilNextRequest(requestKey);
      if (waitTime > 0) {
        console.warn(`Supabase rate limited. Waiting ${Math.min(waitTime, 3000)}ms`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 3000))); // Max 3s wait
      }
    }
    
    // Check cache first for GET requests (but not auth GET requests)
    if (!init?.method || init.method.toLowerCase() === 'get') {
      const cached = globalRateLimiter.getCachedData(requestKey);
      if (cached) {
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Record the request
    globalRateLimiter.recordRequest(requestKey);
  }
  
  // Make the request (no retries for auth endpoints to avoid conflicts)
  let retries = isAuthEndpoint ? 1 : 2;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const headers: Record<string, string> = {
        ...init?.headers as Record<string, string>,
        'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Only add cache-busting headers for non-auth requests
      if (!isAuthEndpoint) {
        Object.assign(headers, addCacheBustingHeaders({}));
      }
      
      const response = await fetch(input, {
        ...init,
        headers
      });
      
      // Handle rate limiting (but don't retry auth endpoints)
      if (response.status === 429 && !isAuthEndpoint) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : (attempt + 1) * 2000;
        
        console.warn(`Supabase 429 error. Waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Cache successful GET responses (but not auth responses)
      if (!isAuthEndpoint && response.ok && (!init?.method || init.method.toLowerCase() === 'get')) {
        try {
          const data = await response.clone().json();
          const requestKey = `supabase-${url}`;
          globalRateLimiter.setCachedData(requestKey, data);
        } catch {
          // Ignore caching errors
        }
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1 && !isAuthEndpoint) {
        const waitTime = (attempt + 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('All Supabase request attempts failed');
};

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    // Prevent auth caching issues
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    // Use rate-limited fetch for all requests
    fetch: rateLimitedFetch,
    // Add cache-busting headers to all requests
    headers: addCacheBustingHeaders({
      'X-Client-Info': 'dayboard-app'
    })
  },
  realtime: {
    // Ensure realtime connections don't get stuck
    heartbeatIntervalMs: 30000,
    timeout: 20000
  }
})

// Types for our database tables
export interface Profile {
  id?: string
  user_id: string
  name: string
  age?: number
  profession?: string
  household_id?: string
  avatar_url?: string
  dietary_preferences?: string[]
  household_status?: 'none' | 'pending' | 'approved' | 'admin'
  household_role?: 'admin' | 'member'
  requested_household_id?: string
  created_at?: string
  updated_at?: string
}

export interface Household {
  id?: string
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  income?: number  // Fixed: renamed from monthly_income to income
  members_count?: number
  household_code?: string
  created_at?: string
  updated_at?: string
  created_by: string
}

export interface HouseholdMember {
  id?: string
  household_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at?: string
}

export interface HouseholdInvitation {
  id?: string
  household_id: string
  inviter_user_id: string
  invitee_user_id: string
  household_code: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  invited_at?: string
  responded_at?: string
  expires_at?: string
  created_at?: string
  updated_at?: string
}
