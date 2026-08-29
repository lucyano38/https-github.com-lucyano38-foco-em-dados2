import React from 'react';

export type LeadStatus = 'novo' | 'contatado' | 'proposta_enviada' | 'fechado';

export interface ProspectLead {
  id: string;
  nome: string;
  nicho: string;
  siteAtual?: string;
  status: LeadStatus;
}

export interface ProspectCardProps {
  lead: ProspectLead;
  onSelectLead: (leadId: string) => void;
  onTriggerAutomation: (lead: ProspectLead) => void;
}

const statusStyles: Record<LeadStatus, { label: string; badgeClass: string }> = {
  novo: { label: 'Novo Lead', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  contatado: { label: 'Contatado', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  proposta_enviada: { label: 'Proposta Enviada', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  fechado: { label: 'Fechado', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export const ProspectCard: React.FC<ProspectCardProps> = ({
  lead,
  onSelectLead,
  onTriggerAutomation,
}) => {
  const currentStatus = statusStyles[lead.status] || statusStyles.novo;

  return (
    <div 
      onClick={() => onSelectLead(lead.id)}
      className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer backdrop-blur-md flex flex-col justify-between gap-4 shadow-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-100 tracking-tight">{lead.nome}</h3>
          <p className="text-xs text-slate-400 mt-1">Nicho: {lead.nicho}</p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${currentStatus.badgeClass}`}>
          {currentStatus.label}
        </span>
      </div>

      {lead.siteAtual && (
        <div className="text-xs text-slate-500 truncate bg-slate-950/40 p-2 rounded border border-slate-900">
          Site: <span className="text-slate-300">{lead.siteAtual}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTriggerAutomation(lead);
          }}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Disparar Redesign / IA
        </button>
      </div>
    </div>
  );
};
