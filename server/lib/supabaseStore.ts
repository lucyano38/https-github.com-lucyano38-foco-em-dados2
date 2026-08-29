import { getSupabaseServerClient } from './supabaseClient';

export type DbLead = {
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
  status: 'novo' | 'redesenhado' | 'publicado' | 'proposta' | 'respondeu' | 'fechado' | 'descartado';
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
};

export type DbWebhook = {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  lastStatus?: 'success' | 'failed';
  lastResponseCode?: number;
  totalDeliveries?: number;
};

export type DbWebhookLog = {
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
};

const ensureSupabaseTables = async () => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    await supabase.rpc('create_crm_tables_if_not_exists');
  } catch {
    // ignore if RPC not available; tables may already exist
  }
};

export async function listLeadsFromSupabase(): Promise<DbLead[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('atualizado', { ascending: false });
  if (error || !data) return [];
  return data as DbLead[];
}

export async function saveLeadToSupabase(lead: DbLead): Promise<DbLead> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return lead;
  const payload = {
    ...lead,
    atualizado: lead.atualizado || new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('leads')
    .upsert(payload, { onConflict: 'slug' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Falha ao salvar lead no Supabase');
  return data as DbLead;
}

export async function deleteLeadFromSupabase(slug: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  const { error } = await supabase.from('leads').delete().eq('slug', slug);
  if (error) throw new Error(error.message || 'Falha ao remover lead');
}

export async function listWebhooksFromSupabase(): Promise<DbWebhook[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error || !data) return [];
  return data as DbWebhook[];
}

export async function saveWebhookToSupabase(webhook: DbWebhook): Promise<DbWebhook> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return webhook;
  const { data, error } = await supabase
    .from('webhooks')
    .upsert(webhook, { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'Falha ao salvar webhook');
  return data as DbWebhook;
}

export async function deleteWebhookFromSupabase(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  const { error } = await supabase.from('webhooks').delete().eq('id', id);
  if (error) throw new Error(error.message || 'Falha ao remover webhook');
}

export async function appendWebhookLogToSupabase(log: DbWebhookLog): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  const { error } = await supabase.from('webhook_logs').insert(log);
  if (error) throw new Error(error.message || 'Falha ao salvar log');
}

export async function listWebhookLogsFromSupabase(): Promise<DbWebhookLog[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error || !data) return [];
  return data as DbWebhookLog[];
}

export async function clearWebhookLogsFromSupabase(): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  const { error } = await supabase.from('webhook_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw new Error(error.message || 'Falha ao limpar logs');
}
