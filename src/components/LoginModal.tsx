import React, { useState } from 'react';
import { loginWithGoogle, loginWithGithub, loginWithMicrosoft } from '../lib/auth';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginProvider?: (provider: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginProvider }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let cred: any;
      if (provider === 'google') {
        cred = await loginWithGoogle();
      } else if (provider === 'github') {
        cred = await loginWithGithub();
      } else {
        cred = await loginWithMicrosoft();
      }

      const user = cred?.user || cred;
      if (user && user.email) {
        const email = user.email;
        localStorage.setItem('foco_em_dados_user_email', email);
        localStorage.setItem('foco_usuario_email', email);
        localStorage.setItem('foco_usuario', JSON.stringify({
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || '',
          uid: user.uid
        }));
      }

      if (onLoginProvider) {
        onLoginProvider(provider);
      }
      onClose();
    } catch (err: any) {
      console.error(`Firebase Auth [${provider}] error:`, err);
      if (err?.code === 'auth/popup-closed-by-user') {
        // Usuário cancelou ou fechou a janela do popup
        return;
      }
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        setErrorMessage('O pop-up de login foi bloqueado pelo seu navegador. Por favor, permita pop-ups para autenticar.');
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        setErrorMessage('Já existe uma conta associada a este e-mail com outro método de login.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setErrorMessage(`O login com ${provider} não está habilitado no Firebase Console.`);
      } else {
        setErrorMessage(err?.message || 'Falha ao autenticar com o Firebase. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Fazer Login no Foco em Dados</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white text-sm p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-5">Acesse o ecossistema com sua conta Google ou corporativa.</p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 leading-relaxed">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span>{loading ? 'Conectando...' : 'Entrar com o Google'}</span>
          </button>

          <button
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-slate-800 text-slate-100 rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer border border-slate-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span>{loading ? 'Conectando...' : 'Entrar com o GitHub'}</span>
          </button>

          <button
            onClick={() => handleSocialLogin('microsoft')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-slate-800 text-slate-100 rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer border border-slate-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 24h-4v-2h2v-4h-2v-2h4v-3.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V24h-5v-2h4v-1h-4v-2h5v-2.5h-4v-2h4v-1h-4v-2h5v2h-4v1h4v2h-5v1h4v2z"/></svg>
            <span>{loading ? 'Conectando...' : 'Entrar com a Microsoft'}</span>
          </button>
        </div>

        <button 
          onClick={onClose} 
          disabled={loading}
          className="mt-5 text-xs text-slate-400 hover:text-slate-200 text-center w-full transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
