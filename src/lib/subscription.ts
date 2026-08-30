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

const PRO_KEY = 'foco_em_dados_pro';

function isProEmail(email?: string | null): boolean {
  if (!email) return false;
    return email.toLowerCase() === 'lucyano.pci@gmail.com';
}

export async function createCheckoutSession(priceId: string, customerEmail?: string): Promise<{ url?: string }> {
  return { url: 'https://buy.stripe.com/focoemdados-pro' };
}

export async function verifySubscriptionByEmail(email?: string): Promise<Subscription | null> {
  if (isProEmail(email)) {
    return {
      id: 'master-pro',
      email: email as string,
      status: 'active',
      plan: 'pro_monthly',
    };
  }

  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem(PRO_KEY);
  if (local === 'true') {
    return {
      id: 'local-pro',
      email: email || '',
      status: 'active',
      plan: 'pro_monthly',
    };
  }

  return null;
}

export async function getActiveSubscription(email?: string): Promise<Subscription | null> {
  return verifySubscriptionByEmail(email);
}
