# TAP — Product Requirements Document
**tap.zakapedia.in** | v1.0 — April 2026 | Owner: Zaheer, Zakapedia | Status: Pre-development

---

## Quick Reference

| Field | Detail |
|---|---|
| Product | Tap by Zakapedia |
| URL | tap.zakapedia.in |
| Version | 1.0 — MVP |
| Target Launch | Q2 2026 |
| Stack | Vite + React + TypeScript, Supabase, Vercel, Razorpay |

---

## 1. Overview

Tap is a bio link page builder for creators, professionals, and small businesses in India. It lives at `tap.zakapedia.in` as part of the Zakapedia product ecosystem.

Unlike generic link-in-bio tools, Tap is built around a single core promise: **your page should look like you — not like everyone else's Linktree.**

Tap extends this identity into the physical world through two optional products: NFC cards and printed visiting cards — both tied to the user's digital page and brand aesthetic.

---

## 2. Problem Statement

People with something worth sharing — creators, freelancers, small business owners — have no fast, beautiful way to present themselves online without looking generic or spending money.

Existing tools like Linktree have three key failures:

- **Generic feel** — every page looks identical, signalling "I didn't bother"
- **Creator tax** — free tiers are crippled; paid plans start at $5–9/month just for basic customisation
- **No South Asian focus** — no UPI/Razorpay, no regional languages, no WhatsApp-first sharing

Tap's answer: **entirely free, forever.** No plans, no paywalls, no locked themes. Revenue comes exclusively from NFC card orders — a physical product people choose to buy, not a gate on the software.

**Primary problem we solve:**

> Problem 2 — Existing tools make you look like everyone else. Tap solves the identity gap — your link page is a creative expression of your brand, not a commodity widget.

---

## 3. Product Vision & Positioning

### 3.1 Vision

> One tap. Your entire presence.

A beautifully designed bio page + an optional NFC card that opens it + a printed visiting card that carries your QR. Tap your NFC card or hand someone your visiting card at a meetup — your page opens instantly. No app. No fumble. Just your identity, delivered.

### 3.2 Positioning

Tap is a **personal page builder**, not a link manager. The links are secondary. What users get is the ability to **look distinct** — and the entire product is free. The only things users ever pay for are the optional physical products: NFC cards and printed visiting cards.

Closest analogy: Notion's approach to design — opinionated defaults, freedom within the system. Tap makes the design decisions so users don't have to, but gives them full content freedom within a curated aesthetic.

### 3.3 Design Philosophy

- **Developer curates** — A small set of deeply crafted themes. Each is a complete design system (typography, spacing, motion, colour, card style). Not just skins. Personalities.
- **User owns** — Within their chosen theme, full freedom over content: links, bio, photo, ordering, accent colour.
- **Quality at scale** — Users can't break the design. But they feel ownership over it.

---

## 4. Target Users

### 4.1 Primary

- Creators — bloggers, podcasters, YouTubers, Instagram/Reels creators in India
- Professionals & consultants — IT freelancers, coaches, designers pitching clients
- Small businesses — local shops, home bakers, salons needing a single shareable page

### 4.2 Secondary

- Event speakers & networkers — NFC card use case at conferences and meetups
- Zakapedia community audience — early adopter base

### 4.3 User Personas

**Persona A — The Creator**
Riya, 26, Instagram creator (42K followers), Bengaluru. Posts reels, has a Spotify podcast, sells presets via Gumroad. Pain: her Linktree page looks identical to 10 other creators she knows. Goal: a page that feels like her brand.

**Persona B — The Professional**
Arjun, 34, freelance UI/UX designer, Hyderabad. Pitches clients via WhatsApp and LinkedIn. Pain: no single link that shows his portfolio, Behance, LinkedIn, and contact. Goal: one clean, credible page to share in a WhatsApp message.

**Persona C — The Local Business**
Saleem, 48, runs a meat shop in Tarnaka, Hyderabad. Has a WhatsApp number, Google Maps listing, and Instagram. Pain: customers don't know where to find him online. Goal: one tap on a counter sticker that opens everything.

---

## 5. Business Model

Tap is **free** for all users at its core. No subscription plans, no locked themes, no paywalls on the builder.

**Revenue sources:**

| Source | Model |
|---|---|
| NFC Cards | One-time order, manual fulfillment, ₹199–₹299/card |
| Visiting Cards | One-time order per 100 cards, manual fulfillment |
| AI Credits | Pay-per-use credits for AI profile generation (₹49 / 5 credits, ₹149 / 20 credits) |

