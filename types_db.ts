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
      application_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string
          level: string
          message: string
          component: string
          data: Json
          stack_trace: string | null
          user_agent: string | null
          url: string | null
          timestamp: string
          created_at: string
          side: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          level: string
          message: string
          component: string
          data?: Json
          stack_trace?: string | null
          user_agent?: string | null
          url?: string | null
          timestamp?: string
          created_at?: string
          side?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          level?: string
          message?: string
          component?: string
          data?: Json
          stack_trace?: string | null
          user_agent?: string | null
          url?: string | null
          timestamp?: string
          created_at?: string
          side?: string
        }
        Relationships: []
      }
      customer_reviews: {
        Row: {
          app_version: string | null
          completed_at: string | null
          created_at: string | null
          device_info: Json | null
          feedback_category: string | null
          helpful_votes: number | null
          id: string
          is_public: boolean | null
          rating: number | null
          response_at: string | null
          response_from_team: string | null
          review_text: string | null
          review_type: string | null
          reviewer_email: string | null
          reviewer_name: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_version?: string | null
          completed_at?: string | null
          created_at?: string | null
          device_info?: Json | null
          feedback_category?: string | null
          helpful_votes?: number | null
          id?: string
          is_public?: boolean | null
          rating?: number | null
          response_at?: string | null
          response_from_team?: string | null
          review_text?: string | null
          review_type?: string | null
          reviewer_email?: string | null
          reviewer_name?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_version?: string | null
          completed_at?: string | null
          created_at?: string | null
          device_info?: Json | null
          feedback_category?: string | null
          helpful_votes?: number | null
          id?: string
          is_public?: boolean | null
          rating?: number | null
          response_at?: string | null
          response_from_team?: string | null
          review_text?: string | null
          review_type?: string | null
          reviewer_email?: string | null
          reviewer_name?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      households: {
        Row: {
          created_at: string | null
          household_type: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          household_type?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          household_type?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
            foreignKeyName: "magic8_questions_asked_by_fkey"
            columns: ["asked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          household_id: string | null
          id: string
          notification_preferences: Json | null
          updated_at: string | null
          user_role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          household_id?: string | null
          id: string
          notification_preferences?: Json | null
          updated_at?: string | null
          user_role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          household_id?: string | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          household_id: string | null
          title: string
          description: string | null
          ingredients: Json | null
          instructions: Json | null
          prep_time: number | null
          cook_time: number | null
          servings: number | null
          difficulty: string | null
          cuisine_type: string | null
          dietary_tags: Json | null
          source_url: string | null
          image_url: string | null
          visibility: string | null
          shared_with_household: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id?: string | null
          title: string
          description?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          difficulty?: string | null
          cuisine_type?: string | null
          dietary_tags?: Json | null
          source_url?: string | null
          image_url?: string | null
          visibility?: string | null
          shared_with_household?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string | null
          title?: string
          description?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          difficulty?: string | null
          cuisine_type?: string | null
          dietary_tags?: Json | null
          source_url?: string | null
          image_url?: string | null
          visibility?: string | null
          shared_with_household?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          household_id: string | null
          permission_type: string
          resource_type: string | null
          resource_id: string | null
          granted_by: string | null
          granted_at: string
          revoked_at: string | null
          is_active: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id?: string | null
          permission_type: string
          resource_type?: string | null
          resource_id?: string | null
          granted_by?: string | null
          granted_at?: string
          revoked_at?: string | null
          is_active?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string | null
          permission_type?: string
          resource_type?: string | null
          resource_id?: string | null
          granted_by?: string | null
          granted_at?: string
          revoked_at?: string | null
          is_active?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          household_id: string | null
          title: string
          description: string | null
          start_time: string
          end_time: string
          all_day: boolean | null
          recurrence_rule: string | null
          location: string | null
          event_type: string | null
          visibility: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id?: string | null
          title: string
          description?: string | null
          start_time: string
          end_time: string
          all_day?: boolean | null
          recurrence_rule?: string | null
          location?: string | null
          event_type?: string | null
          visibility?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string | null
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          all_day?: boolean | null
          recurrence_rule?: string | null
          location?: string | null
          event_type?: string | null
          visibility?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_lists: {
        Row: {
          id: string
          user_id: string
          household_id: string | null
          name: string
          description: string | null
          is_shared: boolean | null
          visibility: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id?: string | null
          name: string
          description?: string | null
          is_shared?: boolean | null
          visibility?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string | null
          name?: string
          description?: string | null
          is_shared?: boolean | null
          visibility?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          task_list_id: string | null
          user_id: string
          household_id: string | null
          title: string
          description: string | null
          is_completed: boolean | null
          due_date: string | null
          priority: string | null
          assigned_to: string | null
          tags: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_list_id?: string | null
          user_id: string
          household_id?: string | null
          title: string
          description?: string | null
          is_completed?: boolean | null
          due_date?: string | null
          priority?: string | null
          assigned_to?: string | null
          tags?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_list_id?: string | null
          user_id?: string
          household_id?: string | null
          title?: string
          description?: string | null
          is_completed?: boolean | null
          due_date?: string | null
          priority?: string | null
          assigned_to?: string | null
          tags?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          household_id: string | null
          name: string
          description: string | null
          is_shared: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          household_id?: string | null
          name: string
          description?: string | null
          is_shared?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          household_id?: string | null
          name?: string
          description?: string | null
          is_shared?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

