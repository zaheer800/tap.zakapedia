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

Tap is an AI-powered portfolio page builder for creators, professionals, and small businesses in India. It lives at `tap.zakapedia.in` as part of the Zakapedia product ecosystem.

The core promise: **fill in your name, bio, and links — AI builds you a full portfolio website in seconds.** Something that would take a developer 2 days, done instantly and uniquely yours.

Tap extends this identity into the physical world through two optional products: NFC cards and printed visiting cards — both tied to the user's digital page and brand aesthetic.

---

## 2. Problem Statement

People with something worth sharing — creators, freelancers, small business owners — have no fast, beautiful way to present themselves online without looking generic or spending money.

Existing tools like Linktree have three key failures:

- **Generic feel** — every page looks identical, signalling "I didn't bother"
- **Creator tax** — free tiers are crippled; paid plans start at $5–9/month just for basic customisation
- **No South Asian focus** — no UPI/Razorpay, no regional languages, no WhatsApp-first sharing

Tap's answer: **AI generates a unique portfolio for every user.** Free credits on signup. Buy more to keep creating. No two pages look the same.

**Primary problem we solve:**

> Problem 2 — Existing tools make you look like everyone else. Tap solves the identity gap — AI builds a portfolio that is genuinely, visually yours.

---

## 3. Product Vision & Positioning

### 3.1 Vision

> Fill in your details. AI builds your portfolio. One tap shares it with the world.

AI generates a full, unique portfolio page from just your name, bio, and links — hosted instantly at `tap.zakapedia.in/username`. Optional NFC card or visiting card extends your identity into the physical world.

### 3.2 Positioning

Tap is an **AI portfolio builder**, not a link manager. The AI output is the product — a unique, beautifully generated portfolio page that no template picker could produce. Free credits on signup let every user experience the wow moment before spending anything. Revenue comes from credit top-ups and optional physical products.

Closest analogy: Notion's approach to design — opinionated defaults, freedom within the system. Tap makes the design decisions so users don't have to, but gives them full content freedom within a curated aesthetic.

### 3.3 Design Philosophy

- **Developer curates** — A small set of deeply crafted themes. Each is a complete design system (typography, spacing, motion, colour, card style). Not just skins. Personalities.
- **User owns** — Within their chosen theme, full freedom over content: links, bio, photo, ordering, accent colour.
- **Quality at scale** — Users can't break the design. But they feel ownership over it.
- **WhatsApp-first** — In India, WhatsApp is the primary communication layer. Every profile has a WhatsApp CTA as the primary action. Pre-filled inquiry messages lower the friction to zero. Sharing happens via WhatsApp link, not email or DM.
- **QR-first offline** — Every profile auto-generates a QR code. Users can download it and place it anywhere — counter stickers, invoices, flex boards, visiting cards. Offline-to-online conversion is a first-class use case.

---

## 4. Target Users

### 4.1 Primary

Tap serves four distinct profile types — each gets a tailored onboarding, sections, and AI prompt:

- **Creators** — bloggers, podcasters, YouTubers, Instagram/Reels creators in India
- **Professionals** — IT freelancers, consultants, designers, coaches pitching clients
- **Businesses** — local shops, home bakers, salons, meat shops, any small business needing a shareable presence
- **Speakers / Networkers** — event speakers, conference attendees, people who hand out cards

### 4.2 Secondary

- Zakapedia community audience — early adopter base

### 4.3 User Personas

**Persona A — The Creator**
Riya, 26, Instagram creator (42K followers), Bengaluru. Posts reels, has a Spotify podcast, sells presets via Gumroad. Pain: her Linktree page looks identical to 10 other creators she knows. Goal: a page that feels like her brand — with her platforms, her latest post, her vibe. Profile type: **Creator**.

**Persona B — The Professional**
Arjun, 34, freelance UI/UX designer, Hyderabad. Pitches clients via WhatsApp and LinkedIn. Pain: no single link that shows his portfolio, Behance, skills, and contact. Goal: one clean, credible page to share in a WhatsApp message that closes the deal. Profile type: **Professional**.

