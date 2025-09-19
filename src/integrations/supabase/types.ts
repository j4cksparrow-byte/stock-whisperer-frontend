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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analysis_results: {
        Row: {
          aggregate_score: number
          ai_summary: string | null
          analysis_type: string
          catalysts: Json | null
          confidence: number
          created_at: string
          current_price: number | null
          duration: string
          exchange: string
          expires_at: string
          fundamental_metrics: Json | null
          fundamental_score: number
          fundamental_weight: number
          id: string
          key_factors: Json | null
          price_change: number | null
          price_change_percent: number | null
          recommendation: string
          risk_level: string
          risks: Json | null
          sentiment_data: Json | null
          sentiment_score: number
          sentiment_weight: number
          symbol: string
          technical_indicators: Json | null
          technical_score: number
          technical_weight: number
          volume: number | null
        }
        Insert: {
          aggregate_score: number
          ai_summary?: string | null
          analysis_type: string
          catalysts?: Json | null
          confidence: number
          created_at?: string
          current_price?: number | null
          duration?: string
          exchange: string
          expires_at?: string
          fundamental_metrics?: Json | null
          fundamental_score: number
          fundamental_weight?: number
          id?: string
          key_factors?: Json | null
          price_change?: number | null
          price_change_percent?: number | null
          recommendation: string
          risk_level: string
          risks?: Json | null
          sentiment_data?: Json | null
          sentiment_score: number
          sentiment_weight?: number
          symbol: string
          technical_indicators?: Json | null
          technical_score: number
          technical_weight?: number
          volume?: number | null
        }
        Update: {
          aggregate_score?: number
          ai_summary?: string | null
          analysis_type?: string
          catalysts?: Json | null
          confidence?: number
          created_at?: string
          current_price?: number | null
          duration?: string
          exchange?: string
          expires_at?: string
          fundamental_metrics?: Json | null
          fundamental_score?: number
          fundamental_weight?: number
          id?: string
          key_factors?: Json | null
          price_change?: number | null
          price_change_percent?: number | null
          recommendation?: string
          risk_level?: string
          risks?: Json | null
          sentiment_data?: Json | null
          sentiment_score?: number
          sentiment_weight?: number
          symbol?: string
          technical_indicators?: Json | null
          technical_score?: number
          technical_weight?: number
          volume?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          employees: number | null
          exchange: string
          founded: number | null
          id: string
          industry: string | null
          logo_url: string | null
          market_cap: number | null
          name: string
          sector: string | null
          symbol: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          employees?: number | null
          exchange: string
          founded?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          market_cap?: number | null
          name: string
          sector?: string | null
          symbol: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          employees?: number | null
          exchange?: string
          founded?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          market_cap?: number | null
          name?: string
          sector?: string | null
          symbol?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      market_data_cache: {
        Row: {
          created_at: string
          data: Json
          data_type: string
          exchange: string
          expires_at: string
          id: string
          symbol: string
          timeframe: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          data_type: string
          exchange: string
          expires_at?: string
          id?: string
          symbol: string
          timeframe?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          data_type?: string
          exchange?: string
          expires_at?: string
          id?: string
          symbol?: string
          timeframe?: string | null
        }
        Relationships: []
      }
      news_sentiment_cache: {
        Row: {
          created_at: string
          exchange: string
          expires_at: string
          id: string
          news_data: Json
          sentiment_analysis: Json
          symbol: string
        }
        Insert: {
          created_at?: string
          exchange: string
          expires_at?: string
          id?: string
          news_data: Json
          sentiment_analysis: Json
          symbol: string
        }
        Update: {
          created_at?: string
          exchange?: string
          expires_at?: string
          id?: string
          news_data?: Json
          sentiment_analysis?: Json
          symbol?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      stock_analysis_cache: {
        Row: {
          analysis_text: string
          created_at: string
          exchange: string
          id: string
          symbol: string
        }
        Insert: {
          analysis_text: string
          created_at?: string
          exchange: string
          id?: string
          symbol: string
        }
        Update: {
          analysis_text?: string
          created_at?: string
          exchange?: string
          id?: string
          symbol?: string
        }
        Relationships: []
      }
      user_analysis_preferences: {
        Row: {
          created_at: string
          default_analysis_mode: string
          default_duration: string
          default_fundamental_weight: number
          default_sentiment_weight: number
          default_technical_weight: number
          id: string
          preferred_fundamental_filters: Json | null
          preferred_sentiment_filters: Json | null
          preferred_technical_indicators: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_analysis_mode?: string
          default_duration?: string
          default_fundamental_weight?: number
          default_sentiment_weight?: number
          default_technical_weight?: number
          id?: string
          preferred_fundamental_filters?: Json | null
          preferred_sentiment_filters?: Json | null
          preferred_technical_indicators?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_analysis_mode?: string
          default_duration?: string
          default_fundamental_weight?: number
          default_sentiment_weight?: number
          default_technical_weight?: number
          id?: string
          preferred_fundamental_filters?: Json | null
          preferred_sentiment_filters?: Json | null
          preferred_technical_indicators?: Json | null
          updated_at?: string
          user_id?: string
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
