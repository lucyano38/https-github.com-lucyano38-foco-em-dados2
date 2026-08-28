import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  TrendingUp,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers
} from 'lucide-react';

// ... (helper function)
const getTrendIndicator = (history: Array<{ value: number }>) => {
  if (history.length < 2) return { icon: null, color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' };
  const last = history[history.length - 1].value;
  const prev = history[history.length - 2].value;
  if (last > prev) return { icon: <ArrowUpRight className="w-3 h-3" />, color: 'text-green-400 bg-green-500/10 border-green-500/30' };
  if (last < prev) return { icon: <ArrowDownRight className="w-3 h-3" />, color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  return { icon: null, color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' };
};

interface IndicatorItem {
  title: string;
  current: string;
  unit: string;
  trend: string;
  history: Array<{ date: string; value: number }>;
}

export const AutomatedIndicatorsView: React.FC = () => {
  const [data, setData] = useState<{ source?: string; lastUpdate?: string; indicators?: IndicatorItem[] } | null>(null);
  const [statusInfo, setStatusInfo] = useState<{ lastUpdate?: string; frequency?: string; source?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIndicators = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [resInd, resStatus] = await Promise.all([
        fetch('/api/indicators'),
        fetch('/api/indicators/status')
      ]);
      if (resInd.ok) {
        const indJson = await resInd.json();
        setData(indJson);
      }
      if (resStatus.ok) {
        const statusJson = await resStatus.json();
        setStatusInfo(statusJson);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar indicadores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 p-4 md:p-8 font-['Inter'] bg-[#0F172A] text-[#F8FAFC]">
      {/* Header with Status Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1E293B] border border-[#334155] p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#F59E0B]" /> Painel de Indicadores Automatizado (RPA / API)
            </span>
            {statusInfo?.lastUpdate && (
              <span className="bg-green-500/10 border border-green-500/30 text-green-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Dados atualizados {statusInfo.lastUpdate}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F8FAFC]">
            Indicadores Macroeconômicos em Tempo Real
          </h1>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-1 max-w-2xl">
            Sincronização automática a cada 6 horas com APIs públicas oficiais (BCB / IBGE / IPCA / Selic), armazenada com segurança e renderizada via gráficos interativos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchIndicators(true)}
            disabled={refreshing}
            className="px-5 py-3 rounded-xl bg-[#F59E0B] text-[#0F172A] font-bold text-xs hover:bg-[#d9822b] transition shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Sincronizar Agora
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Erro na sincronização: {error}. Utilizando último cache disponível.</span>
        </div>
      )}

      {/* Grid of Indicator Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-[#1E293B] animate-pulse border border-[#334155]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data?.indicators?.map((ind, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#1E293B] border border-[#334155] p-6 rounded-3xl shadow-xl flex flex-col justify-between hover:border-[#F59E0B]/50 transition"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    {ind.title}
                  </span>
                  {(() => {
                    const { icon, color } = getTrendIndicator(ind.history);
                    return (
                      <span className={`text-[10px] border px-2.5 py-1 rounded-full font-mono flex items-center gap-1 ${color}`}>
                        {icon} {ind.trend}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#F8FAFC]">
                    {ind.current}
                  </span>
                  <span className="text-xs text-[#94A3B8] font-mono">{ind.unit}</span>
                </div>

                {/* Chart */}
                <div className="h-36 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ind.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#F8FAFC' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4 border-t border-[#334155] flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Fonte: {data?.source || 'BCB API'}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-[#F59E0B]" /> A cada 6 horas
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Architecture & Scheduler Info Box */}
      <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-bold">
            <Database className="w-4 h-4 text-[#F59E0B]" /> Armazenamento & Fallback
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            Dados inseridos e cacheados localmente com fallback automático para Supabase/Firebase em caso de oscilação na API externa.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-bold">
            <Clock className="w-4 h-4 text-[#F59E0B]" /> Scheduler & Cron Job
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            Automação configurada via cron (a cada 6 horas) executando requisições assíncronas sem custos de infraestrutura serverless.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-bold">
            <ShieldAlert className="w-4 h-4 text-[#F59E0B]" /> Alerta Administrativo
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            Tratamento avançado de erros com retenção do último dado válido e notificação automática em log.
          </p>
        </div>
      </div>
    </div>
  );
};
