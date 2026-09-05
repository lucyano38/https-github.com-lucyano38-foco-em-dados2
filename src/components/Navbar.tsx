import React, { useState, useEffect } from 'react';
import { MASTER_EMAILS } from '../lib/constants';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPaywall: () => void;
  onEnterApp?: (mode: string) => void;
  isPro: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPaywall,
  onEnterApp,
  isPro,
}) => {
  const [isMasterUser, setIsMasterUser] = useState(false);

  useEffect(() => {
    try {
      const email = localStorage.getItem('foco_em_dados_user_email') || '';
      const usuario = localStorage.getItem('foco_usuario');
      let parsedEmail = email;
      if (!parsedEmail && usuario) {
        const parsed = JSON.parse(usuario);
        parsedEmail = parsed.email || '';
      }
      setIsMasterUser(MASTER_EMAILS.map(e => e.toLowerCase()).includes(parsedEmail.toLowerCase()));
    } catch {
      setIsMasterUser(false);
    }
  }, []);

  const hasAccess = isPro || isMasterUser;

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (hasAccess) {
      if (onEnterApp) {
        onEnterApp('growth');
      } else {
        setActiveTab('prospector');
        const element = document.getElementById('prospector-view');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      onOpenPaywall();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-white text-lg">Foco em Dados</span>

          <nav className="hidden md:flex items-center gap-4">
            <button
              onClick={handleDashboardClick}
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                activeTab === 'prospector'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Dashboards
            </button>

            <button
              onClick={() => {
                if (hasAccess) {
                  if (onEnterApp) onEnterApp('growth');
                  else setActiveTab('hermes');
                } else {
                  onOpenPaywall();
                }
              }}
              className="text-xs text-slate-300 hover:text-white px-3 py-2"
            >
              Agente Hermes
            </button>

            <button
              onClick={() => {
                if (hasAccess) {
                  if (onEnterApp) onEnterApp('growth');
                  else setActiveTab('prospector');
                } else {
                  onOpenPaywall();
                }
              }}
              className="text-xs text-slate-300 hover:text-white px-3 py-2"
            >
              Prospector IA
            </button>
          </nav>
        </div>

        <button
          onClick={hasAccess ? () => { if (onEnterApp) onEnterApp('growth'); } : onOpenPaywall}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          {hasAccess ? '🚀 Acessar Painel PRO' : 'Testar Grátis'}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
