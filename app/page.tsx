'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Compass, MapPin } from 'lucide-react';
import {
  filterDeals,
  RAW_DEALS,
  BUDGET_LIMITS,
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
const CAT_RING: Record<Category, string> = {
  vacation:  'sm:hover:ring-orange-200',
  suite:     'sm:hover:ring-orange-200',
  penthouse: 'sm:hover:ring-orange-200',
  villa:     'sm:hover:ring-orange-200',
};
// Category dot color on badge
const CAT_DOT: Record<Category, string> = {
  vacation:  'bg-sky-400',
  suite:     'bg-violet-400',
  penthouse: 'bg-amber-400',
  villa:     'bg-emerald-400',
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

        {/* ── Centered logo + subtitle ─────────────────────────────────────── */}
        <div className="relative px-4 pb-5 pt-6 text-center">

          {/* Language switcher — absolute, RTL-aware: sits on the left */}
          <button
            onClick={() => setLang((l) => (l === 'HE' ? 'EN' : 'HE'))}
            className="absolute left-4 top-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200"
            aria-label="Switch language"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>{t.switchLang}</span>
          </button>

          {/* Logo: text + compass icon (RTL: icon to the right of text) */}
          <div className="flex items-center justify-center gap-2.5" dir="rtl">
            <span className="text-2xl font-black tracking-tight text-slate-800">
              {t.appName}
            </span>
            <Compass className="h-7 w-7 shrink-0 text-orange-600" strokeWidth={1.5} />
          </div>

          {/* Subtitle */}
          <p className="mt-1.5 text-[13px] font-normal text-gray-500">
            חופשה בתקציב שלך – הדילים הכי שווים בישראל
          </p>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="border-b border-gray-200" />

        {/* ── Filter pills ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-5xl">
          <div className="overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden"
               style={{ scrollbarWidth: 'none' }}>
            <div className="mx-auto flex w-max gap-3 px-4">
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
                    className={`flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                        : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{tabLabel[tab.id]}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold leading-none ${
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
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
      <footer className="relative mt-10 bg-slate-900 px-4 pb-12 pt-10 text-center">

        {/* Terracotta top accent line */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-orange-600" />

        {/* Compass icon */}
        <div className="flex justify-center">
          <Compass className="h-8 w-8 text-orange-500" strokeWidth={1.5} />
        </div>

        {/* App name */}
        <p className="mt-3 text-xl font-black tracking-tight text-white">{t.appName}</p>

        {/* Tagline */}
        <p className="mt-1.5 text-sm text-slate-400">{t.footerTagline}</p>

        {/* Divider */}
        <div className="mx-auto mt-7 mb-6 w-16 border-t border-white/10" />

        {/* Budget category pills */}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {t.budgets.map((b) => (
            <span key={b.label} className="rounded-full px-3.5 py-1.5 font-semibold text-slate-400 ring-1 ring-white/10">
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
  const savingsPct = Math.round(((limit - deal.price_per_night_ils) / limit) * 100);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white
        shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]
        ring-1 ring-black/[0.05]
        transition-all duration-300
        sm:hover:-translate-y-1.5
        sm:hover:shadow-[0_16px_40px_rgba(0,0,0,0.13),0_2px_8px_rgba(0,0,0,0.05)]
        sm:hover:ring-2
        ${CAT_RING[deal.category]}`}
    >
      {/* ── Photo ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">

        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        <Image
          src={imgSrc}
          alt={locationLabel}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-[1.04] ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (imgSrc !== FALLBACK_IMG) setImgSrc(FALLBACK_IMG);
            setImgLoaded(true);
          }}
        />

        {/* Cinematic bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Savings badge — top right */}
        {savingsPct > 0 && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-orange-600 px-2.5 py-1 text-xs font-black text-white shadow-md">
              -{savingsPct}%
            </span>
          </div>
        )}

        {/* Category badge — bottom left, frosted glass */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${CAT_DOT[deal.category]}`} />
          <span className="text-xs font-semibold text-slate-700">{catLabel[deal.category]}</span>
        </div>
      </div>

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-4 pb-5 pt-4">

        {/* Location */}
        <div className="mb-1.5 flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
          <span className="line-clamp-1">{locationLabel}</span>
        </div>

        {/* Property name */}
        <h2 className="mb-2 line-clamp-1 text-[16px] font-bold leading-snug text-slate-900">
          {propertyName}
        </h2>

        {/* Description */}
        <p className="mb-4 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-400">
          {description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-3">

          {/* Price block */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-black leading-none text-slate-900">
                {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">
              <span className="line-through decoration-gray-300">
                {limit.toLocaleString('he-IL')} ₪
              </span>
              <span className="mr-1 text-gray-400"> {t.perNight}</span>
            </p>
          </div>

          {/* CTA — terracotta */}
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-orange-500 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] active:shadow-none"
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
