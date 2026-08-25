import fs from "fs";
import path from "path";
import crypto from "crypto";

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
  motivo?: string;
  status: "novo" | "redesenhado" | "publicado" | "proposta" | "respondeu" | "fechado" | "descartado";
  urlNova?: string;
  dataProposta?: string;
  valor?: number;
  obs?: string;
  contratoStatus?: "pendente" | "enviado" | "assinado";
  contratoEm?: string;
  manutencao?: number;
  pago?: number;
  docCliente?: string;
  endCliente?: string;
  atualizado?: string;
}

export type WebhookEventType = "status_changed" | "lead_created" | "lead_deleted" | "proposal_sent" | "contract_signed" | "all";

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  lastStatus?: "success" | "failed";
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

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "prospector-leads.json");
const CONFIG_FILE = path.join(DATA_DIR, "prospector-config.json");
const WEBHOOKS_FILE = path.join(DATA_DIR, "prospector-webhooks.json");
const WEBHOOK_LOGS_FILE = path.join(DATA_DIR, "prospector-webhook-logs.json");

const INITIAL_WEBHOOKS: WebhookConfig[] = [
  {
    id: "webhook-default-n8n",
    name: "Automação Geral (Status & Propostas)",
    url: "https://webhook.site/demo-crm-pipeline",
    events: ["status_changed", "lead_created", "contract_signed"],
    active: false,
    createdAt: "2026-08-18T08:00:00.000Z",
    totalDeliveries: 0,
  }
];

