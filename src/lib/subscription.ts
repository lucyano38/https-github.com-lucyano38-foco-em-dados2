import { supabaseServiceRole } from '../lib/supabaseClient';

export type Subscription = {
  id: string;
  user_id?: string;
  email?: string;
  status: 'active' | 'canceled' | 'past_due';
  plan: 'pro_monthly' | 'pro_onetime';
  renews_at?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
};

export async function createCheckoutSession(priceId: string, customerEmail?: string): Promise<{ url?: string }> {
  const supabase = supabaseServiceRole();
  if (!supabase) {
    return { url: 'https://buy.stripe.com/focoemdados-pro' };
  }

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY || ''}`,
    },
    body: new URLSearchParams({
      mode: 'subscription',
      payment_method_types: 'card',
      line_items: JSON.stringify([{ price: priceId, quantity: 1 }]),
      customer_email: customerEmail || '',
      success_url: 'https://focoemdados.com.br?checkout=success',
      cancel_url: 'https://focoemdados.com.br?checkout=cancel',
    }).toString(),
  });

  const data = await res.json();
  return { url: data.url };
}

export async function verifySubscriptionByEmail(email?: string): Promise<Subscription | null> {
  if (!email) return null;
  const supabase = supabaseServiceRole();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('email', email)
    .order('renews_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('subscription lookup failed', error);
    return null;
  }

  if (!data) return null;

  const now = new Date();
  if (data.status === 'active') {
    if (data.renews_at && new Date(data.renews_at) > now) return data;
    if (data.expires_at && new Date(data.expires_at) > now) return data;
  }
  return null;
}

export async function getActiveSubscription(email?: string): Promise<Subscription | null> {
  if (!email) return null;
  const supabase = supabaseServiceRole();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('email', email)
    .order('renews_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('subscription lookup failed', error);
    return null;
  }

  if (!data) return null;

  const now = new Date();
  if (data.status === 'active') {
    if (data.renews_at && new Date(data.renews_at) > now) return data;
    if (data.expires_at && new Date(data.expires_at) > now) return data;
  }
  return null;
}
