import { useState, useMemo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { type ScheduleResult, formatAmount, formatDateShort } from '@/lib/loan';
import { useI18n } from '@/lib/i18n';

interface PaymentChartProps {
  result: ScheduleResult;
  currencySymbol: string;
  locale: string;
}

type ChartMode = 'composition' | 'balance';

export default function PaymentChart({ result, currencySymbol, locale }: PaymentChartProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<ChartMode>('composition');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 800;
  const H = 280;
  const PAD = { top: 20, right: 16, bottom: 36, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const data = useMemo(() => {
    if (result.rows.length === 0) return [];
    const maxPayment = Math.max(...result.rows.map((r) => r.payment));
    const maxBalance = result.rows[0]?.balance ?? 0;
    return result.rows.map((r, idx) => ({
      idx,
      month: r.month,
      date: r.date,
      payment: r.payment,
      interest: r.interest,
      principal: r.principal,
      extra: r.extra,
      fee: r.fee,
      balance: r.balance,
      maxPayment,
      maxBalance,
    }));
  }, [result.rows]);

  if (data.length === 0) {
    return (
      <div className="card p-8 flex items-center justify-center text-sm text-neutral-400">
        {t.notEnoughData}
      </div>
    );
  }

  const xScale = (idx: number) => PAD.left + (idx / Math.max(1, data.length - 1)) * chartW;
  const maxY = mode === 'composition' ? data[0].maxPayment : data[0].maxBalance;
  const yScale = (v: number) => PAD.top + chartH - (v / maxY) * chartH;

  const buildStackedAreas = () => {
    let cumTop = data.map(() => 0);
    const layers = [
      { key: 'principal', color: '#3b82f6', colorFill: '#3b82f6' },
      { key: 'interest', color: '#f87171', colorFill: '#f87171' },
      { key: 'extra', color: '#10b981', colorFill: '#10b981' },
      { key: 'fee', color: '#fbbf24', colorFill: '#fbbf24' },
    ] as const;

    return layers.map((layer) => {
      const values = data.map((d) => d[layer.key as keyof typeof d] as number);
      const running = values.map((v, i) => {
        cumTop[i] += v;
        return cumTop[i];
      });

      const topPath = running.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`).join(' ');

      return { ...layer, topPath, values, running };
    });
  };

  const balancePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.balance)}`)
    .join(' ');

  const balanceAreaPath =
    `${balancePath} L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxY / yTicks) * i);

  const xTickCount = Math.min(6, data.length);
  const xTickIndices = Array.from({ length: xTickCount }, (_, i) =>
    Math.round((i / (xTickCount - 1)) * (data.length - 1))
  );

  const formatY = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${Math.round(v / 1000)}к`;
    return Math.round(v).toString();
  };

  const hover = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {mode === 'composition' ? <TrendingUp className="w-4 h-4 text-neutral-500" /> : <TrendingDown className="w-4 h-4 text-neutral-500" />}
          <h3 className="text-sm font-semibold text-neutral-700">
            {mode === 'composition' ? t.paymentComposition : t.balanceRemaining}
          </h3>
        </div>
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setMode('composition')}
            className={`tab-btn !px-3 !py-1.5 text-xs ${mode === 'composition' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {t.payments}
          </button>
          <button
            onClick={() => setMode('balance')}
            className={`tab-btn !px-3 !py-1.5 text-xs ${mode === 'balance' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {t.balance}
          </button>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * W - PAD.left;
            const idx = Math.round((x / chartW) * (data.length - 1));
            if (idx >= 0 && idx < data.length) setHoverIdx(idx);
          }}
        >
          {tickValues.map((val, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={yScale(val)}
                y2={yScale(val)}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray={i === 0 ? '0' : '4 4'}
              />
              <text x={PAD.left - 8} y={yScale(val) + 4} textAnchor="end" className="fill-neutral-400" style={{ fontSize: 11 }}>
                {formatY(val)}
              </text>
            </g>
          ))}

          {xTickIndices.map((idx) => (
            <text
              key={idx}
              x={xScale(idx)}
              y={H - PAD.bottom + 18}
              textAnchor="middle"
              className="fill-neutral-400"
              style={{ fontSize: 11 }}
            >
              {formatDateShort(data[idx].date, locale)}
            </text>
          ))}

          {mode === 'composition' ? (
            <>
              {buildStackedAreas().map((layer, i) => {
                const areaPath = `${layer.topPath} L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;
                return (
                  <g key={i}>
                    <path d={areaPath} fill={layer.colorFill} opacity={0.18} />
                    <path d={layer.topPath} fill="none" stroke={layer.color} strokeWidth={1.5} />
                  </g>
                );
              })}
            </>
          ) : (
            <>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <path d={balanceAreaPath} fill="url(#balanceGrad)" />
              <path d={balancePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
            </>
          )}

          {hover && (
            <g>
              <line
                x1={xScale(hover.idx)}
                x2={xScale(hover.idx)}
                y1={PAD.top}
                y2={H - PAD.bottom}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              {mode === 'composition' ? (
                <circle cx={xScale(hover.idx)} cy={yScale(hover.payment)} r={4} fill="#1e293b" stroke="white" strokeWidth={2} />
              ) : (
                <circle cx={xScale(hover.idx)} cy={yScale(hover.balance)} r={4} fill="#3b82f6" stroke="white" strokeWidth={2} />
              )}
            </g>
          )}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute top-2 right-2 bg-white rounded-xl shadow-card-lg border border-neutral-200 p-3 text-xs min-w-[180px] animate-scale-in"
          >
            <div className="font-semibold text-neutral-700 mb-1.5">{formatDateShort(hover.date, locale)} ({t.monthShort} {hover.month})</div>
            {mode === 'composition' ? (
              <div className="space-y-1">
                <Row label={t.paymentLabel} value={hover.payment} symbol={currencySymbol} bold />
                <Row label={t.body} value={hover.principal} symbol={currencySymbol} color="text-primary-600" />
                <Row label={t.interest} value={hover.interest} symbol={currencySymbol} color="text-error-500" />
                {hover.extra > 0 && <Row label={t.earlyLabel} value={hover.extra} symbol={currencySymbol} color="text-success-600" />}
                {hover.fee > 0 && <Row label={t.feeLabel} value={hover.fee} symbol={currencySymbol} color="text-warning-600" />}
              </div>
            ) : (
              <div className="space-y-1">
                <Row label={t.balance} value={hover.balance} symbol={currencySymbol} bold />
                <Row label={t.paymentLabel} value={hover.payment} symbol={currencySymbol} />
              </div>
            )}
          </div>
        )}
      </div>

      {mode === 'composition' && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
          <LegendItem color="bg-primary-500" label={t.body} />
          <LegendItem color="bg-error-400" label={t.interest} />
          <LegendItem color="bg-success-500" label={t.earlyLabel} />
          <LegendItem color="bg-warning-400" label={t.fees} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, symbol, color = 'text-neutral-600', bold = false }: { label: string; value: number; symbol: string; color?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-neutral-500">{label}</span>
      <span className={`${color} ${bold ? 'font-semibold' : ''} tabular-nums`}>
        {formatAmount(value)} {symbol}
      </span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}
