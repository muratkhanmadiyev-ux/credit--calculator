import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'ru' | 'kk';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  comparison: string;
  comparisonShort: string;
  languageLabel: string;

  // Scenarios
  scenarioA: string;
  scenarioB: string;

  // Input panel
  copyToB: string;
  reset: string;
  loanAmount: string;
  loanAmountHint: string;
  term: string;
  termHint: string;
  rate: string;
  rateHint: string;
  repaymentType: string;
  repaymentHint: string;
  annuity: string;
  annuityHint: string;
  differential: string;
  differentialHint: string;
  firstPayment: string;
  firstPaymentHint: string;
  feesAndInsurance: string;
  oneTimeFee: string;
  monthlyFee: string;
  earlyRepayment: string;
  earlyRepaymentHint: string;
  paymentNumber: string;
  amount: string;
  fromMonth: string;
  frequency: string;
  applyTo: string;
  once: string;
  monthly: string;
  yearly: string;
  reduceTerm: string;
  reducePayment: string;
  addPayment: string;
  duplicate: string;
  delete: string;
  monthsShort: string;
  yearsShort: string;
  feeAbs: string;
  feePct: string;
  feeRem: string;
  feeRemy: string;

  // Summary cards
  monthlyPayment: string;
  monthlyPaymentFixed: string;
  overpayment: string;
  overpaymentFromAmount: string;
  termLabel: string;
  untilDate: string;
  effectiveRate: string;
  withFees: string;
  paymentStructure: string;
  loanBody: string;
  interest: string;
  fees: string;

  // Chart
  paymentComposition: string;
  balanceRemaining: string;
  payments: string;
  balance: string;
  notEnoughData: string;
  monthShort: string;
  paymentLabel: string;
  body: string;
  earlyLabel: string;
  feeLabel: string;

  // Table
  schedule: string;
  exportCSV: string;
  number: string;
  date: string;
  extra: string;
  collapse: string;
  showAllRows: string;

  // Comparison
  comparisonTitle: string;
  savingsOnInterest: string;
  termShorterBy: string;
  difference: string;
  equal: string;
  overpaymentByScenario: string;
  effectiveRateShort: string;

  // How it works
  howItWorks: string;
  faq: { q: string; a: string }[];

  // Footer
  disclaimer: string;

  // Term units
  year: string;
  yearPlural: string;
  yearsPlural: string;
  month: string;
  monthPlural: string;
  monthsPlural: string;
  zeroMonths: string;

  // CSV
  csvNumber: string;
  csvDate: string;
  csvPayment: string;
  csvInterest: string;
  csvBody: string;
  csvEarly: string;
  csvFee: string;
  csvBalance: string;
  csvFilename: string;
}

