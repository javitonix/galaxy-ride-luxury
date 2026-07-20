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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contact_information: {
        Row: {
          created_at: string
          email: string | null
          id: string
          label: string
          primary_phone: string | null
          secondary_phone: string | null
          support_copy: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          label: string
          primary_phone?: string | null
          secondary_phone?: string | null
          support_copy?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          label?: string
          primary_phone?: string | null
          secondary_phone?: string | null
          support_copy?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      fleet: {
        Row: {
          amenities: string[]
          brand: string | null
          code: string
          created_at: string
          description: string | null
          gallery_urls: string[]
          hero_image_url: string | null
          id: string
          is_featured: boolean
          name: string
          passenger_capacity: number | null
          sort_order: number
          specs: Json
          unit_number: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          brand?: string | null
          code: string
          created_at?: string
          description?: string | null
          gallery_urls?: string[]
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          name: string
          passenger_capacity?: number | null
          sort_order?: number
          specs?: Json
          unit_number?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          brand?: string | null
          code?: string
          created_at?: string
          description?: string | null
          gallery_urls?: string[]
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          passenger_capacity?: number | null
          sort_order?: number
          specs?: Json
          unit_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      office_locations: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string | null
          id: string
          map_label: string | null
          name: string
          phone_numbers: string[]
          sort_order: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email?: string | null
          id?: string
          map_label?: string | null
          name: string
          phone_numbers?: string[]
          sort_order?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          map_label?: string | null
          name?: string
          phone_numbers?: string[]
          sort_order?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      social_media_links: {
        Row: {
          created_at: string
          handle: string | null
          id: string
          label: string
          platform: string
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          handle?: string | null
          id?: string
          label: string
          platform: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          handle?: string | null
          id?: string
          label?: string
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          customer_name: string
          customer_role: string | null
          id: string
          is_published: boolean
          quote: string
          rating: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          customer_name: string
          customer_role?: string | null
          id?: string
          is_published?: boolean
          quote: string
          rating?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          customer_name?: string
          customer_role?: string | null
          id?: string
          is_published?: boolean
          quote?: string
          rating?: number
          sort_order?: number
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
