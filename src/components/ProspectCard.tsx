import React, { useState } from 'react';
import { RedesignModal } from './RedesignModal';

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
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentStatus = statusStyles[lead.status] || statusStyles.novo;

  const handleSuccess = (_leadId: string) => {
    // Atualiza status localmente se necessário
  };

  return (
    <>
      <div 
        onClick={() => onSelectLead(lead.id)}
        className="p-5 rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer backdrop-blur-md flex flex-col justify-between gap-4 shadow-xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{lead.nome}</h3>
            <p className="text-xs text-slate-300 mt-1">Nicho: {lead.nicho}</p>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${currentStatus.badgeClass}`}>
            {currentStatus.label}
          </span>
        </div>

        {lead.siteAtual && (
          <div className="text-xs text-slate-400 truncate bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            Site: <span className="text-amber-300 font-mono">{lead.siteAtual}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
          >
            ⚡ Disparar Redesign / IA
          </button>
        </div>
      </div>

      <RedesignModal
        lead={lead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default ProspectCard;
