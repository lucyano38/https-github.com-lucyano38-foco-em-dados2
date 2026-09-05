import React, { useState } from 'react';
import { Stethoscope, Scissors, Store, CheckCircle2, ArrowRight } from 'lucide-react';

interface NicheSolutionsProps {
  onOpenPaywall: () => void;
}

export const NicheSolutions: React.FC<NicheSolutionsProps> = ({ onOpenPaywall }) => {
  const [activeTab, setActiveTab] = useState<'clinicas' | 'barbearias' | 'comercio'>('clinicas');

  const niches = {
    clinicas: {
      title: 'Para Clínicas & Consultórios',
      icon: Stethoscope,
      metric: 'Redução de até 40% no faltômetro',
      description:
        'Automatize a confirmação de consultas via WhatsApp, integre o fluxo de agendamentos e envie lembretes de pré-consulta com alertas automáticos.',
      features: [
        'Confirmação automática de presença 24h antes',
        'Reagendamento inteligente sem intervenção humana',
        'Sincronização direta com a agenda médica',
      ],
    },
    barbearias: {
      title: 'Para Barbearias & Estética',
      icon: Scissors,
      metric: 'Garantia de agenda cheia na semana',
      description:
        'Dispare lembretes de retorno automáticos com base no tempo da última visita e feche horários ociosos sem esforço manual.',
      features: [
        'Lembrete de retorno inteligente (ex: 20 dias após o corte)',
        'Ocupação automática de horários cancelados',
        'Atendimento e reserva de horários 24/7 no WhatsApp',
      ],
    },
    comercio: {
      title: 'Para Comércio Local & Varejo',
      icon: Store,
      metric: 'Atendimento instantâneo 24/7',
      description:
        'Responda Directs do Instagram, dúvidas recorrentes de catálogo, preços e localização de forma imediata e converta em vendas.',
      features: [
        'Respostas para dúvidas de produtos e catálogo',
        'Captura de Leads direto do Instagram para o WhatsApp',
        'Encaminhamento automático de pedidos para o balcão',
      ],
    },
  };

  const current = niches[activeTab];
  const IconComponent = current.icon;

  return (
    <section className="py-16 relative z-10 max-w-6xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-2">Soluções Sob Medida para o Seu Nicho</h2>
        <p className="text-xs text-slate-300">Aumente seu faturamento resolvendo gargalos reais de atendimento e prospecção.</p>
      </div>

      {/* Abas com fundo sólido e alto contraste */}
      <div className="flex justify-center gap-3 mb-8 overflow-x-auto pb-2">
        {(Object.keys(niches) as Array<keyof typeof niches>).map((key) => {
          const niche = niches[key];
          const Icon = niche.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all border ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{niche.title}</span>
            </button>
          );
        })}
      </div>

      {/* Card Principal Opaco com Leitura Nítida */}
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-8 grid md:grid-cols-2 gap-8 items-center backdrop-blur-xl shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold mb-4">
            <IconComponent className="w-4 h-4" />
            <span>{current.metric}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{current.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">{current.description}</p>
          <ul className="space-y-3 mb-6">
            {current.features.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-full">
          <div>
            <span className="text-xs text-amber-400 font-mono">[Status: Automação Ativa]</span>
            <p className="text-xs font-semibold text-slate-200 mt-2 mb-4">
              Libere o ecossistema completo para o seu negócio por apenas R$ 39,90/mês.
            </p>
          </div>
          <button
            onClick={onOpenPaywall}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
          >
            <span>Assinar Acesso Completo (R$ 39,90)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NicheSolutions;
