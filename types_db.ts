export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type HouseholdType = 'solo_user' | 'roommate_household' | 'couple_no_kids' | 'family_household' | 'single_parent_household' | 'multi_generational_household'

export type FamilyRole = 'parent_guardian' | 'mom' | 'dad' | 'child' | 'spouse_partner' | 'roommate' | 'guest' | 'caregiver' | 'pet'

export interface Database {
  public: {
    Tables: {
      application_logs: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          level: string
          message: string
          component: string | null
          data: Json | null
          stack_trace: string | null
          user_agent: string | null
          url: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          level: string
          message: string
          component?: string | null
          data?: Json | null
          stack_trace?: string | null
          user_agent?: string | null
          url?: string | null
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          level?: string
          message?: string
          component?: string | null
          data?: Json | null
          stack_trace?: string | null
          user_agent?: string | null
          url?: string | null
          timestamp?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_reviews: {
        Row: {
          id: string
          user_id: string
          household_id: string | null
          status: Database["public"]["Enums"]["customer_review_status"]
          review_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id?: string | null
          status?: Database["public"]["Enums"]["customer_review_status"]
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string | null
          status?: Database["public"]["Enums"]["customer_review_status"]
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_reviews_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          preferred_name: string | null
          age: number | null
          profession: string | null
          household_id: string | null
          avatar_url: string | null
          dietary_preferences: string[] | null
          allergies: string[] | null
          created_at: string
          updated_at: string
          household_status: string | null
          household_role: string | null
          requested_household_id: string | null
          date_of_birth: string | null
          profile_photo_url: string | null
          google_avatar_url: string | null
          phone_number: string | null
          bio: string | null
          address: Json | null
          emergency_contact: Json | null
          timezone: string
          language: string
          notification_preferences: Json
          privacy_settings: Json
          family_role: Database["public"]["Enums"]["family_role"] | null
          /** @deprecated use dietary_preferences */
          dietary_restrictions: Json | null
          onboarding_completed: boolean
          profile_completion_percentage: number
          role: Database["public"]["Enums"]["user_role"]
          is_active: boolean
          last_seen_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          age?: number | null
          profession?: string | null
          household_id?: string | null
          avatar_url?: string | null
          dietary_preferences?: string[] | null
          created_at?: string
          updated_at?: string
          household_status?: string | null
          household_role?: string | null
          requested_household_id?: string | null
          date_of_birth?: string | null
          profile_photo_url?: string | null
          google_avatar_url?: string | null
          phone_number?: string | null
          bio?: string | null
          preferred_name?: string | null
          pronouns?: string | null
          address?: Json | null
          emergency_contact?: Json | null
          timezone?: string
          language?: string
          notification_preferences?: Json
          privacy_settings?: Json
          family_role?: Database["public"]["Enums"]["family_role"] | null
          /** @deprecated use dietary_preferences */
          dietary_restrictions?: Json | null
          allergies?: string[] | null
          onboarding_completed?: boolean
          profile_completion_percentage?: number
          role?: Database["public"]["Enums"]["user_role"]
          is_active?: boolean
          last_seen_at?: string | null
        }
        Update: {
          id?: string
          avatar_url?: string | null
          date_of_birth?: string | null
          phone_number?: string | null
          bio?: string | null
          preferred_name?: string | null
          pronouns?: string | null
          address?: Json | null
          emergency_contact?: Json | null
          timezone?: string
          language?: string
          notification_preferences?: Json
          privacy_settings?: Json
          role?: Database["public"]["Enums"]["user_role"]
          household_id?: string | null
          family_role?: Database["public"]["Enums"]["family_role"] | null
          /** @deprecated use dietary_preferences */
          dietary_restrictions?: Json | null
          dietary_preferences?: string[] | null
          allergies?: string[] | null
          is_active?: boolean
          last_seen_at?: string | null
          onboarding_completed?: boolean
          profile_completion_percentage?: number
          created_at?: string
          updated_at?: string
          name?: string | null
          age?: number | null
          profession?: string | null
          requested_household_id?: string | null
          household_status?: string | null
          household_role?: string | null
          google_avatar_url?: string | null
          profile_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          dashboard: boolean
          meals: boolean
          lists: boolean
          work: boolean
          projects: boolean
          profile: boolean
          sports_ticker: boolean
          financial_tracking: boolean
          ai_features: boolean
          household_management: boolean
          user_management: boolean
          feature_management: boolean
          billing_management: boolean
          system_admin: boolean
          global_feature_control: boolean
          analytics_dashboard: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dashboard?: boolean
          meals?: boolean
          lists?: boolean
          work?: boolean
          projects?: boolean
          profile?: boolean
          sports_ticker?: boolean
          financial_tracking?: boolean
          ai_features?: boolean
          household_management?: boolean
          user_management?: boolean
          feature_management?: boolean
          billing_management?: boolean
          system_admin?: boolean
          global_feature_control?: boolean
          analytics_dashboard?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dashboard?: boolean
          meals?: boolean
          lists?: boolean
          work?: boolean
          projects?: boolean
          profile?: boolean
          sports_ticker?: boolean
          financial_tracking?: boolean
          ai_features?: boolean
          household_management?: boolean
          user_management?: boolean
          feature_management?: boolean
          billing_management?: boolean
          system_admin?: boolean
          global_feature_control?: boolean
          analytics_dashboard?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      households: {
        Row: {
          id: string
          name: string
          household_type: Database["public"]["Enums"]["household_type"]
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          income: number | null
          members_count: number
          created_by: string
          created_at: string
          updated_at: string
          household_code: string
          admin_id: string | null
          subscription_tier: string | null
          subscription_id: string | null
          trial_ends_at: string | null
          coordinates: Json | null
          referral_code: string
        }
        Insert: {
          id?: string
          name: string
          household_type?: Database["public"]["Enums"]["household_type"]
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          income?: number | null
          members_count?: number
          created_by: string
          created_at?: string
          updated_at?: string
          household_code: string
          admin_id?: string | null
          subscription_tier?: string | null
          subscription_id?: string | null
          trial_ends_at?: string | null
          coordinates?: Json | null
          referral_code?: string
        }
        Update: {
          id?: string
          name?: string
          household_type?: Database["public"]["Enums"]["household_type"]
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          income?: number | null
          members_count?: number
          created_by?: string
          created_at?: string
          updated_at?: string
          household_code?: string
          admin_id?: string | null
          subscription_tier?: string | null
          subscription_id?: string | null
          trial_ends_at?: string | null
          coordinates?: Json | null
          referral_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          role: string
          joined_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      household_invitations: {
        Row: {
          id: string
          household_id: string
          inviter_user_id: string | null
          invitee_user_id: string | null
          household_code: string
          status: string
          invited_at: string
          responded_at: string | null
          expires_at: string
          created_at: string
          updated_at: string
          invitation_code: string
          created_by: string | null
          invitee_email: string | null
          invitee_name: string | null
          role: string
          used_by: string | null
          used_at: string | null
          invited_email: string | null
          invited_by: string | null
          invitation_token: string | null
          accepted_at: string | null
        }
        Insert: {
          id?: string
          household_id: string
          inviter_user_id?: string | null
          invitee_user_id?: string | null
          household_code: string
          status?: string
          invited_at?: string
          responded_at?: string | null
          expires_at: string
          created_at?: string
          updated_at?: string
          invitation_code: string
          created_by?: string | null
          invitee_email?: string | null
          invitee_name?: string | null
          role: string
          used_by?: string | null
          used_at?: string | null
          invited_email?: string | null
          invited_by?: string | null
          invitation_token?: string | null
          accepted_at?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          inviter_user_id?: string | null
          invitee_user_id?: string | null
          household_code?: string
          status?: string
          invited_at?: string
          responded_at?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
          invitation_code?: string
          created_by?: string | null
          invitee_email?: string | null
          invitee_name?: string | null
          role?: string
          used_by?: string | null
          used_at?: string | null
          invited_email?: string | null
          invited_by?: string | null
          invitation_token?: string | null
          accepted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_invitations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      global_feature_control: {
        Row: {
          feature_key: string
          display_name: string
          description: string | null
          category: string
          access_level: string
          is_enabled_globally: boolean
          requires_subscription: boolean
          minimum_tier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          feature_key: string
          display_name: string
          description?: string | null
          category?: string
          access_level?: string
          is_enabled_globally?: boolean
          requires_subscription?: boolean
          minimum_tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          feature_key?: string
          display_name?: string
          description?: string | null
          category?: string
          access_level?: string
          is_enabled_globally?: boolean
          requires_subscription?: boolean
          minimum_tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings_categories: {
        Row: {
          category_key: string
          display_name: string
          description: string | null
          icon: string | null
          sort_order: number
          required_role: string
          created_at: string
        }
        Insert: {
          category_key: string
          display_name: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          required_role?: string
          created_at?: string
        }
        Update: {
          category_key?: string
          display_name?: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          required_role?: string
          created_at?: string
        }
        Relationships: []
      }
      settings_items: {
        Row: {
          id: string
          category_key: string
          setting_key: string
          display_name: string
          description: string | null
          setting_type: string
          default_value: Json | null
          options: Json | null
          required_role: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_key: string
          setting_key: string
          display_name: string
          description?: string | null
          setting_type?: string
          default_value?: Json | null
          options?: Json | null
          required_role?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_key?: string
          setting_key?: string
          display_name?: string
          description?: string | null
          setting_type?: string
          default_value?: Json | null
          options?: Json | null
          required_role?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_items_category_key_fkey"
            columns: ["category_key"]
            isOneToOne: false
            referencedRelation: "settings_categories"
            referencedColumns: ["category_key"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          setting_key: string
          setting_value: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          setting_key: string
          setting_value?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          setting_key?: string
          setting_value?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      household_settings: {
        Row: {
          id: string
          household_id: string
          setting_key: string
          setting_value: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          setting_key: string
          setting_value?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          setting_key?: string
          setting_value?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_settings_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
      household_feature_settings: {
        Row: {
          id: string
          household_id: string
          feature_key: string
          is_enabled: boolean
          enabled_for_admins: boolean
          enabled_for_members: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          feature_key: string
          is_enabled?: boolean
          enabled_for_admins?: boolean
          enabled_for_members?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          feature_key?: string
          is_enabled?: boolean
          enabled_for_admins?: boolean
          enabled_for_members?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_feature_settings_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_feature_settings_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "global_feature_control"
            referencedColumns: ["feature_key"]
          }
        ]
      }
      user_feature_overrides: {
        Row: {
          id: string
          user_id: string
          feature_key: string
          is_enabled: boolean
          override_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature_key: string
          is_enabled?: boolean
          override_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature_key?: string
          is_enabled?: boolean
          override_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_overrides_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "global_feature_control"
            referencedColumns: ["feature_key"]
          }
        ]
      }
      recipes: {
        Row: {
          id: string
          user_id: string | null
          household_id: string | null
          title: string
          description: string | null
          ingredients: Json | null
          instructions: Json | null
          prep_time: number | null
          cook_time: number | null
          servings: number | null
          difficulty: string | null
          cuisine: string | null
          dietary_tags: string[] | null
          source_url: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          household_id?: string | null
          title: string
          description?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          difficulty?: string | null
          cuisine?: string | null
          dietary_tags?: string[] | null
          source_url?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          household_id?: string | null
          title?: string
          description?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          difficulty?: string | null
          cuisine?: string | null
          dietary_tags?: string[] | null
          source_url?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_settings_tabs: {
        Args: {
          user_id_param: string
        }
        Returns: {
          category_key: string
          display_name: string
          description: string
          icon: string
          sort_order: number
        }[]
      }
    }
    Enums: {
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      user_role: "super_admin" | "admin" | "member"
      household_type: "solo_user" | "roommate_household" | "couple_no_kids" | "family_household" | "single_parent_household" | "multi_generational_household"
      family_role: "parent_guardian" | "mom" | "dad" | "child" | "spouse_partner" | "roommate" | "guest" | "caregiver" | "pet"
      customer_review_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
