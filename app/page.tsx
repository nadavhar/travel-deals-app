'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  filterDeals,
  RAW_DEALS,
  BUDGET_LIMITS,
  CATEGORY_COLORS,
  CATEGORY_ACCENT,
  type Category,
  type Deal,
} from '@/lib/deals';
import { getLocationImage, LOCATION_IMAGE_MAP } from '@/lib/locationImages';

// ─── Filter once at module level ─────────────────────────────────────────────
const { validDeals } = filterDeals(RAW_DEALS);

// ─── Translations ─────────────────────────────────────────────────────────────
type Lang = 'HE' | 'EN';

const T = {
  HE: {
    appName:      'צייד הדילים',
    switchLang:   'EN',
    all:          'הכל',
    vacation:     'חופשה',
    suite:        'סוויטה',
    penthouse:    'פנטהאוז',
    villa:        'וילה',
    noDeals:      'לא נמצאו דילים',
    noDealsHint:  'נסה לבחור קטגוריה אחרת',
    perNight:     '/ לילה',
    limitLabel:   'מגבלה',
    savings:      'חיסכון',
    bookNow:      'להזמנה',
    footerTagline:'חופשה חכמה · ישראל בלבד',
    budgets: [
      { label: '🏨 ≤ 450 ₪',   cls: 'bg-sky-900/60 text-sky-300' },
      { label: '🛏️ ≤ 450 ₪',  cls: 'bg-purple-900/60 text-purple-300' },
      { label: '🌆 ≤ 990 ₪',   cls: 'bg-amber-900/60 text-amber-300' },
      { label: '🏡 ≤ 1,990 ₪', cls: 'bg-emerald-900/60 text-emerald-300' },
    ],
  },
  EN: {
    appName:      'Deal Hunter',
    switchLang:   'HE',
    all:          'All',
    vacation:     'Vacation',
    suite:        'Suite',
    penthouse:    'Penthouse',
    villa:        'Villa',
    noDeals:      'No deals found',
    noDealsHint:  'Try a different category',
    perNight:     '/ night',
    limitLabel:   'Limit',
    savings:      'savings',
    bookNow:      'Book Now',
    footerTagline:'Smart vacations · Israel only',
    budgets: [
      { label: '🏨 ≤ ₪450',   cls: 'bg-sky-900/60 text-sky-300' },
      { label: '🛏️ ≤ ₪450',  cls: 'bg-purple-900/60 text-purple-300' },
      { label: '🌆 ≤ ₪990',   cls: 'bg-amber-900/60 text-amber-300' },
      { label: '🏡 ≤ ₪1,990', cls: 'bg-emerald-900/60 text-emerald-300' },
    ],
  },
} satisfies Record<Lang, unknown>;

// ─── Per-category design tokens ───────────────────────────────────────────────
const CAT_PRICE: Record<Category, string> = {
  vacation:  'text-sky-600',
  suite:     'text-purple-600',
  penthouse: 'text-amber-600',
  villa:     'text-emerald-600',
};
const CAT_RING: Record<Category, string> = {
  vacation:  'sm:hover:ring-sky-200',
  suite:     'sm:hover:ring-purple-200',
  penthouse: 'sm:hover:ring-amber-200',
  villa:     'sm:hover:ring-emerald-200',
};

// ─── Filter tab definitions (static ids/emojis; labels come from T) ───────────
const FILTER_TABS: Array<{ id: string; emoji: string; category: Category | null }> = [
  { id: 'all',       emoji: '✨', category: null },
  { id: 'vacation',  emoji: '🏨', category: 'vacation' },
  { id: 'suite',     emoji: '🛏️', category: 'suite' },
  { id: 'penthouse', emoji: '🌆', category: 'penthouse' },
  { id: 'villa',     emoji: '🏡', category: 'villa' },
];

