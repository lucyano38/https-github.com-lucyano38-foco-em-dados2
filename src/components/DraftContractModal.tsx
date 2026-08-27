import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Check } from 'lucide-react';
import { Lead } from '../types';

interface DraftContractModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const DraftContractModal: React.FC<DraftContractModalProps> = ({ lead, onClose }) => {
  const [content, setContent] = useState(`CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: ${lead?.nome || '____________________'}
CIDADE: ${lead?.cidade || '____________________'}

OBJETO: Criação e publicação de página profissional.
VALOR: R$ ${lead?.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}

As partes acima qualificadas acordam com os termos deste contrato.`);

  if (!lead) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Minuta: {lead.nome}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 p-4 border border-neutral-200 rounded-xl font-mono text-xs text-neutral-800 resize-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="p-5 border-t border-neutral-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-neutral-600 font-semibold text-xs">Cancelar</button>
            <button className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> Salvar Minuta
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
