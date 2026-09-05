import React from 'react';
import { Bot, Brain, Shield, Zap, ArrowRight, PlayCircle } from 'lucide-react';

interface AgenteHermesSectionProps {
  onOpenDemo?: () => void;
  onEnterApp?: (mode: string) => void;
}

export const AgenteHermesSection: React.FC<AgenteHermesSectionProps> = ({ onOpenDemo, onEnterApp }) => {
  const features = [
    {
      icon: Bot,
      title: 'Prospector Automático',
      desc: 'Identifica leads qualificados via Google Maps, CNAE e redes sociais 24/7.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      action: () => onEnterApp?.('growth'),
    },
    {
      icon: Brain,
      title: 'Agente de Vendas IA',
      desc: 'Conversa com leads no WhatsApp, tira dúvidas e agenda reuniões sem intervenção.',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      action: () => onEnterApp?.('growth'),
    },
    {
      icon: Shield,
      title: 'Supervisor de Qualidade',
      desc: 'Monitora conversas, valida regras de negócio e atualiza o CRM em tempo real.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      action: () => onEnterApp?.('crm'),
    },
  ];

  return (
    <section className="py-20 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold mb-4">
            <Zap className="w-4 h-4" />
            <span>Ecossistema Hermes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Um Time de IA Completo Para o Seu Negócio
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Não é um chatbot de respostas fixas. É um ecossistema de agentes autônomos que prospectam, qualificam e convertem clientes enquanto você dorme.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                onClick={feature.action}
                className="bg-[#0f1011] border border-white/[0.08] rounded-2xl p-6 hover:border-amber-500/30 transition-all group cursor-pointer"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{feature.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold group-hover:gap-2 transition-all">
                  Acessar <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={onOpenDemo}
            className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Ver Demonstração ao Vivo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-slate-500 mt-3">Setup em 5 minutos • Sem cartão de crédito</p>
        </div>
      </div>
    </section>
  );
};

export default AgenteHermesSection;
