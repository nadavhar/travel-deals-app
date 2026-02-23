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

// ─── Filter tabs ─────────────────────────────────────────────────────────────
const FILTER_TABS: Array<{ id: string; label: string; emoji: string; category: Category | null }> =
  [
    { id: 'all',        label: 'הכל',             emoji: '✨', category: null },
    { id: 'vacation',   label: 'חופשה עד 450 ₪',  emoji: '🏨', category: 'vacation' },
    { id: 'suite',      label: 'סוויטה עד 450 ₪', emoji: '🛏️', category: 'suite' },
    { id: 'penthouse',  label: 'פנטהאוז עד 990 ₪', emoji: '🌆', category: 'penthouse' },
    { id: 'villa',      label: 'וילה עד 1990 ₪',  emoji: '🏡', category: 'villa' },
  ];

// Fallback image if Unsplash doesn't load
const FALLBACK_IMG = LOCATION_IMAGE_MAP['default'];

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
    <main className="min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-bl from-indigo-700 via-blue-600 to-teal-500 text-white">
        <div className="pointer-events-none absolute -top-16 -left-16 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -right-12 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center">
          <div className="mb-3 text-5xl">🏖️</div>
          <h1 className="mb-3 text-4xl font-black leading-tight drop-shadow lg:text-5xl">
            צייד הדילים: חופשה בתקציב שלך
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-blue-100">
            הסוכן שלנו סרק{' '}
            <span className="font-bold text-white">{RAW_DEALS.length}</span> הצעות,
            בדק כל אחת לפי חוקי התקציב הנוקשים וסינן הכל —
            כדי שתקבל רק את הדילים שבאמת שווים.
          </p>

          {/* Stat chips */}
          <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm font-semibold">
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm">
              ✅ {validDeals.length} דילים עברו
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm">
              🇮🇱 ישראל בלבד
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm">
              💰 4 קטגוריות תקציב
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-red-400/40 px-4 py-1.5 backdrop-blur-sm">
              🚫 {rejectedCount} נפסלו
            </div>
          </div>
        </div>
      </header>

      {/* ── Agent intelligence strip ─────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium text-gray-600">
                סה&quot;כ הצעות:{' '}
                <span className="font-bold text-gray-900">{RAW_DEALS.length}</span>
              </span>
              <span className="text-gray-200">|</span>
              <span className="font-medium text-emerald-600">
                ✓ עברו סינון:{' '}
                <span className="font-bold">{validDeals.length}</span>
              </span>
              <span className="text-gray-200">|</span>
              <button
                onClick={() => setShowRejected((v) => !v)}
                className="flex items-center gap-1 font-medium text-red-500 transition-colors hover:text-red-700"
              >
                ✗ נפסלו: <span className="font-bold">{rejectedCount}</span>
                <span className="text-xs opacity-60">{showRejected ? '▲' : '▼'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {rejectedByLocation} מחוץ לישראל &nbsp;·&nbsp; {rejectedByBudget} חריגת תקציב &nbsp;·&nbsp; {rejectedByUrl} URL שבור
            </p>
          </div>

          {/* Rejected panel */}
          {showRejected && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-red-700">
                  <span>🚫</span> דילים שנפסלו על ידי הסוכן:
                </h3>
                <div className="flex gap-2 text-xs">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">🌍 {rejectedByLocation} מיקום</span>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">💸 {rejectedByBudget} תקציב</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700">🔗 {rejectedByUrl} URL</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {rejectionReasons.map((r, i) => {
                  const styles = {
                    location: { border: 'border-red-100',    icon: '🌍', text: 'text-red-500' },
                    budget:   { border: 'border-orange-100', icon: '💸', text: 'text-orange-500' },
                    url:      { border: 'border-yellow-100', icon: '🔗', text: 'text-yellow-600' },
                  }[r.type];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2 rounded-lg border ${styles.border} bg-white px-3 py-2 text-xs`}
                    >
                      <span className="mt-0.5 shrink-0">{styles.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-800">{r.name}</span>
                        <span className="mx-1.5 text-gray-300">—</span>
                        <span className={styles.text}>{r.reason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
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
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'scale-105 bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    isActive ? 'bg-indigo-500 text-indigo-100' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="mb-5 text-sm text-gray-500">
          מציג <span className="font-bold text-gray-800">{filteredDeals.length}</span> נכסים
          {activeFilter !== 'all' && (
            <span className="mr-1 font-medium text-indigo-500">
              בקטגוריית {CATEGORY_LABELS[activeFilter as Category]}
            </span>
          )}
        </p>

        {/* Empty state */}
        {filteredDeals.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <p className="text-xl font-semibold text-gray-500">לא נמצאו דילים בקטגוריה זו</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-12 border-t bg-gray-900 py-8 text-center text-sm text-gray-400">
        <div className="mb-2 text-2xl">🏖️</div>
        <p className="font-semibold text-gray-300">צייד הדילים — חופשה בתקציב שלך</p>
        <p className="mt-1 text-xs text-gray-500">
          ישראל בלבד &nbsp;·&nbsp; מחיר ללילה &nbsp;·&nbsp; רק דילים שעוברים את הסינון הקפדני
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-gray-600">
          <span>חופשה ≤ 450 ₪</span>
          <span>סוויטה ≤ 450 ₪</span>
          <span>פנטהאוז ≤ 990 ₪</span>
          <span>וילה ≤ 1,990 ₪</span>
        </div>
      </footer>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL CARD
// ─────────────────────────────────────────────────────────────────────────────

function DealCard({ deal }: { deal: Deal }) {
  const limit = BUDGET_LIMITS[deal.category];
  const savings = limit - deal.price_per_night_ils;
  const savingsPct = Math.round((savings / limit) * 100);

  // ── Location-based landscape image (the core visual logic) ────────────────
  const landscapeUrl = getLocationImage(deal.location);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* ── Image: location-based landscape ─────────────────────────────── */}
      <div className="relative overflow-hidden">
        <img
          src={landscapeUrl}
          alt={`נוף — ${deal.location}`}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // If the Unsplash image fails, fall back to a reliable placeholder
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
          }}
        />

        {/* Category badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow ${CATEGORY_COLORS[deal.category]}`}
        >
          {CATEGORY_LABELS[deal.category]}
        </span>

        {/* Savings badge */}
        {savings >= 60 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            חוסך {savingsPct}% ממגבלת התקציב
          </span>
        )}

        {/* Category colour accent line at top */}
        <div className={`absolute inset-x-0 top-0 h-1 ${CATEGORY_ACCENT[deal.category]}`} />
      </div>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">

        <h2 className="mb-1 text-xl font-bold leading-snug text-gray-900">
          {deal.property_name}
        </h2>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
          <span>📍</span>
          <span>{deal.location}</span>
        </div>

        {/* Description */}
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
          {deal.description}
        </p>

        {/* Price + CTA */}
        <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <div className="text-3xl font-black leading-none text-indigo-600">
              {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
            </div>
            <div className="mt-0.5 text-xs text-gray-400">לכל לילה</div>
          </div>

          {/* CTA — opens deal URL in new tab */}
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95"
          >
            להזמנה ↗
          </a>
        </div>
      </div>
    </article>
  );
}
