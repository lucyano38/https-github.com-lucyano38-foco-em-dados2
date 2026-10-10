import { type JSX } from 'react';
import clsx from 'clsx';

interface WizardStepProps {
  step: number;
  currentStep: number;
  label: string;
  isLast?: boolean;
}

export default function WizardStep({
  step,
  currentStep,
  label,
  isLast,
}: WizardStepProps): JSX.Element {
  const completed = step < currentStep;
  const active = step === currentStep;

  const stateClass = completed
    ? 'completed'
    : active
      ? 'active'
      : 'pending';

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center gap-1.5">
        <div className={clsx('wizard-step', stateClass)}>
          {completed ? (
            <span className="material-symbols-outlined text-lg">check</span>
          ) : (
            <span>{step}</span>
          )}
        </div>
        <span
          className={clsx(
            'font-mono text-[11px] uppercase tracking-wider whitespace-nowrap',
            active
              ? 'text-slate-100'
              : completed
                ? 'text-emerald-400'
                : 'text-slate-500'
          )}
        >
          {label}
        </span>
      </div>
      {!isLast && (
        <div className="w-8 sm:w-12 h-px bg-white/10 mx-1 sm:mx-2" />
      )}
    </div>
  );
}
