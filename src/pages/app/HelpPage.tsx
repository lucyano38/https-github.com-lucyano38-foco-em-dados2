const CATEGORIES = [
  { title: 'Primeiros Passos', icon: 'start', desc: 'Comece a usar a plataforma em minutos', color: 'from-purple-600/20 to-purple-600/5' },
  { title: 'Dashboards', icon: 'dashboard', desc: 'Crie e personalize seus painéis', color: 'from-cyan-600/20 to-cyan-600/5' },
  { title: 'Chatbots', icon: 'smart_toy', desc: 'Configure assistentes virtuais', color: 'from-emerald-600/20 to-emerald-600/5' },
  { title: 'Integrações', icon: 'sync_alt', desc: 'Conecte suas ferramentas favoritas', color: 'from-orange-600/20 to-orange-600/5' },
  { title: 'Planos', icon: 'workspace_premium', desc: 'Compare e escolha o melhor plano', color: 'from-pink-600/20 to-pink-600/5' },
  { title: 'LGPD', icon: 'security', desc: 'Privacidade e proteção de dados', color: 'from-blue-600/20 to-blue-600/5' },
]

const POPULAR_ARTICLES = [
  'Como fazer upload de uma planilha',
  'Criando seu primeiro dashboard',
  'Conectando ao Shopify',
  'Configurando um chatbot no WhatsApp',
  'Dicas para melhorar suas vendas',
]

const COURSES = [
  { title: 'Fundamentos de BI', lessons: '8 aulas', duration: '2h30min', level: 'Iniciante' },
  { title: 'Dashboards Avançados', lessons: '12 aulas', duration: '4h', level: 'Intermediário' },
  { title: 'Automação com Chatbots', lessons: '6 aulas', duration: '1h45min', level: 'Avançado' },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Central de Ajuda</h1>
        <p className="text-slate-400 mt-1">Tire suas dúvidas e aprenda a usar a plataforma.</p>
      </div>

      <div className="relative max-w-2xl">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
        <input
          placeholder="Pesquisar na documentação..."
          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-12 pr-4 py-4 text-white text-sm outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <button key={cat.title} className={`glass-card p-6 space-y-3 text-left hover:border-white/20 transition-all bg-gradient-to-br ${cat.color}`}>
            <span className="material-symbols-outlined text-3xl text-white/70">{cat.icon}</span>
            <h3 className="text-white font-bold">{cat.title}</h3>
            <p className="text-xs text-slate-400">{cat.desc}</p>
          </button>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Artigos Populares</h2>
        <div className="space-y-2">
          {POPULAR_ARTICLES.map((article) => (
            <button key={article} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all text-left">
              <span className="material-symbols-outlined text-lg text-slate-500">article</span>
              <span className="text-sm text-slate-300">{article}</span>
              <span className="material-symbols-outlined text-base text-slate-600 ml-auto">chevron_right</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-8 flex flex-col items-center gap-4 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-500">help</span>
        <h2 className="text-xl font-bold text-white">Não encontrou?</h2>
        <p className="text-sm text-slate-400">Nossa equipe está pronta para ajudar.</p>
        <div className="flex flex-wrap gap-3 mt-2">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all">
            <span>🤖</span> Perguntar ao Assistente Virtual
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all">
            <span>📝</span> Enviar pergunta por email
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Data Academy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSES.map((course) => (
            <div key={course.title} className="glass-card p-6 space-y-3 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-purple-400">school</span>
              </div>
              <h3 className="text-white font-bold">{course.title}</h3>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  <span>{course.lessons}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{course.duration}</span>
                </div>
              </div>
              <span className="inline-block text-[10px] font-mono px-2 py-1 rounded-full bg-purple-500/10 text-purple-300">
                {course.level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
