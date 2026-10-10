-- ============================================================
-- Foco em Dados — Full Supabase Schema Recreation
-- Execute this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- ############################################################
-- SECTION 1: EXTENSIONS
-- ############################################################
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ############################################################
-- SECTION 2: TABLES
-- ############################################################

-- 2.1. plans
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text UNIQUE NOT NULL CHECK (tier IN ('free', 'starter', 'pro', 'business', 'enterprise')),
  description text,
  price_monthly integer NOT NULL DEFAULT 0,
  price_yearly integer NOT NULL DEFAULT 0,
  limits_dashboards integer NOT NULL DEFAULT 3,
  limits_rows integer NOT NULL DEFAULT 2000,
  limits_marketplaces integer NOT NULL DEFAULT 1,
  limits_chatbots integer NOT NULL DEFAULT 1,
  limits_api_calls integer NOT NULL DEFAULT 0,
  limits_storage_mb integer NOT NULL DEFAULT 50,
  features_json jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2.2. profiles (extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  store_name text,
  segment text CHECK (segment IN ('moda', 'eletronicos', 'alimentacao', 'beleza', 'casa', 'outro')),
  plan_id uuid REFERENCES public.plans(id),
  plan_tier text,
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due', 'trial')),
  avatar_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  lines_consumed integer DEFAULT 0,
  dashboards_created integer DEFAULT 0,
  marketplaces_connected integer DEFAULT 0,
  referral_code text UNIQUE,
  affiliate_enabled boolean DEFAULT false,
  affiliate_balance integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.3. subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  pagseguro_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2.4. payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  subscription_id uuid REFERENCES public.subscriptions(id),
  amount integer NOT NULL,
  currency text DEFAULT 'BRL',
  status text NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  gateway text NOT NULL CHECK (gateway IN ('stripe', 'pagseguro', 'pix')),
  gateway_payment_id text,
  invoice_url text,
  created_at timestamptz DEFAULT now()
);

-- 2.5. dashboards
CREATE TABLE public.dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  name text,
  config jsonb DEFAULT '{}'::jsonb,
  data_source text CHECK (data_source IN ('upload', 'google_sheets', 'shopify', 'woocommerce', 'mercado_livre', 'shopee', 'bling', 'manual')),
  is_favorite boolean DEFAULT false,
  is_public boolean DEFAULT false,
  public_slug text UNIQUE,
  share_token text,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.6. data_uploads
CREATE TABLE public.data_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_id uuid REFERENCES public.dashboards(id),
  filename text NOT NULL,
  original_name text NOT NULL,
  storage_path text NOT NULL,
  file_size integer,
  mime_type text,
  row_count integer,
  rows_count integer,
  column_count integer,
  columns jsonb,
  detected_columns jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message text,
  processed_data jsonb,
  insight_summary text,
  insight_kpis jsonb,
  insight_alerts jsonb,
  insight_forecast jsonb,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2.7. chatbots
CREATE TABLE public.chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  platform text DEFAULT 'whatsapp' CHECK (platform IN ('whatsapp', 'instagram', 'facebook', 'web', 'telegram')),
  config jsonb DEFAULT '{}'::jsonb,
  script_json jsonb DEFAULT '{}'::jsonb,
  script_flow jsonb DEFAULT '{}'::jsonb,
  knowledge_base text,
  phone_number text,
  avatar_url text,
  welcome_message text DEFAULT 'Olá! Como posso ajudar?',
  is_active boolean DEFAULT false,
  status text DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft', 'error')),
  total_conversations integer DEFAULT 0,
  metrics jsonb DEFAULT '{"resolution_rate": 0, "avg_response_time": 0, "satisfaction": 0}'::jsonb,
  webhook_url text,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.8. templates
CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text CHECK (category IN ('vendas', 'estoque', 'marketing', 'chatbot', 'financeiro', 'geral')),
  subcategory text CHECK (subcategory IN ('moda', 'eletronicos', 'alimentacao', 'beleza', 'casa', 'geral')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_image text,
  thumbnail_url text,
  price integer DEFAULT 0,
  is_free boolean DEFAULT true,
  download_count integer DEFAULT 0,
  rating numeric(2,1) DEFAULT 5.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2.9. user_templates
CREATE TABLE public.user_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.templates(id),
  installed_config jsonb,
  purchased_at timestamptz DEFAULT now(),
  payment_id uuid REFERENCES public.payments(id)
);

