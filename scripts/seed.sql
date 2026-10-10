-- ============================================
-- VarejoBI — Dados Iniciais (Seeds)
-- ============================================

-- Planos
INSERT INTO plans (id, name, tier, description, price_monthly, price_yearly, stripe_price_id_monthly, stripe_price_id_yearly, limits_dashboards, limits_rows, limits_marketplaces, limits_chatbots, limits_api_calls, limits_storage_mb, features_json, sort_order)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'Grátis',
        'free',
        'Para testar o VarejoBI sem compromisso. 1 upload de planilha para conhecer os dashboards.',
        0, 0, NULL, NULL,
        1, 500, 0, 0, 0, 10,
        '["upload_csv", "dashboard_basico"]',
        1
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'Starter',
        'starter',
        'Para pequenos lojistas. Dashboard essencial com 1 marketplace integrado.',
        97, 970, NULL, NULL,
        1, 2000, 1, 1, 1000, 100,
        '["upload_csv", "dashboard_basico", "export_pdf", "marketplace_1", "chatbot_basico"]',
        2
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'Pro',
        'pro',
        'O plano mais popular. Dashboard avançado com 3 marketplaces e insights de IA.',
        297, 2970, NULL, NULL,
        3, 20000, 3, 3, 10000, 500,
        '["upload_csv", "dashboard_avancado", "export_pdf", "export_excel", "marketplace_3", "insight_ia", "churn_prediction", "alerta_whatsapp", "chatbot_avancado", "suporte_prioritario"]',
        3
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        'Business',
        'business',
        'Para redes e multi-lojas. Marketplaces ilimitados e painel de parceiros incluso.',
        597, 5970, NULL, NULL,
        10, 100000, 999, 10, 100000, 2000,
        '["upload_csv", "dashboard_avancado", "export_pdf", "export_excel", "marketplace_ilimitado", "insight_ia", "churn_prediction", "alerta_whatsapp", "painel_parceiros", "api_rest", "chatbot_avancado", "suporte_prioritario"]',
        4
    ),
    (
        'a0000000-0000-0000-0000-000000000005',
        'Enterprise',
        'enterprise',
        'Solução completa com SLA 99,9%, onboarding dedicado e suporte 24/7.',
        997, 9970, NULL, NULL,
        999, 999999999, 999, 999, 999999999, 50000,
        '["upload_csv", "dashboard_avancado", "export_pdf", "export_excel", "marketplace_ilimitado", "insight_ia", "churn_prediction", "alerta_whatsapp", "painel_parceiros", "api_rest", "chatbot_avancado", "suporte_24h", "sla_99_9", "onboarding_dedicado", "treinamento_equipe"]',
        5
    );

-- Admin padrão (senha: admin123 — trocar em produção)
-- O hash é gerado com pgcrypto, mas em produção use bcrypt na aplicação
INSERT INTO users (id, email, password_hash, name, plan_id, plan_tier, email_verified, status)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'admin@focoemdados.com.br',
    crypt('admin123', gen_salt('bf')),  -- bcrypt hash
    'Admin VarejoBI',
    'a0000000-0000-0000-0000-000000000005',
    'enterprise',
    TRUE,
    'active'
);

-- Templates gratuitos
INSERT INTO templates (id, name, category, description, config_json, is_free, download_count)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'Dashboard de Vendas — Varejo',
        'Vendas',
        'Dashboard completo com faturamento, ticket médio, margem e inadimplência para lojas de varejo.',
        '{"kpis": ["faturamento_liquido", "ticket_medio", "margem_liquida", "inadimplencia"], "charts": ["line_revenue", "bar_produtos", "donut_categorias", "bar_vendedores"]}',
        TRUE,
        0
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'Análise de Estoque — Moda',
        'Estoque',
        'Acompanhe giro de estoque, produtos campeões e ruptura para o setor de moda e vestuário.',
        '{"kpis": ["giro_estoque", "itens_vendidos", "ruptura_pct"], "charts": ["bar_top_produtos", "line_estoque"]}',
        TRUE,
        0
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        'Relatório Financeiro — E-commerce',
        'Financeiro',
        'Relatório de recebíveis, inadimplência e fluxo de caixa para lojas virtuais.',
        '{"kpis": ["recebido", "em_atraso", "inadimplencia"], "charts": ["bar_recebiveis", "line_receita"]}',
        TRUE,
        0
    );

-- Sequências de e-mail padrão
INSERT INTO email_sequences (user_id, sequence_type, step, subject, body)
SELECT
    u.id,
    'welcome',
    1,
    'Bem-vindo ao VarejoBI! 🚀',
    'Olá! Seu dashboard de varejo está pronto. Faça upload da sua primeira planilha e descubra insights valiosos em segundos.'
FROM users u WHERE u.email = 'admin@focoemdados.com.br';

INSERT INTO email_sequences (user_id, sequence_type, step, subject, body)
SELECT
    u.id,
    'onboarding',
    1,
    'Passo 1: Faça upload dos seus dados',
    'Clique em "Gerar Dashboard" e selecione seu arquivo CSV ou Excel. O VarejoBI detecta automaticamente as colunas de varejo.'
FROM users u WHERE u.email = 'admin@focoemdados.com.br';

