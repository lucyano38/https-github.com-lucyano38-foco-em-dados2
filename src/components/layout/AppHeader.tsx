import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useUsage } from '../../hooks/useUsage'

interface AppHeaderProps {
  title: string
  onToggleSidebar: () => void
}

const planColors: Record<string, string> = {
  starter: 'bg-blue-500',
  pro: 'bg-vivid-purple',
  business: 'bg-orange-500',
  enterprise: 'bg-red-500',
  free: 'bg-gray-500',
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export default function AppHeader({ title, onToggleSidebar }: AppHeaderProps) {
  const navigate = useNavigate()
  const { profile, plan, signOut } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { percentages } = useUsage()

  const [notifOpen, setNotifOpen] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const planRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (planRef.current && !planRef.current.contains(e.target as Node)) setPlanOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayName = profile?.name || profile?.email || 'U'
  const avatarLetter = displayName.charAt(0).toUpperCase()
  const planTier = plan?.tier || 'free'
  const planDotColor = planColors[planTier] || 'bg-gray-500'

  const usagePercentages = Object.entries(percentages)
  const over80 = usagePercentages.some(([, pct]) => pct > 80)

  const notifTypeIcon: Record<string, string> = {
    campaign: 'upsell',
    warning: 'alert',
    check_circle: 'success',
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-glass-border flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <h1 className="text-lg font-semibold text-on-surface truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl glass-card-strong border border-glass-border shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease]">
              <div className="p-3 border-b border-glass-border flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">Notificações</span>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-vivid-purple hover:text-vivid-purple/80 transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-2xl mb-2 block">notifications_off</span>
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.map((n) => {
                    const icon = notifTypeIcon[n.title] || 'notifications'
                    return (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className="w-full flex items-start gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-lg text-vivid-purple mt-0.5 shrink-0">
                          {icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{n.title}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                        <span className="text-[10px] text-on-surface-variant shrink-0 mt-1">
                          {timeAgo(n.created_at)}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Plan Badge */}
        <div ref={planRef} className="relative">
          <button
            onClick={() => setPlanOpen(!planOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-glass-border hover:bg-white/10 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${planDotColor}`} />
            <span className="text-xs font-medium text-on-surface capitalize">{plan?.name || 'Free'}</span>
          </button>

          {planOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl glass-card-strong border border-glass-border shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease]">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">Uso do plano</span>
                  <span className={`w-2 h-2 rounded-full ${planDotColor}`} />
                </div>

                {usagePercentages.length === 0 ? (
                  <p className="text-xs text-on-surface-variant">Nenhum dado de uso disponível</p>
                ) : (
                  usagePercentages.map(([key, pct]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-on-surface-variant capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-on-surface font-medium">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct > 80
                              ? 'bg-red-500'
                              : pct > 50
                              ? 'bg-orange-500'
                              : 'bg-vivid-purple'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}

                {over80 && (
                  <button
                    onClick={() => {
                      setPlanOpen(false)
                      navigate('/app/faturamento')
                    }}
                    className="w-full mt-2 py-2 rounded-xl bg-vivid-purple/20 border border-vivid-purple/30 text-vivid-purple text-xs font-medium hover:bg-vivid-purple/30 transition-colors"
                  >
                    Fazer upgrade
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="w-8 h-8 rounded-full bg-vivid-purple/20 border border-vivid-purple/30 flex items-center justify-center text-xs font-bold text-vivid-purple hover:bg-vivid-purple/30 transition-colors"
          >
            {avatarLetter}
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl glass-card-strong border border-glass-border shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease]">
              <div className="p-3 border-b border-glass-border">
                <p className="text-sm font-medium text-on-surface truncate">{profile?.name || 'Usuário'}</p>
                <p className="text-xs text-on-surface-variant truncate">{profile?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setAvatarOpen(false); navigate('/app/configuracoes') }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  Perfil
                </button>
                <button
                  onClick={() => { setAvatarOpen(false); navigate('/app/faturamento') }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">credit_card</span>
                  Faturamento
                </button>
                <button
                  onClick={() => { setAvatarOpen(false); navigate('/app/afiliado') }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">handshake</span>
                  Afiliado
                </button>
                <hr className="border-glass-border my-1" />
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
