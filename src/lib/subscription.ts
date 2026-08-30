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
