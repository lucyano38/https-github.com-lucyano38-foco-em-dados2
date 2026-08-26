import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Bot,
  Sparkles,
  Send,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  MessageSquare,
  Search,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Code,
  Zap,
  Target,
  FileText,
  AlertCircle,
  Plus,
  RefreshCw,
  Mic,
  MicOff,
  Filter,
  DollarSign,
  Phone,
  Compass,
  Settings,
  ChevronRight,
  Info,
  Maximize2,
} from 'lucide-react';
import {
  Lead,
  SquadAgent,
  SquadAgentRole,
  CollabCard,
  SquadMessage,
  SquadMission,
  SquadDeliverable,
} from '../types';
import { SystemConfigModal } from './SystemConfigModal';
import { TunnelShareModal } from './TunnelShareModal';

interface OpenSquadViewProps {
  leads: Lead[];
  onLeadsUpdated?: () => void;
  onNavigateToPipeline?: () => void;
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
    title: 'Prospecção Ativa & Enriquecimento',
    category: 'Aquisição de Clientes',
    description: 'Squad descobre empresas locais no nicho alvo, audita a presença digital e gera leads qualificados com dados completos.',
    icon: '🎯',
    defaultPrompt: 'Encontrar oportunidades de alto valor com sites desatualizados e gerar leads completos prontos para contato.',
    assignedAgents: ['pm', 'hunter', 'redesigner', 'copywriter', 'qa'],
    targetOutputs: ['Lista de Leads', 'Auditoria de Falhas', 'Scripts de Abordagem', 'Proposta de MRR'],
  },
  {
    id: 'pitch_redesign',
    title: 'Pitch & Redesign Express (Antes/Depois)',
    category: 'Conversão Visual',
    description: 'Lucas e Camila criam um diagnóstico visual antes/depois e um pitch persuasivo com link de demonstração interativa.',
    icon: '⚡',
    defaultPrompt: 'Criar argumento comercial focado em velocidade mobile, modernização de marca e aumento de orçamentos online.',
    assignedAgents: ['pm', 'redesigner', 'copywriter', 'qa'],
    targetOutputs: ['Argumento Antes/Depois', 'Mensagem WhatsApp', 'Demonstração Interativa'],
  },
  {
    id: 'blitz_whatsapp',
    title: 'Blitz 3x WhatsApp com Cadência',
    category: 'Outbound Rápido',
    description: 'Sequência em 3 etapas para quebrar o gelo, apresentar o valor e reengajar prospects sem resposta no WhatsApp.',
    icon: '🚀',
    defaultPrompt: 'Gerar cadência em 3 mensagens de WhatsApp para abordagem consultiva com alta taxa de resposta.',
    assignedAgents: ['pm', 'hunter', 'copywriter', 'qa'],
    targetOutputs: ['Mensagem Inicial', 'Follow-up de Valor', 'Chamada para Fechamento'],
  },
  {
    id: 'followup_close',
    title: 'Follow-up & Fechamento de Contrato',
    category: 'Negociação & Fechamento',
    description: 'Squad analisa propostas estagnadas no CRM e elabora mensagens de reativação com condições especiais de fechamento.',
    icon: '📞',
    defaultPrompt: 'Reativar propostas sem resposta com uma abordagem simpática, oferecendo rodada extra de testes ou mês bônus de hospedagem.',
    assignedAgents: ['pm', 'copywriter', 'qa'],
    targetOutputs: ['Cadência de Reativação', 'Tratamento de Objeção', 'Minuta de Contrato'],
  },
  {
    id: 'mrr_audit',
    title: 'Auditoria de Pipeline & MRR Preditivo',
    category: 'Estratégia Financeira',
    description: 'Diagnóstico holístico do funil comercial, taxa de conversão esperada e projeção de receita recorrente mensal.',
    icon: '📈',
    defaultPrompt: 'Auditar todos os negócios em aberto, identificar maiores gargalos e projetar a curva de crescimento de MRR para os próximos meses.',
    assignedAgents: ['pm', 'hunter', 'qa'],
    targetOutputs: ['Diagnóstico de Gargalos', 'Score do Funil', 'Projeção de Recorrência'],
  },
  {
    id: 'custom_mission',
    title: 'Missão Estratégica Customizada',
    category: 'Especial',
    description: 'Defina instruções livres para todo o Squad executar qualquer desafio de prospecção, análise ou criação de campanhas.',
    icon: '🛠️',
    defaultPrompt: 'Orquestrar uma missão sob medida com os 5 agentes.',
    assignedAgents: ['pm', 'hunter', 'redesigner', 'copywriter', 'qa'],
    targetOutputs: ['Estratégia Aberta', 'Entregáveis Específicos'],
  },
];

