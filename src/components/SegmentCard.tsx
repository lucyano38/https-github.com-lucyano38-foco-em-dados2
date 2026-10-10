import { type JSX } from 'react';
import clsx from 'clsx';

interface SegmentCardProps {
  icon: string;
  name: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function SegmentCard({
  icon,
  name,
  description,
  isSelected,
  onSelect,
}: SegmentCardProps): JSX.Element {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        'glass-card p-5 sm:p-6 text-left w-full transition-all duration-300 cursor-pointer',
        'hover:scale-[1.02] active:scale-[0.98]',
        isSelected &&
          'border-vivid-purple/60 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-[1.02]'
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-4">
        <div
          className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            isSelected
              ? 'bg-vivid-purple/20 text-vivid-purple'
              : 'bg-white/5 text-slate-400'
          )}
        >
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div className="min-w-0 space-y-1">
          <h3
            className={clsx(
              'font-display font-bold text-base sm:text-lg transition-colors',
              isSelected ? 'text-slate-100' : 'text-slate-300'
            )}
          >
            {name}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>
        {isSelected && (
          <span className="material-symbols-outlined text-vivid-purple text-xl shrink-0 mt-1">
            check_circle
          </span>
        )}
      </div>
    </button>
  );
}