-- 2.10. integrations
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('shopify', 'woocommerce', 'mercado_livre', 'shopee', 'bling', 'omie', 'tiny', 'google_sheets', 'meta_ads', 'google_ads')),
  label text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  credentials jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'error', 'disconnected', 'pending', 'disabled')),
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz DEFAULT now()
);

-- 2.11. scheduled_reports
CREATE TABLE public.scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_id uuid REFERENCES public.dashboards(id),
  name text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  format text DEFAULT 'pdf' CHECK (format IN ('pdf', 'png', 'excel')),
  last_sent_at timestamptz,
  next_send_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2.12. affiliates
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  referral_code text UNIQUE NOT NULL,
  code text UNIQUE,
  commission_rate integer DEFAULT 20,
  total_earned integer DEFAULT 0,
  total_paid integer DEFAULT 0,
  balance integer DEFAULT 0,
  payout_method text,
  payout_details jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  created_at timestamptz DEFAULT now()
);

-- 2.13. referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id),
  referred_user_id uuid REFERENCES auth.users(id),
  referred_email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'paid', 'expired')),
  commission integer,
  commission_amount integer,
  commission_rate integer DEFAULT 20,
  converted_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2.14. payout_requests
CREATE TABLE public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_id uuid REFERENCES public.affiliates(id),
  amount integer NOT NULL,
  pix_key text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  notes text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2.15. usage_logs
CREATE TABLE public.usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL CHECK (feature IN ('dashboard', 'upload', 'chatbot', 'api_call', 'report', 'integration', 'template')),
  quantity integer DEFAULT 1,
  period date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2.16. notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('upsell', 'limit_warning', 'insight', 'report_ready', 'payment', 'system', 'affiliate', 'campaign', 'alert', 'success', 'error')),
  title text NOT NULL,
  message text,
  channel text DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'whatsapp', 'push')),
  data jsonb,
  metadata jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2.17. chatbot_conversations
CREATE TABLE public.chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES public.chatbots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL,
  message text NOT NULL,
  response text,
  source text DEFAULT 'rag' CHECK (source IN ('rag', 'human', 'fallback', 'ai')),
  satisfaction integer CHECK (satisfaction BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

-- 2.18. tickets (suporte assíncrono)
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  response text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- 2.19. email_sequences
CREATE TABLE public.email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_type text NOT NULL CHECK (sequence_type IN ('onboarding', 'trial', 'retention', 'churn', 'upgrade', 'affiliate', 'welcome')),
  step integer NOT NULL DEFAULT 1,
  subject text,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2.20. processed_events (idempotência para webhooks)
CREATE TABLE public.processed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  handler text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2.21. documents (FAQ para chatbot RAG)
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ############################################################
-- SECTION 3: INDEXES
-- ############################################################
CREATE INDEX idx_profiles_plan_id ON public.profiles(plan_id);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX idx_data_uploads_user_id ON public.data_uploads(user_id);
CREATE INDEX idx_chatbots_user_id ON public.chatbots(user_id);
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX idx_usage_logs_user_feature ON public.usage_logs(user_id, feature, period);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_chatbot_conversations_session ON public.chatbot_conversations(session_id);
CREATE INDEX idx_referrals_affiliate ON public.referrals(affiliate_id);

-- ############################################################
-- SECTION 4: ROW LEVEL SECURITY
-- ############################################################
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

-- processed_events: service role only (no public access)
ALTER TABLE public.processed_events FORCE ROW LEVEL SECURITY;
CREATE POLICY "processed_events_service_only" ON public.processed_events FOR ALL USING (false);

-- Profiles: users can read/update own profile only
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Payments
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Dashboards
CREATE POLICY "dashboards_select_own" ON public.dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dashboards_select_public" ON public.dashboards FOR SELECT USING (is_public = true);
CREATE POLICY "dashboards_insert_own" ON public.dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dashboards_update_own" ON public.dashboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "dashboards_delete_own" ON public.dashboards FOR DELETE USING (auth.uid() = user_id);

-- Data Uploads
CREATE POLICY "uploads_select_own" ON public.data_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uploads_insert_own" ON public.data_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uploads_update_own" ON public.data_uploads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "uploads_delete_own" ON public.data_uploads FOR DELETE USING (auth.uid() = user_id);

-- Chatbots
CREATE POLICY "chatbots_select_own" ON public.chatbots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chatbots_insert_own" ON public.chatbots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chatbots_update_own" ON public.chatbots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "chatbots_delete_own" ON public.chatbots FOR DELETE USING (auth.uid() = user_id);

-- Templates (public read)
CREATE POLICY "templates_select_active" ON public.templates FOR SELECT USING (is_active = true);

-- User Templates
CREATE POLICY "user_templates_select_own" ON public.user_templates FOR SELECT USING (auth.uid() = user_id);

-- Integrations
CREATE POLICY "integrations_select_own" ON public.integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "integrations_insert_own" ON public.integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "integrations_update_own" ON public.integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "integrations_delete_own" ON public.integrations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "integrations_upsert" ON public.integrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scheduled Reports
CREATE POLICY "reports_select_own" ON public.scheduled_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_insert_own" ON public.scheduled_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_update_own" ON public.scheduled_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reports_delete_own" ON public.scheduled_reports FOR DELETE USING (auth.uid() = user_id);

-- Affiliates
CREATE POLICY "affiliates_select_own" ON public.affiliates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "affiliates_insert_own" ON public.affiliates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals
CREATE POLICY "referrals_select_own" ON public.referrals FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.affiliates WHERE id = affiliate_id));

