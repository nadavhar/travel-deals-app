/**
 * Location-based landscape image pools.
 *
 * Each major Israeli location has a pool of Unsplash images.
 * getLocationImage() picks one deterministically using a seed (deal.id)
 * so SSR and client hydration always agree on the same image.
 *
 * Keys are ordered specific → general so substring matching picks
 * the most precise match first.
 */

// ─── Image pools ──────────────────────────────────────────────────────────────

const EILAT_POOL = [
  'https://images.unsplash.com/photo-1579616497776-05829449d65e?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1591192031371-75c04b7e18c4?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1668694516449-62d00452d148?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1544978507-903224e5857e?w=800&auto=format&fit=crop&q=60',
];

const TEL_AVIV_POOL = [
  'https://images.unsplash.com/photo-1543161892-607602fb76c7?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1549581257-3c505891a2c6?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1617863723540-37061109330e?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1615822337221-530dd99031de?w=800&auto=format&fit=crop&q=60',
];

const JERUSALEM_POOL = [
  'https://images.unsplash.com/photo-1579491081978-b848de19a29d?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1492696383455-7830d7877d3a?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1627399478267-9873bb8bb0b0?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1638029669666-28a5f942c414?w=800&auto=format&fit=crop&q=60',
];

const NORTH_POOL = [
  'https://images.unsplash.com/photo-1634658707888-8d904807131d?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1606218911343-33615b25994c?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1654537128836-7b98652425a2?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1688996661805-7c8197c704f2?w=800&auto=format&fit=crop&q=60',
];

const DEAD_SEA_POOL = [
  'https://images.unsplash.com/photo-1545065004-387076dd3663?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1625599721639-6f2539d7255a?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1580301190256-893297cb4432?w=800&auto=format&fit=crop&q=60',
];

const DEFAULT_POOL = [
  'https://images.unsplash.com/photo-1629290362759-b00706823067?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1584814760960-61d60e70d571?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1678394378424-3733d016c33f?w=800&auto=format&fit=crop&q=60',
];

// ─── Keyword → pool mapping ───────────────────────────────────────────────────
// Ordered specific → general so substring matching picks the most precise key.

export const LOCATION_IMAGE_MAP: Record<string, string[]> = {
  // Specific sub-regions / landmarks
  'ים המלח':     DEAD_SEA_POOL,
  'עין גדי':     DEAD_SEA_POOL,
  'מצפה רמון':   DEFAULT_POOL,
  'רמת הגולן':   NORTH_POOL,
  'גליל עליון':  NORTH_POOL,
  'חוף הכרמל':   NORTH_POOL,
  'עמק הירדן':   NORTH_POOL,
  'שפלת יהודה':  DEFAULT_POOL,

  // Cities
  'יפו':          TEL_AVIV_POOL,
  'אילת':         EILAT_POOL,
  'ירושלים':      JERUSALEM_POOL,
  'תל אביב':      TEL_AVIV_POOL,
  'חיפה':         NORTH_POOL,
  'טבריה':        NORTH_POOL,
  'כנרת':         NORTH_POOL,
  'נצרת':         NORTH_POOL,
  'קיסריה':       NORTH_POOL,
  'הרצליה':       TEL_AVIV_POOL,
  'נחשולים':      NORTH_POOL,
  'ערד':          DEFAULT_POOL,
  'צפת':          NORTH_POOL,
  'ראש פינה':     NORTH_POOL,
  'בת ים':        TEL_AVIV_POOL,
  'אשקלון':       TEL_AVIV_POOL,
  'אשדוד':        TEL_AVIV_POOL,
  'נתניה':        TEL_AVIV_POOL,
  'עכו':          NORTH_POOL,
  'זיכרון יעקב': NORTH_POOL,
  'ערבה':         DEFAULT_POOL,

  // Broad regions
  'גולן':         NORTH_POOL,
  'גליל':         NORTH_POOL,
  'נגב':          DEFAULT_POOL,
  'כרמל':         NORTH_POOL,
  'צפון':         NORTH_POOL,
  'דרום':         DEFAULT_POOL,
  'מרכז':         TEL_AVIV_POOL,

  // Fallback
  'default':      DEFAULT_POOL,
};

/**
 * Returns a landscape image URL for a given Israeli location string.
 *
 * The `seed` (typically deal.id) deterministically picks from the pool so
 * SSR and client hydration always render the same image — no hydration mismatch.
 *
 * @example
 *   getLocationImage('יפו, תל אביב', 3)  // → TEL_AVIV_POOL[3 % 4]
 *   getLocationImage('גליל עליון', 7)     // → NORTH_POOL[7 % 4]
 *   getLocationImage('באר שבע', 0)        // → DEFAULT_POOL[0 % 3]
 */
export function getLocationImage(location: string, seed: number = 0): string {
  for (const [keyword, pool] of Object.entries(LOCATION_IMAGE_MAP)) {
    if (keyword !== 'default' && location.includes(keyword)) {
      return pool[seed % pool.length];
    }
  }
  const fallback = LOCATION_IMAGE_MAP['default'];
  return fallback[seed % fallback.length];
}