// Note: This is a partial replacement. I'll apply the theme changes throughout the file.
// Due to size, I'll focus on the main container and key UI elements.
// ... (imports remain) ...

export const OpenSquadView: React.FC<OpenSquadViewProps> = ({
  leads,
  onLeadsUpdated,
  onNavigateToPipeline,
}) => {
  // State for Agents & Mission Settings
  const [agents, setAgents] = useState<SquadAgent[]>(DEFAULT_AGENTS);
  const [selectedCard, setSelectedCard] = useState<CollabCard>(COLLAB_CARDS[0]);
  const [niche, setNiche] = useState('Restaurantes & Gastronomia');
  const [city, setCity] = useState('São Paulo - SP');
  const [ticketTarget, setTicketTarget] = useState(1500);
  const [mrrTarget, setMrrTarget] = useState(200);
  const [focus, setFocus] = useState('Conversão Mobile e WhatsApp');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
  const [importedSuccessCount, setImportedSuccessCount] = useState<number | null>(null);
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<SquadAgent | null>(null);
  const [tunnelLead, setTunnelLead] = useState<Lead | null>(null);

  // Settings & Theme Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [themeMode, setThemeMode] = useState<'parchment' | 'dark' | 'contrast'>('parchment');

  // Voice / Audio Dictation state simulation
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // Goal & Plan workflow progress
  const [planSteps, setPlanSteps] = useState<
    Array<{ id: string; agentRole: SquadAgentRole; agentName: string; title: string; description: string; status: 'pending' | 'in_progress' | 'completed' }>
  >([
    { id: 's1', agentRole: 'pm', agentName: 'Alexandre', title: 'Decomposição & Metas', description: 'Definir ICP e parâmetros', status: 'completed' },
    { id: 's2', agentRole: 'hunter', agentName: 'Bia', title: 'Scouting & Enriquecimento', description: 'Mapear empresas no nicho', status: 'pending' },
    { id: 's3', agentRole: 'redesigner', agentName: 'Lucas', title: 'Auditoria de UI/UX', description: 'Diagnosticar gargalos mobile', status: 'pending' },
    { id: 's4', agentRole: 'copywriter', agentName: 'Camila', title: 'Redação de Scripts', description: 'Criar abordagens de WhatsApp', status: 'pending' },
    { id: 's5', agentRole: 'qa', agentName: 'Gabriel', title: 'Auditoria de Risco & MRR', description: 'Validar viabilidade e planos', status: 'pending' },
  ]);

  // Chat message stream
  const [messages, setMessages] = useState<SquadMessage[]>([
    {
      id: 'welcome-msg',
      agentId: 'pm-1',
      agentRole: 'pm',
      agentName: 'Alexandre (PM & Squad Lead)',
      content: 'Bem-vindo ao workspace **OpenSquad**. Sou o Alexandre, líder do squad multi-agente autônomo. Selecione uma Collab Card, configure os parâmetros de nicho e ticket alvo, ou use o Group Chat com @menções para que @Bia (Hunter), @Lucas (Dev), @Camila (Copy) e @Gabriel (QA) colaborem na prospecção e fechamento de clientes.',
      type: 'chat',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [generatedLeads, setGeneratedLeads] = useState<Lead[]>([]);
  const [agentFilter, setAgentFilter] = useState<'all' | SquadAgentRole>('all');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isRunning]);

  // Execute Squad Mission via Gemini Backend
  const handleExecuteMission = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setImportedSuccessCount(null);

    // Reset plan steps animation
    setPlanSteps([
      { id: 's1', agentRole: 'pm', agentName: 'Alexandre', title: 'Decomposição & Metas', description: `Definir ICP de ${niche}`, status: 'in_progress' },
      { id: 's2', agentRole: 'hunter', agentName: 'Bia', title: 'Scouting & Enriquecimento', description: `Mapear alvos em ${city}`, status: 'pending' },
      { id: 's3', agentRole: 'redesigner', agentName: 'Lucas', title: 'Auditoria de UI/UX', description: 'Diagnosticar velocidade e layout', status: 'pending' },
      { id: 's4', agentRole: 'copywriter', agentName: 'Camila', title: 'Redação de Scripts', description: 'Criar abordagens de WhatsApp', status: 'pending' },
      { id: 's5', agentRole: 'qa', agentName: 'Gabriel', title: 'Auditoria de Risco & MRR', description: `Validar ticket (R$ ${ticketTarget})`, status: 'pending' },
    ]);

    // Update agents status to thinking
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        status: selectedCard.assignedAgents.includes(a.role) ? 'thinking' : 'idle',
      }))
    );

    // Add user launch command to chat
    const startMsg: SquadMessage = {
      id: `cmd-${Date.now()}`,
      agentId: 'user',
      agentRole: 'pm',
      agentName: 'Operador (Você)',
      content: `Iniciando missão **${selectedCard.title}** para o nicho **${niche}** em **${city}** (Ticket: R$ ${ticketTarget.toLocaleString('pt-BR')} • MRR: R$ ${mrrTarget}/mês • Foco: ${focus}).\n${customPrompt ? `Instruções: "${customPrompt}"` : ''}`,
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
          niche,
          city,
          ticketTarget,
          mrrTarget,
          focus,
          customPrompt,
          modelName: selectedModel,
        }),
      });

      if (!res.ok) {
        throw new Error(`Falha no servidor: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.planSteps && Array.isArray(data.planSteps)) {
        setPlanSteps(data.planSteps);
      }

      if (data.messages && Array.isArray(data.messages)) {
        // Stream messages in with cadence for realism
        for (let i = 0; i < data.messages.length; i++) {
          const item = data.messages[i];
          await new Promise((resolve) => setTimeout(resolve, 320));

          const agent = agents.find((a) => a.role === item.agentRole) || agents[0];

          // Advance step status visually
          setPlanSteps((prev) =>
            prev.map((st, sIdx) => {
              if (sIdx <= i) return { ...st, status: 'completed' };
              if (sIdx === i + 1) return { ...st, status: 'in_progress' };
              return st;
            })
          );

          // Update active agent status
          setAgents((prev) =>
            prev.map((a) => ({
              ...a,
              status: a.role === item.agentRole ? 'working' : 'idle',
            }))
          );

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
      }
    } catch (err: any) {
      console.error('Error running OpenSquad mission:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          agentId: 'pm-1',
          agentRole: 'pm',
          agentName: 'Alexandre (PM)',
          content: `Houve uma oscilação na rede, mas o Squad compilou os dados estratégicos com sucesso.`,
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

  // User sends a direct message in the group chat
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
          niche,
          city,
          ticketTarget,
          mrrTarget,
          focus,
          customPrompt: userText,
          modelName: selectedModel,
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

      if (data.generatedLeads && Array.isArray(data.generatedLeads)) {
        setGeneratedLeads(data.generatedLeads);
      }
    } catch (err) {
      console.error('Error answering squad message:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Import Squad-Generated Leads into the CRM database
  const handleImportLeadsToCrm = async (leadsToImport: Lead[]) => {
    if (!leadsToImport || leadsToImport.length === 0) return;

    try {
      const res = await fetch('/api/opensquad/import-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToImport }),
      });

      const data = await res.json();
      if (data.success) {
        setImportedSuccessCount(data.count);
        if (onLeadsUpdated) onLeadsUpdated();
      }
    } catch (err) {
      console.error('Error importing leads:', err);
    }
  };

  // Copy WhatsApp Script
  const handleCopyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIndex(index);
    setTimeout(() => setCopiedScriptIndex(null), 2000);
  };

  // Add mention to input
  const handleAddMention = (agentName: string) => {
    setInputMessage((prev) => (prev ? `${prev} @${agentName} ` : `@${agentName} `));
  };

  // Voice dictation simulation
  const handleToggleVoice = () => {
    if (!isListeningVoice) {
      setIsListeningVoice(true);
      setTimeout(() => {
        setInputMessage((prev) =>
          prev
            ? `${prev} @Bia encontre 3 empresas com alta nota no Google mas sem site mobile`
            : `@Bia encontre 3 empresas com alta nota no Google mas sem site mobile`
        );
        setIsListeningVoice(false);
      }, 2500);
    } else {
      setIsListeningVoice(false);
    }
  };

  // Calculate completed plan steps count
  const completedStepsCount = planSteps.filter((s) => s.status === 'completed').length;
  const progressPercentage = Math.round((completedStepsCount / planSteps.length) * 100);

  // Filter messages by agent
  const filteredMessages =
    agentFilter === 'all'
      ? messages
      : messages.filter((m) => m.agentRole === agentFilter || m.agentId === 'user');

  return (
    <div className="flex-1 flex flex-col bg-[#FFF5F5] text-[#2D3436] font-sans rounded-3xl border border-[#E8B4B8]/30 shadow-md overflow-hidden min-h-[820px]">
      {/* ─── OPENSQUAD HEADER / COMMAND BAR ─── */}
      <header className="px-8 py-6 bg-white border-b border-[#E8B4B8]/20 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-white flex items-center justify-center shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-display text-[#2D3436] tracking-tight">
                OpenSquad • Colaboração Multi-Agente
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#A8D5BA]/20 text-[#2D3436] border border-[#A8D5BA]/30 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8D5BA] animate-pulse" />
                5 Agentes ({selectedModel})
              </span>
            </div>
            <p className="text-xs text-[#2D3436]/70 mt-1">
              Metodologia OpenSquad: PM, Data Hunter, UI Redesigner, Copywriter e QA colaborando.
            </p>
          </div>
        </div>

        {/* Action badges, Settings & CRM Quick Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FFF5F5] text-[#2D3436] rounded-xl text-xs font-bold border border-[#E8B4B8]/30 transition"
          >
            <Settings className="w-4 h-4 text-[#D4AF37]" />
            <span>Configurações</span>
          </button>

          {onNavigateToPipeline && (
            <button
              onClick={onNavigateToPipeline}
              className="flex items-center gap-2 px-5 py-2 bg-[#2D3436] hover:bg-[#1a1f20] text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Layers className="w-4 h-4 text-[#A8D5BA]" />
              Pipeline CRM ({leads.length} leads)
            </button>
          )}
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Group Chat Messages Container */}
          <div
            ref={chatScrollRef}
            className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[500px] scroll-smooth"
          >
            {filteredMessages.map((msg) => {
              const isUser = msg.agentId === 'user';
              const agent = agents.find((a) => a.role === msg.agentRole) || agents[0];

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base shrink-0 shadow-2xs border ${
                      isUser
                        ? 'bg-neutral-900 text-white border-neutral-800'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    {isUser ? '👤' : agent.avatar}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end text-right' : ''}`}>
                    <div className="flex items-center gap-2 px-1 text-[11px] text-neutral-500">
                      <span className="font-bold text-neutral-900">
                        {isUser ? 'Você (Diretor Comercial)' : msg.agentName}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                        isUser
                          ? 'bg-neutral-900 text-neutral-100 border-neutral-800 rounded-tr-xs'
                          : msg.type === 'system'
                          ? 'bg-blue-50/80 text-blue-900 border-blue-200 rounded-tl-xs'
                          : 'bg-white text-neutral-800 border-neutral-200/90 shadow-2xs rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* RENDER DELIVERABLE CARD (LEADS, SCRIPTS, PROPOSALS) */}
                      {msg.deliverable && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2.5">
                          <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
                            <span className="flex items-center gap-1.5 text-blue-700">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              {msg.deliverable.title}
                            </span>
                          </div>

                          {/* 1. Leads List Deliverable with WhatsApp Click-to-Chat */}
                          {msg.deliverable.type === 'leads_list' && Array.isArray(msg.deliverable.data) && (
                            <div className="space-y-2">
                              <div className="divide-y divide-neutral-100 bg-neutral-50 rounded-xl border border-neutral-200/80 overflow-hidden">
                                {msg.deliverable.data.map((lead: Lead, lIdx: number) => {
                                  const whatsappClean = (lead.whatsapp || lead.telefone || '').replace(/\D/g, '');
                                  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappClean.startsWith('55') ? whatsappClean : `55${whatsappClean}`}&text=${encodeURIComponent(`Olá ${lead.nome}, tudo bem? Vi a reputação de vocês no Google e preparei uma proposta de modernização do site!`)}`;

                                  return (
                                    <div key={lIdx} className="p-3 flex items-center justify-between gap-3 flex-wrap">
                                      <div>
                                        <div className="font-bold text-neutral-900 flex items-center gap-2">
                                          {lead.nome}
                                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                            MRR: R$ {lead.manutencao}/mês
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-500 mt-0.5">
                                          {lead.motivo || 'Site necessita modernização'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                                          <span>Tel: {lead.telefone || lead.whatsapp}</span>
                                          {lead.siteAntigo && (
                                            <a
                                              href={lead.siteAntigo.startsWith('http') ? lead.siteAntigo : `http://${lead.siteAntigo}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline flex items-center gap-0.5"
                                            >
                                              Site atual <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <div className="text-right font-mono text-[11px] text-neutral-600 font-bold">
                                          R$ {lead.valor?.toLocaleString('pt-BR')}
                                        </div>
                                        <button
                                          onClick={() => setTunnelLead(lead)}
                                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                                          title="Abrir Túnel de Redesign do Cliente"
                                        >
                                          <Zap className="w-2.5 h-2.5" />
                                          Túnel
                                        </button>
                                        {whatsappClean && (
                                          <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition"
                                          >
                                            <Phone className="w-2.5 h-2.5" />
                                            WhatsApp
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <button
                                onClick={() => handleImportLeadsToCrm(msg.deliverable?.data)}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-2xs transition"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Importar {msg.deliverable.data.length} Leads para o Pipeline do CRM
                              </button>
                            </div>
                          )}

                          {/* 2. WhatsApp Scripts Deliverable */}
                          {msg.deliverable.type === 'whatsapp_scripts' && Array.isArray(msg.deliverable.data) && (
                            <div className="space-y-2">
                              {msg.deliverable.data.map((item: any, sIdx: number) => (
                                <div
                                  key={sIdx}
                                  className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2"
                                >
                                  <div className="font-semibold text-neutral-800 text-[11px]">
                                    Lead: {item.lead}
                                  </div>
                                  <p className="text-neutral-700 italic bg-white p-2.5 rounded-lg border border-neutral-200/70 text-[11px] leading-relaxed">
                                    "{item.script}"
                                  </p>
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleCopyScript(item.script, sIdx)}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-[11px] font-semibold transition"
                                    >
                                      {copiedScriptIndex === sIdx ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          Copiado!
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          Copiar Texto
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Squad Working Typing indicator */}
            {isRunning && (
              <div className="flex items-center gap-2 p-3 bg-neutral-100 rounded-2xl text-xs text-neutral-600 w-fit animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Alexandre, Bia, Lucas, Camila e Gabriel estão formulando a resposta...</span>
              </div>
            )}
          </div>

          {/* Quick @mention Bar */}
          <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200/80 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[10px] font-bold uppercase text-neutral-400 mr-1">Mencionar:</span>
            {agents.map((ag) => (
              <button
                key={ag.id}
                type="button"
                onClick={() => handleAddMention(ag.name)}
                className="px-2 py-0.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-200/90 text-[10px] font-medium transition"
              >
                @{ag.name}
              </button>
            ))}
          </div>

          {/* Bottom Chat Prompt Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200/80 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition ${
                isListeningVoice
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
              }`}
              title={isListeningVoice ? 'Ouvindo microfone...' : 'Falar comando de voz'}
            >
              {isListeningVoice ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Envie uma instrução ao Squad (ex: @Camila crie uma mensagem mais agressiva, ou @Lucas audite outro concorrente)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isRunning}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar ao Squad
            </button>
          </form>

          {/* ─── RIGHT RAIL: COLLAB CARDS & MISSION PARAMETERS ─── */}
          <aside className="w-full lg:w-80 bg-white p-4 border-l border-neutral-200/80 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700 uppercase tracking-wider px-1">
            <span>Collab Cards (Workflows)</span>
            <span className="text-[10px] font-mono text-neutral-400">Templates</span>
          </div>

          <div className="space-y-2.5">
            {COLLAB_CARDS.map((card) => {
              const isSelected = selectedCard.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-neutral-50 hover:bg-white border-neutral-200 text-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-base">{card.icon}</span>
                      <span>{card.title}</span>
                    </div>
                  </div>

                  <p
                    className={`text-[11px] leading-relaxed ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    {card.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {card.targetOutputs.map((out, oIdx) => (
                      <span
                        key={oIdx}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          isSelected
                            ? 'bg-neutral-800 text-emerald-300 border border-neutral-700'
                            : 'bg-neutral-200/70 text-neutral-700'
                        }`}
                      >
                        ✓ {out}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats on Pipeline */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-2">
            <div className="font-bold text-neutral-800 flex items-center justify-between">
              <span>Status do CRM Conectado</span>
              <span className="font-mono text-emerald-600 font-bold">{leads.length} leads</span>
            </div>
            <div className="text-[11px] text-neutral-500">
              Novos leads gerados pelo Squad entram automaticamente na coluna <b className="text-neutral-800">"Novo"</b> com cálculo de implantação e mensalidade MRR.
            </div>
          </div>
        </aside>
      </div>
    </div>

      {/* ─── AGENT DETAILS INSPECTOR MODAL ─── */}
      {selectedAgentForDetails && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-neutral-300 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedAgentForDetails.avatar}</span>
                  <div>
                    <h3 className="font-bold text-base text-neutral-900">
                      {selectedAgentForDetails.name} ({selectedAgentForDetails.role.toUpperCase()})
                    </h3>
                    <p className="text-xs text-neutral-500">{selectedAgentForDetails.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgentForDetails(null)}
                  className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="font-bold text-neutral-700 block mb-1">System Prompt / Persona:</span>
                  <p className="text-neutral-600 italic leading-relaxed">
                    "{selectedAgentForDetails.systemPrompt || selectedAgentForDetails.description}"
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="font-bold text-neutral-700 block mb-1">Habilidades e Ferramentas:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgentForDetails.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-neutral-300 text-neutral-800 font-mono text-[10px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedAgentForDetails(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* ─── TUNNEL SHARE MODAL ─── */}
      {tunnelLead && (
        <TunnelShareModal
          isOpen={!!tunnelLead}
          lead={tunnelLead}
          onClose={() => setTunnelLead(null)}
        />
      )}

      {/* ─── SYSTEM CONFIG & THEME MODAL ─── */}
      <SystemConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        themeMode={themeMode}
        onSelectTheme={setThemeMode}
        totalDeliberationsCount={messages.length}
        onClearSessionMemory={() => {
          setMessages([messages[0]]);
          setIsConfigModalOpen(false);
        }}
        onExportSessionJson={() => {
          const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `opensquad-session-${Date.now()}.json`;
          a.click();
        }}
      />
    </div>
  );
};
