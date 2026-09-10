import React from 'react';
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles, Globe, Server, ShoppingCart, Wrench, Bot } from 'lucide-react';

const PLANS = [
  {
    id: 'starter', name: 'Starter', tag: 'Entrada', price: '97', period: '/mês',
    description: 'Automação básica do WhatsApp com agente inteligente.',
    features: ['1 Conexão WhatsApp Ativa', 'Até 1.000 conversas automatizadas/mês', 'Agendamento integrado Google Agenda', 'Exportação de contatos para Excel'],
    cta: 'Assinar Starter', popular: false,
  },
  {
    id: 'business', name: 'Business', tag: 'Crescimento', price: '197', period: '/mês',
    description: 'Motor de Prospecção B2B + Agente Hermes completo.',
    features: ['WhatsApp + Instagram + Messenger', 'Conversas ilimitadas com Agente Hermes', 'Filtro Geográfico B2B e Radar de Prospecção', 'Transbordo para até 5 atendentes humanos'],
    cta: 'Assinar Business', popular: false,
  },
  {
    id: 'premium', name: 'Premium Anual', tag: 'Exclusivo', price: '997', period: '/ano',
    periodNote: '',
    description: 'Acesso irrestrito a todos os módulos com condição histórica.',
    features: ['Tudo do plano Business incluso', 'Extração B2B Ilimitada (com e sem site)', 'Agente Hermes personalizado com a voz da sua marca', 'Suporte prioritário via WhatsApp VIP'],
    cta: 'Garantir Oferta Especial', popular: true,
  },
];

interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  return (
    <section id="planos" className="py-24 px-4 md:px-12 relative border-t bg-slate-950/80 backdrop-blur-md overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ border: '1px solid rgba(212,165,116,0.3)', background: 'rgba(212,165,116,0.1)', color: '#d4a574' }}>
            <Zap className="w-3.5 h-3.5 text-[#d4a574]" />
            <span>Planos & Preços Transparentes</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-glow leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Investimento que se paga nos{' '}
            <span className="text-[#d4a574]">primeiros 7 dias de uso</span>
          </h2>

          <p className="text-base md:text-lg" style={{ color: '#8a8f98' }}>
            Sem taxas ocultas. Cancele a qualquer momento ou potencialize seus resultados com nossa
            garantia de retorno com a chancela{' '}
            <span className="text-[#d4a574] font-medium">focoemdados.com.br</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-3xl p-8 transition-all relative flex flex-col justify-between"
              style={{
                background: plan.popular ? 'rgba(25,26,27,0.7)' : 'rgba(15,16,17,0.7)',
                border: plan.popular ? '2px solid #d4a574' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: plan.popular ? '0 0 35px rgba(212,165,116,0.22)' : undefined,
                transform: plan.popular ? 'scale(1.05)' : undefined,
                zIndex: plan.popular ? 10 : undefined,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap flex items-center gap-1.5"
                  style={{ background: '#d4a574', color: '#1c1917' }}>
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>Oferta Especial • Mais Popular</span>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: '#8a8f98' }}>
                    {plan.tag}
                  </span>
                  {plan.popular && (
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      ECONOMIZE 60%
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{plan.name}</h3>
                  <p className="text-xs mt-1" style={{ color: '#8a8f98' }}>{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-sm font-semibold" style={{ color: '#8a8f98' }}>R$</span>
                  <span className="text-4xl md:text-5xl font-extrabold" style={{ color: '#d4a574', fontFamily: 'var(--font-display)' }}>
                    {plan.price}
                  </span>
                  <span className="text-xs" style={{ color: '#8a8f98' }}>{plan.period}</span>
                </div>

                {plan.periodNote && (
                  <p className="text-[11px] font-mono-tech" style={{ color: '#d4a574' }}>{plan.periodNote}</p>
                )}

                <ul className="space-y-3 text-sm pt-4 border-t" style={{ color: '#d0d6e0', borderColor: 'rgba(255,255,255,0.08)' }}>
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#d4a574] shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => onSelectPlan?.(plan.id)}
                  className="w-full py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: plan.popular ? '#d4a574' : 'rgba(255,255,255,0.05)',
                    color: plan.popular ? '#1c1917' : '#f7f8f8',
                    border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: plan.popular ? '0 0 20px rgba(212,165,116,0.4)' : undefined,
                  }}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Security & Guarantee Note */}
        <div className="text-center pt-4 flex items-center justify-center gap-3 text-xs" style={{ color: '#8a8f98' }}>
          <ShieldCheck className="w-4 h-4 text-[#d4a574]" />
          <span>Garantia de 7 dias ou seu dinheiro de volta • Cancelamento sem burocracia</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TABELA DE SERVIÇOS SOB DEMANDA
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto pt-16 space-y-12 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ border: '1px solid rgba(212,165,116,0.3)', background: 'rgba(212,165,116,0.1)', color: '#d4a574' }}>
            <Wrench className="w-3.5 h-3.5" />
            <span>Serviços Sob Demanda</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Precisa de algo <span className="text-[#d4a574]">específico?</span>
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: '#8a8f98' }}>
            Contrate apenas o que precisa. Valores transparentes, sem surpresas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            {
              icon: Globe, name: 'Site Simples (Landing Page)',
              desc: 'Página única profissional com captação de leads, WhatsApp integrado e SEO básico.',
              price: '297', period: 'Taxa única', color: '#3b82f6',
            },
            {
              icon: Server, name: 'Site Institucional Completo',
              desc: 'Multi-página com sobre, serviços, depoimentos, blog e formulário de contato.',
              price: '597', period: 'Taxa única', color: '#8b5cf6',
            },
            {
              icon: ShoppingCart, name: 'Loja Virtual / E-commerce',
              desc: 'Catálogo de produtos, carrinho, pagamento integrado (Stripe/PIX) e painel de pedidos.',
              price: '997', period: 'Taxa única', color: '#10b981',
            },
            {
              icon: Bot, name: 'Automação WhatsApp com IA',
              desc: 'Agente inteligente com atendimento 24/7, qualificação de leads e transferência para humanos.',
              price: '197', period: '/mês', color: '#f59e0b',
            },
            {
              icon: Wrench, name: 'Hospedagem e Manutenção',
              desc: 'Servidor dedicado, SSL, backups diários, atualizações de segurança e suporte técnico.',
              price: '49,90', period: '/mês', color: '#06b6d4',
            },
          ].map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div key={i} className="rounded-3xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(15,16,17,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${svc.color}15`, border: `1px solid ${svc.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: svc.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{svc.name}</h3>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#8a8f98' }}>{svc.desc}</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-xs" style={{ color: '#8a8f98' }}>R$</span>
                  <span className="text-2xl font-extrabold" style={{ color: svc.color, fontFamily: 'var(--font-display)' }}>{svc.price}</span>
                  <span className="text-[11px]" style={{ color: '#8a8f98' }}>{svc.period}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[11px] pt-2" style={{ color: '#555' }}>
          Valores em reais (BRL). Serviços sob demanda não incluem assinatura mensal dos planos acima.
        </div>
      </div>
    </section>
  );
};
