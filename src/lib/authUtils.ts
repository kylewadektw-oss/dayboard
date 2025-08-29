// Simple authentication utilities without rate limiting
import { createClient } from '@supabase/supabase-js';

// Create a separate client for authentication that bypasses rate limiting
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const authClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

/**
 * Check if user is authenticated without rate limiting
 */
export async function checkAuthStatus() {
  try {
    const { data: { session }, error } = await authClient.auth.getSession();
    if (error) {
      console.error('Auth check error:', error);
      return { authenticated: false, user: null, error };
    }
    return { 
      authenticated: !!session, 
      user: session?.user || null, 
      session,
      error: null 
    };
  } catch (error) {
    console.error('Auth status check failed:', error);
    return { authenticated: false, user: null, error };
  }
}

/**
 * Sign out without rate limiting
 */
export async function signOut() {
  try {
    const { error } = await authClient.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    return { error };
  } catch (error) {
    console.error('Sign out failed:', error);
    return { error };
  }
}
