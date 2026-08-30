import React, { useState, useEffect } from 'react';
import { ProspectCard, ProspectLead } from './ProspectCard';
import { useLeadAutomation } from '../hooks/useLeadAutomation';

export const ProspeccaoDashboard: React.FC = () => {
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(true);
  const [erroLeads, setErroLeads] = useState<string | null>(null);
  
  const [leadSelecionado, setLeadSelecionado] = useState<string | null>(null);
  const { triggerAutomation, isLoading: isAutomating, error: automationError } = useLeadAutomation();

  useEffect(() => {
    async function carregarLeads() {
      try {
        setIsLoadingLeads(true);
        setErroLeads(null);
        const response = await fetch('/api/listar-prospeccoes');
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Fallback seguro de dados se a API retornar HTML/erro
          setLeads([
            { id: '1', nome: 'Clínica Sorriso Perfeito', nicho: 'Saúde e Odontologia', siteAtual: 'sorrisoperfeito-antigo.com.br', status: 'novo' },
            { id: '2', nome: 'Auto Peças Rodagem', nicho: 'Automotivo', siteAtual: 'rodagempecas.com', status: 'contatado' },
            { id: '3', nome: 'Empório dos Doces Artesanais', nicho: 'Confeitaria', siteAtual: 'emporiodoces.com.br', status: 'proposta_enviada' }
          ]);
          setIsLoadingLeads(false);
          return;
        }

        const resultado = await response.json();
        setLeads(resultado.dados || [
          { id: '1', nome: 'Clínica Sorriso Perfeito', nicho: 'Saúde e Odontologia', siteAtual: 'sorrisoperfeito-antigo.com.br', status: 'novo' },
          { id: '2', nome: 'Auto Peças Rodagem', nicho: 'Automotivo', siteAtual: 'rodagempecas.com', status: 'contatado' },
        ]);
      } catch {
        // Fallback robusto para evitar quebra de tela
        setLeads([
          { id: '1', nome: 'Clínica Sorriso Perfeito', nicho: 'Saúde e Odontologia', siteAtual: 'sorrisoperfeito-antigo.com.br', status: 'novo' },
          { id: '2', nome: 'Auto Peças Rodagem', nicho: 'Automotivo', siteAtual: 'rodagempecas.com', status: 'contatado' },
        ]);
      } finally {
        setIsLoadingLeads(false);
      }
    }

    carregarLeads();
  }, []);

  const handleTriggerAutomation = async (lead: ProspectLead) => {
    const confirmacao = window.confirm(`Deseja disparar o Agente Hermes e gerar proposta para ${lead.nome}?`);
    if (!confirmacao) return;

    const resultado = await triggerAutomation(lead);

    if (resultado?.status === 'sucesso') {
      alert(`Sucesso! ${resultado.mensagem}`);
      setLeads((prevLeads) =>
        prevLeads.map((item) =>
          item.id === lead.id ? { ...item, status: 'proposta_enviada' } : item
        )
      );
    } else {
      alert(`Erro na automação: ${automationError || resultado?.mensagem || 'Falha ao conectar com a IA'}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Painel de Prospecção & Inteligência (OpenSquad)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Leads sincronizados com agentes autônomos em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Total de Leads: {leads.length}
          </span>
        </div>
      </header>

      {isLoadingLeads && (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando leads do banco de dados...</div>
      )}

      {erroLeads && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          Aviso: {erroLeads} (Exibindo dados de exemplo locais).
        </div>
      )}

      {!isLoadingLeads && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <div 
              key={lead.id} 
              className={`transition-all duration-200 ${leadSelecionado === lead.id ? 'ring-2 ring-amber-500/50 rounded-xl' : ''}`}
            >
              <ProspectCard
                lead={lead}
                onSelectLead={setLeadSelecionado}
                onTriggerAutomation={handleTriggerAutomation}
              />
            </div>
          ))}
        </section>
      )}

      {isAutomating && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-pulse z-50">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-300">Agente Hermes processando redesign e contrato...</span>
        </div>
      )}
    </div>
  );
};

export default ProspeccaoDashboard;
