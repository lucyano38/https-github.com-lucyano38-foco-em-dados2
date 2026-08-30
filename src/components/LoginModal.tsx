import React from 'react';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginProvider: (provider: 'google' | 'github') => void;
  loading?: boolean;
  error?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginProvider,
  loading = false,
  error = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Botão de Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors text-sm font-semibold cursor-pointer"
          aria-label="Fechar"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">
          Acessar Plataforma
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Escolha uma das opções abaixo para entrar com segurança no Foco em Dados.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Opções de Login */}
        <div className="space-y-3">
          <button
            onClick={() => onLoginProvider('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm transition-all border border-slate-700/60 cursor-pointer shadow-md disabled:opacity-50"
          >
            <span>{loading ? 'Entrando...' : 'Continuar com Google'}</span>
          </button>

          <button
            onClick={() => onLoginProvider('github')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-sm transition-all border border-slate-700/60 cursor-pointer shadow-md disabled:opacity-50"
          >
            <span>Continuar com GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
