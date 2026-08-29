import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, PlayCircle, TrendingUp, FileText, ArrowRight, MessageCircle,
  Sparkles, ShieldCheck, Users, Briefcase, Cpu, Check, Bot, Send,
  X, Menu, Loader2, AlertCircle
} from 'lucide-react';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => void;
  onUploadFile?: () => void;
}

const NAV_ITEMS = [
  { id: 'recursos', label: 'Recursos' },
  { id: 'planos', label: 'Planos' },
  { id: 'automacao', label: 'Automação' },
  { id: 'faq', label: 'FAQ' }
];

const PERSONAS = [
  {
    icon: Briefcase,
    color: 'amber',
    title: 'Diretores e Sócios',
    desc: 'Visão consolidada de faturamento, margens e previsibilidade de receita com relatórios executivos prontos em PDF.',
    cta: 'Ver Indicadores',
    target: 'indicators' as const
  },
  {
    icon: Users,
    color: 'blue',
    title: 'Marketing e Vendas',
    desc: 'Prospecção ativa por nicho e cidade com enriquecimento de dados e pipeline CRM Kanban automatizado.',
    cta: 'Explorar Prospecção',
    target: 'prospecting' as const
  },
  {
    icon: Cpu,
    color: 'green',
    title: 'Operações e BI',
    desc: 'Conexão com APIs públicas, processamento de planilhas e agentes autônomos OpenSquad para auditoria técnica.',
    cta: 'Acessar AI Data Analyst',
    target: 'analytics' as const
  }
];

const FEATURES = [
  { icon: TrendingUp, title: 'CRM Kanban', desc: 'Pipeline visual com automação de estágios e previsão de fechamento por IA.' },
  { icon: Sparkles, title: 'Prospecção B2B', desc: 'Encontre leads qualificados em qualquer cidade brasileira com filtros avançados.' },
  { icon: FileText, title: 'Relatórios Executivos', desc: 'Exporte dashboards em PDF prontos para apresentação em board.' },
  { icon: Cpu, title: 'OpenSquad AI', desc: 'Agentes autônomos que analisam dados 24/7 e entregam insights acionáveis.' }
];

const PLANS = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    highlight: false,
    cta: 'Começar grátis',
    target: 'analytics' as const,
    badge: '',
    desc: 'Até 100 linhas por planilha',
    features: [
      'Dashboard executivo completo',
      'Insights com IA Gemini',
      'KPIs profissionais prontos',
      'Exportação em PDF'
    ]
  },
  {
    name: 'Pro',
    price: 'R$ 39,90',
    period: '/mês',
    highlight: true,
    cta: 'Assinar via Stripe',
    target: 'prospecting' as const,
    badge: 'Mais popular',
    desc: 'A partir de 100 linhas · cobrança via Stripe',
    features: [
      'Planilhas ilimitadas',
      'Relatórios executivos em PDF',
      'Prospecção B2B integrada',
      'OpenSquad AI (agentes autônomos)',
      'Suporte prioritário'
    ]
  }
];

const FAQS = [
  { q: 'Preciso de cartão de crédito para começar?', a: 'Não. O plano Free suporta até 100 linhas por planilha sem custo. Você só precisa cadastrar um cartão ao fazer upgrade para o Pro (R$ 39,90/mês via Stripe).' },
  { q: 'Como funciona a prospecção B2B?', a: 'Você define nicho e cidade, e a plataforma vasculha fontes públicas (Google Maps, redes sociais, cadastros abertos) para retornar leads com nome, contato e enriquecimento via IA.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem fidelidade, sem multa. Você cancela a assinatura Pro direto no painel do Stripe quando quiser.' },
  { q: 'Os dados ficam seguros?', a: 'Sim. Usamos Firebase Authentication, Firestore com regras de segurança e criptografia em trânsito (HTTPS). Seus dados não são compartilhados com terceiros.' }
];

