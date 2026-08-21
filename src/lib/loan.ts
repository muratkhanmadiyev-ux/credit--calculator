export type Currency = 'KZT' | 'RUB' | 'USD' | 'EUR' | 'KGS';

export const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: 'KZT', symbol: '₸', label: 'Тенге' },
  { code: 'RUB', symbol: '₽', label: 'Рубль' },
  { code: 'USD', symbol: '$', label: 'Доллар' },
  { code: 'EUR', symbol: '€', label: 'Евро' },
  { code: 'KGS', symbol: 'сом', label: 'Сом' },
];

export type TermUnit = 'months' | 'years';

export type RepaymentType = 'annuity' | 'equal';

export type FeeUnit = 'amount' | 'pct';

export type MonthlyFeeMode = 'abs' | 'pct' | 'rem' | 'remy';

export type ExtraRepeat = 'once' | 'monthly' | 'yearly';

export type ExtraMode = 'reduce-term' | 'reduce-payment';

export interface ExtraPayment {
  id: string;
  amount: number;
  startMonth: number;
  repeat: ExtraRepeat;
  mode: ExtraMode;
}

export interface LoanParams {
  amount: number;
  currency: Currency;
  termMonths: number;
  rate: number;
  repayment: RepaymentType;
  firstPaymentDate: Date;
  oneTimeFee: number;
  oneTimeFeeUnit: FeeUnit;
  monthlyFee: number;
  monthlyFeeMode: MonthlyFeeMode;
  extras: ExtraPayment[];
}

export interface ScheduleRow {
  month: number;
  date: Date;
  payment: number;
  interest: number;
  principal: number;
  extra: number;
  fee: number;
  balance: number;
  isExtra: boolean;
}

export interface ScheduleResult {
  rows: ScheduleRow[];
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
  totalExtra: number;
  totalFee: number;
  totalPaid: number;
  overpayment: number;
  monthlyPayment: number;
  firstPayment: number;
  lastPayment: number;
  effectiveRate: number;
  termActual: number;
  endDate: Date;
}

const MAX_ITER = 1200;
const BALANCE_EPS = 0.5;

export function parseAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/\s/g, '').replace(/\u00A0/g, '').replace(/,/g, '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatAmount(n: number): string {
  const rounded = Math.round(n);
  return new Intl.NumberFormat('ru-RU').format(rounded);
}

export function formatAmountExact(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n);
}

export function formatRate(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n);
}

export function formatPercent(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(n);
}

