import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [segment, setSegment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    if (!email.trim()) { setError('E-mail é obrigatório'); return; }
    if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('Senhas não coincidem'); return; }

    setLoading(true);
    try {
      await signUp({ email, password, name, store_name: storeName, segment });
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card p-8 text-center space-y-6">
          <span className="material-symbols-outlined text-5xl text-vivid-purple">mark_email_unread</span>
          <h1 className="text-2xl font-bold text-white">Verifique seu e-mail</h1>
          <p className="text-slate-400 text-sm">
            Enviamos um link de confirmação para <strong className="text-white">{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 h-12 bg-vivid-purple hover:bg-vivid-purple/90 text-white font-bold rounded-xl transition-all"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  const segments = [
    { value: 'moda', label: 'Moda e Vestuário' },
    { value: 'eletronicos', label: 'Eletrônicos' },
    { value: 'alimentos', label: 'Alimentos e Bebidas' },
    { value: 'moveis', label: 'Móveis e Decoração' },
    { value: 'saude', label: 'Saúde e Beleza' },
    { value: 'outro', label: 'Outro' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-vivid-purple/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-deep-blue/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md glass-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-vivid-purple/10 mb-2">
            <span className="material-symbols-outlined text-vivid-purple text-2xl">person_add</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-sm text-slate-400">Comece sua avaliação gratuita de 7 dias.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">Nome *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">E-mail *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Senha *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mín. 6 caracteres"
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Confirmar *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">Nome da Loja</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex: Minha Loja Online"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">Segmento</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="input-field"
            >
              <option value="">Selecione um segmento</option>
              {segments.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-12 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'Criar Conta Grátis'
            )}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center">
          Ao criar sua conta, você aceita nossos{' '}
          <Link to="/termos" className="text-vivid-purple hover:underline">Termos de Uso</Link>
          {' '}e{' '}
          <Link to="/privacidade" className="text-vivid-purple hover:underline">Política de Privacidade</Link>.
        </p>

        <p className="text-sm text-slate-400 text-center">
          Já tem conta?{' '}
          <Link to="/login" className="text-vivid-purple hover:underline font-semibold">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