**Persona C — The Local Business**
Saleem, 48, runs a meat shop in Tarnaka, Hyderabad. Has a WhatsApp number, Google Maps listing, and Instagram. Pain: customers don't know what's available today or how to order. Goal: a page with today's products, prices, and a WhatsApp order button — one tap on a counter sticker. Profile type: **Business**.

**Persona D — The Speaker**
Priya, 39, tech conference speaker and IT consultant, Chennai. Attends 6–8 events per year. Pain: handing people her LinkedIn URL at events is awkward and forgettable. Goal: tap her NFC card, page opens with her talks, bio, and contact. Profile type: **Speaker / Networker**.

---

## 5. Business Model

Tap has two revenue streams:

**1. AI Credits**

Every user gets free credits on signup. Credits are consumed when using AI features. When credits run out, users buy more via Razorpay.

| Action | Credits |
|---|---|
| Generate portfolio | 10 |
| Regenerate portfolio | 10 |
| AI bio rewrite | 3 |
| Theme rerender | 5 |

| Pack | Credits | Price |
|---|---|---|
| Starter (free on signup) | 20 | ₹0 |
| Basic | 50 | ₹49 |
| Standard | 150 | ₹99 |
| Pro | 500 | ₹249 |

20 free credits = 2 portfolio generations. Enough to experience the wow moment. Not enough to never pay.

**AI cost per generation:** ~₹2–3 (Claude Haiku, ~2,000–4,000 tokens). Portfolio HTML is cached after generation — no ongoing AI cost per page view. AI is only called when the user explicitly generates or regenerates.

**2. Physical Products**

NFC cards and printed visiting cards — optional upsells. Pricing TBD.

**Growth loop:** User generates portfolio → shares on WhatsApp → viewer asks "how did you make this?" → signs up via referral link → gets free credits → generates their own → cycle repeats.

**3. Referral Program**

Every user gets a unique referral link: `tap.zakapedia.in/?ref=username`

- New signup via referral → referrer earns 20 bonus credits
- New user still gets their standard 20 free credits on signup
- No cash payouts — credits only, keeps it simple and cost-controlled
- Every published Tap page has a subtle "Made with Tap" footer link carrying the page owner's referral code automatically — passive credit earning without active sharing

---

## 6. MVP Feature Scope

| Feature | Description | Priority | MVP |
|---|---|---|---|
| Auth & Signup | Email or Google sign-in, username selection, 20 free credits on signup, referral code applied if present | P0 | ✓ |
| Profile Type Selection | First onboarding step: Creator / Professional / Business / Service Professional / Speaker — drives all downstream sections and AI prompt | P0 | ✓ |
| Profile Input | Name, bio, photo upload, role — fields adapt based on profile type | P0 | ✓ |
| Resume Upload | Professional and Service Professional can upload PDF resume — AI extracts data and pre-fills onboarding form | P0 | ✓ |
| Sections Builder | Add/remove/reorder sections based on profile type — Links, Products, Services, Skills, Platforms, Book Appointment, etc. | P0 | ✓ |
| AI Portfolio Generation | Claude/Gemini generates full portfolio HTML from profile + sections — unique layout per profile type | P0 | ✓ |
| Theme Selector | 3 curated themes — recommended per profile type, AI respects design language | P0 | ✓ |
| Live Preview | Instant preview of generated portfolio before publishing | P0 | ✓ |
| Published Page | Hosted at `tap.zakapedia.in/username`, mobile-first, loads <2s | P0 | ✓ |
| Regenerate Portfolio | User edits profile/sections and regenerates — costs credits | P0 | ✓ |
| Credit System | Credit balance shown in dashboard, consumed on AI actions | P0 | ✓ |
| Buy Credits | Razorpay payment for credit packs (₹49 / ₹99 / ₹249) | P0 | ✓ |
| Referral Program | Unique referral link per user, 20 bonus credits on successful referral, "Made with Tap" footer carries referral code | P0 | ✓ |
| Analytics Dashboard | Page views, link clicks, traffic sources, 7-day sparkline | P1 | ✓ |
| AI Bio Rewrite | "Make my bio punchier" — AI rewrites copy, costs 3 credits | P1 | ✓ |
| NFC Card Order | Order form, Razorpay payment, manual fulfillment v1 | P1 | ✓ |
| Visiting Card Order | Choose template or upload, auto-filled from profile, QR code | P1 | ✓ |
| WhatsApp Share | One-tap share button with portfolio URL | P1 | ✓ |
| Multiple Pages | One user, multiple portfolios | P2 | – |
| Custom Domain | User brings own domain | P2 | – |
| Auto NFC Fulfillment | Automated card writing + shipping | P2 | – |

