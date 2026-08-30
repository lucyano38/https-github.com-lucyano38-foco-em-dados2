import React, { useState } from 'react';
import { LoginModal } from './LoginModal';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => void;
  onUploadFile?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const handleCheckoutStripe = async () => {
    try {
      setLoadingCheckout(true);
      const response = await fetch('/api/criar-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.url || data.urlCheckout) {
        window.location.href = data.url || data.urlCheckout;
      } else {
        window.location.href = 'https://buy.stripe.com/focoemdados-pro';
      }
    } catch (err) {
      window.location.href = 'https://buy.stripe.com/focoemdados-pro';
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans">
      
      {/* ================================================= */}
      {/* BACKGROUND COM VÍDEO ANIMADO E OVERLAY SÓLIDO      */}
      {/* ================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
        >
          <source src="/bg.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos em segundo plano.
        </video>
        {/* Overlay escuro sólido para garantir legibilidade absoluta em todas as seções */}
        <div className="absolute inset-0 bg-slate-950/90" />
      </div>

      {/* ================================================= */}
      {/* NAVBAR SUPERIOR                                   */}
      {/* ================================================= */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-slate-950 font-extrabold text-sm">⚡</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-100">Foco em Dados</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">PRO</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
          <a href="#recursos" className="hover:text-amber-400 transition-colors">Recursos</a>
          <a href="#planos" className="hover:text-amber-400 transition-colors">Planos (R$ 39,90)</a>
          <a href="#automacao" className="hover:text-amber-400 transition-colors">Automação</a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
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

      {/* ================================================= */}
      {/* HERO SECTION (DESTAQUE PRINCIPAL)                 */}
      {/* ================================================= */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24 text-center flex flex-col items-center">
        
        {/* Badge de Destaque */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-md mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Plataforma Oficial de Inteligência de Dados & Automação B2B</span>
        </div>

        {/* Título Principal Imponente */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 mb-8 leading-[1.1]">
          Decisões baseadas em <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">dados precisos</span> e prospecção em escala.
        </h1>

        {/* Subtítulo */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mb-10 font-normal leading-relaxed">
          Unifique seus relatórios de BI, automatize a captação de leads qualificados em qualquer cidade e acelere suas vendas com agentes inteligentes.
        </p>

        {/* CTAs de Conversão Direta */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => onStart('prospecting')}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Iniciar Missão Unificada (R$ 39,90)</span>
            <span>→</span>
          </button>

          <a
            href="#planos"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl transition-all border border-slate-800 flex items-center justify-center gap-2"
          >
            <span>Ver Planos e Preços</span>
          </a>
        </div>

        {/* Informação de Segurança / Garantia */}
        <p className="mt-6 text-xs text-slate-500 font-medium">
          🔒 Pagamento seguro via Stripe • Acesso imediato após a confirmação • Cancele quando quiser.
        </p>
      </section>

      {/* ================================================= */}
      {/* SEÇÃO DE PÚBLICO-ALVO (CARDS SÓLIDOS E LEGÍVEIS)    */}
      {/* ================================================= */}
      <section id="recursos" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">Construído para Líderes Orientados a Dados</h2>
          <p className="text-xs sm:text-sm text-slate-400">Soluções sob medida para cada papel estratégico da sua organização.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => onStart('indicators')} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/40 transition cursor-pointer">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Diretores e Sócios</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Visão consolidada de faturamento, margens e previsibilidade de receita com relatórios executivos prontos em PDF.</p>
            <span className="text-xs font-semibold text-amber-400">Ver Indicadores Executivos →</span>
          </div>

          <div onClick={() => onStart('prospecting')} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/40 transition cursor-pointer">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Marketing e Vendas</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Prospecção ativa por nicho e cidade com enriquecimento de dados e pipeline CRM Kanban totalmente automatizado.</p>
            <span className="text-xs font-semibold text-amber-400">Explorar Prospecção B2B →</span>
          </div>

          <div onClick={() => onStart('analytics')} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-amber-500/40 transition cursor-pointer">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Operações e BI</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Conexão com APIs públicas e corporativas, processamento de planilhas e agentes autônomos OpenSquad para auditoria técnica.</p>
            <span className="text-xs font-semibold text-amber-400">Acessar AI Data Analyst →</span>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* SEÇÃO DE PLANOS (EXEMPLO DE PREÇO R$ 39,90)       */}
      {/* ================================================= */}
      <section id="planos" className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">Planos Transparentes e Acessíveis</h2>
          <p className="text-xs sm:text-sm text-slate-400">Escolha o plano ideal para acelerar os seus resultados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Card Free */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FREE</span>
            <div className="text-3xl font-extrabold text-slate-100 my-2">R$ 0 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
            <p className="text-xs text-slate-400 mb-6">Até 100 linhas por planilha.</p>
            <ul className="text-xs text-slate-300 space-y-3 mb-8">
              <li>✓ Dashboard executivo completo</li>
              <li>✓ Insights com IA Gemini</li>
              <li>✓ KPIs profissionais prontos</li>
            </ul>
            <button onClick={() => onStart('analytics')} className="w-full py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-700 transition">
              Plano Atual
            </button>
          </div>

          {/* Card Pro (R$ 39,90) */}
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Mais Popular
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">PRO</span>
            <div className="text-4xl font-extrabold text-slate-100 my-2">R$ 39,90 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
            <p className="text-xs text-amber-300/80 mb-6">Planilhas ilimitadas • Cobrança via Stripe</p>
            <ul className="text-xs text-slate-200 space-y-3 mb-8">
              <li>✓ Planilhas e relatórios ilimitados</li>
              <li>✓ Relatórios executivos em PDF</li>
              <li>✓ Prospecção B2B integrada</li>
              <li>✓ OpenSquad AI (agentes autônomos)</li>
            </ul>
            <button
              onClick={handleCheckoutStripe}
              disabled={loadingCheckout}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loadingCheckout ? 'Processando...' : 'Assinar Acesso PRO (R$ 39,90)'}
            </button>
          </div>
        </div>
      </section>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginProvider={(provider) => {
          alert(`Autenticando via ${provider}...`);
          setIsLoginOpen(false);
          onStart('prospecting');
        }}
      />
    </div>
  );
};

export default Landing;
