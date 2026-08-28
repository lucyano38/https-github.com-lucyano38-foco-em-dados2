import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Send,
  QrCode,
  Gauge,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';
import type { Lead } from '../types';
import { TunnelShareModal } from './TunnelShareModal';

interface RedesignTunnelViewProps {
  leads: Lead[];
  selectedSlug?: string;
  onSelectSlug?: (slug: string) => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ViewMode = 'split' | 'live';

export const RedesignTunnelView: React.FC<RedesignTunnelViewProps> = ({
  leads,
  selectedSlug,
  onSelectSlug,
}) => {
  const [activeSlug, setActiveSlug] = useState<string>(selectedSlug || leads[0]?.slug || '');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [shareModalLead, setShareModalLead] = useState<Lead | null>(null);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const redesignLeads = leads.filter((l) =>
    ['redesenhado', 'publicado', 'proposta', 'respondeu', 'fechado', 'novo'].includes(l.status)
  );

  useEffect(() => {
    if (selectedSlug) {
      setActiveSlug(selectedSlug);
    } else if (!activeSlug && redesignLeads.length > 0) {
      setActiveSlug(redesignLeads[0].slug);
    }
  }, [selectedSlug, redesignLeads]);

  const currentLead = redesignLeads.find((l) => l.slug === activeSlug) || redesignLeads[0];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const tunnelUrl = currentLead ? `${origin}/tunnel/${currentLead.slug}` : '';
  const liveSiteUrl = currentLead ? `${origin}/api/live-site/${currentLead.slug}` : '';
  const oldSiteProxyUrl = currentLead?.siteAntigo
    ? `${origin}/api/site-proxy?url=${encodeURIComponent(currentLead.siteAntigo)}`
    : '';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPitchScript, setShowPitchScript] = useState(false);
  const [pitchCopied, setPitchCopied] = useState(false);

