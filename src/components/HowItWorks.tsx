import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function HowItWorks() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-primary-600" />
        <h3 className="text-base font-display font-bold text-neutral-900">{t.howItWorks}</h3>
      </div>

      <div className="space-y-2">
        {t.faq.map((faq, i) => (
          <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden transition-colors">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
            >
              <span className="text-sm font-medium text-neutral-700">{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-4 text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
