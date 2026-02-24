'use client';

import { useState } from 'react';
import {
  filterDeals,
  RAW_DEALS,
  BUDGET_LIMITS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ACCENT,
  type Category,
  type Deal,
} from '@/lib/deals';
import { getLocationImage, LOCATION_IMAGE_MAP } from '@/lib/locationImages';

// ─── Filter once at module level ─────────────────────────────────────────────
const {
  validDeals,
  rejectedCount,
  rejectedByLocation,
  rejectedByBudget,
  rejectedByUrl,
  rejectionReasons,
} = filterDeals(RAW_DEALS);

// ─── Per-category design tokens ───────────────────────────────────────────────
const CAT_PRICE: Record<Category, string> = {
  vacation:  'text-sky-600',
  suite:     'text-purple-600',
  penthouse: 'text-amber-500',
  villa:     'text-emerald-600',
};
const CAT_BAR: Record<Category, string> = {
  vacation:  'bg-sky-500',
  suite:     'bg-purple-500',
  penthouse: 'bg-amber-400',
  villa:     'bg-emerald-500',
};
const CAT_BTN: Record<Category, string> = {
  vacation:  'bg-sky-500 hover:bg-sky-400',
  suite:     'bg-purple-500 hover:bg-purple-400',
  penthouse: 'bg-amber-500 hover:bg-amber-400',
  villa:     'bg-emerald-500 hover:bg-emerald-400',
};
const CAT_RING: Record<Category, string> = {
  vacation:  'hover:ring-sky-200',
  suite:     'hover:ring-purple-200',
  penthouse: 'hover:ring-amber-200',
  villa:     'hover:ring-emerald-200',
};

// ─── Filter tab config ────────────────────────────────────────────────────────
const FILTER_TABS: Array<{
  id: string; label: string; emoji: string; category: Category | null;
  inactive: string; active: string;
}> = [
  {
    id: 'all', label: 'הכל', emoji: '✨', category: null,
    inactive: 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
    active:   'bg-gray-900 text-white border-transparent',
  },
  {
    id: 'vacation', label: 'חופשה', emoji: '🏨', category: 'vacation',
    inactive: 'border-sky-200 text-sky-700 hover:bg-sky-50',
    active:   'bg-sky-500 text-white border-transparent',
  },
  {
    id: 'suite', label: 'סוויטה', emoji: '🛏️', category: 'suite',
    inactive: 'border-purple-200 text-purple-700 hover:bg-purple-50',
    active:   'bg-purple-500 text-white border-transparent',
  },
  {
    id: 'penthouse', label: 'פנטהאוז', emoji: '🌆', category: 'penthouse',
    inactive: 'border-amber-200 text-amber-700 hover:bg-amber-50',
    active:   'bg-amber-500 text-white border-transparent',
  },
  {
    id: 'villa', label: 'וילה', emoji: '🏡', category: 'villa',
    inactive: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
    active:   'bg-emerald-500 text-white border-transparent',
  },
];

