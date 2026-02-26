import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BUDGET_LIMITS, type Category } from '@/lib/deals';

type RouteContext = { params: Promise<{ id: string }> };

// ─── PUT — update a deal ──────────────────────────────────────────────────────
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const dealId = Number(id);
  if (!Number.isFinite(dealId)) {
    return NextResponse.json({ error: 'Invalid deal id' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate fields
  const { category, location, host_phone } = body;
  const price = parseFloat(String(body.price_per_night_ils ?? ''));

  if (!category || !location || !host_phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!Object.keys(BUDGET_LIMITS).includes(String(category))) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  const limit = BUDGET_LIMITS[category as Category];
  if (isNaN(price) || price <= 0 || price > limit) {
    return NextResponse.json({ error: `Price must be between 1 and ${limit} ₪` }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {
    category:            String(category),
    property_name:       String(body.property_name ?? ''),
    location:            String(location),
    price_per_night_ils: price,
    description:         String(body.description ?? ''),
    url:                 String(body.url ?? '#') || '#',
    host_name:           String(body.host_name ?? ''),
    host_phone:          String(host_phone),
    host_email:          body.host_email ? String(body.host_email) : null,
    amenities:           Array.isArray(body.amenities) ? body.amenities : [],
  };
  if (body.image_url) updatePayload.image_url = String(body.image_url);

  const { data, error } = await supabase
    .from('deals')
    .update(updatePayload)
    .eq('id', dealId)
    .eq('user_id', session.user.id) // RLS + explicit ownership check
    .select()
    .single();

  if (error || !data) {
    // If no row matched, the deal either doesn't exist or belongs to another user
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }

  return NextResponse.json({ deal: data });
}

// ─── DELETE — remove a deal ───────────────────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const dealId = Number(id);
  if (!Number.isFinite(dealId)) {
    return NextResponse.json({ error: 'Invalid deal id' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', dealId)
    .eq('user_id', session.user.id); // RLS + explicit ownership check

  if (error) {
    console.error('[api/deals/[id] DELETE] DB error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
