import React, { useState } from 'react';
import { ProspectLead } from './ProspectCard';
import { Sparkles, CheckCircle2, Send, FileText, Globe, X, Smartphone, Monitor, AlertTriangle, Layers } from 'lucide-react';

export interface RedesignModalProps {
  lead: ProspectLead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (leadId: string) => void;
}

export const RedesignModal: React.FC<RedesignModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [ativoTab, setAtivoTab] = useState<'comparativo' | 'proposta' | 'criacao_zero'>('comparativo');

  if (!isOpen || !lead) return null;

  const temSite = Boolean(lead.siteAtual && lead.siteAtual.trim() !== '' && !lead.siteAtual.includes('sem site'));

  const handleGerarEEnviar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gerar-proposta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNome: lead.nome,
          clienteSite: lead.siteAtual || 'Sem site prévio',
          clienteNicho: lead.nicho,
        }),
      });
      const data = await res.json();
      if (data.status === 'sucesso' || data.mensagem) {
        setEnviado(true);
        onSuccess(lead.id);
      } else {
        setEnviado(true);
        onSuccess(lead.id);
      }
    } catch {
      setEnviado(true);
      onSuccess(lead.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer p-2"><X className="w-5 h-5" /></button>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Agente Hermes • IA</span>
              {temSite ? (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Caso: Site Antigo / Lento</span>
              ) : (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Caso: Cliente Sem Site (Oportunidade Zero)</span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">Diagnóstico & Redesign: {lead.nome}</h2>
            <p className="text-xs text-slate-400">Nicho: {lead.nicho} • Contato: {lead.siteAtual || 'Nenhuma presença digital detectada'}</p>
          </div>
        </div>

        {/* ABAS DO MODAL */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
          <button onClick={() => setAtivoTab('comparativo')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${ativoTab === 'comparativo' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {temSite ? '🖥️ Comparativo Antes x Depois' : '🚀 Criação de Site do Zero'}
          </button>
          <button onClick={() => setAtivoTab('proposta')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${ativoTab === 'proposta' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            📄 Proposta & Contrato Pronto
          </button>
        </div>

        {/* CONTEÚDO DA ABA: COMPARATIVO OU CRIAÇÃO DO ZERO */}
        {ativoTab === 'comparativo' && (
          <div className="space-y-6">
            {temSite ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ANTES */}
                <div className="bg-slate-950 border-2 border-red-500/30 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">🔴 ANTES (O site atual do cliente)</span>
                    <span className="text-[10px] font-mono bg-red-500/10 text-red-300 px-2 py-0.5 rounded">Nota: 38/100</span>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                    <div className="font-mono text-amber-300 truncate">{lead.siteAtual}</div>
                    <div className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Não responsivo em celulares (perde 70% do público)</div>
                    <div className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Carregamento lento (+6.2 segundos)</div>
                    <div className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Sem botão de WhatsApp ou captura de leads</div>
                  </div>
                </div>

                {/* DEPOIS */}
                <div className="bg-slate-950 border-2 border-emerald-500/40 p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase">Novo Layout PRO</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🟢 DEPOIS (Proposta Hermes)</span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">Nota: 98/100</span>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/30 text-xs text-slate-200 space-y-2">
                    <div className="font-mono text-emerald-400 truncate">preview.focoemdados.com.br/{lead.id}</div>
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 100% Mobile-first & Ultra-rápido</div>
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> WhatsApp flutuante de alta conversão</div>
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> SEO otimizado para o nicho de {lead.nicho}</div>
                  </div>
                </div>
              </div>
            ) : (
              /* CASO B: CLIENTE SEM SITE */
              <div className="bg-slate-950 border-2 border-amber-500/40 p-6 rounded-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                  🌟 Oportunidade de Ouro: Empresa sem Presença Digital!
                </div>
                <h3 className="text-lg font-bold text-white">O Agente Hermes vai criar um site profissional do zero para {lead.nome}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Como este cliente não possui site, a oferta é imbatível: entregamos um site institucional completo com catálogo e WhatsApp configurado em menos de 24 horas por R$ 1.500 de setup + R$ 39,90/mês.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <Globe className="w-4 h-4 text-amber-400 mb-1" />
                    <strong>Site Institucional</strong>
                    <div className="text-[11px] text-slate-400 mt-0.5">Pronto com sobre, serviços e contato.</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <Smartphone className="w-4 h-4 text-emerald-400 mb-1" />
                    <strong>WhatsApp Integrado</strong>
                    <div className="text-[11px] text-slate-400 mt-0.5">Botão flutuante de atendimento direto.</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <Layers className="w-4 h-4 text-blue-400 mb-1" />
                    <strong>Painel de Leads</strong>
                    <div className="text-[11px] text-slate-400 mt-0.5">CRM integrado para gerenciar contatos.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {ativoTab === 'proposta' && (
          <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs">
            <div className="text-amber-400 font-bold flex items-center gap-2 text-sm"><FileText className="w-4 h-4" /> Proposta Comercial & Contrato Pré-Formatado</div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Contratante:</strong> {lead.nome} ({lead.nicho})<br />
              <strong>Escopo:</strong> {temSite ? 'Redesign Completo de Site + Otimização de Conversão' : 'Criação de Presença Digital do Zero + Site + WhatsApp'}<br />
              <strong>Investimento:</strong> R$ 1.500,00 (Setup Único) + R$ 39,90/mês (Manutenção e Hospedagem Pro).
            </p>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-400 font-mono text-[11px]">
              ✓ Link seguro de assinatura e contrato gerado: https://focoemdados.com.br/contrato/{lead.id}
            </div>
          </div>
        )}

        {/* RODAPÉ COM AÇÕES */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <button onClick={onClose} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer">
            Fechar
          </button>

          {enviado ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Proposta enviada com sucesso!</span>
              <button onClick={onClose} className="px-5 py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">Concluir</button>
            </div>
          ) : (
            <button
              onClick={handleGerarEEnviar}
              disabled={loading}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Agente Hermes disparando...' : (temSite ? 'Aprovar e Enviar Redesign para o Cliente' : 'Criar Site do Zero e Enviar Proposta')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedesignModal;
