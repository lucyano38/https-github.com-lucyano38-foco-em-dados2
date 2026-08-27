import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  PlayCircle,
  TrendingUp,
  CreditCard,
  Bell,
  Settings,
  Activity,
  Search,
  Mail,
  MessageSquare,
  FileText,
  Handshake,
  ArrowRight,
  MessageCircle,
  Globe,
  ChevronDown,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Users,
  Briefcase,
  Cpu,
  Check
} from 'lucide-react';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-['Inter',sans-serif] selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#1E293B] shadow-[0_4px_20px_rgba(15,23,42,0.5)]">
        <div className="flex justify-between items-center px-6 md:px-16 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#3B82F6] flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <Zap className="w-4 h-4 text-[#0F172A] fill-[#0F172A]" />
            </div>
            <span className="font-['Inter'] text-xl font-extrabold text-[#F8FAFC] tracking-tight">
              Foco em Dados
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => onStart('evolua_demo')} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" /> Demonstração BI
            </button>
            <button onClick={() => onStart('prospecting')} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer">Prospecção B2B</button>
            <button onClick={() => onStart('crm')} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer">CRM & Pipeline</button>
            <button onClick={() => onStart('indicators')} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer">Indicadores</button>
            <button onClick={() => onStart('opensquad')} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer">OpenSquad AI</button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onStart('prospecting')}
              className="bg-[#F59E0B] text-[#0F172A] px-5 py-2.5 rounded-xl font-bold hover:bg-[#d9822b] transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer text-xs md:text-sm flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-[#0F172A]" /> Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#F59E0B]/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-medium text-[#F59E0B] shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
            <span>Plataforma Oficial de Inteligência de Dados & Automação B2B</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight"
          >
            Decisões baseadas em <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#3B82F6]">dados precisos</span> e prospecção em escala.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[#94A3B8] max-w-3xl mx-auto font-normal leading-relaxed font-['Inter']"
          >
            Unifique seus relatórios de BI, automatize a captação de leads qualificados em qualquer cidade e acelere suas vendas com agentes inteligentes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <button
              onClick={() => onStart('prospecting')}
              className="w-full sm:w-auto bg-[#F59E0B] text-[#0F172A] px-8 py-4 rounded-xl font-bold text-base hover:bg-[#d9822b] transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-3"
            >
              Iniciar Prospecção B2B <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onStart('evolua_demo')}
              className="w-full sm:w-auto bg-[#1E293B] border border-[#334155] text-[#F8FAFC] px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#334155]/50 transition-all cursor-pointer flex items-center justify-center gap-3"
            >
              <PlayCircle className="w-5 h-5 text-[#3B82F6]" /> Ver Demonstração BI
            </button>
          </motion.div>

          {/* Interactive Data Preview Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-2xl text-left backdrop-blur-xl"
          >
            <div className="flex items-center justify-between pb-6 border-b border-[#334155]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="text-xs font-mono text-[#94A3B8] ml-2">focoemdados.com.br/dashboard/live</span>
              </div>
              <span className="text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> API Ativa & Sincronizada
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="bg-[#0F172A] border border-[#334155] p-5 rounded-2xl">
                <div className="text-xs text-[#94A3B8] uppercase font-mono">Leads Qualificados</div>
                <div className="text-2xl font-bold text-[#F8FAFC] mt-1 font-['Inter']">14.892</div>
                <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +24.5% esta semana
                </div>
              </div>
              <div className="bg-[#0F172A] border border-[#334155] p-5 rounded-2xl">
                <div className="text-xs text-[#94A3B8] uppercase font-mono">Taxa de Conversão CRM</div>
                <div className="text-2xl font-bold text-[#F8FAFC] mt-1 font-['Inter']">38.2%</div>
                <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +5.1% otimizado por IA
                </div>
              </div>
              <div className="bg-[#0F172A] border border-[#334155] p-5 rounded-2xl">
                <div className="text-xs text-[#94A3B8] uppercase font-mono">Taxa Selic / BCB</div>
                <div className="text-2xl font-bold text-[#F59E0B] mt-1 font-['Inter']">13.25%</div>
                <div className="text-xs text-[#3B82F6] mt-2 flex items-center gap-1 font-mono">
                  Atualizado há 2h
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Persona Segments */}
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
          {/* Persona 1 */}
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:border-[#F59E0B]/50 transition group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] group-hover:scale-110 transition">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Diretores e Sócios</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Visão consolidada de faturamento, margens e previsibilidade de receita com relatórios executivos prontos em PDF e exportação instantânea.
              </p>
            </div>
            <button
              onClick={() => onStart('indicators')}
              className="mt-8 flex items-center gap-2 text-sm font-bold text-[#F59E0B] group-hover:translate-x-1 transition cursor-pointer"
            >
              Ver Indicadores Executivos <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Persona 2 */}
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:border-[#3B82F6]/50 transition group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Marketing e Vendas</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Prospecção ativa por nicho e cidade com enriquecimento de dados e pipeline CRM Kanban totalmente automatizado.
              </p>
            </div>
            <button
              onClick={() => onStart('prospecting')}
              className="mt-8 flex items-center gap-2 text-sm font-bold text-[#3B82F6] group-hover:translate-x-1 transition cursor-pointer"
            >
              Explorar Prospecção B2B <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Persona 3 */}
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:border-green-500/50 transition group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 group-hover:scale-110 transition">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Operações e BI</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Conexão com APIs públicas e corporativas, processamento de planilhas e agentes autônomos OpenSquad para auditoria técnica.
              </p>
            </div>
            <button
              onClick={() => onStart('analytics')}
              className="mt-8 flex items-center gap-2 text-sm font-bold text-green-400 group-hover:translate-x-1 transition cursor-pointer"
            >
              Acessar AI Data Analyst <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Video Demonstration Grid */}
      <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">
            Demonstração Prática em Ação
          </h2>
          <p className="text-[#94A3B8]">
            Veja como nossa tecnologia entrega resultados imediatos no seu fluxo diário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="aspect-video w-full rounded-2xl bg-[#0F172A] border border-[#334155] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition duration-500" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800')` }}></div>
              <div className="relative z-10 w-16 h-16 rounded-full bg-[#F59E0B] text-[#0F172A] flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer hover:scale-110 transition">
                <PlayCircle className="w-8 h-8 fill-[#0F172A] text-[#F59E0B]" />
              </div>
              <span className="relative z-10 text-xs font-mono text-[#F8FAFC] mt-3 bg-black/60 px-3 py-1 rounded-full">Prospecção de Clientes por Nicho</span>
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFC]">Varredura B2B Automatizada</h3>
            <p className="text-xs text-[#94A3B8]">Saiba como extrair leads qualificados em qualquer cidade brasileira em segundos.</p>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="aspect-video w-full rounded-2xl bg-[#0F172A] border border-[#334155] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition duration-500" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800')` }}></div>
              <div className="relative z-10 w-16 h-16 rounded-full bg-[#3B82F6] text-[#0F172A] flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.5)] cursor-pointer hover:scale-110 transition">
                <PlayCircle className="w-8 h-8 fill-[#0F172A] text-[#3B82F6]" />
              </div>
              <span className="relative z-10 text-xs font-mono text-[#F8FAFC] mt-3 bg-black/60 px-3 py-1 rounded-full">Dashboard BI & Indicadores</span>
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFC]">Análise Preditiva de Dados</h3>
            <p className="text-xs text-[#94A3B8]">Conecte planilhas e APIs públicas para gerar relatórios de inteligência comercial.</p>
          </div>
        </div>
      </section>

      {/* 4. Interactive BI/CRM Showcase */}
      <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC]">
            Pronto para transformar seus dados em receita?
          </h2>
          <p className="text-[#94A3B8] text-base md:text-lg">
            Junte-se a centenas de empresas que escalaram sua operação comercial com a Foco em Dados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => onStart('prospecting')}
              className="bg-[#F59E0B] text-[#0F172A] px-10 py-4 rounded-xl font-bold text-base hover:bg-[#d9822b] transition shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              Começar Agora Gratuitamente
            </button>
            <button
              onClick={() => onStart('evolua_demo')}
              className="bg-[#1E293B] border border-[#334155] text-[#F8FAFC] px-10 py-4 rounded-xl font-bold text-base hover:bg-[#334155] transition cursor-pointer"
            >
              Explorar Demonstração Completa
            </button>
          </div>
        </div>
      </section>

      {/* 4.5 Spreadsheet Upload & Pricing */}
      <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> Planilha inteligente
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC] tracking-tight">
            Suba sua planilha. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#3B82F6]">Receba insights.</span>
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
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] text-[#0F172A] text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl tracking-widest uppercase">Mais popular</div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">Pro</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-[#F8FAFC]">R$ 39,90</span>
              <span className="text-sm text-[#94A3B8]">/mês</span>
            </div>
            <div className="mt-2 text-sm text-[#F59E0B] font-semibold">A partir de 100 linhas · cobrança via Stripe</div>
            <ul className="mt-6 space-y-3 text-sm text-[#F8FAFC]">
              <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> Planilhas ilimitadas</li>
              <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> Relatórios executivos em PDF</li>
              <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> Prospecção B2B integrada</li>
              <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> OpenSquad AI (agentes autônomos)</li>
              <li className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" /> Suporte prioritário</li>
            </ul>
            <button
              onClick={() => alert('Redirecionando para o checkout Stripe...')}
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] text-[#0F172A] font-extrabold hover:opacity-90 transition cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.4)]"
            >
              Assinar via Stripe
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-[#0F172A] border border-[#334155] rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Subir planilha agora</h3>
              <p className="text-xs text-[#94A3B8]">CSV, Excel ou JSON · até 15MB</p>
            </div>
          </div>
          <label className="block">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.json,.tsv"
              className="block w-full text-xs text-[#94A3B8] file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-[#F59E0B] file:to-[#3B82F6] file:text-[#0F172A] hover:file:opacity-90 cursor-pointer"
            />
          </label>
          <p className="mt-3 text-[11px] text-[#94A3B8]">Se a planilha tiver mais de 100 linhas, você será direcionado ao checkout Stripe.</p>
        </div>
      </section>

      {/* 4.6 Auth separada */}
      <section className="py-20 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-medium text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Acesso seguro
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#F8FAFC]">Acesse com sua conta</h2>
          <p className="text-sm text-[#94A3B8]">Salve seus dashboards, leads e relatórios entre dispositivos.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert('Login com Google'); }}
              className="inline-flex items-center justify-center gap-3 bg-white text-[#0F172A] px-6 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg text-sm cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Entrar com Google
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert('Login com GitHub'); }}
              className="inline-flex items-center justify-center gap-3 bg-[#0F172A] text-white border border-[#334155] px-6 py-3.5 rounded-xl font-bold hover:bg-[#1E293B] transition shadow-lg text-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Entrar com GitHub
            </a>
          </div>
        </div>
      </section>

      {/* 5. Footer & Floating WhatsApp CTA */}
      <footer className="border-t border-[#1E293B] py-12 px-6 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-[#F59E0B] flex items-center justify-center text-[#0F172A] font-bold">F</div>
          <span>© {new Date().getFullYear()} Foco em Dados. Todos os direitos reservados.</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => onStart('prospecting')} className="hover:text-[#F8FAFC] transition cursor-pointer">Prospecção</button>
          <button onClick={() => onStart('crm')} className="hover:text-[#F8FAFC] transition cursor-pointer">CRM</button>
          <button onClick={() => onStart('indicators')} className="hover:text-[#F8FAFC] transition cursor-pointer">Indicadores</button>
          <a
            href="https://wa.me/?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20a%20Foco%20em%20Dados."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600/20 border border-green-500/40 text-green-300 px-4 py-2 rounded-xl font-semibold hover:bg-green-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-green-400" /> Suporte WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
};

