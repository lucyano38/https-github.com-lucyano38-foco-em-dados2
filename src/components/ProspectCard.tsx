import React from 'react';
import { Star, MapPin, Phone, Mail, Globe, CheckCircle2 } from 'lucide-react';
import { ProspectLead } from '../types';

interface ProspectCardProps {
  lead: ProspectLead;
  onSelectLead: (id: string) => void;
  onTriggerAutomation: (lead: ProspectLead) => void;
}

export const ProspectCard: React.FC<ProspectCardProps> = ({ lead, onSelectLead, onTriggerAutomation }) => {
  const isSelected = false;

  return (
    <div
      onClick={() => onSelectLead(lead.id)}
      className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] transition-all cursor-pointer backdrop-blur-md flex flex-col justify-between gap-4 shadow-[0_1px_0_rgba(255,255,255,0.05)]"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-[#f7f8f8] tracking-tight">{lead.nome}</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4a574] bg-white/[0.04] px-2 py-1 rounded-full border border-white/[0.08]">
            {lead.status}
          </span>
        </div>
        <div className="text-xs text-[#8a8f98] truncate bg-white/[0.03] p-2 rounded border border-white/[0.08] mt-3">
          {lead.siteAtual}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-[#8a8f98]">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#d4a574]" /> {lead.nicho}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTriggerAutomation(lead);
          }}
          className="px-3 py-2 rounded-lg bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] text-xs font-bold cursor-pointer transition-all"
        >
          Disparar Automação
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectLead(lead.id);
          }}
          className="px-3 py-2 rounded-lg border border-white/[0.08] text-[#d4d6e0] hover:bg-white/[0.06] text-xs font-semibold cursor-pointer transition-all"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};
