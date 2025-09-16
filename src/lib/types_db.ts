export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_configurations: {
        Row: {
          application_insights_connection_string: string | null
          application_insights_instrumentation_key: string | null
          created_at: string | null
          google_analytics_measurement_id: string | null
          id: string
          is_active: boolean | null
          mixpanel_project_token: string | null
          updated_at: string | null
        }
        Insert: {
          application_insights_connection_string?: string | null
          application_insights_instrumentation_key?: string | null
          created_at?: string | null
          google_analytics_measurement_id?: string | null
          id?: string
          is_active?: boolean | null
          mixpanel_project_token?: string | null
          updated_at?: string | null
        }
        Update: {
          application_insights_connection_string?: string | null
          application_insights_instrumentation_key?: string | null
          created_at?: string | null
          google_analytics_measurement_id?: string | null
          id?: string
          is_active?: boolean | null
          mixpanel_project_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_metadata: Json | null
          event_name: string
          event_properties: Json | null
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_metadata?: Json | null
          event_name: string
          event_properties?: Json | null
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_metadata?: Json | null
          event_name?: string
          event_properties?: Json | null
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_logs: {
        Row: {
          created_at: string | null
          id: string
          level: Database["public"]["Enums"]["log_level"] | null
          message: string
          metadata: Json | null
          side: Database["public"]["Enums"]["log_side"] | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["log_level"] | null
          message: string
          metadata?: Json | null
          side?: Database["public"]["Enums"]["log_side"] | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["log_level"] | null
          message?: string
          metadata?: Json | null
          side?: Database["public"]["Enums"]["log_side"] | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_type: string | null
          household_id: string | null
          id: string
          location: string | null
          metadata: Json | null
          start_time: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          household_id?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          start_time?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          household_id?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_reviews: {
        Row: {
          id: string
          user_id: string
          status: string
          rating: number | null
          review_text: string | null
          review_type: string | null
          feedback_category: string | null
          reviewer_name: string | null
          reviewer_email: string | null
          app_version: string | null
          device_info: Json | null
          helpful_votes: number | null
          is_public: boolean | null
          response_from_team: string | null
          response_at: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          rating?: number | null
          review_text?: string | null
          review_type?: string | null
          feedback_category?: string | null
          reviewer_name?: string | null
          reviewer_email?: string | null
          app_version?: string | null
          device_info?: Json | null
          helpful_votes?: number | null
          is_public?: boolean | null
          response_from_team?: string | null
          response_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          rating?: number | null
          review_text?: string | null
          review_type?: string | null
          feedback_category?: string | null
          reviewer_name?: string | null
          reviewer_email?: string | null
          app_version?: string | null
          device_info?: Json | null
          helpful_votes?: number | null
          is_public?: boolean | null
          response_from_team?: string | null
          response_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          default_enabled: boolean | null
          description: string | null
          feature_key: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_enabled?: boolean | null
          description?: string | null
          feature_key: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_enabled?: boolean | null
          description?: string | null
          feature_key?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          account_number_hash: string | null
          account_type: string | null
          balance: number | null
          created_at: string | null
          household_id: string | null
          id: string
          institution_name: string | null
          is_active: boolean | null
          last_synced: string | null
          name: string
          plaid_access_token: string | null
          plaid_account_id: string | null
          sync_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_number_hash?: string | null
          account_type?: string | null
          balance?: number | null
          created_at?: string | null
          household_id?: string | null
          id?: string
          institution_name?: string | null
          is_active?: boolean | null
          last_synced?: string | null
          name: string
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_number_hash?: string | null
          account_type?: string | null
          balance?: number | null
          created_at?: string | null
          household_id?: string | null
          id?: string
          institution_name?: string | null
          is_active?: boolean | null
          last_synced?: string | null
          name?: string
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          merchant_name: string | null
          plaid_transaction_id: string | null
          subcategory: string | null
          transaction_type: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          category?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          merchant_name?: string | null
          plaid_transaction_id?: string | null
          subcategory?: string | null
          transaction_type?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          merchant_name?: string | null
          plaid_transaction_id?: string | null
          subcategory?: string | null
          transaction_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      global_feature_control: {
        Row: {
          created_at: string | null
          default_role_required: Database["public"]["Enums"]["user_role"] | null
          description: string | null
          feature_key: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_role_required?: Database["public"]["Enums"]["user_role"] | null
          description?: string | null
          feature_key: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_role_required?: Database["public"]["Enums"]["user_role"] | null
          description?: string | null
          feature_key?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      household_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          expires_at: string | null
          household_id: string
          id: string
          invitation_code: string
          invitee_email: string | null
          invitee_name: string | null
          invited_by: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          household_id: string
          id?: string
          invitation_code?: string
          invitee_email?: string | null
          invitee_name?: string | null
          invited_by: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          household_id?: string
          id?: string
          invitation_code?: string
          invitee_email?: string | null
          invitee_name?: string | null
          invited_by?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_invitations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          address: string | null
          admin_id: string | null
          city: string | null
          coordinates: Json | null
          created_at: string | null
          created_by: string
          household_code: string | null
          household_type: Database["public"]["Enums"]["household_type"]
          id: string
          income: number | null
          members_count: number | null
          name: string
          referral_code: string | null
          state: string | null
          subscription_id: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          admin_id?: string | null
          city?: string | null
          coordinates?: Json | null
          created_at?: string | null
          created_by: string
          household_code?: string | null
          household_type: Database["public"]["Enums"]["household_type"]
          id?: string
          income?: number | null
          members_count?: number | null
          name: string
          referral_code?: string | null
          state?: string | null
          subscription_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          admin_id?: string | null
          city?: string | null
          coordinates?: Json | null
          created_at?: string | null
          created_by?: string
          household_code?: string | null
          household_type?: Database["public"]["Enums"]["household_type"]
          id?: string
          income?: number | null
          members_count?: number | null
          name?: string
          referral_code?: string | null
          state?: string | null
          subscription_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "households_admin_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      magic8_questions: {
        Row: {
          answer: string
          asked_by: string
          created_at: string | null
          household_id: string
          id: number
          question: string
          theme: string | null
        }
        Insert: {
          answer: string
          asked_by: string
          created_at?: string | null
          household_id: string
          id?: never
          question: string
          theme?: string | null
        }
        Update: {
          answer?: string
          asked_by?: string
          created_at?: string | null
          household_id?: string
          id?: never
          question?: string
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magic8_questions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          age: number | null
          allergies: string[] | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          dietary_preferences: string[] | null
          dietary_restrictions: string[] | null
          emergency_contact: Json | null
          family_role: string | null
          google_avatar_url: string | null
          household_id: string | null
          household_role: string | null
          household_status: string | null
          id: string
          is_active: boolean | null
          language: string | null
          last_seen_at: string | null
          name: string
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          phone_number: string | null
          preferred_name: string | null
          privacy_settings: Json | null
          profession: string | null
          profile_completion_percentage: number | null
          profile_photo_url: string | null
          pronouns: string | null
          requested_household_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: Json | null
          age?: number | null
          allergies?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          emergency_contact?: Json | null
          family_role?: string | null
          google_avatar_url?: string | null
          household_id?: string | null
          household_role?: string | null
          household_status?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_seen_at?: string | null
          name: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          preferred_name?: string | null
          privacy_settings?: Json | null
          profession?: string | null
          profile_completion_percentage?: number | null
          profile_photo_url?: string | null
          pronouns?: string | null
          requested_household_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: Json | null
          age?: number | null
          allergies?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          emergency_contact?: Json | null
          family_role?: string | null
          google_avatar_url?: string | null
          household_id?: string | null
          household_role?: string | null
          household_status?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_seen_at?: string | null
          name?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          preferred_name?: string | null
          privacy_settings?: Json | null
          profession?: string | null
          profile_completion_percentage?: number | null
          profile_photo_url?: string | null
          pronouns?: string | null
          requested_household_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_household"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_requested_household_id_fkey"
            columns: ["requested_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_import_queue: {
        Row: {
          approved_at: string | null
          cook_time_minutes: number | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          diet_types: string[] | null
          difficulty: string | null
          external_id: string
          external_source: string
          id: string
          image_url: string | null
          meal_types: string[] | null
          prep_time_minutes: number | null
          processed_data: Json | null
          raw_data: Json
          rejected_at: string | null
          review_notes: string | null
          reviewed_by: string | null
          servings: number | null
          status: Database["public"]["Enums"]["recipe_queue_status"] | null
          submitted_by: string | null
          tags: string[] | null
          title: string | null
          total_time_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          cook_time_minutes?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          diet_types?: string[] | null
          difficulty?: string | null
          external_id: string
          external_source?: string
          id?: string
          image_url?: string | null
          meal_types?: string[] | null
          prep_time_minutes?: number | null
          processed_data?: Json | null
          raw_data: Json
          rejected_at?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          servings?: number | null
          status?: Database["public"]["Enums"]["recipe_queue_status"] | null
          submitted_by?: string | null
          tags?: string[] | null
          title?: string | null
          total_time_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          cook_time_minutes?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          diet_types?: string[] | null
          difficulty?: string | null
          external_id?: string
          external_source?: string
          id?: string
          image_url?: string | null
          meal_types?: string[] | null
          prep_time_minutes?: number | null
          processed_data?: Json | null
          raw_data?: Json
          rejected_at?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          servings?: number | null
          status?: Database["public"]["Enums"]["recipe_queue_status"] | null
          submitted_by?: string | null
          tags?: string[] | null
          title?: string | null
          total_time_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          cook_time: number | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          dietary_tags: string[] | null
          difficulty: string | null
          household_id: string | null
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: string | null
          prep_time: number | null
          servings: number | null
          source_url: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cook_time?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          difficulty?: string | null
          household_id?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          prep_time?: number | null
          servings?: number | null
          source_url?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cook_time?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          difficulty?: string | null
          household_id?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string | null
          prep_time?: number | null
          servings?: number | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      security_violations: {
        Row: {
          created_at: string | null
          domain: string | null
          fingerprint: string | null
          id: number
          ip_address: string | null
          metadata: Json | null
          origin: string | null
          referrer: string | null
          url: string | null
          user_agent: string | null
          violation_type: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          fingerprint?: string | null
          id?: number
          ip_address?: string | null
          metadata?: Json | null
          origin?: string | null
          referrer?: string | null
          url?: string | null
          user_agent?: string | null
          violation_type: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          fingerprint?: string | null
          id?: number
          ip_address?: string | null
          metadata?: Json | null
          origin?: string | null
          referrer?: string | null
          url?: string | null
          user_agent?: string | null
          violation_type?: string
        }
        Relationships: []
      }
      settings_categories: {
        Row: {
          category_key: string
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          required_role: string
          sort_order: number | null
        }
        Insert: {
          category_key: string
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          required_role?: string
          sort_order?: number | null
        }
        Update: {
          category_key?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          required_role?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      settings_items: {
        Row: {
          category_key: string
          created_at: string | null
          default_value: Json | null
          description: string | null
          display_name: string
          id: string
          options: Json | null
          required_role: string
          setting_key: string
          setting_type: string
          sort_order: number | null
        }
        Insert: {
          category_key: string
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          display_name: string
          id?: string
          options?: Json | null
          required_role?: string
          setting_key: string
          setting_type?: string
          sort_order?: number | null
        }
        Update: {
          category_key?: string
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          display_name?: string
          id?: string
          options?: Json | null
          required_role?: string
          setting_key?: string
          setting_type?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_items_category_key_fkey"
            columns: ["category_key"]
            isOneToOne: false
            referencedRelation: "settings_categories"
            referencedColumns: ["category_key"]
          },
        ]
      }
      user_feature_overrides: {
        Row: {
          created_at: string | null
          feature_key: string
          id: string
          is_enabled: boolean
          override_reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean
          override_reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean
          override_reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_overrides_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "global_feature_control"
            referencedColumns: ["feature_key"]
          },
          {
            foreignKeyName: "user_feature_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          ai_features: boolean | null
          analytics_dashboard: boolean | null
          billing_management: boolean | null
          created_at: string | null
          dashboard: boolean | null
          feature_management: boolean | null
          financial_tracking: boolean | null
          global_feature_control: boolean | null
          household_management: boolean | null
          id: string
          lists: boolean | null
          meals: boolean | null
          profile: boolean | null
          projects: boolean | null
          sports_ticker: boolean | null
          system_admin: boolean | null
          updated_at: string | null
          user_id: string | null
          user_management: boolean | null
          work: boolean | null
        }
        Insert: {
          ai_features?: boolean | null
          analytics_dashboard?: boolean | null
          billing_management?: boolean | null
          created_at?: string | null
          dashboard?: boolean | null
          feature_management?: boolean | null
          financial_tracking?: boolean | null
          global_feature_control?: boolean | null
          household_management?: boolean | null
          id?: string
          lists?: boolean | null
          meals?: boolean | null
          profile?: boolean | null
          projects?: boolean | null
          sports_ticker?: boolean | null
          system_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          user_management?: boolean | null
          work?: boolean | null
        }
        Update: {
          ai_features?: boolean | null
          analytics_dashboard?: boolean | null
          billing_management?: boolean | null
          created_at?: string | null
          dashboard?: boolean | null
          feature_management?: boolean | null
          financial_tracking?: boolean | null
          global_feature_control?: boolean | null
          household_management?: boolean | null
          id?: string
          lists?: boolean | null
          meals?: boolean | null
          profile?: boolean | null
          projects?: boolean | null
          sports_ticker?: boolean | null
          system_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          user_management?: boolean | null
          work?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          },
        ]
      }
      prices: {
        Row: {
          id: string
          product_id: string | null
          active: boolean | null
          description: string | null
          unit_amount: number | null
          currency: string | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          trial_period_days: number | null
          metadata: Json | null
        }
        Insert: {
          id: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          active: boolean | null
          name: string | null
          description: string | null
          image: string | null
          metadata: Json | null
        }
        Insert: {
          id: string
          active?: boolean | null
          name?: string | null
          description?: string | null
          image?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          active?: boolean | null
          name?: string | null
          description?: string | null
          image?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          cancel_at_period_end: boolean | null
          created: string
          current_period_start: string
          current_period_end: string
          ended_at: string | null
          cancel_at: string | null
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
        }
        Insert: {
          id: string
          user_id: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created?: string
          current_period_start?: string
          current_period_end?: string
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created?: string
          current_period_start?: string
          current_period_end?: string
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
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
          },
        ]
      }
    }
    Views: {
      v_calendar_feed: {
        Row: {
          all_day: boolean | null
          color: string | null
          description: string | null
          end_ts: string | null
          event_id: string | null
          household_id: string | null
          kind: Database["public"]["Enums"]["entity_kind"] | null
          link_href: string | null
          location: string | null
          meta: Json | null
          start_ts: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_household_invitation: {
        Args: { invitation_code_param: string; user_id_param?: string }
        Returns: Json
      }
      calculate_age_from_dob: {
        Args: { birth_date: string }
        Returns: number
      }
      create_household_invitation: {
        Args: {
          household_id_param: string
          invitee_email_param?: string
          invitee_name_param?: string
          role_param?: string
        }
        Returns: Json
      }
      exec: {
        Args: { sql: string }
        Returns: undefined
      }
      exec_select: {
        Args: { sql: string }
        Returns: Json
      }
      generate_household_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_household_members: {
        Args: { household_id_param: string }
        Returns: {
          age: number
          created_at: string
          date_of_birth: string
          id: string
          is_user: boolean
          name: string
          photo_url: string
          type: string
          user_id: string
        }[]
      }
      get_user_navigation: {
        Args: { user_id_param: string }
        Returns: {
          category: string
          display_name: string
          feature_key: string
          has_access: boolean
          href: string
          icon: string
        }[]
      }
      get_user_settings_tabs: {
        Args: { user_id_param: string }
        Returns: {
          category_key: string
          description: string
          display_name: string
          icon: string
          sort_order: number
        }[]
      }
      initialize_household_features: {
        Args: { household_id_param: string }
        Returns: undefined
      }
      join_household_by_code: {
        Args: { p_household_code: string; p_user_id: string }
        Returns: Json
      }
      manage_household_member: {
        Args: {
          p_action: string
          p_admin_user_id: string
          p_member_user_id: string
        }
        Returns: Json
      }
      meal_slot_time: {
        Args: { meal_type: string }
        Returns: string
      }
      user_has_feature_access: {
        Args: { feature_key_param: string; user_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      access_level:
        | "super_admin_only"
        | "admin_only"
        | "member_and_up"
        | "all_users"
      entity_kind: "manual" | "meal" | "list_item" | "chore" | "project_task"
      household_type:
        | "solo_user"
        | "roommate_household"
        | "couple_no_kids"
        | "family_household"
        | "single_parent_household"
        | "multi_generational_household"
      log_level: "debug" | "info" | "warn" | "error"
      log_side: "client" | "server"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      recipe_queue_status: "pending" | "approved" | "rejected" | "needs_review"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      subscription_tier: "free" | "premium" | "family_plus"
      user_role: "super_admin" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level: [
        "super_admin_only",
        "admin_only",
        "member_and_up",
        "all_users",
      ],
      entity_kind: ["manual", "meal", "list_item", "chore", "project_task"],
      household_type: [
        "solo_user",
        "roommate_household",
        "couple_no_kids",
        "family_household",
        "single_parent_household",
        "multi_generational_household",
      ],
      log_level: ["debug", "info", "warn", "error"],
      log_side: ["client", "server"],
      pricing_plan_interval: ["day", "week", "month", "year"],
      pricing_type: ["one_time", "recurring"],
      recipe_queue_status: ["pending", "approved", "rejected", "needs_review"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
      subscription_tier: ["free", "premium", "family_plus"],
      user_role: ["super_admin", "admin", "member"],
    },
  },
} as const