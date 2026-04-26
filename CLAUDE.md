# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project

**Tap by Zakapedia** — a bio link page builder at `tap.zakapedia.in`. Free forever software; revenue from optional NFC cards and printed visiting cards.

Stack: **Vite + React + TypeScript**, Tailwind CSS, Supabase (shared Zakapedia instance, `tap` schema), Vercel, Razorpay.

---

## Commands

Once the project is scaffolded (no code exists yet), the standard npm scripts will be:

```bash
npm run dev      # Vite dev server
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

---

## Architecture

### Supabase: multi-schema setup

Tap shares a single Supabase project with all Zakapedia products. **Every tap table lives under the `tap` schema, not `public`.**

```
auth.users    ← shared across all Zakapedia apps
tap.*         ← all Tap tables
masjid.*      ← Masjid App
iplpredictor.*
```

The Supabase client must be initialised with `db.schema: 'tap'` (or `.schema('tap')` per query). Never create tables in `public`.

### Data model

```
tap.users                — id (→ auth.users), username, email, created_at
tap.pages                — id, user_id, theme, accent_color, name, bio, avatar_url, published
tap.links                — id, page_id, title, url, icon, position, created_at
tap.page_views           — id, page_id, timestamp, source
tap.link_clicks          — id, link_id, page_id, timestamp, source
tap.nfc_orders           — id, user_id, page_id, name_on_card, address, quantity, status, razorpay_payment_id, created_at
tap.visiting_card_orders — id, user_id, page_id, template, finish, quantity, design_file_url, address, status, razorpay_payment_id, created_at
```

### Analytics

All analytics are custom — no third-party libraries. Page views and link clicks are written directly to Supabase and queried client-side. Traffic sources are detected from the referrer header or `?ref=nfc` UTM parameter. No PII in analytics events.

### Theme system

Three complete design systems (not colour swaps). Each theme owns its typography, spacing, motion, card style, and layout. Users pick one theme and an accent colour within its palette — they cannot mix elements across themes.

| Theme | Target user | Aesthetic |
|---|---|---|
| Editorial | Creators, bloggers | Bold serif, magazine-feel, staggered reveal |
| Minimal | Freelancers, consultants | Clean sans-serif, generous whitespace, subtle fade |
| Expressive | Artists, local businesses | Rounded/quirky font, bouncy hover, warm palette |

### Routing

- `/` — marketing/landing
- `/login`, `/signup` — auth (email or Google)
- `/dashboard` — page builder + analytics + order CTA
- `/:username` — public profile page (mobile-first, loads <2 s)

### Physical products (manual fulfillment v1)

- **NFC cards** — NTAG213 PVC cards written with NFC Tools app to `https://tap.zakapedia.in/:username`. Cards shipped with `?ref=nfc` for analytics tracking.
- **Visiting cards** — 85×54 mm, MOQ 100, matte or glossy, 3 templates matching themes. Orders trigger manual print + ship workflow; status field: `placed → printing → shipped → delivered`.

---

## Key constraints

- **Username namespace is global** — `/:username` is the public URL; reserve Zakapedia brand names before launch.
- **Avatar storage** — decision pending (Supabase bucket vs Cloudinary); decide before building the upload flow.
- **Analytics retention** — 90-day rolling window recommended for raw event data at MVP.
- **Visiting card preview** — static PDF preview for MVP (not live in-browser render).
- **NFC card pricing** — ₹199 or ₹299 per card (TBD); visiting card pricing TBD after print vendor quote.
- **Out of scope for MVP** — multiple pages per user, custom domains, scheduled links, team accounts, automated fulfillment, embedded media.