const ru: Translations = {
  appTitle: 'Кредитный калькулятор',
  appSubtitle: 'Аннуитет, дифференцированный платёж, досрочное погашение',
  comparison: 'Сравнение',
  comparisonShort: 'Сравн.',
  languageLabel: 'Қаз',

  scenarioA: 'Сценарий А',
  scenarioB: 'Сценарий Б',

  copyToB: 'Скопировать параметры в сценарий Б',
  reset: 'Сбросить',
  loanAmount: 'Сумма кредита',
  loanAmountHint: 'Сумма, которую вы берёте в кредит.',
  term: 'Срок кредита',
  termHint: 'На какой срок вы берёте кредит.',
  rate: 'Ставка',
  rateHint: 'Годовая номинальная ставка по кредиту.',
  repaymentType: 'Тип платежа',
  repaymentHint: 'Аннуитет — равные платежи. Дифференцированный — тело равными долями, проценты уменьшаются.',
  annuity: 'Аннуитетный',
  annuityHint: 'Равные платежи каждый месяц',
  differential: 'Дифференц.',
  differentialHint: 'Тело равными долями, проценты падают',
  firstPayment: 'Первый платёж',
  firstPaymentHint: 'Дата первого платежа по графику.',
  feesAndInsurance: 'Комиссии и страховки',
  oneTimeFee: 'Единоразовая комиссия',
  monthlyFee: 'Ежемесячная комиссия',
  earlyRepayment: 'Досрочное погашение',
  earlyRepaymentHint: 'Добавьте досрочные платежи, чтобы увидеть, как они сокращают срок и переплату.',
  paymentNumber: 'Платёж',
  amount: 'Сумма',
  fromMonth: 'С какого месяца',
  frequency: 'Периодичность',
  applyTo: 'Применить к',
  once: 'Разово',
  monthly: 'Ежемесячно',
  yearly: 'Ежегодно',
  reduceTerm: 'Срок ↓',
  reducePayment: 'Платёж ↓',
  addPayment: 'Добавить платёж',
  duplicate: 'Дублировать',
  delete: 'Удалить',
  monthsShort: 'мес',
  yearsShort: 'лет',
  feeAbs: '₽ / мес',
  feePct: '% / год от суммы',
  feeRem: '% / год от остатка',
  feeRemy: '% / мес от остатка',

  monthlyPayment: 'Ежемесячный платёж',
  monthlyPaymentFixed: 'фиксированный',
  overpayment: 'Переплата',
  overpaymentFromAmount: '% от суммы',
  termLabel: 'Срок',
  untilDate: 'до',
  effectiveRate: 'Эффективная ставка',
  withFees: 'с учётом комиссий',
  paymentStructure: 'Структура выплат',
  loanBody: 'Тело кредита',
  interest: 'Проценты',
  fees: 'Комиссии',

  paymentComposition: 'Структура платежа',
  balanceRemaining: 'Остаток долга',
  payments: 'Платежи',
  balance: 'Остаток',
  notEnoughData: 'Недостаточно данных для графика',
  monthShort: 'мес.',
  paymentLabel: 'Платёж',
  body: 'Тело',
  earlyLabel: 'Досрочное',
  feeLabel: 'Комиссия',

  schedule: 'График платежей',
  exportCSV: 'Экспорт CSV',
  number: '№',
  date: 'Дата',
  extra: 'Доп.',
  collapse: 'Свернуть',
  showAllRows: 'Показать все {n} строк',

  comparisonTitle: 'Сравнение сценариев',
  savingsOnInterest: 'Экономия на процентах и комиссиях',
  termShorterBy: 'Срок короче на',
  difference: 'разница',
  equal: 'равно',
  overpaymentByScenario: 'Переплата по сценариям',
  effectiveRateShort: 'Эфф. ставка',

  howItWorks: 'Как это работает',
  faq: [
    {
      q: 'Чем аннуитетный платёж отличается от дифференцированного?',
      a: 'При аннуитете вы платите одинаковую сумму каждый месяц — сначала большую часть составляют проценты, потом тело. При дифференцированном платеже тело долга гасится равными долями, а проценты начисляются на остаток — поэтому платёж постепенно уменьшается. Дифференцированный платёж обычно даёт меньшую переплату, но первая выплата выше.',
    },
    {
      q: 'Что такое эффективная ставка и почему она выше номинальной?',
      a: 'Эффективная ставка учитывает не только проценты, но и все комиссии — единоразовые и ежемесячные. Она показывает реальную стоимость кредита: если банк берёт комиссию за выдачу, вы получаете на руки меньше, а возвращаете полную сумму с процентами, поэтому реальная стоимость денег выше.',
    },
    {
      q: 'Как досрочное погашение сокращает срок или платёж?',
      a: 'При погашении «в уменьшение срока» вы продолжаете платить тот же ежемесячный платёж, но кредит закрывается раньше — вы экономите на процентах за оставшиеся месяцы. При погашении «в уменьшение платежа» срок остаётся прежним, но банк пересчитывает платёж в меньшую сторону. Сокращение срока выгоднее, так как проценты начисляются на остаток, который падает быстрее.',
    },
    {
      q: 'Как рассчитывается процентная часть каждого платежа?',
      a: 'Каждый месяц банк начисляет проценты на текущий остаток долга по формуле: Остаток × (Годовая ставка / 12). В начале срока остаток максимален, поэтому проценты — наибольшая часть платежа. По мере погашения тела остаток уменьшается, и процентная часть падает.',
    },
    {
      q: 'Что такое единоразовая и ежемесячная комиссии?',
      a: 'Единоразовая комиссия — это платёж при выдаче кредита (например, за рассмотрение заявки или страховка). Ежемесячная — может быть фиксированной суммой, процентом от исходной суммы кредита или от остатка долга. Все комиссии увеличивают реальную стоимость кредита и учитываются в эффективной ставке.',
    },
    {
      q: 'Как работает сравнение сценариев?',
      a: 'Вы можете настроить два варианта кредита (например, с досрочным погашением и без) и сравнить их рядом. Калькулятор покажет разницу в переплате, сроке, размере платежа и эффективной ставке, а также посчитает экономию, если один сценарий выгоднее другого.',
    },
  ],

  disclaimer:
    'Результаты расчёта носят справочный характер и не являются публичной офертой. Точные условия определяет банк при выдаче кредита.',

  year: 'год',
  yearPlural: 'года',
  yearsPlural: 'лет',
  month: 'месяц',
  monthPlural: 'месяца',
  monthsPlural: 'месяцев',
  zeroMonths: '0 месяцев',

  csvNumber: '№',
  csvDate: 'Дата',
  csvPayment: 'Платёж',
  csvInterest: 'Проценты',
  csvBody: 'Тело',
  csvEarly: 'Досрочное',
  csvFee: 'Комиссия',
  csvBalance: 'Остаток',
  csvFilename: 'grafik-platezhey.csv',
};

