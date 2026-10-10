import { supabaseAdmin, getCorsHeaders } from "../_shared/supabase-admin.ts";
import Stripe from "npm:stripe@17.6.0";

const PLAN_PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  starter: { monthly: "price_1TvIlVArgRpIlwse4B506NvH", yearly: "price_1TvIldArgRpIlwsediloz86w" },
  pro: { monthly: "price_1TvIlXArgRpIlwseHP5NJ3qj", yearly: "price_1TvIlfArgRpIlwsegtgpmFVI" },
  business: { monthly: "price_1TvIlZArgRpIlwseq43UM2x4", yearly: "price_1TvIlhArgRpIlwseCWYLKFKd" },
  enterprise: { monthly: "price_1TvIlbArgRpIlwsekq0bBeMD", yearly: "price_1TvIljArgRpIlwsehUmXtMWJ" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get("origin")) });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada.");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" });

    const { tier, interval, userId, email, name } = await req.json();
    if (!tier || !userId || !email) throw new Error("tier, userId e email são obrigatórios.");

    const intervalMode = interval === "yearly" ? "yearly" : "monthly";
    const priceId = PLAN_PRICE_IDS[tier]?.[intervalMode];
    if (!priceId) throw new Error(`Preço não encontrado para o plano ${tier}`);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId, tier },
      success_url: `${Deno.env.get("FRONTEND_URL") || "https://focoemdados.com.br"}/bi?checkout=success`,
      cancel_url: `${Deno.env.get("FRONTEND_URL") || "https://focoemdados.com.br"}/planos?checkout=canceled`,
      subscription_data: {
        trial_period_days: 7,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
