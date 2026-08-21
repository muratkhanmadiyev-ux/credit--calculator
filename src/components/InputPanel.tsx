import { useState, useEffect } from 'react';
import {
  Banknote,
  Calendar,
  Percent,
  Repeat,
  Plus,
  Trash2,
  ChevronDown,
  Info,
  X,
  Copy,
  Check,
} from 'lucide-react';
import {
  type LoanParams,
  type ExtraPayment,
  type TermUnit,
  type RepaymentType,
  type FeeUnit,
  type MonthlyFeeMode,
  type ExtraRepeat,
  type ExtraMode,
  CURRENCIES,
  parseAmount,
  formatAmount,
  formatAmountExact,
  addMonths,
} from '@/lib/loan';

interface InputPanelProps {
  params: LoanParams;
  onChange: (patch: Partial<LoanParams>) => void;
  onReset: () => void;
  onDuplicate: () => void;
  scenarioLabel: string;
  scenarioColor: string;
  canDuplicate: boolean;
}

const REPAYMENT_OPTIONS: { value: RepaymentType; label: string; hint: string }[] = [
  { value: 'annuity', label: 'Аннуитетный', hint: 'Равные платежи каждый месяц' },
  { value: 'equal', label: 'Дифференц.', hint: 'Тело равными долями, проценты падают' },
];

const MONTHLY_FEE_MODES: { value: MonthlyFeeMode; label: string }[] = [
  { value: 'abs', label: '₽ / мес' },
  { value: 'pct', label: '% / год от суммы' },
  { value: 'rem', label: '% / год от остатка' },
  { value: 'remy', label: '% / мес от остатка' },
];

const EXTRA_REPEATS: { value: ExtraRepeat; label: string }[] = [
  { value: 'once', label: 'Разово' },
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'yearly', label: 'Ежегодно' },
];

const EXTRA_MODES: { value: ExtraMode; label: string }[] = [
  { value: 'reduce-term', label: 'Срок ↓' },
  { value: 'reduce-payment', label: 'Платёж ↓' },
];

function FieldLabel({ icon, children, hint }: { icon: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-primary-500">{icon}</span>
      <label className="text-sm font-medium text-neutral-700">{children}</label>
      {hint && (
        <span className="group relative ml-auto">
          <Info className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
          <span className="pointer-events-none absolute right-0 top-6 z-20 w-48 p-2 text-xs font-normal text-white bg-neutral-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
            {hint}
          </span>
        </span>
      )}
    </div>
  );
}

function formatValueForDisplay(value: number, precision: number): string {
  if (!value) return '';
  if (precision === 0) return formatAmount(value);
  return formatAmountExact(value);
}

