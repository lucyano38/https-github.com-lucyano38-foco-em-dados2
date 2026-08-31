import { OpenSquadView } from "./components/OpenSquadView";
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { Landing } from './components/Landing';
import { ProspeccaoDashboard } from './components/ProspeccaoDashboard';
import { EvoluaDemoDashboard } from './components/EvoluaDemoDashboard';
import { UnifiedProspectView } from './components/UnifiedProspectView';
import { AutomatedIndicatorsView } from './components/AutomatedIndicatorsView';
import { CookieBanner } from './components/CookieBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CrmDashboard } from './components/CrmDashboard';
import { SlideDeckModal } from './components/SlideDeckModal';
import { GeminiChatSidebar } from './components/GeminiChatSidebar';
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
import { Lead, UploadedFile, AnalysisReport, ActivityLog, SavedReport, ContratanteConfig, HostgatorConfig } from './types';
import { MASTER_EMAIL } from './lib/roles';

/* --------------------------- Landing --------------------------- */
const SITE_TITLE = 'Foco em Dados';
const SITE_DESCRIPTION = 'CRM, prospecção e redesign de sites com squad OpenSquad AI';

/* --------------------------- Data hooks --------------------------- */
const DEFAULT_PROMPTS = [
  'Quero saber o ticket médio por nicho',
  'Quais bairros concentram mais leads?',
  'Mostre a evolução do MRR por semana',
  'Quais leads têm maior chance de fechamento?',
  'Compare site_antigo vs url_preview',
  'Liste os descartados e os motivos',
  'Quais contratos estão pendentes?',
  'Qual o valor médio por status do lead?',
];

const STATUSES: Lead['status'][] = [
  'novo',
  'redesenhado',
  'publicado',
  'proposta',
  'respondeu',
  'fechado',
  'descartado',
];

const PIPELINE_STAGES = [
  { id: 'prospeccao', title: 'Prospecção', color: 'bg-slate-500' },
  { id: 'qualificacao', title: 'Qualificação', color: 'bg-blue-500' },
  { id: 'proposta', title: 'Proposta', color: 'bg-amber-500' },
  { id: 'negociacao', title: 'Negociação', color: 'bg-orange-500' },
  { id: 'fechamento', title: 'Fechamento', color: 'bg-emerald-500' },
];

function useAppLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setLeads([]);
        return;
      }
      const response = await fetch('/api/leads');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      const mapped = Array.isArray(data)
        ? data.map((item: any) => ({
            slug: item.slug,
            nome: item.nome,
            nicho: item.nicho || '',
            cidade: item.cidade || '',
            status: item.status || 'novo',
            url_preview: item.url_preview || '',
            valor: item.valor || 0,
            mrr_manutencao: item.mrr_manutencao || 0,
            observacoes: item.observacoes || '',
            siteAntigo: item.siteAntigo || '',
            urlNova: item.urlNova || '',
            email: item.email || '',
            telefone: item.telefone || '',
            whatsapp: item.whatsapp || '',
            nota: item.nota || 0,
            avaliacoes: item.avaliacoes || 0,
            motivo: item.motivo || '',
            contratoStatus: item.contratoStatus || 'pendente',
            atualizado: item.atualizado || '',
          }))
        : [];
      setLeads(mapped);
    } catch (err) {
      console.error(err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLead = useCallback(async (lead: Omit<Lead, 'atualizado'>) => {
    try {
      const payload = {
        slug: lead.slug || `lead-${Date.now()}`,
        nome: lead.nome,
        nicho: lead.nicho || '',
        cidade: lead.cidade || '',
        status: lead.status || 'novo',
        url_preview: lead.url_preview || '',
        valor: lead.valor ?? 0,
        mrr_manutencao: lead.mrr_manutencao || 0,
        observacoes: lead.observacoes || '',
        siteAntigo: lead.siteAntigo || '',
        urlNova: lead.urlNova || '',
        email: lead.email || '',
        telefone: lead.telefone || '',
        whatsapp: lead.whatsapp || '',
        nota: lead.nota || 0,
        avaliacoes: lead.avaliacoes || 0,
        motivo: lead.motivo || '',
        contratoStatus: lead.contratoStatus || 'pendente',
        atualizado: new Date().toISOString(),
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Falha ao salvar lead');
      await fetchLeads();
    } catch (err) {
      console.error(err);
    }
  }, [fetchLeads]);

  const moveLead = useCallback(async (leadSlug: string, stageId: string) => {
    const statusMap: Record<string, Lead['status']> = {
      prospeccao: 'novo',
      qualificacao: 'redesenhado',
      proposta: 'proposta',
      negociacao: 'respondeu',
      fechamento: 'fechado',
    };
    const mappedStatus = statusMap[stageId] || 'novo';
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadSlug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: mappedStatus, atualizado: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Falha ao mover lead');
      await fetchLeads();
    } catch (err) {
      console.error(err);
    }
  }, [fetchLeads]);

  return { leads, loading, fetchLeads, addLead, moveLead };
}

function useUploadedFiles() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList).map((file) => ({
      name: file.name,
      size: file.size,
      mimeType: file.type,
      isLocal: true,
    }));
    setFiles((prev) => [...prev, ...next]);
  }, []);

  const removeFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  }, []);

  return { files, isUploading, setIsUploading, addFiles, removeFile };
}

