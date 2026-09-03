import React, { useState } from 'react';
import { ProspectLead } from './ProspectCard';
import { 
  Sparkles, CheckCircle2, Send, FileText, Globe, X, Smartphone, 
  Monitor, Tablet, AlertTriangle, Layers, ExternalLink, Download, ArrowRight, ShieldCheck, Check, Phone 
} from 'lucide-react';

export interface RedesignStudioViewProps {
  lead: ProspectLead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RedesignStudioView: React.FC<RedesignStudioViewProps> = ({
  lead,
  isOpen,
  onClose,
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lead) return null;

  const temSite = Boolean(lead.siteAtual && lead.siteAtual.trim() !== '' && !lead.siteAtual.includes('sem site'));
  const scoreAtual = temSite ? 42 : 12;

  const problemas = temSite ? [
    'Não possui botão de WhatsApp inteligente',
    'Não captura leads / formulário obsoleto',
    'Não aparece otimizado no Google Maps e SEO',
    'Site não é 100% responsivo em celulares',
    'Design ultrapassado e sem credibilidade',
    'Velocidade de carregamento lenta (+6 segundos)'
  ] : [
    'A empresa não possui site na internet',
    'Invisível para clientes que pesquisam no Google',
    'Sem canal de atendimento via WhatsApp no domínio',
    'Perda diária de de vender para concorrentes locais',
    'Zero presença digital profissional'
  ];

  const projetoSugerido = [
    'Página Inicial Institucional de Alta Conversão',
    'Seção Sobre a Empresa & História',
    'Catálogo de Produtos / Serviços em Destaque',
    'Página de Contato & Localização',
    'WhatsApp Integrado Flutuante (1 Clique)',
    'Formulário Inteligente de Captura de Leads',
    'SEO Técnico Básico (Google Otimizado)',
    'Design 100% Mobile First',
    'Integração com Instagram & Facebook',
    'Certificado SSL Gratuito Inlcuso'
  ];

  const shareableLink = `https://focoemdados.com.br/redesign/${lead.id.toLowerCase()}`;

  const mensagemWhatsApp = `Olá, tudo bem? Aqui é da equipe de inteligência digital.\n\nRealizamos uma análise da presença digital da ${lead.nome} e identificamos algumas oportunidades importantes de melhoria para capturar mais clientes na região.\n\nCriamos uma prévia de redesign personalizada mostrando como sua empresa pode se apresentar de forma muito mais profissional na internet.\n\nVeja o projeto interativo aqui: ${shareableLink}\n\nO que acha de conversarmos 10 minutinhos sobre isso?`;

  const handleCopiarMensagem = () => {
    navigator.clipboard.writeText(mensagemWhatsApp);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 md:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative text-slate-100 max-h-[95vh] overflow-y-auto space-y-10">
        
        {/* BOTÃO FECHAR */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white cursor-pointer p-2 bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>

        {/* ETAPA 1: DIAGNÓSTICO EXECUTIVO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Stitch Redesign Studio • Proposta Comercial</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">{lead.nome}</h1>
              <p className="text-xs text-slate-400 mt-0.5">Cidade: {lead.nicho} • Segmento: {lead.nicho} • Alvo: <span className="text-amber-300 font-mono">{lead.siteAtual || 'Sem presença digital'}</span></p>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center min-w-[160px] shadow-inner">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pontuação Atual</div>
            <div className={`text-3xl font-extrabold font-mono mt-1 ${scoreAtual < 50 ? 'text-red-400' : 'text-amber-400'}`}>
              {scoreAtual}/100
            </div>
          </div>
        </div>

        {/* ETAPA 2: PROBLEMAS ENCONTRADOS */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Etapa 2: Problemas Críticos Encontrados na Auditoria
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {problemas.map((prob, idx) => (
              <div key={idx} className="bg-slate-950 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 shadow-md">
                <span className="text-red-400 font-bold text-sm">❌</span>
                <span className="text-xs text-slate-300 leading-tight">{prob}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ETAPA 3: OPORTUNIDADE PERDIDA */}
        <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-3 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            🎯 Etapa 3: Oportunidade Perdida (Análise da IA)
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {temSite ? (
              <>O site atual da <strong>{lead.nome}</strong> está defasado e gera desconfiança nos potenciais clientes que chegam pelo Google. Usuários mobile abandonam a página em segundos devido à lentidão e à falta de responsividade. Cada dia sem um redesign é receita perdida indo direto para a concorrência local.</>
            ) : (
              <>A <strong>{lead.nome}</strong> está totalmente invisível no ambiente digital. Quando clientes buscam por {lead.nicho} na região, encontram apenas concorrentes. Isso destrói a autoridade da marca e impede a captura automatizada de novos clientes 24 horas por dia.</>
            )}
          </p>
        </div>

        {/* ETAPA 4: PROJETO SUGERIDO */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Etapa 4: Escopo do Projeto Sugerido pelo OpenSquad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {projetoSugerido.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ETAPA 5: PRÉVIA VISUAL (MOCKUP INTERATIVO) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Etapa 5: Prévia Visual (Mockup Interativo)
            </h2>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button onClick={() => setDeviceView('desktop')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${deviceView === 'desktop' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}><Monitor className="w-3.5 h-3.5" /> Desktop</button>
              <button onClick={() => setDeviceView('tablet')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${deviceView === 'tablet' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}><Tablet className="w-3.5 h-3.5" /> Tablet</button>
              <button onClick={() => setDeviceView('mobile')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${deviceView === 'mobile' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}><Smartphone className="w-3.5 h-3.5" /> Mobile</button>
            </div>
          </div>

          <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 flex items-center justify-center min-h-[320px] relative overflow-hidden shadow-2xl">
            <div className={`w-full transition-all duration-300 ${deviceView === 'desktop' ? 'max-w-4xl' : deviceView === 'tablet' ? 'max-w-xl' : 'max-w-xs'}`}>
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[11px] font-mono text-amber-400">preview.focoemdados.com.br/{lead.id}</span>
                </div>
                <div className="text-center py-6 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Novo Layout PRO • Stitch Studio</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">{lead.nome}</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">Referência absoluta em {lead.nicho} na região de {lead.cidade || 'sua cidade'}. Atendimento rápido e garantido.</p>
                  <div className="pt-2">
                    <span className="inline-block px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg">
                      💬 Chamar no WhatsApp (Agente Hermes)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ETAPA 6: COMPARATIVO VISUAL */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" /> Etapa 6: Tabela Comparativa (Atual vs Novo Projeto)
          </h2>
          <div className="overflow-x-auto bg-slate-950 rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3.5">Critério</th>
                  <th className="p-3.5 text-red-400">Situação Atual</th>
                  <th className="p-3.5 text-emerald-400">Novo Projeto (Stitch PRO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr>
                  <td className="p-3.5 text-white">Presença na Internet</td>
                  <td className="p-3.5 text-red-400">{temSite ? 'Site obsoleto e sem otimização' : 'Invisível (Sem site)'}</td>
                  <td className="p-3.5 text-emerald-400 font-bold">Site institucional moderno e profissional</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-white">Atendimento ao Cliente</td>
                  <td className="p-3.5 text-red-400">Apenas telefone fixo / E-mail</td>
                  <td className="p-3.5 text-emerald-400 font-bold">WhatsApp Inteligente integrado 24/7</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-white">Captação de Leads</td>
                  <td className="p-3.5 text-red-400">Quase nula</td>
                  <td className="p-3.5 text-emerald-400 font-bold">Formulários e gatilhos de conversão ativa</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-white">Velocidade & SEO</td>
                  <td className="p-3.5 text-red-400">Baixa (Perde para concorrentes)</td>
                  <td className="p-3.5 text-emerald-400 font-bold">Otimizado para o topo do Google</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ETAPA 7: GANHOS ESTIMADOS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xl font-extrabold text-white font-mono">+ 300%</div>
            <div className="text-xs text-slate-400 mt-1">Mais Credibilidade Local</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xl font-extrabold text-amber-400 font-mono">24 Horas</div>
            <div className="text-xs text-slate-400 mt-1">Captação Automática</div>
          </div>
          <div className="col-span-2 md:col-span-1 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xl font-extrabold text-emerald-400 font-mono">Mobile First</div>
            <div className="text-xs text-slate-400 mt-1">Perfeito em Celulares</div>
          </div>
        </div>

        {/* ETAPA 8 & 10: PROPOSTA COMERCIAL & LINK COMPARTILHÁVEL */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Etapa 8 & 10: Proposta Comercial & Link Compartilhável
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Envie este link interativo diretamente para o decisor da empresa.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl font-mono text-xs text-amber-300">
              {shareableLink}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-300">
              <strong>Investimento Único:</strong> R$ 1.500,00 (Implantação) + R$ 39,90/mês (Manutenção PRO).
            </div>
            <button onClick={() => alert('PDF da Proposta Comercial gerado com sucesso!')} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" /> Gerar Proposta em PDF
            </button>
          </div>
        </div>

        {/* ETAPA 9: MENSAGEM PRONTA PARA WHATSAPP */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Send className="w-4 h-4" /> Etapa 9: Mensagem Pronta para WhatsApp
            </h2>
            <button
              onClick={handleCopiarMensagem}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-2"
            >
              {copied ? '✅ Mensagem Copiada!' : '📋 Copiar Mensagem para WhatsApp'}
            </button>
          </div>
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {mensagemWhatsApp}
          </div>
        </div>

        {/* RODAPÉ DO ESTÚDIO */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <button onClick={onClose} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer">
            Fechar Estúdio
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensagemWhatsApp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Disparar Direto no WhatsApp do Lead
          </a>
        </div>

      </div>
    </div>
  );
};

export default RedesignStudioView;
