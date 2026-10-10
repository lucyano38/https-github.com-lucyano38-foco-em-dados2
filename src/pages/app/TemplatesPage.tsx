import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTemplates } from '../../hooks/useTemplates'

const CATEGORIES = ['Todos', 'Vendas', 'Estoque', 'Marketing']
const GRADIENT_PLACEHOLDERS = [
  'from-purple-600/30 to-cyan-600/30',
  'from-emerald-600/30 to-teal-600/30',
  'from-orange-600/30 to-red-600/30',
  'from-blue-600/30 to-indigo-600/30',
  'from-pink-600/30 to-rose-600/30',
]

export default function TemplatesPage() {
  const { templates, installTemplate } = useTemplates()
  const [category, setCategory] = useState('Todos')
  const [installing, setInstalling] = useState<string | null>(null)

  const filtered = category === 'Todos'
    ? templates
    : templates.filter((t) => t.category === category)

  const handleInstall = async (id: string) => {
    setInstalling(id)
    try {
      await installTemplate(id)
      alert('Dashboard criado com sucesso!')
    } catch (err: any) {
      alert(err.message)
    }
    setInstalling(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Templates de Dashboard</h1>
        <p className="text-slate-400 mt-1">Escolha um template pronto para começar.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-mono transition-all ${
              category === cat
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-6xl text-slate-600">dashboard</span>
          <p className="text-lg text-slate-400">Nenhum template disponível.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, idx) => (
            <div key={t.id} className="glass-card overflow-hidden hover:border-white/20 transition-all group">
              <div className={`h-32 bg-gradient-to-br ${GRADIENT_PLACEHOLDERS[idx % GRADIENT_PLACEHOLDERS.length]} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-5xl text-white/30 group-hover:scale-110 transition-transform">
                  dashboard
                </span>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-white font-bold">{t.name}</h3>
                {t.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                )}
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm">{i < 4 ? 'star' : 'star_border'}</span>
                  ))}
                  <span className="text-xs text-slate-500 ml-2">2.4k downloads</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-sm font-bold ${(t as any).is_free ? 'text-emerald-400' : 'text-white'}`}>
                    {(t as any).is_free ? 'Grátis' : `R$ ${(t as any).price?.toFixed(2) ?? '0,00'}`}
                  </span>
                  <button
                    onClick={() => handleInstall(t.id)}
                    disabled={installing === t.id}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {installing === t.id ? 'Instalando...' : 'Instalar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