---

## 7. Themes (MVP)

Each theme is a complete design system — not just a colour swap. Themes define typography, spacing, card style, motion, and layout. Users cannot mix elements between themes.

When a user selects their profile type, a theme is **recommended** but not forced. They can switch to any theme.

### Theme 1 — Editorial
- **Recommended for:** Creator
- **Aesthetic:** Bold, editorial, magazine-feel — strong typographic hierarchy
- **Typography:** Serif display + clean sans-serif body
- **Motion:** Staggered section reveal on load, hover lift on cards
- **Sections it suits best:** Platforms, Latest Post, Links, About

### Theme 2 — Minimal
- **Recommended for:** Professional, Speaker / Networker
- **Aesthetic:** Clean, credible, confident — nothing distracting
- **Typography:** Refined sans-serif, generous whitespace
- **Motion:** Subtle fade-in, nothing that distracts
- **Sections it suits best:** Services, Skills, Talks, Contact, Links

### Theme 3 — Expressive
- **Recommended for:** Business
- **Aesthetic:** Playful, warm, full of personality
- **Typography:** Rounded or quirky display font + friendly body
- **Motion:** Bouncy hover states, fun entrance animations
- **Sections it suits best:** Products/Menu, Hours, Location, WhatsApp Order, About

---

## 8. Profile Types & Sections

Profile type is the first choice a user makes after signup. It is the single decision that personalises everything downstream — sections available, AI prompt used, theme recommended, and input fields shown.

### 8.1 Onboarding Flow

1. User signs up
2. Shown 5 options: **"What best describes you?"**
   - 🎨 Creator
   - 💼 Professional
   - 🏪 Business
   - 🔧 Service Professional
   - 🎤 Speaker / Networker
3. Profile input form adapts to chosen type
4. Sections panel shows only relevant section types
5. Theme recommendation is pre-selected (user can change)
6. AI prompt changes based on type — a Service Professional page looks nothing like a Creator page

**Onboarding steps (5 screens on mobile):**

- **Step 1** — Profile type selection (auto-advances on tap)
- **Step 2** — Basic details (name, username, photo, bio — fields adapt per type). For Professional and Service Professional: option to upload PDF resume — AI extracts and pre-fills all fields automatically, bundled into the 10-credit generation
- **Step 3** — Add sections (smart pre-suggestions per type, skippable)
- **Step 4** — Pick theme (recommended one pre-selected)
- **Step 5** — Generate portfolio (costs 10 credits, shows wow moment)

Rules: never more than one question per screen, progress indicator shown ("Step 2 of 5"), everything skippable except name and username, Google sign-in auto-fills name and photo.

### 8.2 Profile Types

