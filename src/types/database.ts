// ============================================================
// Foco em Dados — Supabase Database TypeScript Types
// Generated manually to match the SQL schema
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string
          name: string
          tier: 'free' | 'starter' | 'pro' | 'business' | 'enterprise'
          description: string | null
          price_monthly: number
          price_yearly: number
          limits_dashboards: number
          limits_rows: number
          limits_marketplaces: number
          limits_chatbots: number
          limits_api_calls: number
          limits_storage_mb: number
          features_json: Json
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Tables['plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['plans']['Row']>
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          store_name: string | null
          segment: string | null
          plan_id: string | null
          plan_tier: string | null
          subscription_status: string
          avatar_url: string | null
          metadata: Json
          lines_consumed: number
          dashboards_created: number
          marketplaces_connected: number
          referral_code: string | null
          affiliate_enabled: boolean
          affiliate_balance: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['profiles']['Row']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
        }
        Insert: Omit<Tables['subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['subscriptions']['Row']>
      }
      payments: {
        Row: {
          id: string
          user_id: string | null
          subscription_id: string | null
          amount: number
          currency: string
          status: string
          gateway: string
          gateway_payment_id: string | null
          invoice_url: string | null
          created_at: string
        }
        Insert: Omit<Tables['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['payments']['Row']>
      }
      dashboards: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          name: string | null
          config: Json
          data_source: string | null
          is_favorite: boolean
          is_public: boolean
          public_slug: string | null
          share_token: string | null
          last_viewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['dashboards']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['dashboards']['Row']>
      }
      data_uploads: {
        Row: {
          id: string
          user_id: string
          dashboard_id: string | null
          filename: string
          original_name: string
          storage_path: string
          file_size: number | null
          mime_type: string | null
          row_count: number | null
          rows_count: number | null
          column_count: number | null
          columns: Json | null
          detected_columns: Json | null
          status: string
          error_message: string | null
          processed_data: Json | null
          insight_summary: string | null
          insight_kpis: Json | null
          insight_alerts: Json | null
          insight_forecast: Json | null
          processed_at: string | null
          created_at: string
        }
        Insert: Omit<Tables['data_uploads']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['data_uploads']['Row']>
      }
      chatbots: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          platform: string
          config: Json
          script_json: Json
          script_flow: Json
          knowledge_base: string | null
          phone_number: string | null
          avatar_url: string | null
          welcome_message: string
          is_active: boolean
          status: string
          total_conversations: number
          metrics: Json
          webhook_url: string | null
          last_active_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['chatbots']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['chatbots']['Row']>
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          subcategory: string | null
          config: Json
          config_json: Json
          preview_image: string | null
          thumbnail_url: string | null
          price: number
          is_free: boolean
          download_count: number
          rating: number | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Tables['templates']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['templates']['Row']>
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          provider: string
          label: string | null
          config: Json
          credentials: Json
          status: string
          last_sync_at: string | null
          last_error: string | null
          created_at: string
        }
        Insert: Omit<Tables['integrations']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['integrations']['Row']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          channel: string
          data: Json | null
          metadata: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Tables['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['notifications']['Row']>
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          feature: string
          quantity: number
          period: string
          created_at: string
        }
        Insert: Omit<Tables['usage_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['usage_logs']['Row']>
      }
      affiliates: {
        Row: {
          id: string
          user_id: string
          referral_code: string
          code: string | null
          commission_rate: number
          total_earned: number
          total_paid: number
          balance: number
          payout_method: string | null
          payout_details: Json | null
          status: string
          created_at: string
        }
        Insert: Omit<Tables['affiliates']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['affiliates']['Row']>
      }
      referrals: {
        Row: {
          id: string
          affiliate_id: string | null
          referred_user_id: string | null
          referred_email: string | null
          status: string
          commission: number | null
          commission_amount: number | null
          commission_rate: number
          converted_at: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: Omit<Tables['referrals']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['referrals']['Row']>
      }
      payout_requests: {
        Row: {
          id: string
          user_id: string
          affiliate_id: string | null
          amount: number
          pix_key: string | null
          status: string
          notes: string | null
          processed_at: string | null
          created_at: string
        }
        Insert: Omit<Tables['payout_requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['payout_requests']['Row']>
      }
      scheduled_reports: {
        Row: {
          id: string
          user_id: string
          dashboard_id: string | null
          name: string
          frequency: string
          recipients: Json
          format: string
          last_sent_at: string | null
          next_send_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Tables['scheduled_reports']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['scheduled_reports']['Row']>
      }
      user_templates: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          installed_config: Json | null
          purchased_at: string | null
          payment_id: string | null
        }
        Insert: Omit<Tables['user_templates']['Row'], 'id'>
        Update: Partial<Tables['user_templates']['Row']>
      }
      chatbot_conversations: {
        Row: {
          id: string
          chatbot_id: string | null
          user_id: string | null
          session_id: string
          message: string
          response: string | null
          source: string
          satisfaction: number | null
          created_at: string
        }
        Insert: Omit<Tables['chatbot_conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['chatbot_conversations']['Row']>
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          status: string
          priority: string
          response: string | null
          responded_at: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: Omit<Tables['tickets']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['tickets']['Row']>
      }
      email_sequences: {
        Row: {
          id: string
          user_id: string
          sequence_type: string
          step: number
          subject: string | null
          sent_at: string | null
          opened_at: string | null
          clicked_at: string | null
          created_at: string
        }
        Insert: Omit<Tables['email_sequences']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['email_sequences']['Row']>
      }
      processed_events: {
        Row: {
          id: string
          event_id: string
          event_type: string
          handler: string
          created_at: string
        }
        Insert: Omit<Tables['processed_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['processed_events']['Row']>
      }
      documents: {
        Row: {
          id: string
          title: string
          content: string
          category: string | null
          tags: Json
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Tables['documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['documents']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: {
      check_plan_limit: {
        Args: { p_user_id: string; p_feature: string; p_quantity?: number }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]
export type TableRow<T extends keyof Database['public']['Tables']> = Tables<T>['Row']
export type TableInsert<T extends keyof Database['public']['Tables']> = Tables<T>['Insert']
export type TableUpdate<T extends keyof Database['public']['Tables']> = Tables<T>['Update']

// Commonly used row types
export type Plan = TableRow<'plans'>
export type Profile = TableRow<'profiles'>
export type Dashboard = TableRow<'dashboards'>
export type DataUpload = TableRow<'data_uploads'>
export type Chatbot = TableRow<'chatbots'>
export type Template = TableRow<'templates'>
export type Integration = TableRow<'integrations'>
export type Notification = TableRow<'notifications'>
export type Affiliate = TableRow<'affiliates'>
export type Referral = TableRow<'referrals'>
export type PayoutRequest = TableRow<'payout_requests'>
export type UsageLog = TableRow<'usage_logs'>
export type Ticket = TableRow<'tickets'>
export type Document = TableRow<'documents'>
