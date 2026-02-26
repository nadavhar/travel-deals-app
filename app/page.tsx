'use client';

import { useState, useRef, useEffect, useMemo, memo } from 'react';
import Image from 'next/image';
import { Compass, MapPin, Upload, X, Play, ChevronLeft, ChevronRight, Share2, Check, Search, Phone, LogIn } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import {
  filterDeals,
  RAW_DEALS,
  BUDGET_LIMITS,
  type Category,
  type Deal,
} from '@/lib/deals';
import { getLocationImage, getLocationKey, LOCATION_IMAGE_MAP } from '@/lib/locationImages';
import { createClient } from '@/lib/supabase/client';

// ─── Filter once at module level ─────────────────────────────────────────────
const { validDeals: INITIAL_DEALS } = filterDeals(RAW_DEALS);

// ─── Pre-compute one image per deal (stable on SSR + hydration) ───────────────
const DEAL_IMAGES: Map<number, string> = (() => {
  const map = new Map<number, string>();
  const counters = new Map<string, number>();
  for (const deal of INITIAL_DEALS) {
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
    perNight:     '/ לילה',
    limitLabel:   'מגבלה',
    savings:      'חיסכון',
    bookNow:            'להזמנה',
    publishDeal:        'פרסם דיל +',
    searchPlaceholder:  'חפש מקום, עיר או תיאור...',
    noDeals:            'לא נמצאו דילים',
    noDealsHint:        'נסה לבחור קטגוריה אחרת',
    publishModalTitle:  'פרסם דיל חדש',
    publishSubmit:      'פרסם דיל',
    publishSuccess:     'הדיל פורסם בהצלחה!',
    footerTagline:      'חופשה חכמה · ישראל בלבד',
    budgets: [
      { label: 'חופשה ≤ 450 ₪',   cls: 'bg-sky-900/60 text-sky-300' },
      { label: 'סוויטה ≤ 450 ₪',  cls: 'bg-purple-900/60 text-purple-300' },
      { label: 'פנטהאוז ≤ 990 ₪', cls: 'bg-amber-900/60 text-amber-300' },
      { label: 'וילה ≤ 1,990 ₪',  cls: 'bg-emerald-900/60 text-emerald-300' },
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
    perNight:     '/ night',
    limitLabel:   'Limit',
    savings:      'savings',
    bookNow:            'Book Now',
    publishDeal:        'Publish Deal +',
    searchPlaceholder:  'Search place, city or description...',
    noDeals:            'No deals found',
    noDealsHint:        'Try a different category',
    publishModalTitle:  'Publish New Deal',
    publishSubmit:      'Publish Deal',
    publishSuccess:     'Deal published successfully!',
    footerTagline:      'Smart vacations · Israel only',
    budgets: [
      { label: 'Vacation ≤ ₪450',   cls: 'bg-sky-900/60 text-sky-300' },
      { label: 'Suite ≤ ₪450',      cls: 'bg-purple-900/60 text-purple-300' },
      { label: 'Penthouse ≤ ₪990',  cls: 'bg-amber-900/60 text-amber-300' },
      { label: 'Villa ≤ ₪1,990',    cls: 'bg-emerald-900/60 text-emerald-300' },
    ],
  },
} satisfies Record<Lang, unknown>;

// ─── Design tokens ────────────────────────────────────────────────────────────
const CAT_RING_CLS = 'sm:hover:ring-orange-200';
const CAT_DOT: Record<Category, string> = {
  vacation:  'bg-sky-400',
  suite:     'bg-violet-400',
  penthouse: 'bg-amber-400',
  villa:     'bg-emerald-400',
};

const FILTER_TABS: Array<{ id: string; category: Category | null }> = [
  { id: 'all',       category: null },
  { id: 'vacation',  category: 'vacation' },
  { id: 'suite',     category: 'suite' },
  { id: 'penthouse', category: 'penthouse' },
  { id: 'villa',     category: 'villa' },
];

const FALLBACK_IMG = LOCATION_IMAGE_MAP['default'][0];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFilter, setActiveFilter]         = useState('all');
  const [lang, setLang]                         = useState<Lang>('HE');
  const [deals, setDeals]                       = useState<Deal[]>(INITIAL_DEALS);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [toast, setToast]                       = useState<string | null>(null);
  const [searchQuery, setSearchQuery]           = useState('');
  const [user, setUser]                         = useState<User | null>(null);

  // Track all blob URLs created for UGC deals so we can revoke them on unmount
  const blobUrlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    return () => { blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  // ── Auth state + UGC deals fetch ────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Fetch persisted UGC deals and merge after static deals
    fetch('/api/deals/public')
      .then((r) => r.ok ? r.json() : null)
      .then((data: { deals?: Deal[] } | null) => {
        if (!data?.deals?.length) return;
        setDeals((prev) => {
          // Avoid duplicates — UGC deals have a userId, static ones don't
          const staticDeals = prev.filter((d) => !d.userId);
          return [...staticDeals, ...data.deals!];
        });
      })
      .catch(() => { /* non-critical — static deals still show */ });

    return () => subscription.unsubscribe();
  }, []);

  const t = T[lang];

  // Memoize label maps — only recompute when language changes
  const tabLabel = useMemo<Record<string, string>>(() => ({
    all: t.all, vacation: t.vacation, suite: t.suite,
    penthouse: t.penthouse, villa: t.villa,
  }), [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const catLabel = useMemo<Record<Category, string>>(() => ({
    vacation: t.vacation, suite: t.suite,
    penthouse: t.penthouse, villa: t.villa,
  }), [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const cardT = useMemo<CardT>(() => ({
    perNight: t.perNight, limitLabel: t.limitLabel,
    savings: t.savings, bookNow: t.bookNow, lang,
  }), [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = searchQuery.trim().toLowerCase();

  // Deals filtered by search only (used for accurate pill counts)
  const searchFilteredDeals = useMemo(() => {
    if (!q) return deals;
    return deals.filter((d) => {
      if (d.property_name.toLowerCase().includes(q)) return true;
      if (d.location.toLowerCase().includes(q)) return true;
      if (d.description.toLowerCase().includes(q)) return true;
      if (lang === 'EN') {
        if (d.property_name_en?.toLowerCase().includes(q)) return true;
        if (d.location_en?.toLowerCase().includes(q)) return true;
        if (d.description_en?.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [deals, q, lang]);

  // Deals filtered by both search AND active category tab
  const filteredDeals = useMemo(() =>
    activeFilter === 'all'
      ? searchFilteredDeals
      : searchFilteredDeals.filter((d) => d.category === activeFilter),
  [activeFilter, searchFilteredDeals]);

  function handlePublish(deal: Deal) {
    // Register blob URLs for cleanup on page unmount
    deal.imageUrls?.forEach((u) => { if (u.startsWith('blob:')) blobUrlsRef.current.add(u); });
    if (deal.videoUrl?.startsWith('blob:')) blobUrlsRef.current.add(deal.videoUrl);
    // Prepend the new deal; remove any previous optimistic copy with same id
    setDeals((prev) => [deal, ...prev.filter((d) => d.id !== deal.id)]);
    setActiveFilter(deal.category); // Jump to the deal's category so it's immediately visible
    setSearchQuery('');             // Clear any active search that might hide it
    setShowPublishModal(false);
    setToast(t.publishSuccess);
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb]">

      {/* ══════════════════════════════════════════════════ STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">

        {/* ── Centered logo + subtitle ─────────────────────────────────────── */}
        <div className="relative px-4 pb-4 pt-6 text-center">

          {/* Language switcher — left */}
          <button
            onClick={() => setLang((l) => (l === 'HE' ? 'EN' : 'HE'))}
            className="absolute left-4 top-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 active:bg-gray-200"
            aria-label="Switch language"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>{t.switchLang}</span>
          </button>

          {/* Right side: Publish + Auth (desktop only) */}
          <div className="absolute right-4 top-5 hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <a
                  href="/my-deals"
                  className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                >
                  הדילים שלי
                </a>
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="flex items-center gap-1 rounded-full border border-orange-500 px-3 py-1.5 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-50 active:scale-95"
                >
                  {t.publishDeal}
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth"
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  כניסה
                </a>
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="flex items-center gap-1 rounded-full border border-orange-500 px-3 py-1.5 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-50 active:scale-95"
                >
                  {t.publishDeal}
                </button>
              </>
            )}
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5" dir="rtl">
            <span className="text-2xl font-black tracking-tight text-slate-800">{t.appName}</span>
            <Compass className="h-7 w-7 shrink-0 text-orange-600" strokeWidth={1.5} />
          </div>

          {/* Subtitle */}
          <p className="mt-1.5 text-[13px] font-normal text-gray-500">
            חופשה בתקציב שלך – הדילים הכי שווים בישראל
          </p>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="border-b border-gray-200" />

        {/* ── Search bar ───────────────────────────────────────────────────── */}
        <div className="mx-auto mt-5 max-w-5xl px-4">
          <div
            className="relative flex items-center rounded-full border border-gray-200 bg-gray-50 transition-all focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20"
            dir="rtl"
          >
            <Search className="pointer-events-none absolute right-4 h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent py-2.5 pr-11 pl-10 text-sm text-slate-800 placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label={lang === 'EN' ? 'Clear search' : 'נקה חיפוש'}
                className="absolute left-4 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Filter pills ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-5xl">
          <div className="overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <div className="mx-auto flex w-max gap-3 px-4">
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.category === null
                    ? searchFilteredDeals.length
                    : searchFilteredDeals.filter((d) => d.category === tab.category).length;
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
                key={deal.userId ? `db-${deal.id}` : `static-${deal.id}`}
                deal={deal}
                t={cardT}
                catLabel={catLabel}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ FOOTER */}
      <footer className="relative mt-10 bg-slate-900 px-4 pb-12 pt-10 text-center">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-orange-600" />
        <div className="flex justify-center">
          <Compass className="h-8 w-8 text-orange-500" strokeWidth={1.5} />
        </div>
        <p className="mt-3 text-xl font-black tracking-tight text-white">{t.appName}</p>
        <p className="mt-1.5 text-sm text-slate-400">{t.footerTagline}</p>
        <div className="mx-auto mb-6 mt-7 w-16 border-t border-white/10" />
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {t.budgets.map((b) => (
            <span key={b.label} className="rounded-full px-3.5 py-1.5 font-semibold text-slate-400 ring-1 ring-white/10">
              {b.label}
            </span>
          ))}
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════ PUBLISH MODAL */}
      {showPublishModal && (
        <PublishModal
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
          modalTitle={t.publishModalTitle}
          submitLabel={t.publishSubmit}
        />
      )}

      {/* ══════════════════════════════════════════ MOBILE FAB (bottom) */}
      <button
        onClick={() => setShowPublishModal(true)}
        className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#D05C3A] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(208,92,58,0.45)] transition-transform active:scale-95 md:hidden"
      >
        <span className="text-base font-bold leading-none">+</span>
        <span>{t.publishSubmit}</span>
      </button>

      {/* ══════════════════════════════════════════════════════════ TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISH MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface MediaFile {
  file: File;
  previewUrl: string;
  kind: 'image' | 'video';
}

function PublishModal({
  onClose,
  onPublish,
  modalTitle,
  submitLabel,
}: {
  onClose: () => void;
  onPublish: (deal: Deal) => void;
  modalTitle: string;
  submitLabel: string;
}) {
  const [propertyName, setPropertyName] = useState('');
  const [location, setLocation]         = useState('');
  const [description, setDescription]   = useState('');
  const [category, setCategory]         = useState<Category | ''>('');
  const [price, setPrice]               = useState('');
  const [url, setUrl]                   = useState('');
  const [hostName, setHostName]         = useState('');
  const [hostPhone, setHostPhone]       = useState('');
  const [hostEmail, setHostEmail]       = useState('');
  const [amenities, setAmenities]       = useState<string[]>([]);
  const [mediaFiles, setMediaFiles]     = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  const budgetLimit = category ? BUDGET_LIMITS[category as Category] : null;
  const priceNum    = parseFloat(price);
  const priceError  =
    budgetLimit !== null && !isNaN(priceNum) && priceNum > budgetLimit
      ? `מחיר חורג מהמגבלה — מקסימום ${budgetLimit.toLocaleString('he-IL')} ₪`
      : null;
  const trimmedUrl = url.trim();
  const urlError = trimmedUrl !== '' && !trimmedUrl.startsWith('https://');

  // Strip formatting chars, then require 9–13 digits (covers Israeli 0X-XXXXXXXX
  // and international +972-XX-XXXXXXX after stripping the +)
  const phoneDigits = hostPhone.replace(/[\s\-().+]/g, '');
  const phoneError  =
    hostPhone.trim() !== '' && !/^\d{9,13}$/.test(phoneDigits)
      ? 'מספר טלפון לא תקין (9–13 ספרות)'
      : null;

  const isValid =
    propertyName.trim() !== '' &&
    location.trim() !== '' &&
    category !== '' &&
    !isNaN(priceNum) && priceNum > 0 &&
    !priceError &&
    !urlError &&
    hostName.trim() !== '' &&
    hostPhone.trim() !== '' &&
    !phoneError;

  function addFiles(files: File[]) {
    const next: MediaFile[] = files
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
        kind: f.type.startsWith('video/') ? ('video' as const) : ('image' as const),
      }));
    setMediaFiles((prev) => [...prev, ...next]);
  }

  function removeFile(index: number) {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !category || isSubmitting) return;

    const imageUrls  = mediaFiles.filter((m) => m.kind === 'image').map((m) => m.previewUrl);
    const videoEntry = mediaFiles.find((m) => m.kind === 'video');

    setIsSubmitting(true);

    // ── Call API: auth check + AI image + Supabase persist ────────────────
    let savedDeal: Deal | null = null;
    try {
      const res = await fetch('/api/deals/publish', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          property_name:       propertyName.trim(),
          location:            location.trim(),
          price_per_night_ils: priceNum,
          description:         description.trim(),
          url:                 url.trim(),
          hostName:            hostName.trim(),
          hostPhone:           hostPhone.trim(),
          hostEmail:           hostEmail.trim() || null,
          amenities,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        savedDeal = data.deal ?? null;
      } else if (res.status === 401) {
        setIsSubmitting(false);
        window.location.href = '/auth?next=/';
        return;
      }
    } catch {
      // Network failure — proceed without persistence (graceful degradation)
    } finally {
      setIsSubmitting(false);
    }

    onPublish({
      // Use DB-assigned id if available; fall back to timestamp for offline/error case
      id:                  savedDeal?.id ?? Date.now(),
      category:            category as Category,
      property_name:       propertyName.trim(),
      location:            location.trim(),
      price_per_night_ils: priceNum,
      description:         description.trim(),
      url:                 url.trim() || '#',
      imageUrls:           imageUrls.length > 0 ? imageUrls : undefined,
      videoUrl:            videoEntry?.previewUrl ?? null,
      hostName:            hostName.trim(),
      hostPhone:           hostPhone.trim(),
      hostEmail:           hostEmail.trim() || null,
      amenities:           amenities.length > 0 ? amenities : undefined,
      imageUrl:            savedDeal?.imageUrl,
      userId:              savedDeal?.userId,
    });
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
    >
      <div
        className="relative w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        style={{ maxHeight: '92vh' }}
        dir="rtl"
      >
        {/* ── Modal header ──── */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl bg-white px-6 py-4 shadow-[0_1px_0_#f1f5f9]">
          <h2 className="text-lg font-black text-slate-900">{modalTitle}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-8 pt-5">

          {/* ── Media Upload Zone ──── */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              תמונות ווידאו <span className="font-normal text-gray-400">(אופציונלי)</span>
            </label>
            <div
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all ${
                isDragging ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/40'
              }`}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`rounded-full p-3 transition-colors ${isDragging ? 'bg-orange-100' : 'bg-white shadow-sm'}`}>
                <Upload size={22} className={isDragging ? 'text-orange-500' : 'text-gray-400'} />
              </div>
              <p className="text-sm font-medium text-gray-600">{isDragging ? 'שחרר את הקבצים כאן' : 'גרור קבצים לכאן'}</p>
              <p className="text-xs text-gray-400">או לחץ לבחירת תמונות ווידאו</p>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {mediaFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {mediaFiles.map((m, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    {m.kind === 'video' ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-800">
                        <Play size={18} className="text-white/80" />
                        <span className="text-[10px] text-white/50">וידאו</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.previewUrl} alt="" className="h-full w-full object-cover" />
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Deal details ──── */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">שם המקום <span className="text-red-400">*</span></label>
              <input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)}
                placeholder="לדוגמה: וילת הכרמל" className={inputCls} required autoFocus />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">מיקום <span className="text-red-400">*</span></label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="לדוגמה: אילת, ירושלים" className={inputCls} required />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">תיאור קצר</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="תאר את המקום בקצרה..." rows={2}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">קטגוריה <span className="text-red-400">*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value as Category | '')}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" required>
                  <option value="">בחר קטגוריה</option>
                  <option value="vacation">חופשה (≤ 450 ₪)</option>
                  <option value="suite">סוויטה (≤ 450 ₪)</option>
                  <option value="penthouse">פנטהאוז (≤ 990 ₪)</option>
                  <option value="villa">וילה (≤ 1,990 ₪)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">מחיר ללילה (₪) <span className="text-red-400">*</span></label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder={budgetLimit ? String(budgetLimit) : '450'} min="1"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                    priceError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                  }`} required />
                {priceError && <p className="mt-1 text-xs font-medium text-red-500">{priceError}</p>}
                {budgetLimit && !priceError && <p className="mt-1 text-xs text-gray-400">מקסימום: {budgetLimit.toLocaleString('he-IL')} ₪</p>}
              </div>
            </div>

            {/* ── Amenities chips ──── */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                מתקנים בנכס <span className="font-normal text-gray-400">(אופציונלי)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['בריכה', "ג'קוזי", 'חניה חינם', 'WiFi', 'מטבח מאובזר', 'מתאים לבעלי חיים', 'מנגל'].map((a) => {
                  const selected = amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmenities((prev) => selected ? prev.filter((x) => x !== a) : [...prev, a])}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95 ${
                        selected
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {selected && <span className="ml-1 text-orange-500">✓</span>}
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* URL — optional when host phone provided */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                קישור להזמנה <span className="font-normal text-gray-400">(אופציונלי)</span>
              </label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.booking.com/..."
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                  urlError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                }`} />
              {urlError && <p className="mt-1 text-xs font-medium text-red-500">הקישור חייב להתחיל ב-https://</p>}
            </div>
          </div>

          {/* ── Host Contact Section ──── */}
          <div className="my-6">
            <div className="mb-4 flex items-center gap-3">
              <hr className="flex-1 border-gray-200" />
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-400">פרטי המארח / יצירת קשר</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  שם המארח <span className="text-red-400">*</span>
                </label>
                <input type="text" value={hostName} onChange={(e) => setHostName(e.target.value)}
                  placeholder="לדוגמה: יוסי כהן" className={inputCls} required />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  טלפון / וואטסאפ <span className="text-red-400">*</span>
                </label>
                <input type="tel" value={hostPhone} onChange={(e) => setHostPhone(e.target.value)}
                  placeholder="050-1234567"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                    phoneError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                  }`} required />
                {phoneError
                  ? <p className="mt-1 text-xs font-medium text-red-500">{phoneError}</p>
                  : <p className="mt-1 text-xs text-gray-400">יוצג כפתורי וואטסאפ ושיחה ישירה על הדיל</p>
                }
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  אימייל <span className="font-normal text-gray-400">(אופציונלי)</span>
                </label>
                <input type="email" value={hostEmail} onChange={(e) => setHostEmail(e.target.value)}
                  placeholder="host@example.com" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Validation hint — visible when form is partially filled but not yet valid */}
          {!isValid && (propertyName || location || category || price || hostName || hostPhone) && (
            <p className="mb-3 text-center text-xs text-orange-500">
              {[
                !propertyName.trim() && 'שם המקום',
                !location.trim()     && 'מיקום',
                !category            && 'קטגוריה',
                (isNaN(priceNum) || priceNum <= 0) && 'מחיר ללילה',
                priceError           && 'מחיר חורג מהמגבלה',
                urlError             && 'קישור (חייב https://)',
                !hostName.trim()     && 'שם המארח',
                !hostPhone.trim()    && 'טלפון',
                phoneError           && 'טלפון לא תקין',
              ].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Submit */}
          <button type="submit" disabled={!isValid || isSubmitting}
            className="w-full rounded-xl bg-orange-600 py-3 text-sm font-black text-white shadow-sm transition-all hover:bg-orange-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                מייצר תמונה עם AI...
              </span>
            ) : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL CARD
// ─────────────────────────────────────────────────────────────────────────────
type CardT = { perNight: string; limitLabel: string; savings: string; bookNow: string; lang: Lang };

const DealCard = memo(function DealCard({
  deal,
  t,
  catLabel,
}: {
  deal: Deal;
  t: CardT;
  catLabel: Record<Category, string>;
}) {
  const [imgLoaded, setImgLoaded]     = useState(false);
  const [imgSrc, setImgSrc]           = useState(() => (!deal.userId ? DEAL_IMAGES.get(deal.id) : undefined) ?? deal.imageUrl ?? FALLBACK_IMG);

  // Sync imgSrc when a UGC deal's imageUrl changes (e.g. after user edits it)
  useEffect(() => {
    if (deal.userId) {
      setImgSrc(deal.imageUrl ?? FALLBACK_IMG);
      setImgLoaded(false);
    }
  }, [deal.imageUrl, deal.userId]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showVideo, setShowVideo]     = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    const shareData = {
      title: propertyName,
      text: `${propertyName} – ${locationLabel}\n${deal.price_per_night_ils.toLocaleString('he-IL')} ₪ ללילה`,
      url: deal.url,
    };
    if (typeof navigator.share === 'function' && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch { /* user dismissed */ }
    } else {
      try {
        await navigator.clipboard.writeText(deal.url);
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2000);
      } catch { /* clipboard permission denied */ }
    }
  }

  const description   = t.lang === 'EN' && deal.description_en   ? deal.description_en   : deal.description;
  const propertyName  = t.lang === 'EN' && deal.property_name_en ? deal.property_name_en : deal.property_name;
  const locationLabel = t.lang === 'EN' && deal.location_en      ? deal.location_en      : deal.location;

  const limit      = BUDGET_LIMITS[deal.category];
  const savingsPct = Math.round(((limit - deal.price_per_night_ils) / limit) * 100);

  const images      = deal.imageUrls ?? [];
  const hasCarousel = images.length > 0;
  const totalSlides = images.length;

  function prev(e: React.MouseEvent) {
    e.preventDefault();
    setActiveSlide((i) => (i - 1 + totalSlides) % totalSlides);
  }
  function next(e: React.MouseEvent) {
    e.preventDefault();
    setActiveSlide((i) => (i + 1) % totalSlides);
  }

  return (
    <>
      <article
        className={`group flex flex-col overflow-hidden rounded-2xl bg-white
          shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]
          ring-1 ring-black/[0.05]
          transition-all duration-300
          sm:hover:-translate-y-1.5
          sm:hover:shadow-[0_16px_40px_rgba(0,0,0,0.13),0_2px_8px_rgba(0,0,0,0.05)]
          sm:hover:ring-2
          ${CAT_RING_CLS}`}
      >
        {/* ── Image / Carousel area ────────────────────────────────────────── */}
        <div className="relative aspect-[3/2] overflow-hidden bg-gray-100" dir="ltr">

          {hasCarousel ? (
            <>
              {/* Sliding track */}
              <div
                className="flex h-full transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={locationLabel}
                    className="h-full w-full shrink-0 object-cover"
                  />
                ))}
              </div>

              {/* Prev / Next arrows */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="תמונה קודמת"
                    className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow backdrop-blur-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={next}
                    aria-label="תמונה הבאה"
                    className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow backdrop-blur-sm transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronRight size={14} />
                  </button>
                </>
              )}

              {/* Dots */}
              {totalSlides > 1 && (
                <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 gap-0.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); setActiveSlide(i); }}
                      aria-label={`תמונה ${i + 1}`}
                      className="p-1.5"
                    >
                      <span className={`block h-1.5 rounded-full transition-all ${
                        i === activeSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                      }`} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}

          {/* Cinematic vignette */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Video play button */}
          {deal.videoUrl && (
            <button
              onClick={(e) => { e.preventDefault(); setShowVideo(true); }}
              className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white ring-2 ring-white/30 backdrop-blur-sm transition-transform hover:scale-110"
            >
              <Play size={20} fill="white" />
            </button>
          )}

          {/* Savings badge */}
          {savingsPct > 0 && (
            <div className="pointer-events-none absolute right-3 top-3">
              <span className="rounded-full bg-orange-600 px-2.5 py-1 text-xs font-black text-white shadow-md">
                -{savingsPct}%
              </span>
            </div>
          )}

          {/* Category badge */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${CAT_DOT[deal.category]}`} />
            <span className="text-xs font-semibold text-slate-700">{catLabel[deal.category]}</span>
          </div>
        </div>

        {/* ── Card body ────────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col px-4 pb-5 pt-4">
          <div className="mb-1.5 flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
            <span className="line-clamp-1">{locationLabel}</span>
          </div>
          <h2 className="mb-2 line-clamp-1 text-[16px] font-bold leading-snug text-slate-900">
            {propertyName}
          </h2>
          <p className="mb-4 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-400">
            {description}
          </p>

          {/* Host label */}
          {deal.hostName && (
            <p className="mb-2.5 text-xs text-gray-400">
              מארח/ת: <span className="font-semibold text-slate-600">{deal.hostName}</span>
            </p>
          )}

          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-black leading-none text-slate-900">
                  {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">
                <span className="line-through decoration-gray-300">{limit.toLocaleString('he-IL')} ₪</span>
                <span className="mr-1">{t.perNight}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Share button */}
              <button
                onClick={handleShare}
                aria-label="שתף דיל"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
              >
                {shareFeedback
                  ? <Check size={16} className="text-emerald-500" />
                  : <Share2 size={16} />
                }
              </button>

              {deal.hostPhone ? (
                /* ── Host deal: WhatsApp + Phone ── */
                <>
                  <a
                    href={`https://wa.me/${deal.hostPhone.replace(/[\s\-().+]/g, '')}?text=${encodeURIComponent(`היי ${deal.hostName}, הגעתי דרך צייד הדילים. רציתי לשאול לגבי ${propertyName}...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-500 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]"
                  >
                    {/* WhatsApp logo */}
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    וואטסאפ
                  </a>
                  <a
                    href={`tel:${deal.hostPhone.replace(/[\s\-().]/g, '')}`}
                    aria-label="התקשר"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
                  >
                    <Phone size={16} />
                  </a>
                </>
              ) : (
                /* ── Scraped deal: standard Book Now ── */
                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-500 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] active:shadow-none"
                >
                  {t.bookNow}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5 opacity-80">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* ── Video Modal ──────────────────────────────────────────────────────── */}
      {showVideo && deal.videoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="סרטון נכס"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setShowVideo(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowVideo(false); }}
        >
          <button
            autoFocus
            aria-label="סגור סרטון"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => setShowVideo(false)}
          >
            <X size={20} />
          </button>
          <video
            src={deal.videoUrl}
            controls
            autoPlay
            className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
});
