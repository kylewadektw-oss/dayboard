/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */


/*
 * 🌐 SUPABASE CLIENT - Browser-side Database Connection
 * 
 * PURPOSE: Creates and configures the Supabase client for client-side operations
 * Handles authentication, real-time subscriptions, and database queries from the browser
 * 
 * FEATURES:
 * - Browser-optimized Supabase client with SSR support
 * - Full TypeScript integration with database schema
 * - Automatic authentication state management
 * - Real-time subscription capabilities
 * - Secure environment variable handling
 * 
 * USAGE:
 * ```typescript
 * import { createClient } from '@/utils/supabase/client';
 * 
 * const supabase = createClient();
 * 
 * // Database operations
 * const { data, error } = await supabase
 *   .from('projects')
 *   .select('*')
 *   .eq('user_id', userId);
 * 
 * // Authentication
 * const { data: user } = await supabase.auth.getUser();
 * 
 * // Real-time subscriptions
 * supabase
 *   .channel('logs')
 *   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'application_logs' }, 
 *       (payload) => console.log('New log:', payload))
 *   .subscribe();
 * ```
 * 
 * SECURITY:
 * - Uses public anonymous key (safe for client-side)
 * - Row Level Security (RLS) enforced on database
 * - Authentication required for sensitive operations
 * - Environment variables properly configured
 * 
 * TECHNICAL:
 * - SSR-compatible client creation
 * - Automatic connection pooling
 * - Browser session persistence
 * - TypeScript integration with Database types
 * 
 * ACCESS: Used throughout client-side components and pages
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/src/lib/types_db';

// Define a function to create a Supabase client for client-side operations
export const createClient = () =>
  createBrowserClient<Database>(
    // Pass Supabase URL and anonymous key from the environment to the client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Enable automatic refresh token handling
        autoRefreshToken: true,
        // Persist session in localStorage by default  
        persistSession: true,
        // Enable debug mode for auth issues
        debug: process.env.NODE_ENV === 'development',
        // Configure storage
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Set flowType for better OAuth handling
        flowType: 'pkce'
      }
    }
  );
