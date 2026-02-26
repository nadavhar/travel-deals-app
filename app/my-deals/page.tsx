import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Compass, ArrowRight, PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { type Deal, type Category } from '@/lib/deals';
import { DeleteButton } from './DeleteButton';
import { EditDealModal } from './EditDealModal';

// Map DB row → Deal shape
function rowToDeal(row: Record<string, unknown>): Deal & { id: number } {
  return {
    id:                  row.id as number,
    category:            row.category as Category,
    property_name:       row.property_name as string,
    location:            row.location as string,
    price_per_night_ils: Number(row.price_per_night_ils),
    description:         row.description as string,
    url:                 row.url as string,
    hostName:            row.host_name as string,
    hostPhone:           row.host_phone as string,
    hostEmail:           (row.host_email as string | null) ?? null,
    amenities:           (row.amenities as string[] | null) ?? [],
    imageUrl:            (row.image_url as string | null) ?? undefined,
    userId:              row.user_id as string,
  };
}

const CAT_LABEL: Record<Category, string> = {
  vacation:  'חופשה',
  suite:     'סוויטה',
  penthouse: 'פנטהאוז',
  villa:     'וילה',
};

const CAT_DOT: Record<Category, string> = {
  vacation:  'bg-sky-400',
  suite:     'bg-violet-400',
  penthouse: 'bg-amber-400',
  villa:     'bg-emerald-400',
};

export default async function MyDealsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth?next=/my-deals');

  const { data: rows, error } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[my-deals] DB error:', error);
  }

  const deals = (rows ?? []).map(rowToDeal);

  return (
    <main className="min-h-screen bg-[#f8f9fb]" dir="rtl">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            לכל הדילים
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="text-lg font-black tracking-tight text-slate-800">הדילים שלי</span>
            <Compass className="h-5 w-5 shrink-0 text-orange-600" strokeWidth={1.5} />
          </div>

          <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.email}</p>
        </div>
        <div className="border-b border-gray-200" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {deals.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center py-28 text-center">
            <div className="mb-5 text-7xl">🏖️</div>
            <p className="text-xl font-bold text-gray-700">עדיין לא פרסמת דילים</p>
            <p className="mt-2 text-sm text-gray-400">חזור לדף הבית כדי לפרסם את הדיל הראשון שלך</p>
            <Link
              href="/"
              className="mt-6 flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-500 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              פרסם דיל חדש
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-800">
                {deals.length} {deals.length === 1 ? 'דיל' : 'דילים'} פורסמו
              </h1>
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-full border border-orange-500 px-4 py-1.5 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-50 active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                פרסם דיל חדש
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <MyDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MyDealCard({ deal }: { deal: Deal & { id: number } }) {
  const imgSrc = deal.imageUrl ?? null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05]">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt={deal.property_name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🏠</div>
        )}
        {/* Category badge */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${CAT_DOT[deal.category]}`} />
          <span className="text-xs font-semibold text-slate-700">{CAT_LABEL[deal.category]}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <h2 className="mb-0.5 line-clamp-1 text-[15px] font-bold text-slate-900">{deal.property_name}</h2>
        <p className="mb-2 text-xs text-gray-400">{deal.location}</p>
        <p className="mb-3 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-400">{deal.description}</p>
        <p className="mb-3 text-lg font-black text-slate-900">
          {deal.price_per_night_ils.toLocaleString('he-IL')} ₪
          <span className="text-xs font-normal text-gray-400 mr-1">/ לילה</span>
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <EditDealModal deal={deal} />
          <DeleteButton dealId={deal.id} />
        </div>
      </div>
    </article>
  );
}
