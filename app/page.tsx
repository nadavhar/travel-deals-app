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

// ─── Run the agent filter once at module level ───────────────────────────────
const { validDeals, rejectedCount, rejectedByLocation, rejectedByBudget, rejectedByUrl, rejectionReasons } =
  filterDeals(RAW_DEALS);

// ─── Filter tabs — each category has its own colour ──────────────────────────
const FILTER_TABS: Array<{
  id: string; label: string; emoji: string; category: Category | null;
  inactive: string; active: string; badge: string;
}> = [
  { id: 'all',       label: 'הכל',             emoji: '✨', category: null,
    inactive: 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50',
    active:   'bg-indigo-600 text-white shadow-indigo-200',
    badge:    'bg-indigo-500 text-indigo-100' },
  { id: 'vacation',  label: 'חופשה עד 450 ₪',  emoji: '🏨', category: 'vacation',
    inactive: 'border-sky-200 text-sky-700 hover:bg-sky-50',
    active:   'bg-sky-500 text-white shadow-sky-200',
    badge:    'bg-sky-400 text-white' },
  { id: 'suite',     label: 'סוויטה עד 450 ₪', emoji: '🛏️', category: 'suite',
    inactive: 'border-purple-200 text-purple-700 hover:bg-purple-50',
    active:   'bg-purple-500 text-white shadow-purple-200',
    badge:    'bg-purple-400 text-white' },
  { id: 'penthouse', label: 'פנטהאוז עד 990 ₪', emoji: '🌆', category: 'penthouse',
    inactive: 'border-amber-200 text-amber-700 hover:bg-amber-50',
    active:   'bg-amber-500 text-white shadow-amber-200',
    badge:    'bg-amber-400 text-white' },
  { id: 'villa',     label: 'וילה עד 1,990 ₪',  emoji: '🏡', category: 'villa',
    inactive: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
    active:   'bg-emerald-500 text-white shadow-emerald-200',
    badge:    'bg-emerald-400 text-white' },
];

const FALLBACK_IMG = LOCATION_IMAGE_MAP['default'];

