import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MASTER_EMAIL } from '../../lib/roles';

export const AuthCallback: React.FC = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erro no callback de autenticação:', error.message);
        window.location.href = '/?status=auth_error';
        return;
      }

      if (session?.user) {
        const userEmail = session.user.email || '';
        localStorage.setItem('foco_em_dados_user_email', userEmail);
        localStorage.setItem('foco_usuario_email', userEmail);

        if (userEmail.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
          window.location.href = '/?mode=growth';
        } else {
          window.location.href = '/?mode=crm';
        }
      } else {
        window.location.href = '/';
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
      <h2 className="text-lg font-bold">Autenticando no Foco em Dados...</h2>
      <p className="text-xs text-slate-400 mt-2">Aguarde enquanto validamos sua sessão e permissões.</p>
    </div>
  );
};

export default AuthCallback;
