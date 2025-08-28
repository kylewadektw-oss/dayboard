import { createClient } from '@supabase/supabase-js'

// Check if we're in a browser environment and have the required env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a fallback client for build time
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    // During build time or when env vars are missing, create a dummy client
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  return createClient(supabaseUrl, supabaseKey)
}

export const supabase = createSupabaseClient()

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