const INITIAL_LEADS: Lead[] = [
  {
    slug: "clinica-odonto-alphaville",
    nome: "Clínica Odonto Prime Alphaville",
    nicho: "Odontologia & Estética",
    cidade: "Barueri / SP",
    nota: 4.9,
    avaliacoes: 142,
    email: "contato@odontoprimealphaville.com.br",
    telefone: "(11) 4195-2230",
    whatsapp: "5511988776655",
    siteAntigo: "http://odontoprimealpha-antigo.exemplo.com.br",
    motivo: "Site Flash desatualizado, sem adaptação para mobile e sem botão direto de agendamento via WhatsApp.",
    status: "fechado",
    urlNova: "https://odontoprime.preview.agencia.com.br",
    dataProposta: "2026-08-05",
    valor: 1200,
    manutencao: 190,
    pago: 1,
    contratoStatus: "assinado",
    contratoEm: "2026-08-08",
    docCliente: "34.567.890/0001-12",
    endCliente: "Alameda Rio Negro, 500, Alphaville - Barueri/SP",
    obs: "Fechou pacote completo com redesign moderno e manutenção mensal de hospedagem/atualizações.",
    atualizado: "2026-08-10T14:30:00",
  },
  {
    slug: "escritorio-advocacia-martins",
    nome: "Martins & Associados Advocacia",
    nicho: "Direito Tributário & Civil",
    cidade: "São Paulo / SP",
    nota: 4.8,
    avaliacoes: 89,
    email: "juridico@martinsadv.com.br",
    telefone: "(11) 3254-1100",
    whatsapp: "5511977665544",
    siteAntigo: "http://martinsadvogados-antigo.exemplo.com.br",
    motivo: "Design corporativo antigo dos anos 2010, lentidão de carregamento e sem formulário de consulta rápida.",
    status: "proposta",
    urlNova: "https://martinsadv.preview.agencia.com.br",
    dataProposta: "2026-08-14",
    valor: 1500,
    manutencao: 250,
    pago: 0,
    contratoStatus: "enviado",
    contratoEm: "2026-08-15",
    docCliente: "12.345.678/0001-99",
    endCliente: "Av. Paulista, 1800, Bela Vista - São Paulo/SP",
    obs: "Proposta enviada pelo Dr. Renato. Aguardando retorno sobre rodadas de ajustes.",
    atualizado: "2026-08-15T10:15:00",
  },
  {
    slug: "studio-arquitetura-lumina",
    nome: "Lúmina Arquitetura & Interiores",
    nicho: "Arquitetura & Design",
    cidade: "Campinas / SP",
    nota: 5.0,
    avaliacoes: 67,
    email: "projetos@luminaarq.com.br",
    telefone: "(19) 3322-8899",
    whatsapp: "5519996554433",
    siteAntigo: "http://lumina-arquitetura.wixsite.com/antigo",
    motivo: "Site em Wix genérico com domínio gratuito e portfólio pesado com imagens não otimizadas.",
    status: "respondeu",
    urlNova: "https://lumina.preview.agencia.com.br",
    dataProposta: "2026-08-16",
    valor: 1100,
    manutencao: 150,
    pago: 0,
    contratoStatus: "pendente",
    obs: "Arquiteta Fernanda adorou a prévia do redesign; pediu para incluir galeria filtrável de projetos.",
    atualizado: "2026-08-17T16:45:00",
  },
  {
    slug: "auto-mecanica-vortex",
    nome: "Vortex Centro Automotivo Premium",
    nicho: "Automotivo & Serviços",
    cidade: "Curitiba / PR",
    nota: 4.7,
    avaliacoes: 210,
    email: "atendimento@vortexauto.com.br",
    telefone: "(41) 3344-5566",
    whatsapp: "5541984332211",
    siteAntigo: "http://vortexmecanica.exemplo.com.br",
    motivo: "Sem site próprio, apenas página desatualizada do Facebook sem tabela de serviços nem localização clara.",
    status: "publicado",
    urlNova: "https://vortexauto.preview.agencia.com.br",
    dataProposta: "2026-08-12",
    valor: 850,
    manutencao: 120,
    pago: 0,
    contratoStatus: "pendente",
    obs: "Redesign pronto e publicado no ambiente de teste. Follow-up de 4 dias ativo.",
    atualizado: "2026-08-12T11:00:00",
  },
  {
    slug: "bistro-terroir-gastronomia",
    nome: "Bistrô Terroir & Vinhos",
    nicho: "Restaurante & Gastronomia",
    cidade: "Gramado / RS",
    nota: 4.9,
    avaliacoes: 320,
    email: "reservas@bistroterroir.com.br",
    telefone: "(54) 3286-9900",
    whatsapp: "5554991223344",
    siteAntigo: "http://bistroterroir-pdf.exemplo.com.br",
    motivo: "Cardápio apenas em PDF de 15MB que não abre no celular dos clientes; sem sistema de reservas online.",
    status: "redesenhado",
    urlNova: "https://terroir.preview.agencia.com.br",
    valor: 950,
    manutencao: 150,
    pago: 0,
    contratoStatus: "pendente",
    obs: "Criado cardápio digital interativo responsivo com botões de chamada direta para reservas.",
    atualizado: "2026-08-16T18:20:00",
  },
  {
    slug: "espaco-zen-fisioterapia",
    nome: "Espaço Zen Pilates & Fisioterapia",
    nicho: "Saúde & Bem-estar",
    cidade: "Florianópolis / SC",
    nota: 4.9,
    avaliacoes: 95,
    email: "contato@espacozenpilates.com.br",
    telefone: "(48) 3222-7788",
    whatsapp: "5548987112233",
    siteAntigo: "http://espacozen-antigo.exemplo.com.br",
    motivo: "Site sem certificado SSL (Não Seguro), sem fotos reais do espaço e sem grade de horários.",
    status: "novo",
    valor: 750,
    manutencao: 100,
    pago: 0,
    contratoStatus: "pendente",
    obs: "Lead qualificado do Google Maps com excelente nota e alto fluxo de clientes.",
    atualizado: "2026-08-17T09:00:00",
  }
];

const INITIAL_CONFIG: AppConfig = {
  contratante: {
    nome: "Agência Digital & Desenvolvimento Web",
    cpfCnpj: "00.123.456/0001-78",
    endereco: "Av. das Nações Unidas, 12901 - Brooklin",
    cidadeUf: "São Paulo / SP",
    email: "contato@agenciadigital.com.br",
    whatsapp: "5511999998888",
  },
  hostgator: {
    usuario: "admin_web",
    dominio: "meusitespro.com.br",
    servidor: "br1024.hostgator.com.br",
    pastaBase: "clientes",
    senhaDefinida: true,
  }
};

function ensureDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getLeads(): Lead[] {
  ensureDirExists();
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const raw = fs.readFileSync(LEADS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("[crmStore] Error reading leads file:", e);
  }
  // Initialize with initial leads if not present
  saveLeads(INITIAL_LEADS);
  return INITIAL_LEADS;
}

export function saveLeads(leads: Lead[]): void {
  ensureDirExists();
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (e) {
    console.error("[crmStore] Error saving leads:", e);
  }
}

export function upsertLead(lead: Partial<Lead> & { slug: string }): Lead {
  const leads = getLeads();
  const index = leads.findIndex((l) => l.slug === lead.slug);
  const now = new Date().toISOString();

  let updatedLead: Lead;
  let isNew = false;
  let previousStatus: Lead["status"] | undefined;
  let previousContractStatus: Lead["contratoStatus"] | undefined;

  if (index >= 0) {
    const existing = leads[index];
    previousStatus = existing.status;
    previousContractStatus = existing.contratoStatus;
    updatedLead = {
      ...existing,
      ...lead,
      atualizado: now,
    };
    leads[index] = updatedLead;
  } else {
    isNew = true;
    updatedLead = {
      slug: lead.slug,
      nome: lead.nome || "Novo Cliente",
      nicho: lead.nicho || "Geral",
      cidade: lead.cidade || "Brasil",
      status: lead.status || "novo",
      contratoStatus: lead.contratoStatus || "pendente",
      pago: lead.pago ?? 0,
      atualizado: now,
      ...lead,
    };
    leads.push(updatedLead);
  }
  saveLeads(leads);

  // ⚡ DISPARO AUTOMÁTICO DE WEBHOOKS
  try {
    if (isNew) {
      dispatchWebhookEvent("lead_created", {
        event: "lead_created",
        lead: updatedLead,
        timestamp: now,
        meta: {
          tunnelPath: `/tunnel/${updatedLead.slug}`,
          liveSitePath: `/api/live-site/${updatedLead.slug}`,
        }
      });
    } else if (previousStatus && previousStatus !== updatedLead.status) {
      dispatchWebhookEvent("status_changed", {
        event: "status_changed",
        lead: updatedLead,
        previousStatus,
        newStatus: updatedLead.status,
        timestamp: now,
        meta: {
          tunnelPath: `/tunnel/${updatedLead.slug}`,
          liveSitePath: `/api/live-site/${updatedLead.slug}`,
          motivo: updatedLead.motivo || "",
        }
      });
    }

    if (updatedLead.contratoStatus === "assinado" && previousContractStatus !== "assinado") {
      dispatchWebhookEvent("contract_signed", {
        event: "contract_signed",
        lead: updatedLead,
        timestamp: now,
        valorTotal: (updatedLead.valor || 0) + (updatedLead.manutencao || 0),
      });
    }
  } catch (err) {
    console.error("[crmStore] Error triggering automatic webhooks:", err);
  }

  return updatedLead;
}

