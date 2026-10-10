#!/usr/bin/env bash
# ============================================================
# Foco em Dados — Backend Deployment Script
# Deploy everything to Supabase
# ============================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()  { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"; }
ok()   { echo -e "${GREEN}  ✓${NC} $1"; }
warn() { echo -e "${YELLOW}  ⚠${NC} $1"; }
fail() { echo -e "${RED}  ✗${NC} $1"; exit 1; }

# ── Config ──────────────────────────────────────────────────
PROJECT_REF="ioijbixifvbosythznhh"
SUPABASE_DB_URL="postgresql://postgres:PNeEnbajxSoWwoLAwnmqjPhVjYqgrVYh@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"

# ── Pre-checks ──────────────────────────────────────────────
command -v supabase >/dev/null 2>&1 || fail "supabase CLI not found. Install: brew install supabase/tap/supabase"
command -v psql   >/dev/null 2>&1 || fail "psql not found. Install: apt install postgresql-client"

echo -e "\n${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Foco em Dados — Deploy Backend${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}\n"

# ── Step 1: Link Supabase project ───────────────────────────
log "Step 1/7 — Linking Supabase project..."
supabase link --project-ref "$PROJECT_REF" 2>/dev/null || {
  warn "Project not linked yet. Run: supabase link --project-ref $PROJECT_REF"
}
ok "Project linked"

# ── Step 2: Apply SQL schema ────────────────────────────────
log "Step 2/7 — Applying SQL schema..."
if PGPASSWORD="PNeEnbajxSoWwoLAwnmqjPhVjYqgrVYh" psql "$SUPABASE_DB_URL" -f scripts/reset_supabase.sql 2>&1; then
  ok "Schema applied successfully"
else
  warn "psql failed — you may need to run the SQL manually in Supabase SQL Editor"
  warn "File: scripts/reset_supabase.sql"
fi

# ── Step 3: Deploy Edge Functions ───────────────────────────
log "Step 3/7 — Deploying Edge Functions..."

FUNCTIONS=(
  "process-upload"
  "stripe-webhook"
  "chatbot-rag"
  "generate-insights"
  "generate-forecast"
  "send-email"
  "scheduled-reports"
  "sync-integration"
  "auth-callback"
  "auth-register"
  "chat"
  "churn-predictor"
  "get-auth-url"
  "get-qr"
  "insights"
  "stripe-create-checkout"
  "upload"
  "admin-metrics"
  "detect-columns"
)

for fn in "${FUNCTIONS[@]}"; do
  if [ -f "supabase/functions/$fn/index.ts" ]; then
    log "  Deploying $fn..."
    supabase functions deploy "$fn" --project-ref "$PROJECT_REF" 2>&1 | tail -1
    ok "$fn deployed"
  else
    warn "supabase/functions/$fn/index.ts not found — skipping"
  fi
done

# ── Step 4: Set secrets ─────────────────────────────────────
log "Step 4/7 — Setting Supabase secrets..."
# These will prompt or fail if not set — replace with your actual keys

# Stripe
supabase secrets set STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}" 2>/dev/null || warn "STRIPE_SECRET_KEY not set"
supabase secrets set STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}" 2>/dev/null || warn "STRIPE_WEBHOOK_SECRET not set"

# AI
supabase secrets set GEMINI_API_KEY="${GEMINI_API_KEY:-}" 2>/dev/null || warn "GEMINI_API_KEY not set"
supabase secrets set OPENAI_API_KEY="${OPENAI_API_KEY:-}" 2>/dev/null || warn "OPENAI_API_KEY not set"

# Email (Resend)
supabase secrets set RESEND_API_KEY="${RESEND_API_KEY:-}" 2>/dev/null || warn "RESEND_API_KEY not set"

# App
supabase secrets set APP_URL="https://focoemdados.com.br" 2>/dev/null || true

ok "Secrets configured"

# ── Step 5: Configure Auth ──────────────────────────────────
log "Step 5/7 — Auth providers..."
log "  → Google OAuth: https://supabase.com/dashboard/project/$PROJECT_REF/auth/providers"
log "  → Site URL: https://focoemdados.com.br"
log "  → Redirect URLs: https://focoemdados.com.br/auth/callback"
warn "  Configure these manually in Supabase Dashboard"

# ── Step 6: Create Storage buckets ──────────────────────────
log "Step 6/7 — Creating Storage buckets..."
supabase storage create uploads 2>/dev/null || warn "Bucket 'uploads' already exists"
supabase storage create exports 2>/dev/null || warn "Bucket 'exports' already exists"
supabase storage create public 2>/dev/null || warn "Bucket 'public' already exists"

log "  → Apply RLS policies for storage buckets in Dashboard > Storage > Policies"
warn "  Run the SQL in Section 7 of scripts/reset_supabase.sql to set bucket policies"

# ── Step 7: Configure DB Webhooks ───────────────────────────
log "Step 7/7 — Database webhooks..."
log "  Configure in Supabase Dashboard > Database > Webhooks:"
log "  • usage_logs INSERT → process-upload (if status = 'pending')"
log "  • payments INSERT → trigger_affiliate_commission"
warn "  These must be configured manually in the Dashboard"

echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deploy complete!${NC}"
echo -e "${GREEN}  Next steps:${NC}"
echo -e "${GREEN}  1. Run: supabase functions deploy <function-name>${NC}"
echo -e "${GREEN}  2. Set Stripe webhook endpoint:${NC}"
echo -e "${GREEN}     https://$PROJECT_REF.functions.supabase.co/stripe-webhook${NC}"
echo -e "${GREEN}  3. Configure Google OAuth in Supabase Dashboard${NC}"
echo -e "${GREEN}  4. Create storage buckets with RLS policies${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}\n"