The software — builder, themes, analytics, published page — is **free forever**. AI features are optional premium add-ons, not a gate on core functionality. New users receive **3 free AI credits** on signup to experience the feature without payment friction.

**Growth loop:** Free page → shared on WhatsApp → someone asks "how did you make this?" → they sign up free → use AI credits to build their profile → order a card or visiting cards.

---

## 6. MVP Feature Scope

| Feature | Description | Priority | MVP |
|---|---|---|---|
| Auth & Signup | Email or Google sign-in, username selection (`/username`), no email friction at signup | P0 | ✓ |
| Page Builder | Profile photo upload, name + one-line bio, add/remove/reorder links | P0 | ✓ |
| Link Management | Link title + URL, emoji or category icon, drag-to-reorder | P0 | ✓ |
| Theme Selector | 3 curated themes at launch | P0 | ✓ |
| Live Preview | Split-screen desktop, toggle mobile — updates as user types | P0 | ✓ |
| Published Page | Clean public URL, mobile-first, loads <2s, NFC/UTM tracking | P0 | ✓ |
| Analytics Dashboard | Page views, link clicks, traffic sources, 7-day sparkline | P1 | ✓ |
| NFC Card Order | Order form, Razorpay payment, manual fulfillment v1 | P1 | ✓ |
| Visiting Card Order | Choose template or upload design, auto-filled from profile, QR code on back, Razorpay payment | P1 | ✓ |
| Accent Colour Pick | One accent colour choice within theme palette | P1 | ✓ |
| WhatsApp Share | One-tap share button with page URL | P1 | ✓ |
| AI Profile Builder | Describe yourself → AI generates bio, picks theme + accent, suggests links. Costs 1 AI credit. 3 free credits on signup. | P1 | ✓ |
| AI Credits System | Credit balance display in dashboard, purchase via UPI (manual fulfillment v1), 3 free credits on signup trigger | P1 | ✓ |
| Multiple Pages | One user, multiple link pages | P2 | – |
| Custom Domain | User brings own domain | P2 | – |
| Scheduled Links | Links that appear/disappear on a schedule | P2 | – |
| Team/Agency Accounts | Manage multiple clients from one account | P2 | – |
| Auto NFC Fulfillment | Automated card writing + shipping integration | P2 | – |

---

## 7. Themes (MVP)

Each theme is a complete design system — not just a colour swap. Themes define typography, spacing, card style, motion, and layout. Users cannot mix elements between themes.

### Theme 1 — Editorial (Creator)
- **Target:** Bloggers, podcasters, YouTubers
- **Aesthetic:** Bold, editorial, magazine-feel — strong typographic hierarchy
- **Typography:** Serif display + clean sans-serif body
- **Motion:** Staggered link reveal on load, hover lift on cards

### Theme 2 — Minimal (Professional)
- **Target:** Freelancers, consultants, IT professionals
- **Aesthetic:** Clean, credible, confident — nothing distracting
- **Typography:** Refined sans-serif, generous whitespace
- **Motion:** Subtle fade-in, nothing that distracts

### Theme 3 — Expressive (Personality)
- **Target:** Artists, food creators, local shops with character
- **Aesthetic:** Playful, warm, full of personality
- **Typography:** Rounded or quirky display font + friendly body
- **Motion:** Bouncy hover states, fun entrance animations

---

## 8. NFC Card Product

### 8.1 Hardware
- Card type: NTAG213 PVC NFC cards (LINQS or equivalent)
- Tag format: NDEF URI record — `https://tap.zakapedia.in/username`
- iPhone compatibility: iOS 13+ supports background NFC natively (iPhone XS and later)
- Write tool: NFC Tools app → Add Record → URL/URI (ensures proper NDEF format for iOS)

### 8.2 Order Flow (MVP — Manual Fulfillment)

1. User clicks "Order My NFC Card" in dashboard
2. Fills order form: name on card, quantity, shipping address
3. Pays via Razorpay (estimated ₹199–₹299/card)
4. Zaheer writes the card using NFC Tools, ships via courier
5. User sees order status in dashboard: Placed → Shipped → Delivered

### 8.3 NFC Tracking

Cards shipped with URL: `https://tap.zakapedia.in/username?ref=nfc`

This UTM parameter surfaces in the user's analytics dashboard under Traffic Sources as **NFC Tap** — giving users proof their card is working.

---

## 9. Visiting Card Product

### 9.1 Specifications
- **Size:** Standard 85×54mm (3.5" × 2")
- **Sides:** Double sided
- **Finish:** Matte or glossy — user chooses at order time
- **MOQ:** 100 cards per order
- **QR code:** Printed on every card by default, linking to `tap.zakapedia.in/username`

