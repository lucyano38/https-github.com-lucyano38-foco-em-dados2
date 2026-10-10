import { LayoutDashboard, Bot, ArrowLeft, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigateTo: (view: 'landing' | 'bi' | 'bot-factory') => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onNavigateTo, onLogout }: SidebarProps) {
  return (
    <aside className="glass-card w-64 h-screen p-6 border-r border-glass-border flex flex-col">
      <h2 className="text-display-lg text-on-surface mb-8 font-display">Foco em Dados</h2>
      <nav className="space-y-4 flex-1">
        <button
          onClick={() => onNavigateTo('bi')}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentView === 'bi'
              ? 'bg-vivid-purple/10 text-vivid-purple border border-vivid-purple/20'
              : 'text-on-surface-variant hover:text-primary border border-transparent hover:border-primary/20'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>BI Analytics Engine</span>
        </button>
        <button
          onClick={() => onNavigateTo('bot-factory')}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentView === 'bot-factory'
              ? 'bg-vivid-purple/10 text-vivid-purple border border-vivid-purple/20'
              : 'text-on-surface-variant hover:text-primary border border-transparent hover:border-primary/20'
          }`}
        >
          <Bot className="w-4 h-4 shrink-0" />
          <span>Fábrica de Bots</span>
        </button>
      </nav>
      <div className="space-y-2 pt-4 border-t border-glass-border">
        <button
          onClick={() => onNavigateTo('landing')}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-on-surface-variant hover:text-primary rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Site</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}