  const handleCopyLink = () => {
    if (!tunnelUrl) return;
    navigator.clipboard.writeText(tunnelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPitch = () => {
    if (!currentLead) return;
    const scriptText = `Oi ${currentLead.nome}! Aqui é da equipe de tecnologia e design.
Estava analisando a presença digital de ${currentLead.nicho || 'empresas da sua região'} e preparei uma demonstração prática de como o seu site ficaria com carregamento em menos de 0.5s e conversão direta para o seu WhatsApp.

Criei um túnel de visualização seguro para você comparar o antes e depois ao vivo:
🔗 ${tunnelUrl}

O que você acha de dar uma olhada e me dizer sua opinião?`;
    navigator.clipboard.writeText(scriptText);
    setPitchCopied(true);
    setTimeout(() => setPitchCopied(false), 2500);
  };

  const handleSelect = (slug: string) => {
    setActiveSlug(slug);
    if (onSelectSlug) onSelectSlug(slug);
  };

  if (redesignLeads.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">Nenhum site em redesign</h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Execute uma missão no OpenSquad ou altere o status de um lead para "Redesenhado" para ativar os túneis de apresentação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col flex-1">
      {/* Top Client Bar & Selector */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap pl-1">
            Clientes / Túneis:
          </span>
          {redesignLeads.map((l) => (
            <button
              key={l.slug}
              onClick={() => handleSelect(l.slug)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                currentLead?.slug === l.slug
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentLead?.slug === l.slug ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-400'
                }`}
              />
              {l.nome}
            </button>
          ))}
        </div>

        {/* Global Tunnel Actions */}
        {currentLead && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPitchScript(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Roteiro de Pitch (60s)
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>

            <button
              onClick={() => setShareModalLead(currentLead)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Compartilhar Túnel
            </button>

            <a
              href="/comparar.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              title="Abrir Comparador Antes vs Depois"
            >
              <Eye className="w-3.5 h-3.5" />
              Comparador
            </a>

            <a
              href={`/api/live-site-editor/${currentLead.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              title="Abrir Editor Visual Nano banana"
            >
              <Sliders className="w-3.5 h-3.5" />
              Editor Visual
            </a>

            <a
              href={tunnelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir Apresentação
            </a>
          </div>
        )}
      </div>

      {/* Control Strip (View Modes + Devices + Core Web Vitals) */}
      <div className="bg-white px-5 py-3 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Modes */}
        <div className="flex items-center gap-2">
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'split' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Antes vs. Depois (Split)
            </button>
            <button
              onClick={() => setViewMode('live')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'live' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              Demonstração Interativa
            </button>
          </div>

          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            title="Recarregar frames"
            className="p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Device Switcher (only active in live mode) */}
        {viewMode === 'live' && (
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setDevice('mobile')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer ${
                device === 'mobile' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile (390px)
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer ${
                device === 'tablet' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              Tablet (768px)
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer ${
                device === 'desktop' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop (100%)
            </button>
          </div>
        )}

        {/* Mini Performance Badge */}
        <div className="flex items-center gap-3 text-neutral-600">
          <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            PageSpeed 99/100
          </span>
          <span className="font-mono text-[11px] text-neutral-400">Latência: ~24ms</span>
        </div>
      </div>

      {/* Frame Viewport Main Container */}
      <div className="flex-1 bg-neutral-900 rounded-3xl border border-neutral-800 p-4 shadow-xl flex flex-col min-h-[560px] overflow-hidden">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
            {/* Site Antigo com Proxy Anti-Bloqueio */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span className="text-xs font-bold text-neutral-300">Antes • Site Atual</span>
                </div>
                {currentLead?.siteAntigo && (
                  <a
                    href={currentLead.siteAntigo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Abrir original <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex-1 bg-neutral-900 relative">
                {oldSiteProxyUrl ? (
                  <iframe
                    key={`old-${iframeKey}`}
                    src={oldSiteProxyUrl}
                    className="w-full h-full border-0 min-h-[460px]"
                    title="Site Antigo Proxy"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-500 text-center">
                    <span className="text-3xl mb-2">⚠️</span>
                    <p className="text-xs font-bold text-neutral-400">Sem URL antiga cadastrada</p>
                    <p className="text-[11px] text-neutral-600 mt-1">O cliente não possuía site ou o domínio está inativo.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Site Redesenhado */}
            <div className="bg-neutral-950 rounded-2xl border border-emerald-500/40 flex flex-col overflow-hidden ring-1 ring-emerald-500/20">
              <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-300">Depois • Nova Versão Otimizada (Túnel)</span>
                </div>
                <a
                  href={liveSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  Abrir tela cheia <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex-1 bg-white relative">
                <iframe
                  key={`new-${iframeKey}`}
                  src={liveSiteUrl}
                  className="w-full h-full border-0 min-h-[460px]"
                  title="Site Redesenhado"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Live Interactive Device Frame */
          <div className="flex-1 flex items-center justify-center p-2 overflow-auto bg-neutral-950/60 rounded-2xl">
            <div
              className={`bg-white rounded-2xl shadow-2xl border transition-all duration-300 overflow-hidden ${
                device === 'mobile'
                  ? 'w-[390px] h-[640px] border-4 border-neutral-700 rounded-3xl'
                  : device === 'tablet'
                  ? 'w-[768px] h-[640px] border-4 border-neutral-700'
                  : 'w-full h-[640px] border border-neutral-800'
              }`}
            >
              <iframe
                key={`live-${iframeKey}`}
                src={liveSiteUrl}
                className="w-full h-full border-0"
                title="Live Redesign Device Frame"
              />
            </div>
          </div>
        )}
      </div>

      {/* Pitch Script Modal */}
      <AnimatePresence>
        {showPitchScript && currentLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-neutral-200 p-6 max-w-lg w-full space-y-4 shadow-2xl text-neutral-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    🎙️
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Roteiro de Abordagem & Pitch em Vídeo (60s)</h3>
                    <p className="text-[11px] text-neutral-500">Grave no Loom ou envie por áudio/WhatsApp com o link do túnel.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPitchScript(false)}
                  className="text-neutral-400 hover:text-neutral-700 text-sm font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-700 space-y-3 font-sans leading-relaxed">
                <p>
                  <b>1. Gancho Inicial:</b> "Oi <i>{currentLead.nome}</i>, tudo bem? Notei que vocês têm excelentes avaliações no Google em {currentLead.cidade || 'sua região'}, mas o site atual pode estar perdendo contatos no celular."
                </p>
                <p>
                  <b>2. Apresentação do Túnel:</b> "Eu criei sem custo prévio uma versão de alta performance com carregamento instantâneo de 0.4s e botão WhatsApp integrado. Você pode comparar o antes e depois no link que preparei:"
                </p>
                <p className="font-mono text-[11px] bg-white p-2 rounded-xl border border-neutral-300 text-neutral-800 break-all">
                  {tunnelUrl}
                </p>
                <p>
                  <b>3. Chamada para Ação:</b> "Se você gostar do resultado, nós cuidamos da migração completa em 48 horas. Quer que eu te envie a proposta resumida?"
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowPitchScript(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={handleCopyPitch}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  {pitchCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {pitchCopied ? 'Texto Copiado!' : 'Copiar Roteiro'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Compartilhamento */}
      <TunnelShareModal
        isOpen={!!shareModalLead}
        lead={shareModalLead}
        onClose={() => setShareModalLead(null)}
      />
    </div>
  );
};
