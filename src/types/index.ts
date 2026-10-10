export interface Profile {
  id: string;
  email: string;
  name: string;
  store_name?: string;
  segment?: string;
  plan_id?: string;
  plan_tier?: string;
  subscription_status?: string;
  avatar_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  tier: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  limits_dashboards: number;
  limits_rows: number;
  limits_marketplaces: number;
  limits_chatbots: number;
  limits_api_calls: number;
  limits_storage_mb: number;
  features_json?: string[];
  is_active: boolean;
  sort_order: number;
}

export interface Dashboard {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  config_json: any;
  data_source?: string;
  is_favorite?: boolean;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DataUpload {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  row_count?: number;
  column_count?: number;
  detected_columns?: any[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  processed_data?: any;
  insight_summary?: string;
  insight_kpis?: any;
  insight_alerts?: any;
  insight_forecast?: any;
  processed_at?: string;
  created_at: string;
}

export interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  script_json: any;
  platform: string;
  phone_number?: string;
  avatar_url?: string;
  status: string;
  total_conversations?: number;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  config_json: any;
  thumbnail_url?: string;
  price: number;
  is_free: boolean;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  channel: string;
  is_read: boolean;
  metadata?: any;
  created_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  total_earned: number;
  total_paid: number;
  payout_method?: string;
  payout_details?: any;
  status: string;
  created_at: string;
}

export interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id?: string;
  referred_email?: string;
  status: string;
  commission_rate: number;
  commission_amount?: number;
  paid_at?: string;
  created_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  label?: string;
  config: any;
  status: string;
  last_sync_at?: string;
  error_message?: string;
  created_at: string;
}
