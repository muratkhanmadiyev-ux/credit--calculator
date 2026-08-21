import { useState, useMemo } from 'react';
import { Download, ArrowUpDown, ChevronRight } from 'lucide-react';
import { type ScheduleResult, formatAmount, formatDate, toCSV, downloadCSV } from '@/lib/loan';
import { useI18n } from '@/lib/i18n';

interface ScheduleTableProps {
  result: ScheduleResult;
  currencySymbol: string;
  locale: string;
}

type SortKey = 'month' | 'payment' | 'interest' | 'principal' | 'balance';

export default function ScheduleTable({ result, currencySymbol, locale }: ScheduleTableProps) {
  const { t } = useI18n();
  const [sortKey, setSortKey] = useState<SortKey>('month');
  const [sortAsc, setSortAsc] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => {
    const rows = [...result.rows];
    rows.sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortAsc ? diff : -diff;
    });
    return rows;
  }, [result.rows, sortKey, sortAsc]);

  const visibleRows = expanded ? sorted : sorted.slice(0, 12);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    const headers = [t.csvNumber, t.csvDate, t.csvPayment, t.csvInterest, t.csvBody, t.csvEarly, t.csvFee, t.csvBalance];
    const csv = toCSV(result.rows, headers, locale);
    downloadCSV(t.csvFilename, csv);
  };

  const SortHeader = ({ label, k, align = 'right' }: { label: string; k: SortKey; align?: 'left' | 'right' }) => (
    <th
      onClick={() => handleSort(k)}
      className={`py-2.5 px-3 cursor-pointer select-none whitespace-nowrap transition-colors hover:bg-neutral-50 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === k ? 'text-primary-500' : 'text-neutral-300'}`} />
      </span>
    </th>
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-700">{t.schedule}</h3>
        <button onClick={handleExport} className="btn-ghost !px-3 !py-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />
          {t.exportCSV}
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50/80 text-xs text-neutral-500 font-medium">
            <tr>
              <SortHeader label={t.number} k="month" align="left" />
              <th className="py-2.5 px-3 text-left whitespace-nowrap">{t.date}</th>
              <SortHeader label={t.paymentLabel} k="payment" />
              <SortHeader label={t.interest} k="interest" />
              <SortHeader label={t.body} k="principal" />
              <th className="py-2.5 px-3 text-right whitespace-nowrap">{t.extra}</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">{t.fees}</th>
              <SortHeader label={t.balance} k="balance" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleRows.map((r) => (
              <tr
                key={r.month}
                className={`transition-colors hover:bg-primary-50/30 ${r.isExtra ? 'bg-success-50/40' : ''}`}
              >
                <td className="py-2.5 px-3 font-medium text-neutral-500 tabular-nums">{r.month}</td>
                <td className="py-2.5 px-3 text-neutral-600 whitespace-nowrap">{formatDate(r.date, locale)}</td>
                <td className="py-2.5 px-3 text-right font-semibold text-neutral-900 tabular-nums">
                  {formatAmount(r.payment)}
                </td>
                <td className="py-2.5 px-3 text-right text-error-500 tabular-nums">{formatAmount(r.interest)}</td>
                <td className="py-2.5 px-3 text-right text-primary-600 tabular-nums">{formatAmount(r.principal)}</td>
                <td className="py-2.5 px-3 text-right text-success-600 tabular-nums">
                  {r.extra > 0 ? formatAmount(r.extra) : '—'}
                </td>
                <td className="py-2.5 px-3 text-right text-warning-600 tabular-nums">
                  {r.fee > 0 ? formatAmount(r.fee) : '—'}
                </td>
                <td className="py-2.5 px-3 text-right text-neutral-700 tabular-nums">{formatAmount(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > 12 && (
        <div className="px-5 py-3 border-t border-neutral-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn-ghost w-full text-xs text-neutral-500"
          >
            {expanded ? t.collapse : t.showAllRows.replace('{n}', String(sorted.length))}
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? '-rotate-90' : 'rotate-90'}`} />
          </button>
        </div>
      )}
    </div>
  );
}