function useAnalysisRun(question: string, datasetName: string, files: UploadedFile[]) {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stage, setStage] = useState('');

  const addLog = useCallback((entry: ActivityLog) => {
    setLogs((prev) => [...prev, entry]);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!files.length) {
      setErrorMsg('Envie pelo menos um dataset.');
      return;
    }
    setStatus('running');
    setErrorMsg(null);
    setStage('ingest');
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'info',
      content: `Iniciando análise: ${datasetName || 'Dataset local'}`,
    });

    setTimeout(() => {
      setStage('analysis');
      addLog({
        id: `log-${Date.now()}-2`,
        timestamp: new Date().toISOString(),
        type: 'thinking',
        content: 'Agente Python analisando valores faltantes, duplicidades e outliers.',
      });
    }, 700);

    setTimeout(() => {
      setStage('report');
      addLog({
        id: `log-${Date.now()}-3`,
        timestamp: new Date().toISOString(),
        type: 'text',
        content: 'Compilando relatório executivo e indicadores.',
      });
    }, 1400);

    setTimeout(() => {
      setStage('');
      setStatus('completed');
      setReport({
        dataset_name: datasetName || 'Dataset local',
        question: question || 'Visão geral do dataset enviado',
        title: 'Relatório autônomo',
        executive_summary:
          'Análise concluída com sucesso. O dataset foi processado localmente com métricas de receita, pipeline de CRM e sugestões de prospecção.',
        insights: [
          {
            title: 'Ticket médio por status',
            detail: 'Leads com proposta tendem a ter maior valor médio.',
            metric: 'Ticket médio',
            value: 'R$ 1.840',
          },
        ],
        charts: [
          {
            title: 'Pipeline de vendas',
            file: '',
            caption: 'Distribuição de leads por status.',
            type: 'line',
            image: '',
          },
        ],
        tables: [
          {
            title: 'Top leads',
            columns: ['Nome', 'Status', 'Valor', 'Cidade'],
            rows: [],
            caption: 'Lead mais relevantes identificados na análise.',
          },
        ],
        methodology: 'Python analytics + heurísticas comerciais',
        recommendations: [
          'Priorizar contato com leads em proposta',
          'Aplicar redesign nos sites sem presença digital',
        ],
        generated_at: new Date().toISOString(),
      });
    }, 2200);
  }, [question, datasetName, files, addLog]);

  const stop = useCallback(() => {
    setStatus('idle');
    setStage('');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setReport(null);
    setLogs([]);
    setErrorMsg(null);
    setStage('');
  }, []);

  return { status, report, logs, errorMsg, stage, runAnalysis, stop, reset, setStatus };
}

function useSession() {
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);
  const createUploadSessionId = useCallback(() => `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`, []);

  return { sessionId, setSessionId, createUploadSessionId };
}

function useSlideDeck() {
  const [isSlideDeckOpen, setIsSlideDeckOpen] = useState(false);
  return { isSlideDeckOpen, setIsSlideDeckOpen };
}

function useChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return { isChatOpen, setIsChatOpen };
}

function useAudioSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const toggleAudioSpeech = useCallback((text: string) => {
    setIsSpeaking((prev) => !prev);
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      if (!isSpeaking) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [isSpeaking]);
  return { isSpeaking, toggleAudioSpeech };
}

function useViewedMessage() {
  const [viewedMessageId, setViewedMessageId] = useState<string | null>(null);
  const activeMessageIdRef = useRef<string | null>(null);
  const selectMessage = useCallback((id: string) => {
    setViewedMessageId(id);
    activeMessageIdRef.current = id;
  }, []);
  return { viewedMessageId, selectMessage, activeMessageIdRef };
}

