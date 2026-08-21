import { TrendingUp, Calendar, Percent, Wallet, Receipt, Scale } from 'lucide-react';
import { type ScheduleResult, type LoanParams, formatAmount, formatTerm, formatDate, formatPercentExact } from '@/lib/loan';

interface SummaryCardsProps {
  result: ScheduleResult;
  params: LoanParams;
  currencySymbol: string;
}

export default function SummaryCards({ result, params, currencySymbol }: SummaryCardsProps) {
  const overpaymentPct = params.amount > 0 ? (result.overpayment / params.amount) * 100 : 0;

  const cards = [
    {
      icon: <Wallet className="w-5 h-5" />,
      label: 'Ежемесячный платёж',
      value: `${formatAmount(result.monthlyPayment)} ${currencySymbol}`,
      sub: result.firstPayment !== result.lastPayment ? `от ${formatAmount(result.firstPayment)} до ${formatAmount(result.lastPayment)}` : 'фиксированный',
      color: 'primary',
    },
    {
      icon: <Receipt className="w-5 h-5" />,
      label: 'Переплата',
      value: `${formatAmount(result.overpayment)} ${currencySymbol}`,
      sub: `${formatPercentExact(overpaymentPct)}% от суммы`,
      color: 'error',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Срок',
      value: formatTerm(result.termActual),
      sub: `до ${formatDate(result.endDate)}`,
      color: 'accent',
    },
    {
      icon: <Percent className="w-5 h-5" />,
      label: 'Эффективная ставка',
      value: `${formatPercentExact(result.effectiveRate)}%`,
      sub: 'с учётом комиссий',
      color: 'warning',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`card p-4 hover:shadow-card-lg transition-shadow duration-300 animate-slide-up`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${c.color}-50 text-${c.color}-600`}>
              {c.icon}
            </div>
          </div>
          <div className="text-xs font-medium text-neutral-500 mb-1">{c.label}</div>
          <div className="text-lg sm:text-xl font-display font-bold text-neutral-900 leading-tight tabular-nums">
            {c.value}
          </div>
          <div className="text-xs text-neutral-400 mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function TotalsBar({ result, currencySymbol }: { result: ScheduleResult; currencySymbol: string }) {
  const total = result.totalPrincipal + result.totalInterest + result.totalFee;
  if (total === 0) return null;

  const segments = [
    { label: 'Тело кредита', value: result.totalPrincipal, color: 'bg-primary-500' },
    { label: 'Проценты', value: result.totalInterest, color: 'bg-error-400' },
    { label: 'Комиссии', value: result.totalFee, color: 'bg-warning-400' },
  ].filter((s) => s.value > 0);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-neutral-500" />
          <h3 className="text-sm font-semibold text-neutral-700">Структура выплат</h3>
        </div>
        <span className="text-sm font-display font-bold text-neutral-900 tabular-nums">
          {formatAmount(total)} {currencySymbol}
        </span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-neutral-100">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${s.color} transition-all duration-500 hover:brightness-110`}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${formatAmount(s.value)} ${currencySymbol}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span className="text-xs text-neutral-500">{s.label}</span>
            <span className="text-xs font-semibold text-neutral-700 tabular-nums">
              {formatAmount(s.value)} {currencySymbol}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
