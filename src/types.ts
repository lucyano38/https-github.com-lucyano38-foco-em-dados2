export interface ReportInsight {
  title: string;
  detail: string;
  metric?: string;
  value?: string;
}

export interface ReportChart {
  title: string;
  file: string;
  caption?: string;
  type?: string;
  /** Base64 data URL injected by the server after extracting the PNG from the sandbox. */
  image?: string;
}

export interface ReportTable {
  title: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
  caption?: string;
}

export interface AnalysisReport {
  dataset_name: string;
  question: string;
  title: string;
  executive_summary: string;
  insights: ReportInsight[];
  charts: ReportChart[];
  tables: ReportTable[];
  methodology?: string;
  recommendations?: string[];
  generated_at?: string;
}

export type ActivityType =
  | 'info'
  | 'thinking'
  | 'text'
  | 'tool_call'
  | 'tool_result'
  | 'error';

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: ActivityType;
  content?: string;
  name?: string;
  args?: Record<string, unknown>;
  result?: string;
}

export interface UploadedFile {
  name: string;
  content?: string;
  gsUri?: string;
  localPath?: string;
  isLocal?: boolean;
  isGcsUri?: boolean;
  size?: number;
  driveId?: string;
  mimeType?: string;
}

/* ────────────────────────────────────────────────────────── */
/*  CRM Prospector & Contract Types                           */
/* ────────────────────────────────────────────────────────── */

export type LeadStatus =
  | 'novo'
  | 'redesenhado'
  | 'publicado'
  | 'proposta'
  | 'respondeu'
  | 'fechado'
  | 'descartado';

export interface Lead {
  slug: string;
  nome: string;
  nicho: string;
  cidade: string;
  nota?: number;
  avaliacoes?: number;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  siteAntigo?: string;
  url_preview?: string;
  motivo?: string;
  status: LeadStatus;
  urlNova?: string;
  dataProposta?: string;
  valor?: number;
  mrr_manutencao?: number;
  observacoes?: string;
  contratoStatus?: 'pendente' | 'enviado' | 'assinado';
  contratoEm?: string;
  manutencao?: number;
  pago?: number;
  docCliente?: string;
  endCliente?: string;
  atualizado?: string;
}

export interface ContratanteConfig {
  nome: string;
  cpfCnpj: string;
  endereco: string;
  cidadeUf: string;
  email: string;
  whatsapp: string;
}

export interface HostgatorConfig {
  usuario?: string;
  dominio?: string;
  servidor?: string;
  pastaBase?: string;
  senha?: string;
  senhaDefinida?: boolean;
}

export interface AppConfig {
  contratante: ContratanteConfig;
  hostgator: HostgatorConfig;
}

export interface CrmAuditResult {
  diagnostico: string;
  taxaConversao: string;
  mrrProjetado: string;
  leadsPrioritarios: Array<{
    nome: string;
    motivoAlerta: string;
    scriptWhatsapp: string;
  }>;
  estrategiasRecomendadas: string[];
}

export interface SlideDeckItem {
  id?: string;
  title: string;
  category: string;
  points: string[];
  metricHighlight?: string;
  recommendation?: string;
}

export type WebhookEventType =
  | 'status_changed'
  | 'lead_created'
  | 'lead_deleted'
  | 'proposal_sent'
  | 'contract_signed'
  | 'all';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  lastStatus?: 'success' | 'failed';
  lastResponseCode?: number;
  totalDeliveries?: number;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  webhookName: string;
  event: string;
  targetUrl: string;
  payload: any;
  responseStatus: number;
  responseBody?: string;
  success: boolean;
  timestamp: string;
  latencyMs: number;
  error?: string;
}

/* ────────────────────────────────────────────────────────── */
/*  OpenSquad Multi-Agent Collaboration Types                  */
/* ────────────────────────────────────────────────────────── */

export type SquadAgentRole = 'pm' | 'hunter' | 'copywriter' | 'redesigner' | 'qa';
export type SquadAgentStatus = 'idle' | 'thinking' | 'working' | 'ready' | 'offline';

export interface SquadAgent {
  id: string;
  name: string;
  role: SquadAgentRole;
  avatar: string;
  description: string;
  model: string;
  status: SquadAgentStatus;
  currentTask?: string;
  color: string;
  skills: string[];
  systemPrompt?: string;
}

export interface CollabCard {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  defaultPrompt: string;
  assignedAgents: SquadAgentRole[];
  targetOutputs: string[];
  sampleParams?: Record<string, string>;
}

export interface SquadDeliverable {
  id?: string;
  title: string;
  type: 'leads_list' | 'whatsapp_scripts' | 'redesign_audit' | 'pipeline_strategy' | 'contract_proposal';
  summary?: string;
  content?: any;
  data: any;
}

export interface SquadMessage {
  id: string;
  agentId: string;
  agentRole: SquadAgentRole;
  agentName: string;
  avatar?: string;
  content: string;
  type: 'chat' | 'thought' | 'action' | 'deliverable' | 'system';
  timestamp: string;
  mentions?: string[];
  deliverable?: SquadDeliverable;
}

export interface SquadMission {
  id: string;
  cardId: string;
  title: string;
  status: 'idle' | 'running' | 'completed' | 'paused' | 'failed';
  progress: number;
  currentStage: string;
  targetNiche?: string;
  targetCity?: string;
  customPrompt?: string;
  createdAt: string;
  messages: SquadMessage[];
  generatedLeads?: Lead[];
  executiveSummary?: string;
}

declare global {
  interface Window {
    gapi: any;
    google?: any;
  }
  const google: any;
}
