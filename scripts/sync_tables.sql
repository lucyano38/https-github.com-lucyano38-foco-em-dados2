-- ============================================
-- Sync Integrations — Tabelas
-- ============================================

CREATE TYPE integration_provider AS ENUM ('shopify', 'woocommerce', 'mercadolivre');
CREATE TYPE integration_status AS ENUM ('active', 'expired', 'error', 'disabled');
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'shipped', 'delivered', 'cancelled', 'refunded');

CREATE TABLE integrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        integration_provider NOT NULL,
    label           VARCHAR(100),
    config          JSONB NOT NULL DEFAULT '{}',
    credentials     TEXT, -- encrypted JSON com tokens/API keys
    status          integration_status NOT NULL DEFAULT 'active',
    last_sync_at    TIMESTAMPTZ,
    error_message   TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id     VARCHAR(255) NOT NULL,
    external_code   VARCHAR(100),
    customer_name   VARCHAR(255),
    customer_email  VARCHAR(255),
    customer_doc    VARCHAR(20),
    items           JSONB NOT NULL DEFAULT '[]',
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount        DECIMAL(12,2) DEFAULT 0,
    shipping        DECIMAL(12,2) DEFAULT 0,
    payment_method  VARCHAR(50),
    installments    INTEGER DEFAULT 1,
    status          order_status NOT NULL DEFAULT 'pending',
    ordered_at      TIMESTAMPTZ,
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_data        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(integration_id, external_id)
);

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id     VARCHAR(255) NOT NULL,
    sku             VARCHAR(100),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(100),
    brand           VARCHAR(100),
    price           DECIMAL(12,2) NOT NULL DEFAULT 0,
    cost            DECIMAL(12,2) DEFAULT 0,
    stock           INTEGER DEFAULT 0,
    images          JSONB DEFAULT '[]',
    variants        JSONB DEFAULT '[]',
    status          VARCHAR(50) DEFAULT 'active',
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(integration_id, external_id)
);

CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_orders_integration_id ON orders(integration_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_external_id ON orders(integration_id, external_id);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at);
CREATE INDEX idx_products_integration_id ON products(integration_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_sku ON products(sku);

CREATE TRIGGER trg_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