### 9.2 Templates

3 pre-designed templates matching the app themes. Details auto-populated from the user's Tap profile (name, bio, key links, QR code).

| Template | Matches Theme | QR Placement | Style |
|---|---|---|---|
| Editorial | Editorial (Creator) | Back — full bleed design | Bold typography, strong hierarchy |
| Minimal | Minimal (Professional) | Back — clean layout; front option with premium placement | Clean, generous whitespace |
| Expressive | Expressive (Personality) | Front — integrated as a design element | Colourful, playful, warm |

**QR placement rule:**
- Back by default on all templates
- Premium front placement available on Editorial and Minimal — QR integrated as a design feature, not an afterthought
- Expressive template features QR on front as part of the layout

### 9.3 Upload Option
Users who have their own card design can upload it for print. Tap prints and ships — no design service provided for uploads. QR code is not auto-added to uploaded designs (user is responsible for including it).

### 9.4 Order Flow (MVP — Manual Fulfillment)

1. User clicks "Order Visiting Cards" in dashboard
2. Chooses template (Editorial / Minimal / Expressive) or selects Upload
3. Reviews auto-filled details — name, bio snippet, QR code, links shown on card
4. Chooses finish: matte or glossy
5. Confirms quantity (MOQ 100) and shipping address
6. Pays via Razorpay (pricing TBD)
7. Zaheer sends to print vendor, ships via courier
8. User sees order status: Placed → Printing → Shipped → Delivered

### 9.5 Data Model Addition
```
visiting_card_orders — id, user_id, page_id, template (editorial/minimal/expressive/upload),
                       finish (matte/glossy), quantity, design_file_url, shipping_address,
                       status, razorpay_payment_id, created_at
```

## 10. AI Profile Builder

### 10.1 Overview

The AI Profile Builder lets users describe themselves in plain language and have AI generate their entire profile — bio, theme, accent colour, and suggested links — in one shot. It removes the blank-page problem for new users and helps anyone who struggles to write their own bio.

This is a **paid feature** powered by OpenRouter. Every generation costs 1 AI credit. New users receive 3 free credits on signup; additional credits are purchased via UPI.

### 10.2 User Flow

1. User opens dashboard → sees **"Build with AI"** banner and credit balance in header
2. Clicks → modal opens with a text area: *"Describe yourself or your brand"*
3. Selects tone: Professional / Creative / Casual
4. Clicks **Generate** (1 credit deducted)
5. AI returns: polished bio, recommended theme + accent colour, 3–5 suggested platform links
6. User reviews the preview and applies: **Apply Everything**, **Apply Bio Only**, **Apply Design Only**, **Add Links**, or **Regenerate** (costs another credit)
7. Changes populate the builder fields and auto-save

### 10.3 AI Output Format

```json
{
  "bio": "Freelance UI designer from Hyderabad. I help startups find their visual voice.",
  "theme": "minimal",
  "accent_color": "#3B82F6",
  "suggested_links": [
    { "title": "My Portfolio", "url": "https://behance.net/yourhandle", "icon": "" },
    { "title": "LinkedIn",     "url": "https://linkedin.com/in/",      "icon": "" },
    { "title": "Dribbble",     "url": "https://dribbble.com/",         "icon": "" }
  ]
}
```

### 10.4 Credits System

| Package | Price | Credits |
|---|---|---|
| Signup bonus | Free | 3 credits |
| Starter | ₹49 | 5 credits |
| Value | ₹149 | 20 credits |

**Credit lifecycle:**
- Credits are deducted atomically server-side before the AI call
- If OpenRouter fails or returns an invalid response, the credit is automatically refunded
- Credit balance is always visible in the dashboard header
- Credits do not expire

**Purchase flow (MVP — manual fulfillment):**
1. User clicks "Buy Credits" → modal with two package options
2. Pays via UPI (UPI ID displayed + QR code)
3. Submits transaction ID (UTR number) — same pattern as NFC card orders
4. Credits added manually within 2 hours of payment verification

### 10.5 Security Architecture

The OpenRouter API key **never appears in frontend code**. All AI calls are proxied through a **Supabase Edge Function** (`generate-profile`) that:

1. Verifies the user's Supabase JWT
2. Deducts 1 credit via an atomic Postgres stored procedure (`tap.spend_ai_credit`)
3. Calls OpenRouter API (`google/gemini-flash-1.5` — fast, cheap, JSON-capable)
4. Validates and sanitises the AI response
5. Refunds the credit if the AI call fails
6. Returns the generated profile data to the client

