import { useEffect } from 'react';

type ToastType = 'upsell' | 'alert' | 'success' | 'error';

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
  onClose: () => void;
}

const ICONS: Record<ToastType, string> = {
  upsell: 'campaign',
  alert: 'warning',
  success: 'check_circle',
  error: 'error',
};

const STYLES: Record<ToastType, { accent: string; bg: string; icon: string }> = {
  upsell: { accent: 'border-vivid-purple/40', bg: 'bg-vivid-purple/10', icon: 'text-vivid-purple' },
  alert: { accent: 'border-yellow-500/40', bg: 'bg-yellow-500/10', icon: 'text-yellow-400' },
  success: { accent: 'border-emerald-500/40', bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  error: { accent: 'border-red-500/40', bg: 'bg-red-500/10', icon: 'text-red-400' },
};

export default function Toast({ type, title, message, action, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const s = STYLES[type];

  return (
    <div className={`toast ${s.accent} border-l-4 bg-glass-bg`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0 ${s.icon}`}>
          <span className="material-symbols-outlined text-xl">{ICONS[type]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-100 font-display">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-xs font-bold uppercase tracking-wider ${s.icon} hover:opacity-80 transition-opacity cursor-pointer`}
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
