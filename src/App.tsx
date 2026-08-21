import { useState, useMemo, useCallback } from 'react';
import { Calculator, GitCompareArrows, Sparkles, Info } from 'lucide-react';
import {
  type LoanParams,
  type ScheduleResult,
  calculateSchedule,
  defaultParams,
  CURRENCIES,
} from '@/lib/loan';
import InputPanel from '@/components/InputPanel';
import SummaryCards, { TotalsBar } from '@/components/SummaryCards';
import PaymentChart from '@/components/PaymentChart';
import ScheduleTable from '@/components/ScheduleTable';
import ComparisonPanel from '@/components/ComparisonPanel';
import HowItWorks from '@/components/HowItWorks';

type Scenario = 'A' | 'B';

export default function App() {
  const [paramsA, setParamsA] = useState<LoanParams>(defaultParams());
  const [paramsB, setParamsB] = useState<LoanParams>(() => ({
    ...defaultParams(),
    extras: [
      {
        id: crypto.randomUUID(),
        amount: 100000,
        startMonth: 6,
        repeat: 'monthly',
        mode: 'reduce-term',
      },
    ],
  }));
  const [active, setActive] = useState<Scenario>('A');
  const [showComparison, setShowComparison] = useState(true);

  const resultA = useMemo(() => calculateSchedule(paramsA), [paramsA]);
  const resultB = useMemo(() => calculateSchedule(paramsB), [paramsB]);

  const activeParams = active === 'A' ? paramsA : paramsB;
  const activeResult = active === 'A' ? resultA : resultB;

  const updateActive = useCallback(
    (patch: Partial<LoanParams>) => {
      if (active === 'A') setParamsA((p) => ({ ...p, ...patch }));
      else setParamsB((p) => ({ ...p, ...patch }));
    },
    [active]
  );

  const resetActive = useCallback(() => {
    if (active === 'A') setParamsA(defaultParams());
    else setParamsB({ ...defaultParams(), extras: [] });
  }, [active]);

  const duplicateAToB = useCallback(() => {
    setParamsB({ ...paramsA, extras: paramsA.extras.map((e) => ({ ...e, id: crypto.randomUUID() })) });
    setActive('B');
  }, [paramsA]);

  const currencySymbol = CURRENCIES.find((c) => c.code === activeParams.currency)?.symbol ?? '₸';

  const baseResult = active === 'A' ? resultA : resultB;
  const altResult = active === 'A' ? resultB : resultA;
  const baseLabel = active === 'A' ? 'Сценарий А' : 'Сценарий Б';
  const altLabel = active === 'A' ? 'Сценарий Б' : 'Сценарий А';
  const baseColor = active === 'A' ? 'text-primary-600' : 'text-accent-600';
  const altColor = active === 'A' ? 'text-accent-600' : 'text-primary-600';
  const baseDot = active === 'A' ? 'bg-primary-500' : 'bg-accent-500';
  const altDot = active === 'A' ? 'bg-accent-500' : 'bg-primary-500';

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-display font-bold text-neutral-900 leading-tight">
                Кредитный калькулятор
              </h1>
              <p className="text-xs text-neutral-400 leading-tight hidden sm:block">
                Аннуитет, дифференцированный платёж, досрочное погашение
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`btn-outline text-xs sm:text-sm ${showComparison ? '!border-primary-300 !text-primary-700 !bg-primary-50' : ''}`}
          >
            <GitCompareArrows className="w-4 h-4" />
            <span className="hidden sm:inline">Сравнение</span>
            <span className="sm:hidden">Сравн.</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
          {/* Left: Inputs */}
          <div className="lg:sticky lg:top-[68px] lg:self-start space-y-3">
            {/* Scenario switcher */}
            <div className="flex gap-1 p-1 bg-white rounded-xl shadow-card border border-neutral-200/70">
              <button
                onClick={() => setActive('A')}
                className={`tab-btn ${active === 'A' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${active === 'A' ? 'bg-primary-500' : 'bg-neutral-300'}`} />
                  Сценарий А
                </span>
              </button>
              <button
                onClick={() => setActive('B')}
                className={`tab-btn ${active === 'B' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${active === 'B' ? 'bg-accent-500' : 'bg-neutral-300'}`} />
                  Сценарий Б
                </span>
              </button>
            </div>

            <InputPanel
              params={activeParams}
              onChange={updateActive}
              onReset={resetActive}
              onDuplicate={duplicateAToB}
              scenarioLabel={active === 'A' ? 'Сценарий А' : 'Сценарий Б'}
              scenarioColor={active === 'A' ? 'bg-primary-500' : 'bg-accent-500'}
              canDuplicate={active === 'A'}
            />
          </div>

          {/* Right: Results */}
          <div className="space-y-5 min-w-0">
            <SummaryCards result={activeResult} params={activeParams} currencySymbol={currencySymbol} />

            <TotalsBar result={activeResult} currencySymbol={currencySymbol} />

            <PaymentChart result={activeResult} currencySymbol={currencySymbol} />

            {showComparison && (
              <ComparisonPanel
                base={baseResult}
                alt={altResult}
                currencySymbol={currencySymbol}
                baseLabel={baseLabel}
                altLabel={altLabel}
                baseColor={baseDot}
                altColor={altDot}
              />
            )}

            <ScheduleTable result={activeResult} currencySymbol={currencySymbol} />

            <HowItWorks />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Info className="w-3.5 h-3.5" />
            <p>
              Результаты расчёта носят справочный характер и не являются публичной офертой. Точные условия
              определяет банк при выдаче кредита.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
