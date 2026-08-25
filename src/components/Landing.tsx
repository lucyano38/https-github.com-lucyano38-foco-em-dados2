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
  Cpu
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

