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

// ─── Per-category tokens ──────────────────────────────────────────────────────
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
const CAT_PRICE_TEXT: Record<Category, string> = {
  vacation:  'text-sky-400',
  suite:     'text-purple-400',
  penthouse: 'text-amber-300',
  villa:     'text-emerald-400',
};
const CAT_RING: Record<Category, string> = {
  vacation:  'hover:ring-sky-200',
  suite:     'hover:ring-purple-200',
  penthouse: 'hover:ring-amber-200',
  villa:     'hover:ring-emerald-200',
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTER_TABS: Array<{
  id: string; label: string; emoji: string; category: Category | null;
}> = [
  { id: 'all',       label: 'הכל',    emoji: '✨', category: null },
  { id: 'vacation',  label: 'חופשה',  emoji: '🏨', category: 'vacation' },
  { id: 'suite',     label: 'סוויטה', emoji: '🛏️', category: 'suite' },
  { id: 'penthouse', label: 'פנטהאוז',emoji: '🌆', category: 'penthouse' },
  { id: 'villa',     label: 'וילה',   emoji: '🏡', category: 'villa' },
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

      {/* ══════════════════════════════════════════════════ STICKY APP BAR */}
      {/* Single sticky block: compact app bar + filter tabs. ~88px total.  */}
      {/* Deals start immediately below — nothing pushes them below the fold. */}
      <div className="sticky top-0 z-30 bg-white/95 shadow-sm backdrop-blur-md">

        {/* ── App Bar ─────────────────────────────────────────────────────── */}
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">

          {/* Left: dismissible AI badge — the only stats surface */}
          <button
            onClick={() => setShowRejected((v) => !v)}
            className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95"
            title="הצג/הסתר דילים שנפסלו"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            ✨ AI · {validDeals.length} דילים
            <span className="opacity-40">{showRejected ? '▲' : '▼'}</span>
          </button>

          {/* Right: Logo — the brand anchor */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-gray-900">
              צייד הדילים
            </span>
            <span className="text-2xl leading-none">🏖️</span>
          </div>
        </div>

        {/* ── Rejection panel (dismissible, behind the badge) ─────────────── */}
        {showRejected && (
          <div className="border-t border-gray-100 bg-slate-50 px-4 py-3">
            <div className="mx-auto max-w-5xl">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-red-600">
                  🚫 {rejectedCount} נפסלו על ידי הסוכן
                </span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  🌍 {rejectedByLocation} מיקום
                </span>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                  💸 {rejectedByBudget} תקציב
                </span>
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-600">
                  🔗 {rejectedByUrl} URL
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {rejectionReasons.map((r, i) => {
                  const s = {
                    location: { b: 'border-red-100',    ic: '🌍', t: 'text-red-500' },
                    budget:   { b: 'border-orange-100', ic: '💸', t: 'text-orange-500' },
                    url:      { b: 'border-yellow-100', ic: '🔗', t: 'text-yellow-600' },
                  }[r.type];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-1.5 rounded-xl border ${s.b} bg-white px-3 py-1.5 text-xs`}
                    >
                      <span className="mt-0.5 shrink-0">{s.ic}</span>
                      <div>
                        <span className="font-semibold text-gray-800">{r.name}</span>
                        <span className="mx-1 text-gray-300">—</span>
                        <span className={s.t}>{r.reason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Filter tabs — sticky & horizontally scrollable ──────────────── */}
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
                    className={`flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="leading-none">{tab.emoji}</span>
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
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
      {/* No padding on mobile → cards bleed edge-to-edge.                  */}
      {/* sm+ → standard padding and 2/3-col grid.                          */}
      <div className="mx-auto max-w-5xl">
        {filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <div className="mb-5 text-7xl">🔍</div>
            <p className="text-xl font-bold text-gray-700">לא נמצאו דילים</p>
            <p className="mt-2 text-sm text-gray-400">נסה לבחור קטגוריה אחרת</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-3 lg:gap-5 lg:p-5">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ FOOTER */}
      <footer className="mt-10 bg-gray-900 px-4 pb-10 pt-12 text-center">
        <p className="text-3xl">🏖️</p>
        <p className="mt-3 font-black text-white">צייד הדילים</p>
        <p className="mt-1 text-xs text-gray-500">חופשה חכמה · ישראל בלבד</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
          <span className="rounded-full bg-sky-900/60 px-3 py-1.5 font-semibold text-sky-300">🏨 ≤ 450 ₪</span>
          <span className="rounded-full bg-purple-900/60 px-3 py-1.5 font-semibold text-purple-300">🛏️ ≤ 450 ₪</span>
          <span className="rounded-full bg-amber-900/60 px-3 py-1.5 font-semibold text-amber-300">🌆 ≤ 990 ₪</span>
          <span className="rounded-full bg-emerald-900/60 px-3 py-1.5 font-semibold text-emerald-300">🏡 ≤ 1,990 ₪</span>
        </div>
      </footer>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL CARD  — image-forward, price lives on the photo
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
      className={`group overflow-hidden bg-white shadow-md ring-1 ring-gray-100 transition-all duration-300
        sm:rounded-2xl sm:hover:-translate-y-1.5 sm:hover:shadow-xl sm:hover:ring-2
        ${CAT_RING[deal.category]}`}
    >
      {/* ── Photo — carries price, name, location, badges ─────────────────── */}
      {/* aspect-[3/2] → ~250px tall on 375px screen. 2+ cards visible below  */}
      {/* the ~90px sticky header on a standard phone.                         */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-200">

        {/* Skeleton shimmer */}
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        <img
          src={imgUrl}
          alt={deal.location}
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

        {/* Dark vignette: transparent at top, heavy at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        {/* Category accent bar */}
        <div className={`absolute inset-x-0 top-0 h-[3px] ${CATEGORY_ACCENT[deal.category]}`} />

        {/* ── Top badges ── */}
        <div className="absolute inset-x-0 top-3 flex items-center justify-between px-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${CATEGORY_COLORS[deal.category]}`}>
            {CATEGORY_LABELS[deal.category]}
          </span>
          {savingsPct > 0 && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white shadow-sm">
              {savingsPct}% חיסכון
            </span>
          )}
        </div>

        {/* ── Bottom overlay: name + price + location ── */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="mb-2 line-clamp-1 text-base font-black leading-tight text-white drop-shadow">
            {deal.property_name}
          </h2>
          <div className="flex items-end justify-between gap-2">
            {/* Price — the visual anchor */}
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black leading-none drop-shadow ${CAT_PRICE_TEXT[deal.category]}`}>
                {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
              </span>
              <span className="text-xs text-white/60">ללילה</span>
            </div>
            {/* Location + budget reference */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-sm font-semibold text-white/90 drop-shadow">
                <span>{deal.location}</span>
                <span>📍</span>
              </div>
              <div className="mt-0.5 text-xs text-white/45">
                מגבלה {limit.toLocaleString('he-IL')} ₪
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────────────────────── */}
      <div className="p-4">

        {/* Description — hidden on mobile to save vertical space */}
        <p className="mb-3 hidden line-clamp-2 text-sm leading-relaxed text-gray-500 sm:block">
          {deal.description}
        </p>

        {/* Budget progress bar — hidden on mobile, shown sm+ for CRO on desktop */}
        <div className="mb-3 hidden sm:block">
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${CAT_BAR[deal.category]}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* CTA — full-width, 44px+, category colour */}
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-h-[44px] w-full items-center justify-center rounded-xl text-sm font-black text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] active:shadow-none ${CAT_BTN[deal.category]}`}
        >
          להזמנה ↗
        </a>
      </div>
    </article>
  );
}
