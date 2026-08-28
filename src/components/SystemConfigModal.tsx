import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  Palette,
  Cpu,
  Database,
  Plug,
  Info,
  Check,
  RotateCcw,
  Sparkles,
  Shield,
  Activity,
  HardDrive,
  Download,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export interface SystemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  themeMode: 'parchment' | 'dark' | 'contrast';
  onSelectTheme: (theme: 'parchment' | 'dark' | 'contrast') => void;
  totalDeliberationsCount: number;
  onClearSessionMemory?: () => void;
  onExportSessionJson?: () => void;
}

export const SystemConfigModal: React.FC<SystemConfigModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  themeMode,
  onSelectTheme,
  totalDeliberationsCount,
  onClearSessionMemory,
  onExportSessionJson,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'models' | 'memory' | 'plugins' | 'about'>('models');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const [reasoningEffort, setReasoningEffort] = useState<'low' | 'medium' | 'high'>('medium');

  // Plugins list state
  const [enabledPlugins, setEnabledPlugins] = useState({
    googleMaps: true,
    webAuditor: true,
    whatsappDirect: true,
    contractGenerator: true,
    mrrCalculator: true,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-3xl bg-[#fcfbf9] text-neutral-900 rounded-3xl border border-neutral-300/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                <Sliders className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Configurações do Sistema & OpenSquad Engine</h2>
                <p className="text-[11px] text-neutral-500">Parâmetros de orquestração, modelos de IA, plugins e memória</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Left Nav + Right Content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[460px]">
            {/* Left Nav */}
            <aside className="w-full md:w-56 bg-neutral-50 p-3 border-r border-neutral-200/80 flex flex-col gap-1 shrink-0">
              {[
                { id: 'models', label: 'Modelos de IA & Orquestração', icon: Cpu },
                { id: 'appearance', label: 'Aparência & Tema', icon: Palette },
                { id: 'memory', label: 'Memória & Sessão', icon: Database },
                { id: 'plugins', label: 'Plugins & Ferramentas', icon: Plug },
                { id: 'about', label: 'Status do Sistema & Sobre', icon: Info },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                      isActive
                        ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </aside>

            {/* Right Content Panel */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* TAB: MODELS & ORCHESTRATION */}
              {activeTab === 'models' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      Modelo do Orquestrador Multi-Agente
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        {
                          id: 'gemini-3.7-flash',
                          name: 'Gemini 3.7 Flash (Padrão Recomendado)',
                          badge: 'Ultra Rápido & Fluido',
                          desc: 'Equilíbrio ideal entre raciocínio ágil, geração estruturada de leads e latência reduzida para os 5 agentes.',
                        },
                        {
                          id: 'gemini-3.7-pro',
                          name: 'Gemini 3.7 Pro (Alta Capacidade Cognitiva)',
                          badge: 'Raciocínio Profundo',
                          desc: 'Para análises de mercado ultra-complexas e elaboração aprofundada de minutas de contrato.',
                        },
                      ].map((m) => {
                        const isSelected = selectedModel === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => onSelectModel(m.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                              isSelected
                                ? 'bg-white border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs'
                                : 'bg-neutral-50/70 hover:bg-white border-neutral-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-neutral-900">{m.name}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300">
                                  {m.badge}
                                </span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1">{m.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Temperature & Token Settings */}
                  <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700">Temperatura Criativa</span>
                      <span className="font-mono font-bold text-neutral-900">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-neutral-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>0.0 (Preciso / Fatos)</span>
                      <span>0.7 (Ideal Prospecção)</span>
                      <span>1.0 (Máxima Criatividade)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: APPEARANCE & THEME */}
              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      Estilo Visual do Workspace (Design System OpenSquad)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'parchment',
                          name: 'Warm Parchment (Padrão)',
                          desc: 'Fundo papel suave, excelente contraste de leitura.',
                          previewBg: 'bg-[#faf9f6] border-neutral-300',
                        },
                        {
                          id: 'dark',
                          name: 'Soft Slate Studio',
                          desc: 'Superfícies carvão e texto claro para trabalho noturno.',
                          previewBg: 'bg-neutral-900 border-neutral-700 text-neutral-100',
                        },
                        {
                          id: 'contrast',
                          name: 'High Contrast Linear',
                          desc: 'Bordas nítidas inspiradas no padrão Linear.',
                          previewBg: 'bg-white border-neutral-900',
                        },
                      ].map((t) => {
                        const isSelected = themeMode === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => onSelectTheme(t.id as any)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                              isSelected
                                ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs'
                                : 'border-neutral-200 hover:border-neutral-300'
                            } ${t.previewBg}`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">{t.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                              </div>
                              <p className="text-[11px] opacity-70">{t.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MEMORY & SESSION */}
              {activeTab === 'memory' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-neutral-800">Status da Memória de Sessão</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {totalDeliberationsCount} Mensagens em Buffer
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      O contexto da sessão permite que os 5 agentes consultem decisões anteriores, alvos já qualificados e feedbacks dados pelo operador no chat.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      {onExportSessionJson && (
                        <button
                          onClick={onExportSessionJson}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Exportar Histórico (JSON)
                        </button>
                      )}
                      {onClearSessionMemory && (
                        <button
                          onClick={onClearSessionMemory}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition border border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Limpar Memória da Sessão
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PLUGINS & TOOLS */}
              {activeTab === 'plugins' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Plugins e Ferramentas Habilitadas para os Agentes
                  </h3>
                  {[
                    {
                      key: 'googleMaps',
                      name: 'Google Places & Maps Scout',
                      agent: 'Hunter (Bia)',
                      desc: 'Pesquisa geolocalizada de empresas, telefones e notas de avaliação.',
                    },
                    {
                      key: 'webAuditor',
                      name: 'Web UI & Performance Auditor',
                      agent: 'Redesigner (Lucas)',
                      desc: 'Diagnóstico de velocidade mobile, SSL e arquitetura visual.',
                    },
                    {
                      key: 'whatsappDirect',
                      name: 'WhatsApp Direct Link Generator',
                      agent: 'Copywriter (Camila)',
                      desc: 'Formatação de links diretos de mensagem com encoding de texto.',
                    },
                    {
                      key: 'contractGenerator',
                      name: 'Gerador de Minutas Contratuais A4',
                      agent: 'QA (Gabriel)',
                      desc: 'Estruturação de contratos de prestação de serviços com cláusulas de MRR.',
                    },
                    {
                      key: 'mrrCalculator',
                      name: 'Simulador Preditivo de MRR / ARR D3',
                      agent: 'PM (Alexandre) & QA',
                      desc: 'Cálculo de LTV, curva de receita recorrente e previsão de crescimento.',
                    },
                  ].map((p) => {
                    const isChecked = (enabledPlugins as any)[p.key];
                    return (
                      <div
                        key={p.key}
                        className="p-3 bg-white rounded-2xl border border-neutral-200 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-neutral-900">{p.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                              {p.agent}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{p.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setEnabledPlugins((prev) => ({ ...prev, [p.key]: e.target.checked }))
                          }
                          className="w-4 h-4 accent-neutral-900 cursor-pointer rounded"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB: ABOUT & SYSTEM HEALTH */}
              {activeTab === 'about' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">Versão do OpenSquad</span>
                      <span className="font-mono text-emerald-600 font-bold">v2.4.0 (Enterprise Engine)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">Servidor Node & Express</span>
                      <span className="font-mono text-neutral-600">Porta 3000 (0.0.0.0)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">API Gemini Conectada</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online (@google/genai)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">Arquitetura de Dados</span>
                      <span className="font-mono text-neutral-600">Local-First JSON + Sincronização CRM</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    OpenSquad é um framework de colaboração multi-agente autônomo baseado nos princípios de engenharia da Google DeepMind e Gemini 3.7.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200/80 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">
              OpenSquad Multi-Agent • Google AI Studio
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Concluir & Salvar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
