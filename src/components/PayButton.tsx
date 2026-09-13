import React, { useState } from 'react';
import { toast } from 'sonner';

interface PayButtonProps {
  customerEmail: string;
  planId?: string;
  onSuccess?: (sessionUrl: string) => void;
  onCancel?: () => void;
}

export const PayButton: React.FC<PayButtonProps> = ({ customerEmail, planId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail, planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao criar checkout');
      window.location.href = data.url;
      onSuccess?.(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all hover:shadow-lg active:scale-[0.98]"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processando...
        </span>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2h2a2 2 0 012 2v5h5a2 2 0 012 2v2z" />
          </svg>
          Pagar Agora
        </>
      )}
    </button>
  );
};
