export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analysis_results: {
        Row: {
          aggregate_score: number | null
          ai_summary: string | null
          analysis_type: string
          confidence: number | null
          created_at: string
          current_price: number | null
          duration: string
          exchange: string
          expires_at: string | null
          fundamental_metrics: Json | null
          fundamental_score: number | null
          fundamental_weight: number | null
          id: string
          key_factors: string[] | null
          price_change: number | null
          price_change_percent: number | null
          recommendation: string | null
          risk_level: string | null
          risks: string[] | null
          sentiment_data: Json | null
          sentiment_score: number | null
          sentiment_weight: number | null
          symbol: string
          technical_indicators: Json | null
          technical_score: number | null
          technical_weight: number | null
          updated_at: string
          volume: number | null
        }
        Insert: {
          aggregate_score?: number | null
          ai_summary?: string | null
          analysis_type?: string
          confidence?: number | null
          created_at?: string
          current_price?: number | null
          duration?: string
          exchange?: string
          expires_at?: string | null
          fundamental_metrics?: Json | null
          fundamental_score?: number | null
          fundamental_weight?: number | null
          id?: string
          key_factors?: string[] | null
          price_change?: number | null
          price_change_percent?: number | null
          recommendation?: string | null
          risk_level?: string | null
          risks?: string[] | null
          sentiment_data?: Json | null
          sentiment_score?: number | null
          sentiment_weight?: number | null
          symbol: string
          technical_indicators?: Json | null
          technical_score?: number | null
          technical_weight?: number | null
          updated_at?: string
          volume?: number | null
        }
        Update: {
          aggregate_score?: number | null
          ai_summary?: string | null
          analysis_type?: string
          confidence?: number | null
          created_at?: string
          current_price?: number | null
          duration?: string
          exchange?: string
          expires_at?: string | null
          fundamental_metrics?: Json | null
          fundamental_score?: number | null
          fundamental_weight?: number | null
          id?: string
          key_factors?: string[] | null
          price_change?: number | null
          price_change_percent?: number | null
          recommendation?: string | null
          risk_level?: string | null
          risks?: string[] | null
          sentiment_data?: Json | null
          sentiment_score?: number | null
          sentiment_weight?: number | null
          symbol?: string
          technical_indicators?: Json | null
          technical_score?: number | null
          technical_weight?: number | null
          updated_at?: string
          volume?: number | null
        }
        Relationships: []
      }
      cache: {
        Row: {
          cache_key: string
          cache_value: Json
          created_at: string
          expires_at: string | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cache_key: string
          cache_value: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cache_key?: string
          cache_value?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_cache_value: {
        Args: { _cache_key: string; _user_id?: string }
        Returns: Json
      }
      get_cached_analysis: {
        Args: { p_symbol: string }
        Returns: {
          analysis_data: Json
          created_at: string
        }[]
      }
      save_analysis_cache: {
        Args: { p_analysis_data: Json; p_symbol: string }
        Returns: undefined
      }
      set_cache_value: {
        Args: {
          _cache_key: string
          _cache_value: Json
          _expires_at?: string
          _user_id?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
