import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  'AuthApiError: Database error saving new user':
    'Erro ao criar sua conta. Verifique se o login OAuth está habilitado no painel do Supabase (Authentication → Providers).',
  'AuthApiError: Invalid login credentials':
    'Credenciais inválidas. Verifique as chaves do Supabase no painel.',
  'AuthApiError: Email address not confirmed':
    'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
};

function friendlyError(err: unknown): string {
  if (!err) return 'Erro desconhecido ao autenticar.';
  const raw = (err as any)?.message || String(err);
  for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
    if (raw.includes(key)) return msg;
  }
  if (raw.includes('Database error saving new user')) {
    return (
      'Erro de banco ao criar usuário. Possíveis causas:\n' +
      '• Tabela "profiles" com coluna NOT NULL sem valor padrão\n' +
      '• Trigger de criação de profile com restrição\n' +
      '• Provedor OAuth não habilitado no Supabase Dashboard'
    );
  }
  return `Erro de autenticação: ${raw.slice(0, 200)}`;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (!isSupabaseConfigured) {
      setError(
        'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel do Vercel.',
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams:
            provider === 'google'
              ? { access_type: 'offline', prompt: 'consent' }
              : undefined,
        },
      });

      if (authError) {
        setError(friendlyError(authError));
        setLoading(false);
      }
      // On success the browser redirects — no need to setLoading(false)
    } catch (err) {
      setError(friendlyError(err));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#0f1011] border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8a8f98] hover:text-[#f7f8f8] transition-colors text-sm font-semibold cursor-pointer"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-[#f7f8f8] tracking-tight mb-2">
          Entrar no ecossistema
        </h2>
        <p className="text-xs text-[#8a8f98] mb-6">
          Acesse CRM, OpenSquad, automação e inteligência de dados.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs whitespace-pre-wrap">
            {error}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            ⚠️ Variáveis de ambiente do Supabase não encontradas.
            Configure <code>VITE_SUPABASE_URL</code> e{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> no painel do Vercel.
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/[0.04] hover:bg-white/[0.06] text-[#f7f8f8] rounded-xl font-medium text-sm transition-all border border-white/[0.08] cursor-pointer shadow-md disabled:opacity-50"
          >
            <span className="text-base">🌐</span>
            <span>{loading ? 'Conectando...' : 'Entrar com Google'}</span>
          </button>

          <button
            onClick={() => handleOAuth('github')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/[0.04] hover:bg-white/[0.06] text-[#f7f8f8] rounded-xl font-medium text-sm transition-all border border-white/[0.08] cursor-pointer shadow-md disabled:opacity-50"
          >
            <span className="text-base">💻</span>
            <span>{loading ? 'Conectando...' : 'Entrar com GitHub'}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#62666d] mt-4 text-center">
          Ao entrar, você aceita os termos de uso e a política de privacidade.
        </p>
      </div>
    </div>
  );
};
