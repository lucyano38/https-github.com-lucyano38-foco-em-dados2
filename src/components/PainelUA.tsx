import React, { useState, useEffect } from 'react';
import {
  Users, Target, TrendingUp, DollarSign, Activity,
  Zap, TrendingDown, Clock, CheckCircle2, ArrowUpRight,
  RefreshCw, Filter, BarChart3, Bot, AlertCircle, Play
} from 'lucide-react';

// Tipo para métricas consolidadas do painel UA
interface UAMetric {
  label: string;
  value: string | number;
  delta: string;
  deltaType: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface UACampaign {
  id: string;
  nome: string;
  nicho: string;
  status: 'ativo' | 'pausado' | 'concluido' | 'teste';
  leadsGerados: number;
  taxaResposta: number;
  custoTotal: number;
  roi: number;
  ultimaAtividade: string;
}

interface UALeadSource {
  canal: string;
  leads: number;
  taxaConversao: number;
  custoPorLead: number;
  mensagem: string;
}

interface UAStatistical {
  id: string;
  insight: string;
  impacto: 'alto' | 'medio' | 'baixo';
  acao?: string;
}

interface UALead {
  id: string;
  nome: string;
  empresa: string;
  nicho: string;
  origem: string;
  status: 'qualificado' | 'contato' | 'proposta' | 'fechado' | 'perdido';
  valorEstimado: number;
  tempoResposta: string;
  ultimaInteracao: string;
}

const MOCK_METRICS: UAMetric[] = [
  { label: 'Leads no Funil', value: '2.847', delta: '+18.4%', deltaType: 'up', icon: Users, color: '#3b82f6' },
  { label: 'Taxa de Resposta', value: '31.2%', delta: '+4.1pp', deltaType: 'up', icon: Activity, color: '#10b981' },
  { label: 'Custo por Lead', value: 'R$ 2,47', delta: '-12.3%', deltaType: 'down', icon: DollarSign, color: '#f59e0b' },
  { label: 'Propostas Enviadas', value: '342', delta: '+22 de ontem', deltaType: 'up', icon: FileCode, color: '#8b5cf6' },
  { label: 'Leads Qualificados', value: '847', delta: '+9.7%', deltaType: 'up', icon: Target, color: '#06b6d4' },
  { label: 'ROI do Mês', value: '14.8x', delta: '+2.1x vs mês anterior', deltaType: 'up', icon: TrendingUp, color: '#d4a574' },
];

const MOCK_CAMPAIGNS: UACampaign[] = [
  { id: 'c1', nome: 'Barbearias - Google Maps Cold Outreach', nicho: 'Barbearias', status: 'ativo', leadsGerados: 542, taxaResposta: 28.4, custoTotal: 1320, roi: 14.8, ultimaAtividade: 'Hoje às 14:32' },
  { id: 'c2', nome: 'Dentistas - Instagram Hashtag Targeting', nicho: 'Odontologia', status: 'ativo', leadsGerados: 318, taxaResposta: 19.7, custoTotal: 890, roi: 9.2, ultimaAtividade: 'Hoje às 11:15' },
  { id: 'c3', nome: 'Restaurantes - Local SEO + WhatsApp', nicho: 'Gastronomia', status: 'pausado', leadsGerados: 89, taxaResposta: 12.1, custoTotal: 420, roi: 3.4, ultimaAtividade: 'Ontem às 18:44' },
  { id: 'c4', nome: 'Clínicas de Estética - Facebook Lead Ads', nicho: 'Estética', status: 'ativo', leadsGerados: 156, taxaResposta: 33.8, custoTotal: 610, roi: 11.6, ultimaAtividade: 'Hoje às 09:20' },
  { id: 'c5', nome: 'Lojas de Automóveis - Cross-Platform', nicho: 'Automotivo', status: 'teste', leadsGerados: 42, taxaResposta: 8.9, custoTotal: 340, roi: 1.2, ultimaAtividade: '2 dias atrás' },
];

const MOCK_SOURCES: UALeadSource[] = [
  { canal: 'Google Maps (Local)', leads: 1240, taxaConversao: 31.2, custoPorLead: 1.87, mensagem: 'Força principal do funil. Extração + WhatsApp direto.' },
  { canal: 'Instagram Hashtags', leads: 580, taxaConversao: 22.4, custoPorLead: 3.12, mensagem: 'Boa taxa para Nichos Visuais (barbearia, estética).' },
  { canal: 'Facebook Ads (Lead Forms)', leads: 420, taxaConversao: 18.7, custoPorLead: 5.40, mensagem: 'Custo mais alto por lead, mas maior volume.' },
  { canal: 'WhatsApp Groups (Orgânico)', leads: 310, taxaConversao: 45.2, custoPorLead: 0.0, mensagem: 'Mais barato e qualificado, mas escalado manualmente.' },
  { canal: 'Google My Business (GMB)', leads: 297, taxaConversao: 26.1, custoPorLead: 2.20, mensagem: 'Boa taxa para Negócios Locais com Google busca.' },
];

const MOCK_INSIGHTS: UAStatistical[] = [
  { id: 'i1', insight: 'Leads de barbearias têm taxa de resposta 28.4% — 3x acima da média geral.', impacto: 'alto', acao: 'Escalar campanha de barbearias com orçamento extra de R$ 500/mês.' },
  { id: 'i2', insight: 'Custo por lead caiu 12.3% após otimização do Google Maps scraping.', impacto: 'alto', acao: 'Manter atual configuração e monitorar variação semanal.' },
  { id: 'i3', insight: 'Instagram hashtags performam melhor após 18h (taxa +6pp).', impacto: 'medio', acao: 'Agendar disparos automáticos para o horário 18-20h.' },
  { id: 'i4', insight: 'Leads de 레스토랑 têm conversão mais baixa — verificar qualidade da extração.', impacto: 'medio', acao: 'Ajustar filtros de CNAE para gastronomia.' },
  { id: 'i5', insight: 'Leads qualificados pelo Agente Hermes convertem 3x mais em propostas.', impacto: 'alto', acao: 'Expandir uso do agente para pré-qualifying antes de humanos.' },
];

const STATUS_COLORS: Record<string, string> = {
  ativo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pausado: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  concluido: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  teste: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const LEAD_STATUS_COLORS: Record<string, string> = {
  qualificado: 'bg-emerald-500/20 text-emerald-400',
  contato: 'bg-blue-500/20 text-blue-400',
  proposta: 'bg-amber-500/20 text-amber-400',
  fechado: 'bg-emerald-600/30 text-emerald-300',
  perdido: 'bg-red-500/20 text-red-400',
};

export const PainelUA: React.FC = () => {
  const [metrics] = useState<UAMetric[]>(MOCK_METRICS);
  const [campaigns] = useState<UACampaign[]>(MOCK_CAMPAIGNS);
  const [sources] = useState<UALeadSource[]>(MOCK_SOURCES);
  const [insights] = useState<UAStatistical[]>(MOCK_INSIGHTS);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'leads' | 'insights'>('overview');
  const [leads] = useState<UALead[]>(() => [
    { id: 'l1', nome: 'Carlos Oliveira', empresa: 'Barbearia Luxo', nicho: 'Barbearias', origem: 'Google Maps', status: 'qualificado', valorEstimado: 2500, tempoResposta: '2s', ultimaInteracao: 'Hoje 14:32' },
    { id: 'l2', nome: 'Dra. Ana Souza', empresa: 'Clínica Sorriso Perfeito', nicho: 'Odontologia', origem: 'Instagram', status: 'proposta', valorEstimado: 5000, tempoResposta: '1s', ultimaInteracao: 'Hoje 11:15' },
    { id: 'l3', nome: 'Rogério Ferreira', empresa: 'Restaurant Gourmet', nicho: 'Gastronomia', origem: 'WhatsApp Group', status: 'contato', valorEstimado: 1800, tempoResposta: '5s', ultimaInteracao: 'Ontem 18:44' },
    { id: 'l4', nome: 'Mirella Estética', empresa: 'Mirella Skin Bar', nicho: 'Estética', origem: 'Facebook Ads', status: 'fechado', valorEstimado: 3200, tempoResposta: '3s', ultimaInteracao: '2 dias atrás' },
    { id: 'l5', nome: 'Pedro Auto Peças', empresa: 'Auto Peças RD', nicho: 'Automotivo', origem: 'Google Maps', status: 'perdido', valorEstimado: 7500, tempoResposta: '12s', ultimaInteracao: '3 dias atrás' },
  ]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const totalLeads = campaigns.reduce((s, c) => s + c.leadsGerados, 0);
  const avgResposta = campaigns.reduce((s, c) => s + c.taxaResposta, 0) / campaigns.filter(c => c.status !== 'concluido').length;
  const totalCusto = campaigns.reduce((s, c) => s + c.custoTotal, 0);
  const avgRoi = campaigns.filter(c => c.status === 'ativo').reduce((s, c) => s + c.roi, 0) / campaigns.filter(c => c.status === 'ativo').length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f4f4f5] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574] to-[#c89556] flex items-center justify-center shadow-[0_0_15px_rgba(212,165,116,0.3)]">
                <Users className="w-5 h-5 text-[#1c1917]" />
              </div>
              Painel de Aquisição de Usuários
            </h1>
            <p className="text-sm text-[#8a8f98] mt-1">
              Monitoramento unificado de campaigns, leads e performance do funil de aquisição
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>IA Ativa — Agente Hermes operando</span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-5 h-5 ${refreshKey % 2 === 0 ? '' : 'animate-spin'}`} />
            </button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="p-4 rounded-xl bg-[#1e293b]/60 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-[#64748b] font-medium">{m.label}</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}
                >
                  <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold mb-1" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium">
                {m.deltaType === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {m.deltaType === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                {m.delta}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-1 p-1 rounded-xl bg-[#1e293b]/60 border border-white/[0.06] w-fit">
          {([
            { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { key: 'campaigns', label: 'Campanhas', icon: Zap },
            { key: 'leads', label: 'Leads', icon: Users },
            { key: 'insights', label: 'Estatísticas', icon: Activity },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#d4a574]/15 text-[#d4a574] border border-[#d4a574]/20 shadow-sm'
                  : 'text-[#8a8f98] hover:text-[#f4f4f5] hover:bg-white/[0.03]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fontes de Leads */}
            <div className="rounded-xl bg-[#1e293b]/60 border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#d4a574]" />
                  Fontes de Leads
                </h3>
                <Filter className="w-4 h-4 text-[#64748b] cursor-pointer hover:text-[#d4a574] transition-colors" />
              </div>
              <div className="space-y-3">
                {sources.map((s) => (
                  <div key={s.canal} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#d4a574' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#f4f4f5]">{s.canal}</span>
                        <span className="text-xs text-[#8a8f98]">{s.leads} leads</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#d4a574] to-[#c89556] transition-all duration-500"
                          style={{ width: `${(s.leads / Math.max(...sources.map(x => x.leads))) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-[#64748b]">
                        <span>Taxa: {s.taxaConversao}%</span>
                        <span>R$ {s.custoPorLead.toFixed(2)} / lead</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Resumida */}
            <div className="rounded-xl bg-[#1e293b]/60 border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#d4a574]" />
                  Performance Resumida
                </h3>
                <span className="text-[10px] text-[#64748b] bg-white/[0.04] px-2 py-0.5 rounded-full">Últimos 30 dias</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <div className="text-xs text-[#8a8f98] mb-1">Total Leads</div>
                  <div className="text-xl font-bold text-[#d4a574]">{totalLeads.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-400 mt-1">+18.4% vs mês anterior</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <div className="text-xs text-[#8a8f98] mb-1">Taxa Média Resposta</div>
                  <div className="text-xl font-bold text-[#10b981]">{avgResposta.toFixed(1)}%</div>
                  <div className="text-[10px] text-emerald-400 mt-1">+4.1pp vs mês anterior</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <div className="text-xs text-[#8a8f98] mb-1">Custo Total</div>
                  <div className="text-xl font-bold text-[#f59e0b]">R$ {totalCusto.toLocaleString()}</div>
                  <div className="text-[10px] text-red-400 mt-1">-12.3% vs mês anterior</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <div className="text-xs text-[#8a8f98] mb-1">ROI Médio</div>
                  <div className="text-xl font-bold text-[#d4a574]">{avgRoi.toFixed(1)}x</div>
                  <div className="text-[10px] text-emerald-400 mt-1">+2.1x vs mês anterior</div>
                </div>
              </div>
            </div>

            {/* Leads Recentes */}
            <div className="rounded-xl bg-[#1e293b]/60 border border-white/[0.06] p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#d4a574]" />
                  Leads Recentes
                </h3>
                <button
                  onClick={() => setActiveTab('leads')}
                  className="text-xs text-[#d4a574] hover:underline flex items-center gap-1"
                >
                  Ver todos <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-[#64748b] border-b border-white/[0.06]">
                      <th className="text-left py-2 px-2 font-medium">Lead</th>
                      <th className="text-left py-2 px-2 font-medium">Nicho</th>
                      <th className="text-left py-2 px-2 font-medium">Origem</th>
                      <th className="text-left py-2 px-2 font-medium">Status</th>
                      <th className="text-right py-2 px-2 font-medium">Valor</th>
                      <th className="text-right py-2 px-2 font-medium">Resposta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-2">
                          <div className="font-medium text-[#f4f4f5]">{lead.nome}</div>
                          <div className="text-[10px] text-[#64748b]">{lead.empresa}</div>
                        </td>
                        <td className="py-2.5 px-2 text-[#8a8f98]">{lead.nicho}</td>
                        <td className="py-2.5 px-2 text-[#8a8f98]">{lead.origem}</td>
                        <td className="py-2.5 px-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${LEAD_STATUS_COLORS[lead.status]}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-[#d4a574]">R$ {lead.valorEstimado.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right text-[#8a8f98]">{lead.tempoResposta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div>
            <div className="rounded-xl bg-[#1e293b]/60 border border-white/[0.06] overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#d4a574]" />
                  Campanhas Ativas
                </h3>
                <button className="text-xs text-[#d4a574] hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Criar Campanha
                </button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${c.status === 'ativo' ? 'bg-emerald-400 animate-pulse' : c.status === 'teste' ? 'bg-blue-400' : 'bg-amber-400'}`}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-[#f4f4f5] truncate">{c.nome}</div>
                        <div className="text-[10px] text-[#64748b]">{c.nicho} • {c.ultimaAtividade}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 text-sm shrink-0">
                      <div className="text-center">
                        <div className="text-xs text-[#8a8f98]">Leads</div>
                        <div className="font-bold text-[#d4a574]">{c.leadsGerados}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-[#8a8f98]">Resposta</div>
                        <div className={`font-bold ${c.taxaResposta > 20 ? 'text-emerald-400' : c.taxaResposta > 10 ? 'text-amber-400' : 'text-red-400'}`}>
                          {c.taxaResposta}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-[#8a8f98]">Custo</div>
                        <div className="font-bold text-[#f4f4f5]">R$ {c.custoTotal.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-[#8a8f98]">ROI</div>
                        <div className={`font-bold ${c.roi > 5 ? 'text-emerald-400' : c.roi > 1 ? 'text-amber-400' : 'text-red-400'}`}>
                          {c.roi}x
                        </div>
                      </div>
                      <div className="h-6">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[c.status]}`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div>
            <div className="rounded-xl bg-[#1e293b]/60 border border-white/[0.06] overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#d4a574]" />
                  Todos os Leads
                </h3>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#64748b] cursor-pointer hover:text-[#d4a574] transition-colors" />
                  <button className="text-xs text-[#d4a574] hover:underline flex items-center gap-1">
                    <Search className="w-3 h-3" /> Filtrar
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-[#64748b] border-b border-white/[0.06]">
                      <th className="text-left py-2 px-3 font-medium">Lead</th>
                      <th className="text-left py-2 px-3 font-medium">Nicho</th>
                      <th className="text-left py-2 px-3 font-medium">Origem</th>
                      <th className="text-left py-2 px-3 font-medium">Status</th>
                      <th className="text-right py-2 px-3 font-medium">Valor Est.</th>
                      <th className="text-right py-2 px-3 font-medium">Tempo Resp.</th>
                      <th className="text-right py-2 px-3 font-medium">Última Interação</th>
                      <th className="text-center py-2 px-3 font-medium">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-[#f4f4f5]">{lead.nome}</div>
                          <div className="text-[10px] text-[#64748b]">{lead.empresa}</div>
                        </td>
                        <td className="py-2.5 px-3 text-[#8a8f98]">{lead.nicho}</td>
                        <td className="py-2.5 px-3 text-[#8a8f98]">{lead.origem}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${LEAD_STATUS_COLORS[lead.status]}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-[#d4a574]">R$ {lead.valorEstimado.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-[#8a8f98]">{lead.tempoResposta}</td>
                        <td className="py-2.5 px-3 text-right text-[#8a8f98]">{lead.ultimaInteracao}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button className="p-1.5 rounded-lg hover:bg-[#d4a574]/10 transition-colors" title="Ver detalhes">
                            <ArrowUpRight className="w-4 h-4 text-[#d4a574]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`rounded-xl p-4 border transition-all ${
                  insight.impacto === 'alto'
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30'
                    : insight.impacto === 'medio'
                    ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {insight.impacto === 'alto' && <AlertCircle className="w-4 h-4 text-emerald-400" />}
                    {insight.impacto === 'medio' && <Activity className="w-4 h-4 text-amber-400" />}
                    {insight.impacto === 'baixo' && <BarChart3 className="w-4 h-4 text-[#64748b]" />}
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${
                      insight.impacto === 'alto' ? 'text-emerald-400' :
                      insight.impacto === 'medio' ? 'text-amber-400' : 'text-[#64748b]'
                    }`}>
                      {insight.impacto}
                    </span>
                  </div>
                  {insight.acao && (
                    <button className="text-[10px] text-[#d4a574] hover:underline flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Ação
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#f4f4f5] leading-relaxed mb-2">{insight.insight}</p>
                {insight.acao && (
                  <p className="text-[11px] text-[#8a8f98] bg-white/[0.03] rounded-lg p-2">
                    <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-400" />
                    {insight.acao}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[#64748b]">
        <span>Foco em Dados — Painel UA v1.0</span>
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          Agente Hermes processando em tempo real
        </span>
      </div>
    </div>
  );
};