The `OPENROUTER_API_KEY` is stored exclusively in Supabase Edge Function secrets (never in `.env`, never with a `VITE_` prefix).

### 10.6 Data Model

```
tap.ai_credits                — user_id (PK), balance INTEGER CHECK (>= 0), updated_at
tap.ai_credit_transactions    — id, user_id, amount, reason, created_at  [optional audit log]
tap.credit_purchase_requests  — id, user_id, package_credits, amount_inr, utr_number, status, created_at
```

**Signup credits trigger:** A Postgres trigger on `tap.users INSERT` automatically inserts a row into `tap.ai_credits` with `balance = 3` for every new user. Zero frontend change required — works for email and Google sign-in equally.

### 10.7 Tone Guide (Prompt Design)

| Tone | Description | Best for |
|---|---|---|
| Professional | Crisp, business-forward, no fluff | Freelancers, consultants, job seekers |
| Creative | Expressive, slightly informal, personality-forward | Creators, artists, photographers |
| Casual | Conversational, warm, approachable | Local businesses, community figures |

---

## 11. User Analytics Dashboard

One screen. Numbers that make them smile and tell them what's working.

### 10.1 Top Line
- Total page views — all time + this week vs last week
- Total link clicks — all time + this week vs last week
- Overall click-through rate (clicks ÷ views)

### 10.2 Per-Link Breakdown
- Click count per link
- Relative performance bar — visual comparison
- Sorted by clicks descending

### 10.3 Traffic Sources
- **WhatsApp** — via WhatsApp referrer header
- **Instagram** — via Instagram referrer
- **NFC Tap** — via `?ref=nfc` UTM
- **Direct** — everything else

### 10.4 Time Chart
- Page views over last 7 days (sparkline)
- Toggle: 7 days / 30 days

### 10.5 Implementation Notes
- `page_views` table: page_id, timestamp, source
- `link_clicks` table: link_id, page_id, timestamp, source
- All queries run client-side from Supabase — no third-party analytics at MVP
- No PII stored in analytics events

---

## 12. Success Metrics

**Primary metric:** Link click-through rate. If visitors are clicking links, the page is working.

| Metric | Description | Target (Month 3) |
|---|---|---|
| Pages Created | Total published pages (not drafts) | 500 |
| Builder Completion Rate | Users who start and publish | > 60% |
| Link CTR | Link clicks ÷ page views | > 30% |
| DAU/MAU | Daily ÷ monthly active users | > 20% |
| NFC Cards Ordered | Total card orders placed | 50 |
| Visiting Cards Ordered | Total visiting card orders placed | 30 |
| Page-to-Physical Conversion | % of page owners who order any physical product | > 10% |
| Return to Builder | Users who update page after first publish | > 40% |
| Traffic via NFC | % of page views with `?ref=nfc` | Tracked |
| WhatsApp Share Rate | Users who tap the share button | > 25% |
| AI Generation Rate | % of new users who use at least 1 AI credit | > 40% |
| AI Credit Purchase Rate | % of users who buy credits after free credits run out | > 15% |
| AI to Publish Rate | % of AI generations where user publishes the result | > 70% |

---

## 13. Technical Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React + TypeScript |
| Styling | Tailwind CSS + custom theme tokens |
| Backend / DB | Supabase — shared Zakapedia instance, `tap` schema |
| Hosting | Vercel (`tap.zakapedia.in` subdomain) |
| Payments | Razorpay (NFC + visiting card orders); UPI manual fulfillment for AI credits |
| AI Gateway | OpenRouter (`google/gemini-flash-1.5`) via Supabase Edge Function proxy |
| Analytics | Custom — Supabase tables, no third-party |
| NFC Write Tool | NFC Tools app (manual fulfillment v1) |
| Repo | GitHub, deployed via Vercel CI |

### 12.1 Supabase Strategy

Tap shares a single Supabase project with all Zakapedia products. Each product lives in its own Postgres schema to avoid table name collisions and keep concerns separated.

```
auth.users         ← shared across all Zakapedia apps (one login, all products)
tap.*              ← all Tap tables
masjid.*           ← Masjid App tables
iplpredictor.*     ← IPL Predictor tables
```

**Benefits:**
- One Supabase bill, one dashboard to monitor
- Shared `auth.users` — a user registered on Tap can access future Zakapedia products without re-registering
- Row Level Security (RLS) and storage buckets work across schemas normally
- Clean separation — no prefixed table sprawl

**Setup note:** Supabase defaults to the `public` schema. Tap tables must be created explicitly under the `tap` schema and the Supabase client configured with `db.schema: 'tap'` or using `supabase.schema('tap')` per query.

