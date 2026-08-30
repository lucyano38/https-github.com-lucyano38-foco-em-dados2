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
  return { url: 'https://buy.stripe.com/focoemdados-pro' };
}

export async function verifySubscriptionByEmail(email?: string): Promise<Subscription | null> {
  if (!email) return null;
  return null;
}

export async function getActiveSubscription(email?: string): Promise<Subscription | null> {
  if (!email) return null;
  return null;
}