export const Landing: React.FC<LandingProps> = ({ onStart, onUploadFile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadLoading(true);
    try {
      const allowedTypes = ['.csv', '.xlsx', '.xls', '.json', '.tsv'];
      const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      if (!allowedTypes.includes(fileExt)) {
        throw new Error('Formato não suportado. Use CSV, XLSX, XLS, JSON ou TSV.');
      }
      const maxSize = 15 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Limite: 15MB.');
      }
      if (fileExt === '.csv' || fileExt === '.tsv') {
        const text = await file.text();
        const lines = text.split('\n').filter((line) => line.trim()).length - 1;
        if (lines > 100) {
          window.location.href = `https://buy.stripe.com/focoemdados-pro?origem=upload&linhas=${lines}`;
          return;
        }
      }
      if (onUploadFile) onUploadFile();
      else onStart('analytics');
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao processar arquivo.');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onUploadFile, onStart]);

  const handleStripeCheckout = useCallback((plan: typeof PLANS[number]) => {
    if (plan.name === 'Pro') {
      window.location.href = 'https://buy.stripe.com/focoemdados-pro?utm_source=landing&utm_medium=cta&plan=pro';
    } else {
      onStart(plan.target);
    }
  }, [onStart]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-['Inter',sans-serif] selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#1E293B]">
        <div className="flex justify-between items-center px-6 md:px-16 py-4 max-w-[1440px] mx-auto">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <Zap className="w-4 h-4 text-[#0F172A] fill-[#0F172A]" />
            </div>
            <span className="font-bold text-lg text-[#F8FAFC] tracking-tight">Foco em Dados</span>
          </button>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                {item.label}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => onStart('analytics')} className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition cursor-pointer">
              Entrar
            </button>
            <button
              onClick={() => onStart('prospecting')}
              className="bg-amber-500 text-[#0F172A] px-5 py-2.5 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 text-sm flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-[#0F172A]" /> Começar Agora
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#F8FAFC]"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#1E293B] bg-[#0F172A]/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-3">
              {NAV_ITEMS.map((item) => (
                <a key={item.id} href={`#${item.id}`} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-[#94A3B8] hover:text-[#F8FAFC] py-2">
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); onStart('prospecting'); }}
                className="w-full bg-amber-500 text-[#0F172A] px-5 py-3 rounded-xl font-bold text-sm"
              >
                Começar Agora
              </button>
            </div>
          </motion.div>
        </nav>

        {/* HERO */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="h-full w-full object-cover">
              <source src="/bg_anim_web.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[#0F172A]/80" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/50 to-[#0F172A]" />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-medium text-amber-400"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Plataforma de Inteligência Comercial B2B</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight"
            >
              Decisões baseadas em <span className="text-amber-400">dados precisos</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-[#94A3B8] max-w-3xl mx-auto leading-relaxed"
            >
              Prospecção automatizada, dashboards executivos e CRM com IA. Tudo em um só lugar — do upload da planilha ao fechamento do contrato.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <button
                onClick={() => onStart('prospecting')}
                className="w-full sm:w-auto bg-amber-500 text-[#0F172A] px-8 py-4 rounded-xl font-bold text-base hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-3"
              >
                Iniciar Gratuitamente <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onStart('evolua_demo')}
                className="w-full sm:w-auto bg-[#1E293B] border border-[#334155] text-[#F8FAFC] px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#334155]/50 transition-all flex items-center justify-center gap-3"
              >
                <PlayCircle className="w-5 h-5 text-blue-400" /> Ver Demo (2 min)
              </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xs text-[#64748B] pt-4"
          >
            ✓ Sem cartão de crédito  ·  ✓ 100 linhas grátis  ·  ✓ Cancele quando quiser
          </motion.p>

          {/* Live preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl text-left backdrop-blur-xl"
          >
            <div className="flex items-center justify-between pb-6 border-b border-[#334155] flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-[#94A3B8] ml-2">focoemdados.com.br/dashboard</span>
              </div>
              <span className="text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> API ativa
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="bg-[#0F172A] border border-[#334155] p-5 rounded-2xl">
                <div className="text-xs text-[#94A3B8] uppercase font-mono">Leads qualificados</div>
                <div className="text-2xl font-bold text-[#F8FAFC] mt-1">14.892</div>
                <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +24.5% esta semana
                </div>
              </div>
              <div className="bg-[#0F172A] border border-[#334155] p-5 rounded-2xl">
                <div className="text-xs text-[#94A3B8] uppercase font-mono">Conversão CRM</div>
                <div className="text-2xl font-bold text-[#F8FAFC] mt-1">38.2%</div>
                <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +5.1% otimizado por IA
                </div>
              </div>
              <div className="bg-[#0F172A] border border-[#334155] p-5 rounded-2xl">
                <div className="text-xs text-[#94A3B8] uppercase font-mono">Receita MRR</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">R$ 47.3k</div>
                <div className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                  Atualizado há 2h
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* PERSONAS */}
        <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">
              Construído para Líderes Orientados a Dados
            </h2>
            <p className="text-[#94A3B8]">
              Soluções sob medida para cada papel estratégico da sua organização.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PERSONAS.map((persona) => (
              <div key={persona.title} className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:border-{{persona.color}}-50 transition group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-{{persona.color}}-10 border border-{{persona.color}}-30 flex items-center justify-center text-{{persona.color}} group-hover:scale-110 transition">
                    {persona.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#F8FAFC]">{persona.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {persona.desc}
                  </p>
                </div>
                <button
                  onClick={() => onStart(persona.target)}
                  className="mt-8 flex items-center gap-2 text-sm font-bold text-{{persona.color}} group-hover:translate-x-1 transition cursor-pointer"
                >
                  {persona.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </section>

        {/* FEATURES */}
        <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">
              Funcionalidades Principais
            </h2>
            <p className="text-[#94A3B8] text-base md:text-lg">
              Tudo o que você precisa para escalar vendas com base em dados reais.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl hover:border-{{persona.color}}/50 transition group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-{{persona.color}}-10 border border-{{persona.color}}-30 flex items-center justify-center text-{{persona.color}} group-hover:scale-110 transition">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#F8FAFC]">{feature.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </section>

        {/* PLANS */}
        <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B] text-center">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC]">
              Planos de Preço
            </h2>
            <p className="text-[#94A3B8] text-base md:text-lg">
              Junte-se a centenas de empresas que escalaram sua operação comercial com a Foco em Dados.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
            {PLANS.map((plan) => (
              <div key={plan.name} className="relative bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col hover:border-{{plan.color}}/50 transition group overflow-hidden">
                <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  {plan.name}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-[#F8FAFC]">R$ {plan.price}</span>
                  <span className="text-sm text-[#94A3B8]">{plan.period}</span>
                </div>
                <div className="mt-2 text-sm text-{{plan.color}} font-semibold">{plan.desc}</div>
                <ul className="mt-6 space-y-3 text-sm text-[#F8FAFC]">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-{{plan.color}} mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </div>
                {plan.highlight && (
                  <div className="mt-2 text-sm text-{{plan.color}} font-semibold">
                    <span className="text-5xl font-extrabold text-[#F8FAFC]">R$ {plan.price}</span>
                    <span className="text-sm text-[#94A3B8]">/mês</span>
                  </div>
                )}
                <button
                  onClick={() => plan.target === 'analytics' ? onStart('analytics') : onStart(plan.target)}
                  className="mt-8 w-full py-3 rounded-xl bg-[#334155] text-[#F8FAFC] font-bold hover:bg-[#475569] transition shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer"
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </section>

          {/* AUTOMATION */}
          <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC]">
                Automação que Trabalha por Você
              </h2>
              <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto">
                A IA identifica oportunidades, envia mensagens personalizadas e fecha negócios enquanto você dorme.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {AUTOMATION.map((feature, index) => (
                <div key={index} className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl hover:border-{{persona.color}}/40 transition">
                  <div className="w-12 h-12 rounded-2xl bg-{{persona.color}}-50 flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#94A3B8]">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* INTERACTIVE CTA */}
          <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B] text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC]">
                Pronto para transformar seus dados em receita?
              </h2>
              <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto">
                Junte-se a centenas de empresas que escalaram sua operação comercial com a Foco em Dados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => onStart('prospecting')}
                  className="bg-amber-500 text-[#0F172A] px-10 py-4 rounded-xl font-bold hover:bg-amber-400 transition shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer"
                >
                  Começar Agora Gratuitamente
                </button>
                <button
                  onClick={() => onStart('evolua_demo')}
                  className="bg-[#1E293B] border border-[#334155] text-[#F8FAFC] px-10 py-4 rounded-xl font-bold hover:bg-[#334155] transition cursor-pointer"
                >
                  Explorar Demonstração Completa
                </button>
              </div>
            </div>
          </section>

          {/* SPREADSHEET UPLOAD */}
          <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> Planilha inteligente
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC] tracking-tight">
                Suba sua planilha. <span className="text-[#F59E0B]">Receba insights.</span>
              </h2>
              <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto">
                Upload em segundos. Dashboard executivo, KPIs profissionais e análise com IA. Plano gratuito de 100 linhas ou Pro a partir de R$ 39,90/mês.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
              <div className="relative bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col hover:border-[#F59E0B]/50 transition group overflow-hidden">
                <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Free</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-[#F8FAFC]">R$ 0</span>
                  <span className="text-sm text-[#94A3B8]">/mês</span>
                </div>
                <div className="mt-2 text-sm text-[#F59E0B] font-semibold">Até 100 linhas por planilha</div>
                <ul className="mt-6 space-y-3 text-sm text-[#F8FAFC]">
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Dashboard executivo completo</li>
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Insights com IA Gemini</li>
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> KPIs profissionais prontos</li>
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Exportação em PDF</li>
                </ul>
                <button
                  onClick={() => onStart('analytics')}
                  className="mt-8 w-full py-3 rounded-xl bg-[#334155] text-[#F8FAFC] font-bold hover:bg-[#475569] transition cursor-pointer"
                >
                  Começar grátis
                </button>
              </div>

              <div className="relative bg-[#1E293B] border-2 border-[#F59E0B] p-8 rounded-3xl shadow-2xl flex flex-col group overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] text-[#0F172A] text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase">Mais popular</div>
                <div className="text-5xl font-extrabold text-[#F8FAFC]">R$ 39,90</div>
                <div className="mt-2 text-sm text-[#F59E0B] font-semibold">A partir de 100 linhas · cobrança via Stripe</div>
                <ul className="mt-6 space-y-3 text-sm text-[#F8FAFC]">
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> Planilhas ilimitadas</li>
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> Relatórios executivos em PDF</li>
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> Prospecção B2B integrada</li>
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> OpenSquad AI (agentes autônomos)</li>
                  <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> Suporte prioritário</li>
                </ul>
                <button
                  onClick={() => handleStripeCheckout(PLANS[1])}
                  className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] text-[#0F172A] font-extrabold hover:opacity-90 transition cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                >
                  Assinar via Stripe
                </button>
              </div>
            </div>

            <div className="max-w-2xl mx-auto bg-[#0F172A] border border-[#334155] rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#0F172A] font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC]">Subir planilha agora</h3>
                  <p className="text-xs text-[#94A3B8]">CSV, Excel ou JSON · até 15MB</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#94A3B8]">Se a planilha tiver mais de 100 linhas, você será direcionado ao checkout Stripe.</p>
            </div>

            {/* WHATSAPP */}
            <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-medium text-violet-400">
                  <MessageCircle className="w-3.5 h-3.5" /> Atendimento inteligente
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC] tracking-tight">
                  Atendimento via WhatsApp com <span className="text-[#F59E0B]">IA</span>
                </h2>
                <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto">
                  Chatwoot + fazer.ai agents. Seu cliente envia uma mensagem e a IA responde, prospecta e fecha — sem você precisar estar online 24h.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl hover:border-violet-500/40 transition">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-5"><Bot className="w-6 h-6 text-violet-400" /></div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Agente de Atendimento</h3>
                  <p className="text-sm text-[#94A3B8]">Conversas naturais via WhatsApp, com respostas instantâneas baseadas na base de conhecimento do seu negócio.</p>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl hover:border-violet-500/40 transition">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-5"><Send className="w-6 h-6 text-violet-400" /></div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Prospecção Automática</h3>
                  <p className="text-sm text-[#94A3B8]">A IA identifica oportunidades, envia mensagens persuasivas e programa reuniões — enquanto você dorme.</p>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl hover:border-violet-500/40 transition">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-5"><FileText className="w-6 h-6 text-violet-400" /></div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Contrato Automático</h3>
                  <p className="text-sm text-[#94A3B8]">Quando o cliente aceita, o sistema gera o contrato de prestação de serviço e envia para assinatura digital.</p>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-[#1E293B] py-12 px-6 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#0F172A] font-bold">F</div>
                <span>© {new Date().getFullYear()} Foco em Dados. Todos os direitos reservados.</span>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={() => onStart('prospecting')} className="hover:text-[#F8FAFC] transition cursor-pointer">Prospecção</button>
                <button onClick={() => onStart('crm')} className="hover:text-[#F8FAFC] transition cursor-pointer">CRM</button>
                <button onClick={() => onStart('indicators')} className="hover:text-[#F8FAFC] transition cursor-pointer">Indicadores</button>
                <a
                  href="https://wa.me/?text=Olá%20Gostaria%20de%20saber%20mais%20sobre%20a%20Foco%20em%20Dados."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600/20 border border-green-500/40 text-green-300 px-4 py-2 rounded-xl font-semibold hover:bg-green-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-green-400" /> Suporte WhatsApp
                </a>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-[#1E293B] py-12 px-6 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#0F172A] font-bold">F</div>
                <span>© {new Date().getFullYear()} Foco em Dados. Todos os direitos reservados.</span>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={() => onStart('prospecting')} className="hover:text-[#F8FAFC] transition cursor-pointer">Prospecção</button>
                <button onClick={() => onStart('crm')} className="hover:text-[#F8FAFC] transition cursor-pointer">CRM</button>
                <button onClick={() => onStart('indicators')} className="hover:text-[#F8FAFC] transition cursor-pointer">Indicadores</button>
                <a
                  href="https://wa.me/?text=Olá%20Gostaria%20de%20saber%20mais%20sobre%20a%20Foco%20em%20Dados."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600/20 border border-green-500/40 text-green-300 px-4 py-2 rounded-xl font-semibold hover:bg-green-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-green-400" /> Suporte WhatsApp
                </a>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;