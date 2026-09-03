import React, { useState } from 'react';
import { LoginModal } from './LoginModal';
import { Zap, ShieldCheck, Check, Sparkles, MessageCircle, PlayCircle, TrendingUp, Users, ArrowRight, Bot } from 'lucide-react';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => void;
  onUploadFile?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [usuarioLogado, setUsuarioLogado] = useState<{ nome: string; email: string } | null>(() => {
    try {
      const u = localStorage.getItem('foco_usuario');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const handleNavegacaoInstantanea = (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => {
    // Sênior Bypass: Libera acesso imediato para teste e uso do ecossistema
    localStorage.setItem('foco_em_dados_auth', 'true');
    localStorage.setItem('foco_em_dados_pro', 'true');
    if (typeof onStart === 'function') {
      onStart(mode);
    }
  };

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
        window.location.href = 'https://buy.stripe.com/5kQbJ1gwj8VI6Cf4Lq5Vu03';
      }
    } catch {
      window.location.href = 'https://buy.stripe.com/5kQbJ1gwj8VI6Cf4Lq5Vu03';
    } finally {
      setLoadingCheckout(false);
    }
  };

  const faqs = [
    { q: 'Preciso de cartão de crédito para testar?', a: 'Não. Você pode testar o ecossistema e fazer upload gratuito de planilhas de até 100 linhas.' },
    { q: 'Como o OpenSquad AI funciona?', a: 'Nossos agentes autônomos trabalham em pipeline 24/7: varrem leads, auditam sites, criam propostas de redesign antes/depois e disparam abordagens via WhatsApp.' },
    { q: 'Posso cancelar a assinatura de R$ 39,90 quando quiser?', a: 'Sim, sem fidelidade ou multas. O cancelamento é feito diretamente pelo painel do Stripe com 1 clique.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans">
      
      {/* BACKGROUND CINEMATOGRÁFICO COM VÍDEO ANIMADO E OVERLAY PROFISSIONAL */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105"
        >
          <source src="/bg.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos em segundo plano.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950" />
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
          <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {usuarioLogado ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 font-medium">Olá, {usuarioLogado.nome}</span>
              <button
                onClick={() => {
                  setUsuarioLogado(null);
                  localStorage.removeItem('foco_usuario');
                  localStorage.removeItem('foco_em_dados_auth');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer underline"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors px-3 py-2 cursor-pointer"
            >
              Entrar
            </button>
          )}
          <button
            onClick={handleCheckoutStripe}
            disabled={loadingCheckout}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loadingCheckout ? 'Processando...' : 'Assinar Acesso'}
          </button>
        </div>
      </nav>

      {/* HERO SECTION DE ALTA CONVERSÃO */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700 shadow-md mb-6 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-200">🚀 O Sistema Operacional de Vendas B2B & Agentes Autônomos</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
          Prospecção automatizada e <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">vendas via WhatsApp</span> em escala.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-12 font-normal leading-relaxed">
          Unifique inteligência comercial estilo Apollo.io, relatórios executivos em BI e o squad de IA OpenSquad para acelerar seu faturamento.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => handleNavegacaoInstantanea('prospecting')}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base rounded-xl transition-all shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Iniciar Missão Unificada (Acessar Ecossistema)</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleNavegacaoInstantanea('evolua_demo')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-semibold text-base rounded-xl transition-all border border-slate-700 backdrop-blur-md flex items-center justify-center gap-3 cursor-pointer shadow-lg"
          >
            <PlayCircle className="w-5 h-5 text-amber-400" />
            <span>Ver Demonstração Prática</span>
          </button>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl w-full pt-8 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-2xl font-bold text-white font-mono">14.892+</div>
            <div className="text-xs text-slate-400 mt-1">Leads Qualificados</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-2xl font-bold text-amber-400 font-mono">38.2%</div>
            <div className="text-xs text-slate-400 mt-1">Taxa de Conversão</div>
          </div>
          <div className="col-span-2 md:col-span-1 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-2xl font-bold text-emerald-400 font-mono">24/7</div>
            <div className="text-xs text-slate-400 mt-1">Agentes OpenSquad</div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE RECURSOS (ECOSSISTEMA COM CARDS SÓLIDOS DE ALTO CONTRASTE) */}
      <section id="recursos" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Construído para Operações de Alta Performance</h2>
          <p className="text-sm text-slate-300">Ferramentas de ponta unificadas em um único painel inteligente sem atritos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: BI */}
          <div 
            onClick={() => handleNavegacaoInstantanea('indicators')} 
            className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500 rounded-3xl p-8 shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">📊 Inteligência de Dados & BI</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Painéis gerenciais automatizados, relatórios executivos em PDF e análise preditiva de receita com IA.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              Acessar Indicadores Executivos <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Prospecção */}
          <div 
            onClick={() => handleNavegacaoInstantanea('prospecting')} 
            className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500 rounded-3xl p-8 shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">🎯 Prospecção B2B Ativa</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Varredura estilo Apollo.io por nicho, cidade e raio de km, integrada ao CRM Kanban e geração de propostas instantâneas.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition">
              Explorar Prospecção B2B <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: OpenSquad */}
          <div 
            onClick={() => handleNavegacaoInstantanea('opensquad')} 
            className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500 rounded-3xl p-8 shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">🤖 Agentes Autônomos (OpenSquad)</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Orquestração por IA onde cada agente monitora o outro: auditoria de sites, antes/depois do redesign, WhatsApp e contratos automáticos.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-violet-400 group-hover:translate-x-1 transition">
              Abrir Painel OpenSquad <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE AUTOMAÇÃO WHATSAPP */}
      <section id="automacao" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">Omnichannel & IA</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 mb-4">Vendas no WhatsApp sem esforço manual</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Integre disparos inteligentes, gerencie conversas e automatize a qualificação de clientes diretamente nos canais de mensagens mais usados do mercado.
            </p>
            <ul className="text-xs sm:text-sm text-slate-200 space-y-3">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Mensagens customizadas por nicho e região</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Fluxos de conversação guiados por IA (Gemini)</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Sincronização em tempo real com o CRM Kanban</li>
            </ul>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-xs text-slate-200 space-y-3 shadow-inner">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Simulação de Disparo OpenSquad</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">10:42 - </span> Lead capturado: <span className="text-white font-bold">Clínica Exemplo SP</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-amber-400 font-bold">Redesign Gerado:</span> Prévia Antes x Depois enviada via WhatsApp 🚀
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS E PREÇOS */}
      <section id="planos" className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-slate-800 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Acesso Total ao Ecossistema PRO</h2>
        <p className="text-sm text-slate-300 mb-10">Desbloqueie prospecção ilimitada, CRM e agentes autônomos por um preço acessível.</p>
        <div className="inline-block bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 shadow-2xl max-w-md w-full relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Recomendado
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Assinatura Mensal</span>
          <div className="text-4xl font-extrabold text-white my-2">R$ 39,90 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
          <p className="text-xs text-slate-300 mb-6">Acesso imediato a todas as ferramentas sem restrições.</p>
          <ul className="text-xs text-slate-200 space-y-2.5 mb-8">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Prospecção B2B Ilimitada (Estilo Apollo)</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> CRM Kanban & Relatórios em PDF</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> OpenSquad AI (Agentes 24/7)</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Disparos de propostas via Resend</li>
          </ul>
          <button
            onClick={handleCheckoutStripe}
            disabled={loadingCheckout}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-amber-500/30 cursor-pointer disabled:opacity-50 text-center"
          >
            {loadingCheckout ? 'Processando...' : 'Assinar Acesso PRO (R$ 39,90)'}
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl font-bold text-white">Perguntas Frequentes</h2>
          <p className="text-sm text-slate-400">Tire suas dúvidas sobre a plataforma.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left font-semibold text-white flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition"
              >
                <span className="text-sm">{faq.q}</span>
                <span className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginProvider={(provider) => {
          const dadosUsuario = { nome: `Usuário ${provider}`, email: `usuario@${provider}.com` };
          setUsuarioLogado(dadosUsuario);
          localStorage.setItem('foco_usuario', JSON.stringify(dadosUsuario));
          localStorage.setItem('foco_em_dados_auth', 'true');
          setIsLoginOpen(false);
          handleNavegacaoInstantanea('prospecting');
        }}
      />
    </div>
  );
};

export default Landing;
