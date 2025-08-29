import { createClient } from '@supabase/supabase-js'
import { addCacheBustingHeaders } from './cacheUtils'

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

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    // Prevent auth caching issues
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
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
