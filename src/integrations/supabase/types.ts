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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
          site_id: string | null
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
          site_id?: string | null
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
          site_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          site_id: string | null
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
          site_id?: string | null
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
          site_id?: string | null
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
          {
            foreignKeyName: "import_history_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      network_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      performance_logs: {
        Row: {
          connection_type: string | null
          context: Json | null
          created_at: string
          device_type: string | null
          id: string
          is_slow_connection: boolean | null
          metric_name: string
          metric_value: number
          page_url: string
          site_id: string | null
          visitor_id: string | null
        }
        Insert: {
          connection_type?: string | null
          context?: Json | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_slow_connection?: boolean | null
          metric_name: string
          metric_value: number
          page_url: string
          site_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          connection_type?: string | null
          context?: Json | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_slow_connection?: boolean | null
          metric_name?: string
          metric_value?: number
          page_url?: string
          site_id?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_logs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          site_id: string | null
          status: string
          status_aluguel: string
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
          site_id?: string | null
          status?: string
          status_aluguel?: string
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
          site_id?: string | null
          status?: string
          status_aluguel?: string
          suites?: number
          title?: string
          type?: string
          updated_at?: string
          video_tour_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          site_id: string | null
        }
        Insert: {
          enabled?: boolean
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
          site_id?: string | null
        }
        Update: {
          enabled?: boolean
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
          site_id: string | null
          twitter_user: string | null
          updated_at: string
          watermark_enabled: boolean
          watermark_opacity: number
          watermark_position: string
          watermark_size_pct: number
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
          site_id?: string | null
          twitter_user?: string | null
          updated_at?: string
          watermark_enabled?: boolean
          watermark_opacity?: number
          watermark_position?: string
          watermark_size_pct?: number
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
          site_id?: string | null
          twitter_user?: string | null
          updated_at?: string
          watermark_enabled?: boolean
          watermark_opacity?: number
          watermark_position?: string
          watermark_size_pct?: number
          website_url?: string
          whatsapp_message?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          brand_name: string
          created_at: string
          domain: string
          id: string
          is_active: boolean | null
          last_published_at: string | null
          owner_id: string | null
          publish_status: string | null
          updated_at: string
        }
        Insert: {
          brand_name: string
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean | null
          last_published_at?: string | null
          owner_id?: string | null
          publish_status?: string | null
          updated_at?: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean | null
          last_published_at?: string | null
          owner_id?: string | null
          publish_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_domains: {
        Row: {
          created_at: string
          hostname: string
          id: string
          is_primary: boolean | null
          status: Database["public"]["Enums"]["domain_status"] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hostname: string
          id?: string
          is_primary?: boolean | null
          status?: Database["public"]["Enums"]["domain_status"] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hostname?: string
          id?: string
          is_primary?: boolean | null
          status?: Database["public"]["Enums"]["domain_status"] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["tenant_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"] | null
          updated_at?: string
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
          site_id: string | null
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
          site_id?: string | null
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
          site_id?: string | null
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
          {
            foreignKeyName: "traffic_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          site_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          site_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          site_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
      assign_site_admin: {
        Args: { p_site_id: string; p_user_id: string }
        Returns: boolean
      }
      duplicate_site: {
        Args: {
          new_brand_name: string
          new_domain: string
          source_site_id: string
        }
        Returns: string
      }
      get_tenant_id_by_hostname: {
        Args: { _hostname: string }
        Returns: string
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _site_id: string
              _user_id: string
            }
            Returns: boolean
          }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      save_role_perms: { Args: { p_rows: Json }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "supervisor" | "corretor" | "super_admin"
      domain_status: "pending" | "active" | "failed"
      publish_status_type: "draft" | "published" | "scheduled"
      tenant_status: "active" | "inactive" | "maintenance"
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
      app_role: ["admin", "user", "supervisor", "corretor", "super_admin"],
      domain_status: ["pending", "active", "failed"],
      publish_status_type: ["draft", "published", "scheduled"],
      tenant_status: ["active", "inactive", "maintenance"],
    },
  },
} as const
