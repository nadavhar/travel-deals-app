import type { Category } from './deals';

// ─── Style descriptors per property type ─────────────────────────────────────
const CATEGORY_SUBJECT: Record<Category, string> = {
  vacation:  'cozy vacation apartment with a warm, inviting living area',
  suite:     'luxury boutique hotel suite with elegant furnishings',
  penthouse: 'high-rise penthouse with panoramic city views and a rooftop terrace',
  villa:     'private villa with lush gardens and a grand facade',
};

// ─── Amenity → visual detail mapping ─────────────────────────────────────────
const AMENITY_VISUALS: Record<string, string> = {
  'בריכה':              'a sparkling outdoor infinity pool',
  "ג'קוזי":            'a private jacuzzi on the terrace',
  'חניה חינם':         'a private parking area',
  'מטבח מאובזר':      'a gourmet open-plan kitchen with marble countertops',
  'מנגל':              'an outdoor BBQ and dining area',
  // WiFi and pet-friendly have no strong visual representation — omit
};

export interface PromptInput {
  category:    Category;
  location:    string;
  description: string;
  amenities:   string[];
}

/**
 * Translates raw deal form data into an optimized DALL-E 3 prompt that
 * reliably produces professional real-estate photography output.
 */
export function buildImagePrompt(input: PromptInput): string {
  const subject  = CATEGORY_SUBJECT[input.category];
  const location = input.location.trim() || 'Israel';

  const amenityDetails = input.amenities
    .map((a) => AMENITY_VISUALS[a])
    .filter(Boolean)
    .join(', ');

  const featureClause = amenityDetails
    ? `The property features ${amenityDetails}.`
    : '';

  // Strict style prefix prevents DALL-E from drifting to illustrative styles
  const prompt = [
    'Professional architectural real-estate photography,',
    'ultra-wide angle lens, photorealistic HDR, golden hour warm lighting,',
    `beautifully staged ${subject}`,
    `in ${location}, Israel.`,
    featureClause,
    'Immaculate interior and exterior, no people, no text overlays,',
    'Architectural Digest quality, sharp focus throughout,',
    '16:9 landscape composition, neutral color palette.',
  ]
    .filter(Boolean)
    .join(' ');

  return prompt;
}
