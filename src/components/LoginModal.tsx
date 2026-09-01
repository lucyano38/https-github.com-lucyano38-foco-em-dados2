import React, { useState } from 'react';
import { signInWithSocial, signUpOrSignInWithEmail } from '../lib/auth';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginProvider?: (provider: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    try {
      setErrorMsg(null);
      setLoading(true);
      const user = await signInWithSocial(provider);
      localStorage.setItem('foco_em_dados_auth', 'true');
      localStorage.setItem('foco_usuario', JSON.stringify({ nome: user.displayName || user.email?.split('@')[0] || 'Usuário', email: user.email }));
      onClose();
      window.location.href = '/prospeccao';
    } catch (err: any) {
      setErrorMsg('Erro no login social: ' + (err.message || err));
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Informe e-mail e senha.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await signUpOrSignInWithEmail(email, password, isSignUp);
      localStorage.setItem('foco_em_dados_auth', 'true');
      localStorage.setItem('foco_usuario', JSON.stringify({ nome: email.split('@')[0], email: user.email }));
      onClose();
      window.location.href = '/prospeccao';
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao autenticar com e-mail.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 text-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer text-sm font-semibold" aria-label="Fechar">✕</button>
        
        <h2 className="text-xl font-bold tracking-tight mb-1">Acessar Foco em Dados PRO</h2>
        <p className="text-xs text-slate-400 mb-6">Entre com sua conta ou cadastre-se para acessar o ecossistema (R$ 39,90/mês).</p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {isEmailMode ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-amber-400">{isSignUp ? 'Criar Nova Conta' : 'Entrar com E-mail'}</span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail</label>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Senha</label>
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
              {loading ? 'Processando...' : (isSignUp ? 'Criar Conta com E-mail' : 'Entrar na Conta')}
            </button>
            <button
              type="button"
              onClick={() => setIsEmailMode(false)}
              className="w-full text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer pt-2"
            >
              ← Voltar para login social
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continuar com Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin('microsoft')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continuar com Microsoft</span>
            </button>

            <button
              onClick={() => handleSocialLogin('github')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continuar com GitHub</span>
            </button>

            <div className="pt-2">
              <button
                onClick={() => { setIsEmailMode(true); setIsSignUp(false); }}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-xl font-medium text-xs border border-amber-500/30 transition-all cursor-pointer"
              >
                ✉️ Cadastrar ou Entrar com E-mail e Senha
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
