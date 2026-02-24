// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Category = 'vacation' | 'suite' | 'penthouse' | 'villa';

export interface RawDeal {
  id: number;
  category: Category;
  property_name: string;
  /** Clean city / region name — e.g. "אילת", "גליל עליון" */
  location: string;
  /** Agent rule: silently drop any deal where this is false */
  is_in_israel: boolean;
  price_per_night_ils: number;
  description: string;
  /** Original scraped deal page URL */
  url: string;
}

/** Clean output shape — no internal filtering fields, no image field */
export interface Deal {
  id: number;
  category: Category;
  property_name: string;
  location: string;
  price_per_night_ils: number;
  description: string;
  url: string;
}

export interface FilterResult {
  validDeals: Deal[];
  rejectedCount: number;
  rejectedByLocation: number;
  rejectedByBudget: number;
  rejectedByUrl: number;
  rejectionReasons: Array<{ name: string; reason: string; type: 'location' | 'budget' | 'url' }>;
}

/** Rule 3 — URL must be a valid absolute https:// deep link */
function isValidDeepLink(url: string): boolean {
  return typeof url === 'string' && url.startsWith('https://');
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT RULES
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum price per night (ILS) by category */
export const BUDGET_LIMITS: Record<Category, number> = {
  vacation: 450,
  suite: 450,
  penthouse: 990,
  villa: 1990,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  vacation: 'חופשה',
  suite: 'סוויטה',
  penthouse: 'פנטהאוז',
  villa: 'וילה',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  vacation: 'bg-sky-100 text-sky-800',
  suite: 'bg-purple-100 text-purple-800',
  penthouse: 'bg-amber-100 text-amber-800',
  villa: 'bg-emerald-100 text-emerald-800',
};

export const CATEGORY_ACCENT: Record<Category, string> = {
  vacation: 'bg-sky-500',
  suite: 'bg-purple-500',
  penthouse: 'bg-amber-500',
  villa: 'bg-emerald-500',
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE PAYLOAD  (47 valid · 17 invalid — location, budget & URL violations)
// ─────────────────────────────────────────────────────────────────────────────

export const RAW_DEALS: RawDeal[] = [

  // ── VALID ────────────────────────────────────────────────────────────────

  {
    id: 1,
    category: 'vacation',
    property_name: 'מלון בוטיק יפו',
    location: 'יפו, תל אביב',
    is_in_israel: true,
    price_per_night_ils: 420,
    description: 'מלון בוטיק קסום בלב יפו העתיקה עם נוף לים ואווירה מדהימה. כולל ארוחת בוקר עשירה ומרפסת פרטית.',
    url: 'https://www.booking.com/hotel/il/margosa-tel-aviv-jaffa.html',
  },
  {
    id: 2,
    category: 'vacation',
    property_name: 'צימר הכנרת',
    location: 'טבריה',
    is_in_israel: true,
    price_per_night_ils: 380,
    description: 'צימר נעים עם נוף פנורמי עוצר נשימה לכנרת. שקט מוחלט, מרפסת ענקית וסגנון כפרי חמים.',
    url: 'https://www.booking.com/hotel/il/ginosar-inn-country-lodging.html',
  },
  {
    id: 3,
    category: 'vacation',
    property_name: 'בית הארחה הכרמל',
    location: 'חיפה',
    is_in_israel: true,
    price_per_night_ils: 320,
    description: 'לינה וארוחת בוקר ביתית בלב הכרמל עם נוף לים התיכון. מיקום אידיאלי לסיורים בעיר.',
    url: 'https://www.booking.com/hotel/il/haifa-guest-house-haifa.html',
  },
  {
    id: 4,
    category: 'vacation',
    property_name: 'אכסניית מצפה רמון',
    location: 'מצפה רמון',
    is_in_israel: true,
    price_per_night_ils: 290,
    description: 'לינה ייחודית על שפת המכתש הגדול בעולם. כולל טיול לילי לצפייה בכוכבים וארוחת בוקר ישראלית.',
    url: 'https://www.booking.com/hotel/il/mitzpe-ramon-youth-hostel.html',
  },
  {
    id: 5,
    category: 'suite',
    property_name: 'סוויטת מלכים ירושלים',
    location: 'ירושלים',
    is_in_israel: true,
    price_per_night_ils: 440,
    description: "סוויטה מפוארת מול חומות העיר העתיקה עם ג'קוזי פרטי ועיצוב מזרחי ייחודי.",
    url: 'https://www.21floorhotel.com/',
  },
  {
    id: 6,
    category: 'suite',
    property_name: 'סוויטת ספא ים המלח',
    location: 'ים המלח',
    is_in_israel: true,
    price_per_night_ils: 410,
    description: 'סוויטה מפנקת עם גישה ישירה לחוף ים המלח, טיפולי ספא כלולים ומרפסת פרטית עם נוף ירדן.',
    url: 'https://www.lothotel.com/',
  },
  {
    id: 7,
    category: 'penthouse',
    property_name: 'פנטהאוז הרצליה פיתוח',
    location: 'הרצליה פיתוח',
    is_in_israel: true,
    price_per_night_ils: 850,
    description: "פנטהאוז יוקרתי עם בריכה פרטית על הגג ונוף 360° לים התיכון. עיצוב אדריכלי מרהיב, שרות קונסיירז'.",
    url: 'https://www.airbnb.com/rooms/25159305',
  },
  {
    id: 8,
    category: 'penthouse',
    property_name: 'פנטהאוז קיסריה',
    location: 'קיסריה',
    is_in_israel: true,
    price_per_night_ils: 750,
    description: 'פנטהאוז מודרני ליד שדה הגולף ומהרומן ההיסטורי של קיסריה. שרות אישי ומרפסת עם נוף לים.',
    url: 'https://www.airbnb.com/rooms/15983768',
  },
  {
    id: 9,
    category: 'villa',
    property_name: 'וילה הגליל העליון',
    location: 'גליל עליון',
    is_in_israel: true,
    price_per_night_ils: 1800,
    description: 'וילה פרטית מפוארת בלב הגליל: בריכה, 5 חדרי שינה, גינה ירוקה ויער. מושלם לאירועים ומשפחות.',
    url: 'https://www.airbnb.com/eastern-upper-galilee-israel/stays/villas',
  },
  {
    id: 10,
    category: 'villa',
    property_name: 'וילת החוף אשקלון',
    location: 'אשקלון',
    is_in_israel: true,
    price_per_night_ils: 1650,
    description: 'וילה יוקרתית ישירות על הים עם בריכה מחוממת, 4 חדרי שינה ויציאה פרטית לחוף חולי מושלם.',
    url: 'https://www.airbnb.com/rooms/938761621123676466',
  },
  {
    id: 19,
    category: 'vacation',
    property_name: 'אברהם הוסטל תל אביב',
    location: 'תל אביב',
    is_in_israel: true,
    price_per_night_ils: 240,
    description: 'אחד המקומות הפופולריים ביותר בתל אביב לטיילים. אווירה תוססת, בר ברחבה וחדרים נוחים במחיר מצוין.',
    url: 'https://abrahamhostels.com/tel-aviv/',
  },
  {
    id: 20,
    category: 'vacation',
    property_name: 'פאוזי עזאר אין',
    location: 'נצרת',
    is_in_israel: true,
    price_per_night_ils: 310,
    description: 'אחוזה ערבית בת 200 שנה בלב הרובע הנוצרי של נצרת. קירות אבן, תקרות קמרונות ואווירה ייחודית.',
    url: 'https://www.fauziazarinn.com/',
  },
  {
    id: 21,
    category: 'vacation',
    property_name: 'בית הארחה קיבוץ כנרת',
    location: 'כנרת, עמק הירדן',
    is_in_israel: true,
    price_per_night_ils: 265,
    description: 'הקיבוץ ההיסטורי הראשון בישראל. לינה על שפת הכנרת, גינות מטופחות ובריכה.',
    url: 'https://www.booking.com/hotel/il/ginosar-inn-country-lodging.html',
  },
  {
    id: 22,
    category: 'vacation',
    property_name: 'אכסניית עין גדי',
    location: 'עין גדי, ים המלח',
    is_in_israel: true,
    price_per_night_ils: 370,
    description: 'שוכנת בתוך שמורת הטבע של עין גדי, 10 דקות ממצדה. ארוחת בוקר בופה כלולה ובריכת שחייה.',
    url: 'https://www.booking.com/hotel/il/ein-gedi.html',
  },
  {
    id: 23,
    category: 'vacation',
    property_name: 'אייביס תל אביב',
    location: 'תל אביב',
    is_in_israel: true,
    price_per_night_ils: 390,
    description: 'מלון רשת בינלאומי במיקום מרכזי על יד שוק הכרמל. חדרים מודרניים, נקיים ונוחים.',
    url: 'https://all.accor.com/hotel/8767/index.he.shtml',
  },
  {
    id: 24,
    category: 'vacation',
    property_name: 'אברהם הוסטל ירושלים',
    location: 'ירושלים',
    is_in_israel: true,
    price_per_night_ils: 220,
    description: 'מרחק הליכה משוק מחנה יהודה ושער יפו. בר גג פנורמי, אירועי תרבות כל ערב וחדרים לכל כיס.',
    url: 'https://abrahamhostels.com/jerusalem/',
  },
  {
    id: 25,
    category: 'suite',
    property_name: 'סוויטת קיבוץ נחשולים',
    location: 'נחשולים, חוף הכרמל',
    is_in_israel: true,
    price_per_night_ils: 430,
    description: 'סוויטה בקיבוץ מלון ישירות על חוף הים התיכון. שרידי עיר פיניקית עתיקה, בריכה וחוף פרטי לאורחים.',
    url: 'https://www.booking.com/hotel/il/nachsholim.html',
  },
  {
    id: 26,
    category: 'suite',
    property_name: 'סוויטת ספא מלון ערד',
    location: 'ערד',
    is_in_israel: true,
    price_per_night_ils: 415,
    description: 'ערד נחשבת לעיר עם האוויר הנקי ביותר בישראל. סוויטת ספא עם נוף למדבר, 30 דקות ממצדה.',
    url: 'https://www.booking.com/hotel/il/yehelim-boutique.html',
  },
  {
    id: 27,
    category: 'suite',
    property_name: 'סוויטת אלמוגים אילת',
    location: 'אילת',
    is_in_israel: true,
    price_per_night_ils: 445,
    description: 'סוויטה ממש על הטיילת עם נוף לים סוף ולהרי אדום. כולל גישה לבריכה, ספא וארוחת בוקר מפנקת.',
    url: 'https://www.booking.com/hotel/il/almog-eilat.html',
  },
  {
    id: 28,
    category: 'penthouse',
    property_name: "לאונרדו קלאב אילת — פנטהאוז",
    location: 'אילת',
    is_in_israel: true,
    price_per_night_ils: 870,
    description: "ריזורט הכל-כלול המוביל של אילת עם גישה ל-7 בריכות. פנטהאוז עם מרפסת פרטית, ג'קוזי ונוף לשמורת האלמוגים.",
    url: 'https://www.leonardo-hotels.co.il/he/eilat/leonardo-club-eilat',
  },
  {
    id: 29,
    category: 'penthouse',
    property_name: 'פנטהאוז דן קיסריה',
    location: 'קיסריה',
    is_in_israel: true,
    price_per_night_ils: 940,
    description: 'פנטהאוז בלעדי בריזורט הגולף של דן קיסריה. מגרש גולף בינלאומי ורצועת חוף מרהיבה צמודים.',
    url: 'https://www.danhotels.com/caesareahotels',
  },
  {
    id: 30,
    category: 'villa',
    property_name: 'וילה רמת הגולן',
    location: 'רמת הגולן',
    is_in_israel: true,
    price_per_night_ils: 1720,
    description: 'וילה מפנקת עם נוף להר חרמון. בריכה מחוממת, 4 חדרי שינה, מרפסת ענקית ויין מיקב שכן.',
    url: 'https://www.airbnb.com/rooms/17362818',
  },
  {
    id: 31,
    category: 'villa',
    property_name: 'וילת גבעות יהודה',
    location: 'שפלת יהודה',
    is_in_israel: true,
    price_per_night_ils: 1480,
    description: 'וילה כפרית בין כרמי ענבים וגנים, 40 דקות מתל אביב. גינה ים-תיכונית, בריכה ו-3 חדרי שינה.',
    url: 'https://www.airbnb.com/judean-foothills-israel/stays/villas',
  },

  // ── NEW VALID ─────────────────────────────────────────────────────────────

  {
    id: 41,
    category: 'vacation',
    property_name: 'מלון בוטיק ענבל צפת',
    location: 'צפת',
    is_in_israel: true,
    price_per_night_ils: 340,
    description: 'מלון בוטיק קסום בעיר המיסטית צפת עם נוף לגליל ואווירה רוחנית ייחודית. חדרים מוקפדים עם אבן גלילית וחצר פנימית.',
    url: 'https://www.booking.com/hotel/il/inn-of-safed.html',
  },
  {
    id: 42,
    category: 'vacation',
    property_name: 'מלון נפטון נתניה',
    location: 'נתניה',
    is_in_israel: true,
    price_per_night_ils: 395,
    description: 'מלון ישירות על הקליף מעל חוף הים בנתניה. נוף פנורמי לים התיכון, בריכה ומרחק הליכה ממרכז העיר.',
    url: 'https://www.booking.com/hotel/il/neptune-netanya.html',
  },
  {
    id: 43,
    category: 'vacation',
    property_name: "ג'ן אין עכו העתיקה",
    location: 'עכו',
    is_in_israel: true,
    price_per_night_ils: 275,
    description: "בית הארחה בלב העיר העתיקה של עכו, אתר מורשת עולמי של יונסק\"ו. קירות צלבניים, חצר פרטית ואווירה היסטורית.",
    url: 'https://www.booking.com/hotel/il/arabesque-acre.html',
  },
  {
    id: 44,
    category: 'vacation',
    property_name: 'צימר ראש הנקרה',
    location: 'ראש הנקרה, צפון',
    is_in_israel: true,
    price_per_night_ils: 410,
    description: 'צימר חמים ליד המנהרות המפורסמות של ראש הנקרה. נוף לים התיכון ולחוף הלבנוני, שקט מוחלט ואוויר ים.',
    url: 'https://www.booking.com/hotel/il/rosh-hanikra-kibbutz.html',
  },
  {
    id: 45,
    category: 'vacation',
    property_name: 'בית הארחה הבארון זיכרון יעקב',
    location: 'זיכרון יעקב',
    is_in_israel: true,
    price_per_night_ils: 330,
    description: 'אכסניית מורשת בלב מושבת הרוטשילד ההיסטורית. רחוב הנדיב, כרמים ויקבים על הר הכרמל עם ארוחת בוקר ביתית.',
    url: 'https://www.booking.com/hotel/il/baron-zichron-yaakov.html',
  },
  {
    id: 46,
    category: 'suite',
    property_name: 'סוויטת בוטיק צפת',
    location: 'צפת',
    is_in_israel: true,
    price_per_night_ils: 435,
    description: "סוויטה מפנקת בבניין עות'מאני משוחזר ברובע האמנים של צפת. פטיו פרטי, נרות ואובייקטי אמנות מקוריים.",
    url: 'https://www.booking.com/hotel/il/rimon-inn-safed.html',
  },
  {
    id: 47,
    category: 'suite',
    property_name: 'סוויטת ספא חוף אשדוד',
    location: 'אשדוד',
    is_in_israel: true,
    price_per_night_ils: 400,
    description: 'סוויטה מודרנית מול הים עם ספא פרטי ונוף עוצר נשימה לים התיכון. קרוב לנמל אשדוד ולאיילון מול.',
    url: 'https://www.booking.com/hotel/il/herods-ashdod-hotel.html',
  },
  {
    id: 48,
    category: 'suite',
    property_name: 'סוויטת ריזורט גינוסר',
    location: 'כנרת, עמק הירדן',
    is_in_israel: true,
    price_per_night_ils: 445,
    description: 'סוויטה מפוארת ישירות על שפת הכנרת בקיבוץ גינוסר. בריכת אינפיניטי עם נוף לכנרת וסירת מנוע לאורחים.',
    url: 'https://www.nof-ginosar.co.il/',
  },
  {
    id: 49,
    category: 'penthouse',
    property_name: 'פנטהאוז מבט ים נתניה',
    location: 'נתניה',
    is_in_israel: true,
    price_per_night_ils: 780,
    description: 'פנטהאוז מרהיב על צוק הים בנתניה עם מרפסת ענקית מול ים התיכון. 3 חדרי שינה, מטבח מלא ועיצוב יוקרתי.',
    url: 'https://www.airbnb.com/rooms/34521987',
  },
  {
    id: 50,
    category: 'penthouse',
    property_name: 'פנטהאוז ים-כרמל חיפה',
    location: 'חיפה',
    is_in_israel: true,
    price_per_night_ils: 890,
    description: 'פנטהאוז מעוצב בשכונת הכרמל התיכון עם נוף ל-180° על המפרץ, הנמל ורכבל הכרמל. גג פרטי ובריכת שמש.',
    url: 'https://www.airbnb.com/rooms/43129876',
  },
  {
    id: 51,
    category: 'penthouse',
    property_name: 'פנטהאוז אחוזת מדבר ספיר',
    location: 'ערבה, נגב',
    is_in_israel: true,
    price_per_night_ils: 920,
    description: 'פנטהאוז אקולוגי בלב הערבה מול הרי אדום. חוויה שמיימית ייחודית עם בריכת שמש, ספא ושתיקת מדבר.',
    url: 'https://www.airbnb.com/rooms/29847561',
  },
  {
    id: 52,
    category: 'villa',
    property_name: 'וילת כרמל זיכרון יעקב',
    location: 'זיכרון יעקב',
    is_in_israel: true,
    price_per_night_ils: 1690,
    description: 'וילה יוקרתית בין כרמי ענבים של זיכרון יעקב עם בריכה, 4 חדרים ונוף לים התיכון. כולל סיור יקב פרטי.',
    url: 'https://www.airbnb.com/rooms/22938451',
  },
  {
    id: 53,
    category: 'villa',
    property_name: 'וילת ספא ים המלח',
    location: 'ים המלח',
    is_in_israel: true,
    price_per_night_ils: 1880,
    description: 'וילה פרטית מפנקת עם גישה לחוף ים המלח ובריכה מינרלית. 3 חדרי שינה, ספא פרטי ועיצוב מדברי-מודרני.',
    url: 'https://www.airbnb.com/rooms/51234789',
  },
  {
    id: 54,
    category: 'villa',
    property_name: "וילת הגולן ביוסף",
    location: 'רמת הגולן',
    is_in_israel: true,
    price_per_night_ils: 1590,
    description: 'וילה כפרית בין פרחי הגולן ויקב שכן. בריכה מחוממת, 4 חדרים ונוף להר חרמון ובקעת החולה.',
    url: 'https://www.airbnb.com/rooms/18274635',
  },
  {
    id: 55,
    category: 'villa',
    property_name: 'וילת הדרום אילת',
    location: 'אילת',
    is_in_israel: true,
    price_per_night_ils: 1950,
    description: 'וילה פרטית עם נוף לים סוף ולהרי ירדן ומצרים. בריכה מחוממת, 5 חדרים, מגרש טניס וחוף פרטי.',
    url: 'https://www.airbnb.com/rooms/67812345',
  },

  // ── REAL PROPERTIES — sourced from live web search ────────────────────────

  // vacation
  {
    id: 56,
    category: 'vacation',
    property_name: 'אברהם הוסטל תל אביב — חדר פרטי',
    location: 'תל אביב',
    is_in_israel: true,
    price_per_night_ils: 280,
    description: 'חדר זוגי פרטי באחד ההוסטלים הכי מדורגים בתל אביב. בר גג פנורמי, אירועי תרבות כל ערב ואווירה קהילתית שוקקת.',
    url: 'https://www.booking.com/hotel/il/abraham-hostel-tel-aviv.html',
  },
  {
    id: 57,
    category: 'vacation',
    property_name: 'יחידת קסם ים המלח',
    location: 'אבנת, ים המלח',
    is_in_israel: true,
    price_per_night_ils: 350,
    description: 'דירת 2 חדרים חדשה עם נוף ישיר לים המלח. 5 דקות מהחוף, חצי שעה מעין גדי ומצדה. מדורג 4.92 כוכבים.',
    url: 'https://www.airbnb.com/rooms/17129473',
  },

  // penthouse
  {
    id: 58,
    category: 'penthouse',
    property_name: 'The Penthouse — יפו-תל אביב',
    location: 'יפו, תל אביב',
    is_in_israel: true,
    price_per_night_ils: 850,
    description: 'פנטהאוז יוקרתי עם מעלית פרטית לסלון ועיצוב בהשראת ארמון מרוקאי. צעדים מהים. מדורג 4.94 כוכבים, 176 ביקורות.',
    url: 'https://www.airbnb.com/rooms/19904504',
  },
  {
    id: 59,
    category: 'penthouse',
    property_name: 'פנטהאוז מדהים ביפו העתיקה',
    location: 'יפו, תל אביב',
    is_in_israel: true,
    price_per_night_ils: 780,
    description: 'פנטהאוז ייחודי ברובע יפו ההיסטורי עם אווירה בלתי נשכחת ונוף לגגות העיר העתיקה. מדורג 4.97 כוכבים.',
    url: 'https://www.airbnb.com/rooms/534074',
  },
  {
    id: 60,
    category: 'penthouse',
    property_name: 'The Verenda — שדרות בן גוריון',
    location: 'תל אביב',
    is_in_israel: true,
    price_per_night_ils: 920,
    description: 'פנטהאוז 3 חדרי שינה על שדרות בן גוריון התוססת. מרפסת מרווחת עם שולחן אוכל, עיצוב מודרני, עד 6 אורחים.',
    url: 'https://www.airbnb.com/rooms/48456209',
  },
  {
    id: 61,
    category: 'penthouse',
    property_name: 'פנטהאוז 62 בהשדרה — אילת',
    location: 'אילת',
    is_in_israel: true,
    price_per_night_ils: 680,
    description: 'פנטהאוז מודרני עם ריהוט אירופאי יוקרתי, מזרנים אורתופדיים, WiFi וחנייה חינם. קפה איטלקי וסבון צרפתי כלולים.',
    url: 'https://www.airbnb.com/rooms/1219876683734267374',
  },

  // villa
  {
    id: 62,
    category: 'villa',
    property_name: 'וילה אייל — חוף ים סוף',
    location: 'אילת',
    is_in_israel: true,
    price_per_night_ils: 1750,
    description: 'וילה עם בריכה פרטית בשכונה משפחתית שקטה, 5 דקות הליכה מחופי ים סוף. עד 6 אורחים. מדורג 4.96 כוכבים.',
    url: 'https://www.airbnb.com/rooms/19298922',
  },
  {
    id: 63,
    category: 'villa',
    property_name: '"ARADA" בית יוקרה — ערד',
    location: 'ערד',
    is_in_israel: true,
    price_per_night_ils: 1450,
    description: 'וילה 4 חדרים עם שתי מרפסות ומצפה לנוף המדבר היהודי וים המלח. ספא, ארוחת בוקר ושירות איסוף אישי. 25 דקות מים המלח.',
    url: 'https://www.airbnb.com/rooms/45095573',
  },
  {
    id: 64,
    category: 'villa',
    property_name: 'וילת ים המלח הייחודית',
    location: 'אבנת, ים המלח',
    is_in_israel: true,
    price_per_night_ils: 1380,
    description: 'וילה מעוצבת בצפון ים המלח עם גינה ירוקה 300 מ"ר, בריכת קיץ ו-3 חדרי שינה. נוף להרים ולים המלח. מדורג 4.9 כוכבים.',
    url: 'https://www.airbnb.com/rooms/1191197232357241359',
  },

  // ── INVALID — silently dropped by the agent ───────────────────────────────

  // 🌍 Location violations (not in Israel)
  {
    id: 11,
    category: 'vacation',
    property_name: 'Hotel de Paris Montmartre',
    location: 'פריז, צרפת',
    is_in_israel: false,
    price_per_night_ils: 310,
    description: 'מלון רומנטי בשכונת מונמארטר.',
    url: '#',
  },
  {
    id: 12,
    category: 'villa',
    property_name: 'Villa Toscana Classica',
    location: 'טוסקנה, איטליה',
    is_in_israel: false,
    price_per_night_ils: 1700,
    description: 'וילה מסורתית בין כרמי ענבים בטוסקנה.',
    url: '#',
  },
  {
    id: 13,
    category: 'suite',
    property_name: 'Athens Grand Suite',
    location: 'אתונה, יוון',
    is_in_israel: false,
    price_per_night_ils: 380,
    description: 'סוויטה עם נוף לאקרופוליס.',
    url: '#',
  },
  {
    id: 14,
    category: 'villa',
    property_name: 'Miami Beach Villa',
    location: 'מיאמי, ארה"ב',
    is_in_israel: false,
    price_per_night_ils: 2800,
    description: 'וילה ענקית על חוף מיאמי.',
    url: '#',
  },
  {
    id: 32,
    category: 'suite',
    property_name: 'Aphrodite Hills Suite Cyprus',
    location: 'פאפוס, קפריסין',
    is_in_israel: false,
    price_per_night_ils: 420,
    description: 'ריזורט יוקרתי בקפריסין. קרוב לישראל — אבל לא ישראל.',
    url: '#',
  },
  {
    id: 33,
    category: 'penthouse',
    property_name: 'Burj Al Arab Penthouse',
    location: 'דובאי, איחוד האמירויות',
    is_in_israel: false,
    price_per_night_ils: 980,
    description: 'פנטהאוז יוקרה בדובאי.',
    url: '#',
  },
  {
    id: 34,
    category: 'villa',
    property_name: 'וילת שארם אל-שיח',
    location: 'שארם אל-שיח, מצרים',
    is_in_israel: false,
    price_per_night_ils: 1600,
    description: 'וילה פרטית ליד שמורת האלמוגים של שארם — סיני, לא ישראל.',
    url: '#',
  },

  // 💸 Budget violations (in Israel, but price exceeds category limit)
  {
    id: 15,
    category: 'suite',
    property_name: 'סוויטת גראנד תל אביב',
    location: 'תל אביב',
    is_in_israel: true,
    price_per_night_ils: 520, // limit 450 — over by 70 ₪
    description: 'סוויטה יוקרתית במגדל יוקרה במרכז תל אביב.',
    url: '#',
  },
  {
    id: 16,
    category: 'penthouse',
    property_name: 'פנטהאוז מגדל ים',
    location: 'תל אביב',
    is_in_israel: true,
    price_per_night_ils: 1200, // limit 990 — over by 210 ₪
    description: 'פנטהאוז על קו הים בתל אביב.',
    url: '#',
  },
  {
    id: 17,
    category: 'vacation',
    property_name: 'בית הארחה ירושלים',
    location: 'ירושלים',
    is_in_israel: true,
    price_per_night_ils: 460, // limit 450 — over by just 10 ₪!
    description: 'בית הארחה נעים בירושלים. נפסל בגלל 10 ₪ בלבד.',
    url: '#',
  },
  {
    id: 18,
    category: 'penthouse',
    property_name: 'פנטהאוז איילת השחר',
    location: 'אילת',
    is_in_israel: true,
    price_per_night_ils: 995, // limit 990 — over by just 5 ₪!
    description: 'פנטהאוז מרהיב בקצה דרום ישראל. נפסל ב-5 ₪ בלבד!',
    url: '#',
  },
  {
    id: 35,
    category: 'vacation',
    property_name: 'מלון ענת בת ים',
    location: 'בת ים',
    is_in_israel: true,
    price_per_night_ils: 451, // limit 450 — over by just 1 ₪!!
    description: 'מלון נוח ליד הים. נפסל ב-1 ₪ בלבד — חוק הוא חוק!',
    url: '#',
  },
  {
    id: 36,
    category: 'villa',
    property_name: 'וילת הבוטיק ראש פינה',
    location: 'ראש פינה',
    is_in_israel: true,
    price_per_night_ils: 2100, // limit 1990 — over by 110 ₪
    description: 'וילה עיצובית בראש פינה ההיסטורית. יפה מאוד, אבל חורגת מהתקציב.',
    url: '#',
  },

  // 🔗 URL validation violations (in Israel, within budget — dropped for bad URL)
  {
    id: 37,
    category: 'vacation',
    property_name: 'צימר גנים בגליל',
    location: 'גליל',
    is_in_israel: true,
    price_per_night_ils: 320,
    description: 'צימר ירוק בלב הגליל עם בריכה ומרפסת. נפסל: URL חסר לחלוטין.',
    url: '', // DROPPED: empty URL
  },
  {
    id: 38,
    category: 'suite',
    property_name: 'סוויטת הכנרת העליונה',
    location: 'טבריה',
    is_in_israel: true,
    price_per_night_ils: 380,
    description: 'סוויטה עם נוף ישיר לכנרת. נפסל: URL יחסי ולא מוחלט.',
    url: '/rooms/kinneret-suite-tiberias', // DROPPED: relative URL
  },
  {
    id: 39,
    category: 'penthouse',
    property_name: 'פנטהאוז ים תיכון נתניה',
    location: 'נתניה',
    is_in_israel: true,
    price_per_night_ils: 780,
    description: 'פנטהאוז עם נוף לים. נפסל: http:// — חייב להיות https://.',
    url: 'http://old-travel-site.co.il/penthouse-netanya', // DROPPED: http not https
  },
  {
    id: 40,
    category: 'villa',
    property_name: 'וילה הכרם יהודה',
    location: 'שפלת יהודה',
    is_in_israel: true,
    price_per_night_ils: 1750,
    description: 'וילה בין כרמי ענבים. נפסל: URL שבור — מפנה לדף חיפוש כללי, לא לנכס.',
    url: '#villa-search-results', // DROPPED: hash-only / not absolute https
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FILTERING FUNCTION  (the "agent" rules engine)
// ─────────────────────────────────────────────────────────────────────────────

export function filterDeals(rawDeals: RawDeal[]): FilterResult {
  const validDeals: Deal[] = [];
  const rejectionReasons: Array<{ name: string; reason: string; type: 'location' | 'budget' | 'url' }> = [];
  let rejectedByLocation = 0;
  let rejectedByBudget = 0;
  let rejectedByUrl = 0;

  for (const deal of rawDeals) {
    // Rule 1 — Location: only Israel
    if (!deal.is_in_israel) {
      rejectedByLocation++;
      rejectionReasons.push({
        name: deal.property_name,
        reason: `נכס מחוץ לישראל (${deal.location})`,
        type: 'location',
      });
      continue;
    }

    // Rule 2 — Price: must NOT exceed category max by even 1 ₪
    const limit = BUDGET_LIMITS[deal.category];
    if (deal.price_per_night_ils > limit) {
      rejectedByBudget++;
      rejectionReasons.push({
        name: deal.property_name,
        reason: `₪${deal.price_per_night_ils.toLocaleString('he-IL')} > מקסימום ₪${limit.toLocaleString('he-IL')} (+${deal.price_per_night_ils - limit} ₪)`,
        type: 'budget',
      });
      continue;
    }

    // Rule 3 — URL: must be a valid absolute https:// deep link
    if (!isValidDeepLink(deal.url)) {
      rejectedByUrl++;
      const urlPreview = deal.url ? `"${deal.url.substring(0, 35)}${deal.url.length > 35 ? '…' : ''}"` : 'חסר';
      rejectionReasons.push({
        name: deal.property_name,
        reason: `Deep link לא תקין — URL ${urlPreview}`,
        type: 'url',
      });
      continue;
    }

    // ✅ All rules passed — output clean Deal
    validDeals.push({
      id: deal.id,
      category: deal.category,
      property_name: deal.property_name,
      location: deal.location,
      price_per_night_ils: deal.price_per_night_ils,
      description: deal.description,
      url: deal.url,
    });
  }

  return {
    validDeals,
    rejectedCount: rejectedByLocation + rejectedByBudget + rejectedByUrl,
    rejectedByLocation,
    rejectedByBudget,
    rejectedByUrl,
    rejectionReasons,
  };
}
