import { createClient } from '@supabase/supabase-js';
import { supabaseServiceRole } from './supabaseClient';

export type CheckoutCreateBody = {
  planId?: string;
  leadSlug?: string;
  email?: string;
  metadata?: Record<string, string>;
};

export async function createCheckoutSession(body: CheckoutCreateBody) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  const lineItems = [
    {
      price: body.planId || process.env.STRIPE_PRICE_ID,
      quantity: 1,
    },
  ];

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      mode: 'subscription',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      customer_email: body.email || '',
      line_items: JSON.stringify(lineItems),
      metadata: JSON.stringify(body.metadata || {}),
    }).toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Falha ao criar checkout no Stripe');
  }

  return response.json();
}

export async function startPlanCheckout(body: CheckoutCreateBody) {
  return createCheckoutSession(body);
}

export async function sendTransactionalEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'Foco em Dados <noreply@focoemdados.com.br>';
  if (!resendKey) {
    throw new Error('Missing RESEND_API_KEY');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Falha ao enviar e-mail via Resend');
  }

  return response.json();
}

export async function sendEmailOnLeadStatusChange(lead: { nome?: string; status?: string; email?: string }) {
  const subject = `Atualização do lead: ${lead?.nome || 'Pipeline'}`;
  const html = `<p>Status atualizado para <b>${lead?.status}</b>.</p>`;
  return sendTransactionalEmail({ to: lead?.email || '', subject, html });
}
