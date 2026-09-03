import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, CheckCircle2, Globe, ArrowRight, ShieldCheck, Phone, MapPin, Send } from 'lucide-react';

export const LivePreviewView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'site' | 'auditoria'>('site');
  const [leadData, setLeadData] = useState({
    nome: 'Clínica Sorriso Perfeito',
    nicho: 'Saúde e Odontologia',
    cidade: 'Campinas - SP',
    telefone: '(19) 98888-1111',
    siteAntigo: 'sorrisoperfeito-antigo.com.br'
  });

  useEffect(() => {
    // Extrai parâmetros da URL se houver (ex: /preview?nome=...&nicho=...)
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    const nicho = params.get('nicho');
    const cidade = params.get('cidade');
    const site = params.get('site');

    if (nome || nicho) {
      setLeadData({
        nome: nome || 'Empresa Exemplo',
        nicho: nicho || 'Comércio & Serviços',
        cidade: cidade || 'São Paulo - SP',
        telefone: '(11) 99999-9999',
        siteAntigo: site || 'site-antigo.com.br'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* BARRA SUPERIOR DE CONTROLE DO PREVIEW */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold text-sm">⚡</div>
          <div>
            <span className="text-xs font-bold text-white block">Stitch Studio • Preview Ativo</span>
            <span className="text-[10px] text-amber-400 font-mono">URL: focoemdados.com.br/preview/{encodeURIComponent(leadData.nome.toLowerCase())}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setViewMode('site')} className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${viewMode === 'site' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}>
            🌐 Ver Novo Site Pronto
          </button>
          <button onClick={() => setViewMode('auditoria')} className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${viewMode === 'auditoria' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}>
            📊 Ver Relatório de Auditoria & Proposta
          </button>
        </div>

        <div>
          <a href="/" className="text-xs text-slate-400 hover:text-white underline">Voltar à Foco em Dados</a>
        </div>
      </div>

      {/* MODO 1: O NOVO SITE PRONTO (LANDING PAGE FUNCIONAL) */}
      {viewMode === 'site' && (
        <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-slate-100 flex flex-col justify-between relative">
          
          {/* Header do Site do Cliente */}
          <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-800/60">
            <div className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" /> {leadData.nome}
            </div>
            <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
              <a href="#sobre" className="hover:text-amber-400">Sobre</a>
              <a href="#servicos" className="hover:text-amber-400">Serviços</a>
              <a href="#contato" className="hover:text-amber-400">Contato</a>
            </div>
            <a href={`https://wa.me/?text=Olá!%20Vim%20pelo%20site%20da%20${encodeURIComponent(leadData.nome)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </header>

          {/* Hero Section do Novo Site */}
          <section className="max-w-5xl mx-auto px-6 py-24 text-center space-y-8 my-auto">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 uppercase tracking-widest">
              Referência em {leadData.nicho}
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Excelência e cuidado especializado em <span className="text-amber-400">{leadData.cidade}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Transformamos sua experiência com atendimento humanizado, tecnologia de ponta e resultados garantidos. Agende sua avaliação hoje mesmo.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <a href="#contato" className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl transition">
                Agendar Atendimento Rápido →
              </a>
            </div>
          </section>

          {/* Seção Sobre / Serviços */}
          <section id="servicos" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">01</div>
              <h3 className="text-base font-bold text-white">Atendimento Especializado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Protocolos modernos ajustados exatamente para as suas necessidades de saúde e bem-estar.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">02</div>
              <h3 className="text-base font-bold text-white">Tecnologia Avançada</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Equipamentos de última geração e ambiente totalmente esterilizado e confortável.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">03</div>
              <h3 className="text-base font-bold text-white">Agendamento Flexível</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Horários compatíveis com sua rotina e confirmação instantânea via WhatsApp.</p>
            </div>
          </section>

          {/* Formulário de Contato do Site do Cliente */}
          <section id="contato" className="max-w-3xl mx-auto px-6 py-20 border-t border-slate-800 text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Entre em Contato Conosco</h2>
            <p className="text-xs text-slate-400">Preencha o formulário abaixo e nossa equipe retornará em instantes.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Mensagem enviada com sucesso para a ' + leadData.nome + '!'); }} className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 text-left shadow-2xl">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Seu Nome</label>
                <input type="text" placeholder="Nome completo" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Seu Telefone / WhatsApp</label>
                <input type="text" placeholder="(00) 00000-0000" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" required />
              </div>
              <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-lg">
                Enviar Mensagem
              </button>
            </form>
          </section>

          {/* Botão WhatsApp Flutuante */}
          <a href={`https://wa.me/?text=Olá!%20Vim%20pelo%20site%20da%20${encodeURIComponent(leadData.nome)}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer">
            <MessageCircle className="w-6 h-6" />
          </a>

          <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} {leadData.nome}. Todos os direitos reservados. Desenvolvido com tecnologia Foco em Dados.
          </footer>
        </div>
      )}

      {/* MODO 2: RELATÓRIO DE AUDITORIA & PROPOSTA */}
      {viewMode === 'auditoria' && (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Relatório Executivo de Auditoria</span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{leadData.nome}</h1>
            <p className="text-xs text-slate-400">Análise realizada automaticamente pelo Agente Hermes • Nicho: {leadData.nicho}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-slate-950 border border-red-500/30 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-red-400 uppercase">🔴 Como estava ({leadData.siteAntigo})</span>
                <p className="text-xs text-slate-300">Sem responsividade mobile, sem WhatsApp de conversão, carregamento lento e invisível no Google.</p>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">🟢 Como ficou (Novo Site Stitch PRO)</span>
                <p className="text-xs text-slate-300">Landing Page moderna, 100% responsiva, com botão flutuante de WhatsApp e captação de leads.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <div className="text-xs text-slate-400">
                Investimento Único: <strong>R$ 1.500,00</strong> + Manutenção PRO (R$ 39,90/mês).
              </div>
              <button onClick={() => alert('Contrato aprovado! O lead foi movido para Fechado no CRM.')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-lg">
                Aprovar Proposta & Fechar Contrato 🚀
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LivePreviewView;
