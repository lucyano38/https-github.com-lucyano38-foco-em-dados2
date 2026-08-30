import React, { useState } from 'react';
import { LoginModal } from './LoginModal';
import { googleSignIn } from '../lib/auth';
import { supabaseServiceRole } from '../lib/supabaseClient';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => void;
  onUploadFile?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const safeOnStart = typeof onStart === 'function' ? onStart : () => {};
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const handleCheckoutStripe = async () => {
    try {
      setLoadingCheckout(true);
      const response = await fetch('/api/criar-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        window.location.href = 'https://buy.stripe.com/focoemdados-pro';
      }
    } catch {
      window.location.href = 'https://buy.stripe.com/focoemdados-pro';
    } finally {
      setLoadingCheckout(false);
    }
  };

  const startMode = (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => {
    safeOnStart(mode);
  };

  const handleLoginProvider = async (provider: 'google' | 'github') => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      let result: { user: any; accessToken: string } | null = null;
      if (provider === 'google') {
        result = await googleSignIn();
      } else if (provider === 'github') {
        result = await githubSignIn();
      } else {
        setLoginError('Opção de login indisponível.');
        setLoginLoading(false);
        return;
      }

      const target = pendingMode;
      setPendingMode(null);
      if (result?.user) {
        localStorage.setItem('foco_em_dados_auth', 'true');
        localStorage.setItem('foco_em_dados_user_email', (result.user.email || '').trim());
        setIsLoginOpen(false);
        if (target) {
          startMode(target);
        }
      } else {
        setLoginError('Falha ao autenticar.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Falha ao autenticar.');
      setIsLoginOpen(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const requestProtectedMode = (mode: string) => {
    setPendingMode(mode);
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] relative overflow-x-hidden font-sans">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* BACKGROUND COM VÍDEO ANIMADO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/bg.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        >
          <source src="/bg.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos em segundo plano.
        </video>
        <div className="absolute inset-0 bg-[#010102]/80 backdrop-blur-sm" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-white/[0.06] bg-[#010102]/70 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d4a574] flex items-center justify-center shadow-[0_0_15px_rgba(212,165,116,0.20)]">
            <span className="text-[#010102] font-extrabold text-sm">⚡</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#f7f8f8]">Foco em Dados</span>
          <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#d0d6e0] border border-white/[0.08] uppercase">Pro</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#d0d6e0]">
          <a href="#recursos" className="hover:text-[#f7f8f8] transition-colors">Ecossistema</a>
          <a href="#automacao" className="hover:text-[#f7f8f8] transition-colors">Automação</a>
          <a href="#planos" className="hover:text-[#f7f8f8] transition-colors">Planos</a>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsLoginOpen(true)} className="px-3 py-2 text-xs font-medium text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors cursor-pointer">
            Entrar
          </button>
          <button
            onClick={handleCheckoutStripe}
            disabled={loadingCheckout}
            className="px-4 py-2 bg-[#d4a574] hover:bg-[#e2b98a] text-[#010102] font-semibold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(212,165,116,0.20)] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loadingCheckout ? 'Processando...' : 'Assinar Acesso'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#d4a574] animate-pulse" />
          <span className="text-xs font-medium text-[#d0d6e0]">O Sistema Operacional de Vendas Inteligentes & Dados B2B</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#f7f8f8] mb-6 leading-[1.10]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Prospecção automatizada e <span className="text-[#d4a574]">vendas via WhatsApp</span> em escala.
        </h1>

        <p className="text-sm sm:text-base text-[#8a8f98] max-w-2xl mb-10 font-normal leading-relaxed">
          Unifique inteligência comercial, relatórios executivos em BI e agentes autônomos para qualificar clientes e acelerar o seu faturamento.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => requestProtectedMode('prospecting')}
            className="w-full sm:w-auto px-8 py-4 bg-[#d4a574] hover:bg-[#e2b98a] text-[#010102] font-semibold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(212,165,116,0.25)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Conhecer o Ecossistema</span>
            <span>→</span>
          </button>

          <a
            href="#automacao"
            className="w-full sm:w-auto px-8 py-4 bg-white/[0.04] hover:bg-white/[0.06] text-[#d0d6e0] font-medium text-sm rounded-xl transition-all border border-white/[0.08] flex items-center justify-center gap-2"
          >
            <span>Ver Automação WhatsApp</span>
          </a>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#f7f8f8] mb-3">Construído para Operações de Alta Performance</h2>
          <p className="text-xs sm:text-sm text-[#8a8f98]">Ferramentas de ponta unificadas em um único painel inteligente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => requestProtectedMode('indicators')} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition cursor-pointer">
            <h3 className="text-base font-semibold text-[#f7f8f8] mb-2">📊 Inteligência de Dados & BI</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">Painéis gerenciais automatizados e relatórios em PDF prontos para tomada de decisão executiva.</p>
          </div>

          <div onClick={() => requestProtectedMode('prospecting')} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition cursor-pointer">
            <h3 className="text-base font-semibold text-[#f7f8f8] mb-2">🎯 Prospecção B2B Ativa</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">Varredura de leads qualificados por nicho e região, organizados em CRM Kanban interativo.</p>
          </div>

          <div onClick={() => requestProtectedMode('opensquad')} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition cursor-pointer">
            <h3 className="text-base font-semibold text-[#f7f8f8] mb-2">🤖 Agentes Autônomos (OpenSquad)</h3>
            <p className="text-xs text-[#8a8f98] leading-relaxed">Orquestração por IA para qualificar e responder contatos de forma humanizada e ágil.</p>
          </div>
        </div>
      </section>

      {/* AUTOMAÇÃO */}
      <section id="automacao" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-white/[0.06]">
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d4a574] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">Omnichannel</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#f7f8f8] mt-4 mb-4">Vendas no WhatsApp sem esforço manual</h2>
            <p className="text-xs sm:text-sm text-[#8a8f98] leading-relaxed mb-6">
              Integre disparos inteligentes, gerencie conversas e automatize a qualificação de clientes diretamente nos canais de mensagens mais usados do mercado.
            </p>
            <ul className="text-xs text-[#d0d6e0] space-y-2">
              <li>✓ Mensagens customizadas por nicho</li>
              <li>✓ Fluxos de conversação guiados por IA</li>
              <li>✓ Sincronização em tempo real com o CRM</li>
            </ul>
          </div>
          <div className="bg-[#010102] border border-white/[0.08] rounded-2xl p-6 font-mono text-xs text-[#d0d6e0] space-y-3">
            <div className="text-[#d4a574] font-semibold border-b border-white/[0.08] pb-2">Simulação de Disparo Automatizado</div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[#62666d]">10:42 - </span> Lead capturado: <span className="text-[#f7f8f8]">Clínica Exemplo</span>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[#10b981]">WhatsApp Dispatch:</span> Abordagem enviada com sucesso 🚀
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="relative z-10 max-w-4xl mx-auto px-6 py-16 border-t border-white/[0.06] text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#f7f8f8] mb-3">Construindo o Futuro com Você</h2>
        <p className="text-xs sm:text-sm text-[#8a8f98] mb-8">Acesso completo PRO por apenas R$ 39,90/mês.</p>
        <div className="inline-block bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
          <span className="text-[11px] font-semibold text-[#d4a574] uppercase tracking-wider">Acesso PRO</span>
          <div className="text-3xl font-semibold text-[#f7f8f8] my-2">R$ 39,90 <span className="text-xs text-[#8a8f98] font-normal">/mês</span></div>
          <p className="text-xs text-[#8a8f98] mb-6">Acesso antecipado ao painel e ferramentas de automação.</p>
          <button
            onClick={handleCheckoutStripe}
            disabled={loadingCheckout}
            className="px-6 py-3 bg-[#d4a574] hover:bg-[#e2b98a] text-[#010102] font-semibold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(212,165,116,0.25)] cursor-pointer disabled:opacity-50"
          >
            {loadingCheckout ? 'Processando...' : 'Assinar Acesso PRO (R$ 39,90)'}
          </button>
        </div>
      </section>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setPendingMode(null);
        }}
        onLoginProvider={handleLoginProvider}
        loading={loginLoading}
        error={loginError}
      />
    </div>
  );
};

export default Landing;
