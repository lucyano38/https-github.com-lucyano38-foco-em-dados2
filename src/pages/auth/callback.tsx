import React, { useEffect } from 'react';

export const AuthCallback: React.FC = () => {
  useEffect(() => {
    // Redireciona com segurança para a aplicação principal sem loops de recarga
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
      <h2 className="text-lg font-bold">Concluindo acesso...</h2>
      <p className="text-xs text-slate-400 mt-2">Redirecionando com segurança para a plataforma.</p>
    </div>
  );
};

export default AuthCallback;
