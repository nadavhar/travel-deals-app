import { NextRequest, NextResponse } from 'next/server';
import { RAW_DEALS, filterDeals } from '@/lib/deals';

// ─── Config ──────────────────────────────────────────────────────────────────
const TIMEOUT_MS  = 8_000;   // per-request timeout
const BATCH_SIZE  = 8;        // concurrent requests per batch

// ─── URL checker ─────────────────────────────────────────────────────────────
interface CheckResult {
  id:     number;
  url:    string;
  ok:     boolean;
  status: number;
  reason: string;
}

/** Returns true when the server redirected a specific deal URL to a generic
 *  homepage — the classic sign of an expired Booking.com / Airbnb listing. */
function isGenericRedirect(originalUrl: string, finalUrl: string): boolean {
  if (!finalUrl || finalUrl === originalUrl) return false;
  try {
    const orig  = new URL(originalUrl);
    const final = new URL(finalUrl);
    // Same hostname but landed on root or a generic search page
    return (
      orig.hostname === final.hostname &&
      (final.pathname === '/' || final.pathname === '' || final.pathname === '/s')
    );
  } catch {
    return false;
  }
}

async function checkUrl(id: number, url: string): Promise<CheckResult> {
  // ── HEAD request (bandwidth-friendly) ──────────────────────────────────────
  const tryFetch = async (method: 'HEAD' | 'GET'): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fetch(url, {
        method,
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DealValidator/1.0)' },
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let res = await tryFetch('HEAD');

    // Some servers block HEAD — fall back to GET
    if (res.status === 405 || res.status === 501) {
      res = await tryFetch('GET');
    }

    if (!res.ok) {
      return { id, url, ok: false, status: res.status, reason: `HTTP ${res.status}` };
    }

    if (isGenericRedirect(url, res.url)) {
      return { id, url, ok: false, status: res.status, reason: 'Redirected to homepage (deal expired)' };
    }

    return { id, url, ok: true, status: res.status, reason: 'OK' };

  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { id, url, ok: false, status: 0, reason: `Timeout after ${TIMEOUT_MS / 1000}s` };
    }
    return { id, url, ok: false, status: 0, reason: err instanceof Error ? err.message : 'Network error' };
  }
}

// ─── Cron handler ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {

  // ── Auth: only Vercel Cron (or manual calls with the secret) ─────────────
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { validDeals } = filterDeals(RAW_DEALS);
  const results: CheckResult[] = [];

  // ── Process in batches to stay within serverless memory / time limits ─────
  for (let i = 0; i < validDeals.length; i += BATCH_SIZE) {
    const batch   = validDeals.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map((deal) => checkUrl(deal.id, deal.url))
    );

    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        results.push(outcome.value);
      }
      // 'rejected' shouldn't happen — checkUrl catches all errors — but if it
      // does, skip silently so one bad deal doesn't abort the whole run.
    }
  }

  const broken  = results.filter((r) => !r.ok);
  const healthy = results.filter((r) => r.ok);

  // ── In a production system with a real DB, you would delete broken deals:
  //    await db.deal.deleteMany({ where: { id: { in: broken.map(r => r.id) } } });
  //
  //    For this static-data app the route acts as an audit report. Wire it to
  //    your data store (Vercel KV, Supabase, etc.) to enable actual cleanup.

  const payload = {
    status:     'success' as const,
    checked:    results.length,
    healthy:    healthy.length,
    broken:     broken.length,
    remaining:  healthy.length,
    timestamp:  new Date().toISOString(),
    brokenDeals: broken.map(({ id, url, status, reason }) => ({ id, url, status, reason })),
  };

  // Log to Vercel's function console for observability
  if (broken.length > 0) {
    console.warn(`[validate-deals] ${broken.length} broken deal(s) found:`, payload.brokenDeals);
  } else {
    console.log(`[validate-deals] All ${healthy.length} deals healthy.`);
  }

  return NextResponse.json(payload);
}
