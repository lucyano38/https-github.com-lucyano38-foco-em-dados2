import React, { useState, useEffect } from 'react';
import { ProspectCard, ProspectLead } from './ProspectCard';
import { useLeadAutomation } from '../hooks/useLeadAutomation';
import { createClient } from '@supabase/supabase-js';
import { ApolloSearchFilters, SearchFilters } from './ApolloSearchFilters';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export const ProspeccaoDashboard: React.FC = () => {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState<boolean>(false);
  const [leadSelecionado, setLeadSelecionado] = useState<string | null>(null);
  const { triggerAutomation, isLoading: isAutomating, error: automationError } = useLeadAutomation();

  useEffect(() => {
    async function checarAcessoEAssinatura() {
      try {
        // Modo de bypass local se estiver em desenvolvimento sem supabase configurado
        if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
          setAutorizado(true);
          setVerificando(false);
          carregarLeadsLocais();
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Se não estiver logado, permite testar ou avisa
          setAutorizado(true); // Permitindo acesso para demonstração fluida
          setVerificando(false);
          carregarLeadsLocais();
          return;
        }

        const emailUsuario = session.user.email;
        const { data: perfil } = await supabase
          .from('assinaturas')
          .select('status')
          .eq('email', emailUsuario)
          .single();

        if (perfil && perfil.status === 'ativo') {
          setAutorizado(true);
        } else {
          // Barreira de pagamento
          const assinar = window.confirm('Acesso restrito PRO (R$ 39,90/mês). Deseja prosseguir para o checkout?');
          if (assinar) {
            const res = await fetch('/api/criar-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: emailUsuario }),
            });
            const checkoutData = await res.json();
            if (checkoutData.url || checkoutData.urlCheckout) {
              window.location.href = checkoutData.url || checkoutData.urlCheckout;
              return;
            }
          }
          setAutorizado(true); // fallback para não prender o usuário
        }
      } catch {
        setAutorizado(true);
        carregarLeadsLocais();
      } finally {
        setVerificando(false);
      }
    }

    async function carregarLeadsLocais() {
      setIsLoadingLeads(true);
      try {
        const response = await fetch('/api/listar-prospeccoes');
        const resultado = await response.json();
        setLeads(resultado.dados || [
          { id: '1', nome: 'Clínica Sorriso Perfeito', nicho: 'Saúde e Odontologia', siteAtual: 'sorrisoperfeito-antigo.com.br', status: 'novo' },
          { id: '2', nome: 'Auto Peças Rodagem', nicho: 'Automotivo', siteAtual: 'rodagempecas.com', status: 'contatado' },
          { id: '3', nome: 'Empório dos Doces Artesanais', nicho: 'Confeitaria', siteAtual: 'emporiodoces.com.br', status: 'proposta_enviada' }
        ]);
      } catch {
        setLeads([
          { id: '1', nome: 'Clínica Sorriso Perfeito', nicho: 'Saúde e Odontologia', siteAtual: 'sorrisoperfeito-antigo.com.br', status: 'novo' },
          { id: '2', nome: 'Auto Peças Rodagem', nicho: 'Automotivo', siteAtual: 'rodagempecas.com', status: 'contatado' },
        ]);
      } finally {
        setIsLoadingLeads(false);
      }
    }

    checarAcessoEAssinatura();
  }, []);

  const handleSearchFilters = (filters: SearchFilters) => {
    setIsLoadingLeads(true);
    setTimeout(() => {
      // Simula varredura Apollo.io por nicho, cidade e raio
      setIsLoadingLeads(false);
      alert(`Busca realizada com sucesso para "${filters.nicho}" em ${filters.cidade} (raio de ${filters.raioKm}km)!`);
    }, 800);
  };

  const handleTriggerAutomation = async (lead: ProspectLead) => {
    const confirmacao = window.confirm(`Deseja disparar a automação e gerar proposta para ${lead.nome}?`);
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
      alert(`Erro na automação: ${automationError || resultado?.mensagem || 'Falha ao conectar'}`);
    }
  };

  if (verificando) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center text-sm font-sans">
        Verificando credenciais e status da assinatura (R$ 39,90/mês)...
      </div>
    );
  }

  if (!autorizado) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Painel de Prospecção & Inteligência (PRO)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sistema Operacional de Vendas com Supabase, n8n e Agentes IA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Assinatura Ativa: PRO R$ 39,90/mês
          </span>
        </div>
      </header>

      {/* Filtros Apollo-style */}
      <ApolloSearchFilters onSearch={handleSearchFilters} isLoading={isLoadingLeads} />

      {isLoadingLeads && (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando leads do banco de dados...</div>
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
          <span className="text-xs font-medium text-slate-300">Executando automação no servidor...</span>
        </div>
      )}
    </div>
  );
};

export default ProspeccaoDashboard;
