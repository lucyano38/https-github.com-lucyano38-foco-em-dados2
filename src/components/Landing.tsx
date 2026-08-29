import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, PlayCircle, TrendingUp, FileText, ArrowRight, MessageCircle,
  Sparkles, ShieldCheck, Users, Briefcase, Cpu, Check, Bot, Send,
  X, Menu, ChevronDown, AlertCircle
} from 'lucide-react';

interface LandingProps {
  onStart: (mode: 'crm' | 'analytics' | 'opensquad' | 'evolua_demo' | 'prospecting' | 'indicators') => void;
  onUploadFile?: () => void;
}

const STRIPE_PRO_URL = 'https://buy.stripe.com/focoemdados-pro';

const NAV_ITEMS = [
  { id: 'recursos', label: 'Recursos' },
  { id: 'planos', label: 'Planos' },
  { id: 'automacao', label: 'Automação' },
  { id: 'faq', label: 'FAQ' }
];

export const Landing: React.FC<LandingProps> = ({ onStart, onUploadFile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
      if (file.size > 15 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Limite: 15MB.');
      }
      if (fileExt === '.csv' || fileExt === '.tsv') {
        const text = await file.text();
        const lines = text.split('\n').filter((l) => l.trim()).length - 1;
        if (lines > 100) {
          window.location.href = `${STRIPE_PRO_URL}?origem=upload&linhas=${lines}`;
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

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-['Inter',sans-serif] selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#1E293B]">
        <div className="flex justify-between items-center px-6 md:px-16 py-4 max-w-[1440px] mx-auto">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer" aria-label="Foco em Dados">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <Zap className="w-4 h-4 text-[#0F172A] fill-[#0F172A]" />
            </div>
            <span className="font-bold text-lg text-[#F8FAFC] tracking-tight">Foco em Dados</span>
          </button>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">{item.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => onStart('analytics')} className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition cursor-pointer">Entrar</button>
            <button onClick={() => onStart('prospecting')} className="bg-amber-500 text-[#0F172A] px-5 py-2.5 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 fill-[#0F172A]" /> Começar Agora
            </button>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#F8FAFC]" aria-label="Menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1E293B] bg-[#0F172A]/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-3">
              {NAV_ITEMS.map((item) => (
                <a key={item.id} href={`#${item.id}`} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-[#94A3B8] hover:text-[#F8FAFC] py-2">{item.label}</a>
              ))}
              <button onClick={() => { setMobileMenuOpen(false); onStart('prospecting'); }} className="w-full bg-amber-500 text-[#0F172A] px-5 py-3 rounded-xl font-bold text-sm">Começar Agora</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-medium text-amber-400">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Plataforma Oficial de Inteligência de Dados & Automação B2B</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl md:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
            Decisões baseadas em <span className="text-amber-400">dados precisos</span> e prospecção em escala.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl text-[#94A3B8] max-w-3xl mx-auto leading-relaxed">
            Unifique seus relatórios de BI, automatize a captação de leads qualificados em qualquer cidade e acelere suas vendas com agentes inteligentes.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button onClick={() => onStart('prospecting')} className="w-full sm:w-auto bg-amber-500 text-[#0F172A] px-8 py-4 rounded-xl font-bold text-base hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-3">
              Iniciar Prospecção B2B <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => onStart('evolua_demo')} className="w-full sm:w-auto bg-[#1E293B] border border-[#334155] text-[#F8FAFC] px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#334155]/50 transition-all flex items-center justify-center gap-3">
              <PlayCircle className="w-5 h-5 text-blue-400" /> Ver Demonstração BI
            </button>
          </motion.div>
        </div>
      </section>

      {/* RECURSOS / PERSONAS */}
      <section id="recursos" className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">Construído para Líderes Orientados a Dados</h2>
          <p className="text-[#94A3B8]">Soluções sob medida para cada papel estratégico da sua organização.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400"><Briefcase className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Diretores e Sócios</h3>
              <p className="text-sm text-[#94A3B8]">Visão consolidada de faturamento, margens e previsibilidade de receita com relatórios executivos prontos em PDF.</p>
            </div>
            <button onClick={() => onStart('indicators')} className="mt-8 flex items-center gap-2 text-sm font-bold text-amber-400 cursor-pointer">Ver Indicadores Executivos <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:border-blue-500/50 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400"><Users className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Marketing e Vendas</h3>
              <p className="text-sm text-[#94A3B8]">Prospecção ativa por nicho e cidade com enriquecimento de dados e pipeline CRM Kanban totalmente automatizado.</p>
            </div>
            <button onClick={() => onStart('prospecting')} className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-400 cursor-pointer">Explorar Prospecção B2B <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:border-green-500/50 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400"><Cpu className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Operações e BI</h3>
              <p className="text-sm text-[#94A3B8]">Conexão com APIs públicas e corporativas, processamento de planilhas e agentes autônomos OpenSquad para auditoria técnica.</p>
            </div>
            <button onClick={() => onStart('analytics')} className="mt-8 flex items-center gap-2 text-sm font-bold text-green-400 cursor-pointer">Acessar AI Data Analyst <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      {/* PLANOS E UPLOAD DE PLANILHA */}
      <section id="planos" className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> Planilha inteligente
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC] tracking-tight">
            Suba sua planilha. <span className="text-amber-400">Receba insights.</span>
          </h2>
          <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto">
            Upload em segundos. Dashboard executivo, KPIs profissionais e análise com IA. Plano gratuito de 100 linhas ou Pro por R$ 39,90/mês.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {/* Free Plan */}
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl flex flex-col">
            <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Free</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-[#F8FAFC]">R$ 0</span>
              <span className="text-sm text-[#94A3B8]">/mês</span>
            </div>
            <div className="mt-2 text-sm text-amber-400 font-semibold">Até 100 linhas por planilha</div>
            <ul className="mt-6 space-y-3 text-sm text-[#F8FAFC]">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-400 shrink-0" /> Dashboard executivo completo</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-400 shrink-0" /> Insights com IA Gemini</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-400 shrink-0" /> KPIs profissionais prontos</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-green-400 shrink-0" /> Exportação em PDF</li>
            </ul>
            <button onClick={() => onStart('analytics')} className="mt-8 w-full py-3 rounded-xl bg-[#334155] text-[#F8FAFC] font-bold hover:bg-[#475569] transition cursor-pointer">
              Começar Grátis
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-[#1E293B] border-2 border-amber-500 p-8 rounded-3xl shadow-2xl flex flex-col">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-blue-500 text-[#0F172A] text-[10px] font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase">Mais popular</div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Pro</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-[#F8FAFC]">R$ 39,90</span>
              <span className="text-sm text-[#94A3B8]">/mês</span>
            </div>
            <div className="mt-2 text-sm text-amber-400 font-semibold">A partir de 100 linhas · cobrança via Stripe</div>
            <ul className="mt-6 space-y-3 text-sm text-[#F8FAFC]">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Planilhas ilimitadas</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Relatórios executivos em PDF</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Prospecção B2B integrada</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-amber-400 shrink-0" /> OpenSquad AI (agentes autônomos)</li>
            </ul>
            <button onClick={() => window.location.href = STRIPE_PRO_URL} className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-blue-500 text-[#0F172A] font-extrabold hover:opacity-90 transition cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              Assinar via Stripe
            </button>
          </div>
        </div>

        {/* UPLOAD BOX */}
        <div className="max-w-2xl mx-auto bg-[#0F172A] border border-[#334155] rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-[#F8FAFC]">Subir planilha agora</h3>
              <p className="text-xs text-[#94A3B8]">CSV, Excel ou JSON · até 15MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json,.tsv"
            onChange={handleFileUpload}
            className="block w-full text-xs text-[#94A3B8] file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-amber-500 file:text-[#0F172A] hover:file:bg-amber-400 cursor-pointer"
          />
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          <p className="text-[11px] text-[#94A3B8]">Se a planilha tiver mais de 100 linhas, você será direcionado ao checkout Stripe.</p>
        </div>
      </section>

      {/* AUTOMAÇÃO WHATSAPP */}
      <section id="automacao" className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1E293B]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-medium text-violet-400">
            <MessageCircle className="w-3.5 h-3.5" /> Atendimento inteligente
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC] tracking-tight">
            Atendimento via WhatsApp com <span className="text-amber-400">IA</span>
          </h2>
          <p className="text-[#94A3B8] text-base md:text-lg max-w-2xl mx-auto">
            Chatwoot + fazer.ai agents. Seu cliente envia uma mensagem e a IA responde, prospecta e fecha — sem você precisar estar online 24h.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-5"><Bot className="w-6 h-6 text-violet-400" /></div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Agente de Atendimento</h3>
            <p className="text-sm text-[#94A3B8]">Conversas naturais via WhatsApp, com respostas instantâneas baseadas na base de conhecimento do seu negócio.</p>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-5"><Send className="w-6 h-6 text-violet-400" /></div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Prospecção Automática</h3>
            <p className="text-sm text-[#94A3B8]">A IA identifica oportunidades, envia mensagens persuasivas e programa reuniões — enquanto você dorme.</p>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-3xl shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-5"><FileText className="w-6 h-6 text-violet-400" /></div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Contrato Automático</h3>
            <p className="text-sm text-[#94A3B8]">Quando o cliente aceita, o sistema gera o contrato de prestação de serviço e envia para assinatura digital.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto border-t border-[#1E293B]">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-[#F8FAFC]">Perguntas Frequentes</h2>
          <p className="text-[#94A3B8]">Tire suas dúvidas sobre a plataforma.</p>
        </div>
        <div className="space-y-4">
          {[
            { q: 'Preciso de cartão de crédito para começar?', a: 'Não. O plano Free suporta até 100 linhas por planilha sem custo. Você só cadastra cartão ao fazer upgrade para o Pro (R$ 39,90/mês via Stripe).' },
            { q: 'Como funciona a prospecção B2B?', a: 'Você define nicho e cidade, e a plataforma vasculha fontes públicas (Google Maps, redes sociais, cadastros abertos) para retornar leads com nome, contato e enriquecimento via IA.' },
            { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem fidelidade, sem multa. Você cancela a assinatura Pro direto no painel do Stripe quando quiser.' },
            { q: 'Os dados ficam seguros?', a: 'Sim. Usamos Firebase Authentication, Firestore com regras de segurança e criptografia em trânsito (HTTPS). Seus dados não são compartilhados com terceiros.' }
          ].map((faq, index) => (
            <div key={index} className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left font-semibold text-[#F8FAFC] flex justify-between items-center cursor-pointer hover:bg-[#334155]/30 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4 text-sm text-[#94A3B8] leading-relaxed border-t border-[#334155]/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1E293B] py-12 px-6 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-[#0F172A] font-bold">F</div>
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

export default Landing;
