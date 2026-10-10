import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  user?: any | null;
  onNavigateTo?: (view: string) => void;
  onLogout?: () => void;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Grátis',
  STARTER: 'Starter',
  PRO: 'Pro',
  BUSINESS: 'Business',
  ENTERPRISE: 'Enterprise',
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'text-plan-free',
  STARTER: 'text-plan-starter',
  PRO: 'text-plan-pro',
  BUSINESS: 'text-plan-business',
  ENTERPRISE: 'text-plan-enterprise',
};

const UNAUTH_LINKS = [
  { label: 'Dashboards', view: 'landing' },
  { label: 'Preços', view: 'pricing' },
  { label: 'Blog', view: '#' },
];

const AUTH_LINKS = [
  { label: 'Meus Dashboards', view: 'bi' },
  { label: 'Integrações', view: 'integrations' },
  { label: 'Preços', view: 'pricing' },
];

export default function Header({ user, onNavigateTo, onLogout }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [plan, setPlan] = useState<string>('FREE');
  const [usage, setUsage] = useState({ lines: 0, dashboards: 0, marketplaces: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('plan_id, lines_consumed, dashboards_created, marketplaces_connected')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPlan(data.plan_id || 'FREE');
          setUsage({
            lines: data.lines_consumed || 0,
            dashboards: data.dashboards_created || 0,
            marketplaces: data.marketplaces_connected || 0,
          });
        }
      });
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const avatarLetter = user
    ? (user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()
    : 'U';

  const planLabel = PLAN_LABELS[plan] || 'Grátis';
  const planColor = PLAN_COLORS[plan] || 'text-plan-free';

  return (
    <header className="sticky top-0 z-50 w-full glass-card-strong border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigateTo?.('landing')}
            className="flex items-center gap-2 shrink-0"
          >
            <span className="text-xl font-display font-bold gradient-text tracking-tight">
              VarejoBI
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {(user ? AUTH_LINKS : UNAUTH_LINKS).map((link) => (
              <button
                key={link.label}
                onClick={() => link.view !== '#' && onNavigateTo?.(link.view)}
                className="px-3 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!user && (
              <button
                onClick={() => onNavigateTo?.('pricing')}
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-gradient-to-r from-vivid-purple to-electric-blue text-white text-sm font-semibold hover:scale-105 transition-transform shadow-lg shadow-vivid-purple/25"
              >
                Começar Grátis
              </button>
            )}
            {user && (
              <>
                <span className={`badge-plan ${planColor} border border-current/20`}>
                  {planLabel}
                </span>
                <div className="hidden lg:flex items-center gap-2">
                  <div className="usage-bar w-20">
                    <div
                      className={`usage-bar-fill ${usage.lines > 80 ? 'danger' : usage.lines > 50 ? 'warning' : 'normal'}`}
                      style={{ width: `${Math.min(usage.lines, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    {usage.lines}%
                  </span>
                </div>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-72 glass-card-strong rounded-xl shadow-2xl border border-glass-border overflow-hidden z-50">
                      <div className="p-3 border-b border-glass-border">
                        <p className="text-xs font-semibold text-on-surface">Notificações</p>
                      </div>
                      <div className="p-4 text-center text-xs text-on-surface-variant">
                        Nenhuma notificação no momento.
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={avatarRef}>
                  <button
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    className="w-8 h-8 rounded-full bg-vivid-purple/20 border border-vivid-purple/30 flex items-center justify-center text-xs font-bold text-vivid-purple hover:bg-vivid-purple/30 transition-colors"
                  >
                    {avatarLetter}
                  </button>
                  {avatarOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass-card-strong rounded-xl shadow-2xl border border-glass-border overflow-hidden z-50">
                      <div className="p-3 border-b border-glass-border">
                        <p className="text-xs font-semibold text-on-surface truncate">
                          {user?.user_metadata?.full_name || user?.email || 'Usuário'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <button onClick={() => { setAvatarOpen(false); onNavigateTo?.('bi'); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-sm">person</span> Perfil
                        </button>
                        <button onClick={() => { setAvatarOpen(false); onNavigateTo?.('pricing'); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-sm">credit_card</span> Faturamento
                        </button>
                        <button onClick={() => { setAvatarOpen(false); onLogout?.(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:text-danger/80 hover:bg-danger/10 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-sm">logout</span> Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Mobile Hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card-strong border-t border-glass-border">
          <div className="px-4 py-3 space-y-1">
            {(user ? AUTH_LINKS : UNAUTH_LINKS).map((link) => (
              <button
                key={link.label}
                onClick={() => { setMobileOpen(false); link.view !== '#' && onNavigateTo?.(link.view); }}
                className="w-full text-left px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            {user && (
              <div className="pt-2 mt-2 border-t border-glass-border space-y-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className={`badge-plan ${planColor} border border-current/20`}>
                    {planLabel}
                  </span>
                </div>
                <div className="px-3 py-2">
                  <div className="usage-bar w-full">
                    <div
                      className={`usage-bar-fill ${usage.lines > 80 ? 'danger' : usage.lines > 50 ? 'warning' : 'normal'}`}
                      style={{ width: `${Math.min(usage.lines, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant mt-1 block">
                    {usage.lines}% utilizado
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
