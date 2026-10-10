import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useChatbots } from '../../hooks/useChatbots'

const PLATFORM_OPTIONS = ['WhatsApp', 'Telegram', 'Messenger', 'Website']
const PLATFORM_ICONS: Record<string, string> = {
  WhatsApp: '💬',
  Telegram: '✈️',
  Messenger: '💭',
  Website: '🌐',
}

export default function ChatbotsPage() {
  const { chatbots, createChatbot, updateChatbot, deleteChatbot } = useChatbots()
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('WhatsApp')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      await createChatbot({ name: name.trim(), config: { platform } })
      setName('')
      setPlatform('WhatsApp')
      setModalOpen(false)
    } catch (err: any) {
      alert(err.message)
    }
    setCreating(false)
  }

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await updateChatbot(id, { is_active: !current })
    } catch (err: any) {
      alert(err.message)
    }
  }

  const statusBadge = (active: boolean) => {
    if (active) return <span className="text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">Ativo</span>
    return <span className="text-[11px] font-mono text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-full">Pausado</span>
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meus Chatbots</h1>
          <p className="text-slate-400 mt-1">Gerencie seus assistentes virtuais.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Criar
        </button>
      </div>

      {chatbots.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-6xl text-slate-600">smart_toy</span>
          <p className="text-lg text-slate-400">Nenhum chatbot criado ainda.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold hover:opacity-90 transition-all"
          >
            Criar seu primeiro chatbot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatbots.map((bot) => (
            <div key={bot.id} className="glass-card p-5 space-y-4 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{PLATFORM_ICONS[(bot.config as any)?.platform] || '🤖'}</span>
                  <div>
                    <p className="text-white font-bold">{bot.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{(bot.config as any)?.platform || 'Não definido'}</p>
                  </div>
                </div>
                {statusBadge(bot.is_active)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(bot.id, bot.is_active)}
                  className={`flex-1 text-xs font-mono py-2 rounded-lg border transition-all ${
                    bot.is_active
                      ? 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {bot.is_active ? 'Pausar' : 'Ativar'}
                </button>
                <button
                  onClick={() => deleteChatbot(bot.id)}
                  className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-500/10 transition-all"
                >
                  Excluir
                </button>
              </div>
              <p className="text-[10px] font-mono text-slate-600">
                Criado em {new Date(bot.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="glass-card p-8 w-full max-w-md mx-4 space-y-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white">Novo Chatbot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Atendimento Vendas"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Plataforma</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p} value={p} className="bg-slate-800">{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-white/[0.1] text-sm text-slate-300 hover:bg-white/[0.04] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-sm text-white font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {creating ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
