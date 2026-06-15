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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contact_info: {
        Row: {
          email_contact: string
          id: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          email_contact?: string
          id?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          email_contact?: string
          id?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          interest: string
          message: string
          name: string
          phone: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest?: string
          message?: string
          name: string
          phone?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest?: string
          message?: string
          name?: string
          phone?: string
          source?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      import_history: {
        Row: {
          company_updated: boolean
          created_at: string
          errors: Json
          file_name: string
          file_size: number
          id: string
          log: Json
          parent_import_id: string | null
          properties_created: number
          properties_failed: number
          properties_total: number
          reprocess: boolean
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_updated?: boolean
          created_at?: string
          errors?: Json
          file_name: string
          file_size?: number
          id?: string
          log?: Json
          parent_import_id?: string | null
          properties_created?: number
          properties_failed?: number
          properties_total?: number
          reprocess?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_updated?: boolean
          created_at?: string
          errors?: Json
          file_name?: string
          file_size?: number
          id?: string
          log?: Json
          parent_import_id?: string | null
          properties_created?: number
          properties_failed?: number
          properties_total?: number
          reprocess?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_history_parent_import_id_fkey"
            columns: ["parent_import_id"]
            isOneToOne: false
            referencedRelation: "import_history"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_logs: {
        Row: {
          connection_type: string | null
          created_at: string
          device_type: string | null
          id: string
          is_slow_connection: boolean | null
          metric_name: string
          metric_value: number
          page_url: string
          visitor_id: string | null
        }
        Insert: {
          connection_type?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_slow_connection?: boolean | null
          metric_name: string
          metric_value: number
          page_url: string
          visitor_id?: string | null
        }
        Update: {
          connection_type?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_slow_connection?: boolean | null
          metric_name?: string
          metric_value?: number
          page_url?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[]
          area: number
          bathrooms: number
          bedrooms: number
          category: string
          city: string
          code: string
          created_at: string
          description: string
          exclusive: boolean
          featured: boolean
          id: string
          images: string[]
          neighborhood: string
          parking: number
          previous_price: number
          price: number
          status: string
          suites: number
          title: string
          type: string
          updated_at: string
          video_tour_url: string
        }
        Insert: {
          address?: string
          amenities?: string[]
          area?: number
          bathrooms?: number
          bedrooms?: number
          category?: string
          city?: string
          code: string
          created_at?: string
          description?: string
          exclusive?: boolean
          featured?: boolean
          id?: string
          images?: string[]
          neighborhood?: string
          parking?: number
          previous_price?: number
          price?: number
          status?: string
          suites?: number
          title: string
          type?: string
          updated_at?: string
          video_tour_url?: string
        }
        Update: {
          address?: string
          amenities?: string[]
          area?: number
          bathrooms?: number
          bedrooms?: number
          category?: string
          city?: string
          code?: string
          created_at?: string
          description?: string
          exclusive?: boolean
          featured?: boolean
          id?: string
          images?: string[]
          neighborhood?: string
          parking?: number
          previous_price?: number
          price?: number
          status?: string
          suites?: number
          title?: string
          type?: string
          updated_at?: string
          video_tour_url?: string
        }
        Relationships: []
      }
      property_views: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
          property_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string
          property_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
          property_id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          id: string
          key: string
          scope: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          scope: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          scope?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          enabled: boolean
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          enabled?: boolean
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          enabled?: boolean
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accent_color: string
          available_amenities: string[]
          banner_interval: number
          bing_site_verification: string
          brand_name: string
          concierge_cargo: string
          concierge_desc: string
          concierge_nome: string
          creci: string
          creci_uf: string
          developer_name: string
          developer_url: string
          facebook_url: string
          footer_text: string
          google_site_verification: string
          header_style: string | null
          hero_subtitle: string
          hero_title: string
          id: string
          images_access_mode: string
          instagram_url: string
          lead_modal_description: string
          lead_modal_enabled: boolean
          lead_modal_name_label: string
          lead_modal_name_placeholder: string
          lead_modal_phone_label: string
          lead_modal_phone_placeholder: string
          lead_modal_show_skip: boolean
          lead_modal_skip_text: string
          lead_modal_submit_text: string
          lead_modal_submitting_text: string
          lead_modal_title: string
          linkedin_url: string
          logo_height_px: number
          logo_url: string
          logo_width_px: number
          marquee_padding_y_px: number
          marquee_text: string | null
          navbar_height_px: number
          price_format: Json
          price_styles: Json
          primary_color: string
          privacy_policy: string
          show_location_on_card: boolean
          show_visit_schedule: boolean
          updated_at: string
          website_url: string
          whatsapp_message: string
          youtube_url: string
        }
        Insert: {
          accent_color?: string
          available_amenities?: string[]
          banner_interval?: number
          bing_site_verification?: string
          brand_name?: string
          concierge_cargo?: string
          concierge_desc?: string
          concierge_nome?: string
          creci?: string
          creci_uf?: string
          developer_name?: string
          developer_url?: string
          facebook_url?: string
          footer_text?: string
          google_site_verification?: string
          header_style?: string | null
          hero_subtitle?: string
          hero_title?: string
          id?: string
          images_access_mode?: string
          instagram_url?: string
          lead_modal_description?: string
          lead_modal_enabled?: boolean
          lead_modal_name_label?: string
          lead_modal_name_placeholder?: string
          lead_modal_phone_label?: string
          lead_modal_phone_placeholder?: string
          lead_modal_show_skip?: boolean
          lead_modal_skip_text?: string
          lead_modal_submit_text?: string
          lead_modal_submitting_text?: string
          lead_modal_title?: string
          linkedin_url?: string
          logo_height_px?: number
          logo_url?: string
          logo_width_px?: number
          marquee_padding_y_px?: number
          marquee_text?: string | null
          navbar_height_px?: number
          price_format?: Json
          price_styles?: Json
          primary_color?: string
          privacy_policy?: string
          show_location_on_card?: boolean
          show_visit_schedule?: boolean
          updated_at?: string
          website_url?: string
          whatsapp_message?: string
          youtube_url?: string
        }
        Update: {
          accent_color?: string
          available_amenities?: string[]
          banner_interval?: number
          bing_site_verification?: string
          brand_name?: string
          concierge_cargo?: string
          concierge_desc?: string
          concierge_nome?: string
          creci?: string
          creci_uf?: string
          developer_name?: string
          developer_url?: string
          facebook_url?: string
          footer_text?: string
          google_site_verification?: string
          header_style?: string | null
          hero_subtitle?: string
          hero_title?: string
          id?: string
          images_access_mode?: string
          instagram_url?: string
          lead_modal_description?: string
          lead_modal_enabled?: boolean
          lead_modal_name_label?: string
          lead_modal_name_placeholder?: string
          lead_modal_phone_label?: string
          lead_modal_phone_placeholder?: string
          lead_modal_show_skip?: boolean
          lead_modal_skip_text?: string
          lead_modal_submit_text?: string
          lead_modal_submitting_text?: string
          lead_modal_title?: string
          linkedin_url?: string
          logo_height_px?: number
          logo_url?: string
          logo_width_px?: number
          marquee_padding_y_px?: number
          marquee_text?: string | null
          navbar_height_px?: number
          price_format?: Json
          price_styles?: Json
          primary_color?: string
          privacy_policy?: string
          show_location_on_card?: boolean
          show_visit_schedule?: boolean
          updated_at?: string
          website_url?: string
          whatsapp_message?: string
          youtube_url?: string
        }
        Relationships: []
      }
      traffic_events: {
        Row: {
          browser: string
          campaign: string
          channel: string
          content: string
          country: string
          created_at: string
          device_type: string
          event_type: string
          full_url: string
          id: string
          landing_page: string
          language: string
          medium: string
          os: string
          pathname: string
          property_id: string | null
          referrer_domain: string
          referrer_url: string
          session_id: string
          social_network: string
          source: string
          term: string
          visitor_id: string
        }
        Insert: {
          browser?: string
          campaign?: string
          channel?: string
          content?: string
          country?: string
          created_at?: string
          device_type?: string
          event_type?: string
          full_url?: string
          id?: string
          landing_page?: string
          language?: string
          medium?: string
          os?: string
          pathname?: string
          property_id?: string | null
          referrer_domain?: string
          referrer_url?: string
          session_id?: string
          social_network?: string
          source?: string
          term?: string
          visitor_id?: string
        }
        Update: {
          browser?: string
          campaign?: string
          channel?: string
          content?: string
          country?: string
          created_at?: string
          device_type?: string
          event_type?: string
          full_url?: string
          id?: string
          landing_page?: string
          language?: string
          medium?: string
          os?: string
          pathname?: string
          property_id?: string | null
          referrer_domain?: string
          referrer_url?: string
          session_id?: string
          social_network?: string
          source?: string
          term?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visit_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          preferred_date: string
          preferred_time: string
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string
          name: string
          phone?: string
          preferred_date: string
          preferred_time?: string
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          preferred_date?: string
          preferred_time?: string
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "supervisor" | "corretor"
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
      app_role: ["admin", "user", "supervisor", "corretor"],
    },
  },
} as const
