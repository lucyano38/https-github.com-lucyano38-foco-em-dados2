import React from 'react';
import { Zap } from 'lucide-react';

export interface BotaoMissaoUnificadaProps {
  onIniciarMissao: () => void;
}

export const BotaoMissaoUnificada: React.FC<BotaoMissaoUnificadaProps> = ({
  onIniciarMissao,
}) => {
  return (
    <button
      onClick={onIniciarMissao}
      className="bg-amber-500 text-[#0F172A] px-8 py-4 rounded-xl font-bold text-base hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
    >
      <Zap className="w-5 h-5 fill-[#0F172A]" />
      <span>Iniciar Missão Unificada</span>
    </button>
  );
};