| Profile Type | Who It's For | Recommended Theme | Input Fields |
|---|---|---|---|
| Creator | Bloggers, podcasters, YouTubers, Reels creators | Editorial | Name, bio, content niche, platforms, latest post URL |
| Professional | Freelancers, consultants, designers, IT professionals | Minimal | Name, bio, role/title, skills, experience summary |
| Business | Shops, salons, home bakers, local services, restaurants | Expressive | Business name, category, description, hours, location, WhatsApp number |
| Service Professional | Doctors, dentists, lawyers, CAs, tutors, trainers, photographers, plumbers, electricians, astrologers | Minimal | Full name, title (Dr./Adv./etc.), specialisation, qualifications, languages, location, availability |
| Speaker / Networker | Conference speakers, event attendees, networkers | Minimal | Name, bio, current role, talk topics, event history |

**Service Professional sub-categories:**
- Healthcare: doctors, dentists, physiotherapists, psychologists, nutritionists, veterinarians
- Beauty & Wellness: salons, barbers, spa, massage therapists, makeup artists, tattoo artists
- Legal & Finance: lawyers, CAs, tax consultants, financial advisors
- Education: tutors, music/dance/art teachers, driving instructors, fitness trainers, yoga instructors
- Home Services: electricians, plumbers, carpenters, AC repair, pest control, interior designers
- Creative: photographers, videographers, wedding planners
- Others: astrologers, auto mechanics

### 8.3 Sections by Profile Type

Sections are content blocks users add to their page. Available sections are filtered by profile type. Users can add, remove, and reorder sections within their type.

| Section | Creator | Professional | Business | Service Pro | Speaker |
|---|---|---|---|---|---|
| **Links** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **About** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Platforms** | ✓ | – | – | – | – |
| **Latest Post** | ✓ | – | – | – | – |
| **Services** | – | ✓ | ✓ | ✓ | – |
| **Skills** | – | ✓ | – | – | – |
| **Credentials** | – | – | – | ✓ | – |
| **Products / Menu** | – | – | ✓ | – | – |
| **Hours & Location** | – | – | ✓ | ✓ | – |
| **WhatsApp Order** | – | – | ✓ | – | – |
| **Book Appointment** | – | – | – | ✓ | – |
| **UPI Payment** | – | – | ✓ | ✓ | – |
| **Talks** | – | – | – | – | ✓ |
| **Contact / CTA** | ✓ | ✓ | ✓ | ✓ | ✓ |

### 8.4 Section Definitions

**Links** — Standard link list. Title + URL + optional icon. Available to all types.

**About** — Bio section. Text block, photo optional. Available to all types.

**Platforms** — Creator only. Cards for YouTube, Instagram, Spotify, Podcast, Gumroad etc. Each card shows platform name, handle, and a follow/subscribe CTA.

**Latest Post** — Creator only. Title, thumbnail, excerpt, link. Manual input or URL-parsed. Keeps the page feeling fresh.

**Services** — Professional and Business. List of services offered with optional price range and WhatsApp/email CTA per service.

**Skills** — Professional only. Tag-style skill chips. Categorised (e.g. Design, Development, Strategy).

**Products / Menu** — Business only. Item name, description, price, photo. WhatsApp order button per item or global. This is the pivot feature for shop owners.

**Hours & Location** — Business only. Opening hours table + Google Maps embed link.

**WhatsApp Order** — Business only. Prominent CTA button linking to a pre-filled WhatsApp message ("Hi, I'd like to order from [shop name]").

**UPI Payment** — Business and Service Professional. A UPI payment button or QR code on the profile. Supports GPay, PhonePe, Paytm, BHIM. Use cases: advance payments, tips, service fees, product payments. User enters their UPI ID — Tap generates the payment link and QR automatically.

**Book Appointment** — Service Professional only. Phase 1 (MVP): a WhatsApp-based appointment request. Visitor taps "Book Appointment" → pre-filled WhatsApp message opens addressed to the professional:
```
Hi [Name], I'd like to book an appointment.
My name is ___ and I'm available on ___.
```
Professional receives the request on WhatsApp and manages scheduling manually — exactly how they work today. Zero new behaviour required. No backend needed — just a smart WhatsApp deep link with pre-filled text.

Applicable to: doctors, dentists, lawyers, tutors, salons, photographers, fitness trainers, and any service professional who works by appointment.