-- Payout Requests
CREATE POLICY "payouts_select_own" ON public.payout_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payouts_insert_own" ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage Logs
CREATE POLICY "usage_select_own" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usage_insert_own" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Chatbot Conversations
CREATE POLICY "conversations_select_own" ON public.chatbot_conversations FOR SELECT USING (auth.uid() = user_id);

-- Tickets
CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tickets_insert_own" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email Sequences
CREATE POLICY "email_seq_select_own" ON public.email_sequences FOR SELECT USING (auth.uid() = user_id);

-- Documents (public read)
CREATE POLICY "documents_select_active" ON public.documents FOR SELECT USING (is_active = true);

-- ############################################################
-- SECTION 5: FUNCTIONS & TRIGGERS
-- ############################################################

-- 5.1. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON public.chatbots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.2. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_id uuid;
  v_referral_code text;
BEGIN
  SELECT id INTO v_plan_id FROM public.plans WHERE tier = 'free' LIMIT 1;
  v_referral_code := 'FOCO' || upper(substr(md5(random()::text), 1, 8));

  INSERT INTO public.profiles (
    id, email, name, plan_id, plan_tier, referral_code, subscription_status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_plan_id,
    'free',
    v_referral_code,
    'active'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.3. Check plan limit before usage
CREATE OR REPLACE FUNCTION public.check_plan_limit(
  p_user_id uuid,
  p_feature text,
  p_quantity integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  v_plan_limit integer;
  v_current_usage integer;
  v_limit_col text;
BEGIN
  -- Map feature to the correct limit column
  v_limit_col := CASE p_feature
    WHEN 'dashboard' THEN 'limits_dashboards'
    WHEN 'upload' THEN 'limits_rows'
    WHEN 'chatbot' THEN 'limits_chatbots'
    WHEN 'integration' THEN 'limits_marketplaces'
    WHEN 'api_call' THEN 'limits_api_calls'
    ELSE NULL
  END;

  IF v_limit_col IS NULL THEN RETURN true; END IF;

  EXECUTE format('SELECT %I FROM public.plans WHERE id = (SELECT plan_id FROM public.profiles WHERE id = $1)', v_limit_col)
    INTO v_plan_limit USING p_user_id;

  IF v_plan_limit IS NULL OR v_plan_limit >= 999999 THEN RETURN true; END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO v_current_usage
  FROM public.usage_logs
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND period = date_trunc('month', now())::date;

  RETURN (v_current_usage + p_quantity) <= v_plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.4. Upsell notification on usage insert
CREATE OR REPLACE FUNCTION public.create_upsell_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_limit integer;
  v_current_usage integer;
  v_usage_percent numeric;
  v_limit_col text;
BEGIN
  v_limit_col := CASE NEW.feature
    WHEN 'dashboard' THEN 'limits_dashboards'
    WHEN 'upload' THEN 'limits_rows'
    WHEN 'chatbot' THEN 'limits_chatbots'
    WHEN 'integration' THEN 'limits_marketplaces'
    ELSE NULL
  END;

  IF v_limit_col IS NULL THEN RETURN NEW; END IF;

  EXECUTE format('SELECT %I FROM public.plans WHERE id = (SELECT plan_id FROM public.profiles WHERE id = $1)', v_limit_col)
    INTO v_plan_limit USING NEW.user_id;

  IF v_plan_limit IS NULL OR v_plan_limit >= 999999 THEN RETURN NEW; END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO v_current_usage
  FROM public.usage_logs
  WHERE user_id = NEW.user_id
    AND feature = NEW.feature
    AND period = date_trunc('month', now())::date;

  v_usage_percent := (v_current_usage::numeric / NULLIF(v_plan_limit, 0)) * 100;

  IF v_usage_percent >= 80 AND v_usage_percent < 100 THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'upsell',
      'Você está quase no limite!',
      'Você usou ' || v_current_usage || ' de ' || v_plan_limit || ' ' || NEW.feature || 's este mês. Faça upgrade para continuar sem limites.',
      jsonb_build_object('feature', NEW.feature, 'usage', v_current_usage, 'limit', v_plan_limit, 'percent', v_usage_percent)
    );
  ELSIF v_usage_percent >= 100 THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'limit_warning',
      'Limite atingido!',
      'Você atingiu o limite de ' || v_plan_limit || ' ' || NEW.feature || 's. Faça upgrade para continuar usando.',
      jsonb_build_object('feature', NEW.feature, 'usage', v_current_usage, 'limit', v_plan_limit)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_upsell_notification
  AFTER INSERT ON public.usage_logs
  FOR EACH ROW EXECUTE FUNCTION public.create_upsell_notification();

-- 5.5. Affiliate commission on first payment
CREATE OR REPLACE FUNCTION public.calculate_affiliate_commission()
RETURNS TRIGGER AS $$
DECLARE
  v_affiliate_id uuid;
  v_plan_price integer;
  v_commission integer;
BEGIN
  SELECT a.id INTO v_affiliate_id
  FROM public.referrals r
  JOIN public.affiliates a ON a.id = r.affiliate_id
  WHERE r.referred_user_id = NEW.user_id AND r.status = 'pending'
  LIMIT 1;

  IF v_affiliate_id IS NOT NULL THEN
    SELECT p.price_monthly INTO v_plan_price
    FROM public.subscriptions s
    JOIN public.plans p ON p.id = s.plan_id
    WHERE s.id = NEW.subscription_id
    LIMIT 1;

    v_commission := COALESCE((v_plan_price * 20) / 100, 0);

    UPDATE public.referrals
    SET status = 'converted',
        commission_amount = v_commission,
        converted_at = now()
    WHERE referred_user_id = NEW.user_id AND status = 'pending';

    UPDATE public.affiliates
    SET balance = balance + v_commission,
        total_earned = total_earned + v_commission
    WHERE id = v_affiliate_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_affiliate_commission
  AFTER INSERT ON public.payments
  FOR EACH ROW
  WHEN (NEW.status = 'succeeded')
  EXECUTE FUNCTION public.calculate_affiliate_commission();

-- ############################################################
-- SECTION 6: SEED DATA
-- ############################################################

-- 6.1. Plans
INSERT INTO public.plans (name, tier, description, price_monthly, price_yearly, limits_dashboards, limits_rows, limits_marketplaces, limits_chatbots, limits_api_calls, limits_storage_mb, features_json, sort_order) VALUES
  ('Gratuito', 'free', 'Para testar a plataforma sem compromisso.', 0, 0, 3, 2000, 1, 1, 0, 50, '["templates_basicos", "upload_csv", "chatbot_basico", "comunidade_publica"]'::jsonb, 1),
  ('Starter', 'starter', 'Para pequenos lojistas que querem crescer.', 9700, 97000, 10, 50000, 3, 3, 1000, 500, '["templates_premium", "alertas_automaticos", "exportacao_pdf", "relatorios_agendados", "comunidade_privada"]'::jsonb, 2),
  ('Pro', 'pro', 'Para negócios em expansão com equipe enxuta.', 29700, 297000, 999999, 500000, 10, 999999, 10000, 2000, '["api_publica", "white_label", "forecast_basico", "benchmark_anonimo", "integracoes_ilimitadas", "suporte_tickets_48h"]'::jsonb, 3),
  ('Business', 'business', 'Para equipes que precisam de análises avançadas.', 59700, 597000, 999999, 999999, 999999, 999999, 100000, 10000, '["multiplos_usuarios", "forecast_avancado", "benchmark_segmentado", "suporte_tickets_24h", "onboarding_automatizado"]'::jsonb, 4),
  ('Enterprise', 'enterprise', 'Para grandes operações com demandas personalizadas.', 99700, 997000, 999999, 999999, 999999, 999999, 999999, 100000, '["usuarios_ilimitados", "data_lake_dedicado", "ia_customizada", "sla_99_9", "suporte_prioritario", "dedicated_ip"]'::jsonb, 5);

-- 6.2. Templates
INSERT INTO public.templates (name, description, category, subcategory, config_json, price, is_free, download_count, rating) VALUES
  ('Dashboard de Vendas - Moda', 'Acompanhe receita, ticket médio e produtos mais vendidos no segmento de moda.', 'vendas', 'moda', '{"charts": [{"type": "line", "metric": "revenue"}, {"type": "bar", "metric": "top_products"}, {"type": "kpi", "metric": "avg_ticket"}]}'::jsonb, 0, true, 234, 4.7),
  ('Dashboard de Estoque', 'Controle de estoque com alertas de reposição e previsão de demanda.', 'estoque', 'geral', '{"charts": [{"type": "bar", "metric": "stock_level"}, {"type": "line", "metric": "turnover"}, {"type": "kpi", "metric": "low_stock_count"}]}'::jsonb, 0, true, 189, 4.5),
  ('Dashboard de Marketing - Meta Ads', 'Acompanhe ROAS, CTR, CPC e custo por conversão das suas campanhas.', 'marketing', 'geral', '{"charts": [{"type": "line", "metric": "roas"}, {"type": "bar", "metric": "ctr"}, {"type": "kpi", "metric": "cost_per_conversion"}]}'::jsonb, 19700, false, 87, 4.8),
  ('Chatbot - Atendimento Moda', 'Fluxo completo de atendimento para loja de moda com perguntas frequentes.', 'chatbot', 'moda', '{"flows": [{"trigger": "trocar", "response": "Claro! Qual o número do pedido?"}, {"trigger": "tamanho", "response": "Temos do P ao GG. Qual você precisa?"}, {"trigger": "prazo", "response": "O prazo médio é de 7 dias úteis."}]}'::jsonb, 0, true, 312, 4.6),
  ('Previsão de Demanda - Alimentação', 'Preveja demanda por produto com base em dados históricos e sazonalidade.', 'vendas', 'alimentacao', '{"model": "time_series", "forecast_days": 30, "charts": [{"type": "line", "metric": "forecast"}, {"type": "area", "metric": "demand"}]}'::jsonb, 29700, false, 45, 4.9),
  ('Dashboard Financeiro', 'Acompanhe DRE, fluxo de caixa e margem por produto.', 'financeiro', 'geral', '{"charts": [{"type": "line", "metric": "cash_flow"}, {"type": "pie", "metric": "expenses_by_category"}, {"type": "kpi", "metric": "gross_margin"}]}'::jsonb, 0, true, 156, 4.3),
  ('Dashboard de Vendas - Geral', 'Template genérico de vendas para qualquer segmento do varejo.', 'vendas', 'geral', '{"charts": [{"type": "line", "metric": "revenue"}, {"type": "pie", "metric": "sales_by_category"}, {"type": "bar", "metric": "daily_sales"}]}'::jsonb, 0, true, 567, 4.4);

-- 6.3. FAQ Documents (para Chatbot RAG)
INSERT INTO public.documents (title, content, category, tags) VALUES
  ('Como conectar minha loja Shopify?', 'Vá em Configurações > Integrações > Shopify. Clique em "Conectar" e autorize o acesso da Foco em Dados aos seus dados. Você será redirecionado para a página de autenticação da Shopify.', 'Integrações', '["shopify", "integracao", "conexao"]'::jsonb),
  ('Como fazer upload de planilha?', 'Acesse a página Upload e arraste seu arquivo CSV ou Excel na área pontilhada. Formatos aceitos: .csv, .xlsx, .xls. Tamanho máximo: 10MB. Colunas mínimas necessárias: produto, quantidade, valor.', 'Upload', '["upload", "planilha", "csv", "excel"]'::jsonb),
  ('Como criar alertas de estoque?', 'No dashboard de Estoque, clique em "Configurar Alertas" no canto superior direito. Defina o limite mínimo por produto ou categoria. Você receberá uma notificação quando o estoque atingir o limite.', 'Dashboards', '["alerta", "estoque", "notificacao"]'::jsonb),
  ('Como gerar previsão de vendas?', 'No dashboard, clique no botão "Gerar Previsão" no painel de métricas. A IA analisa seus dados históricos dos últimos 12 meses e gera uma projeção para os próximos 30 dias.', 'Dashboards', '["previsao", "forecast", "ia", "vendas"]'::jsonb),
  ('Como fazer upgrade de plano?', 'Clique no seu plano atual no canto superior direito do header e selecione "Fazer Upgrade". Escolha o novo plano e finalize o pagamento. As novas funcionalidades ficam disponíveis imediatamente.', 'Planos', '["upgrade", "plano", "assinatura", "pagamento"]'::jsonb),
  ('Como configurar chatbot no WhatsApp?', 'Vá em Chatbots > Novo Chatbot. Selecione "WhatsApp" como plataforma. Configure o fluxo de conversa no editor visual. Para conectar ao WhatsApp oficial, você precisa de uma conta Business Meta.', 'Chatbots', '["chatbot", "whatsapp", "bot", "automacao"]'::jsonb),
  ('Quais integrações estão disponíveis?', 'Shopify, WooCommerce, Mercado Livre, Shopee, Bling, Omie, Tiny, Google Sheets, Meta Ads e Google Ads. Acesse Configurações > Integrações para conectar.', 'Integrações', '["integracao", "shopify", "woocommerce", "mercado_livre", "shopee", "bling"]'::jsonb),
  ('Como convidar membros da equipe?', 'O plano Business permite até 5 usuários. Vá em Configurações > Equipe e clique em "Convidar". Envie o link de convite por email. O convidado precisa criar uma conta para acessar.', 'Planos', '["equipe", "usuarios", "convite", "business"]'::jsonb),
  ('Como funciona o programa de afiliados?', 'Compartilhe seu link único de afiliado. Quando alguém assinar um plano pago usando seu link, você ganha 20% de comissão sobre o valor da primeira mensalidade. Saques a partir de R$ 50 via Pix.', 'Afiliados', '["afiliado", "comissao", "referral", "pix", "saque"]'::jsonb),
  ('Como exportar relatórios?', 'No dashboard, clique no ícone de exportação no canto superior direito. Escolha entre PDF, PNG ou Excel. Relatórios agendados podem ser configurados em Configurações > Relatórios Agendados.', 'Dashboards', '["exportar", "relatorio", "pdf", "excel", "agendado"]'::jsonb);

-- ############################################################
-- SECTION 7: STORAGE POLICIES (run after bucket creation)
-- ############################################################
-- Execute these AFTER creating the buckets in the Dashboard:
-- 1. Create bucket "uploads" (private)
-- 2. Create bucket "exports" (private)
-- 3. Create bucket "public" (public)
--
-- Bucket policies:
--
-- uploads:
-- CREATE POLICY "uploads_select" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "uploads_insert" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "uploads_delete" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
--
-- exports: same as uploads
--
-- public:
-- CREATE POLICY "public_select" ON storage.objects FOR SELECT USING (bucket_id = 'public');
-- CREATE POLICY "public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public');
