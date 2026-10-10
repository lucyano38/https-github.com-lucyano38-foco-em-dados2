# Edge Functions — VarejoBI

Todas as funções migradas do Express para Supabase Edge Functions (Deno).

## Deploy

```bash
supabase functions deploy upload --project-ref ioijbixifvbosythznhh
supabase functions deploy insights --project-ref ioijbixifvbosythznhh
supabase functions deploy chat --project-ref ioijbixifvbosythznhh
supabase functions deploy stripe-webhook --project-ref ioijbixifvbosythznhh
supabase functions deploy stripe-create-checkout --project-ref ioijbixifvbosythznhh
supabase functions deploy auth-register --project-ref ioijbixifvbosythznhh
supabase functions deploy get-qr --project-ref ioijbixifvbosythznhh
supabase functions deploy churn-predictor --project-ref ioijbixifvbosythznhh
```

## Config

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set GEMINI_API_KEY=...
supabase secrets set OPENAI_API_KEY=...
supabase secrets set FRONTEND_URL=https://focoemdados.com.br
```

## Endpoints (após deploy)

| Função | URL |
|---|---|
| upload | `POST /functions/v1/upload` |
| insights | `POST /functions/v1/insights` |
| chat | `POST /functions/v1/chat` |
| stripe-webhook | `POST /functions/v1/stripe-webhook` |
| stripe-create-checkout | `POST /functions/v1/stripe-create-checkout` |
| auth-register | `POST /functions/v1/auth-register` |
| get-qr | `GET /functions/v1/get-qr` |
| churn-predictor | `POST /functions/v1/churn-predictor` |
