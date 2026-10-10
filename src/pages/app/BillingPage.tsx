import { useAuth } from '../../contexts/AuthContext'
import { useSubscription, usePayments } from '../../hooks/useSupabase'

const STATUS_BADGE: Record<string, string> = {
  succeeded: 'bg-emerald-400/10 text-emerald-400',
  pending: 'bg-yellow-400/10 text-yellow-400',
  failed: 'bg-red-400/10 text-red-400',
  refunded: 'bg-slate-400/10 text-slate-400',
}

const STATUS_LABEL: Record<string, string> = {
  succeeded: 'Paga',
  pending: 'Pendente',
  failed: 'Falhou',
  refunded: 'Reembolsada',
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function BillingPage() {
  const { plan, profile } = useAuth()
  const { data: subscription, isLoading: subLoading } = useSubscription()
  const { data: payments, isLoading: payLoading } = usePayments()

  const loading = subLoading || payLoading

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Faturamento</h1>
        <p className="text-slate-400 mt-1">Gerencie sua assinatura e histórico de pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-[3px] border-vivid-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">Plano Atual</p>
                  <h2 className="text-2xl font-bold text-white">{plan?.name || 'Gratuito'}</h2>
                  <p className="text-lg font-mono text-purple-400">
                    {plan?.price_monthly ? formatBRL(plan.price_monthly) + '/mês' : 'Grátis'}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/[0.06]">
                  <span className="material-symbols-outlined text-3xl text-purple-400">workspace_premium</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">Status</p>
                  <p className="text-white font-bold mt-1 capitalize">
                    {subscription?.status === 'active' ? 'Ativa' : subscription?.status || 'Inativa'}
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">Próxima Cobrança</p>
                  <p className="text-white font-bold mt-1">
                    {subscription?.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR')
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all">
                  <span className="material-symbols-outlined text-base align-text-bottom mr-1.5">credit_card</span>
                  Atualizar Cartão
                </button>
                <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-base align-text-bottom mr-1.5">redeem</span>
                  Ver Planos
                </button>
                <button className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all">
                  <span className="material-symbols-outlined text-base align-text-bottom mr-1.5">description</span>
                  Solicitar NF
                </button>
              </div>
            </>
          )}
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Resumo</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-[3px] border-vivid-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Assinatura</span>
                <span className="text-white font-mono">
                  {plan?.price_monthly ? formatBRL(plan.price_monthly) : 'Grátis'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Descontos</span>
                <span className="text-emerald-400 font-mono">- R$ 0,00</span>
              </div>
              <div className="border-t border-white/[0.06] pt-3 flex justify-between text-sm font-bold">
                <span className="text-white">Total</span>
                <span className="text-purple-400 font-mono">
                  {plan?.price_monthly ? formatBRL(plan.price_monthly) : 'Grátis'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Histórico de Faturas</h2>
        <div className="glass-card overflow-hidden">
          {payLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-[3px] border-vivid-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments && payments.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Data</th>
                  <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Descrição</th>
                  <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Valor</th>
                  <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Gateway</th>
                  <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay) => (
                  <tr key={pay.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-4 text-slate-400 font-mono text-xs">
                      {new Date(pay.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-white">
                      {plan?.name || 'Assinatura'} — {new Date(pay.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-white font-mono">{formatBRL(pay.amount)}</td>
                    <td className="p-4 text-slate-400 uppercase text-xs font-mono">{pay.gateway}</td>
                    <td className="p-4">
                      <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full ${STATUS_BADGE[pay.status] || ''}`}>
                        {STATUS_LABEL[pay.status] || pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Nenhum pagamento encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
