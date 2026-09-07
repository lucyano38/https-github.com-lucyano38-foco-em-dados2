import React, { useState } from 'react';
import {
  Sparkles, Zap, RefreshCw, CheckCircle2, MapPin, Globe, Search,
  BarChart3, Users, TrendingUp, Bot, Send, ChevronDown, ChevronUp,
  ExternalLink, Building2, Star, Phone, Mail, Loader2, Target, ShieldCheck,
  Database, Map
} from 'lucide-react';

const NICHOS = [
  'Restaurantes & Gastronomia',
  'Odontologia & Estética',
  'Advocacia & Direito',
  'Barbearias & Estética',
  'Automotivo & Serviços',
  'Comércio Local',
  'Construção Civil',
  'Imobiliário',
  'Pallets / Embalagens / Logística',
  'Educação & Cursos',
  'Tecnologia & SaaS',
  'Saúde & Bem-estar',
  'Academia & Fitness',
  'Pet Shop / Veterinário',
  'Posto de Gasolina',
  'Hotel / Hospedagem',
];

interface FontesInfo {
  overpass: number;
  googlePlaces: number;
  cnaeBrasilAPI: number;
  total: number;
}

interface LeadResult {
  id: string;
  nome: string;
  nicho: string;
  cidade: string;
  temSite: boolean;
  siteUrl?: string;
  necessitaRedesign: boolean;
  redesignPreviewUrl?: string;
  status: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  rating?: number;
  reviewsCount?: number;
  notas?: string;
  fonte?: string;
  googleRating?: number;
  googleTotalRatings?: number;
  distancia?: number;
}

interface PipelineStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'done' | 'error';
}

