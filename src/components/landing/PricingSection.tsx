import React from 'react';
import { Globe, Server, ShoppingCart, Bot, Wrench } from 'lucide-react';

export const ServicesPricing: React.FC = () => {
  return (
    <section id="servicos" className="py-24 px-4 md:px-12 relative border-t bg-slate-950/80 backdrop-blur-md overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ border: '1px solid rgba(212,165,116,0.3)', background: 'rgba(212,165,116,0.1)', color: '#d4a574' }}>
            <Wrench className="w-3.5 h-3.5" />
            <span>Serviços Sob Demanda</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Precisa de algo <span style={{ color: '#d4a574' }}>específico?</span>
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
              price: '297,00', period: 'Taxa única', color: '#3b82f6',
            },
            {
              icon: Server, name: 'Site Institucional Completo',
              desc: 'Multi-página com sobre, serviços, depoimentos, blog e formulário de contato.',
              price: '597,00', period: 'Taxa única', color: '#8b5cf6',
            },
            {
              icon: ShoppingCart, name: 'Loja Virtual / E-commerce',
              desc: 'Catálogo de produtos, carrinho, pagamento integrado (Stripe/PIX) e painel de pedidos.',
              price: '997,00', period: 'Taxa única', color: '#10b981',
            },
            {
              icon: Bot, name: 'Automação WhatsApp com IA',
              desc: 'Agente inteligente com atendimento 24/7, qualificação de leads e transferência para humanos.',
              price: '197,00', period: '/mês', color: '#f59e0b',
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
          Valores em reais (BRL). Serviços sob demanda não incluem assinatura mensal da plataforma.
        </div>
      </div>
    </section>
  );
};

export default ServicesPricing;
