import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Kanban,
  Users,
  LayoutGrid,
  Columns2,
  Bell,
  FileCheck2,
  DollarSign,
  Settings,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Mail,
  Edit,
  Trash2,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Database,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Zap,
  Send,
} from 'lucide-react';
import {
  Lead,
  LeadStatus,
  AppConfig,
  CrmAuditResult,
  ContratanteConfig,
} from '../types';
import { ContractModal } from './ContractModal';
import { DraftContractModal } from './DraftContractModal';
import { MrrForecastVisualization } from './MrrForecastVisualization';
import { OpenSquadView } from './OpenSquadView';
import { RedesignTunnelView } from './RedesignTunnelView';
import { TunnelShareModal } from './TunnelShareModal';
import {
  fetchCrmLeadsFromFirestore,
  saveCrmLeadToFirestore,
  deleteCrmLeadFromFirestore,
} from '../lib/firebaseCrm';

interface CrmDashboardProps {
  onSendToDataAnalyst?: (csvContent: string, datasetName: string) => void;
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  novo: { label: 'Novo Lead', color: 'text-serenity-charcoal', bg: 'bg-serenity-cream', border: 'border-serenity-charcoal/20' },
  redesenhado: { label: 'Redesenhado', color: 'text-serenity-rose', bg: 'bg-serenity-rose/10', border: 'border-serenity-rose/30' },
  publicado: { label: 'Publicado', color: 'text-serenity-sage', bg: 'bg-serenity-sage/10', border: 'border-serenity-sage/30' },
  proposta: { label: 'Proposta Enviada', color: 'text-serenity-gold', bg: 'bg-serenity-gold/10', border: 'border-serenity-gold/30' },
  respondeu: { label: 'Respondeu', color: 'text-serenity-charcoal', bg: 'bg-serenity-cream', border: 'border-serenity-charcoal/20' },
  fechado: { label: 'Fechado', color: 'text-serenity-sage', bg: 'bg-serenity-sage/10', border: 'border-serenity-sage/30' },
  descartado: { label: 'Descartado', color: 'text-serenity-charcoal', bg: 'bg-neutral-100', border: 'border-neutral-300' },
};

const KANBAN_COLUMNS: LeadStatus[] = [
  'novo',
  'redesenhado',
  'publicado',
  'proposta',
  'respondeu',
  'fechado',
];

