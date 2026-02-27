import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type Deal, type Category } from '@/lib/deals';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[api/deals/public] DB error:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }

  const deals: Deal[] = (rows ?? []).map((row) => ({
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
    userId:              'db', // non-identifying marker — distinguishes DB deals from static ones
  }));

  return NextResponse.json({ deals });
}