// ─── Per-category colours used in cards ──────────────────────────────────────
const CAT_PRICE_COLOR: Record<Category, string> = {
  vacation:  'text-sky-600',
  suite:     'text-purple-600',
  penthouse: 'text-amber-600',
  villa:     'text-emerald-600',
};
const CAT_BTN_COLOR: Record<Category, string> = {
  vacation:  'bg-sky-500 hover:bg-sky-600 shadow-sky-100',
  suite:     'bg-purple-500 hover:bg-purple-600 shadow-purple-100',
  penthouse: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
  villa:     'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100',
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showRejected, setShowRejected] = useState(false);

  const filteredDeals =
    activeFilter === 'all'
      ? validDeals
      : validDeals.filter((d) => d.category === activeFilter);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-700 to-sky-600 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-[450px] w-[450px] rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/10 blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center">

          {/* AI badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-sm">
            <span>🤖</span>
            <span>סוכן AI מסנן דילים לפי חוקי תקציב נוקשים</span>
          </div>

          <h1 className="mb-4 text-5xl font-black leading-tight tracking-tight drop-shadow-lg lg:text-6xl">
            🏖️ צייד הדילים
          </h1>
          <p className="mb-2 text-xl font-semibold text-blue-100">
            חופשה בתקציב שלך — בישראל בלבד
          </p>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-blue-200">
            הסוכן סרק{' '}
            <span className="font-bold text-white underline decoration-sky-300 underline-offset-4">
              {RAW_DEALS.length} הצעות
            </span>
            , בדק כל אחת ומסנן הכל — כדי שתקבל רק את הדילים שבאמת שווים.
          </p>

          {/* Stat chips */}
          <div className="mt-9 flex flex-wrap justify-center gap-3 text-sm font-semibold">
            <StatChip emoji="✅" label={`${validDeals.length} דילים עברו`} cls="bg-emerald-500/20 border-emerald-400/30" />
            <StatChip emoji="🇮🇱" label="ישראל בלבד"                       cls="bg-blue-500/20 border-blue-400/30" />
            <StatChip emoji="💰" label="4 קטגוריות תקציב"                  cls="bg-indigo-500/20 border-indigo-400/30" />
            <StatChip emoji="🚫" label={`${rejectedCount} נפסלו`}           cls="bg-red-500/20 border-red-400/30" />
          </div>
        </div>
      </header>

      {/* ── Sticky agent bar ────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-gray-500">
                סה&quot;כ: <span className="font-bold text-gray-900">{RAW_DEALS.length}</span>
              </span>
              <span className="h-4 w-px bg-gray-200" />
              <span className="font-semibold text-emerald-600">
                ✓ עברו: <span className="font-bold">{validDeals.length}</span>
              </span>
              <span className="h-4 w-px bg-gray-200" />
              <button
                onClick={() => setShowRejected((v) => !v)}
                className="flex items-center gap-1 font-semibold text-red-500 transition-colors hover:text-red-700"
              >
                ✗ נפסלו: <span className="font-bold">{rejectedCount}</span>
                <span className="mr-0.5 text-xs opacity-50">{showRejected ? '▲' : '▼'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-400">
              🌍 {rejectedByLocation} מיקום &nbsp;·&nbsp;
              💸 {rejectedByBudget} תקציב &nbsp;·&nbsp;
              🔗 {rejectedByUrl} URL
            </p>
          </div>

          {/* Rejected panel */}
          {showRejected && (
            <div className="mt-3 rounded-2xl border border-red-100 bg-red-50/80 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-red-700">🚫 דילים שנפסלו על ידי הסוכן:</h3>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">🌍 {rejectedByLocation} מיקום</span>
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">💸 {rejectedByBudget} תקציב</span>
                <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">🔗 {rejectedByUrl} URL</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {rejectionReasons.map((r, i) => {
                  const s = {
                    location: { border: 'border-red-200',    icon: '🌍', text: 'text-red-500' },
                    budget:   { border: 'border-orange-200', icon: '💸', text: 'text-orange-500' },
                    url:      { border: 'border-yellow-200', icon: '🔗', text: 'text-yellow-600' },
                  }[r.type];
                  return (
                    <div key={i} className={`flex items-start gap-2 rounded-xl border ${s.border} bg-white px-3 py-2 text-xs`}>
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

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Filter tabs */}
        <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const count = tab.category === null
              ? validDeals.length
              : validDeals.filter((d) => d.category === tab.category).length;
            const isActive = activeFilter === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
                  isActive
                    ? `${tab.active} scale-105 border-transparent shadow-lg`
                    : `bg-white ${tab.inactive}`
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  isActive ? tab.badge : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="mb-6 text-sm text-gray-500">
          מציג <span className="font-bold text-gray-800">{filteredDeals.length}</span> נכסים
          {activeFilter !== 'all' && (
            <span className="mr-1 font-medium text-indigo-500">
              בקטגוריית {CATEGORY_LABELS[activeFilter as Category]}
            </span>
          )}
        </p>

        {/* Grid / empty */}
        {filteredDeals.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <p className="text-xl font-semibold text-gray-400">לא נמצאו דילים בקטגוריה זו</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-gray-800 bg-gray-900 py-12 text-center">
        <div className="mb-4 text-4xl">🏖️</div>
        <p className="text-lg font-bold text-gray-200">צייד הדילים</p>
        <p className="mt-1 text-sm text-gray-500">חופשה בתקציב שלך — ישראל בלבד · רק דילים שעברו סינון</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs">
          <span className="rounded-full bg-sky-900/60 px-3 py-1.5 font-medium text-sky-300">🏨 חופשה ≤ 450 ₪</span>
          <span className="rounded-full bg-purple-900/60 px-3 py-1.5 font-medium text-purple-300">🛏️ סוויטה ≤ 450 ₪</span>
          <span className="rounded-full bg-amber-900/60 px-3 py-1.5 font-medium text-amber-300">🌆 פנטהאוז ≤ 990 ₪</span>
          <span className="rounded-full bg-emerald-900/60 px-3 py-1.5 font-medium text-emerald-300">🏡 וילה ≤ 1,990 ₪</span>
        </div>
      </footer>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function StatChip({ emoji, label, cls }: { emoji: string; label: string; cls: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-sm ${cls}`}>
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL CARD
// ─────────────────────────────────────────────────────────────────────────────

function DealCard({ deal }: { deal: Deal }) {
  const limit      = BUDGET_LIMITS[deal.category];
  const savings    = limit - deal.price_per_night_ils;
  const savingsPct = Math.round((savings / limit) * 100);
  const imgUrl     = getLocationImage(deal.location);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">

        {/* Category accent line */}
        <div className={`absolute inset-x-0 top-0 z-10 h-1 ${CATEGORY_ACCENT[deal.category]}`} />

        <img
          src={imgUrl}
          alt={`נוף — ${deal.location}`}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
        />

        {/* Bottom gradient so location text is readable */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />

        {/* Location on photo */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-sm font-semibold text-white drop-shadow">
          <span>📍</span>
          <span>{deal.location}</span>
        </div>

        {/* Category badge — top left */}
        <span className={`absolute left-3 top-4 z-10 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${CATEGORY_COLORS[deal.category]}`}>
          {CATEGORY_LABELS[deal.category]}
        </span>

        {/* Savings badge — top right */}
        {savingsPct >= 10 && (
          <span className="absolute right-3 top-4 z-10 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            חוסך {savingsPct}%
          </span>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">

        <h2 className="mb-2 text-lg font-bold leading-snug text-gray-900">
          {deal.property_name}
        </h2>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
          {deal.description}
        </p>

        {/* Price + CTA */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div>
            <div className={`text-3xl font-black leading-none ${CAT_PRICE_COLOR[deal.category]}`}>
              {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
            </div>
            <div className="mt-0.5 text-xs text-gray-400">לכל לילה</div>
          </div>

          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 ${CAT_BTN_COLOR[deal.category]}`}
          >
            להזמנה ↗
          </a>
        </div>
      </div>
    </article>
  );
}
