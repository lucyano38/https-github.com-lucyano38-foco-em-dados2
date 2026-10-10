# Chaves de API Necessárias — VarejoBI

Este documento lista **todas as chaves de API e credenciais** que você precisa configurar
para cada serviço antes do deploy em produção. Itens marcados com ✅ já estão configurados.

---

## 1. ✅ Supabase (Banco + Autenticação)

| Variável | Valor | Status |
|---|---|---|
| `SUPABASE_URL` | `https://ioijbixifvbosythznhh.supabase.co` | ✅ Configurado |
| `SUPABASE_ANON_KEY` | (anon key do projeto) | ✅ Configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | (service_role key do projeto) | ✅ Configurado |
| `VITE_SUPABASE_URL` | `https://ioijbixifvbosythznhh.supabase.co` | ✅ Configurado |
| `VITE_SUPABASE_ANON_KEY` | (anon key) | ✅ Configurado |

**Google OAuth (Supabase Auth):**
1. Acesse: [Supabase Dashboard → Auth → Providers](https://supabase.com/dashboard/project/ioijbixifvbosythznhh/auth/providers)
2. Ative **Google**
3. Insira **Client ID** e **Client Secret** do seu projeto no [Google Cloud Console](https://console.cloud.google.com/auth)
   - URI de redirecionamento: `https://ioijbixifvbosythznhh.supabase.co/auth/v1/callback`

---

## 2. ❌ Stripe (Checkout & Assinaturas)

Criar produtos no [Stripe Dashboard](https://dashboard.stripe.com/products) e copiar os **Price IDs**:

| Variável | Onde obter | Status |
|---|---|---|
| `STRIPE_SECRET_KEY` | Dashboard Stripe → Developers → API Keys → `sk_live_...` | ❌ Pendente |
| `STRIPE_WEBHOOK_SECRET` | Dashboard Stripe → Webhooks → Endpoint → `whsec_...` | ❌ Pendente |
| `STRIPE_STARTER_PRICE_ID` | Stripe → Product → Starter → API ID: `price_xxx` | ❌ Pendente |
| `STRIPE_PRO_PRICE_ID` | Stripe → Product → Pro → API ID: `price_xxx` | ❌ Pendente |
| `STRIPE_BUSINESS_PRICE_ID` | Stripe → Product → Business → API ID: `price_xxx` | ❌ Pendente |
| `STRIPE_ENTERPRISE_PRICE_ID` | Stripe → Product → Enterprise → API ID: `price_xxx` | ❌ Pendente |

**Criar produtos sugeridos:**

| Produto | Preço mensal | Preço anual |
|---|---|---|
| Starter | R$ 97,00 | R$ 970,00 |
| Pro | R$ 297,00 | R$ 2.970,00 |
| Business | R$ 597,00 | R$ 5.970,00 |
| Enterprise | R$ 997,00 | R$ 9.970,00 |

**Webhook:** Configurar endpoint em `https://focoemdados.com.br/api/webhooks/stripe` com eventos:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

---

## 3. ❌ Google Gemini (Insights de IA)

| Variável | Onde obter | Status |
|---|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | ❌ Pendente |

Usado para:
- Geração de **Insight Diário** no dashboard
- Análise comparativa de mercado (web-search-compare)

---

## 4. ❌ OpenAI (Chatbot)

| Variável | Onde obter | Status |
|---|---|---|
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) | ❌ Pendente |

Usado para:
- **Chatbot inteligente** com RAG (documentação + FAQ)

---

## 5. ❌ SendGrid (E-mails transacionais)

| Variável | Onde obter | Status |
|---|---|---|
| `SENDGRID_API_KEY` | [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys) → Create API Key | ❌ Pendente |
| `SENDGRID_FROM_EMAIL` | E-mail verificado no SendGrid (ex: `noreply@focoemdados.com.br`) | ❌ Pendente |

Usado para:
- Confirmação de e-mail (via Supabase Auth)
- E-mails de onboarding, churn recovery, notificações
- Sequências de e-mail do admin

---

## 6. Deploy

| Variável | Onde obter | Status |
|---|---|---|
| `APP_URL` | URL de produção: `https://focoemdados.com.br` | ✅ Pré-configurado |
| `DEPLOY_WEBHOOK_SECRET` | Gerar string aleatória (ex: `openssl rand -hex 32`) | ❌ Pendente |

---

## Checklist de Configuração

- [ ] **Stripe:** Criar 4 produtos com preços mensais e anuais
- [ ] **Stripe:** Configurar webhook apontando para produção
- [ ] **Google Cloud:** Criar OAuth 2.0 Client ID para login com Google
- [ ] **Supabase:** Ativar Google como Auth Provider (com Client ID/Secret)
- [ ] **Gemini:** Gerar API Key no Google AI Studio
- [ ] **OpenAI:** Gerar API Key no Platform
- [ ] **SendGrid:** Verificar domínio e criar API Key
- [ ] **Supabase Auth:** Configurar SMTP (SendGrid) para e-mails de confirmação
- [ ] **Deploy:** Gerar DEPLOY_WEBHOOK_SECRET aleatório
