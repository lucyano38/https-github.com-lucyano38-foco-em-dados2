import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PricingCard from '../components/PricingCard';
import { supabase } from '../lib/supabase';

interface PricingProps {
  onBack?: () => void;
  onSelectPlan?: (tier: string) => void;
}

const PLANS = [
  {
    tier: 'free',
    name: 'Gratuito',
    price: 0,
    color: 'free',
    ctaLabel: 'Começar Grátis',
    features: [
      { label: '3 dashboards', included: true },
      { label: '2.000 linhas/upload', included: true },
      { label: '1 chatbot', included: true },
      { label: 'Suporte por email', included: false },
      { label: 'API pública', included: false },
      { label: 'White-label', included: false },
    ],
  },
  {
    tier: 'starter',
    name: 'Starter',
    price: 97,
    color: 'starter',
    ctaLabel: 'Assinar com 7 dias grátis',
    features: [
      { label: '10 dashboards', included: true },
      { label: '50.000 linhas/upload', included: true },
      { label: '3 chatbots', included: true },
      { label: 'Alertas automáticos', included: true },
      { label: 'Exportação PDF', included: true },
      { label: 'API pública', included: false },
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 297,
    color: 'pro',
    isFeatured: true,
    ctaLabel: 'Assinar com 7 dias grátis',
    features: [
      { label: 'Dashboards ilimitados', included: true },
      { label: '500.000 linhas/upload', included: true },
      { label: 'Chatbots ilimitados', included: true },
      { label: 'API pública', included: true },
      { label: 'White-label', included: true },
      { label: 'Previsão com IA', included: true },
      { label: 'Benchmark anônimo', included: true },
    ],
  },
  {
    tier: 'business',
    name: 'Business',
    price: 597,
    color: 'business',
    ctaLabel: 'Assinar com 7 dias grátis',
    features: [
      { label: 'Tudo do Pro', included: true },
      { label: '5 usuários', included: true },
      { label: 'Forecast avançado', included: true },
      { label: 'Benchmark segmentado', included: true },
      { label: 'Suporte 24h (email)', included: true },
    ],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 997,
    color: 'enterprise',
    ctaLabel: 'Preencher Questionário',
    features: [
      { label: 'Tudo do Business', included: true },
      { label: 'Usuários ilimitados', included: true },
      { label: 'Data lake dedicado', included: true },
      { label: 'IA customizada', included: true },
      { label: 'SLA 99.9%', included: true },
    ],
  },
];

const FAQ = [
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Não há contrato de fidelidade. Cancele na área de configurações e seu acesso permanece até o final do período pago.' },
  { q: 'Como funciona o trial de 7 dias?', a: 'Você tem 7 dias para testar todas as funcionalidades do plano. Não precisa de cartão para começar o Gratuito. Para os pagos, cobramos apenas após os 7 dias.' },
  { q: 'Posso fazer upgrade ou downgrade?', a: 'Sim, a qualquer momento. O valor é calculado proporcionalmente (prorata) e ajustado automaticamente na próxima cobrança.' },
  { q: 'O que acontece se eu atingir o limite do meu plano?', a: 'Você recebe um alerta quando atinge 80% do limite. Ao atingir 100%, pode fazer upgrade ou esperar o próximo ciclo mensal.' },
  { q: 'Quais formas de pagamento são aceitas?', a: 'Cartão de crédito, Pix e boleto. Para planos anuais, oferecemos desconto de 20%.' },
];

export default function Pricing({ onBack, onSelectPlan }: PricingProps) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (tier: string) => {
    setLoading(tier);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onSelectPlan?.(tier);
        return;
      }
      const { error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { tier, period, user_id: session.user.id },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Erro ao criar checkout:', err);
      onSelectPlan?.(tier);
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mesh-bg" />
      <Header onNavigateTo={(view) => {
        if (view === 'landing') onBack?.();
      }} />

      <main className="pt-32 pb-20 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-on-surface">
            Escolha seu <span className="gradient-text">Plano</span>
          </h1>
          <p className="text-on-surface-variant text-lg mb-8">Comece grátis. Escale quando precisar.</p>

          <div className="inline-flex items-center gap-4 p-1 rounded-full bg-surface-container border border-glass-border">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${period === 'monthly' ? 'bg-vivid-purple text-white' : 'text-on-surface-variant'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${period === 'yearly' ? 'bg-vivid-purple text-white' : 'text-on-surface-variant'}`}
            >
              Anual <span className="text-label-sm text-success">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.tier}
              tier={plan.tier}
              name={plan.name}
              price={plan.price}
              period={period}
              features={plan.features}
              isFeatured={plan.isFeatured}
              color={plan.color}
              ctaLabel={loading === plan.tier ? 'Aguarde...' : plan.ctaLabel}
              onSelect={() => handleSelect(plan.tier)}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="font-display text-2xl font-bold text-center mb-8 text-on-surface">Dúvidas Frequentes</h3>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left"
                >
                  <span className="font-semibold text-on-surface">{faq.q}</span>
                  <span className={`material-symbols-outlined text-outline transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-on-surface-variant">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-16 text-center p-12 glass-card rounded-3xl glow-purple relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-vivid-purple/20 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-electric-blue/20 blur-3xl rounded-full"></div>
          <h3 className="font-display text-3xl font-bold mb-4 text-on-surface relative z-10">Pronto para começar?</h3>
          <p className="text-on-surface-variant mb-8 relative z-10">Sem cartão de crédito. Sem compromisso. Cancele quando quiser.</p>
          <button
            onClick={() => handleSelect('starter')}
            className="relative z-10 px-10 py-4 rounded-full bg-gradient-to-r from-vivid-purple to-electric-blue text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg active:scale-95"
          >
            Começar Meu Dashboard Grátis →
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
