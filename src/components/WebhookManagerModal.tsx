import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Webhook as WebhookIcon,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Activity,
  RefreshCw,
  ExternalLink,
  Code,
  Sparkles,
  Zap,
  Radio,
  FileJson,
  X,
  Check,
  Copy,
} from 'lucide-react';
import { WebhookConfig, WebhookDeliveryLog, WebhookEventType } from '../types';

interface WebhookManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_OPTIONS: Array<{ id: WebhookEventType; label: string; desc: string }> = [
  { id: 'status_changed', label: 'Mudança de Status no Pipeline', desc: 'Dispara quando o lead avança ou muda de coluna (ex: Proposta ➔ Fechado)' },
  { id: 'lead_created', label: 'Novo Lead Criado', desc: 'Dispara quando um lead é cadastrado ou gerado pelo OpenSquad' },
  { id: 'contract_signed', label: 'Contrato Assinado & Fechado', desc: 'Dispara quando o lead tem o contrato finalizado e aceito' },
  { id: 'lead_deleted', label: 'Lead Removido', desc: 'Dispara quando um registro é excluído do pipeline' },
];

const PRESETS = [
  {
    name: 'n8n / Make Workflow',
    url: 'https://seu-n8n.exemplo.com/webhook/crm-pipeline',
    events: ['status_changed', 'lead_created', 'contract_signed'] as WebhookEventType[],
  },
  {
    name: 'WhatsApp Evolution API / Notificador',
    url: 'https://api.whatsapp-bot.exemplo.com/webhook/crm-status',
    events: ['status_changed', 'contract_signed'] as WebhookEventType[],
  },
  {
    name: 'Discord / Slack Channel',
    url: 'https://discord.com/api/webhooks/exemplo/canal-vendas',
    events: ['status_changed', 'contract_signed'] as WebhookEventType[],
  },
  {
    name: 'Zapier Automation',
    url: 'https://hooks.zapier.com/hooks/catch/exemplo/lead-update',
    events: ['status_changed', 'lead_created'] as WebhookEventType[],
  }
];

