import React from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginProvider: (provider: 'google' | 'github') => void;
  loading?: boolean;
  error?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginProvider, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010102]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0f1011] border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8f98] hover:text-[#f7f8f8] transition-colors text-sm font-semibold cursor-pointer">
          ✕
        </button>
        <h2 className="text-xl font-bold text-[#f7f8f8] tracking-tight mb-2">Entrar no ecossistema</h2>
        <p className="text-xs text-[#8a8f98] mb-6">Acesse CRM, OpenSquad, automação e inteligência de dados.</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => onLoginProvider('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/[0.04] hover:bg-white/[0.06] text-[#f7f8f8] rounded-xl font-medium text-sm transition-all border border-white/[0.08] cursor-pointer shadow-md disabled:opacity-50"
          >
            <span className="text-base">🌐</span>
            <span>{loading ? 'Entrando...' : 'Entrar com Google'}</span>
          </button>

          <button
            onClick={() => onLoginProvider('github')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/[0.04] hover:bg-white/[0.06] text-[#f7f8f8] rounded-xl font-medium text-sm transition-all border border-white/[0.08] cursor-pointer shadow-md disabled:opacity-50"
          >
            <span className="text-base">💻</span>
            <span>Entrar com GitHub</span>
          </button>
        </div>

        <p className="text-[11px] text-[#62666d] mt-4 text-center">
          Ao entrar, você aceita os termos de uso e a política de privacidade.
        </p>
      </div>
    </div>
  );
};
