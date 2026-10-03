import { auth, db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MASTER_EMAIL } from './roles';

export interface SubscriptionStatus {
  isPro: boolean;
  email: string | null;
  status: 'active' | 'inactive' | 'canceled' | 'none';
}

/**
 * Checa o status real da assinatura do usuário autenticado no Firebase.
 * Valida o usuário autenticado e verifica a coleção de assinaturas no Firestore.
 */
export async function checkUserSubscription(): Promise<SubscriptionStatus> {
  try {
    // Garante inicialização e prontidão do Firebase Auth
    if (typeof (auth as any).authStateReady === 'function') {
      await auth.authStateReady();
    }

    const currentUser = auth.currentUser;
    const email = currentUser?.email || 
      localStorage.getItem('foco_em_dados_user_email') || 
      localStorage.getItem('foco_usuario_email') || 
      null;

    if (!email) {
      return { isPro: false, email: null, status: 'none' };
    }

    // Acesso Master irrestrito (bypass administrativo)
    if (
      email.toLowerCase() === MASTER_EMAIL.toLowerCase() ||
      email.toLowerCase() === 'lucyano.pci@gmail.com'
    ) {
      return { isPro: true, email, status: 'active' };
    }

    // Consulta a coleção de assinaturas no Firestore
    try {
      const assinaturasRef = collection(db, 'assinaturas');
      const q = query(assinaturasRef, where('email', '==', email.toLowerCase().trim()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const subData = snapshot.docs[0].data();
        const rawStatus = (subData?.status || '').toString().toLowerCase();
        const isActive = rawStatus === 'ativo' || rawStatus === 'active';

        return {
          isPro: isActive,
          email,
          status: isActive ? 'active' : 'inactive',
        };
      }
    } catch (firestoreError) {
      console.warn('[SubscriptionCheck] Aviso ao consultar Firestore:', firestoreError);
    }

    return { isPro: false, email, status: 'inactive' };
  } catch (err) {
    console.error('[SubscriptionCheck] Erro ao validar assinatura:', err);
    return { isPro: false, email: null, status: 'none' };
  }
}
