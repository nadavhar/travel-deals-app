import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI search not configured' }, { status: 503 });
  }

  const { query, deals } = await request.json() as { query: string; deals: CompactDeal[] };

  if (!query?.trim() || !deals?.length) {
    return NextResponse.json({ error: 'Missing query or deals' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const dealsContext = deals
    .map((d) =>
      `ID:${d.id} | ${d.category} | ${d.property_name} | ${d.location} | ${d.price}₪ | מתקנים: ${d.amenities.join(', ') || 'ללא'} | ${d.description}`,
    )
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `אתה עוזר חיפוש חכם לאתר "צייד הדילים" — אתר דילים לנסיעות בישראל.
בהינתן רשימת הדילים הזמינים, מצא את הדילים הכי מתאימים לבקשת המשתמש.
הגב בעברית בצורה ידידותית וקצרה (1-2 משפטים).
אם לא נמצאו דילים מתאימים, אמור זאת בנועם.

החזר JSON בדיוק בפורמט הזה:
{"message": "...", "ids": [1, 2, 3]}

רשימת הדילים:
${dealsContext}`,
      },
      {
        role: 'user',
        content: query,
      },
    ],
    max_tokens: 400,
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as { message?: string; ids?: number[] };

  return NextResponse.json({
    message: parsed.message ?? 'הנה מה שמצאתי:',
    ids:     Array.isArray(parsed.ids) ? parsed.ids : [],
  });
}
