import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginProvider?: (provider: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuth = async (provider: 'google' | 'github' | 'azure') => {
    try {
      setErrorMsg(null);
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/prospeccao`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg('Erro na autenticação: ' + err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      let { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        const signUpRes = await supabase.auth.signUp({ email, password });
        if (signUpRes.error) throw signUpRes.error;
        data = signUpRes.data;
        alert('Cadastro realizado com sucesso! Verifique seu e-mail se necessário.');
      }

      if (data?.session || data?.user) {
        localStorage.setItem('foco_em_dados_auth', 'true');
        localStorage.setItem('foco_usuario', JSON.stringify({ nome: email.split('@')[0], email }));
        onClose();
        window.location.href = '/prospeccao';
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao autenticar com e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 text-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer text-sm font-semibold" aria-label="Fechar">✕</button>
        
        <h2 className="text-xl font-bold tracking-tight mb-1">Acessar Foco em Dados</h2>
        <p className="text-xs text-slate-400 mb-6">Entre com sua conta para verificar sua assinatura (R$ 39,90/mês).</p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {isEmailMode ? (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail corporativo ou pessoal</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Senha de acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Entrar ou Cadastrar com E-mail'}
            </button>
            <button
              type="button"
              onClick={() => setIsEmailMode(false)}
              className="w-full text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer pt-2"
            >
              ← Voltar para login social (Google, Microsoft, GitHub)
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continuar com Google</span>
            </button>

            <button
              onClick={() => handleOAuth('azure')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continuar com Microsoft (Azure AD)</span>
            </button>

            <button
              onClick={() => handleOAuth('github')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continuar com GitHub</span>
            </button>

            <div className="pt-2">
              <button
                onClick={() => setIsEmailMode(true)}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-xl font-medium text-xs border border-amber-500/30 transition-all cursor-pointer"
              >
                ✉️ Acessar com E-mail e Senha separados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
