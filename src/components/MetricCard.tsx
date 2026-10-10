interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'warning';
  icon?: string;
  tooltip?: string;
}

const CHANGE_ICONS = {
  positive: 'trending_up',
  negative: 'trending_down',
  warning: 'error_outline',
};

const CHANGE_COLORS = {
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  warning: 'text-yellow-400',
};

export default function MetricCard({
  label,
  value,
  change,
  changeType,
  icon,
  tooltip,
}: MetricCardProps) {
  return (
    <div className="metric-card relative group" title={tooltip}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <span className="metric-label block truncate">{label}</span>
          <div className="metric-value truncate">{value}</div>
          {change && changeType && (
            <div className={`flex items-center gap-1 text-xs font-mono font-bold mt-1 ${CHANGE_COLORS[changeType] || 'text-slate-400'}`}>
              <span className="material-symbols-outlined text-base leading-none">
                {CHANGE_ICONS[changeType] || 'remove_red_eye'}
              </span>
              <span>{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
        )}
      </div>
      {tooltip && (
        <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-slate-800 text-[10px] text-slate-300 font-mono px-2.5 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-xl">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
}
