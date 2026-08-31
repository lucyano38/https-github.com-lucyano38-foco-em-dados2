import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Building2,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle2,
  Plus,
  ArrowRight,
  Share2,
  Instagram,
  Linkedin,
  Compass,
  FileCode,
  MessageSquare,
  Send,
  Bot,
  User,
  RefreshCw,
  Zap,
  TrendingUp,
  ExternalLink,
  Settings,
} from 'lucide-react';
import {
  Lead,
  SquadAgent,
  SquadAgentRole,
  CollabCard,
  SquadMessage,
  SquadDeliverable,
} from '../types';
import { SystemConfigModal } from './SystemConfigModal';
import { TunnelShareModal } from './TunnelShareModal';
import { NICHOS as COMMON_NICHES, CNAES as COMMON_CNAES } from '../lib/constants';

interface UnifiedProspectProps {
  onNavigateToCrm?: () => void;
  onLeadAddedToCrm?: (lead: any) => void;
}

const DEFAULT_AGENTS: SquadAgent[] = [
  {
    id: 'pm-1',
    name: 'Alexandre',
    role: 'pm',
    avatar: '👨‍💼',
    description: 'Squad Lead & Orquestrador. Quebra metas em tarefas, delega trabalho e sintetiza resultados.',
    model: 'Gemini 3.7 Flash',
    status: 'idle',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    skills: ['Orquestração', 'Decomposição de Tarefas', 'Síntese Executiva', 'Gestão de Funil'],
    systemPrompt: 'Você é Alexandre, Project Manager e Líder do Squad. Seu objetivo é garantir alta conversão, delegação precisa e síntese de resultados.',
  },
  {
    id: 'hunter-1',
    name: 'Bia',
    role: 'hunter',
    avatar: '🔍',
    description: 'Data Scout & Qualificação. Mapeia alvos com alta reputação mas presença digital defasada.',
    model: 'Gemini 3.7 Flash',
    status: 'idle',
    color: 'bg-blue-50 text-blue-800 border-blue-300',
    skills: ['Scraping de Contato', 'Lead Scoring', 'Auditoria Google Maps', 'Qualificação B2B'],
    systemPrompt: 'Você é Bia, especialista em inteligência de mercado e scouting de oportunidades com alto ticket e baixa maturidade digital.',
  },
  {
    id: 'dev-1',
    name: 'Lucas',
    role: 'redesigner',
    avatar: '💻',
    description: 'UI/UX & Web Dev Specialist. Identifica falhas de UX nos sites antigos e projeta modernizações.',
    model: 'Gemini 3.7 Flash',
    status: 'idle',
    color: 'bg-purple-50 text-purple-800 border-purple-300',
    skills: ['Auditoria de UI', 'Prototipação Rápida', 'Otimização Mobile', 'Propostas Visuais'],
    systemPrompt: 'Você é Lucas, designer e dev fullstack. Sua meta é diagnosticar gargalos técnicos e apresentar propostas visuais irrecusáveis.',
  },
  {
    id: 'copy-1',
    name: 'Camila',
    role: 'copywriter',
    avatar: '✍️',
    description: 'Pitch & Closer. Redige mensagens de WhatsApp consultivas, quebra objeções e agenda reuniões.',
    model: 'Gemini 3.7 Flash',
    status: 'idle',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    skills: ['Copywriting B2B', 'Scripts de WhatsApp', 'Quebra de Objeções', 'Gatilhos de Fechamento'],
    systemPrompt: 'Você é Camila, copywriter focada em conversão rápida e abordagem humanizada pelo WhatsApp sem parecer invasiva.',
  },
  {
    id: 'qa-1',
    name: 'Gabriel',
    role: 'qa',
    avatar: '🛡️',
    description: 'Auditor Comercial & QA. Valida precificação, contratos e viabilidade de manutenção mensal (MRR).',
    model: 'Gemini 3.7 Flash',
    status: 'idle',
    color: 'bg-slate-50 text-slate-800 border-slate-300',
    skills: ['Validação de MRR', 'Análise de Risco', 'Auditoria de Minutas', 'Controle de Qualidade'],
    systemPrompt: 'Você é Gabriel, auditor de qualidade e viabilidade comercial. Garante que todo lead tenha modelo sustentável de implantação + MRR.',
  },
];

