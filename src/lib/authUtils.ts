// Simple authentication utilities without rate limiting
import { supabase } from './supabaseClient';

/**
 * Check if user is authenticated without rate limiting
 * Uses the main supabase client but bypasses rate limiting
 */
export async function checkAuthStatus() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    return { error };
  } catch (error) {
    console.error('Sign out failed:', error);
    return { error };
  }
}

// Re-export the main supabase client for auth operations
// This ensures we use the same client instance everywhere
export const authClient = supabase;
