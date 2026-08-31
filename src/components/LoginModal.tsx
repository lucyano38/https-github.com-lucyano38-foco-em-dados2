import React from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicialize o cliente do Supabase com as chaves públicas/anon
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || 'https://ioijbixifvbosythznhh.supabase.co', supabaseAnonKey || 'placeholder');

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginProvider?: (provider: 'google' | 'github') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/prospeccao`,
        },
      });
      if (error) {
        alert('Erro ao conectar com o Google: ' + error.message);
      }
    } catch (err: any) {
      alert('Erro de autenticação Google: ' + (err.message || err));
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/prospeccao`,
        },
      });
      if (error) {
        alert('Erro ao conectar com o GitHub: ' + error.message);
      }
    } catch (err: any) {
      alert('Erro de autenticação GitHub: ' + (err.message || err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer text-sm font-semibold">✕</button>
        <h2 className="text-xl font-bold text-slate-100 mb-2 tracking-tight">Acessar Foco em Dados</h2>
        <p className="text-xs text-slate-400 mb-6">Entre com sua conta para verificar sua assinatura (R$ 39,90/mês).</p>

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Continuar com Google (Real)</span>
          </button>

          <button
            onClick={handleGithubLogin}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Continuar com GitHub (Real)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
