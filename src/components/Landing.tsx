import React, { useState } from 'react';
import { LoginModal } from './LoginModal';
import { googleSignIn } from '../lib/auth';
import { supabaseServiceRole } from '../lib/supabaseClient';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => void;
  onUploadFile?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<string | null>(null);

  const handleCheckoutStripe = async () => {
    try {
      setLoadingCheckout(true);
      const response = await fetch('/api/criar-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.url) {
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

  const startMode = (mode: string) => {
    if (typeof onStart === 'function') {
      onStart(mode);
    }
  };

  const handleLoginProvider = async (provider: 'google' | 'github') => {
    if (provider !== 'google') {
      setLoginError('Login com GitHub ainda não está disponível. Use o login com Google.');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    try {
      const result = await googleSignIn();
      const target = pendingMode;
      setPendingMode(null);
      setIsLoginOpen(false);
      if (result?.user) {
        if (target) startMode(target);
      } else {
        setLoginError('Falha ao autenticar com o Google.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Falha ao autenticar com o Google.');
    } finally {
      setLoginLoading(false);
    }
  };

  const requestProtectedMode = (mode: string) => {
    setPendingMode(mode);
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans">
      
      {/* BACKGROUND COM VÍDEO ANIMADO E OVERLAY SÓLIDO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
        >
          <source src="/bg.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos em segundo plano.
        </video>
        <div className="absolute inset-0 bg-slate-950/92" />
      </div>

      {/* NAVBAR SUPERIOR */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-slate-950 font-extrabold text-sm">⚡</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-100">Foco em Dados</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">PRO</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
          <a href="#recursos" className="hover:text-amber-400 transition-colors">Ecossistema</a>
          <a href="#automacao" className="hover:text-amber-400 transition-colors">Automação & WhatsApp</a>
          <a href="#planos" className="hover:text-amber-400 transition-colors">Planos (R$ 39,90)</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors px-3 py-2 cursor-pointer"
          >
            Entrar
          </button>
          <button
            onClick={handleCheckoutStripe}
            disabled={loadingCheckout}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loadingCheckout ? 'Carregando...' : 'Assinar Acesso'}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-md mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">O Sistema Operacional de Vendas Inteligentes & Dados B2B</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 mb-6 leading-tight">
          Prospecção automatizada e <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">vendas via WhatsApp</span> em escala.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mb-10 font-normal leading-relaxed">
          Unifique inteligência comercial, relatórios executivos em BI e agentes autônomos para qualificar clientes e acelerar o seu faturamento.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => requestProtectedMode('prospecting')}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Conhecer o Ecossistema</span>
            <span>→</span>
          </button>

          <a
            href="#automacao"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl transition-all border border-slate-800 flex items-center justify-center gap-2"
          >
            <span>Ver Automação WhatsApp</span>
          </a>
        </div>
      </section>

      {/* SEÇÃO DE RECURSOS */}
      <section id="recursos" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">Construído para Operações de Alta Performance</h2>
          <p className="text-xs sm:text-sm text-slate-400">Ferramentas de ponta unificadas em um único painel inteligente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => requestProtectedMode('indicators')} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/40 transition cursor-pointer">
            <h3 className="text-lg font-bold text-slate-100 mb-2">📊 Inteligência de Dados & BI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Painéis gerenciais automatizados e relatórios em PDF prontos para tomada de decisão executiva.</p>
          </div>

          <div onClick={() => requestProtectedMode('prospecting')} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/40 transition cursor-pointer">
            <h3 className="text-lg font-bold text-slate-100 mb-2">🎯 Prospecção B2B Ativa</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Varredura de leads qualificados por nicho e região, organizados em CRM Kanban interativo.</p>
          </div>

          <div onClick={() => requestProtectedMode('opensquad')} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/40 transition cursor-pointer">
            <h3 className="text-lg font-bold text-slate-100 mb-2">🤖 Agentes Autônomos (OpenSquad)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Orquestração por IA para qualificar e responder contatos de forma humanizada e ágil.</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE AUTOMAÇÃO WHATSAPP */}
      <section id="automacao" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Omnichannel</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-4 mb-4">Vendas no WhatsApp sem esforço manual</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Integre disparos inteligentes, gerencie conversas e automatize a qualificação de clientes diretamente nos canais de mensagens mais usados do mercado.
            </p>
            <ul className="text-xs text-slate-300 space-y-2">
              <li>✓ Mensagens customizadas por nicho</li>
              <li>✓ Fluxos de conversação guiados por IA</li>
              <li>✓ Sincronização em tempo real com o CRM</li>
            </ul>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-xs text-slate-300 space-y-3">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-2">Simulação de Disparo Automatizado</div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500">10:42 - </span> Lead capturado: <span className="text-slate-100">Clínica Exemplo</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-emerald-400">WhatsApp Dispatch:</span> Abordagem enviada com sucesso 🚀
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE PLANOS */}
      <section id="planos" className="relative z-10 max-w-4xl mx-auto px-6 py-16 border-t border-slate-800/80 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">Construindo o Futuro com Você</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-8">Acesso completo PRO por apenas R$ 39,90/mês.</p>
        <div className="inline-block bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Acesso PRO</span>
          <div className="text-3xl font-extrabold text-slate-100 my-2">R$ 39,90 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
          <p className="text-xs text-slate-400 mb-6">Acesso antecipado ao painel e ferramentas de automação.</p>
          <button
            onClick={handleCheckoutStripe}
            disabled={loadingCheckout}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
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
