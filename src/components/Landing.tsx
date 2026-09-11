import React, { useState } from 'react';
import { LoginModal } from './LoginModal';
import { NicheSolutions } from './NicheSolutions';
import { MarketDiagnostic } from './MarketDiagnostic';
import { AgenteHermesSection } from './AgenteHermesSection';
import { LeadCaptureCTA } from './LeadCaptureCTA';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { DashboardPreview } from './landing/DashboardPreview';
import { ConversionFunnel } from './landing/ConversionFunnel';
import { ServicesPricing } from './landing/PricingSection';
import { FaqSection } from './landing/FaqSection';
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

  const handleNavegacao = (mode) => {
    if (typeof onStart === "function") {
      onStart(mode);
      return;
    }
    window.location.href = "/?mode=" + mode;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans">
      
      {/* VÍDEO DE FUNDO FIXO — cobre 100% da tela, atrás de tudo */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-45 pointer-events-none"
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/40 to-slate-950/80 z-0 pointer-events-none" />

      {/* NAVBAR PROFISSIONAL */}
      <Navbar
        activeTab={activeTab || ''}
        setActiveTab={setActiveTab || (() => {})}
        onEnterApp={(mode) => handleNavegacao(mode)}
        isPro={isPro || false}
      />

      {/* HERO PRINCIPAL */}
      <Hero />

      {/* DASHBOARD PREVIEW — métricas interativas */}
      <div className="relative z-10">
        <DashboardPreview />
      </div>

      {/* FUNIL DE CONVERSÃO */}
      <div className="relative z-10">
        <ConversionFunnel />
      </div>

      {/* PILAR 3: AGENTE HERMES */}
      <section id="hermes" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">Pilar 3 · Inteligência 24/7</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Agente Hermes: Atendimento Omnichannel</h2>
          <p className="text-sm text-slate-300">Conecte WhatsApp, Instagram e Facebook e deixe o Hermes qualificar leads e agendar reuniões.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 shadow-2xl transition-all">
            <Bot className="w-8 h-8 text-violet-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Hermes Imobiliária</h3>
            <p className="text-xs text-slate-300 leading-relaxed">Atendimento automático de imóveis, envio de fotos e agendamento direto de visitas na agenda.</p>
          </div>
          <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 shadow-2xl transition-all">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Hermes Clínica</h3>
            <p className="text-xs text-slate-300 leading-relaxed">Confirmação de consultas, triagem de pacientes e agendamentos automatizados sem operador humano.</p>
          </div>
          <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 shadow-2xl transition-all">
            <Cpu className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">OpenSquad & Outros Nichos</h3>
            <p className="text-xs text-slate-300 leading-relaxed">Oficinas, advocacia, restaurantes e comércio com agentes especializados monitorando todo o pipeline.</p>
          </div>
        </div>
      </section>

      {/* PILAR 4: PROSPECTOR IA — gated behind paywall */}
      <section id="prospector" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="bg-slate-900 border border-slate-700/60 rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center transition-all">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">Pilar 4 · Prospecção B2B (Estilo Apollo)</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Prospector IA: Encontre Clientes em Escala</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Busque empresas por Cidade, Segmento e Raio de km. O sistema coleta nome, telefone, e-mail, redes sociais e classifica automaticamente entre <span className="text-emerald-400 font-bold">Alta Oportunidade</span> (sem site) e <span className="text-amber-400 font-bold">Média Oportunidade</span> (site antigo).
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  const el = document.getElementById('demonstracao');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-lg"
              >
                Quero Testar Grátis →
              </button>
              <span className="text-xs text-slate-500">Setup em 5 min • Sem cartão</span>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner space-y-3 font-mono text-xs text-slate-300 opacity-70">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-2">Ranking de Oportunidades B2B</div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span>Restaurante Sabor (SP)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Sem Site (Alta)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span>Clínica Vida (RJ)</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">Site Antigo (Média)</span>
            </div>
            <div className="text-center text-[10px] text-slate-600 pt-2">🔒 Acesso liberado após assinatura</div>
          </div>
        </div>
      </section>

      {/* SOLUÇÕES POR NICHO */}
      <section id="automacao">
        <NicheSolutions />
      </section>

      {/* DIAGNÓSTICO DE MERCADO */}
      <MarketDiagnostic />

      {/* AGENTE HERMES */}
      <AgenteHermesSection />

      {/* CTA DE CAPTURA */}
      <LeadCaptureCTA />

      {/* SERVIÇOS SOB DEMANDA */}
      <div className="relative z-10">
        <ServicesPricing />
      </div>

      {/* FAQ */}
      <div className="relative z-10">
        <FaqSection onAskQuestion={() => handleNavegacao('growth')} />
      </div>

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
