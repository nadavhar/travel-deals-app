/**
 * Location-based landscape image pools.
 *
 * All URLs are verified Wikimedia Commons images (HTTP 200).
 * Each pool contains only geographically appropriate images.
 *
 * Keys are ordered specific → general so substring matching picks
 * the most precise match first.
 */

const WM   = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
const WMF  = 'https://upload.wikimedia.org/wikipedia/commons';   // full-size (no thumb path needed)

// ─── Verified image pools ─────────────────────────────────────────────────────

const EILAT_POOL = [
  `${WM}/5/5a/Eilat_night_hotels_2016.jpg/1200px-Eilat_night_hotels_2016.jpg`,
  `${WMF}/b/b3/Eilat_panorama_2.jpg`,
  `${WMF}/c/ce/North_Beach_Eilat.jpg`,
];

const TEL_AVIV_POOL = [
  `${WM}/6/69/Sarona_CBD_01_%28cropped%29.jpg/1200px-Sarona_CBD_01_%28cropped%29.jpg`,
  `${WM}/a/a3/ISR-2013-Aerial-Jaffa-Port_of_Jaffa.jpg/1200px-ISR-2013-Aerial-Jaffa-Port_of_Jaffa.jpg`,
];

const JERUSALEM_POOL = [
  `${WM}/9/94/%D7%94%D7%9E%D7%A6%D7%95%D7%93%D7%94_%D7%91%D7%9C%D7%99%D7%9C%D7%94.jpg/1200px-%D7%94%D7%9E%D7%A6%D7%95%D7%93%D7%94_%D7%91%D7%9C%D7%99%D7%9C%D7%94.jpg`,
  `${WMF}/2/22/Jerusalem_Old_city_panorama.jpg`,
  `${WMF}/3/38/Jerusalem_panorama_view_from_Mt._Scopus.jpg`,
];

const NORTH_POOL = [
  `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  `${WM}/9/9a/Banias_-_Temple_of_Pan_001.jpg/1200px-Banias_-_Temple_of_Pan_001.jpg`,
  `${WM}/a/a9/Caesarea.JPG/1200px-Caesarea.JPG`,
  `${WM}/d/dd/The_Hanging_Gardens_of_Haifa%2C_Israel_%2850099173503%29_%28cropped%29.jpg/1200px-The_Hanging_Gardens_of_Haifa%2C_Israel_%2850099173503%29_%28cropped%29.jpg`,
  `${WM}/3/3e/Nazareth_Panorama_Dafna_Tal_IMOT_%2814532097313%29.jpg/1200px-Nazareth_Panorama_Dafna_Tal_IMOT_%2814532097313%29.jpg`,
];

const DEAD_SEA_POOL = [
  `${WM}/6/6f/Dead_Sea_beach_00.JPG/1200px-Dead_Sea_beach_00.JPG`,
  `${WMF}/c/c7/119593_sunrise_over_the_dead_sea_PikiWiki_Israel.jpg`,
  `${WMF}/e/ed/Salt_pillar_at_the_Dead_Sea%2C_Israel_%2835253925685%29.jpg`,
];

const DEFAULT_POOL = [
  `${WM}/a/a1/MakhteshRamonMar262022_01.jpg/1200px-MakhteshRamonMar262022_01.jpg`,
  `${WM}/d/d2/NahalHavarimNov212022_03.jpg/1200px-NahalHavarimNov212022_03.jpg`,
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
 * Returns the first keyword in LOCATION_IMAGE_MAP that matches `location`,
 * or 'default' if nothing matches. Used to group deals by their image pool.
 */
export function getLocationKey(location: string): string {
  for (const keyword of Object.keys(LOCATION_IMAGE_MAP)) {
    if (keyword !== 'default' && location.includes(keyword)) {
      return keyword;
    }
  }
  return 'default';
}

/**
 * Returns a landscape image URL for a given Israeli location string.
 *
 * The `seed` picks deterministically from the pool — pass a per-location
 * sequential counter so each deal in the same location gets a different image.
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
