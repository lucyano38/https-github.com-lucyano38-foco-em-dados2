import React, { useState } from 'react';
import { Stethoscope, Scissors, Store, CheckCircle2, ArrowRight } from 'lucide-react';

export const NicheSolutions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clinicas' | 'barbearias' | 'comercio'>('clinicas');

  const niches = {
    clinicas: {
      title: 'Para Clínicas & Consultórios',
      icon: Stethoscope,
      metric: 'Redução de até 40% no faltômetro',
      description: 'Automatize a confirmação de consultas via WhatsApp, integre o fluxo de agendamentos e envie lembretes de pré-consulta com alertas automáticos.',
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
      description: 'Dispare lembretes de retorno automáticos com base no tempo da última visita e feche horários ociosos sem esforço manual.',
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
      description: 'Responda Directs do Instagram, dúvidas recorrentes de catálogo, preços e localização de forma imediata e converta em vendas.',
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
    <section className="py-20 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-100 mb-3">
            Soluções Sob Medida para o Seu Nicho
          </h2>
          <p className="text-sm text-slate-400">
            Aumente seu faturamento resolvendo gargalos reais de atendimento e prospecção.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2">
          {(Object.keys(niches) as Array<keyof typeof niches>).map((key) => {
            const niche = niches[key];
            const Icon = niche.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{niche.title}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold mb-4">
              <IconComponent className="w-4 h-4" />
              <span>{current.metric}</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">{current.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">{current.description}</p>
            <ul className="space-y-3 mb-6">
              {current.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-full">
            <div>
              <span className="text-xs text-amber-400 font-mono">[Status: Automação Ativa]</span>
              <p className="text-sm font-semibold text-slate-200 mt-2 mb-4">
                Veja o fluxo de automação pronto para implementação imediata.
              </p>
            </div>
            <a
              href="#demonstracao"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Solicitar Demonstração Gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NicheSolutions;