**Talks** — Speaker only. Talk title, event name, date, video/slides link.

**Contact / CTA** — All types. Email, phone, WhatsApp, social links. Rendered as a bottom section.

### 8.5 Data Model Addition

```
tap.sections — id, page_id, type (links/about/platforms/latest_post/services/skills/
               credentials/products/hours_location/whatsapp_order/book_appointment/
               upi_payment/talks/contact),
               position, content (jsonb), created_at
```

`content` is a JSONB field that stores the section's data in a flexible structure per type. Examples:

```json
// Products section item
{ "items": [{ "name": "Mutton", "price": "₹650/kg", "photo_url": "...", "whatsapp_msg": "Hi, I'd like to order Mutton" }] }

// Platforms section
{ "platforms": [{ "name": "YouTube", "handle": "@zaheer800", "url": "https://youtube.com/..." }] }

// Talks section
{ "talks": [{ "title": "Building AI Products Solo", "event": "PyCon India 2025", "date": "2025-09-14", "slides_url": "..." }] }

// Book Appointment section
{ "whatsapp_number": "919876543210", "pre_filled_message": "Hi Dr. Ahmed, I'd like to book an appointment. My name is ___ and I'm available on ___." }

// UPI Payment section
{ "upi_id": "doctor@upi", "name": "Dr. Ahmed", "note": "Consultation fee" }
```

---

## 9. AI Portfolio Generation

This is the core product differentiator. Everything else supports it.

### 9.1 How It Works

1. User selects profile type → fills in profile fields → adds sections
2. User selects or confirms theme
3. Clicks "Generate My Portfolio" — costs 10 credits
4. Claude generates a complete single-page portfolio HTML tailored to profile type:
   - Hero section with name, role, personalised tagline
   - All added sections rendered in the chosen theme's design language
   - Copy personalised from bio input — not generic filler
   - Layout and tone match the profile type
5. Preview shown instantly
6. User publishes — page goes live at `tap.zakapedia.in/username`

### 9.2 What Claude Generates

- Full HTML + inline CSS — self-contained, no external dependencies
- Personalised copy derived from the user's bio and section content
- Layout and tone varies by profile type — a Business page looks nothing like a Creator page
- Every output is unique — no two portfolios look the same
- Mobile-first, fast-loading

### 9.3 Prompt Strategy — Per Profile Type

The AI prompt changes based on profile type. Each type has a distinct tone, layout priority, and section rendering approach.

| Profile Type | Tone | Layout Priority | Key Differentiator |
|---|---|---|---|
| Creator | Expressive, personal, warm | Platforms and Latest Post above the fold | Feels like a fan landing page |
| Professional | Confident, credible, concise | Services and Skills above the fold | Feels like a one-page CV that closes deals |
| Business | Friendly, direct, action-oriented | Products/Menu and WhatsApp Order above the fold | Feels like a mini storefront |
| Service Professional | Trustworthy, calm, credible | Credentials and Book Appointment above the fold | Feels like a professional clinic profile |
| Speaker | Authoritative, inspiring, clear | Talks and Bio above the fold | Feels like a speaker bureau profile |

System prompt includes:
- Profile type declaration — sets tone and layout priority
- Theme design tokens (colours, fonts, spacing rules)
- Output format instructions (valid HTML, inline CSS only, no external scripts)
- Section content injected as structured JSON
- User's bio and profile fields

### 9.4 Regeneration

User can edit their profile, sections, or theme and regenerate at any time — costs 10 credits. Previous version is replaced. Encourages iteration and credit consumption.

### 9.5 Model & Cost

- Model: Claude Haiku (fast, cost-effective, high quality for structured HTML output)
- Estimated cost per generation: ₹2–3
- Portfolio HTML cached in Supabase storage after generation
- AI not called on page views — only on generate/regenerate actions

---

## 10. Credit System

### 9.1 Credit Actions

