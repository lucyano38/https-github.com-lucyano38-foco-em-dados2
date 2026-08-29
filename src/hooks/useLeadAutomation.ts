import { useState } from 'react';
import { ProspectLead } from '../components/ProspectCard';

export interface AutomationResponse {
  status: 'sucesso' | 'erro';
  mensagem: string;
  previewUrl?: string;
  data?: any;
}

export function useLeadAutomation() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const triggerAutomation = async (lead: ProspectLead): Promise<AutomationResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gerar-proposta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clienteNome: lead.nome,
          clienteSite: lead.siteAtual,
          clienteNicho: lead.nicho,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data: AutomationResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao conectar com a automação.';
      setError(errorMessage);
      return { status: 'erro', mensagem: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { triggerAutomation, isLoading, error };
}
