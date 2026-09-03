import React, { useState } from 'react';
import { 
  Users, FileText, CheckCircle2, TrendingUp, DollarSign, 
  Search, Plus, Filter, ArrowRight, Building2, Phone, Mail, Sparkles, Send, Download, Eye, Calendar, Clock, AlertCircle
} from 'lucide-react';

interface LeadItem {
  id: string;
  nomeEmpresa: string;
  responsavel: string;
  telefone: string;
  whatsapp: string;
  estagio: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';
  valor: number;
  proximaAcao: string;
  ultimoContato: string;
}

interface ClienteItem {
  id: string;
  empresa: string;
  responsavel: string;
  telefone: string;
  plano: string;
  valorMensal: number;
  dataEntrada: string;
  status: 'Ativo' | 'Inativo';
}

interface ContratoItem {
  id: string;
  empresa: string;
  tipo: string;
  valor: number;
  status: 'Ativo' | 'Pendente' | 'Expirando';
}

const LEADS_INICIAIS: LeadItem[] = [
  { id: '1', nomeEmpresa: 'Clínica Sorriso Perfeito', responsavel: 'Dra. Ana', telefone: '(11) 98888-1111', whatsapp: '(11) 98888-1111', estagio: 'novo', valor: 2500, proximaAcao: 'Enviar apresentação', ultimoContato: 'Hoje' },
  { id: '2', nomeEmpresa: 'Auto Peças Rodagem', responsavel: 'Carlos Silva', telefone: '(11) 97777-2222', whatsapp: '(11) 97777-2222', estagio: 'contato', valor: 1800, proximaAcao: 'Ligar para validar dor', ultimoContato: 'Ontem' },
  { id: '3', nomeEmpresa: 'Empório dos Doces', responsavel: 'Mariana Dias', telefone: '(11) 96666-3333', whatsapp: '(11) 96666-3333', estagio: 'proposta', valor: 3200, proximaAcao: 'Aguardando feedback da proposta', ultimoContato: 'Há 2 dias' },
  { id: '4', nomeEmpresa: 'Construtora Horizonte', responsavel: 'Roberto Mendes', telefone: '(11) 95555-4444', whatsapp: '(11) 95555-4444', estagio: 'negociacao', valor: 7500, proximaAcao: 'Ajustar escopo de contrato', ultimoContato: 'Hoje' }
];

const CLIENTES_INICIAIS: ClienteItem[] = [
  { id: 'c1', empresa: 'Tech Soluções', responsavel: 'Felipe Rocha', telefone: '(11) 94444-5555', plano: 'PRO R$ 39,90', valorMensal: 39.90, dataEntrada: '10/01/2025', status: 'Ativo' },
  { id: 'c2', empresa: 'Bistrô Sabor & Arte', responsavel: 'Camila', telefone: '(11) 93333-6666', plano: 'PRO R$ 39,90', valorMensal: 39.90, dataEntrada: '15/02/2025', status: 'Ativo' }
];

const CONTRATOS_INICIAIS: ContratoItem[] = [
  { id: 'ct1', empresa: 'Construtora Horizonte', tipo: 'Redesign + Prospecção', valor: 7500, status: 'Pendente' },
  { id: 'ct2', empresa: 'Tech Soluções', tipo: 'Acesso PRO SaaS', valor: 39.90, status: 'Ativo' },
  { id: 'ct3', empresa: 'Bistrô Sabor & Arte', tipo: 'Acesso PRO SaaS', valor: 39.90, status: 'Ativo' }
];

