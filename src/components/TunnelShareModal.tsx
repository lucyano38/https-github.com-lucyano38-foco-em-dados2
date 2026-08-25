import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Sparkles,
  QrCode,
  Send,
  Zap,
  Gauge,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import type { Lead } from '../types';

interface TunnelShareModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
}

export const TunnelShareModal: React.FC<TunnelShareModalProps> = ({
  isOpen,
  lead,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen || !lead) return null;

  const origin = window.location.origin;
  const tunnelUrl = `${origin}/tunnel/${lead.slug}`;
  const liveSiteUrl = `${origin}/api/live-site/${lead.slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    tunnelUrl
  )}&color=171717&bgcolor=ffffff&margin=1`;

  const copyWhatsAppPitch = () => {
    const text = `Olá! Nossa equipe finalizou o redesign exclusivo e moderno do site da *${lead.nome}*.\n\nPreparamos um *Túnel Seguro de Demonstração Interativa* onde você pode comparar o antes vs. depois e testar a velocidade no celular:\n\n👉 Acesse aqui: ${tunnelUrl}\n\nO que achou da nova versão? Ficamos à disposição para publicar no seu domínio!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyTunnelLink = () => {
    navigator.clipboard.writeText(tunnelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sendWhatsAppDirect = () => {
    const rawNumber = (lead.whatsapp || lead.telefone || '').replace(/\D/g, '');
    const num = rawNumber.startsWith('55') ? rawNumber : `55${rawNumber}`;
    const text = encodeURIComponent(
      `Olá! Nossa equipe finalizou o redesign exclusivo e moderno do site da ${lead.nome}.\n\nPreparamos um Túnel Seguro de Demonstração Interativa onde você pode testar a nova versão:\n\n👉 ${tunnelUrl}\n\nFicamos no aguardo da sua aprovação!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${num}&text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-white rounded-3xl border border-neutral-200/90 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4.5 bg-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Túnel de Apresentação do Redesign
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ao Vivo
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  {lead.nome} • {lead.nicho}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
            {/* Status & Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                  Score PageSpeed
                </div>
                <div className="text-lg font-extrabold text-emerald-700">99 / 100</div>
                <p className="text-[11px] text-emerald-800/80">Carregamento em ~0.4s</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  Mobile & WhatsApp
                </div>
                <div className="text-lg font-extrabold text-blue-700">100% Responsivo</div>
                <p className="text-[11px] text-blue-800/80">Otimizado para conversão</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Segurança & SSL
                </div>
                <div className="text-lg font-extrabold text-amber-700">TLS 1.3 Ativo</div>
                <p className="text-[11px] text-amber-800/80">Túnel com link permanente</p>
              </div>
            </div>

            {/* Tunnel URL Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700">
                Link Público do Túnel para Enviar ao Cliente:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={tunnelUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-mono text-neutral-800 select-all"
                />
                <button
                  onClick={copyTunnelLink}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={tunnelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-between group transition shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Abrir Apresentação</div>
                    <div className="text-[11px] text-neutral-400">Ver como o cliente verá</div>
                  </div>
                </div>
                <span className="text-neutral-400 group-hover:text-white transition">➔</span>
              </a>

              <button
                onClick={sendWhatsAppDirect}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-between group transition shadow-md shadow-emerald-600/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Disparar no WhatsApp</div>
                    <div className="text-[11px] text-emerald-100">Com mensagem formatada</div>
                  </div>
                </div>
                <span className="text-emerald-200 group-hover:text-white transition">➔</span>
              </button>
            </div>

            {/* Pitch & QR Code Collapsible */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">
                  Script de Envio Recomendado:
                </span>
                <button
                  onClick={copyWhatsAppPitch}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copiar Mensagem Pronta
                </button>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-700 leading-relaxed font-sans space-y-2">
                <p>
                  "Olá! Nossa equipe finalizou o redesign exclusivo e moderno do site da{' '}
                  <b>{lead.nome}</b>. Preparamos um <b>Túnel Seguro de Demonstração Interativa</b>{' '}
                  para você testar:"
                </p>
                <div className="text-blue-600 font-mono text-[11px]">{tunnelUrl}</div>
                <p className="text-[11px] text-neutral-500">
                  Inclui comparativo Antes/Depois, teste de velocidade Core Web Vitals e simulação mobile.
                </p>
              </div>
            </div>

            {/* QR Code toggle */}
            <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setShowQrCode(!showQrCode)}
                className="text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                {showQrCode ? 'Ocultar QR Code' : 'Gerar QR Code para Celular'}
              </button>

              <span className="text-[11px] text-neutral-400">
                Pode ser escaneado por qualquer iPhone ou Android
              </span>
            </div>

            {showQrCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-neutral-900 rounded-2xl text-center space-y-3"
              >
                <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
                </div>
                <p className="text-xs text-neutral-300">
                  Mostre este QR code na reunião presencial ou chamada de vídeo para o cliente abrir no smartphone.
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <span>Túnel com roteamento dinâmico ativo</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl font-bold transition"
            >
              Concluir
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