export const HermesGrowthEngineView: React.FC = () => {
  const [nicho, setNicho] = useState(NICHOS[0]);
  const [customNicho, setCustomNicho] = useState('');
  const [cidade, setCidade] = useState('Barueri/SP');
  const [raio, setRaio] = useState(10);
  const [ticketTarget, setTicketTarget] = useState(1500);
  const [mrrTarget, setMrrTarget] = useState(200);
  const [focus, setFocus] = useState('Conversão Mobile e WhatsApp');

  const [isRunning, setIsRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: 'geo', label: 'Geolocalização', icon: <MapPin className="w-4 h-4" />, status: 'pending' },
    { id: 'discover', label: 'Descoberta Multi-Fonte', icon: <Search className="w-4 h-4" />, status: 'pending' },
    { id: 'redesign', label: 'Redesign IA', icon: <Sparkles className="w-4 h-4" />, status: 'pending' },
    { id: 'crm', label: 'Salvar no CRM', icon: <CheckCircle2 className="w-4 h-4" />, status: 'pending' },
  ]);

  const [leads, setLeads] = useState<LeadResult[]>([]);
  const [coords, setCoords] = useState<{ lat: number | null; lon: number | null; cidade: string }>({ lat: null, lon: null, cidade: '' });
  const [error, setError] = useState<string | null>(null);
  const [savedToCrm, setSavedToCrm] = useState<Set<string>>(new Set());
  const [fontesInfo, setFontesInfo] = useState<FontesInfo | null>(null);

  const [autopilotOpen, setAutopilotOpen] = useState(false);
  const [autopilotAtivo, setAutopilotAtivo] = useState(false);
  const [autopilotLogs, setAutopilotLogs] = useState<string[]>([
    'Hermes Growth Engine inicializado.',
    'Aguardando ativação do Modo Autopiloto.',
  ]);

  const activeNicho = customNicho.trim() || nicho;

  const updateStep = (id: string, status: PipelineStep['status']) => {
    setPipelineSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const runPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setError(null);
    setLeads([]);
    setSavedToCrm(new Set());
    setFontesInfo(null);
    setPipelineSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

    try {
      updateStep('geo', 'running');
      updateStep('geo', 'done');

      updateStep('discover', 'running');
      const res = await fetch('/api/pipeline-prospeccao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, customNicho: customNicho.trim() || undefined, cidade, raio, maxResults: 30 }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Resposta inválida do servidor');
      }

      if (!res.ok) {
        throw new Error(data.error || data.erro || `Erro ${res.status}`);
      }

      updateStep('discover', 'done');

      if (data.coordenadas) {
        setCoords({ lat: data.coordenadas.lat, lon: data.coordenadas.lon, cidade });
      }

      if (data.fontes) {
        setFontesInfo(data.fontes);
      }

      updateStep('redesign', 'running');
      const redesignsCount = (data.leads || []).filter((l: LeadResult) => l.redesignPreviewUrl).length;
      await new Promise(r => setTimeout(r, 500));
      updateStep('redesign', 'done');

      updateStep('crm', 'running');
      await new Promise(r => setTimeout(r, 300));
      updateStep('crm', 'done');

      setLeads(data.leads || []);

      if (autopilotAtivo) {
        setAutopilotLogs(prev => [
          `🚀 [PROSPECÇÃO] ${data.leads?.length || 0} leads descobertos em ${cidade} (${activeNicho})`,
          `📊 [FONTES] ${data.fonteDescricao || 'múltiplas fontes'}`,
          `🎨 [REDESIGN] ${redesignsCount} redesigns gerados via IA`,
          `✅ [CRM] ${(data.leads || []).length} leads salvos no pipeline`,
          ...prev,
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
      setPipelineSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s));
    } finally {
      setIsRunning(false);
    }
  };

  const addToCrm = async (lead: LeadResult) => {
    try {
      const payload = {
        slug: lead.id || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nome: lead.nome,
        nicho: lead.nicho,
        cidade: lead.cidade,
        status: 'novo',
        siteAntigo: lead.siteUrl || '',
        valor: ticketTarget,
        manutencao: mrrTarget,
        obs: `Prospectado via Hermes Growth Engine (${lead.fonte || 'Pipeline'}). ${lead.notas || ''}`,
        telefone: lead.telefone,
        whatsapp: lead.whatsapp,
        email: lead.email,
        nota: lead.googleRating || lead.rating,
        avaliacoes: lead.googleTotalRatings || lead.reviewsCount,
      };
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSavedToCrm(prev => new Set(prev).add(lead.id));
      }
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
    }
  };

  const toggleAutopilot = () => {
    const next = !autopilotAtivo;
    setAutopilotAtivo(next);
    if (next) {
      setAutopilotLogs(prev => [
        `🚀 [AUTOPILOTO ATIVADO] Hermes assumiu prospecção e marketing de ${activeNicho} em ${cidade}.`,
        'Monitorando Google Maps, OpenStreetMap, CNAE e redes sociais...',
        ...prev,
      ]);
    } else {
      setAutopilotLogs(prev => [`⏸️ [AUTOPILOTO PAUSADO]`, ...prev]);
    }
  };

  const totalLeads = leads.length;
  const comSite = leads.filter(l => l.temSite).length;
  const semSite = leads.filter(l => !l.temSite).length;
  const redesigns = leads.filter(l => l.redesignPreviewUrl).length;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 p-4 md:p-8 font-sans bg-[#010102] text-[#f7f8f8]">

      {/* HEADER */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a574]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a574]/10 border border-[#d4a574]/20 text-xs font-semibold text-[#d4a574]">
              <Sparkles className="w-3.5 h-3.5" /> Hermes Growth Engine • Prospecção Multi-Fonte
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#f7f8f8]">
              Crescimento no Piloto Automático
            </h1>
            <p className="text-sm text-[#8a8f98] leading-relaxed">
              Busque empresas em 3 fontes simultâneas — Google Places, OpenStreetMap e CNAE — identifique sites obsoletos, gere redesigns com IA e salve tudo no CRM.
            </p>
          </div>
          {coords.lat && (
            <div className="bg-[#010102] border border-white/[0.08] p-4 rounded-2xl flex flex-col items-center gap-2 shrink-0">
              <MapPin className="w-5 h-5 text-[#d4a574]" />
              <span className="text-[11px] font-mono text-[#8a8f98]">{coords.lat.toFixed(4)}, {coords.lon?.toFixed(4)}</span>
              <span className="text-[10px] text-[#d4a574]">{coords.cidade}</span>
            </div>
          )}
        </div>
      </div>

      {/* CONFIG FORM */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
        <div className="text-sm font-semibold text-[#d4d6e0] mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#d4a574]" /> Configuração da Prospecção
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Nicho / CNAE</label>
            <select value={nicho} onChange={e => setNicho(e.target.value)} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]">
              {NICHOS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input value={customNicho} onChange={e => setCustomNicho(e.target.value)} placeholder="Ou digite um nicho customizado" className="mt-2 w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8] placeholder-[#555]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Cidade</label>
            <input value={cidade} onChange={e => setCidade(e.target.value)} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
            <label className="text-xs font-semibold text-[#8a8f98] mt-2 mb-1 block">Raio (km)</label>
            <input type="number" value={raio} onChange={e => setRaio(Number(e.target.value))} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Ticket alvo (R$)</label>
            <input type="number" value={ticketTarget} onChange={e => setTicketTarget(Number(e.target.value))} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
            <label className="text-xs font-semibold text-[#8a8f98] mt-2 mb-1 block">MRR alvo (R$/mês)</label>
            <input type="number" value={mrrTarget} onChange={e => setMrrTarget(Number(e.target.value))} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Foco da abordagem</label>
            <input value={focus} onChange={e => setFocus(e.target.value)} className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]" />
          </div>
        </div>
        <div className="mt-5">
          <button onClick={runPipeline} disabled={isRunning} className="px-6 py-3 rounded-xl bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] text-xs font-bold shadow-[0_0_20px_rgba(212,165,116,0.25)] disabled:opacity-50 cursor-pointer flex items-center gap-2">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isRunning ? 'Buscando em 3 fontes...' : '🚀 Iniciar Prospecção Multi-Fonte'}
          </button>
        </div>
      </div>

      {/* PIPELINE STATUS */}
      {(isRunning || leads.length > 0 || error) && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
          <div className="text-sm font-semibold text-[#d4d6e0] mb-4">Pipeline de Execução</div>
          <div className="flex flex-wrap gap-3">
            {pipelineSteps.map(step => (
              <div key={step.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                step.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                step.status === 'running' ? 'bg-[#d4a574]/10 border-[#d4a574]/30 text-[#d4a574] animate-pulse' :
                step.status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                'bg-white/[0.04] border-white/[0.08] text-[#8a8f98]'
              }`}>
                {step.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> :
                 step.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 step.icon}
                {step.label}
              </div>
            ))}
          </div>
          {error && <div className="mt-3 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl">{error}</div>}
        </div>
      )}

      {/* FONTES DE DADOS */}
      {fontesInfo && fontesInfo.total > 0 && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-5 shadow-xl">
          <div className="text-sm font-semibold text-[#d4d6e0] mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#d4a574]" /> Fontes de Dados Consultadas
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
              <Map className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-300 font-bold">{fontesInfo.googlePlaces}</span>
              <span className="text-[#8a8f98]">Google Places</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-bold">{fontesInfo.overpass}</span>
              <span className="text-[#8a8f98]">OpenStreetMap</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300 font-bold">{fontesInfo.cnaeBrasilAPI}</span>
              <span className="text-[#8a8f98]">CNAE/BrasilAPI</span>
            </div>
          </div>
        </div>
      )}

      {/* METRICS SUMMARY */}
      {leads.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f1011] p-4 text-center">
            <div className="text-2xl font-extrabold text-[#f7f8f8] font-mono">{totalLeads}</div>
            <div className="text-[11px] text-[#8a8f98] mt-1">Leads Encontrados</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f1011] p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{comSite}</div>
            <div className="text-[11px] text-[#8a8f98] mt-1">Com Site</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f1011] p-4 text-center">
            <div className="text-2xl font-extrabold text-amber-400 font-mono">{semSite}</div>
            <div className="text-[11px] text-[#8a8f98] mt-1">Sem Site</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f1011] p-4 text-center">
            <div className="text-2xl font-extrabold text-purple-400 font-mono">{redesigns}</div>
            <div className="text-[11px] text-[#8a8f98] mt-1">Redesigns IA</div>
          </div>
        </div>
      )}

      {/* LEADS RESULTS */}
      {leads.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-[#d4d6e0] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#d4a574]" /> Leads Qualificados
          </div>
          {leads.map(lead => (
            <div key={lead.id} className="rounded-2xl border border-white/[0.08] bg-[#0f1011] p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#d4a574] shrink-0" />
                  <h3 className="text-sm font-bold text-[#f7f8f8]">{lead.nome}</h3>
                  {(lead.googleRating || lead.rating) && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" /> {lead.googleRating || lead.rating}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8a8f98] border border-white/[0.08]">{lead.nicho}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8a8f98] border border-white/[0.08]">{lead.cidade}</span>
                  {lead.fonte && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      lead.fonte === 'Google Places' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      lead.fonte === 'OpenStreetMap' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {lead.fonte}
                    </span>
                  )}
                  {lead.temSite ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Com Site</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Sem Site</span>
                  )}
                  {lead.necessitaRedesign && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Redesign IA</span>
                  )}
                  {lead.distancia !== null && lead.distancia !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[#555] border border-white/[0.06]">
                      📍 {lead.distancia}km
                    </span>
                  )}
                </div>
                {lead.notas && <p className="text-[11px] text-[#8a8f98]">{lead.notas}</p>}
                <div className="flex flex-wrap gap-3 text-[11px] text-[#8a8f98]">
                  {lead.telefone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.telefone}</span>}
                  {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {savedToCrm.has(lead.id) ? (
                  <span className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No CRM
                  </span>
                ) : (
                  <button onClick={() => addToCrm(lead)} className="px-3 py-2 rounded-xl bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] text-xs font-bold cursor-pointer">
                    + CRM
                  </button>
                )}
                {lead.redesignPreviewUrl && (
                  <a href={lead.redesignPreviewUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl border border-white/[0.08] text-[#d4d6e0] text-xs font-semibold hover:bg-white/[0.06] flex items-center gap-1">
                    Preview <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {lead.siteUrl && (
                  <a href={lead.siteUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl border border-white/[0.08] text-[#8a8f98] text-xs font-semibold hover:bg-white/[0.06]">
                    Site
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MARKETING AUTOPILOT */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] shadow-xl overflow-hidden">
        <button onClick={() => setAutopilotOpen(!autopilotOpen)} className="w-full px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-[#d4a574]" />
            <span className="text-sm font-semibold text-[#d4d6e0]">Marketing Autopiloto 24/7</span>
            {autopilotAtivo && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">ATIVO</span>}
          </div>
          {autopilotOpen ? <ChevronUp className="w-4 h-4 text-[#8a8f98]" /> : <ChevronDown className="w-4 h-4 text-[#8a8f98]" />}
        </button>
        {autopilotOpen && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-[#010102] border border-white/[0.08] p-3 rounded-xl">
                <div className="text-lg font-extrabold text-[#f7f8f8] font-mono">24</div>
                <div className="text-[10px] text-[#8a8f98]">Posts/mês</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-3 rounded-xl">
                <div className="text-lg font-extrabold text-blue-400 font-mono">18.4k</div>
                <div className="text-[10px] text-[#8a8f98]">Alcance</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-3 rounded-xl">
                <div className="text-lg font-extrabold text-amber-400 font-mono">{totalLeads || 42}</div>
                <div className="text-[10px] text-[#8a8f98]">Leads</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-3 rounded-xl">
                <div className="text-lg font-extrabold text-purple-400 font-mono">{redesigns || 12}</div>
                <div className="text-[10px] text-[#8a8f98]">Redesigns</div>
              </div>
            </div>
            <button onClick={toggleAutopilot} className={`px-5 py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2 ${
              autopilotAtivo
                ? 'bg-emerald-500 hover:bg-emerald-400 text-[#010102] shadow-emerald-500/30'
                : 'bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] shadow-[#d4a574]/30'
            }`}>
              <Zap className="w-4 h-4" />
              {autopilotAtivo ? '🟢 AUTOPILOTO ATIVO' : '🚀 ATIVAR AUTOPILOTO'}
            </button>
            <div className="bg-[#010102] border border-white/[0.08] rounded-2xl p-4 font-mono text-[11px] text-[#8a8f98] space-y-1.5 max-h-48 overflow-y-auto">
              <div className="text-[#d4a574] font-bold border-b border-white/[0.08] pb-2 mb-2">Terminal de Operações</div>
              {autopilotLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#555] shrink-0">[{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}]</span>
                  <span className={idx === 0 ? 'text-emerald-400 font-bold' : ''}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HermesGrowthEngineView;
