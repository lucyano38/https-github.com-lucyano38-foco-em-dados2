import React, { useState } from 'react';
import {
  Quote,
  Star,
  CheckCircle2,
  ThumbsUp,
  Award,
} from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Em 30 dias o Agente Hermes já fez mais qualificações do que nossa equipe de vendas em 3 meses.ROI de 14.8x com Google Maps extraction na região Sudeste.',
    author: 'Luciano Pereira',
    role: 'Fundador, Foco em Dados',
    company: 'Foco em Dados',
    metrics: ['ROI 14.8x', 'Qualificou 41.6% dos leads em <10s', 'CAC -68%'],
    image: null,
    color: '#d4a574',
  },
  {
    quote:
      'A clínica tinha faltas de até 40% na agenda. Agora o Hermes confirma consultas 24h antes e reagenda sozinho.semanas o faltômetro caiu para 12%.',
    author: 'Dra. Mariana Costa',
    role: 'Clínica Estética Bela Vida',
    company: 'Clínica Estética Bela Vida',
    metrics: ['Faltas de 40% → 12%', 'Lembrete automático 24h antes', 'Reagendamento sem humano'],
    image: null,
    color: '#3b82f6',
  },
  {
    quote:
      'Nossa agenda costurava 15 horários por dia. Com o sistema de ocupação automática, hoje fechamos 25 agendamentos/dia sem esforço manual.',
    author: 'Carlos Nobre',
    role: 'Dono da Barbearia Nobre Studio',
    company: 'Barbearia Nobre Studio',
    metrics: ['15 → 25 agendamentos/dia', 'Ocupação automática de cancelamentos', 'Atendimento 24/7 no WhatsApp'],
    image: null,
    color: '#f59e0b',
  },
];

export const TestimonialsSection: React.FC = () => {
  const [active, setActive] = useState(0);

  const current = TESTIMONIALS[active];

  return (
    <section
      id="prova-social"
      className="py-20 px-4 md:px-12 relative border-t overflow-hidden"
      style={{
        background: 'rgba(1,1,2,0.5)',
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              border: '1px solid rgba(212,165,116,0.3)',
              background: 'rgba(212,165,116,0.1)',
              color: '#d4a574',
            }}
          >
            <Award className="w-3.5 h-3.5" style={{ color: '#d4a574' }} />
            <span>Resultados Reais</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            O que nossos clientes dizem
          </h2>
          <p
            className="text-sm md:text-base"
            style={{ color: '#8a8f98' }}
          >
            Números reais de empresas que já rodam o ecossistema Foco em Dados em produção.
          </p>
        </div>

        {/* Cards de métricas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'ROI médio', value: '14.8x', color: '#d4a574' },
            { label: 'Qualificação <10s', value: '41.6%', color: '#3b82f6' },
            { label: 'Redução de CAC', value: '-68%', color: '#10b981' },
            { label: 'Agendamentos/dia', value: '+66%', color: '#f59e0b' },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 backdrop-blur-sm border text-center transition-all hover:scale-[1.03]"
              style={{
                background: 'rgba(15,16,17,0.7)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <p
                className="text-2xl md:text-3xl font-extrabold mb-1"
                style={{ color: stat.color, fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </p>
              <p
                className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: '#8a8f98' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Depoimentos */}
        <div className="relative">
          {/* Indicadores de posição */}
          <div className="flex justify-center gap-2 mb-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="transition-all cursor-pointer"
                style={{ padding: '4px', background: 'transparent', border: 'none' }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: active === i ? current.color : 'rgba(255,255,255,0.15)',
                    transform: active === i ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: active === i ? `0 0 8px ${current.color}66` : undefined,
                  }}
                />
              </button>
            ))}
          </div>

          {/* Card de depoimento */}
          <div
            key={active}
            className="max-w-3xl mx-auto rounded-3xl p-8 md:p-10 backdrop-blur-xl border transition-all duration-500"
            style={{
              background: 'rgba(15,16,17,0.8)',
              borderColor: `${current.color}22`,
              boxShadow: `0 0 30px ${current.color}15, inset 0 0 60px rgba(0,0,0,0.2)`,
            }}
          >
            {/* Quote icon */}
            <Quote
              className="w-8 h-8 mb-4 opacity-30"
              style={{ color: current.color }}
            />

            {/* Texto do depoimento */}
            <blockquote
              className="text-base md:text-lg leading-relaxed mb-6"
              style={{ color: '#f7f8f8', fontFamily: 'var(--font-display)' }}
            >
              "{current.quote}"
            </blockquote>

            {/* Metrics */}
            <div
              className="flex flex-wrap gap-2 mb-6"
              style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)' }}
            >
              {current.metrics.map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: `${current.color}15`,
                    border: `1px solid ${current.color}30`,
                    color: current.color,
                  }}
                >
                  <CheckCircle2
                    className="w-3 h-3"
                    style={{ color: current.color }}
                  />
                  {m}
                </span>
              ))}
            </div>

            {/* Perfil do autor */}
            <div className="flex items-center gap-4">
              {/* Avatar placeholder */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                style={{
                  background: `${current.color}20`,
                  border: `2px solid ${current.color}40`,
                  color: current.color,
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}
              >
                {current.author
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: '#f7f8f8' }}
                >
                  {current.author}
                </p>
                <p
                  className="text-xs"
                  style={{ color: '#8a8f98' }}
                >
                  {current.role}
                </p>
                {current.company && (
                  <p
                    className="text-[10px] font-mono mt-0.5"
                    style={{ color: current.color, opacity: 0.7 }}
                  >
                    {current.company}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer: call para ação */}
        <div className="text-center mt-12">
          <p
            className="text-xs"
            style={{ color: '#8a8f98' }}
          >
            Quer aparecer aqui com seus resultados?
          </p>
          <button
            onClick={() => {
              const el = document.getElementById('demonstracao');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-3 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg"
          >
            Ver Demonstração ao Vivo →
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
