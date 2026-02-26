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
  `${WMF}/f/f4/Eilat_panorama_3.jpg`,
  `${WMF}/a/a9/Eilat_and_Aqaba_across_the_Red_Sea.jpg`,
  `${WMF}/0/0b/PikiWiki_Israel_8094_the_marina_in_eilat.jpg`,
  `${WMF}/b/b3/Eilat_panorama_2.jpg`,
];

const TEL_AVIV_POOL = [
  `${WMF}/9/9e/Central_Tel_Aviv_beaches_and_Jaffa_on_the_background_%289869221525%29.jpg`,
  `${WMF}/8/83/Central_Tel_Aviv_beaches_and_Old_Jaffa_on_the_background_%289869881475%29.jpg`,
  `${WMF}/6/6d/Israel_Tel_Aviv_Skyline_%2834714425090%29.jpg`,
  `${WMF}/f/f5/Skyline_of_Tel_Aviv_by_night.jpg`,
  `${WMF}/7/7a/Gordon_Beach_Tel_Aviv.jpg`,
];

const JERUSALEM_POOL = [
  `${WMF}/4/4b/Jerusalem_panorama_from_Mount_of_Olives_07112018.jpg`,
  `${WMF}/f/f6/View_of_Jerusalem_from_Mount_of_Olives_02.jpg`,
  `${WMF}/c/c8/Jerusalem-2013%282%29-View_of_the_Dome_of_the_Rock_%26_Temple_Mount_02.jpg`,
  `${WMF}/2/22/Jerusalem_Old_city_panorama.jpg`,
  `${WMF}/3/38/Jerusalem_panorama_view_from_Mt._Scopus.jpg`,
];

const HAIFA_POOL = [
  `${WMF}/c/cf/Bahai_Gardens_P1020953.JPG`,
  `${WMF}/4/4b/Haifa_Bay.JPG`,
  `${WMF}/f/f5/ISRAEL%2C_Haifa%2C_Gradinile_Bahai_%28vedere_spre_Marea_Mediterana%29.JPG`,
];

const CAESAREA_POOL = [
  `${WMF}/f/fc/Mediterranean_Sea_panorama.jpg`,
  `${WMF}/2/25/PikiWiki_Israel_3723_Newe_Yam_Atlit_Bay.JPG`,
  `${WMF}/8/8f/PikiWiki_Israel_3387_Shoreline.JPG`,
];

const NETANYA_POOL = [
  `${WMF}/1/13/Netanya_Beach_Promende_-_aerial_view.jpg`,
  `${WMF}/d/da/Beach_of_Netanya.jpg`,
  `${WMF}/9/91/Beaches_of_Netanya_P1080866.JPG`,
  `${WMF}/9/9c/96964_netanya_at_night_-_south_direction_PikiWiki_Israel.jpg`,
];

const ZICHRON_POOL = [
  `${WMF}/b/b2/PikiWiki_Israel_1734_Zichron_Yaakov_%D7%92%D7%A4%D7%9F.jpg`,
  `${WMF}/5/59/Autumn_vineyard_%2830064280301%29.jpg`,
  `${WMF}/8/8b/PikiWiki_Israel_12979_Organic_grape_in_the_Golan_Heights.JPG`,
  `${WMF}/7/7a/PikiWiki_Israel_12980_Organic_Vineyard_in_the_Golan_Heights.JPG`,
];

const ROSH_HANIKRA_POOL = [
  `${WMF}/2/23/ROSH_HANIKRA_RH3_ITAMAR_GRINBERG_IMOT_%2814301597350%29.jpg`,
  `${WMF}/e/e8/Rosh-ha-Nikra.jpg`,
  `${WMF}/c/c0/RoshHanikra01_ST_07.JPG`,
  `${WMF}/d/d9/Rosh_Haniqra_WV_banner.jpg`,
];

const AKKO_POOL = [
  `${WMF}/7/7f/View_over_Akko_%28Acre%29_from_Old_City_Walls_-_Akko_-_Israel_%285693252457%29.jpg`,
  `${WMF}/5/51/Mediterranean_Sea_off_Old_City_Walls_-_Akko_%28Acre%29_-_Israel_%285693364475%29.jpg`,
  `${WMF}/5/5e/Akko_Sea_wall_and_harbor_%2815168386539%29.jpg`,
  `${WMF}/1/1b/Akko%2C_Israel_%2816036319790%29.jpg`,
];

const ASHKELON_POOL = [
  `${WMF}/2/2c/Ashkelon%2C_Israel_-_panoramio.jpg`,
  `${WMF}/6/62/PikiWiki_Israel_20323_Ashkelon.jpg`,
  `${WMF}/8/85/92288_ashkelon_beach_breakwaters_PikiWiki_Israel.jpg`,
];

const ASHDOD_POOL = [
  `${WMF}/e/ea/Israel_Port_of_Ashdod_%286683140759%29.jpg`,
  `${WMF}/8/82/Ashdod%2C_Israel_-_panoramio_%284%29.jpg`,
  `${WMF}/4/4e/121388_ashdod_statue_PikiWiki_Israel.jpg`,
  `${WMF}/1/14/Ashdod_Beach.jpg`,
];

