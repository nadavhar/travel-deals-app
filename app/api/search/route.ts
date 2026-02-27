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

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI search not configured' }, { status: 503 });
  }

  const { query, deals } = await request.json() as { query: string; deals: CompactDeal[] };

  if (!query?.trim() || !deals?.length) {
    return NextResponse.json({ error: 'Missing query or deals' }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const dealsContext = deals
    .map((d) =>
      `ID:${d.id} | ${d.category} | ${d.property_name} | ${d.location} | ${d.price}₪ | מתקנים: ${d.amenities.join(', ') || 'ללא'} | ${d.description}`,
    )
    .join('\n');

  const prompt = `אתה עוזר חיפוש מדויק לאתר "צייד הדילים" — אתר דילים לנסיעות בישראל.

כללי סינון מחמירים:
- אם המשתמש ציין מיקום — החזר רק דילים שמיקומם תואם בדיוק. אל תחזיר דילים ממקומות אחרים.
- אם המשתמש ציין קטגוריה (וילה, סוויטה, פנטהאוז, חופשה) — החזר רק דילים מאותה קטגוריה.
- אם המשתמש ציין מתקן (בריכה, ג'קוזי וכו') — החזר רק דילים שיש להם את המתקן הזה.
- אם לא נמצאו דילים שעומדים בכל התנאים — החזר ids: [] ואמור שלא נמצאו תוצאות מתאימות.
- עדיף להחזיר פחות תוצאות ומדויקות מאשר תוצאות לא רלוונטיות.

הגב בעברית בצורה ידידותית וקצרה (1-2 משפטים).

החזר JSON בדיוק בפורמט הזה (ללא markdown, רק JSON):
{"message": "...", "ids": [1, 2, 3]}

רשימת הדילים:
${dealsContext}

בקשת המשתמש: ${query}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(cleaned) as { message?: string; ids?: number[] };

  return NextResponse.json({
    message: parsed.message ?? 'הנה מה שמצאתי:',
    ids:     Array.isArray(parsed.ids) ? parsed.ids : [],
  });
}
