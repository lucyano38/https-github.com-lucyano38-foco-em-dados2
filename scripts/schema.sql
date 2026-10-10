-- ============================================
-- VarejoBI — Schema Completo PostgreSQL
-- Versão: 1.0.0
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE plan_tier AS ENUM ('free', 'starter', 'pro', 'business', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired');
CREATE TYPE payment_gateway AS ENUM ('stripe', 'pagseguro', 'pix');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'chargeback');
CREATE TYPE upload_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE chatbot_platform AS ENUM ('whatsapp', 'instagram', 'webchat');
CREATE TYPE chatbot_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE affiliate_status AS ENUM ('active', 'suspended', 'blocked');
CREATE TYPE referral_status AS ENUM ('pending', 'converted', 'commission_paid', 'cancelled');
CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'push', 'in_app');

-- ============================================
-- TABELAS
-- ============================================

-- 1. plans (must be before users due to FK)
CREATE TABLE plans (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    tier            plan_tier NOT NULL UNIQUE,
    description     TEXT,
    price_monthly   DECIMAL(10,2) NOT NULL,
    price_yearly    DECIMAL(10,2) NOT NULL,
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly  VARCHAR(255),
    limits_dashboards       INTEGER NOT NULL DEFAULT 1,
    limits_rows             INTEGER NOT NULL DEFAULT 500,
    limits_marketplaces     INTEGER NOT NULL DEFAULT 0,
    limits_chatbots         INTEGER NOT NULL DEFAULT 0,
    limits_api_calls        INTEGER NOT NULL DEFAULT 0,
    limits_storage_mb       INTEGER NOT NULL DEFAULT 10,
    features_json   JSONB NOT NULL DEFAULT '[]',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    name            VARCHAR(255),
    avatar_url      TEXT,
    google_id       VARCHAR(255) UNIQUE,
    plan_id         UUID REFERENCES plans(id),
    plan_tier       plan_tier NOT NULL DEFAULT 'free',
    status          VARCHAR(50) NOT NULL DEFAULT 'active',
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at   TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. subscriptions
CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id             UUID NOT NULL REFERENCES plans(id),
    status              subscription_status NOT NULL DEFAULT 'trialing',
    trial_start         TIMESTAMPTZ,
    trial_end           TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end   TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_subscription_id  VARCHAR(255),
    stripe_customer_id      VARCHAR(255),
    pagseguro_plan_token    VARCHAR(255),
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. payments
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id     UUID REFERENCES subscriptions(id),
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status              payment_status NOT NULL DEFAULT 'pending',
    gateway             payment_gateway NOT NULL,
    gateway_payment_id  VARCHAR(255),
    gateway_invoice_url TEXT,
    payment_method      VARCHAR(50),
    billing_period_start TIMESTAMPTZ,
    billing_period_end   TIMESTAMPTZ,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. dashboards
CREATE TABLE dashboards (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    config_json     JSONB NOT NULL DEFAULT '{}',
    data_source     VARCHAR(50) DEFAULT 'upload',
    is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
    last_viewed_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. data_uploads
CREATE TABLE data_uploads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename        VARCHAR(255) NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    file_path       TEXT NOT NULL,
    file_size       INTEGER NOT NULL,
    mime_type       VARCHAR(100),
    row_count       INTEGER DEFAULT 0,
    column_count    INTEGER DEFAULT 0,
    detected_columns JSONB DEFAULT '[]',
    status          upload_status NOT NULL DEFAULT 'pending',
    error_message   TEXT,
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. chatbots
CREATE TABLE chatbots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    script_json     JSONB NOT NULL DEFAULT '{}',
    platform        chatbot_platform NOT NULL DEFAULT 'webchat',
    phone_number    VARCHAR(20),
    avatar_url      TEXT,
    status          chatbot_status NOT NULL DEFAULT 'draft',
    total_conversations INTEGER DEFAULT 0,
    last_active_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. chatbot_conversations
CREATE TABLE chatbot_conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id      UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    user_identifier VARCHAR(255),  -- phone number or session ID
    messages        JSONB NOT NULL DEFAULT '[]',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    metadata        JSONB DEFAULT '{}',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. templates
CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    description     TEXT,
    config_json     JSONB NOT NULL DEFAULT '{}',
    thumbnail_url   TEXT,
    price           DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_free         BOOLEAN NOT NULL DEFAULT FALSE,
    download_count  INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. affiliates
CREATE TABLE affiliates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    referral_code   VARCHAR(50) NOT NULL UNIQUE,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    total_earned    DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_paid      DECIMAL(10,2) NOT NULL DEFAULT 0,
    payout_method   VARCHAR(50),
    payout_details  JSONB DEFAULT '{}',
    status          affiliate_status NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. referrals
CREATE TABLE referrals (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id        UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_user_id    UUID REFERENCES users(id),
    referred_email      VARCHAR(255),
    status              referral_status NOT NULL DEFAULT 'pending',
    commission_rate     DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    commission_amount   DECIMAL(10,2) DEFAULT 0,
    paid_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. tickets (autoatendimento → apenas para billing/problemas técnicos críticos)
CREATE TABLE tickets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject         VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    category        VARCHAR(50) DEFAULT 'billing',
    status          ticket_status NOT NULL DEFAULT 'open',
    priority        ticket_priority NOT NULL DEFAULT 'low',
    assigned_to     UUID REFERENCES users(id),
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. email_sequences
CREATE TABLE email_sequences (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sequence_type   VARCHAR(50) NOT NULL, -- welcome, onboarding, churn_recovery, upsell
    step            INTEGER NOT NULL DEFAULT 1,
    subject         VARCHAR(255),
    body            TEXT,
    sent_at         TIMESTAMPTZ,
    opened_at       TIMESTAMPTZ,
    clicked_at      TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. usage_logs
CREATE TABLE usage_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    feature         VARCHAR(100) NOT NULL, -- lines_consumed, api_calls, storage_bytes, dashboards_created
    quantity        INTEGER NOT NULL DEFAULT 1,
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. notifications
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL, -- upsell_warning, churn_alert, trial_expiring, payment_failed
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    channel         notification_channel NOT NULL DEFAULT 'in_app',
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. refresh_tokens (para JWT)
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. oauth_states (para OAuth2 flows)
CREATE TABLE oauth_states (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id),
    provider        VARCHAR(50) NOT NULL, -- google, shopify
    state           VARCHAR(255) NOT NULL UNIQUE,
    redirect_uri    TEXT,
    metadata        JSONB DEFAULT '{}',
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan_id ON users(plan_id);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period ON subscriptions(current_period_end);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_gateway_payment_id ON payments(gateway_payment_id);

CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX idx_dashboards_created_at ON dashboards(created_at);

CREATE INDEX idx_data_uploads_user_id ON data_uploads(user_id);
CREATE INDEX idx_data_uploads_status ON data_uploads(status);

CREATE INDEX idx_chatbots_user_id ON chatbots(user_id);
CREATE INDEX idx_chatbots_status ON chatbots(status);

CREATE INDEX idx_templates_category ON templates(category);

CREATE INDEX idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX idx_affiliates_status ON affiliates(status);

CREATE INDEX idx_referrals_affiliate_id ON referrals(affiliate_id);
CREATE INDEX idx_referrals_status ON referrals(status);

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);

CREATE INDEX idx_email_sequences_user_id ON email_sequences(user_id);
CREATE INDEX idx_email_sequences_type ON email_sequences(sequence_type);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_feature_date ON usage_logs(feature, date);
CREATE INDEX idx_usage_logs_date ON usage_logs(date);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_dashboards_updated_at BEFORE UPDATE ON dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_affiliates_updated_at BEFORE UPDATE ON affiliates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: upsell quando usage atinge 80% do limite
CREATE OR REPLACE FUNCTION check_upsell_threshold()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_id       UUID;
    v_plan_tier     plan_tier;
    v_limit_rows    INTEGER;
    v_used_rows     INTEGER;
    v_usage_pct     DECIMAL(5,2);
BEGIN
    -- Buscar plano do usuário
    SELECT plan_id, plan_tier INTO v_plan_id, v_plan_tier
    FROM users WHERE id = NEW.user_id;

    -- Buscar limite do plano
    SELECT limits_rows INTO v_limit_rows
    FROM plans WHERE id = v_plan_id;

    -- Calcular total usado no mês
    SELECT COALESCE(SUM(quantity), 0) INTO v_used_rows
    FROM usage_logs
    WHERE user_id = NEW.user_id
      AND feature = 'lines_consumed'
      AND date >= DATE_TRUNC('month', NEW.date);

    v_usage_pct := (v_used_rows::DECIMAL / NULLIF(v_limit_rows, 0)) * 100;

    -- Se >= 80%, criar notificação de upsell
    IF v_usage_pct >= 80 AND v_plan_tier != 'enterprise' THEN
        INSERT INTO notifications (user_id, type, title, message, channel, metadata)
        VALUES (
            NEW.user_id,
            'upsell_warning',
            'Você está próximo do limite do seu plano',
            format('Você já utilizou %s%% do limite de linhas do seu plano. Considere fazer upgrade para continuar sem interrupções.', ROUND(v_usage_pct, 1)::TEXT),
            'in_app',
            jsonb_build_object('usage_pct', v_usage_pct, 'used_rows', v_used_rows, 'limit_rows', v_limit_rows)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_upsell_check
    AFTER INSERT ON usage_logs
    FOR EACH ROW
    WHEN (NEW.feature = 'lines_consumed')
    EXECUTE FUNCTION check_upsell_threshold();

-- Trigger: iniciar sequência de recuperação quando subscription é cancelada
CREATE OR REPLACE FUNCTION start_churn_recovery()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'canceled' AND NEW.status = 'canceled' THEN
        -- Criar sequência de e-mails de recuperação (step 1)
        INSERT INTO email_sequences (user_id, sequence_type, step, subject, body)
        VALUES (
            NEW.user_id,
            'churn_recovery',
            1,
            'Sentimos sua falta no VarejoBI',
            format('Olá! Notamos que você cancelou sua assinatura. Queremos entender como podemos melhorar. Aqui vai um cupom de 30%% OFF para voltar: CHURN30')
        );

        -- Criar notificação in-app
        INSERT INTO notifications (user_id, type, title, message, channel)
        VALUES (
            NEW.user_id,
            'churn_alert',
            'Assinatura cancelada',
            'Seu plano foi cancelado. Você ainda tem acesso até o final do período vigente.',
            'in_app'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_churn_recovery
    AFTER UPDATE OF status ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION start_churn_recovery();

-- Trigger: atualizar plan_tier do user quando subscription muda
CREATE OR REPLACE FUNCTION sync_user_plan_tier()
RETURNS TRIGGER AS $$
DECLARE
    new_tier plan_tier;
BEGIN
    SELECT tier INTO new_tier FROM plans WHERE id = NEW.plan_id;
    UPDATE users SET plan_tier = new_tier WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_plan_tier
    AFTER INSERT OR UPDATE OF plan_id ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_plan_tier();
