import { supabase } from './supabaseClient';

export interface SubscriptionStatus {
  isPro: boolean;
  email: string | null;
  status: 'active' | 'inactive' | 'canceled' | 'none';
}

/**
 * Checa o status real da assinatura do usuário logado diretamente no banco de dados.
 * Nunca confia no localStorage do navegador para liberar o acesso PRO.
 */
export async function checkUserSubscription(): Promise<SubscriptionStatus> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return { isPro: false, email: null, status: 'none' };
    }

    const email = session.user.email || null;

    if (!email) {
      return { isPro: false, email: null, status: 'none' };
    }

    // Consulta a tabela de assinaturas gerenciada pelo webhook do Stripe no Supabase
    const { data: subscription, error: subError } = await supabase
      .from('assinaturas')
      .select('status')
      .eq('email', email)
      .maybeSingle();

    if (subError || !subscription) {
      return { isPro: false, email, status: 'inactive' };
    }

    const isActive = subscription.status === 'ativo' || subscription.status === 'active';

    return {
      isPro: isActive,
      email,
      status: isActive ? 'active' : 'inactive',
    };
  } catch (err) {
    console.error('[SubscriptionCheck] Erro ao validar assinatura:', err);
    return { isPro: false, email: null, status: 'none' };
  }
}