function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  min,
  max,
  step,
  precision = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}) {
  const [text, setText] = useState(() => formatValueForDisplay(value, precision));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    setText(formatValueForDisplay(value, precision));
  }, [value, precision, focused]);

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseAmount(e.target.value));
        }}
        onBlur={() => {
          setFocused(false);
          setText(formatValueForDisplay(value, precision));
        }}
        min={min}
        max={max}
        step={step}
        className={`input-field number-input ${suffix ? 'pr-12' : ''}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-medium pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2
        bg-gradient-to-r from-primary-500 to-primary-500
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500
        [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
        [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
        [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500
        [&::-moz-range-thumb]:cursor-grab"
      style={{ background: `linear-gradient(to right, rgb(37 99 235) 0%, rgb(37 99 235) ${pct}%, rgb(226 232 240) ${pct}%, rgb(226 232 240) 100%)` }}
    />
  );
}

function MiniSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="input-field appearance-none pr-9 cursor-pointer text-sm font-medium"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
    </div>
  );
}

export default function InputPanel({
  params,
  onChange,
  onReset,
  onDuplicate,
  scenarioLabel,
  scenarioColor,
  canDuplicate,
}: InputPanelProps) {
  const [termUnit, setTermUnit] = useState<TermUnit>(params.termMonths % 12 === 0 && params.termMonths >= 12 ? 'years' : 'months');
  const [showFee, setShowFee] = useState(params.oneTimeFee > 0 || params.monthlyFee > 0);
  const [showExtra, setShowExtra] = useState(params.extras.length > 0);
  const [copied, setCopied] = useState(false);

  const termValue = termUnit === 'years' ? params.termMonths / 12 : params.termMonths;

  const setTerm = (v: number, unit: TermUnit) => {
    setTermUnit(unit);
    onChange({ termMonths: unit === 'years' ? Math.round(v * 12) : Math.round(v) });
  };

  const addExtra = () => {
    const newExtra: ExtraPayment = {
      id: crypto.randomUUID(),
      amount: 50000,
      startMonth: 3,
      repeat: 'monthly',
      mode: 'reduce-term',
    };
    onChange({ extras: [...params.extras, newExtra] });
    setShowExtra(true);
  };

  const updateExtra = (id: string, patch: Partial<ExtraPayment>) => {
    onChange({
      extras: params.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  };

  const removeExtra = (id: string) => {
    onChange({ extras: params.extras.filter((e) => e.id !== id) });
  };

  const duplicateExtra = (id: string) => {
    const orig = params.extras.find((e) => e.id === id);
    if (!orig) return;
    const copy: ExtraPayment = { ...orig, id: crypto.randomUUID(), startMonth: orig.startMonth + 1 };
    onChange({ extras: [...params.extras, copy] });
  };

  const handleDuplicate = () => {
    onDuplicate();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card p-5 sm:p-6 space-y-5">
      {/* Scenario badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${scenarioColor}`} />
          <span className="text-sm font-semibold text-neutral-700">{scenarioLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          {canDuplicate && (
            <button
              onClick={handleDuplicate}
              className="btn-ghost !px-2 !py-1.5"
              title="Скопировать параметры в сценарий Б"
            >
              {copied ? <Check className="w-4 h-4 text-success-600" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          <button onClick={onReset} className="btn-ghost !px-2 !py-1.5" title="Сбросить">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <FieldLabel icon={<Banknote className="w-4 h-4" />} hint="Сумма, которую вы берёте в кредит.">
          Сумма кредита
        </FieldLabel>
        <div className="flex gap-2">
          <div className="flex-1">
            <NumberInput
              value={params.amount}
              onChange={(v) => onChange({ amount: v })}
              placeholder="0"
              min={0}
            />
          </div>
          <div className="w-28">
            <MiniSelect
              value={params.currency}
              options={CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
              onChange={(v) => onChange({ currency: v })}
            />
          </div>
        </div>
        <Slider value={Math.min(params.amount, 50000000)} min={10000} max={50000000} step={10000} onChange={(v) => onChange({ amount: v })} />
        <div className="flex justify-between mt-1 text-xs text-neutral-400">
          <span>10 тыс</span>
          <span>50 млн</span>
        </div>
      </div>

      {/* Term */}
      <div>
        <FieldLabel icon={<Calendar className="w-4 h-4" />} hint="На какой срок вы берёте кредит.">
          Срок кредита
        </FieldLabel>
        <div className="flex gap-2">
          <div className="flex-1">
            <NumberInput
              value={termValue}
              onChange={(v) => setTerm(v, termUnit)}
              placeholder="0"
              min={1}
            />
          </div>
          <div className="w-28">
            <MiniSelect
              value={termUnit}
              options={[
                { value: 'months', label: 'мес' },
                { value: 'years', label: 'лет' },
              ]}
              onChange={(v) => {
                const newUnit = v as TermUnit;
                setTermUnit(newUnit);
                if (newUnit === 'years') onChange({ termMonths: Math.round(termValue * 12) });
                else onChange({ termMonths: Math.round(termValue) });
              }}
            />
          </div>
        </div>
        <Slider
          value={termUnit === 'years' ? Math.min(params.termMonths / 12, 30) : Math.min(params.termMonths, 360)}
          min={termUnit === 'years' ? 1 : 1}
          max={termUnit === 'years' ? 30 : 360}
          step={termUnit === 'years' ? 1 : 1}
          onChange={(v) => setTerm(v, termUnit)}
        />
        <div className="flex justify-between mt-1 text-xs text-neutral-400">
          <span>{termUnit === 'years' ? '1 год' : '1 мес'}</span>
          <span>{termUnit === 'years' ? '30 лет' : '360 мес'}</span>
        </div>
      </div>

      {/* Rate */}
      <div>
        <FieldLabel icon={<Percent className="w-4 h-4" />} hint="Годовая номинальная ставка по кредиту.">
          Ставка
        </FieldLabel>
        <NumberInput
          value={params.rate}
          onChange={(v) => onChange({ rate: v })}
          placeholder="0"
          suffix="%"
          min={0}
          max={200}
          step={0.1}
          precision={2}
        />
        <Slider value={Math.min(params.rate, 100)} min={0} max={100} step={0.1} onChange={(v) => onChange({ rate: v })} />
        <div className="flex justify-between mt-1 text-xs text-neutral-400">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Repayment type */}
      <div>
        <FieldLabel icon={<Repeat className="w-4 h-4" />} hint="Аннуитет — равные платежи. Дифференцированный — тело равными долями, проценты уменьшаются.">
          Тип платежа
        </FieldLabel>
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl">
          {REPAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ repayment: opt.value })}
              className={`tab-btn ${params.repayment === opt.value ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              title={opt.hint}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* First payment date */}
      <div>
        <FieldLabel icon={<Calendar className="w-4 h-4" />} hint="Дата первого платежа по графику.">
          Первый платёж
        </FieldLabel>
        <input
          type="date"
          value={params.firstPaymentDate.toISOString().slice(0, 10)}
          onChange={(e) => {
            const d = new Date(e.target.value);
            if (!isNaN(d.getTime())) onChange({ firstPaymentDate: d });
          }}
          className="input-field"
        />
      </div>

      {/* Fees toggle */}
      <div className="pt-1 border-t border-neutral-100">
        <button
          onClick={() => setShowFee(!showFee)}
          className="w-full flex items-center justify-between py-1 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <span>Комиссии и страховки</span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showFee ? 'rotate-180' : ''}`} />
        </button>
        {showFee && (
          <div className="mt-3 space-y-4 animate-fade-in">
            {/* One-time fee */}
            <div>
              <div className="text-xs font-medium text-neutral-500 mb-1.5">Единоразовая комиссия</div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <NumberInput
                    value={params.oneTimeFee}
                    onChange={(v) => onChange({ oneTimeFee: v })}
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div className="w-24">
                  <MiniSelect
                    value={params.oneTimeFeeUnit}
                    options={[
                      { value: 'amount', label: CURRENCIES.find((c) => c.code === params.currency)?.symbol ?? '₸' },
                      { value: 'pct', label: '%' },
                    ]}
                    onChange={(v) => onChange({ oneTimeFeeUnit: v as FeeUnit })}
                  />
                </div>
              </div>
            </div>
            {/* Monthly fee */}
            <div>
              <div className="text-xs font-medium text-neutral-500 mb-1.5">Ежемесячная комиссия</div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <NumberInput
                    value={params.monthlyFee}
                    onChange={(v) => onChange({ monthlyFee: v })}
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div className="w-44">
                  <MiniSelect
                    value={params.monthlyFeeMode}
                    options={MONTHLY_FEE_MODES}
                    onChange={(v) => onChange({ monthlyFeeMode: v as MonthlyFeeMode })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Extra payments toggle */}
      <div className="pt-1 border-t border-neutral-100">
        <button
          onClick={() => setShowExtra(!showExtra)}
          className="w-full flex items-center justify-between py-1 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <span>Досрочное погашение</span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${showExtra ? 'rotate-180' : ''}`} />
        </button>
        {showExtra && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {params.extras.length === 0 && (
              <p className="text-xs text-neutral-400 leading-relaxed">
                Добавьте досрочные платежи, чтобы увидеть, как они сокращают срок и переплату.
              </p>
            )}
            {params.extras.map((ex, idx) => (
              <div key={ex.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5 animate-scale-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">Платёж #{idx + 1}</span>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => duplicateExtra(ex.id)} className="btn-ghost !px-1.5 !py-1" title="Дублировать">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeExtra(ex.id)} className="btn-ghost !px-1.5 !py-1 hover:text-error-600" title="Удалить">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] text-neutral-400 mb-1">Сумма</div>
                    <NumberInput
                      value={ex.amount}
                      onChange={(v) => updateExtra(ex.id, { amount: v })}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400 mb-1">С какого месяца</div>
                    <NumberInput
                      value={ex.startMonth}
                      onChange={(v) => updateExtra(ex.id, { startMonth: Math.max(1, Math.round(v)) })}
                      placeholder="1"
                      min={1}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] text-neutral-400 mb-1">Периодичность</div>
                    <MiniSelect
                      value={ex.repeat}
                      options={EXTRA_REPEATS}
                      onChange={(v) => updateExtra(ex.id, { repeat: v as ExtraRepeat })}
                    />
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400 mb-1">Применить к</div>
                    <MiniSelect
                      value={ex.mode}
                      options={EXTRA_MODES}
                      onChange={(v) => updateExtra(ex.id, { mode: v as ExtraMode })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addExtra} className="btn-outline w-full">
              <Plus className="w-4 h-4" />
              Добавить платёж
            </button>
          </div>
        )}
      </div>

      {/* Quick date adjust hint */}
      <div className="pt-1 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-400">
        <Calendar className="w-3.5 h-3.5" />
        <span>Первый платёж: {addMonths(params.firstPaymentDate, 0).toLocaleDateString('ru-RU')}</span>
      </div>
    </div>
  );
}