INSERT INTO email_sequences (user_id, sequence_type, step, subject, body)
SELECT
    u.id,
    'onboarding',
    2,
    'Passo 2: Entenda seus KPIs',
    'Seu dashboard exibe 4 indicadores principais: Margem Líquida, Giro de Estoque, Ticket Médio e Risco de Inadimplência. Navegue pelas abas para detalhar cada um.'
FROM users u WHERE u.email = 'admin@focoemdados.com.br';

INSERT INTO email_sequences (user_id, sequence_type, step, subject, body)
SELECT
    u.id,
    'onboarding',
    3,
    'Passo 3: Conecte seus marketplaces',
    'Integre Bling, Mercado Livre e Shopee para consolidar dados automaticamente. Vá até a aba Marketplaces no dashboard.'
FROM users u WHERE u.email = 'admin@focoemdados.com.br';

-- ============================================
-- Documentação (para chatbot-rag RAG)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO documents (title, content, category, tags) VALUES
('Como conectar Shopify', 'Para conectar sua loja Shopify ao VarejoBI, vá em Integrações > Conectar Shopify. Você será redirecionado para o login da Shopify. Autorize o aplicativo e seus dados serão sincronizados automaticamente.', 'integracoes', ARRAY['shopify', 'oauth', 'ecommerce']),
('Como conectar Mercado Livre', 'Vá em Integrações > Conectar Mercado Livre. Faça login na sua conta Mercado Livre e autorize o VarejoBI. Suas vendas e produtos serão importados automaticamente.', 'integracoes', ARRAY['mercadolivre', 'oauth', 'ecommerce']),
('Como conectar WooCommerce', 'No WooCommerce, vá em WooCommerce > Configurações > Avançado > API > Adicionar chave. Gere um Consumer Key e Consumer Secret com permissões de leitura. Cole esses dados no VarejoBI em Integrações > WooCommerce.', 'integracoes', ARRAY['woocommerce', 'api', 'wordpress']),
('Como subir planilha CSV', 'Na página do Dashboard, clique em "Upload" ou arraste seu arquivo CSV para a área de upload. O VarejoBI detecta automaticamente colunas como Data, Produto, Vendas, Estoque e gera um dashboard interativo em segundos.', 'upload', ARRAY['csv', 'planilha', 'dados']),
('Como criar alerta de estoque', 'Vá em Configurações > Alertas > Novo Alerta. Escolha o produto ou categoria, defina o limite mínimo de estoque e o canal de notificação (WhatsApp, email ou in-app).', 'alertas', ARRAY['estoque', 'alerta', 'notificacao']),
('Como interpretar previsão de vendas', 'O gráfico de previsão usa inteligência artificial para estimar vendas futuras com base no histórico dos últimos 90 dias. A linha central mostra a previsão, e as bandas superior/inferior indicam o intervalo de confiança.', 'analise', ARRAY['previsao', 'forecast', 'ia']),
('Como fazer upgrade de plano', 'Vá em Preços > Escolha o novo plano. O upgrade é instantâneo e o valor é calculado proporcionalmente ao período restante do seu plano atual.', 'planos', ARRAY['upgrade', 'plano', 'assinatura']),
('Como configurar chatbot de WhatsApp', 'Vá em Fábrica de Bots > Conectar WhatsApp. Um QR Code será exibido. Abra o WhatsApp no seu celular, vá em Configurações > WhatsApp Web e escaneie o código.', 'chatbot', ARRAY['whatsapp', 'bot', 'chatbot']),
('Política de privacidade e LGPD', 'Seus dados são armazenados com criptografia em repouso e em trânsito. Você pode solicitar a exclusão completa dos seus dados a qualquer momento enviando um email para contato@focoemdados.com.br.', 'legal', ARRAY['privacidade', 'lgpd', 'dados']),
('Limites de upload por plano', 'Plano Gratuito: 2.000 linhas por upload. Starter: 50.000 linhas. Pro: 500.000 linhas. Business e Enterprise: upload ilimitado.', 'planos', ARRAY['limites', 'upload', 'planos']),
('Integrações disponíveis', 'O VarejoBI integra com: Shopify (via OAuth), Mercado Livre (via OAuth), Shopee (via API), WooCommerce (via chaves de API), Bling (via API token).', 'integracoes', ARRAY['shopify', 'mercadolivre', 'shopee', 'woocommerce', 'bling']);

-- ============================================
-- Processed events (idempotência webhook)
-- ============================================
CREATE TABLE IF NOT EXISTS processed_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_processed_events_event_id ON processed_events(event_id);

-- ============================================
-- Scheduled reports
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    recipients JSONB NOT NULL DEFAULT '[]',
    config JSONB DEFAULT '{}',
    last_sent_at TIMESTAMPTZ,
    next_send_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Colunas extras para data_uploads (insights)
-- ============================================
ALTER TABLE data_uploads ADD COLUMN IF NOT EXISTS insight_summary TEXT;
ALTER TABLE data_uploads ADD COLUMN IF NOT EXISTS insight_kpis JSONB;
ALTER TABLE data_uploads ADD COLUMN IF NOT EXISTS insight_alerts JSONB;
ALTER TABLE data_uploads ADD COLUMN IF NOT EXISTS insight_forecast JSONB;
ALTER TABLE data_uploads ADD COLUMN IF NOT EXISTS processed_data JSONB;
