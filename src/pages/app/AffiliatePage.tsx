import { useState } from 'react'
import { useAffiliate } from '../../hooks/useAffiliate'

const BANNERS = [
  { size: '728x90', label: 'Leaderboard' },
  { size: '300x250', label: 'Medium Rectangle' },
  { size: '320x100', label: 'Mobile Banner' },
]

const PRESET_TEXTS = [
  'Transforme dados em decisões com inteligência artificial!',
  'BI Analytics com IA — a ferramenta que seu negócio precisa.',
  'Automatize seu atendimento com chatbots inteligentes.',
]

function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  if (!domain) return email
  return name[0] + '*****@' + domain
}

export default function AffiliatePage() {
  const { affiliate, referrals, copyLink, requestPayout } = useAffiliate()
  const [payoutModal, setPayoutModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    copyLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePayout = async () => {
    const amount = parseFloat(payoutAmount)
    if (!amount || amount <= 0 || !pixKey.trim()) return
    setRequesting(true)
    try {
      await requestPayout(amount, pixKey.trim())
      setPayoutModal(false)
      setPayoutAmount('')
      setPixKey('')
      alert('Solicitação enviada!')
    } catch (err: any) {
      alert(err.message)
    }
    setRequesting(false)
  }

  const referralLink = affiliate
    ? `${window.location.origin}/?ref=${affiliate.code}`
    : `${window.location.origin}/?ref=carregando...`

  const stats = [
    { label: 'Cliques', value: '342', icon: 'ads_click' },
    { label: 'Cadastros', value: '28', icon: 'person_add' },
    { label: 'Conversões', value: '12', icon: 'conversion_path' },
    { label: 'Comissão', value: affiliate ? `R$ ${affiliate.total_earned.toFixed(2)}` : 'R$ 0,00', icon: 'payments' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Área do Afiliado</h1>
        <p className="text-slate-400 mt-1">Divulgue e ganhe comissões.</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">Seu Link de Indicação</p>
          <span className="text-xs text-slate-500 font-mono">{affiliate?.code || '---'}</span>
        </div>
        <div className="flex gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm font-mono outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold hover:opacity-90 transition-all whitespace-nowrap"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 space-y-2">
            <span className="material-symbols-outlined text-2xl text-slate-500">{s.icon}</span>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Indicações</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-3 text-slate-500 font-mono text-[11px] uppercase">Data</th>
                <th className="text-left p-3 text-slate-500 font-mono text-[11px] uppercase">Email</th>
                <th className="text-left p-3 text-slate-500 font-mono text-[11px] uppercase">Comissão</th>
                <th className="text-left p-3 text-slate-500 font-mono text-[11px] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Nenhuma indicação ainda.</td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-3 text-slate-400 font-mono text-xs">{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3 text-white">{maskEmail(r.referred_email)}</td>
                    <td className="p-3 text-white font-mono">R$ {(r.commission || 0).toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        r.status === 'converted' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-yellow-400/10 text-yellow-400'
                      }`}>
                        {r.status === 'converted' ? 'Convertido' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">Saldo Disponível</p>
            <p className="text-3xl font-bold text-white">
              R$ {affiliate?.balance?.toFixed(2) || '0,00'}
            </p>
          </div>
          <button
            onClick={() => setPayoutModal(true)}
            disabled={!affiliate || affiliate.balance <= 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Solicitar Saque
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Materiais de Divulgação</h2>
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Banners</p>
            <div className="flex flex-wrap gap-2">
              {BANNERS.map((b) => (
                <button key={b.size} className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:bg-white/[0.08] transition-all">
                  {b.size} — {b.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Textos Prontos</p>
            <div className="space-y-2">
              {PRESET_TEXTS.map((t, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-3">
                  <p className="flex-1 text-xs text-slate-300">{t}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(t)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 shrink-0"
                  >
                    Copiar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Comissões</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Sua taxa</span>
              <span className="text-white font-bold">{affiliate ? '30%' : '---'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total recebido</span>
              <span className="text-emerald-400 font-bold">R$ {affiliate?.total_earned?.toFixed(2) || '0,00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <span className="font-bold text-emerald-400">Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {payoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPayoutModal(false)}>
          <div className="glass-card p-8 w-full max-w-md mx-4 space-y-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white">Solicitar Saque</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Valor (R$)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0,00"
                  max={affiliate?.balance || 0}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Chave Pix</label>
                <input
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, CNPJ, email ou telefone"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPayoutModal(false)} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-slate-300 hover:bg-white/[0.04] transition-all">
                Cancelar
              </button>
              <button
                onClick={handlePayout}
                disabled={requesting || !payoutAmount || !pixKey.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-sm text-white font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {requesting ? 'Enviando...' : 'Solicitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
