import React, { useState } from 'react';
import { 
  Sparkles, Bot, Zap, Play, CheckCircle2, RefreshCw, Send, 
  Share2, BarChart3, Users, Globe, Layers, Check, ShieldCheck, Target, MessageSquare 
} from 'lucide-react';

export const HermesGrowthEngineView: React.FC = () => {
  const [empresa, setEmpresa] = useState('Foco em Dados');
  const [objetivo, setObjetivo] = useState('Automação WhatsApp & Prospecção B2B');
  const [publico, setPublico] = useState('Pequenas Empresas, Clínicas e Advogados');
  const [tom, setTom] = useState('Profissional & Consultivo (Autoridade)');
  const [frequencia, setFrequencia] = useState(5); // posts por semana

  const [autopilotAtivo, setAutopilotAtivo] = useState(false);
  const [logAtividade, setLogAtividade] = useState<string[]>([
    'Hermes Growth Engine inicializado com sucesso.',
    'Estratégia de conteúdo e público-alvo calibrada.',
    'Aguardando ativação do Modo Autopiloto 24/7.'
  ]);

  const toggleAutopilot = () => {
    const proximo = !autopilotAtivo;
    setAutopilotAtivo(proximo);
    if (proximo) {
      setLogAtividade(prev => [
        `🚀 [AUTOPILOTO ATIVADO] Hermes assumiu o marketing e prospecção de ${empresa}.`,
        'Gerando calendário editorial de posts e carrosséis...',
        'Conectando com Instagram, Facebook e Google Business...',
        ...prev
      ]);
    } else {
      setLogAtividade(prev => [`⏸️ [AUTOPILOTO PAUSADO] Operação manual retomada.`, ...prev]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-10 text-slate-100 font-sans">
      
      {/* HEADER DO HERMES GROWTH ENGINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> Hermes Growth Engine • Diretor de Marketing Autônomo
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Crescimento Empresarial no Piloto Automático
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              O Hermes opera 24h criando conteúdos, gerando criativos visuais, monitorando redes sociais, capturando leads e alimentando o OpenSquad e o CRM sem você precisar fazer nada manualmente.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 shrink-0 shadow-inner">
            <span className="text-xs font-mono text-slate-400">Status do Autopiloto</span>
            <button
              onClick={toggleAutopilot}
              className={`px-6 py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2 ${
                autopilotAtivo 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 animate-pulse' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
              }`}
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              {autopilotAtivo ? '🟢 AUTOPILOTO HERMES ATIVO' : '🚀 ATIVAR AUTOPILOTO HERMES'}
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL EXECUTIVO EM TEMPO REAL */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-xl font-extrabold text-white font-mono">24</div>
          <div className="text-[11px] text-slate-400 mt-1">Posts Publicados</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-xl font-extrabold text-blue-400 font-mono">18.4k</div>
          <div className="text-[11px] text-slate-400 mt-1">Alcance Total</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-xl font-extrabold text-amber-400 font-mono">42</div>
          <div className="text-[11px] text-slate-400 mt-1">Leads Gerados</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-xl font-extrabold text-emerald-400 font-mono">37</div>
          <div className="text-[11px] text-slate-400 mt-1">Empresas Identificadas</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-xl font-extrabold text-purple-400 font-mono">12</div>
          <div className="text-[11px] text-slate-400 mt-1">Redesigns Criados</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-xl font-extrabold text-cyan-400 font-mono">15</div>
          <div className="text-[11px] text-slate-400 mt-1">Propostas Geradas</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-xl font-extrabold text-emerald-400 font-mono">8</div>
          <div className="text-[11px] text-slate-400 mt-1">Clientes Fechados</div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="text-xl font-extrabold text-amber-400 font-mono">R$ 18.2k</div>
          <div className="text-[11px] text-slate-400 mt-1">Receita Gerada</div>
        </div>
      </div>

      {/* CONFIGURAÇÃO INICIAL E PLANEJAMENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configuração */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            ⚙️ Configuração de Negócio
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Nome da Empresa</label>
              <input type="text" value={empresa} onChange={e => setEmpresa(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Objetivo de Captação</label>
              <input type="text" value={objetivo} onChange={e => setObjetivo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Público-alvo</label>
              <input type="text" value={publico} onChange={e => setPublico(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Tom de Comunicação</label>
              <input type="text" value={tom} onChange={e => setTom(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Publicações por Semana: {frequencia}</label>
              <input type="range" min="1" max="14" value={frequencia} onChange={e => setFrequencia(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Estratégia & Conteúdo Gerado Automático */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              ✨ Estratégia & Conteúdo Gerado pelo Hermes
            </h2>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-full">Atualizado em tempo real</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-amber-400 font-bold block">📅 Calendário Editorial</span>
              <p className="text-slate-300">Seg: Case de Sucesso • Quarta: Autoridade em BI • Sexta: Oferta Automação WhatsApp</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-blue-400 font-bold block">🎨 Criativos Visuais (Flux / DALL-E)</span>
              <p className="text-slate-300">3 Carrosséis comerciais gerados e agendados para Instagram e LinkedIn.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-emerald-400 font-bold block">🤖 Monitoramento Omnichannel</span>
              <p className="text-slate-300">WhatsApp, Instagram e Facebook escaneados. 4 leads qualificados enviados ao OpenSquad.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-purple-400 font-bold block">📈 Aprendizado Contínuo</span>
              <p className="text-slate-300">O nicho de clínicas e advogados apresentou 4x mais conversão. Ajustando foco de anúncios.</p>
            </div>
          </div>

          {/* Log de Atividades do Autopiloto */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-slate-300 space-y-2 max-h-48 overflow-y-auto">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-1.5">Terminal de Operações 24/7 (Hermes Growth Engine)</div>
            {logAtividade.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                <span className={idx === 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{log}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};

export default HermesGrowthEngineView;
