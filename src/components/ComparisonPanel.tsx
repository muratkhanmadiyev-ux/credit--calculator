import { GitCompareArrows, TrendingDown, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { type ScheduleResult, formatAmount, formatTerm, formatPercentExact } from '@/lib/loan';

interface ComparisonPanelProps {
  base: ScheduleResult;
  alt: ScheduleResult;
  currencySymbol: string;
  baseLabel: string;
  altLabel: string;
  baseColor: string;
  altColor: string;
}

export default function ComparisonPanel({
  base,
  alt,
  currencySymbol,
  baseLabel,
  altLabel,
  baseColor,
  altColor,
}: ComparisonPanelProps) {
  const interestSaved = Math.max(0, base.totalInterest - alt.totalInterest);
  const feeSaved = Math.max(0, base.totalFee - alt.totalFee);
  const monthsSaved = Math.max(0, base.termActual - alt.termActual);
  const paymentDiff = alt.monthlyPayment - base.monthlyPayment;
  const totalSaved = interestSaved + feeSaved;

  const metrics = [
    {
      label: 'Переплата',
      baseVal: `${formatAmount(base.overpayment)} ${currencySymbol}`,
      altVal: `${formatAmount(alt.overpayment)} ${currencySymbol}`,
      diff: base.overpayment - alt.overpayment,
      fmt: (v: number) => `${v >= 0 ? '−' : '+'}${formatAmount(Math.abs(v))} ${currencySymbol}`,
      good: (v: number) => v > 0,
    },
    {
      label: 'Срок',
      baseVal: formatTerm(base.termActual),
      altVal: formatTerm(alt.termActual),
      diff: base.termActual - alt.termActual,
      fmt: (v: number) => (v > 0 ? `−${v} мес` : v < 0 ? `+${Math.abs(v)} мес` : 'равно'),
      good: (v: number) => v > 0,
    },
    {
      label: 'Платёж',
      baseVal: `${formatAmount(base.monthlyPayment)} ${currencySymbol}`,
      altVal: `${formatAmount(alt.monthlyPayment)} ${currencySymbol}`,
      diff: base.monthlyPayment - alt.monthlyPayment,
      fmt: (v: number) => `${v >= 0 ? '−' : '+'}${formatAmount(Math.abs(v))} ${currencySymbol}`,
      good: () => false,
    },
    {
      label: 'Эфф. ставка',
      baseVal: `${formatPercentExact(base.effectiveRate)}%`,
      altVal: `${formatPercentExact(alt.effectiveRate)}%`,
      diff: base.effectiveRate - alt.effectiveRate,
      fmt: (v: number) => `${v >= 0 ? '−' : '+'}${formatPercentExact(Math.abs(v))}%`,
      good: (v: number) => v > 0,
    },
  ];

  return (
    <div className="card p-5 sm:p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <GitCompareArrows className="w-5 h-5 text-primary-600" />
        <h3 className="text-base font-display font-bold text-neutral-900">Сравнение сценариев</h3>
      </div>

      {/* Savings highlight */}
      {totalSaved > 0 && (
        <div className="mb-5 p-4 bg-gradient-to-br from-success-50 to-success-50/30 border border-success-200 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center text-success-600 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-success-700">Экономия на процентах и комиссиях</div>
            <div className="text-xl font-display font-bold text-success-700 tabular-nums">
              {formatAmount(totalSaved)} {currencySymbol}
            </div>
          </div>
          {monthsSaved > 0 && (
            <div className="text-right">
              <div className="text-xs font-medium text-success-700">Срок короче на</div>
              <div className="text-lg font-display font-bold text-success-700 tabular-nums">
                {monthsSaved} мес
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metric rows */}
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center pb-2 border-b border-neutral-100">
          <div className={`text-sm font-semibold text-center ${baseColor}`}>
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${baseColor}`} />
              {baseLabel}
            </span>
          </div>
          <div className="text-xs text-neutral-400 text-center w-16">разница</div>
          <div className={`text-sm font-semibold text-center ${altColor}`}>
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${altColor}`} />
              {altLabel}
            </span>
          </div>
        </div>

        {metrics.map((m) => (
          <div key={m.label} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-2.5 hover:bg-neutral-50/50 rounded-lg px-2 transition-colors">
            <div className="text-right">
              <div className="text-xs text-neutral-400 mb-0.5">{m.label}</div>
              <div className="text-sm font-semibold text-neutral-800 tabular-nums">{m.baseVal}</div>
            </div>
            <div className="text-center w-16">
              <span
                className={`chip text-xs ${
                  m.good(m.diff)
                    ? 'bg-success-100 text-success-700'
                    : m.diff === 0
                    ? 'bg-neutral-100 text-neutral-500'
                    : 'bg-error-100 text-error-600'
                }`}
              >
                {m.fmt(m.diff)}
              </span>
            </div>
            <div className="text-left">
              <div className="text-xs text-neutral-400 mb-0.5">{m.label}</div>
              <div className="text-sm font-semibold text-neutral-800 tabular-nums">{m.altVal}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual bar comparison */}
      <div className="mt-5 pt-4 border-t border-neutral-100">
        <div className="text-xs font-medium text-neutral-500 mb-3">Переплата по сценариям</div>
        <div className="space-y-2.5">
          <CompareBar label={baseLabel} value={base.overpayment} max={Math.max(base.overpayment, alt.overpayment)} color={baseColor} symbol={currencySymbol} />
          <CompareBar label={altLabel} value={alt.overpayment} max={Math.max(base.overpayment, alt.overpayment)} color={altColor} symbol={currencySymbol} />
        </div>
      </div>
    </div>
  );
}

function CompareBar({ label, value, max, color, symbol }: { label: string; value: number; max: number; color: string; symbol: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-neutral-500">{label}</span>
        <span className="text-xs font-semibold text-neutral-700 tabular-nums">
          {formatAmount(value)} {symbol}
        </span>
      </div>
      <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
