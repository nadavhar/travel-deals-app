'use client';

import { useState, useRef } from 'react';
import { X, Pencil, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BUDGET_LIMITS, type Category, type Deal } from '@/lib/deals';

const AMENITY_OPTIONS = ['בריכה', "ג'קוזי", 'חניה חינם', 'WiFi', 'מטבח מאובזר', 'מתאים לבעלי חיים', 'מנגל'];

export function EditDealModal({ deal }: { deal: Deal & { id: number } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state — initialised from deal
  const [propertyName, setPropertyName] = useState(deal.property_name);
  const [imageUrl, setImageUrl]         = useState<string | undefined>(deal.imageUrl);
  const [imagePreview, setImagePreview] = useState<string | undefined>(deal.imageUrl);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [location, setLocation]         = useState(deal.location);
  const [description, setDescription]   = useState(deal.description);
  const [category, setCategory]         = useState<Category>(deal.category);
  const [price, setPrice]               = useState(String(deal.price_per_night_ils));
  const [url, setUrl]                   = useState(deal.url === '#' ? '' : deal.url);
  const [hostName, setHostName]         = useState(deal.hostName ?? '');
  const [hostPhone, setHostPhone]       = useState(deal.hostPhone ?? '');
  const [hostEmail, setHostEmail]       = useState(deal.hostEmail ?? '');
  const [amenities, setAmenities]       = useState<string[]>(deal.amenities ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const budgetLimit = BUDGET_LIMITS[category];
  const priceNum    = parseFloat(price);
  const priceError  =
    !isNaN(priceNum) && priceNum > budgetLimit
      ? `מחיר חורג מהמגבלה — מקסימום ${budgetLimit.toLocaleString('he-IL')} ₪`
      : null;

  const trimmedUrl = url.trim();
  const urlError   = trimmedUrl !== '' && !trimmedUrl.startsWith('https://');

  const phoneDigits = hostPhone.replace(/[\s\-().+]/g, '');
  const phoneError  =
    hostPhone.trim() !== '' && !/^\d{9,13}$/.test(phoneDigits)
      ? 'מספר טלפון לא תקין (9–13 ספרות)'
      : null;

  const isValid =
    propertyName.trim() !== '' &&
    location.trim() !== '' &&
    !isNaN(priceNum) && priceNum > 0 &&
    !priceError &&
    !urlError &&
    hostName.trim() !== '' &&
    hostPhone.trim() !== '' &&
    !phoneError;

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/deals/image', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setImageUrl(url);
      }
    } finally {
      setUploadingImg(false);
    }
    e.target.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          property_name:       propertyName.trim(),
          location:            location.trim(),
          price_per_night_ils: priceNum,
          description:         description.trim(),
          url:                 trimmedUrl || '#',
          host_name:           hostName.trim(),
          host_phone:          hostPhone.trim(),
          host_email:          hostEmail.trim() || null,
          amenities,
          ...(imageUrl ? { image_url: imageUrl } : {}),
        }),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? 'עדכון נכשל, נסה שוב');
      }
    } catch {
      setError('שגיאת רשת, נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95"
      >
        <Pencil className="h-3.5 w-3.5" />
        ערוך
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
          <div
            className="relative w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            style={{ maxHeight: '92vh' }}
            dir="rtl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl bg-white px-6 py-4 shadow-[0_1px_0_#f1f5f9]">
              <h2 className="text-lg font-black text-slate-900">עריכת דיל</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-8 pt-5 space-y-4">

              {/* Image upload */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">תמונה</label>
                <div
                  className="relative aspect-[3/2] w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/40 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                      <Upload size={22} />
                      <span className="text-sm">לחץ להעלאת תמונה</span>
                    </div>
                  )}
                  {uploadingImg && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                  {imagePreview && !uploadingImg && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
                      <Upload size={12} />
                      החלף תמונה
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">שם המקום <span className="text-red-400">*</span></label>
                <input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)}
                  className={inputCls} required />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">מיקום <span className="text-red-400">*</span></label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  className={inputCls} required />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">תיאור קצר</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">קטגוריה <span className="text-red-400">*</span></label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" required>
                    <option value="vacation">חופשה (≤ 450 ₪)</option>
                    <option value="suite">סוויטה (≤ 450 ₪)</option>
                    <option value="penthouse">פנטהאוז (≤ 990 ₪)</option>
                    <option value="villa">וילה (≤ 1,990 ₪)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">מחיר ללילה (₪) <span className="text-red-400">*</span></label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    min="1"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                      priceError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                    }`} required />
                  {priceError && <p className="mt-1 text-xs font-medium text-red-500">{priceError}</p>}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">מתקנים <span className="font-normal text-gray-400">(אופציונלי)</span></label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => {
                    const selected = amenities.includes(a);
                    return (
                      <button key={a} type="button"
                        onClick={() => setAmenities((prev) => selected ? prev.filter((x) => x !== a) : [...prev, a])}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95 ${
                          selected ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {selected && <span className="ml-1 text-orange-500">✓</span>}
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">קישור להזמנה <span className="font-normal text-gray-400">(אופציונלי)</span></label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                    urlError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                  }`} />
                {urlError && <p className="mt-1 text-xs font-medium text-red-500">הקישור חייב להתחיל ב-https://</p>}
              </div>

              {/* Host */}
              <div className="my-4 flex items-center gap-3">
                <hr className="flex-1 border-gray-200" />
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-400">פרטי המארח</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">שם המארח <span className="text-red-400">*</span></label>
                <input type="text" value={hostName} onChange={(e) => setHostName(e.target.value)}
                  className={inputCls} required />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">טלפון <span className="text-red-400">*</span></label>
                <input type="tel" value={hostPhone} onChange={(e) => setHostPhone(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                    phoneError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                  }`} required />
                {phoneError && <p className="mt-1 text-xs font-medium text-red-500">{phoneError}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">אימייל <span className="font-normal text-gray-400">(אופציונלי)</span></label>
                <input type="email" value={hostEmail} onChange={(e) => setHostEmail(e.target.value)}
                  className={inputCls} />
              </div>

              {error && <p className="text-sm font-medium text-red-500">{error}</p>}

              <button type="submit" disabled={!isValid || isSubmitting || uploadingImg}
                className="w-full rounded-xl bg-orange-600 py-3 text-sm font-black text-white shadow-sm transition-all hover:bg-orange-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    שומר...
                  </span>
                ) : 'שמור שינויים'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
