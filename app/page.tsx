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
import { getLocationImage, getLocationKey, LOCATION_IMAGE_MAP } from '@/lib/locationImages';

// ─── Filter once at module level ─────────────────────────────────────────────
const { validDeals } = filterDeals(RAW_DEALS);

// ─── Pre-compute one image per deal using sequential per-location slots ───────
// Each location group cycles through its pool: deal 1→slot 0, deal 2→slot 1, …
// This guarantees variety without any randomness (stable on SSR + hydration).
const DEAL_IMAGES: Map<number, string> = (() => {
  const map = new Map<number, string>();
  const counters = new Map<string, number>();
  for (const deal of validDeals) {
    const key = getLocationKey(deal.location);
    const slot = counters.get(key) ?? 0;
    map.set(deal.id, getLocationImage(deal.location, slot));
    counters.set(key, slot + 1);
  }
  return map;
})();

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
// CTA: category gradient buttons
const CAT_CTA: Record<Category, string> = {
  vacation:  'from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500',
  suite:     'from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500',
  penthouse: 'from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400',
  villa:     'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500',
};
// Active filter tab: category-specific colour
const TAB_ACTIVE: Record<string, string> = {
  all:       'bg-slate-900 shadow-slate-900/20',
  vacation:  'bg-sky-600 shadow-sky-600/20',
  suite:     'bg-purple-600 shadow-purple-600/20',
  penthouse: 'bg-amber-500 shadow-amber-500/20',
  villa:     'bg-emerald-600 shadow-emerald-600/20',
};

// ─── Filter tab definitions ────────────────────────────────────────────────────
const FILTER_TABS: Array<{ id: string; emoji: string; category: Category | null }> = [
  { id: 'all',       emoji: '✨', category: null },
  { id: 'vacation',  emoji: '🏨', category: 'vacation' },
  { id: 'suite',     emoji: '🛏️', category: 'suite' },
  { id: 'penthouse', emoji: '🌆', category: 'penthouse' },
  { id: 'villa',     emoji: '🏡', category: 'villa' },
];

const FALLBACK_IMG = LOCATION_IMAGE_MAP['default'][0];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lang, setLang] = useState<Lang>('HE');

  const t = T[lang];

  const tabLabel: Record<string, string> = {
    all: t.all, vacation: t.vacation, suite: t.suite,
    penthouse: t.penthouse, villa: t.villa,
  };
  const catLabel: Record<Category, string> = {
    vacation: t.vacation, suite: t.suite,
    penthouse: t.penthouse, villa: t.villa,
  };

  const filteredDeals =
    activeFilter === 'all'
      ? validDeals
      : validDeals.filter((d) => d.category === activeFilter);

  return (
    <main className="min-h-screen bg-[#f8f9fb]">

      {/* ══════════════════════════════════════════════════ STICKY HEADER */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">

        {/* ── Premium top accent bar ───────────────────────────────────────── */}
        <div className="h-[3px] bg-gradient-to-r from-sky-400 via-purple-400 via-60% to-emerald-400" />

        {/* ── App Bar ─────────────────────────────────────────────────────── */}
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">

          {/* Left: language switcher */}
          <button
            onClick={() => setLang((l) => (l === 'HE' ? 'EN' : 'HE'))}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200"
            aria-label="Switch language"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>{t.switchLang}</span>
          </button>

          {/* Right: Logo */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tighter text-slate-900">
              {t.appName}
            </span>
            <span className="text-2xl leading-none">🏖️</span>
          </div>
        </div>

        {/* ── Filter tabs ──────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100">
          <div className="mx-auto max-w-5xl">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-2.5">
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
                    className={`flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 ${
                      isActive
                        ? `${TAB_ACTIVE[tab.id]} text-white shadow-md`
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 shadow-none'
                    }`}
                  >
                    <span className="leading-none">{tab.emoji}</span>
                    <span>{tabLabel[tab.id]}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold leading-none ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
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
          <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:gap-5 sm:p-5 lg:grid-cols-3 lg:gap-6 lg:p-6">
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                t={{ perNight: t.perNight, limitLabel: t.limitLabel, savings: t.savings, bookNow: t.bookNow, lang }}
                catLabel={catLabel}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ FOOTER */}
      <footer className="relative mt-10 overflow-hidden bg-slate-900 px-4 pb-12 pt-14 text-center">
        {/* Subtle gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative">
          <p className="text-4xl">🏖️</p>
          <p className="mt-4 text-xl font-black tracking-tighter text-white">{t.appName}</p>
          <p className="mt-1.5 text-sm text-slate-400">{t.footerTagline}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            {t.budgets.map((b) => (
              <span key={b.label} className={`rounded-full px-3.5 py-1.5 font-semibold ring-1 ring-white/5 ${b.cls}`}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL CARD
// ─────────────────────────────────────────────────────────────────────────────
type CardT = { perNight: string; limitLabel: string; savings: string; bookNow: string; lang: Lang };

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
  const [imgSrc, setImgSrc]       = useState(() => DEAL_IMAGES.get(deal.id) ?? FALLBACK_IMG);

  const description   = t.lang === 'EN' && deal.description_en   ? deal.description_en   : deal.description;
  const propertyName  = t.lang === 'EN' && deal.property_name_en ? deal.property_name_en : deal.property_name;
  const locationLabel = t.lang === 'EN' && deal.location_en      ? deal.location_en      : deal.location;

  const limit      = BUDGET_LIMITS[deal.category];
  const savings    = limit - deal.price_per_night_ils;
  const savingsPct = Math.round((savings / limit) * 100);

  return (
    <article
      className={`group overflow-hidden bg-white
        shadow-[0_1px_4px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.05)]
        ring-1 ring-gray-100/80 transition-all duration-300
        rounded-3xl
        sm:hover:-translate-y-1
        sm:hover:shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]
        sm:hover:ring-2
        ${CAT_RING[deal.category]}`}
    >
      {/* ── Photo ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl bg-gray-100">

        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        <Image
          src={imgSrc}
          alt={locationLabel}
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

        {/* Subtle bottom vignette for depth */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Category accent bar */}
        <div className={`absolute inset-x-0 top-0 h-[3px] ${CATEGORY_ACCENT[deal.category]}`} />

        {/* Badges — RTL: first → right, second → left */}
        <div className="absolute inset-x-0 top-3 flex items-center justify-between px-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${CATEGORY_COLORS[deal.category]}`}>
            {catLabel[deal.category]}
          </span>
          {savingsPct > 0 && (
            <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-xs font-black text-white shadow-sm">
              {savingsPct}% {t.savings}
            </span>
          )}
        </div>
      </div>

      {/* ── White card body ────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3.5">

        {/* Row 1 — Property name */}
        <h2 className="mb-1 line-clamp-1 text-[15px] font-bold leading-snug text-slate-900">
          {propertyName}
        </h2>

        {/* Row 2 — Location */}
        <div className="mb-2.5 flex items-center gap-1 text-sm text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-slate-400">
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span className="line-clamp-1">{locationLabel}</span>
        </div>

        {/* Row 3 — Description */}
        <p className="mb-3.5 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {description}
        </p>

        {/* Row 4 — Price + CTA */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">

          {/* Price block */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${CAT_PRICE[deal.category]}`}>
                {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
              </span>
              <span className="text-xs text-slate-400">{t.perNight}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 line-through decoration-slate-300">
              {t.limitLabel} {limit.toLocaleString('he-IL')} ₪
            </p>
          </div>

          {/* CTA — category gradient */}
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r px-5 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] active:shadow-none ${CAT_CTA[deal.category]}`}
          >
            {t.bookNow}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5 opacity-80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