const FALLBACK_IMG = LOCATION_IMAGE_MAP['default'];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showRejected, setShowRejected] = useState(false);

  const filteredDeals =
    activeFilter === 'all'
      ? validDeals
      : validDeals.filter((d) => d.category === activeFilter);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ══════════════════════════════════════════════════════ HERO */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-400/5 blur-2xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">

          {/* Live indicator pill */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-blue-200 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            סוכן AI פעיל · מסנן לפי חוקי תקציב נוקשים
          </div>

          <h1 className="mb-4 text-6xl font-black tracking-tight lg:text-7xl">
            🏖️ צייד הדילים
          </h1>
          <p className="mb-2 text-2xl font-bold text-white/90">
            חופשה חכמה. תקציב שלך.
          </p>
          <p className="mx-auto max-w-md text-base leading-relaxed text-blue-300/80">
            הסוכן סרק{' '}
            <strong className="font-black text-white">{RAW_DEALS.length}</strong>{' '}
            הצעות ופסל {rejectedCount} — נשארו רק הדילים שבאמת שווים.
          </p>

          {/* Big number stats */}
          <div className="mx-auto mt-12 flex max-w-sm justify-center gap-12">
            <div className="text-center">
              <div className="text-5xl font-black text-emerald-400">{validDeals.length}</div>
              <div className="mt-1 text-sm font-medium text-white/50">דילים עברו</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-5xl font-black text-red-400">{rejectedCount}</div>
              <div className="mt-1 text-sm font-medium text-white/50">נפסלו</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-5xl font-black text-blue-300">4</div>
              <div className="mt-1 text-sm font-medium text-white/50">קטגוריות</div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════ STICKY HEADER */}
      <div className="sticky top-0 z-30">

        {/* Agent stats bar */}
        <div className="border-b border-gray-200/70 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-4 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-500">
                  סה&quot;כ:{' '}
                  <strong className="font-bold text-gray-900">{RAW_DEALS.length}</strong>
                </span>
                <span className="h-4 w-px bg-gray-200" />
                <span className="font-semibold text-emerald-600">
                  ✓ עברו:{' '}
                  <strong>{validDeals.length}</strong>
                </span>
                <span className="h-4 w-px bg-gray-200" />
                <button
                  onClick={() => setShowRejected((v) => !v)}
                  className="font-semibold text-red-500 transition-colors hover:text-red-700"
                >
                  ✗ נפסלו: <strong>{rejectedCount}</strong>{' '}
                  <span className="text-xs opacity-50">{showRejected ? '▲' : '▼'}</span>
                </button>
              </div>
              <span className="hidden text-xs text-gray-400 sm:block">
                🌍 {rejectedByLocation} מיקום &nbsp;·&nbsp;
                💸 {rejectedByBudget} תקציב &nbsp;·&nbsp;
                🔗 {rejectedByUrl} URL
              </span>
            </div>

            {/* Rejection panel */}
            {showRejected && (
              <div className="mt-3 rounded-2xl border border-red-100 bg-red-50/80 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-red-700">🚫 נפסלו על ידי הסוכן:</span>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    🌍 {rejectedByLocation} מיקום
                  </span>
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                    💸 {rejectedByBudget} תקציב
                  </span>
                  <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                    🔗 {rejectedByUrl} URL
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {rejectionReasons.map((r, i) => {
                    const s = {
                      location: { border: 'border-red-200',    icon: '🌍', text: 'text-red-500' },
                      budget:   { border: 'border-orange-200', icon: '💸', text: 'text-orange-500' },
                      url:      { border: 'border-yellow-200', icon: '🔗', text: 'text-yellow-600' },
                    }[r.type];
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-2 rounded-xl border ${s.border} bg-white px-3 py-2 text-xs`}
                      >
                        <span className="mt-0.5 shrink-0">{s.icon}</span>
                        <div>
                          <span className="font-semibold text-gray-800">{r.name}</span>
                          <span className="mx-1.5 text-gray-300">—</span>
                          <span className={s.text}>{r.reason}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="border-b border-gray-200/60 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-4">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto py-3">
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
                    className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? `${tab.active} scale-[1.04] shadow-md`
                        : `bg-white ${tab.inactive}`
                    }`}
                  >
                    <span className="text-base leading-none">{tab.emoji}</span>
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
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

      {/* ══════════════════════════════════════════════════ MAIN GRID */}
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        <p className="mb-6 text-sm text-gray-500">
          מציג{' '}
          <strong className="font-bold text-gray-800">{filteredDeals.length}</strong>{' '}
          נכסים
          {activeFilter !== 'all' && (
            <span className="mr-1 font-semibold text-indigo-500">
              בקטגוריית {CATEGORY_LABELS[activeFilter as Category]}
            </span>
          )}
        </p>

        {filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <div className="mb-5 text-7xl">🔍</div>
            <p className="text-xl font-bold text-gray-700">לא נמצאו דילים</p>
            <p className="mt-2 text-sm text-gray-400">נסה לבחור קטגוריה אחרת</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════ FOOTER */}
      <footer className="mt-20 bg-gray-900 pb-10 pt-14 text-center">
        <p className="text-4xl">🏖️</p>
        <p className="mt-3 text-xl font-black text-white">צייד הדילים</p>
        <p className="mt-1 text-sm text-gray-500">
          חופשה חכמה בתקציב שלך · ישראל בלבד · רק דילים שעברו סינון
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5 text-xs">
          {(
            [
              { label: '🏨 חופשה ≤ 450 ₪',    cls: 'bg-sky-900/60 text-sky-300' },
              { label: '🛏️ סוויטה ≤ 450 ₪',  cls: 'bg-purple-900/60 text-purple-300' },
              { label: '🌆 פנטהאוז ≤ 990 ₪',  cls: 'bg-amber-900/60 text-amber-300' },
              { label: '🏡 וילה ≤ 1,990 ₪',   cls: 'bg-emerald-900/60 text-emerald-300' },
            ] as const
          ).map(({ label, cls }) => (
            <span key={label} className={`rounded-full px-4 py-1.5 font-semibold ${cls}`}>
              {label}
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
function DealCard({ deal }: { deal: Deal }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const limit      = BUDGET_LIMITS[deal.category];
  const savings    = limit - deal.price_per_night_ils;
  const savingsPct = Math.round((savings / limit) * 100);
  const fillPct    = Math.round((deal.price_per_night_ils / limit) * 100);
  const imgUrl     = getLocationImage(deal.location);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:ring-2 ${CAT_RING[deal.category]}`}
    >
      {/* ── Image ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">

        {/* Skeleton shimmer — visible until image loads */}
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        <img
          src={imgUrl}
          alt={`נוף — ${deal.location}`}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
            setImgLoaded(true);
          }}
        />

        {/* Bottom gradient for location legibility */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Category accent line */}
        <div className={`absolute inset-x-0 top-0 h-[3px] ${CATEGORY_ACCENT[deal.category]}`} />

        {/* Category badge — top-left */}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${CATEGORY_COLORS[deal.category]}`}
        >
          {CATEGORY_LABELS[deal.category]}
        </span>

        {/* Savings badge — top-right (always visible if any savings) */}
        {savingsPct > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white shadow-sm">
            {savingsPct}% חיסכון
          </span>
        )}

        {/* Location overlay — bottom-right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-sm font-semibold text-white drop-shadow">
          <span>📍</span>
          <span>{deal.location}</span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">

        <h2 className="mb-2 text-lg font-black leading-snug text-gray-900">
          {deal.property_name}
        </h2>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
          {deal.description}
        </p>

        {/* ── Price anchoring section ─────────────────────────────────────── */}
        <div className="mt-5 rounded-xl bg-gray-50 p-4">

          {/* Budget limit reference — the psychological anchor */}
          <div className="mb-1.5 flex items-center justify-between text-xs text-gray-400">
            <span>מגבלת תקציב</span>
            <span className="font-semibold">{limit.toLocaleString('he-IL')} ₪</span>
          </div>

          {/* Progress bar: shows what % of the budget this deal uses */}
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full ${CAT_BAR[deal.category]} transition-all`}
              style={{ width: `${fillPct}%` }}
            />
          </div>

          {/* Actual price */}
          <div className={`text-4xl font-black leading-none ${CAT_PRICE[deal.category]}`}>
            {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
          </div>
          <div className="mt-1 text-xs text-gray-400">לכל לילה</div>
        </div>

        {/* ── CTA button — full-width, 44px+, category colour ────────────── */}
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl text-sm font-black text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm ${CAT_BTN[deal.category]}`}
        >
          להזמנה ↗
        </a>
      </div>
    </article>
  );
}
