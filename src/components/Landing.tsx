import React, { useState } from 'react';
import { LoginModal } from './LoginModal';
import { NicheSolutions } from './NicheSolutions';
import { MarketDiagnostic } from './MarketDiagnostic';
import { AgenteHermesSection } from './AgenteHermesSection';
import { LeadCaptureCTA } from './LeadCaptureCTA';
import { Navbar } from './Navbar';
import { Zap, ShieldCheck, Check, Sparkles, MessageCircle, PlayCircle, TrendingUp, Users, ArrowRight, Bot, Cpu, Globe, BarChart3, Layers } from 'lucide-react';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'growth' | 'indicators') => void;
  onUploadFile?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isPro?: boolean;
}

export const Landing: React.FC<LandingProps> = ({ onStart, activeTab, setActiveTab, isPro }) => {
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

    const handleNavegacao = (mode) => {
    localStorage.setItem("foco_em_dados_auth", "true");
    localStorage.setItem("foco_em_dados_pro", "true");
    if (typeof onStart === "function") {
      onStart(mode);
      return;
    }
    window.location.href = "/?mode=" + mode;
  };

  const handleCheckoutStripe = async (plano: string) => {
    try {
      setLoadingCheckout(true);
      const response = await fetch('/api/criar-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano })
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
    { q: 'Como a plataforma cria sites automaticamente?', a: 'Você envia uma planilha, PDF ou logo do seu negócio, e nossa IA gera um site institucional completo com páginas de produtos e integração com WhatsApp em minutos.' },
    { q: 'O Agente Hermes atende no WhatsApp e Instagram?', a: 'Sim! O Hermes opera 24h respondendo clientes, qualificando leads, agendando reuniões e enviando propostas de forma 100% autônoma.' },
    { q: 'Como funciona a prospecção de clientes?', a: 'Nosso módulo Prospector IA varre empresas por cidade, nicho e raio em km, classificando-as automaticamente entre alta, média e baixa oportunidade.' },
    { q: 'Posso cancelar a assinatura quando quiser?', a: 'Sim, sem fidelidade ou multas. O cancelamento é feito diretamente pelo painel com 1 clique.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans">
      
      {/* BACKGROUND CINEMATOGRÁFICO COM VÍDEO ANIMADO E OVERLAY */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-65 scale-105"
        >
          <source src="/bg.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos em segundo plano.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/40 to-slate-950/80" />
      </div>

      {/* NAVBAR PROFISSIONAL */}
      <Navbar
        activeTab={activeTab || ''}
        setActiveTab={setActiveTab || (() => {})}
        onOpenPaywall={() => handleCheckoutStripe('starter')}
        isPro={isPro || false}
      />

      {/* HERO PRINCIPAL */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700 shadow-md mb-6 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-200">Transforme dados em oportunidades e automatize seu negócio com IA</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
          Crie sites, dashboards, automações e <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">agentes de IA</span> sem complicação.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mb-12 font-normal leading-relaxed">
          A plataforma 100% online para PMEs criarem presença digital, prospectarem clientes e operarem todo o atendimento no WhatsApp, Instagram e Facebook automaticamente.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => handleNavegacao('growth')}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base rounded-xl transition-all shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Testar Grátis Agora</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleNavegacao('growth')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-semibold text-base rounded-xl transition-all border border-slate-700 backdrop-blur-md flex items-center justify-center gap-3 cursor-pointer shadow-lg"
          >
            <PlayCircle className="w-5 h-5 text-amber-400" />
            <span>Ver Demonstração ao Vivo</span>
          </button>
        </div>

        {/* MÉTRICAS DE PROVA SOCIAL */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full pt-8 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-2xl font-bold text-white font-mono">+10.000</div>
            <div className="text-xs text-slate-400 mt-1">Sites Gerados</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-2xl font-bold text-amber-400 font-mono">24/7</div>
            <div className="text-xs text-slate-400 mt-1">Atendimento WhatsApp</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-2xl font-bold text-emerald-400 font-mono">38%</div>
            <div className="text-xs text-slate-400 mt-1">Conversão Média</div>
          </div>
          <div className="col-span-2 md:col-span-1 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-2xl font-bold text-blue-400 font-mono">100%</div>
            <div className="text-xs text-slate-400 mt-1">Remoto & Automático</div>
          </div>
        </div>
      </section>

      {/* PILAR 3: AGENTE HERMES */}
      <section id="hermes" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">Pilar 3 · Inteligência 24/7</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Agente Hermes: Atendimento Omnichannel</h2>
          <p className="text-sm text-slate-300">Conecte WhatsApp, Instagram e Facebook e deixe o Hermes qualificar leads e agendar reuniões.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div onClick={() => handleNavegacao('opensquad')} className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500 rounded-3xl p-8 shadow-2xl transition-all cursor-pointer group">
            <Bot className="w-8 h-8 text-violet-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-lg font-bold text-white mb-2">Hermes Imobiliária</h3>
            <p className="text-xs text-slate-300 leading-relaxed">Atendimento automático de imóveis, envio de fotos e agendamento direto de visitas na agenda.</p>
          </div>
          <div onClick={() => handleNavegacao('opensquad')} className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500 rounded-3xl p-8 shadow-2xl transition-all cursor-pointer group">
            <Users className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-lg font-bold text-white mb-2">Hermes Clínica</h3>
            <p className="text-xs text-slate-300 leading-relaxed">Confirmação de consultas, triagem de pacientes e agendamentos automatizados sem operador humano.</p>
          </div>
          <div onClick={() => handleNavegacao('opensquad')} className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500 rounded-3xl p-8 shadow-2xl transition-all cursor-pointer group">
            <Cpu className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-lg font-bold text-white mb-2">OpenSquad & Outros Nichos</h3>
            <p className="text-xs text-slate-300 leading-relaxed">Oficinas, advocacia, restaurantes e comércio com agentes especializados monitorando todo o pipeline.</p>
          </div>
        </div>
      </section>

      {/* PILAR 4: PROSPECTOR IA */}
      <section id="prospector" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500 rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center transition-all">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">Pilar 4 · Prospecção B2B (Estilo Apollo)</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Prospector IA: Encontre Clientes em Escala</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Busque empresas por Cidade, Segmento e Raio de km. O sistema coleta nome, telefone, e-mail, redes sociais e classifica automaticamente entre <span className="text-emerald-400 font-bold">Alta Oportunidade</span> (sem site) e <span className="text-amber-400 font-bold">Média Oportunidade</span> (site antigo).
            </p>
            <button
              onClick={() => handleNavegacao('growth')}
              className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-lg"
            >
              Acessar Prospector IA & CRM →
            </button>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner space-y-3 font-mono text-xs text-slate-300">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-2">Ranking de Oportunidades B2B</div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span>Restaurante Sabor (SP)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Sem Site (Alta)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span>Clínica Vida (RJ)</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">Site Antigo (Média)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUÇÕES POR NICHO */}
      <section id="automacao">
        <NicheSolutions onOpenPaywall={() => handleCheckoutStripe('starter')} />
      </section>

      {/* DIAGNÓSTICO DE MERCADO */}
      <MarketDiagnostic onOpenPaywall={() => handleCheckoutStripe('starter')} />

      {/* AGENTE HERMES */}
      <AgenteHermesSection onOpenDemo={() => handleCheckoutStripe('starter')} />

      {/* CTA DE CAPTURA */}
      <LeadCaptureCTA onOpenPaywall={() => handleCheckoutStripe('starter')} />

      {/* PLANOS SAAS */}
      <section id="planos" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Planos Transparentes para o seu Crescimento</h2>
          <p className="text-sm text-slate-300">Escolha o plano ideal e opere 100% remotamente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Starter */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
              <div className="text-3xl font-extrabold text-white my-2">R$ 97 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
              <p className="text-xs text-slate-400 mb-6">Para pequenos negócios iniciando no digital.</p>
              <ul className="text-xs text-slate-300 space-y-3 mb-8">
                <li>✓ 1 Site Inteligente Automático</li>
                <li>✓ 5 Dashboards de KPIs</li>
                <li>✓ Diagnóstico Digital Ilimitado</li>
              </ul>
            </div>
            <button onClick={() => handleCheckoutStripe('starter')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer">
              Assinar Starter
            </button>
          </div>

          {/* Business */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Business</span>
              <div className="text-3xl font-extrabold text-white my-2">R$ 197 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
              <p className="text-xs text-slate-400 mb-6">Para empresas em expansão de vendas.</p>
              <ul className="text-xs text-slate-300 space-y-3 mb-8">
                <li>✓ Sites Inteligentes Ilimitados</li>
                <li>✓ CRM Inteligente Completo</li>
                <li>✓ Social IA (Redes Sociais)</li>
                <li>✓ Upload de Planilhas Ilimitado</li>
              </ul>
            </div>
            <button onClick={() => handleCheckoutStripe('business')} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-lg">
              Assinar Business
            </button>
          </div>

          {/* Premium (R$ 39,90 destaque / R$ 397) */}
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Mais Popular
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Premium (Especial)</span>
              <div className="text-4xl font-extrabold text-white my-2">R$ 39,90 <span className="text-xs text-slate-400 font-normal">/mês</span></div>
              <p className="text-xs text-amber-300/80 mb-6">Acesso total por tempo limitado.</p>
              <ul className="text-xs text-slate-200 space-y-3 mb-8">
                <li>✓ Tudo do Business incluído</li>
                <li>✓ Agente Hermes IA (WhatsApp/Instagram)</li>
                <li>✓ Prospector IA (Estilo Apollo)</li>
                <li>✓ Observatório de Concorrência & LGPD</li>
              </ul>
            </div>
            <button onClick={() => handleCheckoutStripe('premium')} className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-xl shadow-amber-500/30 cursor-pointer">
              Garantir Acesso PRO (R$ 39,90)
            </button>
          </div>
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
        onLoginProvider={() => {
          setIsLoginOpen(false);
          handleNavegacao('prospecting');
        }}
      />
    </div>
  );
};

export default Landing;
