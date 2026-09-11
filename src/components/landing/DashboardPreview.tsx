import React, { useState } from 'react';
import { TrendingUp, CreditCard, Bell, Settings, Activity, Layers, BarChart3, Globe2, RefreshCw, Users, ArrowUpRight } from 'lucide-react';

export const DashboardPreview: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <section id="dashboard-global" className="px-4 md:px-12 -mt-16 relative z-30 mb-20">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-[2rem] p-4 md:p-8 shadow-2xl relative overflow-hidden group" style={{ borderColor: 'rgba(212,165,116,0.25)' }}>
          {/* Top Gradient Edge */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4a574] to-transparent opacity-60" />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar UI navigation — purely visual */}
            <div className="w-full lg:w-60 space-y-5 hidden md:block shrink-0">
              <div className="h-11 rounded-xl flex items-center px-4 gap-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-[#d4a574] animate-pulse" />
                <div className="text-xs uppercase tracking-wider text-[#d4a574] font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                  Foco em Dados • Pro
                </div>
              </div>

              <div className="space-y-2 pointer-events-none select-none">
                {[
                  { icon: Layers, label: 'Visão Integrada', active: true },
                  { icon: Globe2, label: 'Radar B2B', active: false },
                  { icon: Activity, label: 'Agente Hermes 24/7', active: false },
                  { icon: BarChart3, label: 'Pipeline de Leads', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left cursor-default transition-all duration-300"
                    style={{
                      background: item.active ? 'rgba(212,165,116,0.15)' : 'rgba(255,255,255,0.05)',
                      color: item.active ? '#d4a574' : '#8a8f98',
                      border: `1px solid ${item.active ? 'rgba(212,165,116,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      boxShadow: item.active ? '0 0 12px rgba(212,165,116,0.15)' : 'none',
                    }}
                  >
                    <item.icon className="w-4 h-4 text-[#d4a574]" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Status Indicator */}
              <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="p-3 rounded-xl space-y-1" style={{ background: 'rgba(1,1,2,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: '#8a8f98' }}>Latência IA</span>
                    <span className="text-[11px] font-bold text-emerald-400">18ms</span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="bg-emerald-400 h-full w-[94%] animate-pulse" />
                  </div>
                  <div className="text-[10px] pt-1" style={{ color: '#62666d' }}>Operando no cluster SP-1</div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Canvas */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Dashboard Global
                  </h2>
                  <p className="text-xs" style={{ color: '#8a8f98' }}>
                    Monitoramento unificado de campanhas e prospecções em tempo real
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-default"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8f98' }}
                    title="Atualizar dados"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </div>

                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-default"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8f98' }}
                    title="Configurações"
                  >
                    <Settings className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Metrics Grid — animated counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {[
                  { label: 'Total de Leads', value: '12.845', trend: '+14.2% este mês', icon: Users, trendColor: '#10b981' },
                  { label: 'Propostas Ativas', value: '342', trend: 'Conversão média 12%', icon: BarChart3, trendColor: '#8a8f98' },
                  { label: 'Receita de Setups', value: 'R$ 84k', trend: 'Meta atingida', icon: CreditCard, trendColor: '#10b981' },
                  { label: 'MRR Recorrente', value: 'R$ 256k', trend: 'Recorrência garantida', icon: TrendingUp, trendColor: '#d4a574', highlight: true },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="p-5 rounded-2xl glow-hover transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(15,16,17,0.7)',
                      border: `1px solid ${metric.highlight ? 'rgba(212,165,116,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: metric.highlight ? '0 0 20px rgba(212,165,116,0.1)' : 'none',
                    }}
                  >
                    <span className="text-[11px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: metric.highlight ? '#d4a574' : '#8a8f98' }}>
                      {metric.label}
                    </span>
                    <div className="text-3xl font-bold mt-2" style={{ color: '#d4a574' }}>{metric.value}</div>
                    <div className="text-xs mt-1.5 flex items-center gap-1 font-medium" style={{ color: metric.trendColor }}>
                      <metric.icon className="w-3.5 h-3.5" />
                      <span>{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Illustration — decorative with hover zoom */}
              <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden group/banner" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  className="w-full h-full bg-cover bg-center group-hover/banner:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85')`,
                  }}
                  role="img"
                  aria-label="Painel de visualização e telemetria analítica"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#010102]/90 via-[#010102]/30 to-transparent flex items-end p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse" style={{ background: 'rgba(212,165,116,0.2)', border: '1px solid rgba(212,165,116,0.5)', boxShadow: '0 0 15px rgba(212,165,116,0.3)' }}>
                        <Activity className="w-6 h-6 text-[#d4a574]" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-base md:text-lg">
                          Análise de IA em tempo real
                        </p>
                        <p className="text-xs md:text-sm" style={{ color: '#8a8f98' }}>
                          Sincronizado com 15 fontes de dados
                        </p>
                      </div>
                    </div>

                    <div
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-default hover:scale-105 transition-all"
                      style={{ background: '#d4a574', color: '#1c1917', boxShadow: '0 0 15px rgba(212,165,116,0.3)' }}
                    >
                      <span>Acessar Dashboard</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