const COLLAB_CARDS: CollabCard[] = [
  {
    id: 'prospect_hunt',
    title: 'Prospecção & Redesign Inteligente',
    category: 'Aquisição de Clientes',
    description: 'Descobre empresas no nicho alvo, audita a presença digital, gera leads qualificados e propostas de redesign automáticas.',
    icon: '🎯',
    defaultPrompt: 'Encontrar oportunidades de alto valor com sites desatualizados e gerar leads completos prontos para contato.',
    assignedAgents: ['pm', 'hunter', 'redesigner', 'copywriter', 'qa'],
    targetOutputs: ['Lista de Leads', 'Auditoria de Falhas', 'Scripts de Abordagem', 'Proposta de MRR', 'Contrato'],
  },
];

type Tab = 'prospect' | 'agents' | 'messages' | 'deliverables';

export const UnifiedProspectView: React.FC<UnifiedProspectProps> = ({
  onNavigateToCrm,
  onLeadAddedToCrm,
}) => {
  const [selectedCard, setSelectedCard] = useState<CollabCard>(COLLAB_CARDS[0]);
  const [niche, setNiche] = useState('Restaurantes & Gastronomia');
  const [city, setCity] = useState('São Paulo - SP');
  const [radius, setRadius] = useState('5000');
  const [selectedCnae, setSelectedCnae] = useState(COMMON_CNAES[0].code);
  const [customCnae, setCustomCnae] = useState('');
  const [sources, setSources] = useState({ maps: true, instagram: true, linkedin: true, cnae: true });
  const [ticketTarget, setTicketTarget] = useState(1500);
  const [mrrTarget, setMrrTarget] = useState(200);
  const [focus, setFocus] = useState('Conversão Mobile e WhatsApp');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
  const [importedSuccessCount, setImportedSuccessCount] = useState<number | null>(null);
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<SquadAgent | null>(null);
  const [tunnelLead, setTunnelLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('prospect');
  const [agents, setAgents] = useState<SquadAgent[]>(DEFAULT_AGENTS);
  const [prospectingLeads, setProspectingLeads] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [planSteps, setPlanSteps] = useState<Array<{ id: string; agentRole: SquadAgentRole; agentName: string; title: string; description: string; status: 'pending' | 'in_progress' | 'completed' }>>([
    { id: 's1', agentRole: 'pm', agentName: 'Alexandre', title: 'Decomposição & Metas', description: 'Definir ICP e parâmetros', status: 'pending' },
    { id: 's2', agentRole: 'hunter', agentName: 'Bia', title: 'Scouting & Enriquecimento', description: 'Mapear empresas no nicho', status: 'pending' },
    { id: 's3', agentRole: 'redesigner', agentName: 'Lucas', title: 'Auditoria/Redesign', description: 'Diagnosticar sites e propor novos layouts', status: 'pending' },
    { id: 's4', agentRole: 'copywriter', agentName: 'Camila', title: 'Mensagens & Contratos', description: 'Gerar scripts e minuta de contrato', status: 'pending' },
    { id: 's5', agentRole: 'qa', agentName: 'Gabriel', title: 'Viabilidade & Fechamento', description: 'Validar ticket e planos', status: 'pending' },
  ]);
  const [messages, setMessages] = useState<SquadMessage[]>([
    {
      id: 'welcome-msg',
      agentId: 'pm-1',
      agentRole: 'pm',
      agentName: 'Alexandre (PM & Squad Lead)',
      content: 'Bem-vindo ao workspace **OpenSquad**. Selecione uma missão, configure nicho/cidade e clique em **Iniciar Missão**. Os agentes irão prospectar, classificar sites, gerar redesigns, mensagens e minuta de contrato.',
      type: 'chat',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [generatedLeads, setGeneratedLeads] = useState<Lead[]>([]);
  const [deliverables, setDeliverables] = useState<SquadDeliverable[]>([]);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isRunning]);

  const activeNiche = customCnae.trim() ? customCnae : selectedCnae;
  const activeNicheDisplay = customCnae.trim() ? customCnae : niche;

  const handleAddToCrm = async (lead: any) => {
    try {
      const leadSlug = lead.slug || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        slug: leadSlug,
        nome: lead.name,
        company: lead.name,
        nicho: activeNicheDisplay,
        cidade: city,
        telefone: lead.phone,
        whatsapp: lead.whatsapp || lead.phone,
        email: lead.email,
        nota: lead.rating,
        avaliacoes: lead.reviewsCount || 120,
        status: 'redesenhado',
        siteAntigo: lead.website || `https://www.${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
        valor: ticketTarget,
        manutencao: mrrTarget,
        obs: `Prospecção Multi-Canal.`,
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setImportedSuccessCount((prev) => (prev || 0) + 1);
        onLeadAddedToCrm?.(payload);
      } else {
        alert('Erro ao adicionar lead ao CRM.');
      }
    } catch (err) {
      console.error('Error adding lead to CRM:', err);
      alert('Erro de conexão ao salvar lead no CRM.');
    }
  };

  const runUnifiedMission = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setImportedSuccessCount(null);
    setPlanSteps([
      { id: 's1', agentRole: 'pm', agentName: 'Alexandre', title: 'Decomposição & Metas', description: `Definir ICP de ${activeNicheDisplay}`, status: 'in_progress' },
      { id: 's2', agentRole: 'hunter', agentName: 'Bia', title: 'Scouting & Enriquecimento', description: `Mapear alvos em ${city}`, status: 'pending' },
      { id: 's3', agentRole: 'redesigner', agentName: 'Lucas', title: 'Auditoria/Redesign', description: 'Diagnosticar sites e propor novos layouts', status: 'pending' },
      { id: 's4', agentRole: 'copywriter', agentName: 'Camila', title: 'Mensagens & Contratos', description: 'Gerar scripts e minuta de contrato', status: 'pending' },
      { id: 's5', agentRole: 'qa', agentName: 'Gabriel', title: 'Viabilidade & Fechamento', description: `Validar ticket R$ ${ticketTarget} e MRR R$ ${mrrTarget}`, status: 'pending' },
    ]);
    setAgents((prev) => prev.map((a) => ({ ...a, status: selectedCard.assignedAgents.includes(a.role) ? 'thinking' : 'idle' })));

    const startMsg: SquadMessage = {
      id: `cmd-${Date.now()}`,
      agentId: 'user',
      agentRole: 'pm',
      agentName: 'Operador (Você)',
      content: `Iniciando missão **${selectedCard.title}** para **${activeNicheDisplay}** em **${city}** (Ticket: R$ ${ticketTarget.toLocaleString('pt-BR')} • MRR: R$ ${mrrTarget}/mês • Foco: ${focus}).`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, startMsg]);

    try {
      const res = await fetch('/api/opensquad/run-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCard.id,
          niche: activeNicheDisplay,
          city,
          ticketTarget,
          mrrTarget,
          focus,
          customPrompt,
          modelName: selectedModel,
          sources,
          radius,
        }),
      });

      if (!res.ok) throw new Error(`Falha no servidor: ${res.statusText}`);

      const data = await res.json();

      if (data.planSteps && Array.isArray(data.planSteps)) setPlanSteps(data.planSteps);
      if (data.messages && Array.isArray(data.messages)) {
        for (let i = 0; i < data.messages.length; i++) {
          const item = data.messages[i];
          await new Promise((resolve) => setTimeout(resolve, 320));
          const agent = agents.find((a) => a.role === item.agentRole) || agents[0];
          setPlanSteps((prev) => prev.map((st, sIdx) => {
            if (sIdx <= i) return { ...st, status: 'completed' };
            if (sIdx === i + 1) return { ...st, status: 'in_progress' };
            return st;
          }));
          setAgents((prev) => prev.map((a) => ({ ...a, status: a.role === item.agentRole ? 'working' : 'idle' })));
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-${i}`,
              agentId: agent.id,
              agentRole: item.agentRole,
              agentName: item.agentName || agent.name,
              content: item.content,
              type: item.type || 'chat',
              deliverable: item.deliverable,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      }

      if (data.generatedLeads && Array.isArray(data.generatedLeads)) {
        setGeneratedLeads(data.generatedLeads);
        setDeliverables((prev) => [
          ...prev,
          { id: `del-${Date.now()}`, title: 'Lista de Leads', type: 'leads', content: data.generatedLeads },
        ]);
      }
      if (data.scripts && Array.isArray(data.scripts)) {
        setDeliverables((prev) => [
          ...prev,
          { id: `del-${Date.now()}`, title: 'Mensagens WhatsApp', type: 'scripts', content: data.scripts },
        ]);
      }
      if (data.contract) {
        setDeliverables((prev) => [
          ...prev,
          { id: `del-${Date.now()}`, title: 'Minuta de Contrato', type: 'contract', content: data.contract },
        ]);
      }
    } catch (err: any) {
      console.error('Error running mission:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          agentId: 'pm-1',
          agentRole: 'pm',
          agentName: 'Alexandre (PM)',
          content: `Houve uma oscilação na rede: ${err.message || 'erro desconhecido'}. Tente novamente.`,
          type: 'chat',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsRunning(false);
      setAgents((prev) => prev.map((a) => ({ ...a, status: 'ready' })));
      setPlanSteps((prev) => prev.map((st) => ({ ...st, status: 'completed' })));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isRunning) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    const userMsg: SquadMessage = {
      id: `user-${Date.now()}`,
      agentId: 'user',
      agentRole: 'pm',
      agentName: 'Operador (Você)',
      content: userText,
      type: 'chat',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsRunning(true);
    try {
      const res = await fetch('/api/opensquad/run-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: 'custom',
          niche: activeNicheDisplay,
          city,
          ticketTarget,
          mrrTarget,
          focus,
          customPrompt: userText,
          modelName: selectedModel,
          sources,
          radius,
        }),
      });
      const data = await res.json();
      if (data.messages && Array.isArray(data.messages)) {
        for (let i = 0; i < data.messages.length; i++) {
          const item = data.messages[i];
          await new Promise((resolve) => setTimeout(resolve, 280));
          const agent = agents.find((a) => a.role === item.agentRole) || agents[0];
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-${i}`,
              agentId: agent.id,
              agentRole: item.agentRole,
              agentName: item.agentName || agent.name,
              content: item.content,
              type: item.type || 'chat',
              deliverable: item.deliverable,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          agentId: 'pm-1',
          agentRole: 'pm',
          agentName: 'Alexandre (PM)',
          content: `Falha momentânea: ${err.message || 'tente novamente'}.`,
          type: 'chat',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const tabs = useMemo(
    () => [
      { id: 'prospect' as Tab, label: 'Prospecção', icon: Search },
      { id: 'agents' as Tab, label: 'Agentes', icon: Bot },
      { id: 'messages' as Tab, label: 'Mensagens', icon: MessageSquare },
      { id: 'deliverables' as Tab, label: 'Entregáveis', icon: FileCode },
    ],
    []
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 p-4 md:p-8 font-sans bg-[#010102] text-[#f7f8f8]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#f7f8f8]">Prospectar Clientes + OpenSquad AI</h1>
          <p className="text-sm text-[#8a8f98] mt-1">Uma missão unificada: buscar leads, auditar sites, propor redesigns, gerar mensagens e minuta de contrato.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigateToCrm?.()} className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#d4d6e0] hover:bg-white/[0.06] text-xs font-semibold cursor-pointer">Abrir CRM</button>
          <button onClick={() => setIsConfigModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-[#0f1011] border border-white/[0.08] text-[#f7f8f8] hover:bg-[#191a1b] text-xs font-semibold cursor-pointer flex items-center gap-2"><Settings className="w-4 h-4" /> Config</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-[#d4d6e0]">Missão Ativa</div>
              <span className="text-xs text-[#8a8f98]">{selectedCard.title}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Nicho / CNAE</label>
                <select value={activeNicheDisplay} onChange={(e) => { setNiche(e.target.value); setSelectedCnae(e.target.value); setCustomCnae(''); }} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]">
                  {COMMON_NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                  {COMMON_CNAES.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.desc}</option>)}
                </select>
                <input value={customCnae} onChange={(e) => setCustomCnae(e.target.value)} placeholder="Ou digite um CNAE/nicho customizado" className="mt-2 w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Cidade</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
                <label className="text-xs font-semibold text-[#8a8f98] mt-2 mb-1 block">Raio (metros)</label>
                <input value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Ticket alvo (R$)</label>
                <input type="number" value={ticketTarget} onChange={(e) => setTicketTarget(Number(e.target.value))} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Foco da abordagem</label>
                <input value={focus} onChange={(e) => setFocus(e.target.value)} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { key: 'maps', label: 'Google Maps' },
                { key: 'instagram', label: 'Instagram' },
                { key: 'linkedin', label: 'LinkedIn' },
                { key: 'cnae', label: 'CNAE' },
              ].map((s) => (
                <button key={s.key} onClick={() => setSources((prev) => ({ ...prev, [s.key]: !prev[s.key] }))} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${sources[s.key as keyof typeof sources] ? 'bg-[#d4a574] text-[#1c1917] border-[#d4a574]' : 'bg-white/[0.04] text-[#d4d6e0] border-white/[0.08]'}`}>{s.label}</button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={runUnifiedMission} disabled={isRunning} className="px-5 py-3 rounded-xl bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] text-xs font-bold shadow-[0_0_20px_rgba(212,165,116,0.25)] disabled:opacity-50 cursor-pointer flex items-center gap-2"><Sparkles className="w-4 h-4" /> {isRunning ? 'Executando missão...' : 'Iniciar Missão Unificada'}</button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex border-b border-white/[0.08]">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-xs font-semibold rounded-t-xl cursor-pointer ${activeTab === tab.id ? 'bg-white/[0.06] text-[#f7f8f8]' : 'text-[#8a8f98] hover:text-[#d4d6e0]'}`}><div className="flex items-center gap-1.5">{tab.label}</div></button>
                ))}
              </div>
            </div>

            {activeTab === 'prospect' && (
              <div className="space-y-3">
                {prospectingLeads.length === 0 && (
                  <div className="text-xs text-[#8a8f98]">Nenhum lead buscado ainda. Execute “Iniciar Missão Unificada”.</div>
                )}
                {prospectingLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#010102] px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-[#f7f8f8]">{lead.name}</div>
                      <div className="text-xs text-[#8a8f98]">{lead.category} • {lead.city} • {lead.websiteStatus}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAddToCrm(lead)} className="px-3 py-2 rounded-xl bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] text-xs font-bold cursor-pointer">Adicionar ao CRM</button>
                      <a href={lead.website || '#'} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl border border-white/[0.08] text-[#d4d6e0] text-xs font-semibold hover:bg-white/[0.06]">Site</a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <div key={agent.id} onClick={() => setSelectedAgentForDetails(agent)} className="rounded-2xl border border-white/[0.08] bg-[#0f1011] p-4 cursor-pointer hover:border-white/[0.12] transition">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{agent.avatar}</span>
                      <div>
                        <div className="text-sm font-semibold text-[#f7f8f8]">{agent.name}</div>
                        <div className="text-[11px] text-[#8a8f98] uppercase tracking-wider">{agent.role}</div>
                      </div>
                      <span className={`ml-auto text-[10px] px-2 py-1 rounded-full border ${agent.status === 'working' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'}`}>{agent.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-[#8a8f98]">{agent.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-2 ${msg.agentId === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed border ${msg.agentId === 'user' ? 'bg-[#d4a574] text-[#1c1917] border-[#d4a574]' : 'bg-[#0f1011] text-[#f7f8f8] border-white/[0.08]'}`}>
                      <div className="font-semibold text-[11px] mb-1">{msg.agentName}</div>
                      <div className="prose prose-xs max-w-none">{msg.content}</div>
                    </div>
                  </div>
                ))}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Instrua o squad..." className="flex-1 rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
                  <button type="submit" disabled={isRunning || !inputMessage.trim()} className="px-3 py-2 rounded-xl bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] text-xs font-bold disabled:opacity-40 cursor-pointer">Enviar</button>
                </form>
              </div>
            )}

            {activeTab === 'deliverables' && (
              <div className="space-y-3">
                {deliverables.length === 0 && <div className="text-xs text-[#8a8f98]">Nenhum entregável ainda. Execute uma missão para gerar leads, mensagens e contratos.</div>}
                {deliverables.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/[0.08] bg-[#0f1011] p-4">
                    <div className="text-sm font-semibold text-[#f7f8f8] mb-1">{item.title}</div>
                    <pre className="text-[11px] text-[#8a8f98] whitespace-pre-wrap">{typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="text-sm font-semibold text-[#d4d6e0] mb-3">Status dos Agentes</div>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-3">
                  <span className="text-xl">{agent.avatar}</span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#f7f8f8]">{agent.name}</div>
                    <div className="text-[11px] text-[#8a8f98] uppercase tracking-wider">{agent.role}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${agent.status === 'working' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'}`}>{agent.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="text-sm font-semibold text-[#d4d6e0] mb-3">Plano da Missão</div>
            <div className="space-y-3">
              {planSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${step.status === 'completed' ? 'bg-emerald-400' : step.status === 'in_progress' ? 'bg-amber-400 animate-pulse' : 'bg-neutral-500'}`} />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#f7f8f8]">{step.title}</div>
                    <div className="text-[11px] text-[#8a8f98]">{step.description}</div>
                  </div>
                  <span className="text-[10px] text-[#8a8f98]">{step.agentName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isConfigModalOpen && <SystemConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />}
      {tunnelLead && <TunnelShareModal lead={tunnelLead} onClose={() => setTunnelLead(null)} />}
    </div>
  );
};
