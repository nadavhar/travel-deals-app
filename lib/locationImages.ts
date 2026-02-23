/**
 * Location-based landscape image mapping.
 *
 * Maps Hebrew location keywords → Wikimedia Commons CDN image URLs.
 * All URLs verified HTTP 200 from upload.wikimedia.org.
 *
 * Keys are ordered specific → general so that substring matching
 * always picks the most precise match first.
 */

const WM = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

export const LOCATION_IMAGE_MAP: Record<string, string> = {
  // ── Specific sub-regions / landmarks (MUST come before city / broad keys) ──

  /** Ramon Crater — Makhtesh Ramon desert landscape */
  'מצפה רמון':    `${WM}/a/a1/MakhteshRamonMar262022_01.jpg/1200px-MakhteshRamonMar262022_01.jpg`,
  /** Dead Sea — beach shoreline */
  'ים המלח':      `${WM}/6/6f/Dead_Sea_beach_00.JPG/1200px-Dead_Sea_beach_00.JPG`,
  /** Golan Heights — Banias landscape */
  'רמת הגולן':    `${WM}/9/9a/Banias_-_Temple_of_Pan_001.jpg/1200px-Banias_-_Temple_of_Pan_001.jpg`,
  /** Upper Galilee — Sea of Galilee / Kinneret panorama */
  'גליל עליון':   `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  /** Carmel coast — Caesarea ruins by the sea */
  'חוף הכרמל':   `${WM}/a/a9/Caesarea.JPG/1200px-Caesarea.JPG`,
  /** Ein Gedi — near Dead Sea */
  'עין גדי':      `${WM}/6/6f/Dead_Sea_beach_00.JPG/1200px-Dead_Sea_beach_00.JPG`,
  /** Jordan Valley / Kinneret area */
  'עמק הירדן':    `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  /** Judean Foothills — Negev canyon landscape */
  'שפלת יהודה':  `${WM}/d/d2/NahalHavarimNov212022_03.jpg/1200px-NahalHavarimNov212022_03.jpg`,

  // ── Cities ────────────────────────────────────────────────────────────────

  /** Jaffa — aerial view of the ancient port */
  'יפו':          `${WM}/a/a3/ISR-2013-Aerial-Jaffa-Port_of_Jaffa.jpg/1200px-ISR-2013-Aerial-Jaffa-Port_of_Jaffa.jpg`,
  /** Tel Aviv — Sarona CBD skyline */
  'תל אביב':      `${WM}/6/69/Sarona_CBD_01_%28cropped%29.jpg/1200px-Sarona_CBD_01_%28cropped%29.jpg`,
  /** Jerusalem — Tower of David / Citadel at night */
  'ירושלים':      `${WM}/9/94/%D7%94%D7%9E%D7%A6%D7%95%D7%93%D7%94_%D7%91%D7%9C%D7%99%D7%9C%D7%94.jpg/1200px-%D7%94%D7%9E%D7%A6%D7%95%D7%93%D7%94_%D7%91%D7%9C%D7%99%D7%9C%D7%94.jpg`,
  /** Eilat — hotel waterfront at night */
  'אילת':         `${WM}/5/5a/Eilat_night_hotels_2016.jpg/1200px-Eilat_night_hotels_2016.jpg`,
  /** Haifa — Baha'i Hanging Gardens */
  'חיפה':         `${WM}/d/dd/The_Hanging_Gardens_of_Haifa%2C_Israel_%2850099173503%29_%28cropped%29.jpg/1200px-The_Hanging_Gardens_of_Haifa%2C_Israel_%2850099173503%29_%28cropped%29.jpg`,
  /** Tiberias — Sea of Galilee panorama */
  'טבריה':        `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  /** Kinneret — Sea of Galilee panorama */
  'כנרת':         `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  /** Nazareth — city panorama by Israel Ministry of Tourism */
  'נצרת':         `${WM}/3/3e/Nazareth_Panorama_Dafna_Tal_IMOT_%2814532097313%29.jpg/1200px-Nazareth_Panorama_Dafna_Tal_IMOT_%2814532097313%29.jpg`,
  /** Caesarea — ancient harbor ruins */
  'קיסריה':       `${WM}/a/a9/Caesarea.JPG/1200px-Caesarea.JPG`,
  /** Herzliya / Mediterranean coast — Tel Aviv skyline */
  'הרצליה':       `${WM}/6/69/Sarona_CBD_01_%28cropped%29.jpg/1200px-Sarona_CBD_01_%28cropped%29.jpg`,
  /** Nahsholim / Carmel coast — Caesarea ruins */
  'נחשולים':      `${WM}/a/a9/Caesarea.JPG/1200px-Caesarea.JPG`,
  /** Arad — Negev desert landscape */
  'ערד':          `${WM}/d/d2/NahalHavarimNov212022_03.jpg/1200px-NahalHavarimNov212022_03.jpg`,
  /** Tzfat — Galilee / Kinneret panorama */
  'צפת':          `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  /** Rosh Pina — north Galilee */
  'ראש פינה':     `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  /** Bat Yam — Mediterranean coast / Tel Aviv area */
  'בת ים':        `${WM}/6/69/Sarona_CBD_01_%28cropped%29.jpg/1200px-Sarona_CBD_01_%28cropped%29.jpg`,
  /** Ashkelon — Mediterranean coast */
  'אשקלון':       `${WM}/6/69/Sarona_CBD_01_%28cropped%29.jpg/1200px-Sarona_CBD_01_%28cropped%29.jpg`,
  /** Ashdod — Mediterranean coast */
  'אשדוד':        `${WM}/6/69/Sarona_CBD_01_%28cropped%29.jpg/1200px-Sarona_CBD_01_%28cropped%29.jpg`,
  /** Netanya — Mediterranean coast */
  'נתניה':        `${WM}/6/69/Sarona_CBD_01_%28cropped%29.jpg/1200px-Sarona_CBD_01_%28cropped%29.jpg`,

  // ── Broad regions (MUST come after specific city keys) ────────────────────

  /** Golan Heights */
  'גולן':         `${WM}/9/9a/Banias_-_Temple_of_Pan_001.jpg/1200px-Banias_-_Temple_of_Pan_001.jpg`,
  /** Galilee — Sea of Galilee panorama */
  'גליל':         `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  /** Negev Desert */
  'נגב':          `${WM}/d/d2/NahalHavarimNov212022_03.jpg/1200px-NahalHavarimNov212022_03.jpg`,
  /** Carmel / Haifa area */
  'כרמל':         `${WM}/d/dd/The_Hanging_Gardens_of_Haifa%2C_Israel_%2850099173503%29_%28cropped%29.jpg/1200px-The_Hanging_Gardens_of_Haifa%2C_Israel_%2850099173503%29_%28cropped%29.jpg`,
  /** North — generic Galilee */
  'צפון':         `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  /** South — Negev */
  'דרום':         `${WM}/d/d2/NahalHavarimNov212022_03.jpg/1200px-NahalHavarimNov212022_03.jpg`,
  /** Center — Tel Aviv / Mediterranean coast */
  'מרכז':         `${WM}/6/69/Sarona_CBD_01_%28cropped%29.jpg/1200px-Sarona_CBD_01_%28cropped%29.jpg`,

  // ── Fallback ──────────────────────────────────────────────────────────────

  /** Default: Ramon Crater — beautiful general Israeli landscape */
  'default':      `${WM}/a/a1/MakhteshRamonMar262022_01.jpg/1200px-MakhteshRamonMar262022_01.jpg`,
};

/**
 * Returns the best matching landscape image URL for a given Israeli location string.
 *
 * Algorithm: iterate LOCATION_IMAGE_MAP in insertion order (specific → general).
 * Return the URL of the first key that is a substring of `location`.
 * If nothing matches, return the 'default' image.
 *
 * @example
 *   getLocationImage('יפו, תל אביב')  // → Jaffa clock-tower photo (יפו matched first)
 *   getLocationImage('גליל עליון')     // → Upper Galilee hills photo
 *   getLocationImage('באר שבע')        // → default (no key matches)
 */
export function getLocationImage(location: string): string {
  for (const [keyword, url] of Object.entries(LOCATION_IMAGE_MAP)) {
    if (keyword !== 'default' && location.includes(keyword)) {
      return url;
    }
  }
  return LOCATION_IMAGE_MAP['default'];
}
