import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30;

interface CompactDeal {
  id: number;
  category: string;
  property_name: string;
  location: string;
  price: number;
  amenities: string[];
  description: string;
}

// ── Deterministic pre-filters ────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Array<{ words: string[]; category: string }> = [
  { words: ['וילה', 'וילת'],                              category: 'villa' },
  { words: ['סוויטה', 'סוויט'],                           category: 'suite' },
  { words: ['פנטהאוז', 'פנטהאוס'],                        category: 'penthouse' },
  { words: ['חופשה', 'מלון', 'צימר', 'הוסטל', 'אכסניה'], category: 'vacation' },
];

const AMENITY_KEYWORDS: Array<{ words: string[]; amenity: string }> = [
  { words: ['בריכה', 'pool'],                              amenity: 'בריכה' },
  { words: ["ג'קוזי", 'ג׳קוזי', 'jacuzzi', 'ג קוזי'],   amenity: "ג'קוזי" },
  { words: ['חניה'],                                       amenity: 'חניה חינם' },
  { words: ['wifi', 'וויפי', 'אינטרנט'],                  amenity: 'WiFi' },
  { words: ['מטבח'],                                       amenity: 'מטבח מאובזר' },
  { words: ['בעלי חיים', 'כלב', 'חיות'],                 amenity: 'מתאים לבעלי חיים' },
  { words: ['מנגל', 'ברביקיו', 'bbq'],                    amenity: 'מנגל' },
];

const LOCATION_KEYWORDS: Array<{ words: string[]; locations: string[] }> = [
  { words: ['תל אביב', 'ת"א', 'יפו'],          locations: ['תל אביב', 'יפו, תל אביב'] },
  { words: ['ירושלים'],                          locations: ['ירושלים'] },
  { words: ['אילת'],                             locations: ['אילת'] },
  { words: ['חיפה', 'כרמל'],                    locations: ['חיפה'] },
  { words: ['אשקלון'],                           locations: ['אשקלון'] },
  { words: ['אשדוד'],                            locations: ['אשדוד'] },
  { words: ['נתניה'],                            locations: ['נתניה'] },
  { words: ['טבריה', 'כנרת'],                   locations: ['טבריה', 'כנרת, עמק הירדן'] },
  { words: ['ים המלח', 'ים-המלח'],              locations: ['ים המלח', 'אבנת, ים המלח', 'עין גדי, ים המלח'] },
  { words: ['גליל', 'גלילי'],                    locations: ['גליל עליון'] },
  { words: ['גולן', 'גולני'],                    locations: ['רמת הגולן'] },
  { words: ['ערד'],                              locations: ['ערד'] },
  { words: ['צפת'],                              locations: ['צפת'] },
  { words: ['עכו'],                              locations: ['עכו'] },
  { words: ['נצרת'],                             locations: ['נצרת'] },
  { words: ['מצפה רמון', 'מכתש'],               locations: ['מצפה רמון'] },
  { words: ['זיכרון יעקב', 'זכרון'],            locations: ['זיכרון יעקב'] },
  { words: ['הרצליה'],                           locations: ['הרצליה פיתוח'] },
  { words: ['קיסריה'],                           locations: ['קיסריה'] },
  { words: ['ערבה', 'נגב'],                      locations: ['ערבה, נגב'] },
];

function normalize(s: string) { return s.toLowerCase(); }

function preFilter(query: string, deals: CompactDeal[]): CompactDeal[] {
  const q = normalize(query);
  let result = deals;

  // Category filter
  for (const { words, category } of CATEGORY_KEYWORDS) {
    if (words.some((w) => q.includes(normalize(w)))) {
      result = result.filter((d) => d.category === category);
      break;
    }
  }

  // Location filter
  for (const { words, locations } of LOCATION_KEYWORDS) {
    if (words.some((w) => q.includes(normalize(w)))) {
      result = result.filter((d) =>
        locations.some((loc) => d.location.includes(loc) || loc.includes(d.location)),
      );
      break;
    }
  }

  // Amenity filter — check amenities array AND description (static deals store it in description)
  for (const { words, amenity } of AMENITY_KEYWORDS) {
    if (words.some((w) => q.includes(normalize(w)))) {
      result = result.filter((d) =>
        d.amenities.includes(amenity) ||
        d.description.includes(amenity.replace("ג'קוזי", 'קוזי').replace('בריכה', 'בריכ')),
      );
    }
  }

  return result;
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI search not configured' }, { status: 503 });
  }

  const { query, deals } = await request.json() as { query: string; deals: CompactDeal[] };

  if (!query?.trim() || !deals?.length) {
    return NextResponse.json({ error: 'Missing query or deals' }, { status: 400 });
  }

  // 1. Deterministic pre-filter (no AI involved)
  const filtered = preFilter(query, deals);

  // 2. If no results — return immediately without calling Gemini
  if (filtered.length === 0) {
    return NextResponse.json({
      message: 'לא נמצאו דילים התואמים את החיפוש שלך. נסה חיפוש אחר.',
      ids: [],
    });
  }

  // 3. Ask Gemini only to rank + write a friendly message (no filtering needed)
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const dealsContext = filtered
    .map((d) =>
      `ID:${d.id} | ${d.property_name} | ${d.location} | ${d.price}₪ | ${d.description}`,
    )
    .join('\n');

  const prompt = `אתה עוזר ידידותי לאתר דילים לנסיעות בישראל.
המשתמש חיפש: "${query}"
מצאנו את הדילים הבאים שכבר סוננו והם רלוונטיים:

${dealsContext}

דרג אותם לפי התאמה לבקשה והחזר JSON בלבד (ללא markdown):
{"message": "1-2 משפטים ידידותיים בעברית על מה שמצאת", "ids": [מסודר לפי הכי מתאים]}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(cleaned) as { message?: string; ids?: number[] };

  // Only allow IDs that were in the pre-filtered list — prevent AI hallucination
  const filteredIdSet = new Set(filtered.map((d) => d.id));
  const safeIds = Array.isArray(parsed.ids)
    ? parsed.ids.filter((id) => filteredIdSet.has(id))
    : filtered.map((d) => d.id);

  return NextResponse.json({
    message: parsed.message ?? `מצאתי ${filtered.length} דילים מתאימים:`,
    ids: safeIds.length > 0 ? safeIds : filtered.map((d) => d.id),
  });
}
