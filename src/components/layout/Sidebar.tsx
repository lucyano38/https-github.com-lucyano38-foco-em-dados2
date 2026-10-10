import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/app' },
  { icon: 'upload_file', label: 'Upload', path: '/app/upload' },
  { icon: 'smart_toy', label: 'Chatbots', path: '/app/chatbots' },
  { icon: 'grid_view', label: 'Templates', path: '/app/templates' },
  { icon: 'settings', label: 'Configurações', path: '/app/configuracoes' },
  { icon: 'credit_card', label: 'Faturamento', path: '/app/faturamento' },
  { icon: 'handshake', label: 'Afiliado', path: '/app/afiliado' },
  { icon: 'help', label: 'Ajuda', path: '/app/ajuda' },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  const displayName = profile?.name || profile?.email || 'U'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-background/95 backdrop-blur-xl border-r border-glass-border flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'w-60' : 'w-16'
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-glass-border shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="material-symbols-outlined text-2xl text-vivid-purple shrink-0">
              analytics
            </span>
            <span
              className={`text-lg font-bold bg-gradient-to-r from-vivid-purple to-purple-300 bg-clip-text text-transparent whitespace-nowrap transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0 w-0'
              }`}
            >
              VarejoBI
            </span>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar px-2">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  if (window.innerWidth < 1024) onToggle()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-vivid-purple/10 border-l-2 border-vivid-purple text-vivid-purple'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-l-2 border-transparent'
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <span className="material-symbols-outlined text-xl shrink-0">
                  {item.icon}
                </span>
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-glass-border shrink-0">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-vivid-purple/20 border border-vivid-purple/30 flex items-center justify-center text-xs font-bold text-vivid-purple shrink-0">
              {avatarLetter}
            </div>
            <div
              className={`flex-1 min-w-0 transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
              }`}
            >
              <p className="text-sm font-medium text-on-surface truncate">
                {profile?.name || profile?.email || 'Usuário'}
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              title="Sair"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
