import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUsage } from '../../hooks/useUsage'

const TABS = ['Perfil', 'Plano', 'Integrações', 'Notificações'] as const
type Tab = typeof TABS[number]

const INTEGRATION_LIST = [
  { name: 'Shopify', icon: '🛒', connected: true },
  { name: 'WooCommerce', icon: '🐘', connected: false },
  { name: 'Mercado Livre', icon: '📦', connected: true },
  { name: 'Google Planilhas', icon: '📊', connected: false },
]

export default function SettingsPage() {
  const { profile, plan, refreshProfile } = useAuth()
  const { usage, limits, percentages } = useUsage()
  const [tab, setTab] = useState<Tab>('Perfil')

  const [name, setName] = useState(profile?.name || '')
  const [email] = useState(profile?.email || '')
  const [storeName, setStoreName] = useState(profile?.store_name || '')
  const [segment, setSegment] = useState(profile?.segment || '')

  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [whatsNotif, setWhatsNotif] = useState(true)

  const handleSaveProfile = async () => {
    const { supabase } = await import('../../lib/supabase')
    await supabase.from('profiles').update({ name, store_name: storeName, segment }).eq('id', profile?.id)
    await refreshProfile()
    alert('Perfil atualizado!')
  }

  const usageBars = [
    { key: 'dashboards', label: 'Dashboards' },
    { key: 'rows', label: 'Linhas' },
    { key: 'marketplaces', label: 'Marketplaces' },
    { key: 'chatbots', label: 'Chatbots' },
    { key: 'storage_mb', label: 'Armazenamento (MB)' },
  ]

  const BILLING_HISTORY = [
    { date: '15/06/2026', description: 'Plano Pro — Jun/2026', amount: 'R$ 97,00', status: 'paga' },
    { date: '15/05/2026', description: 'Plano Pro — Mai/2026', amount: 'R$ 97,00', status: 'paga' },
    { date: '15/04/2026', description: 'Plano Pro — Abr/2026', amount: 'R$ 97,00', status: 'paga' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 mt-1">Gerencie sua conta e preferências.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Perfil' && (
        <div className="glass-card p-6 space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input value={email} disabled className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-slate-500 text-sm outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Nome da Loja</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Segmento</label>
              <input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex: Moda, Alimentação" className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>
          <button onClick={handleSaveProfile} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold hover:opacity-90 transition-all">
            Salvar Alterações
          </button>
        </div>
      )}

      {tab === 'Plano' && (
        <div className="space-y-6 max-w-2xl">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{plan?.name || 'Plano Gratuito'}</h3>
                <p className="text-sm text-slate-400">R$ {plan?.price_monthly?.toFixed(2) || '0,00'}/mês</p>
              </div>
              <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold hover:opacity-90 transition-all">
                Fazer Upgrade
              </button>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h4 className="text-sm font-bold text-white">Uso do Mês</h4>
            {usageBars.map(({ key, label }) => {
              const used = usage[key] ?? 0
              const limit = limits[key] ?? 0
              const pct = percentages[key] ?? 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className={pct > 80 ? 'text-yellow-400' : 'text-slate-500'}>{used}/{limit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 95 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="glass-card p-6 space-y-4">
            <h4 className="text-sm font-bold text-white">Histórico de Cobranças</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-3 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Data</th>
                  <th className="text-left p-3 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Descrição</th>
                  <th className="text-left p-3 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Valor</th>
                  <th className="text-left p-3 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {BILLING_HISTORY.map((b, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="p-3 text-slate-400 font-mono text-xs">{b.date}</td>
                    <td className="p-3 text-white">{b.description}</td>
                    <td className="p-3 text-white font-mono">{b.amount}</td>
                    <td className="p-3"><span className="text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Integrações' && (
        <div className="max-w-2xl space-y-4">
          {INTEGRATION_LIST.map((int) => (
            <div key={int.name} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{int.icon}</span>
                <div>
                  <p className="text-white font-medium">{int.name}</p>
                  <p className={`text-xs font-mono ${int.connected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {int.connected ? 'Conectado' : 'Não conectado'}
                  </p>
                </div>
              </div>
              <button className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                int.connected
                  ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-90'
              }`}>
                {int.connected ? 'Desconectar' : 'Conectar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Notificações' && (
        <div className="max-w-lg space-y-3">
          {[
            { label: 'Notificações por Email', desc: 'Receba alertas e relatórios no seu email', value: emailNotif, set: setEmailNotif },
            { label: 'Notificações Push', desc: 'Alertas em tempo real no navegador', value: pushNotif, set: setPushNotif },
            { label: 'Notificações WhatsApp', desc: 'Relatórios diários via WhatsApp', value: whatsNotif, set: setWhatsNotif },
          ].map((n) => (
            <div key={n.label} className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">{n.label}</p>
                <p className="text-xs text-slate-500">{n.desc}</p>
              </div>
              <button
                onClick={() => n.set(!n.value)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  n.value ? 'bg-purple-500' : 'bg-white/[0.1]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                  n.value ? 'left-[26px]' : 'left-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
