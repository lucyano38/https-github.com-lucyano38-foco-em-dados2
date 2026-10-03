import React, { useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { MASTER_EMAIL } from '../../lib/roles';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthCallback: React.FC = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userEmail = user.email || '';
        localStorage.setItem('foco_em_dados_user_email', userEmail);
        localStorage.setItem('foco_usuario_email', userEmail);
        localStorage.setItem('foco_usuario', JSON.stringify({
          email: userEmail,
          displayName: user.displayName || userEmail.split('@')[0],
          photoURL: user.photoURL || '',
          uid: user.uid
        }));

        if (userEmail.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
          window.location.href = '/?mode=growth';
        } else {
          window.location.href = '/?mode=crm';
        }
      } else {
        const stored = localStorage.getItem('foco_em_dados_user_email') || localStorage.getItem('foco_usuario_email');
        if (stored) {
          window.location.href = '/?mode=crm';
        } else {
          window.location.href = '/';
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
      <h2 className="text-lg font-bold">Autenticando no Foco em Dados...</h2>
      <p className="text-xs text-slate-400 mt-2">Aguarde enquanto validamos sua sessão e permissões com o Firebase.</p>
    </div>
  );
};

export default AuthCallback;
