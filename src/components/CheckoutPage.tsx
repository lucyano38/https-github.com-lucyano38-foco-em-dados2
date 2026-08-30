import React, { useState } from 'react';

export interface CheckoutPageProps {
  onBack?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleAssinarPlano = async (planoId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/criar-sessao-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planoId }),
      });

      const data = await response.json();

      if (data.urlCheckout) {
        window.location.href = data.urlCheckout;
      } else {
        // Fallback para URL padrão do Stripe configurada no projeto
        window.location.href = 'https://buy.stripe.com/focoemdados-pro';
      }
    } catch (err) {
      console.error(err);
      // Fallback seguro caso a API falhe
      window.location.href = 'https://buy.stripe.com/focoemdados-pro';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors border border-slate-800 cursor-pointer"
        >
          ← Voltar
        </button>
      )}

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-2">
          Desbloqueie o Ecossistema Completo
        </h1>
        <p className="text-xs text-slate-400 mb-8">
          Para acessar o Painel de Prospecção e os Agentes de Inteligência, escolha seu plano abaixo:
        </p>

        {/* Card do Plano Pro */}
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-6 mb-6 text-left relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Recomendado
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-1">Missão Unificada PRO</h2>
          <p className="text-2xl font-extrabold text-amber-400 mb-4">R$ 39,90<span className="text-xs text-slate-400 font-normal">/mês</span></p>
          <ul className="text-xs text-slate-300 space-y-2 mb-6">
            <li>✓ Prospecção automatizada em escala</li>
            <li>✓ Acesso ilimitado ao CRM Kanban</li>
            <li>✓ Disparos de propostas via API Resend</li>
          </ul>

          <button
            onClick={() => handleAssinarPlano('preco_pro_3990')}
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processando...' : 'Assinar e Desbloquear Acesso'}
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Pagamento 100% seguro processado via gateway criptografado. Cancele quando quiser.
        </p>
      </div>
    </div>
  );
};

export default CheckoutPage;
