import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Copy, CheckCircle, Hash, Calendar, Sparkles, Send, Loader2, BarChart3 } from 'lucide-react';

const NICHOS = [
  'Restaurantes & Gastronomia', 'Odontologia & Estética', 'Advocacia & Direito',
  'Barbearias & Estética', 'Automotivo & Serviços', 'Comércio Local',
  'Construção Civil', 'Imobiliário', 'Educação & Cursos', 'Tecnologia & SaaS',
  'Saúde & Bem-estar', 'Academia & Fitness', 'Pet Shop / Veterinário',
];

const REDES_OPTIONS = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok'];

interface SocialData {
  empresa: string; nicho: string; redes: string[];
  horarios: { melhor: string[]; bom: string[]; ruim: string[] };
  legendas: { texto: string; hashtags: string; rede: string; tipo: string }[];
  estrategiaHashtags: { principais: string[]; dicas: string[] };
  calendario: { dia: string; tipo: string; sugestao: string; melhorHorario: string }[];
  metricasEstimadas: { alcance: number; engajamento: string; melhorRede: string };
}

export const SocialPulseView: React.FC = () => {
  const [empresa, setEmpresa] = useState('');
  const [nicho, setNicho] = useState(NICHOS[0]);
  const [redes, setRedes] = useState<string[]>(['Instagram']);
  const [data, setData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<{ empresa: string; nicho: string; date: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('social_pulse_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const toggleRede = (rede: string) => {
    setRedes(prev => prev.includes(rede) ? prev.filter(r => r !== rede) : [...prev, rede]);
  };

  const handleGenerate = async () => {
    if (!empresa.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/social-engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa: empresa.trim(), nicho, redes }),
      });
      const result = await res.json();
      setData(result);
      const newHistory = [{ empresa: empresa.trim(), nicho, date: new Date().toLocaleDateString('pt-BR') }, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('social_pulse_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Erro ao gerar sugestões:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 p-4 md:p-8 font-sans bg-[#010102] text-[#f7f8f8]">

      {/* HEADER */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a574]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a574]/10 border border-[#d4a574]/20 text-xs font-semibold text-[#d4a574]">
              <TrendingUp className="w-3.5 h-3.5" /> Pulso Social • Engajamento Automático
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Estratégia de Conteúdo com IA</h1>
            <p className="text-sm text-[#8a8f98] leading-relaxed">
              Gere legendas, hashtags e um calendário de conteúdo completo para suas redes sociais. Horários otimizados por nicho.
            </p>
          </div>
        </div>
      </div>

      {/* CONFIG */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
        <div className="text-sm font-semibold text-[#d4d6e0] mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4a574]" /> Configuração
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Nome da Empresa</label>
            <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ex: Dra. Mariana Odontologia"
              className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8] placeholder-[#555]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Nicho</label>
            <select value={nicho} onChange={e => setNicho(e.target.value)}
              className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2 text-xs text-[#f7f8f8]">
              {NICHOS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Redes Sociais</label>
            <div className="flex flex-wrap gap-2">
              {REDES_OPTIONS.map(r => (
                <button key={r} onClick={() => toggleRede(r)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${redes.includes(r) ? 'bg-[#d4a574] text-[#1c1917]' : 'bg-[#010102] border border-white/[0.08] text-[#8a8f98] hover:text-white'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5">
          <button onClick={handleGenerate} disabled={loading || !empresa.trim()}
            className="px-6 py-3 rounded-xl bg-[#d4a574] hover:bg-[#e2b98a] text-[#1c1917] text-xs font-bold shadow-[0_0_20px_rgba(212,165,116,0.25)] disabled:opacity-50 cursor-pointer flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Gerando...' : '🚀 Gerar Estratégia de Conteúdo'}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {data && (
        <>
          {/* MÉTRICAS */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="text-sm font-semibold text-[#d4d6e0] mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#d4a574]" /> Métricas Estimadas
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#010102] border border-white/[0.08] p-4 rounded-xl">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">{data.metricasEstimadas.alcance.toLocaleString()}</div>
                <div className="text-[10px] text-[#8a8f98]">Alcance Semanal Est.</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-4 rounded-xl">
                <div className="text-2xl font-extrabold text-[#d4a574] font-mono">{data.metricasEstimadas.engajamento}</div>
                <div className="text-[10px] text-[#8a8f98]">Taxa Engajamento</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-4 rounded-xl">
                <div className="text-2xl font-extrabold text-blue-400 font-mono">{data.metricasEstimadas.melhorRede}</div>
                <div className="text-[10px] text-[#8a8f98]">Melhor Rede</div>
              </div>
            </div>
          </div>

          {/* HORÁRIOS */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="text-sm font-semibold text-[#d4d6e0] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d4a574]" /> Melhores Horários para Postar
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-emerald-400 mb-2">🟢 Melhor Horário</h4>
                {data.horarios.melhor.map((h, i) => <div key={i} className="text-xs text-[#f7f8f8] font-mono py-1">{h}</div>)}
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-amber-400 mb-2">🟡 Bom Horário</h4>
                {data.horarios.bom.map((h, i) => <div key={i} className="text-xs text-[#f7f8f8] font-mono py-1">{h}</div>)}
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-red-400 mb-2">🔴 Evitar</h4>
                {data.horarios.ruim.map((h, i) => <div key={i} className="text-xs text-[#f7f8f8] font-mono py-1">{h}</div>)}
              </div>
            </div>
          </div>

          {/* LEGENDAS */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="text-sm font-semibold text-[#d4d6e0] mb-4 flex items-center gap-2">
              <Copy className="w-4 h-4 text-[#d4a574]" /> Sugestões de Legenda
            </div>
            <div className="space-y-3">
              {data.legendas.map((leg, i) => (
                <div key={i} className="bg-[#010102] border border-white/[0.08] rounded-2xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#d4a574]/10 text-[#d4a574] text-[9px] font-bold border border-[#d4a574]/20">{leg.tipo}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold">{leg.rede}</span>
                    </div>
                    <p className="text-xs text-[#d4d6e0] leading-relaxed">{leg.texto}</p>
                    <p className="text-[10px] text-[#d4a574] mt-1 font-mono">{leg.hashtags}</p>
                  </div>
                  <button onClick={() => copyToClipboard(`${leg.texto}\n\n${leg.hashtags}`, i)}
                    className="shrink-0 p-2 rounded-lg bg-white/[0.04] hover:bg-[#d4a574]/20 text-[#8a8f98] hover:text-[#d4a574] transition cursor-pointer">
                    {copiedIdx === i ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* HASHTAGS */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="text-sm font-semibold text-[#d4d6e0] mb-4 flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#d4a574]" /> Estratégia de Hashtags
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {data.estrategiaHashtags.principais.map((h, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-[#d4a574]/10 border border-[#d4a574]/20 text-[#d4a574] text-xs font-mono">{h}</span>
              ))}
            </div>
            <div className="space-y-2">
              {data.estrategiaHashtags.dicas.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#8a8f98]">
                  <span className="text-[#d4a574] mt-0.5">•</span> {d}
                </div>
              ))}
            </div>
          </div>

          {/* CALENDÁRIO */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="text-sm font-semibold text-[#d4d6e0] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#d4a574]" /> Calendário de Conteúdo (7 dias)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {data.calendario.map((dia, i) => (
                <div key={i} className="bg-[#010102] border border-white/[0.08] rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-[#d4a574] mb-1">{dia.dia}</div>
                  <div className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[9px] text-[#8a8f98] mb-2 inline-block">{dia.tipo}</div>
                  <div className="text-[9px] text-[#d4d6e0] leading-snug mb-1">{dia.sugestao.slice(0, 80)}...</div>
                  <div className="text-[9px] font-mono text-[#555]">{dia.melhorHorario}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
          <div className="text-sm font-semibold text-[#d4d6e0] mb-4">Histórico de Estratégias</div>
          <div className="space-y-2">
            {history.slice(0, 5).map((h, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#010102] border border-white/[0.08] rounded-xl px-4 py-3">
                <span className="text-xs font-bold text-[#f7f8f8]">{h.empresa}</span>
                <span className="text-[10px] text-[#8a8f98]">•</span>
                <span className="text-[10px] text-[#d4a574]">{h.nicho}</span>
                <span className="text-[10px] text-[#555] ml-auto">{h.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPulseView;