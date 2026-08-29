import React from 'react';
import { ProspectLead, ProspectCard } from './ProspectCard';
import { useLeadAutomation } from '../lib/useLeadAutomation';
import { Sparkles, AlertCircle } from 'lucide-react';

export interface ProspectListProps {
  leads: ProspectLead[];
  onSelectLead: (leadId: string) => void;
  onAutomationSuccess?: (response: any) => void;
}

export const ProspectList: React.FC<ProspectListProps> = ({
  leads,
  onSelectLead,
  onAutomationSuccess,
}) => {
  const { triggerAutomation, isLoading, error } = useLeadAutomation();

  const handleTrigger = async (lead: ProspectLead) => {
    const result = await triggerAutomation(lead);
    if (result && result.status === 'sucesso') {
      if (onAutomationSuccess) {
        onAutomationSuccess(result);
      } else {
        alert(`Proposta gerada com sucesso para ${lead.nome}!\n\n${result.mensagem}`);
      }
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Prospecção & Redesign B2B</h2>
          <p className="text-xs text-slate-400 mt-1">Leads qualificados e automação de propostas via IA (Gemini).</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-medium">
          <Sparkles className="w-3.5 h-3.5" /> IA Ativa
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {leads.length === 0 ? (
        <div className="text-center py-12 bg-slate-950/40 border border-slate-900 rounded-2xl text-slate-500 text-xs">
          Nenhum lead encontrado na base no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <ProspectCard
              key={lead.id}
              lead={lead}
              onSelectLead={onSelectLead}
              onTriggerAutomation={handleTrigger}
            />
          ))}
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex items-center gap-4 text-slate-100 text-sm font-medium">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <span>Agente Hermes analisando site e gerando proposta comercial...</span>
          </div>
        </div>
      )}
    </div>
  );
};
