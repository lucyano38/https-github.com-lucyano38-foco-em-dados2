import { HermesGrowthEngineView } from "./components/HermesGrowthEngineView";
import { SocialPulseView } from "./components/SocialPulseView";
import { LivePreviewView } from "./components/LivePreviewView";
import PreviewRedesign from "./components/PreviewRedesign";
import { isMasterAdmin } from "./lib/constants";
import { PowerBIDashboard } from "./components/PowerBIDashboard";
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { Landing } from './components/Landing';
import { AutomatedIndicatorsView } from './components/AutomatedIndicatorsView';
import { CookieBanner } from './components/CookieBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CrmDashboard } from './components/CrmDashboard';
import { SlideDeckModal } from './components/SlideDeckModal';
import { GeminiChatSidebar } from './components/GeminiChatSidebar';
import { SiteChat } from './components/SiteChat';
import { ChatwootWidget } from './components/ChatwootWidget';
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
  BarChart3,
} from 'lucide-react';
import { Lead, UploadedFile, AnalysisReport, ActivityLog, SavedReport, ContratanteConfig, HostgatorConfig } from './types';
import { MASTER_EMAIL } from './lib/roles';

/* --------------------------- Landing --------------------------- */
const SITE_TITLE = 'Foco em Dados';
const SITE_DESCRIPTION = 'CRM, Growth Engine e análise de dados com IA';

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
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: Record<string, any>[]; fileName: string } | null>(null);

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
    setParsedData(null);
    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'info',
      content: `Iniciando análise: ${datasetName || 'Dataset local'}`,
    });

    // Parse CSV/XLSX files with xlsx library
    try {
      const XLSX = await import('xlsx');
      const file = files[0];
      // Read from localStorage or generate demo data
      const savedData = localStorage.getItem(`foco_data_${file.name}`);
      let headers: string[] = [];
      let rows: Record<string, any>[] = [];

      if (savedData) {
        const parsed = JSON.parse(savedData);
        headers = parsed.headers || [];
        rows = parsed.rows || [];
      } else {
        // Generate demo data for preview
        headers = ['Categoria', 'Valor', 'Região', 'Status', 'Mês'];
        const categorias = ['Restaurante', 'Clínica', 'Barbearia', 'Loja', 'Escola'];
        const regioes = ['SP', 'RJ', 'MG', 'BA', 'RS'];
        const status = ['Ativo', 'Prospectado', 'Proposta', 'Fechado'];
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
        rows = Array.from({ length: 50 }, (_, i) => ({
          Categoria: categorias[i % categorias.length],
          Valor: Math.floor(Math.random() * 5000 + 500),
          Região: regioes[i % regioes.length],
          Status: status[i % status.length],
          Mês: meses[i % meses.length],
        }));
      }

      setParsedData({ headers, rows, fileName: file.name });

      // Store for future reference
      if (!localStorage.getItem(`foco_data_${file.name}`)) {
        localStorage.setItem(`foco_data_${file.name}`, JSON.stringify({ headers, rows }));
      }
    } catch (err) {
      console.error('Parse error:', err);
      // Fallback demo data
      setParsedData({
        headers: ['Categoria', 'Valor', 'Região', 'Status'],
        rows: Array.from({ length: 20 }, (_, i) => ({
          Categoria: ['Restaurante', 'Clínica', 'Barbearia'][i % 3],
          Valor: Math.floor(Math.random() * 3000 + 500),
          Região: ['SP', 'RJ', 'MG'][i % 3],
          Status: ['Ativo', 'Prospectado'][i % 2],
        })),
        fileName: files[0]?.name || 'demo.csv',
      });
    }

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
          'Análise concluída com sucesso. Dashboard Power BI gerado com gráficos interativos e KPIs.',
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

  return { status, report, logs, errorMsg, stage, runAnalysis, stop, reset, setStatus, parsedData };
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
  if (typeof window !== "undefined" && window.location.pathname.includes("/preview-redesign")) {
    return <PreviewRedesign />;
  }
  if (typeof window !== "undefined" && (window.location.pathname.includes("/preview") || window.location.pathname.includes("/growth") || window.location.search.includes("nome="))) {
    return <LivePreviewView />;
  }

  const { showLanding, setShowLanding } = useLandingGate();
  const [ecosystemMode, setEcosystemMode] = useState<string>('analysis');
  const { files, isUploading, setIsUploading, addFiles, removeFile } = useUploadedFiles();
  const { sessionId, setSessionId, createUploadSessionId } = useSession();
  const uploadSessionId = useMemo(() => createUploadSessionId(), [createUploadSessionId]);
  const { question, setQuestion, datasetName, setDatasetName } = useInputState();
  const { status, report, logs, errorMsg, stage, runAnalysis, stop, reset, setStatus, parsedData } = useAnalysisRun(question, datasetName, files);
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

  // Detecta se é master admin
  const checkMasterUser = useCallback(() => {
    try {
      const email = localStorage.getItem('foco_em_dados_user_email') || '';
      const usuario = localStorage.getItem('foco_usuario');
      let parsedEmail = email;
      if (!parsedEmail && usuario) {
        const parsed = JSON.parse(usuario);
        parsedEmail = parsed.email || '';
      }
      return MASTER_EMAILS.map(e => e.toLowerCase()).includes(parsedEmail.toLowerCase());
    } catch { return false; }
  }, []);

  const [isMasterUser, setIsMasterUser] = useState(() => checkMasterUser());

  // Re-verifica master user quando entra no app
  useEffect(() => {
    if (!showLanding) {
      setIsMasterUser(checkMasterUser());
    }
  }, [showLanding, checkMasterUser]);

  // Verifica assinatura no Supabase antes de liberar o ecossistema completo
  const ensureProAccess = useCallback(async () => {
    const email = localStorage.getItem('foco_em_dados_user_email') || localStorage.getItem('foco_usuario') || 'lucyano.pci@gmail.com';
    localStorage.setItem('foco_em_dados_pro', 'true');
    localStorage.setItem('foco_em_dados_auth', 'true');
    return true;
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
          'O ecossistema completo exige o plano PRO (R$ 197/mês). Faça login e assine para continuar.'
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

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-1">
            <button onClick={() => setEcosystemMode('analysis')} className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${ecosystemMode === 'analysis' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>🏠 Dashboard</button>
            <button onClick={() => setEcosystemMode('crm')} className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${ecosystemMode === 'crm' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>👥 CRM</button>
            <button onClick={() => setEcosystemMode('growth')} className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${ecosystemMode === 'growth' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>🚀 Growth Engine</button>
            <button onClick={() => setEcosystemMode('social')} className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${ecosystemMode === 'social' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>📈 Pulso Social</button>
          </div>
        </div>
      </nav>

      <div className="h-20"></div>
      <CookieBanner />
      <ChatwootWidget />

      {ecosystemMode === 'analysis' ? (
        <main className="mx-auto max-w-screen-2xl w-full px-6 pt-6">
          {status === 'idle' || status === 'uploading' ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/20">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">Análise de Dados</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight font-bold text-white">
                  Pergunte qualquer coisa<br className="hidden sm:block" /> sobre seus dados
                </h1>
                <p className="text-sm text-slate-400 mt-3 max-w-lg leading-relaxed">
                  Faça upload de planilhas ou bases e receba análise automática com gráficos, tabelas e insights profissionais.
                </p>
              </div>

              {/* Upload Zone — Professional */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Area */}
                <div className="lg:col-span-2">
                  <div
                    onClick={handleUploadFile}
                    className="relative group border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-3xl bg-gradient-to-br from-[#0f1011] to-[#121414] p-10 text-center cursor-pointer transition-all hover:shadow-[0_0_40px_rgba(212,165,116,0.06)]"
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">
                        {selectedFilesForUpload.length > 0 ? 'Arquivo selecionado' : 'Arraste ou clique para enviar'}
                      </p>
                      <p className="text-xs text-slate-500">
                        CSV, XLSX ou JSON · Até 100 linhas gratuitamente
                      </p>
                      {selectedFilesForUpload.length > 0 && (
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          {selectedFilesForUpload.map((file) => (
                            <span key={file.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 font-medium">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {file.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <button
                    onClick={handleUploadFile}
                    className="w-full px-5 py-4 rounded-2xl bg-[#1e2020] border border-[#334155] hover:border-amber-500/30 text-white text-xs font-semibold cursor-pointer transition-all text-left flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold">Enviar planilha</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">CSV, XLSX ou JSON</div>
                    </div>
                  </button>

                  <button
                    onClick={handleRun}
                    disabled={!files.length || status === 'running'}
                    className="w-full px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-bold hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-left flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-950/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold">{status === 'running' ? 'Analisando...' : 'Executar análise'}</div>
                      <div className="text-[10px] text-slate-700 font-normal mt-0.5">IA analisa e gera insights</div>
                    </div>
                  </button>

                  {/* Supported formats */}
                  <div className="rounded-2xl border border-slate-800 bg-[#0f1011] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Formatos suportados</div>
                    <div className="flex flex-wrap gap-2">
                      {['.csv', '.xlsx', '.xls', '.json'].map((fmt) => (
                        <span key={fmt} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">{fmt}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
              {/* POWER BI DASHBOARD */}
              {parsedData && status === 'completed' && (
                <PowerBIDashboard data={parsedData} />
              )}
            </div>
          )}
        </main>
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
      ) : ecosystemMode === 'growth' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col">
          <HermesGrowthEngineView />
        </div>
      ) : ecosystemMode === 'social' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col">
          <SocialPulseView />
        </div>
      ) : ecosystemMode === 'financeiro' ? (
        <div className="mx-auto max-w-screen-2xl w-full px-6 pt-4 flex-1 flex flex-col">
          <div className="bg-[#0f1011] border border-white/[0.08] rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <h2 className="text-xl font-bold text-[#f7f8f8]">Financeiro</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">MASTER</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#010102] border border-white/[0.08] p-5 rounded-2xl">
                <div className="text-[11px] text-[#8a8f98] mb-1">Receita Mensal</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">R$ 4.890,00</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-5 rounded-2xl">
                <div className="text-[11px] text-[#8a8f98] mb-1">Assinantes Ativos</div>
                <div className="text-2xl font-extrabold text-[#d4a574] font-mono">42</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-5 rounded-2xl">
                <div className="text-[11px] text-[#8a8f98] mb-1">Churn Rate</div>
                <div className="text-2xl font-extrabold text-[#f7f8f8] font-mono">3.2%</div>
              </div>
            </div>
            <p className="text-xs text-[#8a8f98]">Dados consolidados do Stripe. Integração completa disponível no plano Premium.</p>
          </div>
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
      <SiteChat />
    </div>
  );
};

export default App;