export function formatPercentExact(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function formatTerm(totalMonths: number): string {
  if (totalMonths <= 0) return '0 месяцев';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${pluralize(years, ['год', 'года', 'лет'])}`);
  if (months > 0) parts.push(`${months} ${pluralize(months, ['месяц', 'месяца', 'месяцев'])}`);
  return parts.join(' ');
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', { month: 'short', year: '2-digit' }).format(date);
}

function computeOneTimeFee(params: LoanParams): number {
  if (params.oneTimeFeeUnit === 'amount') return params.oneTimeFee;
  return (params.amount * params.oneTimeFee) / 100;
}

function computeMonthlyFee(opening: number, originalAmount: number, params: LoanParams): number {
  const m = params.monthlyFee;
  switch (params.monthlyFeeMode) {
    case 'abs':
      return m;
    case 'pct':
      return (originalAmount * m) / 100;
    case 'rem':
      return (opening * m) / 100;
    case 'remy':
      return (opening * m) / 100 / 12;
    default:
      return 0;
  }
}

function buildExtraMap(extras: ExtraPayment[]): Map<number, { amount: number; mode: ExtraMode }[]> {
  const map = new Map<number, { amount: number; mode: ExtraMode }[]>();
  for (const ex of extras) {
    if (ex.amount <= 0 || ex.startMonth < 1) continue;
    const apply = (m: number) => {
      const arr = map.get(m) ?? [];
      arr.push({ amount: ex.amount, mode: ex.mode });
      map.set(m, arr);
    };
    if (ex.repeat === 'once') {
      apply(ex.startMonth);
    } else if (ex.repeat === 'monthly') {
      for (let m = ex.startMonth; m <= 1200; m++) apply(m);
    } else if (ex.repeat === 'yearly') {
      for (let m = ex.startMonth; m <= 1200; m += 12) apply(m);
    }
  }
  return map;
}

export function calculateSchedule(params: LoanParams): ScheduleResult {
  const S = params.amount;
  const n = params.termMonths;
  const i = params.rate / 100 / 12;
  const originalAmount = S;
  const oneTime = computeOneTimeFee(params);
  const extraMap = buildExtraMap(params.extras);

  let balance = S;
  let payment = i === 0 ? S / n : (S * i) / (1 - Math.pow(1 + i, -n));
  let fixedBody = S / n;

  const rows: ScheduleRow[] = [];
  let totalInterest = 0;
  let totalPrincipal = 0;
  let totalExtra = 0;
  let totalFee = 0;
  let firstPayment = 0;
  let lastPayment = 0;
  let k = 0;

  while (balance > BALANCE_EPS && k < MAX_ITER) {
    k++;
    const opening = balance;
    const interest = opening * i;
    let principal: number;
    let currentPayment: number;

    if (params.repayment === 'annuity') {
      principal = payment - interest;
      currentPayment = payment;
    } else {
      principal = fixedBody;
      currentPayment = principal + interest;
    }

    if (principal > opening) principal = opening;
    if (principal < 0) principal = 0;

    balance -= principal;
    const fee = computeMonthlyFee(opening, originalAmount, params);

    let extra = 0;
    const extrasThisMonth = extraMap.get(k);
    let reduceMode: ExtraMode | null = null;
    if (extrasThisMonth && balance > BALANCE_EPS) {
      let sum = 0;
      for (const e of extrasThisMonth) {
        sum += e.amount;
        reduceMode = e.mode;
      }
      extra = Math.min(sum, balance);
      balance -= extra;
    }

    const rowPayment = currentPayment + extra + fee;
    if (firstPayment === 0) firstPayment = rowPayment;
    lastPayment = rowPayment;

    totalInterest += interest;
    totalPrincipal += principal;
    totalExtra += extra;
    totalFee += fee;

    rows.push({
      month: k,
      date: addMonths(params.firstPaymentDate, k - 1),
      payment: rowPayment,
      interest,
      principal,
      extra,
      fee,
      balance: Math.max(0, balance),
      isExtra: extra > 0,
    });

    if (balance <= BALANCE_EPS) break;

    if (extrasThisMonth && extra > 0 && reduceMode === 'reduce-payment' && balance > BALANCE_EPS) {
      const remaining = n - k;
      if (remaining > 0) {
        if (params.repayment === 'annuity') {
          payment = i === 0 ? balance / remaining : (balance * i) / (1 - Math.pow(1 + i, -remaining));
        } else {
          fixedBody = balance / remaining;
        }
      }
    }
  }

  const totalPaid = totalPrincipal + totalInterest + totalExtra + totalFee;
  const overpayment = totalInterest + totalFee;
  const effectiveRate = computeEffectiveRate(params, rows, oneTime);

  return {
    rows,
    totalPayment: totalPaid,
    totalInterest,
    totalPrincipal,
    totalExtra,
    totalFee,
    totalPaid,
    overpayment,
    monthlyPayment: firstPayment,
    firstPayment,
    lastPayment,
    effectiveRate,
    termActual: rows.length,
    endDate: rows.length > 0 ? rows[rows.length - 1].date : params.firstPaymentDate,
  };
}

function computeEffectiveRate(params: LoanParams, rows: ScheduleRow[], oneTimeFee: number): number {
  const received = params.amount - oneTimeFee;
  if (received <= 0 || rows.length === 0) return 0;

  const cashFlows = rows.map((r) => r.payment);

  const npv = (m: number) => {
    let sum = 0;
    for (let k = 0; k < cashFlows.length; k++) {
      sum += cashFlows[k] / Math.pow(1 + m, k + 1);
    }
    return sum - received;
  };

  let low = 0;
  let high = 1;
  let fLow = npv(low);
  let fHigh = npv(high);
  let guard = 0;
  while (fHigh > 0 && guard < 40) {
    high *= 2;
    fHigh = npv(high);
    guard++;
  }
  if (fHigh > 0) return 0;

  let m = 0.5;
  for (let iter = 0; iter < 200; iter++) {
    m = (low + high) / 2;
    const f = npv(m);
    if (Math.abs(f) < 0.01) break;
    if (f > 0) {
      low = m;
      fLow = f;
    } else {
      high = m;
      fHigh = f;
    }
  }

  return (Math.pow(1 + m, 12) - 1) * 100;
}

export function calculateSavings(withExtra: ScheduleResult, base: ScheduleResult): {
  interestSaved: number;
  feeSaved: number;
  monthsSaved: number;
} {
  return {
    interestSaved: Math.max(0, base.totalInterest - withExtra.totalInterest),
    feeSaved: Math.max(0, base.totalFee - withExtra.totalFee),
    monthsSaved: Math.max(0, base.termActual - withExtra.termActual),
  };
}

export function toCSV(rows: ScheduleRow[]): string {
  const header = ['№', 'Дата', 'Платёж', 'Проценты', 'Тело', 'Досрочное', 'Комиссия', 'Остаток'];
  const lines = [header.join(';')];
  for (const r of rows) {
    lines.push(
      [
        r.month,
        formatDate(r.date),
        r.payment.toFixed(2),
        r.interest.toFixed(2),
        r.principal.toFixed(2),
        r.extra.toFixed(2),
        r.fee.toFixed(2),
        r.balance.toFixed(2),
      ].join(';')
    );
  }
  return '\uFEFF' + lines.join('\r\n');
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function defaultParams(): LoanParams {
  const today = new Date();
  return {
    amount: 5000000,
    currency: 'KZT',
    termMonths: 60,
    rate: 19.5,
    repayment: 'annuity',
    firstPaymentDate: addMonths(today, 1),
    oneTimeFee: 0,
    oneTimeFeeUnit: 'amount',
    monthlyFee: 0,
    monthlyFeeMode: 'abs',
    extras: [],
  };
}
