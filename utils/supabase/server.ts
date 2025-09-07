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
 * 🖥️ SUPABASE SERVER CLIENT - Server-side Database Connection
 * 
 * PURPOSE: Creates and configures the Supabase client for server-side operations
 * Handles authentication, database queries, and secure operations from Next.js server components
 * 
 * FEATURES:
 * - Server-optimized Supabase client with cookie-based auth
 * - Full TypeScript integration with database schema
 * - Secure server-side authentication handling
 * - Cookie-based session management
 * - Error handling for Server Component restrictions
 * 
 * USAGE:
 * ```typescript
 * import { createClient } from '@/utils/supabase/server';
 * 
 * // In Server Components
 * const supabase = await createClient();
 * 
 * // Get authenticated user
 * const { data: { user } } = await supabase.auth.getUser();
 * 
 * // Server-side database queries
 * const { data: projects } = await supabase
 *   .from('projects')
 *   .select('*')
 *   .eq('user_id', user?.id);
 * 
 * // In Route Handlers (API routes)
 * const supabase = await createClient();
 * const { data, error } = await supabase
 *   .from('application_logs')
 *   .insert({ level: 'info', message: 'Server log' });
 * ```
 * 
 * SECURITY:
 * - Server-side authentication with secure cookies
 * - Row Level Security (RLS) properly enforced
 * - Session management handled automatically
 * - Secure environment variable access
 * 
 * TECHNICAL:
 * - Cookie-based authentication state
 * - Next.js App Router compatible
 * - Handles Server Component limitations gracefully
 * - Automatic session refresh via middleware
 * - TypeScript integration with Database types
 * 
 * ACCESS: Used in Server Components, Route Handlers, and Middleware
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types_db';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Define a function to create a Supabase client for server-side operations
// The function takes a cookie store created with next/headers cookies as an argument
export const createClient = async () => {
  const cookieStore: ReadonlyRequestCookies = await cookies();

  return createServerClient<Database>(
    // Pass Supabase URL and anonymous key from the environment to the client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    // Define a cookies object with methods for interacting with the cookie store and pass it to the client
    {
      cookies: {
        // The get method is used to retrieve a cookie by its name
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // The set method is used to set a cookie with a given name, value, and options
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // If the set method is called from a Server Component, an error may occur
            // This can be ignored if there is middleware refreshing user sessions
          }
        },
        // The remove method is used to delete a cookie by its name
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // If the remove method is called from a Server Component, an error may occur
            // This can be ignored if there is middleware refreshing user sessions
          }
        }
      }
    }
  );
};
