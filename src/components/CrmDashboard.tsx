import React, { useState } from 'react';
import { 
  Users, FileText, CheckCircle2, TrendingUp, DollarSign, 
  Search, Plus, Filter, ArrowRight, Building2, Phone, Mail, Sparkles 
} from 'lucide-react';

interface LeadItem {
  id: string;
  nome: string;
  nicho: string;
  telefone: string;
  email: string;
  estagio: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'fechado';
  valor: number;
  criadoEm: string;
}

const LEADS_INICIAIS: LeadItem[] = [
  { id: '1', nome: 'Clínica Sorriso Perfeito', nicho: 'Saúde e Odontologia', telefone: '(11) 98888-1111', email: 'contato@sorrisoperfeito.com', estagio: 'novo', valor: 2500, criadoEm: 'Hoje' },
  { id: '2', nome: 'Auto Peças Rodagem', nicho: 'Automotivo', telefone: '(11) 97777-2222', email: 'vendas@rodagempecas.com', estagio: 'contato', valor: 1800, criadoEm: 'Ontem' },
  { id: '3', nome: 'Empório dos Doces', nicho: 'Confeitaria', telefone: '(11) 96666-3333', email: 'contato@emporiodoces.com', estagio: 'proposta', valor: 3200, criadoEm: 'Há 3 dias' },
  { id: '4', nome: 'Construtora Horizonte', nicho: 'Imobiliária', telefone: '(11) 95555-4444', email: 'diretoria@horizonte.com', estagio: 'fechado', valor: 7500, criadoEm: 'Há 5 dias' }
];

export const CrmDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visao' | 'pipeline' | 'clientes' | 'contratos' | 'financeiro'>('pipeline');
  const [leads, setLeads] = useState<LeadItem[]>(() => {
    try {
      const salvo = localStorage.getItem('foco_crm_leads');
      return salvo ? JSON.parse(salvo) : LEADS_INICIAIS;
    } catch {
      return LEADS_INICIAIS;
    }
  });
  const [filtroEstagio, setFiltroEstagio] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');

  const estagios = [
    { id: 'novo', label: 'Novo Lead', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { id: 'contato', label: 'Contato', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    { id: 'proposta', label: 'Proposta', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'negociacao', label: 'Negociação', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { id: 'fechado', label: 'Fechado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  ];

  // Métricas simplificadas (sem ARR, churn ou D3)
  const leadsAtivos = leads.filter(l => l.estagio !== 'fechado').length;
  const propostasEnviadas = leads.filter(l => l.estagio === 'proposta' || l.estagio === 'negociacao').length;
  const clientesAtivos = leads.filter(l => l.estagio === 'fechado').length;
  const receitaMes = leads.filter(l => l.estagio === 'fechado').reduce((acc, curr) => acc + curr.valor, 0);
  const taxaConversao = leads.length > 0 ? ((clientesAtivos / leads.length) * 100).toFixed(1) : '0';

  const moverEstagio = (id: string, novoEstagio: LeadItem['estagio']) => {
    setLeads(prev => {
      const atualizado = prev.map(l => l.id === id ? { ...l, estagio: novoEstagio } : l);
      localStorage.setItem('foco_crm_leads', JSON.stringify(atualizado));
      return atualizado;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      
      {/* HEADER DO CRM COMERCIAL */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">CRM Comercial</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Gestão de Relacionamento & Vendas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Armazenamento centralizado de leads enviados pelo OpenSquad e fechamento de contratos.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('visao')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'visao' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Visão Geral</button>
          <button onClick={() => setActiveTab('pipeline')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'pipeline' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Pipeline</button>
          <button onClick={() => setActiveTab('clientes')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'clientes' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Clientes</button>
          <button onClick={() => setActiveTab('contratos')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'contratos' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Contratos</button>
          <button onClick={() => setActiveTab('financeiro')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'financeiro' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Financeiro</button>
        </div>
      </div>

      {/* MÉTRICAS SIMPLIFICADAS E DIRETAS AO PONTO */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-slate-400 font-medium">Leads Ativos</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{leadsAtivos}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-slate-400 font-medium">Propostas Enviadas</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{propostasEnviadas}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-slate-400 font-medium">Clientes Ativos</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{clientesAtivos}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-slate-400 font-medium">Conversão</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">{taxaConversao}%</div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-slate-400 font-medium">Receita do Mês</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">R$ {receitaMes.toLocaleString('pt-BR')}</div>
        </div>
      </div>

      {/* ABA PIPELINE (KANBAN SIMPLIFICADO) */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar lead ou nicho..."
                  className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500 w-64"
                />
              </div>
            </div>
            <div className="text-xs text-slate-400">
              💡 Os leads são enviados automaticamente pelo <strong>OpenSquad AI</strong>.
            </div>
          </div>

          {/* COLUNAS DO KANBAN */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
            {estagios.map(estagio => {
              const leadsNaColuna = leads.filter(l => l.estagio === estagio.id && (l.nome.toLowerCase().includes(busca.toLowerCase()) || l.nicho.toLowerCase().includes(busca.toLowerCase())));
              
              return (
                <div key={estagio.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 min-h-[500px] flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${estagios.find(e => e.id === estagio.id)?.color}`}>
                      {estagio.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full">{leadsNaColuna.length}</span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {leadsNaColuna.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-600 border border-dashed border-slate-800/60 rounded-xl">
                        Nenhum lead
                      </div>
                    ) : (
                      leadsNaColuna.map(lead => (
                        <div key={lead.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-lg space-y-2.5 transition group">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-bold text-white">{lead.nome}</h4>
                            <span className="text-[10px] text-amber-400 font-mono">R$ {lead.valor}</span>
                          </div>
                          <p className="text-xs text-slate-400">Nicho: {lead.nicho}</p>
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">{lead.criadoEm}</span>
                            <select
                              value={lead.estagio}
                              onChange={(e) => moverEstagio(lead.id, e.target.value as any)}
                              className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded-lg px-2 py-1 outline-none cursor-pointer"
                            >
                              <option value="novo">Novo</option>
                              <option value="contato">Contato</option>
                              <option value="proposta">Proposta</option>
                              <option value="negociacao">Negociação</option>
                              <option value="fechado">Fechado</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OUTRAS ABAS (VISÃO GERAL, CLIENTES, CONTRATOS, FINANCEIRO) */}
      {activeTab !== 'pipeline' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Módulo {activeTab.toUpperCase()} Organizado</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Gerenciamento simplificado de contratos e histórico financeiro dos clientes fechados via OpenSquad.
          </p>
        </div>
      )}

    </div>
  );
};

export default CrmDashboard;