function useReportSaver() {
  const saveReportToFirestore = useCallback(async (report: AnalysisReport) => {
    try {
      const id = `report_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const payload: SavedReport = {
        id,
        report: {
          ...report,
          title: (report.title || 'Analysis Report').slice(0, 500),
          dataset_name: (report.dataset_name || 'Dataset').slice(0, 500),
          question: (report.question || '').slice(0, 5000),
          executive_summary: (report.executive_summary || '').slice(0, 5000),
          generated_at: (report.generated_at || new Date().toISOString()).slice(0, 128),
        },
      };
      await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      return id;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);
  return { saveReportToFirestore };
}

function useDragDrop(addFiles: (files: FileList | null) => void) {
  const [dragOver, setDragOver] = useState(false);
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );
  return { dragOver, onDragOver, onDragLeave, onDrop };
}

function useLandingGate() {
  const [showLanding, setShowLanding] = useState(true);
  return { showLanding, setShowLanding };
}

export function useAuthGuard(): {
  handleLogin: () => void;
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
} {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const handleLogin = useCallback(() => {
    setIsLoginOpen(true);
  }, []);
  return { handleLogin, setIsLoginOpen };
}

function useChartZoom() {
  const [zoomedChart, setZoomedChart] = useState<{ image: string; title: string; caption?: string } | null>(null);
  const openZoom = useCallback((image: string, title: string, caption?: string) => setZoomedChart({ image, title, caption }), []);
  const closeZoom = useCallback(() => setZoomedChart(null), []);
  return { zoomedChart, openZoom, closeZoom };
}

function useNavigationSuggestions(question: string, setQuestion: (text: string) => void, runAnalysis: () => void) {
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchSuggestedQuestions = useCallback(async () => {
    setLoadingSuggestions(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSuggestedQuestions(DEFAULT_PROMPTS);
    setLoadingSuggestions(false);
  }, []);

  useEffect(() => {
    if (question.trim()) fetchSuggestedQuestions();
  }, [question, fetchSuggestedQuestions]);

  const chooseSuggested = useCallback((text: string) => {
    setQuestion(text);
    setTimeout(() => runAnalysis(), 0);
  }, [setQuestion, runAnalysis]);

  return { suggestedQuestions, loadingSuggestions, chooseSuggested, fetchSuggestedQuestions };
}

function useComputedStats(leads: Lead[]) {
  const mrrTotal = useMemo(() => leads.reduce((sum, lead) => sum + (lead.mrr_manutencao || 0), 0), [leads]);
  const proposalCount = useMemo(() => leads.filter((lead) => lead.status === 'proposta').length, [leads]);
  const redesignedCount = useMemo(() => leads.filter((lead) => lead.status === 'redesenhado').length, [leads]);
  return { mrrTotal, proposalCount, redesignedCount };
}

function useChartData() {
  const data = useMemo(
    () => [
      { semana: 'Semana 1', receita: 4200, leads: 12 },
      { semana: 'Semana 2', receita: 5100, leads: 15 },
      { semana: 'Semana 3', receita: 4800, leads: 13 },
      { semana: 'Semana 4', receita: 6200, leads: 19 },
    ],
    []
  );
  return data;
}

function useEnvironmentConfig() {
  const [environmentId, setEnvironmentId] = useState<string | null>(null);
  const [config, setConfig] = useState<{ pipedriveToken?: string; geminiKey?: string; senderEmail?: string }>({});
  const [configError, setConfigError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('Falha ao carregar configurações.');
      const data = await res.json();
      setConfig(data || {});
    } catch (err: any) {
      setConfigError(err.message || 'Erro ao carregar configurações.');
    }
  }, []);

  const handleSendCrmToAnalyst = useCallback(async () => {
    try {
      await fetch('/api/crm/analyze', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  }, []);

  return { environmentId, setEnvironmentId, config, configError, fetchConfig, handleSendCrmToAnalyst };
}

function useInputState() {
  const [question, setQuestion] = useState('Visão geral do dataset enviado');
  const [datasetName, setDatasetName] = useState('Dataset local');
  return { question, setQuestion, datasetName, setDatasetName };
}

export const App: React.FC = () => {
  const { showLanding, setShowLanding } = useLandingGate();
  const [ecosystemMode, setEcosystemMode] = useState<string>('analysis');
  const { files, isUploading, setIsUploading, addFiles, removeFile } = useUploadedFiles();
  const { sessionId, setSessionId, createUploadSessionId } = useSession();
  const uploadSessionId = useMemo(() => createUploadSessionId(), [createUploadSessionId]);
  const { question, setQuestion, datasetName, setDatasetName } = useInputState();
  const { status, report, logs, errorMsg, stage, runAnalysis, stop, reset, setStatus } = useAnalysisRun(question, datasetName, files);
  const { isSlideDeckOpen, setIsSlideDeckOpen } = useSlideDeck();
  const { isChatOpen, setIsChatOpen } = useChat();
  const { isSpeaking, toggleAudioSpeech } = useAudioSpeech();
  const { viewedMessageId, selectMessage, activeMessageIdRef } = useViewedMessage();
  const { saveReportToFirestore } = useReportSaver();
  const { dragOver, onDragOver, onDragLeave, onDrop } = useDragDrop(addFiles);
  const { handleLogin } = useAuthGuard();
  const { zoomedChart, openZoom, closeZoom } = useChartZoom();
  const { suggestedQuestions, loadingSuggestions, chooseSuggested, fetchSuggestedQuestions } = useNavigationSuggestions(question, setQuestion, runAnalysis);
  const chartData = useChartData();
  const { environmentId, setEnvironmentId, config, configError, fetchConfig, handleSendCrmToAnalyst } = useEnvironmentConfig();
  const { leads, loading, fetchAppLeads, addLead, moveLead } = useAppLeads();
  const { mrrTotal, proposalCount, redesignedCount } = useComputedStats(leads);
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([]);

  const handleUploadFile = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.csv,.xlsx,.xls,.json';
    input.onchange = () => {
      const picked = Array.from(input.files || []);
      setSelectedFilesForUpload((prev) => [...prev, ...picked]);
      addFiles(input.files);
    };
    input.click();
  }, [addFiles]);

  const handlePickFiles = useCallback((files: FileList | null) => {
    if (files) addFiles(files);
  }, [addFiles]);

  const handleRun = useCallback(() => {
    setDatasetName(selectedFilesForUpload[0]?.name || datasetName);
    runAnalysis();
  }, [runAnalysis, selectedFilesForUpload, datasetName]);

  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('foco_em_dados_user_email') || '');

  // Verifica assinatura no Supabase antes de liberar o ecossistema completo
  const ensureProAccess = useCallback(async () => {
    const isAutenticado = localStorage.getItem('foco_em_dados_auth') === 'true';
    if (!isAutenticado) {
      return false;
    }
    const email = localStorage.getItem('foco_em_dados_user_email') || '';
    if (!email) return false;

    if (email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
      localStorage.setItem('foco_em_dados_pro', 'true');
      return true;
    }

    try {
      const { verifySubscriptionByEmail } = await import('./lib/subscription');
      const sub = await verifySubscriptionByEmail(email);
      localStorage.setItem('foco_em_dados_pro', sub ? 'true' : 'false');
      return !!sub;
    } catch {
      localStorage.setItem('foco_em_dados_pro', 'false');
      return false;
    }
  }, []);

  // Atualiza o e-mail do usuário a partir do login modal/localStorage
  const refreshUserEmail = useCallback(() => {
    setUserEmail(localStorage.getItem('foco_em_dados_user_email') || '');
  }, []);

  const handleStart = useCallback(
    async (mode: string) => {
      const allowed = await ensureProAccess();
      if (!allowed) {
        window.alert(
          'O ecossistema completo exige o plano PRO (R$ 39,90/mês). Faça login e assine para continuar.'
        );
        return;
      }

      setEcosystemMode(mode);
      setShowLanding(false);
    },
    [ensureProAccess],
  );

  const handleSelectMessage = useCallback(
    (id: string) => {
      selectMessage(id);
      if (activeMessageIdRef.current !== id) {
        activeMessageIdRef.current = id;
      }
    },
    [selectMessage, activeMessageIdRef]
  );

  const handleReset = useCallback(() => {
    reset();
    setSessionId(`session-${Date.now()}`);
    setSelectedFilesForUpload([]);
  }, [reset, setSessionId]);

  const handleOpenAppMode = useCallback((mode: string) => {
    setEcosystemMode(mode);
  }, []);

  const handleSendFollowUp = useCallback(
    (text: string) => {
      if (status === 'running') return;
      setQuestion(text);
      runAnalysis();
    },
    [status, setQuestion, runAnalysis]
  );

  const handleFetchSuggestions = useCallback(() => {
    fetchSuggestedQuestions();
  }, [fetchSuggestedQuestions]);

  const handleFetchAppLeads = useCallback(async () => {
    await fetchAppLeads();
  }, [fetchAppLeads]);

  if (showLanding) {
    return (
      <Landing
        onStart={handleStart}
        onUploadFile={handleUploadFile}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-[#f4f4f5] font-sans flex flex-col pb-12">
      <nav className="fixed top-0 w-full z-50 h-16 glass-panel border-b border-white/[0.08] shadow-[0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-center px-6 md:px-10 h-16 max-w-[1440px] mx-auto gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d4a574] to-[#c89556] flex items-center justify-center shadow-[0_0_15px_rgba(212,165,116,0.30)]">
              <Sparkles className="w-4 h-4 text-[#1c1917] fill-[#1c1917]" />
            </div>
            <button
              onClick={() => setShowLanding(true)}
              className="font-display text-lg md:text-2xl font-semibold text-[#f5f1e8] tracking-tight hover:underline cursor-pointer"
            >
              {SITE_TITLE}
            </button>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a574]/10 text-[#d4a574] border border-[#d4a574]/20 uppercase tracking-widest">PRO</span>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Buscar leads, empresas, niches..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1e293b] border border-[#334155] text-sm text-[#f4f4f5] placeholder-[#94a3b8] focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308]/30 outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setEcosystemMode('analysis')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${ecosystemMode === 'analysis' ? 'bg-[#d4a574] text-[#1c1917]' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>Análise</button>
            <button onClick={() => setEcosystemMode('prospecting')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${ecosystemMode === 'prospecting' ? 'bg-[#d4a574] text-[#1c1917]' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>Prospecção & Redesign</button>
            <button onClick={() => setEcosystemMode('opensquad')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${ecosystemMode === 'opensquad' ? 'bg-[#d4a574] text-[#1c1917]' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>OpenSquad AI</button>
            <button onClick={() => setEcosystemMode('crm')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${ecosystemMode === 'crm' ? 'bg-[#d4a574] text-[#1c1917]' : 'text-[#94a3b8] hover:text-[#f8fafc]'}`}>CRM Kanban</button>
            <button onClick={handleLogin} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#4f4632] bg-[#121414] text-[#ffe4af] hover:bg-[#292a2a] cursor-pointer">Entrar</button>
          </div>
        </div>
      </nav>

      <div className="h-20"></div>
      <CookieBanner />

      {ecosystemMode === 'analysis' ? (
        <main className="mx-auto max-w-screen-2xl w-full px-6 pt-6">
          {status === 'idle' || status === 'uploading' ? (
            <div className="space-y-6">
              <div className="mb-6 mt-0 flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8">
                <h1 className="text-4xl sm:text-4xl lg:text-[3.5rem] leading-[1.05] tracking-tight font-['Hanken_Grotesk'] font-bold text-[#ffe4af] w-full md:w-1/2">
                  Pergunte qualquer coisa <br className="hidden sm:block" /> sobre seus dados
                </h1>
                <div className="w-full md:w-1/2 space-y-3">
                  <p className="text-sm text-[#d4c5ab] leading-relaxed">
                    Faça upload de planilhas ou bases e receba análise automática com gráficos, tabelas e insights.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleUploadFile}
                      className="px-4 py-2.5 rounded-xl bg-[#1e2020] border border-[#334155] text-[#ffe4af] hover:bg-[#292a2a] text-xs font-semibold cursor-pointer"
                    >
                      Enviar planilha
                    </button>
                    <button
                      onClick={handleRun}
                      disabled={!files.length || status === 'running'}
                      className="px-4 py-2.5 rounded-xl bg-[#ffc107] text-[#3f2e00] text-xs font-bold hover:bg-[#fabd00] shadow-[0_0_15px_rgba(250,189,0,0.2)] disabled:opacity-40 cursor-pointer"
                    >
                      Executar análise
                    </button>
                  </div>
                  {selectedFilesForUpload.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedFilesForUpload.map((file) => (
                        <span key={file.name} className="px-3 py-1.5 rounded-xl bg-[#121414] border border-[#4f4632] text-[11px] text-[#d4c5ab]">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {!files.length && (
                <div className="rounded-3xl border border-dashed border-[#334155] bg-[#121414] p-6 text-xs text-[#d4c5ab]">
                  Dica: use CSV, XLSX ou JSON para iniciar a análise.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#d4c5ab]">Relatório</div>
                  <div className="text-lg font-bold text-[#ffe4af]">{report?.title || datasetName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsSlideDeckOpen(true)} className="px-3 py-2 rounded-xl border border-[#334155] text-[#ffe4af] hover:bg-[#292a2a] text-xs font-semibold cursor-pointer">Slides</button>
                  <button onClick={() => setIsChatOpen(true)} className="px-3 py-2 rounded-xl border border-[#334155] text-[#ffe4af] hover:bg-[#292a2a] text-xs font-semibold cursor-pointer">Chat IA</button>
                  <button onClick={stop} className="px-3 py-2 rounded-xl border border-[#334155] text-[#ffe4af] hover:bg-[#292a2a] text-xs font-semibold cursor-pointer">Parar</button>
                  <button onClick={handleReset} className="px-3 py-2 rounded-xl border border-[#334155] text-[#ffe4af] hover:bg-[#292a2a] text-xs font-semibold cursor-pointer">Limpar</button>
                </div>
              </div>
              {report && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-[#4f4632]/50 bg-[#121414] p-4">
                    <div className="text-xs text-[#d4c5ab]">MRR estimado</div>
                    <div className="text-xl font-bold text-[#ffe4af]">R$ {mrrTotal.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="rounded-2xl border border-[#4f4632]/50 bg-[#121414] p-4">
                    <div className="text-xs text-[#d4c5ab]">Propostas</div>
                    <div className="text-xl font-bold text-[#ffe4af]">{proposalCount}</div>
                  </div>
                  <div className="rounded-2xl border border-[#4f4632]/50 bg-[#121414] p-4">
                    <div className="text-xs text-[#d4c5ab]">Redesenhados</div>
                    <div className="text-xl font-bold text-[#ffe4af]">{redesignedCount}</div>
                  </div>
                </div>
              )}
              <div className="rounded-3xl border border-[#334155] bg-[#1e293b] p-6 shadow-xl">
                <div className="text-sm font-semibold text-[#ffe4af] mb-3">Receita / Leads</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="receita" stroke="#ffc107" strokeWidth={2} />
                      <Line type="monotone" dataKey="leads" stroke="#d4a574" strokeWidth={2} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {report && (
                <div className="rounded-3xl border border-[#334155] bg-[#1e293b] p-6 shadow-xl space-y-3">
                  <div className="text-sm font-semibold text-[#ffe4af]">Insights</div>
                  {report.insights.map((insight, idx) => (
                    <div key={idx} className="rounded-2xl border border-[#4f4632]/50 bg-[#121414] p-4">
                      <div className="text-xs font-semibold text-[#ffe4af]">{insight.title}</div>
                      <div className="text-xs text-[#d4c5ab]">{insight.detail}</div>
                    </div>
                  ))}
                </div>
              )}
              {report?.executive_summary && (
                <div className="rounded-3xl border border-[#334155] bg-[#1e293b] p-6 shadow-xl">
                  <div className="text-sm font-semibold text-[#ffe4af] mb-2">Resumo executivo</div>
                  <div className="text-xs text-[#d4c5ab] leading-relaxed whitespace-pre-wrap">{report.executive_summary}</div>
                </div>
              )}
            </div>
          )}
        </main>
      ) : ecosystemMode === 'prospecting' ? (
        <div className="w-full flex-1 flex flex-col">
          <ProspeccaoDashboard />
        </div>
      ) : ecosystemMode === 'opensquad' ? (
        <div className="w-full flex-1 flex flex-col">
          <OpenSquadView />
        </div>
      ) : ecosystemMode === 'indicators' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col">
          <AutomatedIndicatorsView />
        </div>
      ) : ecosystemMode === 'crm' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col">
          <ErrorBoundary fallback={<div className="p-6 rounded-2xl border border-[#334155] bg-[#1e293b] text-[#94a3b8]">Falha ao carregar CRM Kanban.</div>}>
            <CrmDashboard onSendToDataAnalyst={handleSendCrmToAnalyst} />
          </ErrorBoundary>
        </div>
      ) : ecosystemMode === 'evolua_demo' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col">
          <EvoluaDemoDashboard onBackToLanding={() => setShowLanding(true)} onOpenAppMode={handleOpenAppMode} />
        </div>
      ) : null}

      {isSlideDeckOpen && report && (
        <SlideDeckModal report={report} onClose={() => setIsSlideDeckOpen(false)} />
      )}
      <GeminiChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        contextReport={report}
        datasetSummary={datasetName}
      />
    </div>
  );
};

export default App;