const FALLBACK_IMG = LOCATION_IMAGE_MAP['default'];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lang, setLang] = useState<Lang>('HE');

  const t = T[lang];

  // Map tab id → translated label
  const tabLabel: Record<string, string> = {
    all:       t.all,
    vacation:  t.vacation,
    suite:     t.suite,
    penthouse: t.penthouse,
    villa:     t.villa,
  };

  // Map category → translated label (for card badges)
  const catLabel: Record<Category, string> = {
    vacation:  t.vacation,
    suite:     t.suite,
    penthouse: t.penthouse,
    villa:     t.villa,
  };

  const filteredDeals =
    activeFilter === 'all'
      ? validDeals
      : validDeals.filter((d) => d.category === activeFilter);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ══════════════════════════════════════════════════ STICKY HEADER */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">

        {/* ── App Bar ─────────────────────────────────────────────────────── */}
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">

          {/* Left: language switcher — shows what you'll switch TO */}
          <button
            onClick={() => setLang((l) => (l === 'HE' ? 'EN' : 'HE'))}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200"
            aria-label="Switch language"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            <span>{t.switchLang}</span>
          </button>

          {/* Right: Logo */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-gray-900">
              {t.appName}
            </span>
            <span className="text-2xl leading-none">🏖️</span>
          </div>
        </div>

        {/* ── Filter tabs ──────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100">
          <div className="mx-auto max-w-5xl">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto px-5 py-2.5">
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.category === null
                    ? validDeals.length
                    : validDeals.filter((d) => d.category === tab.category).length;
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="leading-none">{tab.emoji}</span>
                    <span>{tabLabel[tab.id]}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs font-bold leading-none ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ DEAL GRID */}
      <div className="mx-auto max-w-5xl">
        {filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <div className="mb-5 text-7xl">🔍</div>
            <p className="text-xl font-bold text-gray-700">{t.noDeals}</p>
            <p className="mt-2 text-sm text-gray-400">{t.noDealsHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-3 lg:gap-5 lg:p-5">
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                t={{ perNight: t.perNight, limitLabel: t.limitLabel, savings: t.savings, bookNow: t.bookNow }}
                catLabel={catLabel}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ FOOTER */}
      <footer className="mt-10 bg-gray-900 px-4 pb-10 pt-12 text-center">
        <p className="text-3xl">🏖️</p>
        <p className="mt-3 font-black text-white">{t.appName}</p>
        <p className="mt-1 text-xs text-gray-500">{t.footerTagline}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
          {t.budgets.map((b) => (
            <span key={b.label} className={`rounded-full px-3 py-1.5 font-semibold ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL CARD
// ─────────────────────────────────────────────────────────────────────────────
type CardT = { perNight: string; limitLabel: string; savings: string; bookNow: string };

function DealCard({
  deal,
  t,
  catLabel,
}: {
  deal: Deal;
  t: CardT;
  catLabel: Record<Category, string>;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc]       = useState(() => getLocationImage(deal.location));

  const limit      = BUDGET_LIMITS[deal.category];
  const savings    = limit - deal.price_per_night_ils;
  const savingsPct = Math.round((savings / limit) * 100);

  return (
    <article
      className={`group overflow-hidden bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300
        sm:rounded-2xl sm:hover:-translate-y-1 sm:hover:shadow-xl sm:hover:ring-2
        ${CAT_RING[deal.category]}`}
    >
      {/* ── Photo — badges only ────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100">

        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        <Image
          src={imgSrc}
          alt={deal.location}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (imgSrc !== FALLBACK_IMG) setImgSrc(FALLBACK_IMG);
            setImgLoaded(true);
          }}
        />

        <div className={`absolute inset-x-0 top-0 h-[3px] ${CATEGORY_ACCENT[deal.category]}`} />

        {/* RTL: first child → right side, second child → left side */}
        <div className="absolute inset-x-0 top-3 flex items-center justify-between px-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${CATEGORY_COLORS[deal.category]}`}>
            {catLabel[deal.category]}
          </span>
          {savingsPct > 0 && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white shadow-sm">
              {savingsPct}% {t.savings}
            </span>
          )}
        </div>
      </div>

      {/* ── White card body ────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3">

        {/* Row 1 — Property name */}
        <h2 className="mb-1 line-clamp-1 text-[15px] font-bold leading-snug text-gray-900">
          {deal.property_name}
        </h2>

        {/* Row 2 — Location */}
        <div className="mb-2.5 flex items-center gap-1 text-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-gray-400">
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span className="line-clamp-1">{deal.location}</span>
        </div>

        {/* Row 3 — Description */}
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {deal.description}
        </p>

        {/* Row 4 — Price + CTA */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">

          {/* Price block */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${CAT_PRICE[deal.category]}`}>
                {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
              </span>
              <span className="text-xs text-gray-400">{t.perNight}</span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400 line-through decoration-gray-300">
              {t.limitLabel} {limit.toLocaleString('he-IL')} ₪
            </p>
          </div>

          {/* CTA */}
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md active:scale-[0.97] active:shadow-none"
          >
            {t.bookNow}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5 opacity-70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