| Action | Credits |
|---|---|
| Generate portfolio | 10 |
| Regenerate portfolio | 10 |
| AI bio rewrite | 3 |
| Theme rerender | 5 |

### 9.2 Credit Packs

| Pack | Credits | Price |
|---|---|---|
| Starter (free on signup) | 20 | ₹0 |
| Basic | 50 | ₹49 |
| Standard | 150 | ₹99 |
| Pro | 500 | ₹249 |

### 9.3 Implementation

- `tap.credits` table: user_id, balance, updated_at
- `tap.credit_transactions` table: id, user_id, action, credits_used, created_at
- Credit check before every AI action — block if insufficient, prompt to buy
- Credit balance always visible in dashboard header
- Razorpay payment → webhook → credit top-up on success

### 9.4 Data Model Addition

```
tap.credits              — user_id, balance, updated_at
tap.credit_transactions  — id, user_id, action, credits_used, razorpay_payment_id, created_at
```

---

## 10. NFC Card Product

### 10.1 Hardware
- Card type: NTAG213 PVC NFC cards (LINQS or equivalent)
- Tag format: NDEF URI record — `https://tap.zakapedia.in/username`
- iPhone compatibility: iOS 13+ supports background NFC natively (iPhone XS and later)
- Write tool: NFC Tools app → Add Record → URL/URI (ensures proper NDEF format for iOS)

### 10.2 Order Flow (MVP — Manual Fulfillment)

1. User clicks "Order My NFC Card" in dashboard
2. Fills order form: name on card, quantity, shipping address
3. Pays via Razorpay (estimated ₹199–₹299/card)
4. Zaheer writes the card using NFC Tools, ships via courier
5. User sees order status in dashboard: Placed → Shipped → Delivered

### 10.3 NFC Tracking

Cards shipped with URL: `https://tap.zakapedia.in/username?ref=nfc`

This UTM parameter surfaces in the user's analytics dashboard under Traffic Sources as **NFC Tap** — giving users proof their card is working.

---

## 11. Visiting Card Product

### 11.1 Specifications
- **Size:** Standard 85×54mm (3.5" × 2")
- **Sides:** Double sided
- **Finish:** Matte or glossy — user chooses at order time
- **MOQ:** 100 cards per order
- **QR code:** Printed on every card by default, linking to `tap.zakapedia.in/username`

### 11.2 Templates

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

### 11.3 Upload Option
Users who have their own card design can upload it for print. Tap prints and ships — no design service provided for uploads. QR code is not auto-added to uploaded designs (user is responsible for including it).

### 11.4 Order Flow (MVP — Manual Fulfillment)

1. User clicks "Order Visiting Cards" in dashboard
2. Chooses template (Editorial / Minimal / Expressive) or selects Upload
3. Reviews auto-filled details — name, bio snippet, QR code, links shown on card
4. Chooses finish: matte or glossy
5. Confirms quantity (MOQ 100) and shipping address
6. Pays via Razorpay (pricing TBD)
7. Zaheer sends to print vendor, ships via courier
8. User sees order status: Placed → Printing → Shipped → Delivered

### 11.5 Data Model Addition
```
visiting_card_orders — id, user_id, page_id, template (editorial/minimal/expressive/upload),
                       finish (matte/glossy), quantity, design_file_url, shipping_address,
                       status, razorpay_payment_id, created_at
```

## 12. User Analytics Dashboard

One screen. Numbers that make them smile and tell them what's working.

### 12.1 Top Line
- Total page views — all time + this week vs last week
- Total link clicks — all time + this week vs last week
- Overall click-through rate (clicks ÷ views)

### 12.2 Per-Link Breakdown
- Click count per link
- Relative performance bar — visual comparison
- Sorted by clicks descending

### 12.3 Traffic Sources
- **WhatsApp** — via WhatsApp referrer header
- **Instagram** — via Instagram referrer
- **NFC Tap** — via `?ref=nfc` UTM
- **Direct** — everything else

