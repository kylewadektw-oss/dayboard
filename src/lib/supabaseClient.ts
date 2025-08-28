import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

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
  monthly_income?: number
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
