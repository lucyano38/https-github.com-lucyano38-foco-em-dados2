import { type JSX } from 'react';

interface UsageBarProps {
  current: number;
  limit: number;
  feature: string;
  onUpgrade?: () => void;
  maxWidth?: string;
}

function getState(percent: number): 'normal' | 'warning' | 'danger' {
  if (percent > 95) return 'danger';
  if (percent >= 80) return 'warning';
  return 'normal';
}

const STATE_CLASSES: Record<string, string> = {
  normal: 'normal',
  warning: 'warning',
  danger: 'danger',
};

const TEXT_COLORS: Record<string, string> = {
  normal: 'text-slate-400',
  warning: 'text-yellow-400',
  danger: 'text-red-400',
};

export default function UsageBar({
  current,
  limit,
  feature,
  onUpgrade,
  maxWidth,
}: UsageBarProps): JSX.Element {
  const percent = Math.min((current / limit) * 100, 100);
  const state = getState(percent);

  return (
    <div style={maxWidth ? { maxWidth } : undefined} className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`font-mono text-xs ${TEXT_COLORS[state]}`}>
          {current} / {limit} {feature} usado
        </span>
        {onUpgrade && percent > 70 && (
          <button
            onClick={onUpgrade}
            className="font-mono text-[11px] uppercase tracking-wider text-vivid-purple hover:text-electric-blue transition-colors cursor-pointer"
          >
            Upgrade
          </button>
        )}
      </div>
      <div className="usage-bar">
        <div
          className={`usage-bar-fill ${STATE_CLASSES[state]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