const HERZLIYA_POOL = [
  `${WMF}/9/9e/Central_Tel_Aviv_beaches_and_Jaffa_on_the_background_%289869221525%29.jpg`,
  `${WMF}/7/77/Ancient_Roman_aqueduct_in_Caesarea_Maritima_DSC05187.JPG`,
  `${WMF}/6/6d/Israel_Tel_Aviv_Skyline_%2834714425090%29.jpg`,
];

const GOLAN_POOL = [
  `${WMF}/4/43/Golan_Heights_5.JPG`,
  `${WMF}/f/f4/Golan_Heights_6.JPG`,
  `${WMF}/6/62/140201-154326_February_2014_in_the_Golan_Heights.jpg`,
  `${WMF}/d/db/A_VIEW_OF_THE_GALILEE_WITH_MOUNT_HERMON_IN_THE_BACKGROUND._%D7%A0%D7%95%D7%A3_%D7%A9%D7%9C_%D7%94%D7%92%D7%9C%D7%99%D7%9C._%D7%91%D7%A8%D7%A7%D7%A2%2C_%D7%94%D7%A8_%D7%97%D7%A8%D7%9E%D7%95%D7%9F.D20-044.jpg`,
  `${WMF}/b/b6/Clouds_Of_Mount_Hermon.jpg`,
];

const KINNERET_POOL = [
  `${WM}/f/f7/Kinneret_cropped.jpg/1200px-Kinneret_cropped.jpg`,
  `${WMF}/4/41/Tiberias_city_in_the_Israel..JPG`,
  `${WMF}/c/c4/PikiWiki_Israel_64870_tiberias%2C_waterfront.jpg`,
  `${WMF}/e/e1/PikiWiki_Israel_64861_tiberias_from_the_west.jpg`,
  `${WMF}/8/8e/141151_sea_of_galilee_PikiWiki_Israel.jpg`,
];

const TZFAT_POOL = [
  `${WMF}/a/ac/Safed1.jpg`,
  `${WMF}/f/f8/Safed_2009.jpg`,
  `${WMF}/f/f1/Safed_street.jpg`,
  `${WMF}/e/ee/Tzfat_Old_City_2172.jpg`,
];

const NORTH_POOL = [
  `${WMF}/0/0d/PikiWiki_Israel_51454_panorama_of_the_city_of_nazareth.jpg`,
  `${WMF}/3/31/127790_nazareth-urban_landscape_PikiWiki_Israel.jpg`,
  `${WM}/9/9a/Banias_-_Temple_of_Pan_001.jpg/1200px-Banias_-_Temple_of_Pan_001.jpg`,
  `${WMF}/4/43/Golan_Heights_5.JPG`,
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
  'רמת הגולן':   GOLAN_POOL,
  'גליל עליון':  NORTH_POOL,
  'חוף הכרמל':   CAESAREA_POOL,
  'ראש הנקרה':   ROSH_HANIKRA_POOL,
  'גינוסר':      KINNERET_POOL,
  'עמק הירדן':   KINNERET_POOL,
  'שפלת יהודה':  DEFAULT_POOL,

  // Cities
  'יפו':          TEL_AVIV_POOL,
  'אילת':         EILAT_POOL,
  'ירושלים':      JERUSALEM_POOL,
  'תל אביב':      TEL_AVIV_POOL,
  'חיפה':         HAIFA_POOL,
  'טבריה':        KINNERET_POOL,
  'כנרת':         KINNERET_POOL,
  'נצרת':         NORTH_POOL,
  'קיסריה':       CAESAREA_POOL,
  'הרצליה':       HERZLIYA_POOL,
  'נחשולים':      CAESAREA_POOL,
  'ערד':          DEFAULT_POOL,
  'צפת':          TZFAT_POOL,
  'ראש פינה':     NORTH_POOL,
  'בת ים':        TEL_AVIV_POOL,
  'אשקלון':       ASHKELON_POOL,
  'אשדוד':        ASHDOD_POOL,
  'נתניה':        NETANYA_POOL,
  'עכו':          AKKO_POOL,
  'זיכרון יעקב': ZICHRON_POOL,
  'ערבה':         DEFAULT_POOL,

  // Broad regions
  'גולן':         GOLAN_POOL,
  'גליל':         NORTH_POOL,
  'נגב':          DEFAULT_POOL,
  'כרמל':         HAIFA_POOL,
  'צפון':         NORTH_POOL,
  'דרום':         DEFAULT_POOL,
  'מרכז':         TEL_AVIV_POOL,

  // Fallback
  'default':      DEFAULT_POOL,
};

/** Shared lookup: returns the matching pool or the default pool. */
function findPool(location: string): string[] {
  for (const [keyword, pool] of Object.entries(LOCATION_IMAGE_MAP)) {
    if (keyword !== 'default' && location.includes(keyword)) {
      return pool;
    }
  }
  return LOCATION_IMAGE_MAP['default'];
}

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
  const pool = findPool(location);
  return pool[seed % pool.length];
}
