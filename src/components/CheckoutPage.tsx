import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface CheckoutPageProps {
  onBack?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] flex flex-col items-center justify-center p-6 relative">
      <div className="max-w-md w-full">
        <button onClick={onBack} className="mb-6 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.06] text-[#d4d6e0] text-xs font-semibold rounded-lg transition-colors border border-white/[0.08] cursor-pointer">
          ← Voltar
        </button>

        <div className="bg-[#0f1011] border border-white/[0.08] rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#d4a574] flex items-center justify-center shadow-[0_0_15px_rgba(212,165,116,0.25)] mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-[#1c1917]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f7f8f8] mb-2">
            Acesso Total PRO
          </h1>
          <p className="text-xs text-[#8a8f98] mb-6">
            CRM, OpenSquad, automação e inteligência de dados em um só ecossistema.
          </p>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 mb-6 text-left relative overflow-hidden shadow-[0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#f7f8f8]">Plano Mensal</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4a574] bg-white/[0.04] px-2 py-1 rounded-full border border-white/[0.08]">PRO</span>
            </div>
            <div className="text-3xl font-extrabold text-[#f7f8f8] my-2">R$ 39,90 <span className="text-xs text-[#8a8f98] font-normal">/mês</span></div>
            <ul className="text-xs text-[#d4d6e0] space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#d4a574]" /> Acesso completo ao ecossistema</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#d4a574]" /> OpenSquad AI multi-agente</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#d4a574]" /> CRM, pipeline e automação</li>
            </ul>
          </div>

          <button className="w-full px-6 py-3 bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] font-semibold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(212,165,116,0.25)] cursor-pointer flex items-center justify-center gap-2">
            <span>Assinar Acesso PRO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