export function deleteLead(slug: string): boolean {
  const leads = getLeads();
  const index = leads.findIndex((l) => l.slug === slug);
  if (index >= 0) {
    const deletedLead = leads[index];
    const filtered = leads.filter((l) => l.slug !== slug);
    saveLeads(filtered);

    try {
      dispatchWebhookEvent("lead_deleted", {
        event: "lead_deleted",
        slug,
        nome: deletedLead.nome,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[crmStore] Error triggering lead_deleted webhook:", err);
    }
    return true;
  }
  return false;
}

/* ────────────────────────────────────────────────────────── */
/*  Webhook Configuration & Dispatcher Functions               */
/* ────────────────────────────────────────────────────────── */

export function getWebhooks(): WebhookConfig[] {
  ensureDirExists();
  try {
    if (fs.existsSync(WEBHOOKS_FILE)) {
      const raw = fs.readFileSync(WEBHOOKS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("[crmStore] Error reading webhooks file:", e);
  }
  saveWebhooks(INITIAL_WEBHOOKS);
  return INITIAL_WEBHOOKS;
}

export function saveWebhooks(webhooks: WebhookConfig[]): void {
  ensureDirExists();
  try {
    fs.writeFileSync(WEBHOOKS_FILE, JSON.stringify(webhooks, null, 2), "utf-8");
  } catch (e) {
    console.error("[crmStore] Error saving webhooks:", e);
  }
}

export function saveWebhook(webhook: Partial<WebhookConfig> & { url: string }): WebhookConfig {
  const webhooks = getWebhooks();
  const now = new Date().toISOString();
  const id = webhook.id || `wh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const index = webhooks.findIndex((w) => w.id === id);

  const newWebhook: WebhookConfig = {
    id,
    name: webhook.name || "Novo Webhook",
    url: webhook.url.trim(),
    secret: webhook.secret?.trim() || "",
    events: webhook.events && webhook.events.length > 0 ? webhook.events : ["status_changed", "lead_created"],
    active: webhook.active !== undefined ? webhook.active : true,
    createdAt: index >= 0 ? webhooks[index].createdAt : now,
    lastTriggered: index >= 0 ? webhooks[index].lastTriggered : undefined,
    lastStatus: index >= 0 ? webhooks[index].lastStatus : undefined,
    lastResponseCode: index >= 0 ? webhooks[index].lastResponseCode : undefined,
    totalDeliveries: index >= 0 ? webhooks[index].totalDeliveries || 0 : 0,
  };

  if (index >= 0) {
    webhooks[index] = newWebhook;
  } else {
    webhooks.push(newWebhook);
  }

  saveWebhooks(webhooks);
  return newWebhook;
}

export function deleteWebhook(id: string): boolean {
  const webhooks = getWebhooks();
  const filtered = webhooks.filter((w) => w.id !== id);
  if (filtered.length !== webhooks.length) {
    saveWebhooks(filtered);
    return true;
  }
  return false;
}

export function getWebhookLogs(limit: number = 50): WebhookDeliveryLog[] {
  ensureDirExists();
  try {
    if (fs.existsSync(WEBHOOK_LOGS_FILE)) {
      const raw = fs.readFileSync(WEBHOOK_LOGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, limit);
      }
    }
  } catch (e) {
    console.error("[crmStore] Error reading webhook logs file:", e);
  }
  return [];
}

export function addWebhookLog(log: WebhookDeliveryLog): void {
  ensureDirExists();
  try {
    const logs = getWebhookLogs(100);
    logs.unshift(log);
    fs.writeFileSync(WEBHOOK_LOGS_FILE, JSON.stringify(logs.slice(0, 100), null, 2), "utf-8");
  } catch (e) {
    console.error("[crmStore] Error saving webhook log:", e);
  }
}

export function clearWebhookLogs(): void {
  ensureDirExists();
  try {
    fs.writeFileSync(WEBHOOK_LOGS_FILE, JSON.stringify([], null, 2), "utf-8");
  } catch (e) {
    console.error("[crmStore] Error clearing webhook logs:", e);
  }
}

/**
 * Dispara um evento assíncrono para todos os webhooks ativos configurados.
 */
export async function dispatchWebhookEvent(event: WebhookEventType, payload: any): Promise<void> {
  const webhooks = getWebhooks().filter((w) => w.active);
  const eligibleWebhooks = webhooks.filter(
    (w) => w.events.includes("all") || w.events.includes(event)
  );

  if (eligibleWebhooks.length === 0) {
    return;
  }

  const timestamp = new Date().toISOString();
  const fullPayload = {
    source: "OpenSquad CRM Ecosystem",
    event,
    timestamp,
    data: payload,
  };

  // Disparo não-bloqueante em paralelo para todos os endpoints
  eligibleWebhooks.forEach(async (webhook) => {
    const deliveryId = `del-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();
    let responseStatus = 0;
    let responseBody = "";
    let success = false;
    let errorMsg: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "OpenSquad-CRM-Webhook/2.0",
        "X-Webhook-Event": event,
        "X-Webhook-Delivery": deliveryId,
        "X-Webhook-Timestamp": timestamp,
      };

      if (webhook.secret) {
        const hmac = crypto.createHmac("sha256", webhook.secret);
        hmac.update(JSON.stringify(fullPayload));
        headers["X-Webhook-Signature"] = `sha256=${hmac.digest("hex")}`;
      }

      const res = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: JSON.stringify(fullPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      responseStatus = res.status;
      success = res.ok;
      const text = await res.text();
      responseBody = text.substring(0, 1000); // Salva até 1KB da resposta
    } catch (err: any) {
      success = false;
      responseStatus = 0;
      errorMsg = err.message || "Falha na conexão HTTP/Timeout";
    }

    const latencyMs = Date.now() - startTime;

    // Atualiza status no webhook
    const allWh = getWebhooks();
    const targetWh = allWh.find((w) => w.id === webhook.id);
    if (targetWh) {
      targetWh.lastTriggered = timestamp;
      targetWh.lastStatus = success ? "success" : "failed";
      targetWh.lastResponseCode = responseStatus;
      targetWh.totalDeliveries = (targetWh.totalDeliveries || 0) + 1;
      saveWebhooks(allWh);
    }

    // Salva o log de entrega
    addWebhookLog({
      id: deliveryId,
      webhookId: webhook.id,
      webhookName: webhook.name,
      event,
      targetUrl: webhook.url,
      payload: fullPayload,
      responseStatus,
      responseBody,
      success,
      timestamp,
      latencyMs,
      error: errorMsg,
    });
  });
}

/**
 * Dispara um teste sintético para um webhook específico e retorna o resultado síncrono para feedback na UI.
 */
export async function testWebhook(webhookId: string): Promise<{
  success: boolean;
  status: number;
  latencyMs: number;
  error?: string;
  responseBody?: string;
  payload: any;
}> {
  const webhooks = getWebhooks();
  const webhook = webhooks.find((w) => w.id === webhookId);
  if (!webhook) {
    throw new Error("Webhook não encontrado para teste.");
  }

  const sampleLead = getLeads()[0] || INITIAL_LEADS[0];
  const timestamp = new Date().toISOString();
  const deliveryId = `test-${Date.now()}`;
  const testPayload = {
    source: "OpenSquad CRM Ecosystem",
    event: "status_changed",
    isTest: true,
    timestamp,
    data: {
      lead: sampleLead,
      previousStatus: "proposta",
      newStatus: "fechado",
      motivo: "Teste de conectividade de Webhook pelo usuário",
      tunnelPath: `/tunnel/${sampleLead.slug}`,
      liveSitePath: `/api/live-site/${sampleLead.slug}`,
    }
  };

  const startTime = Date.now();
  let status = 0;
  let success = false;
  let responseBody = "";
  let error: string | undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "OpenSquad-CRM-Webhook/2.0 (Test Mode)",
      "X-Webhook-Event": "status_changed",
      "X-Webhook-Delivery": deliveryId,
      "X-Webhook-Timestamp": timestamp,
      "X-Webhook-Test": "true",
    };

    if (webhook.secret) {
      const hmac = crypto.createHmac("sha256", webhook.secret);
      hmac.update(JSON.stringify(testPayload));
      headers["X-Webhook-Signature"] = `sha256=${hmac.digest("hex")}`;
    }

    const res = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    status = res.status;
    success = res.ok;
    const text = await res.text();
    responseBody = text.substring(0, 1000);
  } catch (err: any) {
    success = false;
    status = 0;
    error = err.message || "Erro ao conectar com a URL de destino (Timeout ou Recusa de Conexão)";
  }

  const latencyMs = Date.now() - startTime;

  // Atualiza metadados do webhook
  webhook.lastTriggered = timestamp;
  webhook.lastStatus = success ? "success" : "failed";
  webhook.lastResponseCode = status;
  webhook.totalDeliveries = (webhook.totalDeliveries || 0) + 1;
  saveWebhooks(webhooks);

  // Registra no histórico
  addWebhookLog({
    id: deliveryId,
    webhookId: webhook.id,
    webhookName: webhook.name,
    event: "status_changed (test)",
    targetUrl: webhook.url,
    payload: testPayload,
    responseStatus: status,
    responseBody,
    success,
    timestamp,
    latencyMs,
    error,
  });

  return {
    success,
    status,
    latencyMs,
    error,
    responseBody,
    payload: testPayload,
  };
}

