-- ============================================
-- VarejoBI — RLS Policies + Auto-Profile Trigger
-- ============================================

-- 1. Auto-create user profile when a new Supabase Auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, plan_tier, status, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    'active',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Sync user data on update
CREATE OR REPLACE FUNCTION public.sync_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
    name = COALESCE(NEW.raw_user_meta_data->>'full_name', name),
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_user();

-- ============================================
-- RLS — Enable on all tables
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS — Plans (public read only)
-- ============================================
DROP POLICY IF EXISTS "plans_public_read" ON public.plans;
CREATE POLICY "plans_public_read" ON public.plans
  FOR SELECT USING (TRUE);

-- ============================================
-- RLS — Users (own row only)
-- ============================================
DROP POLICY IF EXISTS "users_read_own" ON public.users;
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- RLS — Subscriptions (own only)
-- ============================================
DROP POLICY IF EXISTS "subscriptions_read_own" ON public.subscriptions;
CREATE POLICY "subscriptions_read_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- RLS — Payments (own only)
-- ============================================
DROP POLICY IF EXISTS "payments_read_own" ON public.payments;
CREATE POLICY "payments_read_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- RLS — Dashboards (own CRUD)
-- ============================================
DROP POLICY IF EXISTS "dashboards_select_own" ON public.dashboards;
CREATE POLICY "dashboards_select_own" ON public.dashboards
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dashboards_insert_own" ON public.dashboards;
CREATE POLICY "dashboards_insert_own" ON public.dashboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "dashboards_update_own" ON public.dashboards;
CREATE POLICY "dashboards_update_own" ON public.dashboards
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dashboards_delete_own" ON public.dashboards;
CREATE POLICY "dashboards_delete_own" ON public.dashboards
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS — Data Uploads (own CRUD)
-- ============================================
DROP POLICY IF EXISTS "data_uploads_select_own" ON public.data_uploads;
CREATE POLICY "data_uploads_select_own" ON public.data_uploads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "data_uploads_insert_own" ON public.data_uploads;
CREATE POLICY "data_uploads_insert_own" ON public.data_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "data_uploads_delete_own" ON public.data_uploads;
CREATE POLICY "data_uploads_delete_own" ON public.data_uploads
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS — Chatbots (own CRUD)
-- ============================================
DROP POLICY IF EXISTS "chatbots_select_own" ON public.chatbots;
CREATE POLICY "chatbots_select_own" ON public.chatbots
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chatbots_insert_own" ON public.chatbots;
CREATE POLICY "chatbots_insert_own" ON public.chatbots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chatbots_update_own" ON public.chatbots;
CREATE POLICY "chatbots_update_own" ON public.chatbots
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chatbots_delete_own" ON public.chatbots;
CREATE POLICY "chatbots_delete_own" ON public.chatbots
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS — Chatbot Conversations (own chatbot's)
-- ============================================
DROP POLICY IF EXISTS "chatbot_conversations_select_own" ON public.chatbot_conversations;
CREATE POLICY "chatbot_conversations_select_own" ON public.chatbot_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_id AND chatbots.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chatbot_conversations_insert_own" ON public.chatbot_conversations;
CREATE POLICY "chatbot_conversations_insert_own" ON public.chatbot_conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_id AND chatbots.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS — Templates (public read)
-- ============================================
DROP POLICY IF EXISTS "templates_public_read" ON public.templates;
CREATE POLICY "templates_public_read" ON public.templates
  FOR SELECT USING (TRUE);

-- ============================================
-- RLS — Affiliates (own only)
-- ============================================
DROP POLICY IF EXISTS "affiliates_select_own" ON public.affiliates;
CREATE POLICY "affiliates_select_own" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "affiliates_insert_own" ON public.affiliates;
CREATE POLICY "affiliates_insert_own" ON public.affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS — Referrals (affiliate's own)
-- ============================================
DROP POLICY IF EXISTS "referrals_select_own" ON public.referrals;
CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = affiliate_id AND affiliates.user_id = auth.uid()
    )
  );

-- ============================================
-- RLS — Tickets (own CRUD)
-- ============================================
DROP POLICY IF EXISTS "tickets_select_own" ON public.tickets;
CREATE POLICY "tickets_select_own" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tickets_insert_own" ON public.tickets;
CREATE POLICY "tickets_insert_own" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS — Email Sequences (own only)
-- ============================================
DROP POLICY IF EXISTS "email_sequences_select_own" ON public.email_sequences;
CREATE POLICY "email_sequences_select_own" ON public.email_sequences
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- RLS — Usage Logs (own insert + select)
-- ============================================
DROP POLICY IF EXISTS "usage_logs_select_own" ON public.usage_logs;
CREATE POLICY "usage_logs_select_own" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usage_logs_insert_own" ON public.usage_logs;
CREATE POLICY "usage_logs_insert_own" ON public.usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS — Notifications (own read + update)
-- ============================================
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- RLS — Refresh Tokens (own only)
-- ============================================
DROP POLICY IF EXISTS "refresh_tokens_select_own" ON public.refresh_tokens;
CREATE POLICY "refresh_tokens_select_own" ON public.refresh_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- RLS — OAuth States (own CRUD)
-- ============================================
DROP POLICY IF EXISTS "oauth_states_select_own" ON public.oauth_states;
CREATE POLICY "oauth_states_select_own" ON public.oauth_states
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "oauth_states_insert_own" ON public.oauth_states;
CREATE POLICY "oauth_states_insert_own" ON public.oauth_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);