export const CrmDashboard: React.FC<CrmDashboardProps> = ({ onSendToDataAnalyst }) => {
  const [view, setView] = useState<
    | 'geral'
    | 'opensquad'
    | 'pipeline'
    | 'clientes'
    | 'tunnel'
    | 'sites'
    | 'comparador'
    | 'followup'
    | 'contratos'
    | 'financeiro'
    | 'mrr_forecast'
    | 'ia_audit'
    | 'config'
  >('geral');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<keyof Lead>('nome');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit / Add Modal
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Contract Modal
  const [contractLead, setContractLead] = useState<Lead | null>(null);
  const [draftContractLead, setDraftContractLead] = useState<Lead | null>(null);

  // Tunnel Share Modal
  const [tunnelShareLead, setTunnelShareLead] = useState<Lead | null>(null);

  // Comparador selected slug
  const [selectedCmpSlug, setSelectedCmpSlug] = useState<string | null>(null);

  // AI Audit State
  const [aiAudit, setAiAudit] = useState<CrmAuditResult | null>(null);
  const [auditing, setAuditing] = useState(false);

  // Drag & drop state
  const [draggedSlug, setDraggedSlug] = useState<string | null>(null);

  // Fetch leads and config
  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsData, configRes] = await Promise.all([
        fetchCrmLeadsFromFirestore().catch(() => [] as Lead[]),
        fetch('/api/config').catch(() => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })),
      ]);
      if (Array.isArray(leadsData)) {
        setLeads(leadsData);
      }
      const ct = (configRes.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        const configData = await configRes.json().catch(() => null);
        if (configData) setConfig(configData);
      }
    } catch (err) {
      console.error('Error fetching CRM data:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const daysSince = (dateStr?: string) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr + 'T12:00:00').getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        (l.nome || '').toLowerCase().includes(q) ||
        (l.nicho || '').toLowerCase().includes(q) ||
        (l.cidade || '').toLowerCase().includes(q) ||
        (l.status || '').toLowerCase().includes(q) ||
        (l.motivo || '').toLowerCase().includes(q)
    );
  }, [leads, search]);

  const activeLeads = useMemo(() => {
    return filteredLeads.filter((l) => l.status !== 'descartado');
  }, [filteredLeads]);

  const followUpLeads = useMemo(() => {
    return filteredLeads.filter(
      (l) => l.status === 'proposta' && daysSince(l.dataProposta) >= 4
    );
  }, [filteredLeads]);

  const closedLeads = useMemo(() => {
    return filteredLeads.filter((l) => l.status === 'fechado');
  }, [filteredLeads]);

  const redesignLeads = useMemo(() => {
    return filteredLeads.filter((l) =>
      ['redesenhado', 'publicado', 'proposta', 'respondeu', 'fechado'].includes(
        l.status
      )
    );
  }, [filteredLeads]);

  // Financial Stats
  const revenueClosed = useMemo(() => {
    return closedLeads.reduce((sum, l) => sum + (l.valor || 0), 0);
  }, [closedLeads]);

  const revenueReceived = useMemo(() => {
    return closedLeads
      .filter((l) => l.pago)
      .reduce((sum, l) => sum + (l.valor || 0), 0);
  }, [closedLeads]);

  const revenuePending = useMemo(() => {
    return closedLeads
      .filter((l) => !l.pago)
      .reduce((sum, l) => sum + (l.valor || 0), 0);
  }, [closedLeads]);

  const mrr = useMemo(() => {
    return closedLeads.reduce((sum, l) => sum + (l.manutencao || 0), 0);
  }, [closedLeads]);

  // Save Lead Updates
  const handleSaveLead = async (leadData: Partial<Lead>) => {
    try {
      const slug = leadData.slug || editingLead?.slug || `lead-${Date.now()}`;
      const payload = { ...editingLead, ...leadData, slug } as Lead;
      const saved = await saveCrmLeadToFirestore(payload);
      setLeads((prev) => {
        const idx = prev.findIndex((l) => l.slug === saved.slug);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
      setIsModalOpen(false);
      setEditingLead(null);
    } catch (err) {
      console.error('Error saving lead:', err);
    }
  };

  const handleDeleteLead = async (slug: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lead do CRM?')) return;
    try {
      await deleteCrmLeadFromFirestore(slug);
      setLeads((prev) => prev.filter((l) => l.slug !== slug));
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  // Drag and Drop
  const handleDragStart = (slug: string) => {
    setDraggedSlug(slug);
  };

  const handleDrop = async (targetStatus: LeadStatus) => {
    if (!draggedSlug) return;
    const targetLead = leads.find((l) => l.slug === draggedSlug);
    if (!targetLead) return;

    let valor = targetLead.valor;
    if (targetStatus === 'fechado' && !valor) {
      const input = window.prompt('Lead fechado! Qual o valor total acordado (R$)?', '850');
      if (input) valor = parseFloat(input) || 850;
    }

    let dataProposta = targetLead.dataProposta;
    if (targetStatus === 'proposta' && !dataProposta) {
      dataProposta = new Date().toISOString().split('T')[0];
    }

    const updated = {
      ...targetLead,
      status: targetStatus,
      valor,
      dataProposta,
    } as Lead;

    setLeads((prev) =>
      prev.map((l) => (l.slug === draggedSlug ? updated : l))
    );
    setDraggedSlug(null);

    await saveCrmLeadToFirestore(updated);
  };

  // Run AI Audit on Pipeline
  const runAiAudit = async () => {
    try {
      setAuditing(true);
      const res = await fetch('/api/crm/ai-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      });
      const data = await res.json();
      setAiAudit(data);
      setView('ia_audit');
    } catch (err) {
      console.error('Error auditing CRM with AI:', err);
    } finally {
      setAuditing(false);
    }
  };

  // Export to Data Analyst
  const handleAnalyzeWithAgent = async () => {
    try {
      const res = await fetch('/api/crm/export-csv');
      const csvText = await res.text();
      if (onSendToDataAnalyst) {
        onSendToDataAnalyst(csvText, 'Pipeline Comercial Prospector');
      }
    } catch (err) {
      console.error('Error exporting to data analyst:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-100 text-neutral-900 overflow-hidden font-sans">
      {/* Top Header Controls */}
      <div className="bg-white border-b border-serenity-rose/20 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-serenity-rose to-serenity-gold text-white flex items-center justify-center shadow-xs">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-900 tracking-tight">
                Prospector CRM & Pipeline
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Conectado
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Prospecção ativa, pipeline comercial, contratos e financeiro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={runAiAudit}
            disabled={auditing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-black text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Sparkles className={`w-3.5 h-3.5 ${auditing ? 'animate-spin' : 'text-amber-300'}`} />
            {auditing ? 'Auditando...' : 'Diagnóstico IA Gemini'}
          </button>

          <button
            onClick={handleAnalyzeWithAgent}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl border border-neutral-200 shadow-2xs transition"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            Analisar no BI
          </button>

          <a
            href="/api/crm/export-csv"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl border border-neutral-200 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </a>

          <button
            onClick={() => {
              setEditingLead({
                slug: `lead-${Date.now()}`,
                nome: '',
                nicho: '',
                cidade: '',
                status: 'novo',
                pago: 0,
                contratoStatus: 'pendente',
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Main App Layout: Sidebar Tabs + View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-60 bg-serenity-charcoal text-serenity-cream/80 p-3.5 flex flex-col justify-between shrink-0 border-r border-serenity-charcoal">
          <nav className="space-y-1">
            {[
              { id: 'geral', label: 'Visão Geral & Funil', icon: LayoutGrid, count: null },
              { id: 'opensquad', label: 'OpenSquad (Multi-Agent)', icon: Users, highlight: true },
              { id: 'tunnel', label: 'Túnel do Redesign (Ao Vivo)', icon: Zap, count: redesignLeads.length, highlight: true },
              { id: 'mrr_forecast', label: 'MRR Forecast (D3)', icon: TrendingUp, count: null },
              { id: 'pipeline', label: 'Pipeline Kanban', icon: Kanban, count: activeLeads.length },
              { id: 'clientes', label: 'Tabela de Clientes', icon: Users, count: leads.length },
              { id: 'sites', label: 'Sites & Portfólio', icon: Columns2, count: redesignLeads.length },
              { id: 'followup', label: 'Follow-ups (4+ dias)', icon: Bell, count: followUpLeads.length, alert: followUpLeads.length > 0 },
              { id: 'contratos', label: 'Contratos & Minutas', icon: FileCheck2, count: closedLeads.length },
              { id: 'financeiro', label: 'Financeiro & MRR', icon: DollarSign, count: null },
              { id: 'ia_audit', label: 'Diagnóstico IA Gemini', icon: Sparkles, highlight: true },
              { id: 'config', label: 'Configurações', icon: Settings, count: null },
            ].map((item: any) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-serenity-gold text-white font-semibold shadow-xs'
                      : item.highlight
                      ? 'bg-serenity-gold/20 text-serenity-gold hover:bg-serenity-gold/30 border border-serenity-gold/20'
                      : 'text-serenity-cream/70 hover:bg-serenity-cream/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.highlight && !active ? 'text-amber-400' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        active
                          ? 'bg-white/20 text-white'
                          : item.alert
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer info box */}
          <div className="p-3 bg-neutral-800/60 rounded-2xl border border-neutral-700/60 text-[11px] text-neutral-400 leading-relaxed">
            <p className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              Prospector + Gemini
            </p>
            <p className="mt-1">
              CRM comercial autônomo com geração instantânea de contratos e análise preditiva de fechamento.
            </p>
          </div>
        </aside>

        {/* View Stage */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
          {/* Search bar on top for table and card views */}
          {['geral', 'pipeline', 'clientes', 'sites', 'followup'].includes(view) && (
            <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filtrar por nome, nicho, cidade ou status..."
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="text-xs text-neutral-500">
                Mostrando <b>{filteredLeads.length}</b> de {leads.length} leads
              </div>
            </div>
          )}

          {/* VIEW: VISÃO GERAL */}
          {view === 'geral' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {[
                  { label: 'Leads Ativos', val: activeLeads.length, color: 'text-neutral-900', bg: 'bg-white' },
                  { label: 'Propostas na Rua', val: leads.filter((l) => l.status === 'proposta').length, color: 'text-amber-600', bg: 'bg-white' },
                  { label: 'Follow-ups (4d+)', val: followUpLeads.length, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                  { label: 'Fechados', val: closedLeads.length, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                  {
                    label: 'Receita Fechada',
                    val: `R$ ${revenueClosed.toLocaleString('pt-BR')}`,
                    color: 'text-emerald-700',
                    bg: 'bg-white',
                  },
                  {
                    label: 'MRR Manutenções',
                    val: `R$ ${mrr.toLocaleString('pt-BR')}/mês`,
                    color: 'text-blue-700',
                    bg: 'bg-white',
                  },
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-2xl border border-neutral-200 ${stat.bg} shadow-2xs`}>
                    <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                      {stat.label}
                    </div>
                    <div className={`text-xl font-bold mt-1 ${stat.color}`}>
                      {stat.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sales Funnel */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">
                      Funil Comercial de Conversão
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Distribuição dos leads em cada etapa do pipeline
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {KANBAN_COLUMNS.map((st) => {
                    const count = leads.filter((l) => l.status === st).length;
                    const max = Math.max(...KANBAN_COLUMNS.map((s) => leads.filter((l) => l.status === s).length), 1);
                    const pct = Math.round((count / max) * 100);
                    const cfg = STATUS_CONFIG[st];

                    return (
                      <div key={st} className="grid grid-cols-[140px_1fr_40px] items-center gap-3 text-xs">
                        <span className="font-semibold text-neutral-700">{cfg.label}</span>
                        <div className="h-5 bg-neutral-100 rounded-lg overflow-hidden flex items-center p-0.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(pct, 4)}%` }}
                            className={`h-full rounded-md ${
                              st === 'fechado'
                                ? 'bg-emerald-500'
                                : st === 'proposta'
                                ? 'bg-amber-500'
                                : st === 'respondeu'
                                ? 'bg-blue-500'
                                : 'bg-neutral-500'
                            }`}
                          />
                        </div>
                        <span className="font-bold text-right text-neutral-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Follow-ups Alert Section */}
              {followUpLeads.length > 0 && (
                <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                      <Bell className="w-4 h-4" />
                      Propostas aguardando Follow-up (4+ dias)
                    </div>
                  </div>
                  <div className="divide-y divide-amber-200/60">
                    {followUpLeads.map((l) => (
                      <div key={l.slug} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <b className="text-neutral-900">{l.nome}</b>
                          <span className="text-neutral-500 ml-2">
                            • Proposta em {l.dataProposta} ({daysSince(l.dataProposta)} dias atrás)
                          </span>
                        </div>
                        {l.whatsapp && (
                          <a
                            href={`https://wa.me/${l.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Cobrar no WhatsApp
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* D3 MRR Forecast Component on Overview */}
              <MrrForecastVisualization leads={leads} />
            </div>
          )}

          {/* VIEW: OPENSQUAD MULTI-AGENT */}
          {view === 'opensquad' && (
            <div className="flex-1 flex flex-col min-h-0">
              <OpenSquadView
                leads={leads}
                onLeadsUpdated={fetchData}
                onNavigateToPipeline={() => setView('pipeline')}
              />
            </div>
          )}

          {/* VIEW: MRR FORECAST D3 DEDICATED */}
          {view === 'mrr_forecast' && (
            <div className="space-y-6">
              <MrrForecastVisualization leads={leads} />
            </div>
          )}

          {/* VIEW: PIPELINE KANBAN */}
          {view === 'pipeline' && (
            <div className="flex-1 flex gap-3.5 overflow-x-auto pb-4 items-start min-h-[500px]">
              {KANBAN_COLUMNS.concat(['descartado']).map((st) => {
                const colLeads = filteredLeads.filter((l) => l.status === st);
                const cfg = STATUS_CONFIG[st];

                return (
                  <div
                    key={st}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(st)}
                    className="w-72 shrink-0 bg-neutral-200/60 rounded-3xl p-3 flex flex-col max-h-[calc(100vh-200px)] border border-neutral-300/70"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                        {cfg.label}
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-neutral-700 shadow-2xs">
                        {colLeads.length}
                      </span>
                    </div>

                    {/* Card List */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      <AnimatePresence>
                        {colLeads.map((l) => (
                          <motion.div
                            key={l.slug}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -3, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)' }}
                            whileTap={{ scale: 0.98 }}
                            whileDrag={{ scale: 1.05, opacity: 0.9 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            draggable
                            onDragStart={() => handleDragStart(l.slug)}
                            className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col h-[210px] min-h-[210px] cursor-grab active:cursor-grabbing transition-colors hover:border-amber-400/50"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                                {l.nome}
                              </h4>
                              {l.status === 'proposta' && daysSince(l.dataProposta) >= 4 && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  {daysSince(l.dataProposta)}d
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                              <span>{l.nicho}</span>
                              <span>•</span>
                              <span>{l.cidade}</span>
                            </div>

                            {l.motivo && (
                              <p className="text-[11px] text-neutral-600 italic bg-neutral-50 p-2 rounded-xl border border-neutral-100 line-clamp-2">
                                "{l.motivo}"
                              </p>
                            )}

                            {l.valor && (
                              <div className="text-xs font-bold text-emerald-700">
                                R$ {l.valor.toLocaleString('pt-BR')}
                                {l.manutencao ? (
                                  <span className="text-[10px] font-normal text-neutral-500 ml-1">
                                    + R$ {l.manutencao}/mês
                                  </span>
                                ) : null}
                              </div>
                            )}

                            {/* Quick Action Buttons */}
                            <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between gap-1 text-[11px]">
                              <div className="flex items-center gap-1">
                                {l.whatsapp && (
                                  <a
                                    href={`https://wa.me/${l.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                    title="WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  onClick={() => setTunnelShareLead(l)}
                                  className="p-1 text-amber-600 hover:bg-amber-50 rounded flex items-center gap-0.5 transition-colors"
                                  title="Abrir / Compartilhar Túnel de Demonstração"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                </button>
                                {l.urlNova && (
                                  <a
                                    href={l.urlNova}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Ver Landing Page"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingLead(l);
                                    setIsModalOpen(true);
                                  }}
                                  className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-100 rounded font-medium transition-colors"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => setDraftContractLead(l)}
                                  className="px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded font-semibold transition-colors"
                                >
                                  Draft
                                </button>
                                {l.status === 'fechado' && (
                                  <button
                                    onClick={() => setContractLead(l)}
                                    className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold transition-colors"
                                  >
                                    Contrato
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW: TABELA DE CLIENTES */}
          {view === 'clientes' && (
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-neutral-50/80 text-neutral-500 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5">Nicho / Cidade</th>
                      <th className="p-3.5">Avaliação</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Valor / Recorrência</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredLeads.map((l) => (
                      <tr key={l.slug} className="hover:bg-neutral-50/60 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-neutral-900">{l.nome}</div>
                          <div className="text-[11px] text-neutral-400">{l.email || 'Sem e-mail'}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-neutral-800">{l.nicho}</div>
                          <div className="text-[11px] text-neutral-500">{l.cidade}</div>
                        </td>
                        <td className="p-3.5">
                          {l.nota ? (
                            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              ★ {l.nota} ({l.avaliacoes})
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              STATUS_CONFIG[l.status]?.bg || 'bg-neutral-100'
                            } ${STATUS_CONFIG[l.status]?.color || 'text-neutral-700'}`}
                          >
                            {STATUS_CONFIG[l.status]?.label || l.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {l.valor ? (
                            <div>
                              <div className="font-bold text-emerald-700">
                                R$ {l.valor.toLocaleString('pt-BR')}
                              </div>
                              {l.manutencao ? (
                                <div className="text-[11px] text-neutral-500">
                                  + R$ {l.manutencao}/mês
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {l.whatsapp && (
                            <a
                              href={`https://wa.me/${l.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEditingLead(l);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                            title="Editar Dados"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(l.slug)}
                            className="inline-flex p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: TÚNEL DO REDESIGN (AO VIVO) & COMPARADOR */}
          {(view === 'tunnel' || view === 'sites' || view === 'comparador') && (
            <RedesignTunnelView
              leads={leads}
              selectedSlug={selectedCmpSlug || undefined}
              onSelectSlug={setSelectedCmpSlug}
            />
          )}

          {/* VIEW: CONTRATOS */}
          {view === 'contratos' && (
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xs overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-sm font-bold text-neutral-900">
                  Gestão de Contratos de Prestação de Serviços
                </h2>
                <p className="text-xs text-neutral-500">
                  Gere minutas A4 padronizadas e controle o status formal de cada cliente fechado
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5">Valor Projeto</th>
                      <th className="p-3.5">Manutenção / MRR</th>
                      <th className="p-3.5">Status Contrato</th>
                      <th className="p-3.5">Data Acordo</th>
                      <th className="p-3.5">Pago?</th>
                      <th className="p-3.5 text-right">Minuta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {closedLeads.map((l) => (
                      <tr key={l.slug} className="hover:bg-neutral-50/60">
                        <td className="p-3.5 font-bold text-neutral-900">{l.nome}</td>
                        <td className="p-3.5 text-emerald-700 font-bold">
                          R$ {l.valor?.toLocaleString('pt-BR') || '—'}
                        </td>
                        <td className="p-3.5 text-blue-700 font-medium">
                          {l.manutencao ? `R$ ${l.manutencao}/mês` : '—'}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={l.contratoStatus || 'pendente'}
                            onChange={(e) =>
                              handleSaveLead({
                                slug: l.slug,
                                contratoStatus: e.target.value as any,
                              })
                            }
                            className="text-xs bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="enviado">Enviado</option>
                            <option value="assinado">Assinado</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-neutral-500">{l.contratoEm || l.dataProposta || '—'}</td>
                        <td className="p-3.5">
                          <input
                            type="checkbox"
                            checked={!!l.pago}
                            onChange={(e) =>
                              handleSaveLead({ slug: l.slug, pago: e.target.checked ? 1 : 0 })
                            }
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                          />
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setContractLead(l)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-2xs"
                          >
                            👁 Ver Contrato A4
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: FINANCEIRO & MRR */}
          {view === 'financeiro' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Recebido Total
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                    R$ {revenueReceived.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    A Receber
                  </span>
                  <div className="text-2xl font-extrabold text-amber-900 mt-1">
                    R$ {revenuePending.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                    MRR (Recorrência Mensal)
                  </span>
                  <div className="text-2xl font-extrabold text-blue-900 mt-1">
                    R$ {mrr.toLocaleString('pt-BR')}/mês
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    Projeção 12 Meses (LTV)
                  </span>
                  <div className="text-2xl font-extrabold text-amber-900 mt-1">
                    R$ {(revenueClosed + mrr * 12).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* D3 MRR Forecast Visualization */}
              <MrrForecastVisualization leads={leads} />
            </div>
          )}

          {/* VIEW: AUDITORIA IA GEMINI */}
          {view === 'ia_audit' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-neutral-900 text-white p-6 rounded-3xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold">Diagnóstico Comercial Gemini</h2>
                      <p className="text-xs text-blue-200">
                        Auditoria preditiva e geração de scripts de conversão para WhatsApp
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={runAiAudit}
                    disabled={auditing}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-xs font-bold rounded-xl shadow-md transition"
                  >
                    {auditing ? 'Atualizando...' : 'Recalcular Análise'}
                  </button>
                </div>

                {aiAudit && (
                  <div className="space-y-4 pt-2">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-xs leading-relaxed">
                      <b>Diagnóstico Geral:</b> {aiAudit.diagnostico}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                        <span className="text-[11px] text-blue-200 uppercase font-semibold">
                          Taxa de Conversão Esperada
                        </span>
                        <div className="text-sm font-bold mt-1 text-emerald-300">
                          {aiAudit.taxaConversao}
                        </div>
                      </div>
                      <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10">
                        <span className="text-[11px] text-blue-200 uppercase font-semibold">
                          Potencial de MRR
                        </span>
                        <div className="text-sm font-bold mt-1 text-amber-300">
                          {aiAudit.mrrProjetado}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Leads & WhatsApp Scripts */}
              {aiAudit?.leadsPrioritarios && (
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Leads Prioritários & Scripts Sugeridos para WhatsApp
                  </h3>
                  <div className="space-y-3">
                    {aiAudit.leadsPrioritarios.map((item, idx) => (
                      <div key={idx} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <b className="text-xs text-neutral-900">{item.nome}</b>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                            {item.motivoAlerta}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-neutral-200 text-xs text-neutral-700 leading-relaxed font-mono">
                          {item.scriptWhatsapp}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: CONFIGURAÇÕES */}
          {view === 'config' && config && (
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs max-w-2xl space-y-6">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Dados do Prestador / Contratante
                </h2>
                <p className="text-xs text-neutral-500">
                  Preencha uma vez para que todos os contratos A4 saiam automaticamente com seus dados
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Nome Completo ou Razão Social
                  </label>
                  <input
                    type="text"
                    value={config.contratante.nome || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        contratante: { ...config.contratante, nome: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      CPF ou CNPJ
                    </label>
                    <input
                      type="text"
                      value={config.contratante.cpfCnpj || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contratante: { ...config.contratante, cpfCnpj: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Cidade / UF
                    </label>
                    <input
                      type="text"
                      value={config.contratante.cidadeUf || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contratante: { ...config.contratante, cidadeUf: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={config.contratante.endereco || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        contratante: { ...config.contratante, endereco: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      value={config.contratante.email || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contratante: { ...config.contratante, email: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      WhatsApp (55DDDnúmero)
                    </label>
                    <input
                      type="text"
                      value={config.contratante.whatsapp || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          contratante: { ...config.contratante, whatsapp: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await fetch('/api/config', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(config),
                    });
                    alert('Configurações salvas com sucesso!');
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs transition mt-3"
                >
                  Salvar Dados do Contratante
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit / New Lead Modal */}
      {isModalOpen && editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">
                {editingLead.nome ? `Editar Lead — ${editingLead.nome}` : 'Novo Lead'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nome do Negócio</label>
                <input
                  type="text"
                  value={editingLead.nome || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, nome: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Nicho</label>
                  <input
                    type="text"
                    value={editingLead.nicho || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, nicho: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={editingLead.cidade || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, cidade: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">WhatsApp (55DDDnúmero)</label>
                  <input
                    type="text"
                    value={editingLead.whatsapp || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, whatsapp: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Status no Funil</label>
                  <select
                    value={editingLead.status || 'novo'}
                    onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as any })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                  >
                    {Object.keys(STATUS_CONFIG).map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st as LeadStatus].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    value={editingLead.valor || ''}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        valor: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Manutenção Mensal (R$)</label>
                  <input
                    type="number"
                    value={editingLead.manutencao || ''}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        manutencao: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Site Antigo</label>
                <input
                  type="text"
                  value={editingLead.siteAntigo || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, siteAntigo: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">URL da Nova Página (Preview)</label>
                <input
                  type="text"
                  value={editingLead.urlNova || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, urlNova: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Motivo / Diagnóstico</label>
                <textarea
                  rows={2}
                  value={editingLead.motivo || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, motivo: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveLead(editingLead)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold"
              >
                Salvar Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Preview Modal */}
      {contractLead && config && (
        <ContractModal
          lead={contractLead}
          contratante={config.contratante}
          onClose={() => setContractLead(null)}
          onUpdateStatus={(st) => {
            handleSaveLead({ slug: contractLead.slug, contratoStatus: st });
            setContractLead({ ...contractLead, contratoStatus: st });
          }}
        />
      )}

      {/* Draft Contract Modal */}
      {draftContractLead && (
        <DraftContractModal
          lead={draftContractLead}
          onClose={() => setDraftContractLead(null)}
        />
      )}

      {/* Tunnel Share Modal */}
      {tunnelShareLead && (
        <TunnelShareModal
          isOpen={!!tunnelShareLead}
          lead={tunnelShareLead}
          onClose={() => setTunnelShareLead(null)}
        />
      )}
    </div>
  );
};
