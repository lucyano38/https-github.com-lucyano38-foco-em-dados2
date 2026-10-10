import { useAuth } from '../../contexts/AuthContext'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const MOCK_CHART_DATA = [
  { dia: '01', vendas: 1200 }, { dia: '02', vendas: 1800 }, { dia: '03', vendas: 1400 },
  { dia: '04', vendas: 2200 }, { dia: '05', vendas: 1900 }, { dia: '06', vendas: 2600 },
  { dia: '07', vendas: 2100 }, { dia: '08', vendas: 2800 }, { dia: '09', vendas: 2400 },
  { dia: '10', vendas: 3100 }, { dia: '11', vendas: 2700 }, { dia: '12', vendas: 3500 },
  { dia: '13', vendas: 2900 }, { dia: '14', vendas: 3300 }, { dia: '15', vendas: 3700 },
  { dia: '16', vendas: 3400 }, { dia: '17', vendas: 3900 }, { dia: '18', vendas: 3600 },
  { dia: '19', vendas: 4200 }, { dia: '20', vendas: 3800 }, { dia: '21', vendas: 4100 },
  { dia: '22', vendas: 4500 }, { dia: '23', vendas: 4300 }, { dia: '24', vendas: 4800 },
  { dia: '25', vendas: 4600 }, { dia: '26', vendas: 5100 }, { dia: '27', vendas: 4900 },
  { dia: '28', vendas: 5300 }, { dia: '29', vendas: 5000 }, { dia: '30', vendas: 5600 },
]

const ALERTS = [
  { id: 1, type: 'warning', title: 'Estoque baixo', desc: '5 produtos abaixo do mínimo', time: '2h atrás' },
  { id: 2, type: 'info', title: 'Meta batida', desc: 'Vendas do mês superaram R$ 50k', time: '5h atrás' },
  { id: 3, type: 'error', title: 'Integração falhou', desc: 'Shopify — última sincronia com erro', time: '1d atrás' },
  { id: 4, type: 'success', title: 'Upload concluído', desc: 'planilha_estoque.xlsx processada', time: '1d atrás' },
]

interface MetricCardProps {
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'warning'
  icon: string
}

function MetricCard({ label, value, change, changeType, icon }: MetricCardProps) {
  const colors = { positive: 'text-emerald-400', negative: 'text-red-400', warning: 'text-yellow-400' }
  const arrows = { positive: 'trending_up', negative: 'trending_down', warning: 'error_outline' }
  return (
    <div className="glass-card p-5 relative group hover:border-white/20 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block truncate">{label}</span>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent truncate">{value}</div>
          <div className={`flex items-center gap-1 text-xs font-mono font-bold ${colors[changeType]}`}>
            <span className="material-symbols-outlined text-base leading-none">{arrows[changeType]}</span>
            <span>{change}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Bem-vindo de volta, {profile?.name || 'Usuário'}! 👋</h1>
        <p className="text-slate-400 mt-1">Aqui está o resumo do seu negócio hoje.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Receita" value="R$ 45.230" change="+12% positive" changeType="positive" icon="payments" />
        <MetricCard label="Vendas" value="1.247" change="+8% positive" changeType="positive" icon="shopping_cart" />
        <MetricCard label="Estoque" value="89 SKU" change="⚠️ 5 baixo warning" changeType="warning" icon="inventory_2" />
        <MetricCard label="Clientes" value="3.421" change="+23% positive" changeType="positive" icon="people" />
        <MetricCard label="CAC" value="R$ 32,50" change="-5% negative" changeType="negative" icon="trending_up" />
        <MetricCard label="Conversão" value="3,2%" change="+0,4% positive" changeType="positive" icon="percent" />
        <MetricCard label="Ticket Médio" value="R$ 36,30" change="+2% positive" changeType="positive" icon="receipt_long" />
        <MetricCard label="Retenção" value="68%" change="+5% positive" changeType="positive" icon="favorite" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Vendas nos Últimos 30 Dias</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dia" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(30,41,59,0.9)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="vendas" stroke="#A855F7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Alertas Recentes</h2>
          <div className="space-y-3">
            {ALERTS.map((alert) => (
              <div key={alert.id} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className={`material-symbols-outlined text-xl mt-0.5 ${
                  alert.type === 'warning' ? 'text-yellow-400' :
                  alert.type === 'error' ? 'text-red-400' :
                  alert.type === 'success' ? 'text-emerald-400' : 'text-cyan-400'
                }`}>
                  {alert.type === 'warning' ? 'warning' : alert.type === 'error' ? 'error' : alert.type === 'success' ? 'check_circle' : 'info'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{alert.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.desc}</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all">
            <span>📤</span> Upload
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all">
            <span>🤖</span> Novo Chatbot
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all">
            <span>📋</span> Templates
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all">
            <span>⚙️</span> Alertas
          </button>
        </div>
      </div>
    </div>
  )
}
