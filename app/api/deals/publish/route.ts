import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { put } from '@vercel/blob';
import { buildImagePrompt } from '@/lib/imagePrompt';
import { BUDGET_LIMITS, type Category } from '@/lib/deals';
import { createClient } from '@/lib/supabase/server';

// ─── Config ───────────────────────────────────────────────────────────────────
export const maxDuration = 60; // Vercel Pro max; covers DALL-E + upload

// Category fallbacks from our existing Wikimedia pool (never expire)
const FALLBACK_BY_CATEGORY: Record<Category, string> = {
  vacation:  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Central_Tel_Aviv_beaches_and_Jaffa_on_the_background_%289869221525%29.jpg/1280px-Central_Tel_Aviv_beaches_and_Jaffa_on_the_background_%289869221525%29.jpg',
  suite:     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Skyline_of_Tel_Aviv_by_night.jpg/1280px-Skyline_of_Tel_Aviv_by_night.jpg',
  penthouse: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Israel_Tel_Aviv_Skyline_%2834714425090%29.jpg/1280px-Israel_Tel_Aviv_Skyline_%2834714425090%29.jpg',
  villa:     'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Israel_Eilat_-_panoramio_%2812%29.jpg/1280px-Israel_Eilat_-_panoramio_%2812%29.jpg',
};

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
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

  // ── Server-side validation ────────────────────────────────────────────────
  const { category, location, description = '', amenities = [] } = body;
  const price = parseFloat(String(body.price_per_night_ils ?? ''));

  if (!category || !location || !body.hostPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!Object.keys(BUDGET_LIMITS).includes(String(category))) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  const limit = BUDGET_LIMITS[category as Category];
  if (isNaN(price) || price <= 0 || price > limit) {
    return NextResponse.json(
      { error: `Price must be between 1 and ${limit} ₪` },
      { status: 400 },
    );
  }

  // ── AI image generation → permanent storage ───────────────────────────────
  let imageUrl: string = FALLBACK_BY_CATEGORY[category as Category];

  try {
    imageUrl = await generateAndStore({
      category:    category as Category,
      location:    String(location),
      description: String(description),
      amenities:   Array.isArray(amenities) ? (amenities as string[]) : [],
    });
    console.log(`[publish] AI image stored: ${imageUrl}`);
  } catch (err) {
    // Graceful degradation — deal creation is never blocked by image failure
    console.error('[publish] Image generation failed, using fallback:', err);
  }

  // ── Persist deal to Supabase ──────────────────────────────────────────────
  const { data: savedRow, error: dbError } = await supabase
    .from('deals')
    .insert({
      user_id:             session.user.id,
      category:            String(category),
      property_name:       String(body.property_name ?? ''),
      location:            String(location),
      price_per_night_ils: price,
      description:         String(description),
      url:                 String(body.url ?? '#') || '#',
      host_name:           String(body.hostName ?? ''),
      host_phone:          String(body.hostPhone ?? ''),
      host_email:          body.hostEmail ? String(body.hostEmail) : null,
      amenities:           (amenities as string[]).length > 0 ? amenities : [],
      image_url:           imageUrl,
    })
    .select()
    .single();

  if (dbError || !savedRow) {
    console.error('[publish] DB insert error:', dbError);
    return NextResponse.json({ error: 'Failed to save deal' }, { status: 500 });
  }

  // Map DB row → Deal shape for the client
  const deal = {
    id:                  savedRow.id as number,
    category:            savedRow.category,
    property_name:       savedRow.property_name,
    location:            savedRow.location,
    price_per_night_ils: Number(savedRow.price_per_night_ils),
    description:         savedRow.description,
    url:                 savedRow.url,
    hostName:            savedRow.host_name,
    hostPhone:           savedRow.host_phone,
    hostEmail:           savedRow.host_email ?? null,
    amenities:           savedRow.amenities ?? [],
    imageUrl:            savedRow.image_url ?? imageUrl,
    userId:              savedRow.user_id,
  };

  return NextResponse.json({ deal }, { status: 201 });
}

// ─── AI generation + Vercel Blob upload ──────────────────────────────────────
async function generateAndStore(input: {
  category:    Category;
  location:    string;
  description: string;
  amenities:   string[];
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildImagePrompt(input);

  // ── Generate with DALL-E 3 (50s budget, leaves 10s for upload) ────────────
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50_000);

  let tempUrl: string;
  try {
    const response = await openai.images.generate(
      {
        model:           'dall-e-3',
        prompt,
        n:               1,
        size:            '1792x1024', // widest landscape ratio available
        quality:         'standard',
        response_format: 'url',
      },
      { signal: controller.signal as AbortSignal },
    );
    tempUrl = response.data?.[0]?.url ?? '';
    if (!tempUrl) throw new Error('Empty URL in DALL-E response');
  } finally {
    clearTimeout(timer);
  }

  // ── Fetch image buffer (temp DALL-E URLs expire in ~1 hour) ──────────────
  const imgRes = await fetch(tempUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to fetch generated image: HTTP ${imgRes.status}`);
  }
  const buffer = await imgRes.arrayBuffer();

  // ── Upload to Vercel Blob for permanent public storage ────────────────────
  const filename = `deals/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const { url: permanentUrl } = await put(filename, Buffer.from(buffer), {
    access:      'public',
    contentType: 'image/png',
  });

  return permanentUrl;
}
