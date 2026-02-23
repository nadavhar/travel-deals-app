# 🏖️ צייד הדילים — חופשה בתקציב שלך

A full-stack Israeli budget travel deal hunter built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

The app simulates an AI agent that scrapes travel listings, enforces strict budget rules per category, drops non-Israeli properties, validates deep links, and surfaces only the deals that truly pass the filter.

![App Screenshot](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/MakhteshRamonMar262022_01.jpg/1200px-MakhteshRamonMar262022_01.jpg)

---

## ✨ Features

- **Agent filtering engine** — 3-rule pipeline: location (Israel only) → budget cap → deep link validation
- **Deep link validation** — any URL that is missing, relative, hash-only, or starts with `http://` is silently dropped
- **Location-based landscape images** — each card automatically shows a real photo of its region (Jaffa, Jerusalem, Dead Sea, Eilat, Haifa, Ramon Crater, Kinneret, Golan, Caesarea, Nazareth, Negev, Tel Aviv) via Wikimedia Commons CDN
- **Hebrew RTL UI** — fully right-to-left layout with Heebo font
- **Interactive category tabs** — filter by Vacation / Suite / Penthouse / Villa with live deal counts
- **Colour-coded rejected deals panel** — collapsible panel showing every filtered-out deal with its exact reason: 🌍 location · 💸 budget · 🔗 URL
- **Responsive grid** — 1 column on mobile → 3 columns on desktop
- **Direct booking deep links** — "להזמנה ↗" CTA opens the exact deal page in a new tab (`target="_blank"`)

---

## 🏷️ Budget Rules (Agent Logic)

| Category | Hebrew | Max price / night |
|---|---|---|
| Vacation (hotel / B&B) | חופשה | ₪450 |
| Suite | סוויטה | ₪450 |
| Penthouse | פנטהאוז | ₪990 |
| Villa | וילה | ₪1,990 |

- Any deal **exceeding the limit by even 1 ₪** is silently dropped
- Any property **outside Israel** is silently dropped
- Any deal whose `url` is missing, relative, hash-only, or not `https://` is silently dropped
- Output schema contains: `category`, `property_name`, `location`, `price_per_night_ils`, `description`, `url` — **no image field** (images are derived from location at render time)

### 🔗 Deep Link Validation (Rule 3)

The agent enforces that every deal must have a valid, absolute `https://` deep link pointing directly to the property page — not a search results page, not a relative path, not an insecure `http://` URL.

| URL value | Result |
|---|---|
| `https://booking.com/hotel/il/...` | ✅ Valid |
| `''` (empty) | 🔗 Dropped |
| `'/rooms/kinneret-suite'` | 🔗 Dropped (relative) |
| `'http://old-site.co.il/...'` | 🔗 Dropped (not https) |
| `'#villa-search-results'` | 🔗 Dropped (hash only) |

---

## 🗂️ Project Structure

```
travel-deals-app/
├── app/
│   ├── layout.tsx        # Root layout — Hebrew RTL, Heebo font
│   ├── page.tsx          # Main page — filter UI + deal grid
│   └── globals.css       # Tailwind directives
├── lib/
│   ├── deals.ts          # Raw deals payload + filterDeals() agent logic
│   └── locationImages.ts # Hebrew location → Wikimedia image URL mapping
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 How the Location Image Logic Works

There is **no image field** in the deal schema. Instead, `lib/locationImages.ts` defines a mapping of Hebrew location keywords → Wikimedia Commons CDN URLs:

```ts
// lib/locationImages.ts
export function getLocationImage(location: string): string {
  for (const [keyword, url] of Object.entries(LOCATION_IMAGE_MAP)) {
    if (keyword !== 'default' && location.includes(keyword)) {
      return url;
    }
  }
  return LOCATION_IMAGE_MAP['default'];
}
```

Keys are ordered **specific → general** (e.g. `'מצפה רמון'` before `'נגב'`) so substring matching always picks the most precise match. If no key matches, a fallback landscape is shown.

---

## 🛠️ Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, Turbopack
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Heebo](https://fonts.google.com/specimen/Heebo) — Google Font optimised for Hebrew
- [Wikimedia Commons](https://commons.wikimedia.org/) — verified free landscape images