export const WebhookManagerModal: React.FC<WebhookManagerModalProps> = ({ isOpen, onClose }) => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [logs, setLogs] = useState<WebhookDeliveryLog[]>([]);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'logs' | 'docs'>('endpoints');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>(['status_changed', 'lead_created']);
  const [isActive, setIsActive] = useState(true);

  // Test state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testingFormUrl, setTestingFormUrl] = useState(false);
  const [testResult, setTestResult] = useState<{
    webhookId?: string;
    success: boolean;
    status: number;
    latencyMs: number;
    error?: string;
    responseBody?: string;
    payload?: any;
  } | null>(null);

  const handleTestFormUrl = async () => {
    if (!url.trim()) {
      alert('Informe a URL de destino para testar a conexão.');
      return;
    }
    try {
      setTestingFormUrl(true);
      setTestResult(null);
      const res = await fetch('/api/webhooks/test-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), secret: secret.trim() || undefined }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        status: data.status,
        latencyMs: data.latencyMs,
        error: data.error,
        responseBody: data.responseBody,
        payload: data.payload,
      });
    } catch (e: any) {
      setTestResult({
        success: false,
        status: 0,
        latencyMs: 0,
        error: e.message || 'Falha ao testar URL',
      });
    } finally {
      setTestingFormUrl(false);
    }
  };

  const [copiedPayload, setCopiedPayload] = useState(false);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/webhooks');
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data);
      }
    } catch (e) {
      console.error('Error fetching webhooks:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/webhooks-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error('Error fetching webhook logs:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWebhooks();
      fetchLogs();
    }
  }, [isOpen]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('Webhook Automação de Pipeline');
    setUrl('');
    setSecret('');
    setSelectedEvents(['status_changed', 'lead_created', 'contract_signed']);
    setIsActive(true);
    setTestResult(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (wh: WebhookConfig) => {
    setEditingId(wh.id);
    setName(wh.name);
    setUrl(wh.url);
    setSecret(wh.secret || '');
    setSelectedEvents(wh.events);
    setIsActive(wh.active);
    setTestResult(null);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          name: name.trim() || 'Webhook Sem Nome',
          url: url.trim(),
          secret: secret.trim() || undefined,
          events: selectedEvents,
          active: isActive,
        }),
      });

      if (res.ok) {
        await fetchWebhooks();
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Error saving webhook:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este webhook?')) return;
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchWebhooks();
        if (testResult?.webhookId === id) setTestResult(null);
      }
    } catch (e) {
      console.error('Error deleting webhook:', e);
    }
  };

  const handleToggleActive = async (wh: WebhookConfig) => {
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wh,
          active: !wh.active,
        }),
      });
      if (res.ok) fetchWebhooks();
    } catch (e) {
      console.error('Error toggling webhook status:', e);
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      setTestingId(id);
      setTestResult(null);
      const res = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResult({
        webhookId: id,
        ...data,
      });
      fetchWebhooks();
      fetchLogs();
    } catch (e: any) {
      setTestResult({
        webhookId: id,
        success: false,
        status: 0,
        latencyMs: 0,
        error: e.message || 'Falha ao testar webhook',
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Limpar todo o histórico de logs de webhook?')) return;
    try {
      await fetch('/api/webhooks-logs', { method: 'DELETE' });
      setLogs([]);
    } catch (e) {
      console.error('Error clearing logs:', e);
    }
  };

  const toggleEventSelection = (eventId: WebhookEventType) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((ev) => ev !== eventId) : [...prev, eventId]
    );
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setUrl(preset.url);
    setSelectedEvents(preset.events);
  };

  const sampleJsonPayload = {
    source: 'OpenSquad CRM Ecosystem',
    event: 'status_changed',
    timestamp: new Date().toISOString(),
    data: {
      lead: {
        slug: 'clinica-odonto-alphaville',
        nome: 'Clínica Odonto Prime Alphaville',
        nicho: 'Odontologia & Estética',
        cidade: 'Barueri / SP',
        status: 'fechado',
        valor: 1200,
        manutencao: 190,
        whatsapp: '5511988776655',
        siteAntigo: 'http://odontoprimealpha-antigo.exemplo.com.br',
        contratoStatus: 'assinado',
      },
      previousStatus: 'proposta',
      newStatus: 'fechado',
      meta: {
        tunnelPath: '/tunnel/clinica-odonto-alphaville',
        liveSitePath: '/api/live-site/clinica-odonto-alphaville',
        motivo: 'Site Flash desatualizado sem conversão WhatsApp.',
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white/[0.04] rounded-3xl border border-white/[0.08] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#f7f8f8]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Sistema de Webhooks & Automação do CRM</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Tempo Real
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Notifique automaticamente o ecossistema (n8n, Make, Zapier, WhatsApp) a cada alteração de status de lead.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-nav Tabs */}
        <div className="px-6 py-2.5 bg-[#0f1011] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('endpoints');
                setIsEditing(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'endpoints'
                  ? 'bg-white/[0.04] text-[#f7f8f8] shadow-[0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.08]'
                  : 'text-[#8a8f98] hover:text-[#f7f8f8]'
              }`}
            >
              <WebhookIcon className="w-3.5 h-3.5 text-emerald-600" />
              Webhooks Configurados ({webhooks.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('logs');
                setIsEditing(false);
                fetchLogs();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-white/[0.04] text-[#f7f8f8] shadow-[0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.08]'
                  : 'text-[#8a8f98] hover:text-[#f7f8f8]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Logs de Entregas ({logs.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('docs');
                setIsEditing(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'docs'
                  ? 'bg-white/[0.04] text-[#f7f8f8] shadow-[0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.08]'
                  : 'text-[#8a8f98] hover:text-[#f7f8f8]'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-purple-600" />
              Payload JSON & Assinatura
            </button>
          </div>

          {!isEditing && activeTab === 'endpoints' && (
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_1px_0_rgba(255,255,255,0.05)] transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Webhook
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: ENDPOINTS LIST OR EDIT FORM */}
          {activeTab === 'endpoints' && (
            <>
              {isEditing ? (
                /* EDIT / CREATE FORM */
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="bg-[#0f1011] p-4 rounded-2xl border border-white/[0.08] space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-800">
                          {editingId ? 'Editar Webhook' : 'Cadastrar Novo Webhook de Notificação'}
                        </span>
                      </div>

                      {/* Presets Button */}
                      {!editingId && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-[#8a8f98] mr-1">Modelos rápidos:</span>
                          {PRESETS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => applyPreset(p)}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/[0.04] border border-white/[0.08] text-[#d4d6e0] hover:bg-white/[0.04] transition cursor-pointer"
                            >
                              {p.name.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#d4d6e0] mb-1">
                          Nome do Destinatário / Integração
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: n8n - Disparo no WhatsApp e Planilha"
                          className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs text-[#f7f8f8] focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white/[0.04]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#d4d6e0] mb-1">
                          Segredo de Assinatura (HMAC SHA-256) • Opcional
                        </label>
                        <input
                          type="password"
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          placeholder="Chave secreta para validação no cabeçalho X-Webhook-Signature"
                          className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs text-[#f7f8f8] focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white/[0.04]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#d4d6e0]">
                          URL de Destino (Endpoint POST)
                        </label>
                        <button
                          type="button"
                          onClick={handleTestFormUrl}
                          disabled={testingFormUrl || !url.trim()}
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shadow-[0_1px_0_rgba(255,255,255,0.05)]"
                          title="Envia um ping simulado e valida se o servidor responde com HTTP 200"
                        >
                          <Play className={`w-3 h-3 text-emerald-600 ${testingFormUrl ? 'animate-spin' : ''}`} />
                          {testingFormUrl ? 'Testando Conexão...' : 'Testar Conexão (Ping HTTP 200)'}
                        </button>
                      </div>
                      <input
                        type="url"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://sua-empresa.com/api/webhook ou https://webhook.site/..."
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs text-[#f7f8f8] focus:outline-hidden focus:ring-2 focus:ring-neutral-900 bg-white/[0.04] font-mono"
                      />
                    </div>

                    {/* Form Test Result Banner */}
                    {testResult && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                          testResult.success
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-red-50 border-red-300 text-red-950'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold">
                            {testResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>
                              {testResult.success
                                ? `Conexão bem-sucedida! HTTP ${testResult.status} (${testResult.latencyMs}ms)`
                                : `Falha no teste: HTTP ${testResult.status || 'Sem Resposta'}`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTestResult(null)}
                            className="text-[#8a8f98] hover:text-[#f7f8f8] font-bold p-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                        {testResult.error && (
                          <p className="text-[11px] font-mono bg-white/[0.04]/70 p-1.5 rounded-lg border border-red-200 text-red-800">
                            {testResult.error}
                          </p>
                        )}
                        {testResult.responseBody && (
                          <pre className="text-[10px] font-mono bg-white/[0.04]/80 p-2 rounded-xl border border-white/[0.08] text-neutral-800 overflow-x-auto max-h-20">
                            {testResult.responseBody}
                          </pre>
                        )}
                      </motion.div>
                    )}

                    {/* Event Subscriptions */}
                    <div>
                      <label className="block text-xs font-bold text-[#d4d6e0] mb-2">
                        Eventos que acionam este webhook:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {EVENT_OPTIONS.map((opt) => {
                          const isChecked = selectedEvents.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              onClick={() => toggleEventSelection(opt.id)}
                              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                                isChecked
                                  ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400/30'
                                  : 'bg-white/[0.04] border-white/[0.08] text-[#8a8f98] hover:border-neutral-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                              />
                              <div>
                                <p className="text-xs font-bold text-neutral-800">{opt.label}</p>
                                <p className="text-[11px] text-[#8a8f98] leading-tight mt-0.5">{opt.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-800">Status do Webhook:</span>
                        <button
                          type="button"
                          onClick={() => setIsActive(!isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-neutral-200 text-[#8a8f98]'
                          }`}
                        >
                          {isActive ? 'Ativo (Disparando)' : 'Pausado'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8a8f98] hover:bg-white/[0.04] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      {loading ? 'Salvando...' : editingId ? 'Atualizar Webhook' : 'Criar Webhook'}
                    </button>
                  </div>
                </form>
              ) : (
                /* ENDPOINTS LIST */
                <div className="space-y-3">
                  {webhooks.length === 0 ? (
                    <div className="text-center py-12 bg-[#0f1011] rounded-2xl border border-dashed border-neutral-300 p-6 space-y-3">
                      <WebhookIcon className="w-8 h-8 text-neutral-400 mx-auto" />
                      <h4 className="text-xs font-bold text-[#d4d6e0]">Nenhum webhook cadastrado</h4>
                      <p className="text-[11px] text-[#8a8f98] max-w-sm mx-auto">
                        Adicione a URL do seu sistema de automação (n8n, Make, Zapier ou Bot de WhatsApp) para receber notificações a cada mudança de status no pipeline.
                      </p>
                      <button
                        onClick={handleOpenCreate}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Cadastrar Primeiro Webhook
                      </button>
                    </div>
                  ) : (
                    webhooks.map((wh) => {
                      const isTesting = testingId === wh.id;
                      const hasSecret = !!wh.secret;

                      return (
                        <div
                          key={wh.id}
                          className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-4 shadow-[0_1px_0_rgba(255,255,255,0.05)] hover:border-neutral-300 transition space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  wh.active ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                                }`}
                                title={wh.active ? 'Ativo' : 'Pausado'}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-[#f7f8f8]">{wh.name}</h4>
                                  {hasSecret && (
                                    <span
                                      className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-mono flex items-center gap-1"
                                      title="Assinatura HMAC-SHA256 ativa"
                                    >
                                      <Shield className="w-2.5 h-2.5 text-amber-600" />
                                      HMAC
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                      wh.active
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-white/[0.04] text-[#8a8f98]'
                                    }`}
                                  >
                                    {wh.active ? 'Ativo' : 'Pausado'}
                                  </span>
                                </div>
                                <p className="text-[11px] font-mono text-[#8a8f98] truncate max-w-lg mt-0.5">
                                  {wh.url}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleTestWebhook(wh.id)}
                                disabled={isTesting}
                                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                title="Dispara um payload de teste sintético"
                              >
                                <Play className={`w-3 h-3 text-emerald-600 ${isTesting ? 'animate-spin' : ''}`} />
                                {isTesting ? 'Testando...' : 'Testar Conexão'}
                              </button>

                              <button
                                onClick={() => handleOpenEdit(wh)}
                                className="px-2.5 py-1.5 rounded-xl bg-[#0f1011] hover:bg-white/[0.04] text-[#d4d6e0] border border-white/[0.08] text-xs font-semibold transition cursor-pointer"
                              >
                                Editar
                              </button>

                              <button
                                onClick={() => handleToggleActive(wh)}
                                className="px-2.5 py-1.5 rounded-xl bg-[#0f1011] hover:bg-white/[0.04] text-[#d4d6e0] border border-white/[0.08] text-xs font-semibold transition cursor-pointer"
                              >
                                {wh.active ? 'Pausar' : 'Ativar'}
                              </button>

                              <button
                                onClick={() => handleDelete(wh.id)}
                                className="p-1.5 rounded-xl border border-transparent hover:border-red-200 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                                title="Excluir Webhook"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Event Badges & Delivery Stats */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px] text-[#8a8f98]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-[#8a8f98]">Eventos:</span>
                              {wh.events.map((ev) => (
                                <span
                                  key={ev}
                                  className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[#d4d6e0] font-mono text-[10px]"
                                >
                                  {ev}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-3">
                              {wh.lastTriggered && (
                                <span className="flex items-center gap-1 text-[#8a8f98]">
                                  <Clock className="w-3 h-3" />
                                  Último: {new Date(wh.lastTriggered).toLocaleTimeString('pt-BR')}
                                </span>
                              )}
                              {wh.lastStatus && (
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                    wh.lastStatus === 'success'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {wh.lastResponseCode ? `HTTP ${wh.lastResponseCode}` : wh.lastStatus}
                                </span>
                              )}
                              <span className="font-mono text-neutral-400">
                                Total: {wh.totalDeliveries || 0} envios
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Test Result Live Banner */}
                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        testResult.success
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : 'bg-red-50/80 border-red-300 text-red-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold">
                          {testResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span>
                            {testResult.success
                              ? `Teste bem-sucedido! Resposta HTTP ${testResult.status} (${testResult.latencyMs}ms)`
                              : `Falha no teste: HTTP ${testResult.status || 'Sem Resposta'}`}
                          </span>
                        </div>
                        <button
                          onClick={() => setTestResult(null)}
                          className="text-[#8a8f98] hover:text-[#f7f8f8] font-bold p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {testResult.error && (
                        <p className="text-[11px] font-mono bg-white/[0.04]/70 p-2 rounded-xl border border-red-200 text-red-800">
                          {testResult.error}
                        </p>
                      )}

                      {testResult.responseBody && (
                        <div>
                          <p className="text-[11px] font-semibold text-[#d4d6e0]">Resposta do Servidor:</p>
                          <pre className="text-[10px] font-mono bg-white/[0.04]/80 p-2 rounded-xl border border-white/[0.08] text-neutral-800 overflow-x-auto max-h-24">
                            {testResult.responseBody}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: LOGS DE ENTREGA */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8a8f98]">
                  Histórico em tempo real das requisições disparadas pelo CRM:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchLogs}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-neutral-200 text-[#d4d6e0] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Atualizar
                  </button>
                  {logs.length > 0 && (
                    <button
                      onClick={handleClearLogs}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Limpar Histórico
                    </button>
                  )}
                </div>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-10 bg-[#0f1011] rounded-2xl border border-white/[0.08] text-[#8a8f98] text-xs">
                  Nenhum log de disparo registrado ainda. Os disparos ocorrerão automaticamente conforme o pipeline for atualizado.
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.08] text-xs space-y-1.5 shadow-[0_1px_0_rgba(255,255,255,0.05)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.success
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            HTTP {log.responseStatus || 'ERRO'}
                          </span>
                          <span className="font-bold text-[#f7f8f8]">{log.webhookName}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white/[0.04] rounded-md text-[#8a8f98]">
                            {log.event}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString('pt-BR')} • {log.latencyMs}ms
                        </span>
                      </div>

                      <p className="text-[11px] font-mono text-[#8a8f98] truncate">{log.targetUrl}</p>

                      {log.error && (
                        <p className="text-[11px] text-red-600 bg-red-50 p-1.5 rounded-lg font-mono">
                          {log.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTAÇÃO DO PAYLOAD */}
          {activeTab === 'docs' && (
            <div className="space-y-4 text-xs">
              <div className="bg-neutral-900 text-neutral-100 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Estrutura do Payload HTTP POST enviado</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(sampleJsonPayload, null, 2));
                      setCopiedPayload(true);
                      setTimeout(() => setCopiedPayload(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedPayload ? 'Copiado!' : 'Copiar JSON'}
                  </button>
                </div>

                <pre className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72">
                  {JSON.stringify(sampleJsonPayload, null, 2)}
                </pre>
              </div>

              {/* Headers Reference */}
              <div className="bg-[#0f1011] p-4 rounded-2xl border border-white/[0.08] space-y-2">
                <h4 className="font-bold text-[#f7f8f8]">Cabeçalhos HTTP (Headers) enviados:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono text-[#d4d6e0]">
                  <div className="bg-white/[0.04] p-2 rounded-xl border border-white/[0.08]">
                    <b>X-Webhook-Event:</b> status_changed
                  </div>
                  <div className="bg-white/[0.04] p-2 rounded-xl border border-white/[0.08]">
                    <b>X-Webhook-Delivery:</b> del-172398...
                  </div>
                  <div className="bg-white/[0.04] p-2 rounded-xl border border-white/[0.08]">
                    <b>X-Webhook-Timestamp:</b> ISO 8601
                  </div>
                  <div className="bg-white/[0.04] p-2 rounded-xl border border-white/[0.08]">
                    <b>X-Webhook-Signature:</b> sha256=... (HMAC)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0f1011] border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8a8f98]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Webhooks integrados com garantia de entrega em segundo plano (non-blocking).</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </motion.div>
    </div>
  );
};
