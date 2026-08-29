export interface LeadInput {
  nome: string;
  site?: string;
  cnae?: string;
  nicho?: string;
}

export interface ProposalResult {
  status: 'sucesso' | 'erro';
  mensagem?: string;
  pontosMelhoria?: string[];
  cta?: string;
  previewUrl?: string;
  dataCriacao?: string;
  error?: string;
}

export async function dispararPropostaRedesign(lead: LeadInput): Promise<ProposalResult | null> {
  try {
    const response = await fetch('/api/gerar-proposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteNome: lead.nome,
        clienteSite: lead.site || '',
        clienteNicho: lead.cnae || lead.nicho || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const resultado: ProposalResult = await response.json();

    if (resultado.status === 'sucesso') {
      const resumo = [
        resultado.mensagem,
        '',
        '📋 Pontos de melhoria:',
        ...(resultado.pontosMelhoria || []).map((p, i) => `  ${i + 1}. ${p}`),
        '',
        `👉 ${resultado.cta}`,
        '',
        `🔗 Preview: ${resultado.previewUrl}`,
      ].join('\n');

      alert(`Proposta gerada com sucesso!\n\n${resumo}`);
      return resultado;
    }

    return resultado;
  } catch (err: any) {
    console.error('Erro ao conectar com a automação:', err);
    alert('Não foi possível gerar a proposta agora. Tente novamente em instantes.');
    return null;
  }
}
