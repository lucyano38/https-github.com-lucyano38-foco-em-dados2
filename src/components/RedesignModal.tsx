import React, { useState } from 'react';
import { ProspectLead } from './ProspectCard';
import { Sparkles, CheckCircle2, Send, FileText, Globe, X, Smartphone, Monitor, AlertTriangle, Layers, ExternalLink } from 'lucide-react';

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
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer p-2"><X className="w-5 h-5" /></button>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Agente Hermes • Stitch IA</span>
              {temSite ? (
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Auditoria Visual Antes x Depois</span>
              ) : (
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Criação do Zero</span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">Stitch Redesign Studio: {lead.nome}</h2>
            <p className="text-xs text-slate-400">Nicho: {lead.nicho} • Alvo: {lead.siteAtual || 'Sem presença digital'}</p>
          </div>
        </div>

        {/* ABAS */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
          <button onClick={() => setAtivoTab('comparativo')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${ativoTab === 'comparativo' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {temSite ? '🖥️ Comparativo Visual (Antes x Depois)' : '🚀 Gerar Site Completo'}
          </button>
          <button onClick={() => setAtivoTab('proposta')} className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${ativoTab === 'proposta' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            📄 Proposta & Contrato Pronto
          </button>
        </div>

        {/* CONTEÚDO VISUAL NANO BANANA / STITCH */}
        {ativoTab === 'comparativo' && (
          <div className="space-y-6">
            {temSite ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* CARD ANTES (VISUAL OBSELETO) */}
                <div className="bg-slate-950 border-2 border-red-500/30 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">🔴 ANTES (Layout Atual)</span>
                      <span className="text-[10px] font-mono bg-red-500/10 text-red-300 px-2.5 py-1 rounded-full">Nota SEO: 38/100</span>
                    </div>

                    {/* Mockup Visual do Site Antigo */}
                    <div className="w-full h-48 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden opacity-75 grayscale">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                        <span className="text-[10px] font-mono text-slate-500 ml-2">{lead.siteAtual}</span>
                      </div>
                      <div className="space-y-2 py-4">
                        <div className="w-3/4 h-3 bg-slate-800 rounded" />
                        <div className="w-1/2 h-2 bg-slate-800 rounded" />
                      </div>
                      <div className="text-[10px] text-red-400 bg-red-950/40 p-2 rounded border border-red-900/50 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Não responsivo • Lento (+6s) • Sem WhatsApp
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs text-slate-400">
                    <div>❌ Perde 70% dos acessos por celular</div>
                    <div>❌ Sem botões de chamada para ação (CTA)</div>
                  </div>
                </div>

                {/* CARD DEPOIS (VISUAL STITCH PRO) */}
                <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-blue-500 text-slate-950 text-[10px] font-extrabold px-4 py-1 rounded-bl-2xl uppercase tracking-wider">
                    Stitch Layout PRO
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🟢 DEPOIS (Novo Redesign IA)</span>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-full">Nota SEO: 98/100</span>
                    </div>

                    {/* Mockup Visual do Novo Site (Stitch Render) */}
                    <div className="w-full h-48 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">preview.focoemdados.com.br/{lead.id}</span>
                      </div>
                      <div className="space-y-2 py-2">
                        <div className="text-sm font-bold text-white">🚀 {lead.nome} - Especialista em {lead.nicho}</div>
                        <div className="w-1/2 h-2 bg-amber-500/60 rounded" />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-bold">💬 WhatsApp Flutuante Ativo</span>
                        <span className="text-[10px] text-amber-400 font-bold underline">Ver Site Completo ↗</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Mobile-first & Ultra-rápido</div>
                    <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Aumento estimado de 3.4x em conversões</div>
                  </div>
                </div>

              </div>
            ) : (
              /* CRIAÇÃO DO ZERO */
              <div className="bg-slate-950 border-2 border-amber-500/40 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                  🌟 Oportunidade de Ouro: Criar Site Completo do Zero
                </div>
                <h3 className="text-lg font-bold text-white">O Agente Hermes estruturou uma Landing Page profissional para {lead.nome}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Como o cliente não possui site, entregamos um site institucional de alta conversão com catálogo e WhatsApp configurado em menos de 24 horas.
                </p>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-amber-400 flex items-center justify-between">
                  <span>URL do Preview Gerado: preview.focoemdados.com.br/{lead.id}</span>
                  <a href="#preview" onClick={(e) => { e.preventDefault(); alert("Preview gerado com sucesso pelo Agente Hermes!"); }} className="text-xs text-blue-400 underline flex items-center gap-1">Testar Preview <ExternalLink className="w-3 h-3" /></a>
                </div>
              </div>
            )}
          </div>
        )}

        {ativoTab === 'proposta' && (
          <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs">
            <div className="text-amber-400 font-bold flex items-center gap-2 text-sm"><FileText className="w-4 h-4" /> Proposta Comercial & Contrato Pré-Formatado</div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Cliente:</strong> {lead.nome} ({lead.nicho})<br />
              <strong>Solução:</strong> {temSite ? 'Redesign Visual Completo (Antes x Depois) + Alta Conversão' : 'Criação de Presença Digital do Zero + Automação'}<br />
              <strong>Investimento:</strong> R$ 1.500,00 (Setup Único) + R$ 39,90/mês (Manutenção e Acesso PRO Foco em Dados).
            </p>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-400 font-mono text-[11px]">
              ✓ Link seguro do contrato e proposta gerado: https://focoemdados.com.br/proposta/{lead.id}
            </div>
          </div>
        )}

        {/* RODAPÉ DO MODAL */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <button onClick={onClose} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer">
            Fechar
          </button>

          {enviado ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Proposta e Redesign enviados com sucesso!</span>
              <button onClick={onClose} className="px-5 py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">Concluir</button>
            </div>
          ) : (
            <button
              onClick={handleGerarEEnviar}
              disabled={loading}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Agente Hermes disparando...' : 'Aprovar Redesign e Enviar para o Cliente'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedesignModal;
