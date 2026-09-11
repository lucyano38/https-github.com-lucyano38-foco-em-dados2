import { loginWithGoogle, loginWithGithub, loginWithMicrosoft } from '../lib/auth';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginProvider?: (provider: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    try {
      setErrorMsg(null);
      setLoading(true);
      const user = await (provider === 'google'
        ? loginWithGoogle()
        : provider === 'github'
          ? loginWithGithub()
          : loginWithMicrosoft());
      localStorage.setItem('foco_em_dados_auth', 'true');
      localStorage.setItem('foco_usuario', JSON.stringify({ nome: user.displayName || user.email?.split('@')[0] || 'Usuário', email: user.email }));
      onClose();
      window.location.href = '/prospeccao';
    } catch (err: any) {
      setErrorMsg('Erro no login social: ' + (err.message || err));
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

          <div className="pt-2 border-t border-slate-800">
            <p className="text-[11px] text-slate-500 text-center mb-2">Login por e-mail em manutenção. Use uma conta social.</p>
            <a
              href="mailto:atendimento@focoemdados.com.br?subject=Login por e-mail"
              className="w-full py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl font-medium text-xs border border-amber-500/30 transition-all cursor-pointer text-center"
            >
              ✉️ Solicitar acesso por e-mail
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