### 12.2 Data Model (Key Tables)

```
tap.users                    — id (references auth.users), username, email, user_type, created_at
tap.pages                    — id, user_id, theme, accent_color, name, bio, avatar_url, banner_url, published
tap.links                    — id, page_id, title, url, icon, position, created_at
tap.page_views               — id, page_id, timestamp, source
tap.link_clicks              — id, link_id, page_id, timestamp, source
tap.nfc_orders               — id, user_id, page_id, name_on_card, address, quantity, status, payment_reference, created_at
tap.visiting_card_orders     — id, user_id, page_id, template, finish, quantity, design_file_url, address, status, payment_reference, created_at
tap.ai_credits               — user_id (PK), balance INTEGER CHECK (>= 0), updated_at
tap.credit_purchase_requests — id, user_id, package_credits, amount_inr, utr_number, status, created_at
```

---

## 14. Out of Scope (MVP)

- Multiple pages per user
- Custom domain support
- Scheduled / time-limited links
- Team or agency accounts
- Automated NFC card writing and fulfillment
- Email marketing integrations
- Embedded media (video, Spotify player)
- Regional language UI *(planned v1.1)*
- PWA / installable app

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| NFC iPhone compatibility | Use NDEF URI records via NFC Tools; test on iPhone XS+ before every card batch |
| Design quality at scale | Curated themes prevent degradation; users can't override layout/typography |
| Manual fulfillment bottleneck | Cap NFC + visiting card orders per week in v1; automate in v2 once demand proven |
| Print vendor dependency | Identify 2 print vendors in Hyderabad before launch; never rely on just one |
| Supabase free tier limits | Monitor usage; upgrade before hitting limits (~500 active pages is safe) |
| Low organic discovery | Zakapedia audience as initial seed; WhatsApp sharing built-in for viral loop |
| OpenRouter API key exposure | Key stored only in Supabase Edge Function secrets; never in frontend bundle |
| AI credit abuse / fraud | Atomic credit deduction via stored procedure; balance can never go below 0 |
| OpenRouter downtime | Credit auto-refunded on failure; user sees clear error message |
| AI generates bad output | Output validated + sanitised server-side; theme and accent restricted to allowlist |
| Manual credit fulfillment bottleneck | UTR-based verification; cap daily manual credit additions; automate with Razorpay webhooks in v2 |

---

## 16. Roadmap

### v1.0 — MVP (Q2 2026)
Auth, builder, 3 themes, published pages, analytics dashboard, NFC card orders, visiting card orders, **AI Profile Builder with credits system**

### v1.1 — Post-Launch
- Tamil and Telugu UI localisation
- 2 additional themes
- WhatsApp Business API for order notifications
- Embedded Spotify / YouTube preview in links
- Automated visiting card preview (render card design in browser before ordering)
- Razorpay webhook integration for automated AI credit fulfillment (replaces manual UTR process)
- AI "Refresh Bio" — regenerate just the bio without touching theme/links

### v2.0 — Growth
- Multiple pages per user
- Custom domain support
- Automated NFC fulfillment pipeline
- Automated print fulfillment for visiting cards
- Agency / white-label accounts
- Scheduled links
- AI chat widget on public profile — visitors ask questions, AI answers as the profile owner

---

## 17. Open Questions

- **Pricing model** — ~~resolved~~: product is entirely free; revenue from NFC cards and visiting card orders only
- **NFC card pricing** — ₹199 or ₹299 per card? Includes shipping?
- **Visiting card pricing** — price per 100 cards? Matte vs glossy surcharge? TBD post print vendor quote
- **Print vendor** — identify 2 vendors in Hyderabad before launch for redundancy
- **Username reservation** — should Zakapedia brand names be reserved on launch?
- **Avatar storage** — Supabase storage bucket or Cloudinary? Decide before build.
- **Analytics retention** — how long to keep raw event data? 90 days recommended for MVP.
- **Visiting card design preview** — static PDF preview v1, or live in-browser render? Static is simpler for MVP.
- **AI credit pricing** — ₹49 / 5 credits and ₹149 / 20 credits proposed; validate willingness-to-pay before hardcoding.
- **AI model choice** — `google/gemini-flash-1.5` proposed; benchmark against `anthropic/claude-3-haiku` on bio quality before launch.
- **Free credit count** — 3 free credits on signup proposed; enough to experience the feature but creates purchase pressure quickly.
- **AI credits expiry** — should unused credits expire? No expiry for MVP (simpler, builds goodwill).

---

*Zakapedia · tap.zakapedia.in · April 2026*
