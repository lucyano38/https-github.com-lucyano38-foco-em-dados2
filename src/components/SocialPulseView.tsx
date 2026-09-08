import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Copy, CheckCircle, Hash, Calendar, Sparkles, Send, Loader2, BarChart3, Image, Film, LayoutGrid, Download, ChevronDown, ChevronUp } from 'lucide-react';

const NICHOS = [
  'Restaurantes & Gastronomia', 'Odontologia & Estética', 'Advocacia & Direito',
  'Barbearias & Estética', 'Automotivo & Serviços', 'Comércio Local',
  'Construção Civil', 'Imobiliário', 'Educação & Cursos', 'Tecnologia & SaaS',
  'Saúde & Bem-estar', 'Academia & Fitness', 'Pet Shop / Veterinário',
];

const REDES_OPTIONS = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok'];

const UNSPLASH_QUERIES: Record<string, string> = {
  'Restaurantes & Gastronomia': 'restaurant,food,dining',
  'Odontologia & Estética': 'dental,clinic,healthcare',
  'Advocacia & Direito': 'law,office,business',
  'Barbearias & Estética': 'barbershop,style,grooming',
  'Automotivo & Serviços': 'car,automotive,mechanic',
  'Comércio Local': 'store,shopping,retail',
  'Construção Civil': 'construction,building',
  'Imobiliário': 'house,realestate,property',
  'Educação & Cursos': 'education,learning,books',
  'Tecnologia & SaaS': 'technology,laptop,coding',
  'Saúde & Bem-estar': 'health,wellness,medical',
  'Academia & Fitness': 'gym,fitness,workout',
  'Pet Shop / Veterinário': 'pet,dog,cat',
};

const FORMATO_ICONS: Record<string, any> = {
  Carrossel: LayoutGrid,
  Reels: Film,
  Banner: Image,
};