### 12.4 Time Chart
- Page views over last 7 days (sparkline)
- Toggle: 7 days / 30 days

### 12.5 Implementation Notes
- `page_views` table: page_id, timestamp, source
- `link_clicks` table: link_id, page_id, timestamp, source
- All queries run client-side from Supabase — no third-party analytics at MVP
- No PII stored in analytics events

---

## 13. Success Metrics

**Primary metric:** Link click-through rate. If visitors are clicking links, the page is working.

| Metric | Description | Target (Month 3) |
|---|---|---|
| Pages Generated | Total AI-generated portfolios published | 500 |
| Generation Completion Rate | Users who generate and publish (not abandon) | > 60% |
| Link CTR | Link clicks ÷ page views | > 30% |
| Credit Purchase Rate | % of users who buy credits after free credits run out | > 15% |
| DAU/MAU | Daily ÷ monthly active users | > 20% |
| NFC Cards Ordered | Total NFC card orders | 50 |
| Visiting Cards Ordered | Total visiting card orders | 30 |
| Page-to-Physical Conversion | % of page owners who order any physical product | > 10% |
| Return to Regenerate | Users who regenerate portfolio after first publish | > 40% |
| Referral Conversion | % of users who refer at least one person | > 20% |
| Viral Coefficient | New signups per existing user via referral | > 0.5 |
| WhatsApp Share Rate | Users who tap the share button | > 25% |

---

## 14. Technical Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React + TypeScript |
| Styling | Tailwind CSS + custom theme tokens |
| Backend / DB | Supabase — shared Zakapedia instance, `tap` schema |
| AI (Development) | Google Gemini Flash — free tier for testing and development |
| AI (Production) | Anthropic Claude Haiku — switched via environment variable |
| Hosting | Vercel (`tap.zakapedia.in` subdomain) |
| Payments | Razorpay (credits + physical orders) |
| Analytics | Custom — Supabase tables, no third-party |
| NFC Write Tool | NFC Tools app (manual fulfillment v1) |
| Repo | GitHub, deployed via Vercel CI |

### 14.1 Supabase Strategy

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

### 14.2 Data Model (Key Tables)

```
tap.users                — id (references auth.users), username, email, created_at
tap.pages                — id, user_id, theme, accent_color, name, bio, role, profile_type, avatar_url, portfolio_html, published
tap.sections             — id, page_id, type, position, content (jsonb), created_at
tap.links                — id, page_id, title, url, icon, position, created_at
tap.page_views           — id, page_id, timestamp, source
tap.link_clicks          — id, link_id, page_id, timestamp, source
tap.credits              — user_id, balance, updated_at
tap.credit_transactions  — id, user_id, action, credits_used, razorpay_payment_id, created_at
tap.referrals            — id, referrer_user_id, referred_user_id, credits_awarded, created_at
tap.nfc_orders           — id, user_id, page_id, name_on_card, address, quantity, status, razorpay_payment_id, created_at
tap.visiting_card_orders — id, user_id, page_id, template, finish, quantity, design_file_url, address, status, razorpay_payment_id, created_at
```

---

## 15. Non-Goals (Explicit)

These are features Tap will **never build** — not just deferred, but explicitly out of scope permanently or until a major strategic shift:

- **Business directory or discovery engine** — Tap is sharing-first, not search-first. We are not Justdial, Google Business, or IndiaMART.
- **Marketplace** — No buying/selling of products between users on the platform.
- **Public review system** — No star ratings, no user reviews. Trust is built through the page itself.
- **Social feed** — No timeline, no posts, no following feed. This is not Instagram or LinkedIn.
- **Chat platform** — No in-app messaging. WhatsApp handles communication.
- **Delivery systems** — No order fulfilment, no logistics.
- **E-commerce marketplace** — Products section links to WhatsApp, not a cart system.

Reason: each of these creates massive operational complexity and direct competition with large, well-funded incumbents. Tap wins by being focused and simple, not by trying to replace everything.

---

## 16. Out of Scope (MVP)

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

## 17. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI cost overrun | Claude Haiku is cheap; cache HTML after generation; rate-limit regeneration to once/day |
| Credit abuse / free tier exploitation | 20 free credits = 2 generations max; require Razorpay-verified payment to top up |
| NFC iPhone compatibility | Use NDEF URI records via NFC Tools; test on iPhone XS+ before every card batch |
| Design quality at scale | Curated themes + structured prompt keeps output consistent; test with 20 edge-case bios before launch |
| Manual fulfillment bottleneck | Cap NFC + visiting card orders per week in v1; automate in v2 once demand proven |
| Print vendor dependency | Identify 2 print vendors in Hyderabad before launch; never rely on just one |
| Supabase free tier limits | Monitor usage; upgrade before hitting limits (~500 active pages is safe) |
| Low organic discovery | AI-generated portfolio is shareable enough to drive "how did you make this?" organically |

---

## 18. Distribution Strategy

Getting the first 50 users is the hardest problem. No ads, no budget, no field sales team.

**Month 1 — Personal network:**
- Zaheer publishes his own Tap page and shares on LinkedIn, Twitter, Instagram
- Blog post: origin story — "I needed one link for everything I've built, so I made Tap"
- Podcast episode: building in public — share what you're learning as you build
- First 10 users come from direct network

**Month 2 — Referral loop activates:**
- Every published page has "Made with Tap" footer with owner's referral code
- Every user shares their referral link for passive credit earning
- Share in indie hacker communities, product builder WhatsApp groups
- WhatsApp sharing built in — every page share is a potential new signup

**Month 3 — SMB channel:**
- Partner with 2–3 print shops in Hyderabad
- They offer QR standees and visiting cards to their customers, powered by Tap
- Print shop becomes the sales channel — they onboard, Tap provides the product

---

## 19. Roadmap

### v1.0 — MVP (Q2 2026)
Auth, profile type selection (5 types), onboarding form, sections builder, AI portfolio generation, 3 themes, credit system, published pages, analytics dashboard, NFC card orders, visiting card orders, Book Appointment (Phase 1 — WhatsApp only)

### v1.1 — Post-Launch
- Tamil and Telugu UI localisation
- 2 additional themes with new AI prompt variants
- AI bio rewrite feature (3 credits)
- WhatsApp Business API for order notifications
- In-browser visiting card preview before ordering
- Latest Post section — URL parsing (auto-fetch title + thumbnail)
- Book Appointment Phase 2 — request-based slot selection, doctor approves via WhatsApp

### v2.0 — Growth
- Multiple portfolios per user
- Custom domain support
- Automated NFC fulfillment pipeline
- Automated print fulfillment for visiting cards
- Agency / white-label accounts
- New profile type: **Event / Community** (for Masjid app crossover potential)
- Book Appointment Phase 3 — real-time slot locking, automatic confirmations and reminders
- Section: Testimonials
- Section: Gallery

---

## 20. Open Questions

- **Pricing model** — ~~resolved~~: free with credits; revenue from credit packs + physical orders
- **Credit pricing** — ~~resolved~~: ₹49 / ₹99 / ₹249 packs — confirm against actual Haiku API costs before launch
- **NFC card pricing** — ₹199 or ₹299 per card? Includes shipping?
- **Visiting card pricing** — price per 100 cards? Matte vs glossy surcharge? TBD post print vendor quote
- **Print vendor** — identify 2 vendors in Hyderabad before launch for redundancy
- **Username reservation** — should Zakapedia brand names be reserved on launch?
- **Avatar storage** — Supabase storage bucket or Cloudinary? Decide before build.
- **Analytics retention** — how long to keep raw event data? 90 days recommended for MVP.
- **AI model** — Claude Haiku confirmed for cost; test output quality vs Sonnet before committing.
- **Portfolio versioning** — save previous versions when user regenerates? Simple v1: replace only.

---

*Zakapedia · tap.zakapedia.in · April 2026*
