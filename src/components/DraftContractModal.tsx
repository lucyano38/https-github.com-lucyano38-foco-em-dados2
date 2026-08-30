import React from 'react';

interface DraftContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft?: string | null;
}

export const DraftContractModal: React.FC<DraftContractModalProps> = ({ isOpen, onClose, draft }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010102]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0f1011] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold text-[#f7f8f8] flex items-center gap-2">Minuta de Contrato</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/[0.04] rounded-lg text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">✕</button>
        </div>
        <div className="p-5 overflow-y-auto">
          <textarea
            readOnly
            value={draft || 'Nenhuma minuta disponível no momento.'}
            className="w-full h-96 p-4 border border-white/[0.08] rounded-xl font-mono text-xs text-[#d4d6e0] resize-none focus:ring-2 focus:ring-[#d4a574] bg-[#010102]"
          />
        </div>
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8a8f98]">
          <span>Revise o texto antes de enviar ao lead.</span>
          <button onClick={onClose} className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.06] text-[#d4d6e0] rounded-lg border border-white/[0.08] cursor-pointer">Fechar</button>
        </div>
      </div>
    </div>
  );
};