const kk: Translations = {
  appTitle: 'Несиелік калькулятор',
  appSubtitle: 'Аннуитет, дифференциалды төлем, мерзімінен бұрын өтеу',
  comparison: 'Салыстыру',
  comparisonShort: 'Салыст.',
  languageLabel: 'Рус',

  scenarioA: 'Сценарий А',
  scenarioB: 'Сценарий Ә',

  copyToB: 'Параметрлерді Ә сценарийіне көшіру',
  reset: 'Қалпына келтіру',
  loanAmount: 'Несие сомасы',
  loanAmountHint: 'Сіз несиеге алатын сома.',
  term: 'Несие мерзімі',
  termHint: 'Несиені қанша мерзімге алатыныңыз.',
  rate: 'Мөлшерлеме',
  rateHint: 'Жылдық номиналды мөлшерлеме.',
  repaymentType: 'Төлем түрі',
  repaymentHint: 'Аннуитет — тең төлемдер. Дифференциалды — негізгі қарыз тең үлестермен, пайыздар азаяды.',
  annuity: 'Аннуитеттік',
  annuityHint: 'Ай сайын тең төлемдер',
  differential: 'Сараланған',
  differentialHint: 'Негізгі қарыз тең үлестермен, пайыздар төмендейді',
  firstPayment: 'Алғашқы төлем',
  firstPaymentHint: 'Кесте бойынша алғашқы төлем күні.',
  feesAndInsurance: 'Комиссиялар және сақтандыру',
  oneTimeFee: 'Бір реттік комиссия',
  monthlyFee: 'Айлық комиссия',
  earlyRepayment: 'Мерзімінен бұрын өтеу',
  earlyRepaymentHint: 'Мерзімінен бұрынғы төлемдерді қосыңыз, олар мерзім мен қайта төлемді қалай қысқартатынын көресіз.',
  paymentNumber: 'Төлем',
  amount: 'Сома',
  fromMonth: 'Қай айдан бастап',
  frequency: 'Жиілігі',
  applyTo: 'Қолдану',
  once: 'Бір рет',
  monthly: 'Ай сайын',
  yearly: 'Жыл сайын',
  reduceTerm: 'Мерзім ↓',
  reducePayment: 'Төлем ↓',
  addPayment: 'Төлем қосу',
  duplicate: 'Көшіру',
  delete: 'Жою',
  monthsShort: 'ай',
  yearsShort: 'жыл',
  feeAbs: '₸ / ай',
  feePct: '% / жыл сомадан',
  feeRem: '% / жыл қалдықтан',
  feeRemy: '% / ай қалдықтан',

  monthlyPayment: 'Айлық төлем',
  monthlyPaymentFixed: 'тұрақты',
  overpayment: 'Артық төлем',
  overpaymentFromAmount: '% сомадан',
  termLabel: 'Мерзім',
  untilDate: 'дейін',
  effectiveRate: 'Тиімді мөлшерлеме',
  withFees: 'комиссияларды есептегенде',
  paymentStructure: 'Төлем құрылымы',
  loanBody: 'Несие денесі',
  interest: 'Пайыздар',
  fees: 'Комиссиялар',

  paymentComposition: 'Төлем құрылымы',
  balanceRemaining: 'Қарыз қалдығы',
  payments: 'Төлемдер',
  balance: 'Қалдық',
  notEnoughData: 'График үшін деректер жеткіліксіз',
  monthShort: 'ай.',
  paymentLabel: 'Төлем',
  body: 'Негізгі қарыз',
  earlyLabel: 'Мерзімінен бұрын',
  feeLabel: 'Комиссия',

  schedule: 'Төлем кестесі',
  exportCSV: 'CSV экспорты',
  number: '№',
  date: 'Күні',
  extra: 'Қос.',
  collapse: 'Жасыру',
  showAllRows: 'Барлық {n} жолды көрсету',

  comparisonTitle: 'Сценарийлерді салыстыру',
  savingsOnInterest: 'Пайыздар мен комиссиялардан үнемдеу',
  termShorterBy: 'Мерзім қысқа',
  difference: 'айырма',
  equal: 'тең',
  overpaymentByScenario: 'Сценарийлер бойынша қайта төлем',
  effectiveRateShort: 'Тиімді мөлш.',

  howItWorks: 'Бұл қалай жұмыс істейді',
  faq: [
    {
      q: 'Аннуитеттік төлем мен сараланған төлемнің айырмашылығы неде?',
      a: 'Аннуитетте сіз ай сайын бірдей сома төлейсіз — алдымен пайыздар үлкен бөлікті құрайды, содан кейін дене. Дифференциалды төлемде қарыз денесі тең үлестермен өтеледі, ал пайыздар қалдыққа есептеледі — сондықтан төлем біртіндеп азаяды. Дифференциалды төлем әдетте аздаған қайта төлем береді, бірақ алғашқы төлем жоғарырақ.',
    },
    {
      q: 'Тиімді мөлшерлеме дегеніміз не және ол неліктен номиналдан жоғары?',
      a: 'Тиімді мөлшерлеме тек пайыздарды ғана емес, барлық комиссияларды — бір реттік және айлық — есептейді. Ол несиенің нақты құнын көрсетеді: егер банк беру үшін комиссия алса, сіз қолға аз аласыз, ал толық соманы пайыздармен қайта төлейсіз, сондықтан ақшаның нақты құны жоғарырақ.',
    },
    {
      q: 'Мерзімінен бұрын өтеу мерзімді немесе төлемді қалай қысқартады?',
      a: '«Мерзімді қысқарту» тәсілімен төлегенде сіз бұрынғы айлық төлемді төлеуді жалғастырасыз, бірақ несие ертерек жабылады — қалған айлар үшін пайыздардан үнемдейсіз. «Төлемді қысқарту» тәсілімен мерзім өзгермейді, бірақ банк төлемді азайтады. Мерзімді қысқарту тиімдірек, өйткені пайыздар тезірек төмендейтін қалдыққа есептеледі.',
    },
    {
      q: 'Әр төлемнің пайыздық бөлігі қалай есептеледі?',
      a: 'Ай сайын банк ағымдағы қарыз қалдығына пайыздарды есептейді: Қалдық × (Жылдық мөлшерлеме / 12). Мерзім басында қалдық ең үлкен, сондықтан пайыздар — төлемнің ең үлкен бөлігі. Негізгі қарыз өтелген сайын қалдық азаяды, пайыздық бөлік төмендейді.',
    },
    {
      q: 'Бір реттік және айлық комиссиялар дегеніміз не?',
      a: 'Бір реттік комиссия — несие беру кезіндегі төлем (мысалы, өтінішті қарау немесе сақтандыру). Айлық — тұрақты сома, несие сомасының пайызы немесе қарыз қалдығының пайызы болуы мүмкін. Барлық комиссиялар несиенің нақты құнын арттырады және тиімді мөлшерлемеге есептеледі.',
    },
    {
      q: 'Сценарийлерді салыстыру қалай жұмыс істейді?',
      a: 'Несиенің екі нұсқасын (мысалы, мерзімінен бұрын өтеумен және онсыз) реттеп, қатар салыстыра аласыз. Калькулятор қайта төлем, мерзім, төлем мөлшері және тиімді мөлшерлеме бойынша айырманы көрсетеді, сондай-ақ бір сценарий екіншісінен тиімді болса, үнемдеуді есептейді.',
    },
  ],

  disclaimer:
    'Есептеу нәтижелері ақпараттық сипатта болып, жарияланған ұсыныс емес. Нақты шарттарды несие беру кезінде банк анықтайды.',

  year: 'жыл',
  yearPlural: 'жыл',
  yearsPlural: 'жыл',
  month: 'ай',
  monthPlural: 'ай',
  monthsPlural: 'ай',
  zeroMonths: '0 ай',

  csvNumber: '№',
  csvDate: 'Күні',
  csvPayment: 'Төлем',
  csvInterest: 'Пайыздар',
  csvBody: 'Негізгі қарыз',
  csvEarly: 'Мерзімінен бұрын',
  csvFee: 'Комиссия',
  csvBalance: 'Қалдық',
  csvFilename: 'tolem-kestesi.csv',
};

const translations: Record<Lang, Translations> = { ru, kk };

interface I18nContextValue {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru');
  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ru' ? 'kk' : 'ru'));
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function getTermForms(lang: Lang): [string, string, string] {
  const t = translations[lang];
  return [t.year, t.yearPlural, t.yearsPlural];
}

export function getMonthForms(lang: Lang): [string, string, string] {
  const t = translations[lang];
  return [t.month, t.monthPlural, t.monthsPlural];
}

export function getLocale(lang: Lang): string {
  return lang === 'ru' ? 'ru-RU' : 'kk-KZ';
}