export const CrmDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visao' | 'pipeline' | 'clientes' | 'contratos' | 'financeiro'>('pipeline');
  const [leads, setLeads] = useState<LeadItem[]>(LEADS_INICIAIS);
  const [clientes, setClientes] = useState<ClienteItem[]>(CLIENTES_INICIAIS);
  const [contratos, setContratos] = useState<ContratoItem[]>(CONTRATOS_INICIAIS);
  const [busca, setBusca] = useState<string>('');
  const [showAvancado, setShowAvancado] = useState<boolean>(false);

  const estagios = [
    { id: 'novo', label: 'Novo Lead', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { id: 'contato', label: 'Contato Iniciado', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    { id: 'proposta', label: 'Proposta Enviada', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'negociacao', label: 'Negociação', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { id: 'fechado', label: 'Fechado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'perdido', label: 'Perdido', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
  ];

  // Métricas essenciais simplificadas
  const leadsAtivos = leads.filter(l => l.estagio !== 'fechado' && l.estagio !== 'perdido').length;
  const propostasEnviadas = leads.filter(l => l.estagio === 'proposta' || l.estagio === 'negociacao').length;
  const clientesAtivosCount = clientes.filter(c => c.status === 'Ativo').length;
  const receitaMes = clientes.reduce((acc, curr) => acc + curr.valorMensal, 0) + leads.filter(l => l.estagio === 'fechado').reduce((a, b) => a + b.valor, 0);
  const receitaRecorrente = clientes.reduce((acc, curr) => acc + curr.valorMensal, 0);
  const taxaConversao = leads.length > 0 ? ((leads.filter(l => l.estagio === 'fechado').length / leads.length) * 100).toFixed(1) : '0';

  const moverEstagio = (id: string, novoEstagio: LeadItem['estagio']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estagio: novoEstagio } : l));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      
      {/* HEADER DO CRM COMERCIAL */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">CRM Comercial</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Gerencie seus contatos, propostas, clientes e receitas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resultados enviados automaticamente pelo OpenSquad. Simples, rápido e intuitivo.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
          <button onClick={() => setActiveTab('visao')} className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'visao' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Visão Geral</button>
          <button onClick={() => setActiveTab('pipeline')} className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'pipeline' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Pipeline</button>
          <button onClick={() => setActiveTab('clientes')} className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'clientes' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Clientes</button>
          <button onClick={() => setActiveTab('contratos')} className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'contratos' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Contratos</button>
          <button onClick={() => setActiveTab('financeiro')} className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'financeiro' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>Financeiro</button>
        </div>
      </div>

      {/* VISÃO GERAL (APENAS 6 INDICADORES ESSENCIAIS) */}
      {activeTab === 'visao' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{clientesAtivosCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="text-xs text-slate-400 font-medium">Taxa de Conversão</div>
              <div className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">{taxaConversao}%</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="text-xs text-slate-400 font-medium">Receita do Mês</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">R$ {receitaMes.toLocaleString('pt-BR')}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="text-xs text-slate-400 font-medium">Receita Recorrente</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">R$ {receitaRecorrente.toLocaleString('pt-BR')}</div>
            </div>
          </div>

          {/* ANÁLISE INTELIGENTE (SUGESTÕES SIMPLES) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4" /> Análise Inteligente (Sugestões para Hoje)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold block">1. Entrar em contato</span>
                <p className="text-slate-300">Empório dos Doces está há 2 dias sem retorno sobre a proposta enviada.</p>
                <button onClick={() => alert('Abrindo WhatsApp para contato...')} className="text-xs text-amber-400 underline font-semibold cursor-pointer">Enviar WhatsApp →</button>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-blue-400 font-bold block">2. Enviar proposta</span>
                <p className="text-slate-300">Clínica Sorriso Perfeito foi prospectada. O Agente Hermes gerou a prévia.</p>
                <button onClick={() => alert('Enviando proposta por e-mail...')} className="text-xs text-blue-400 underline font-semibold cursor-pointer">Disparar Proposta →</button>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block">3. Agendar follow-up</span>
                <p className="text-slate-300">Construtora Horizonte está em negociação final de contrato.</p>
                <button onClick={() => alert('Agendamento de reunião ativado.')} className="text-xs text-emerald-400 underline font-semibold cursor-pointer">Agendar Retorno →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA PIPELINE (KANBAN SIMPLIFICADO) */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar empresa ou responsável..."
                className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500 w-72"
              />
            </div>
            <span className="text-xs text-slate-400">💡 Arraste ou altere o estágio de cada oportunidade no cartão.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 overflow-x-auto pb-4 items-start">
            {estagios.map(estagio => {
              const leadsNaColuna = leads.filter(l => l.estagio === estagio.id && (l.nomeEmpresa.toLowerCase().includes(busca.toLowerCase()) || l.responsavel.toLowerCase().includes(busca.toLowerCase())));
              
              return (
                <div key={estagio.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 min-h-[500px] flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${estagio.color}`}>
                      {estagio.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{leadsNaColuna.length}</span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {leadsNaColuna.length === 0 ? (
                      <div className="text-center py-10 text-[11px] text-slate-600 border border-dashed border-slate-800 rounded-xl">
                        Vazio
                      </div>
                    ) : (
                      leadsNaColuna.map(lead => (
                        <div key={lead.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-lg space-y-2.5 transition">
                          <h4 className="text-xs font-bold text-white truncate">{lead.nomeEmpresa}</h4>
                          <div className="text-[11px] text-slate-400">Resp: <span className="text-slate-200">{lead.responsavel}</span></div>
                          <div className="text-[11px] text-amber-400 font-mono">R$ {lead.valor.toLocaleString('pt-BR')}</div>
                          <div className="text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                            <strong>Ação:</strong> {lead.proximaAcao}
                          </div>
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">{lead.ultimoContato}</span>
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
                              <option value="perdido">Perdido</option>
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

      {/* ABA CLIENTES */}
      {activeTab === 'clientes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-white">Clientes Ativos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="pb-3">Empresa</th>
                  <th className="pb-3">Responsável</th>
                  <th className="pb-3">Telefone</th>
                  <th className="pb-3">Plano</th>
                  <th className="pb-3">Valor Mensal</th>
                  <th className="pb-3">Entrada</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clientes.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-white">{c.empresa}</td>
                    <td className="py-3">{c.responsavel}</td>
                    <td className="py-3 font-mono text-slate-400">{c.telefone}</td>
                    <td className="py-3 text-amber-400">{c.plano}</td>
                    <td className="py-3 font-mono">R$ {c.valorMensal.toFixed(2)}</td>
                    <td className="py-3">{c.dataEntrada}</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA CONTRATOS */}
      {activeTab === 'contratos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-white">Contratos Gerados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contratos.map(ct => (
              <div key={ct.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">{ct.empresa}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{ct.tipo}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${ct.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {ct.status}
                  </span>
                </div>
                <div className="text-sm font-mono font-bold text-amber-400">R$ {ct.valor.toLocaleString('pt-BR')}</div>
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800 flex-wrap">
                  <button onClick={() => alert('Visualizando PDF do contrato...')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl cursor-pointer flex items-center gap-1"><Eye className="w-3 h-3" /> Visualizar</button>
                  <button onClick={() => alert('Baixando PDF...')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl cursor-pointer flex items-center gap-1"><Download className="w-3 h-3" /> Baixar PDF</button>
                  <button onClick={() => alert('Enviando via WhatsApp...')} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 text-xs rounded-xl cursor-pointer flex items-center gap-1"><Send className="w-3 h-3" /> WhatsApp</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA FINANCEIRO */}
      {activeTab === 'financeiro' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400">Receita do Mês</span>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">R$ {receitaMes.toLocaleString('pt-BR')}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400">Receita Acumulada</span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">R$ {(receitaMes * 3).toLocaleString('pt-BR')}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400">Mensalidades Ativas</span>
              <div className="text-3xl font-extrabold text-blue-400 font-mono">{clientes.length} assinantes</div>
            </div>
          </div>

          <div className="pt-4">
            <button onClick={() => setShowAvancado(!showAvancado)} className="text-xs text-amber-400 underline font-semibold cursor-pointer">
              {showAvancado ? 'Ocultar Análises Avançadas' : 'Ver Análises Avançadas (Opcional) →'}
            </button>
            {showAvancado && (
              <div className="mt-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-xs text-slate-400 space-y-2">
                <div className="text-white font-bold mb-1">Métricas Avançadas de Operação</div>
                <p>Projeção de LTV (Lifetime Value) estimada em R$ 1.420 por cliente ativo.</p>
                <p>Taxa de inadimplência atual: 0.0% (Cobrança automatizada via Stripe).</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CrmDashboard;