const FORMATO_COLORS: Record<string, string> = {
  Carrossel: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Reels: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Banner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

interface Post {
  hook: string;
  legendaCompleta: string;
  textoDaArte: string;
  promptImagem: string;
  hashtags: string[];
  melhorHorario: string;
  formato: string;
}

interface CalendarioDay {
  dia: string;
  formato: string;
  hook: string;
  legenda: string;
  hashtags: string[];
  melhorHorario: string;
  roteiro?: string[];
}

interface SocialData {
  empresa: string;
  nicho: string;
  redes: string[];
  posts: Post[];
  calendario: CalendarioDay[];
  horarios: { melhor: string[]; bom: string[]; ruim: string[] };
  estrategiaHashtags: { principais: string[]; dicas: string[] };
  metricasEstimadas: { alcance: number; engajamento: string; melhorRede: string; postsGerados: number };
  source: string;
}

function PublicationCard({ post, nicho, idx, copiedIdx, onCopy }: {
  post: Post; nicho: string; idx: number; copiedIdx: number | null; onCopy: (text: string, idx: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const FormatIcon = FORMATO_ICONS[post.formato] || Image;
  const formatColor = FORMATO_COLORS[post.formato] || FORMATO_COLORS.Banner;

  const unsplashQuery = UNSPLASH_QUERIES[nicho] || 'business,office';
  const imageUrl = `https://source.unsplash.com/featured/600x600/?${unsplashQuery}&sig=${idx}`;

  const fullCopy = `${post.legendaCompleta}\n\n${post.hashtags.join(' ')}`;

  return (
    <div className="bg-[#010102] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-[#d4a574]/30 transition-all">
      <div className="flex flex-col md:flex-row">
        {/* LEFT: Image Preview */}
        <div className="relative w-full md:w-64 h-48 md:h-auto bg-[#191a1b] flex-shrink-0 overflow-hidden">
          <img src={imageUrl} alt="Preview da arte" className="w-full h-full object-cover opacity-80" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {/* Text overlay on image */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <div className="text-white text-xs font-extrabold leading-tight whitespace-pre-line">
                {post.textoDaArte}
              </div>
            </div>
          </div>
          {/* Format badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border ${formatColor}`}>
              <FormatIcon className="w-3 h-3" /> {post.formato}
            </span>
          </div>
        </div>

        {/* RIGHT: Caption + Actions */}
        <div className="flex-1 p-4 md:p-5 space-y-3">
          {/* Hook */}
          <div className="text-sm font-extrabold text-[#f7f8f8] leading-tight">
            {post.hook}
          </div>

          {/* Caption (truncated or full) */}
          <div className={`text-xs text-[#d4d6e0] leading-relaxed whitespace-pre-line ${expanded ? '' : 'line-clamp-6'}`}>
            {post.legendaCompleta}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-[#d4a574] hover:text-[#e2b98a] cursor-pointer flex items-center gap-1">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Recolher' : 'Ver legenda completa'}
          </button>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1">
            {post.hashtags.map((h, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-[#d4a574]/10 text-[#d4a574] text-[9px] font-mono border border-[#d4a574]/20">
                {h}
              </span>
            ))}
          </div>

          {/* Prompt da Imagem (colapsável) */}
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
            <div className="text-[9px] text-[#8a8f98] font-semibold mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#d4a574]" /> Prompt para Gerar Imagem
            </div>
            <div className="text-[10px] text-[#d4d6e0] leading-relaxed">{post.promptImagem}</div>
          </div>

          {/* Footer: Actions + Time */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <button onClick={() => onCopy(fullCopy, idx)}
                className="px-3 py-1.5 rounded-lg bg-[#d4a574]/10 hover:bg-[#d4a574]/20 text-[#d4a574] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition">
                {copiedIdx === idx ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedIdx === idx ? 'Copiado!' : 'Copiar Legenda'}
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8a8f98] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition">
                <Download className="w-3 h-3" /> Baixar Arte
              </button>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#8a8f98]">
              <Clock className="w-3 h-3" /> {post.melhorHorario}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SocialPulseView: React.FC = () => {
  const [empresa, setEmpresa] = useState('');
  const [nicho, setNicho] = useState(NICHOS[0]);
  const [redes, setRedes] = useState<string[]>(['Instagram']);
  const [data, setData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<{ empresa: string; nicho: string; date: string }[]>([]);
  const [expandedCalDay, setExpandedCalDay] = useState<number | null>(null);

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
      console.error('Erro ao gerar:', err);
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
              <TrendingUp className="w-3.5 h-3.5" /> Pulso Social • Copywriting + Artes B2B
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Gerador de Conteúdo Profissional</h1>
            <p className="text-sm text-[#8a8f98] leading-relaxed">
              Gere legendas AIDA completas, artes com prompt de IA e calendário de 7 dias com Carrossel, Reels e Banner. Powered by Gemini.
            </p>
          </div>
          {data?.source && (
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${data.source === 'gemini' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.06] text-[#8a8f98] border border-white/[0.1]'}`}>
                {data.source === 'gemini' ? '⚡ Gemini AI' : '📋 Template'}
              </span>
            </div>
          )}
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
              className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2.5 text-xs text-[#f7f8f8] placeholder-[#555] focus:outline-none focus:border-[#d4a574]/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8a8f98] mb-1 block">Nicho</label>
            <select value={nicho} onChange={e => setNicho(e.target.value)}
              className="w-full rounded-xl bg-[#010102] border border-white/[0.08] px-3 py-2.5 text-xs text-[#f7f8f8]">
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
            {loading ? 'Gerando com IA...' : '🚀 Gerar Copywriting + Artes'}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-[#010102] border border-white/[0.08] p-4 rounded-xl">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">{data.metricasEstimadas.alcance.toLocaleString()}</div>
                <div className="text-[10px] text-[#8a8f98]">Alcance Semanal</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-4 rounded-xl">
                <div className="text-2xl font-extrabold text-[#d4a574] font-mono">{data.metricasEstimadas.engajamento}</div>
                <div className="text-[10px] text-[#8a8f98]">Engajamento</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-4 rounded-xl">
                <div className="text-2xl font-extrabold text-blue-400 font-mono">{data.metricasEstimadas.melhorRede}</div>
                <div className="text-[10px] text-[#8a8f98]">Melhor Rede</div>
              </div>
              <div className="bg-[#010102] border border-white/[0.08] p-4 rounded-xl">
                <div className="text-2xl font-extrabold text-purple-400 font-mono">{data.posts.length}</div>
                <div className="text-[10px] text-[#8a8f98]">Posts Gerados</div>
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

          {/* POSTS — RICH CARDS */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-[#d4d6e0] flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-[#d4a574]" /> Posts Gerados ({data.posts.length})
            </div>
            {data.posts.map((post, i) => (
              <PublicationCard key={i} post={post} nicho={data.nicho} idx={i} copiedIdx={copiedIdx} onCopy={copyToClipboard} />
            ))}
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

          {/* CALENDÁRIO 7 DIAS */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f1011] p-6 shadow-xl">
            <div className="text-sm font-semibold text-[#d4d6e0] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#d4a574]" /> Calendário de Conteúdo (7 dias)
            </div>
            <div className="space-y-3">
              {data.calendario.map((dia, i) => {
                const FormatIcon = FORMATO_ICONS[dia.formato] || Image;
                const formatColor = FORMATO_COLORS[dia.formato] || FORMATO_COLORS.Banner;
                const isExpanded = expandedCalDay === i;

                return (
                  <div key={i} className="bg-[#010102] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.15] transition-all">
                    <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedCalDay(isExpanded ? null : i)}>
                      <div className="w-12 text-center">
                        <div className="text-[10px] font-bold text-[#d4a574]">{dia.dia}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border ${formatColor}`}>
                        <FormatIcon className="w-3 h-3" /> {dia.formato}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#f7f8f8] truncate">{dia.hook}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#555]">{dia.melhorHorario}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[#8a8f98]" /> : <ChevronDown className="w-4 h-4 text-[#8a8f98]" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
                        {/* Legend */}
                        <div className="text-xs text-[#d4d6e0] leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">{dia.legenda}</div>

                        {/* Roteiro */}
                        {dia.roteiro && (
                          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                            <div className="text-[9px] text-[#d4a574] font-bold mb-2">📋 ROTEIRO DO {dia.formato.toUpperCase()}</div>
                            <div className="space-y-1">
                              {dia.roteiro.map((passo, j) => (
                                <div key={j} className="text-[10px] text-[#d4d6e0] flex items-start gap-2">
                                  <span className="text-[#d4a574] font-mono">{j + 1}.</span> {passo}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hashtags */}
                        <div className="flex flex-wrap gap-1">
                          {dia.hashtags.map((h, j) => (
                            <span key={j} className="px-2 py-0.5 rounded-full bg-[#d4a574]/10 text-[#d4a574] text-[9px] font-mono">{h}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
