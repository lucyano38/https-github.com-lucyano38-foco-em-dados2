interface PricingFeature {
  label: string;
  included: boolean;
}

interface PricingCardProps {
  tier: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: PricingFeature[];
  isFeatured?: boolean;
  isCurrent?: boolean;
  color: string;
  ctaLabel: string;
  onSelect: () => void;
}

const COLOR_STYLES: Record<string, { text: string; bg: string; border: string; btn: string; shadow: string }> = {
  free: {
    text: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    btn: 'bg-slate-500 text-white hover:opacity-90',
    shadow: 'shadow-slate-500/20',
  },
  starter: {
    text: 'text-electric-blue',
    bg: 'bg-electric-blue/10',
    border: 'border-electric-blue/20',
    btn: 'bg-electric-blue text-slate-950 hover:opacity-90',
    shadow: 'shadow-electric-blue/20',
  },
  pro: {
    text: 'text-vivid-purple',
    bg: 'bg-vivid-purple/10',
    border: 'border-vivid-purple/20',
    btn: 'bg-vivid-purple text-white hover:opacity-90',
    shadow: 'shadow-vivid-purple/20',
  },
  business: {
    text: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    btn: 'bg-warning text-slate-950 hover:opacity-90',
    shadow: 'shadow-warning/20',
  },
  enterprise: {
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    btn: 'bg-danger text-white hover:opacity-90',
    shadow: 'shadow-danger/20',
  },
};

export default function PricingCard({
  tier,
  name,
  price,
  period,
  features,
  isFeatured,
  isCurrent,
  color,
  ctaLabel,
  onSelect,
}: PricingCardProps) {
  const c = COLOR_STYLES[color] || COLOR_STYLES.free;
  const displayPrice = period === 'yearly' ? Math.round(price * 12 * 0.8) : price;
  const monthlyEq = period === 'yearly' ? Math.round(displayPrice / 12) : price;

  return (
    <div
      className={`glass-card p-6 sm:p-7 flex flex-col justify-between relative transition-all duration-300 hover:border-white/20 ${
        isFeatured ? 'pricing-card-featured' : ''
      }`}
    >
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap z-10 shadow-lg shadow-emerald-500/20">
          Plano Atual
        </span>
      )}

      <div className="space-y-5">
        <span className={`badge-plan ${c.text} ${c.bg} border ${c.border}`}>
          {name}
        </span>

        <div className="space-y-1">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-100 font-display">
            {name}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">tier {tier}</p>
        </div>

        <div className="flex items-baseline gap-0.5">
          <span className="text-sm font-bold text-slate-400">R$</span>
          <span className="text-4xl sm:text-5xl font-black text-slate-100 font-display">
            {displayPrice}
          </span>
          <span className="text-xs text-slate-500 ml-1">
            {period === 'yearly' ? '/ano' : '/mês'}
          </span>
        </div>

        {period === 'yearly' && (
          <p className="text-[11px] text-emerald-400 font-mono">
            ~R$ {monthlyEq}/mês (20% OFF)
          </p>
        )}

        <div className="pt-3 border-t border-white/5 space-y-2.5">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
              {f.included ? (
                <span className="material-symbols-outlined text-emerald-400 text-lg">check</span>
              ) : (
                <span className="material-symbols-outlined text-slate-600 text-lg">close</span>
              )}
              <span className={f.included ? '' : 'text-slate-500 line-through'}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6">
        {isCurrent ? (
          <div className="w-full h-11 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs font-mono uppercase tracking-wider">
            Plano Atual
          </div>
        ) : (
          <button
            onClick={onSelect}
            className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 duration-300 cursor-pointer ${c.btn} shadow-lg ${c.shadow}`}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