/**
 * Dispara um teste sintético ad-hoc para uma URL arbitrária informada no formulário de cadastro/edição.
 */
export async function testWebhookUrl(url: string, secret?: string): Promise<{
  success: boolean;
  status: number;
  latencyMs: number;
  error?: string;
  responseBody?: string;
  payload: any;
}> {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    throw new Error("URL inválida. Deve iniciar com http:// ou https://");
  }

  const sampleLead = getLeads()[0] || INITIAL_LEADS[0];
  const timestamp = new Date().toISOString();
  const deliveryId = `test-url-${Date.now()}`;
  const testPayload = {
    source: "OpenSquad CRM Ecosystem",
    event: "status_changed",
    isTest: true,
    isAdHoc: true,
    timestamp,
    data: {
      lead: sampleLead,
      previousStatus: "proposta",
      newStatus: "fechado",
      motivo: "Teste de conectividade ad-hoc direto do formulário de webhook",
      tunnelPath: `/tunnel/${sampleLead.slug}`,
      liveSitePath: `/api/live-site/${sampleLead.slug}`,
    }
  };

  const startTime = Date.now();
  let status = 0;
  let success = false;
  let responseBody = "";
  let error: string | undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "OpenSquad-CRM-Webhook/2.0 (Form Test Mode)",
      "X-Webhook-Event": "status_changed",
      "X-Webhook-Delivery": deliveryId,
      "X-Webhook-Timestamp": timestamp,
      "X-Webhook-Test": "true",
    };

    if (secret) {
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(JSON.stringify(testPayload));
      headers["X-Webhook-Signature"] = `sha256=${hmac.digest("hex")}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    status = res.status;
    success = res.ok;
    const text = await res.text();
    responseBody = text.substring(0, 1000);
  } catch (err: any) {
    success = false;
    status = 0;
    error = err.message || "Erro ao conectar com a URL de destino (Timeout ou Recusa de Conexão)";
  }

  const latencyMs = Date.now() - startTime;

  return {
    success,
    status,
    latencyMs,
    error,
    responseBody,
    payload: testPayload,
  };
}

export function getConfig(): AppConfig {
  ensureDirExists();
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("[crmStore] Error reading config file:", e);
  }
  saveConfig(INITIAL_CONFIG);
  return INITIAL_CONFIG;
}

export function saveConfig(cfg: Partial<AppConfig>): AppConfig {
  ensureDirExists();
  const current = getConfig();
  const merged: AppConfig = {
    contratante: {
      ...current.contratante,
      ...(cfg.contratante || {}),
    },
    hostgator: {
      ...current.hostgator,
      ...(cfg.hostgator || {}),
    },
  };
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch (e) {
    console.error("[crmStore] Error saving config:", e);
  }
  return merged;
}

export function exportLeadsToCsv(): string {
  const leads = getLeads();
  const headers = [
    "slug",
    "nome",
    "nicho",
    "cidade",
    "nota",
    "avaliacoes",
    "status",
    "valor",
    "manutencao",
    "pago",
    "contratoStatus",
    "dataProposta",
    "motivo",
    "email",
    "whatsapp"
  ];

  const rows = leads.map((l) => [
    `"${l.slug}"`,
    `"${(l.nome || "").replace(/"/g, '""')}"`,
    `"${(l.nicho || "").replace(/"/g, '""')}"`,
    `"${(l.cidade || "").replace(/"/g, '""')}"`,
    l.nota ?? "",
    l.avaliacoes ?? "",
    `"${l.status}"`,
    l.valor ?? 0,
    l.manutencao ?? 0,
    l.pago ? 1 : 0,
    `"${l.contratoStatus || "pendente"}"`,
    `"${l.dataProposta || ""}"`,
    `"${(l.motivo || "").replace(/"/g, '""')}"`,
    `"${l.email || ""}"`,
    `"${l.whatsapp || ""}"`
  ].join(","));

  return [headers.join(","), ...rows].join("\n");
}
