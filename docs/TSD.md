# Technical System Design — Tap by Zakapedia

**Live URL:** `tap.zakapedia.in`  
**Purpose:** Free bio-link page builder. Revenue from optional NFC cards and visiting cards.  
**Stack:** Vite + React + TypeScript · Tailwind CSS · Supabase · Vercel · Razorpay

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Frontend](#2-frontend)
3. [Routing & Auth Flow](#3-routing--auth-flow)
4. [Data Model](#4-data-model)
5. [Row-Level Security](#5-row-level-security)
6. [Storage](#6-storage)
7. [AI Pipeline](#7-ai-pipeline)
8. [Analytics](#8-analytics)
9. [Credits System](#9-credits-system)
10. [Realtime](#10-realtime)
11. [Theme System](#11-theme-system)
12. [Profile & Section Types](#12-profile--section-types)
13. [Physical Products](#13-physical-products)
14. [Admin Panel](#14-admin-panel)
15. [Key Constraints & Decisions](#15-key-constraints--decisions)

---

## 1. High-Level Architecture

```
Browser (SPA)
    │
    ├── Vercel CDN (static Vite build)
    │
    ├── Supabase (shared Zakapedia project)
    │       ├── auth.*          (shared across all Zakapedia apps)
    │       ├── tap.*           (all Tap tables — never public.*)
    │       ├── storage         (tap-avatars bucket, public)
    │       └── Edge Functions  (ai-generate → Google Gemini API)
    │
    └── ipapi.co (country detection, fire-and-forget on page view)
```

The entire backend is Supabase. There is no custom server. All business logic runs either in the browser (RLS-gated Supabase queries) or in the `ai-generate` Edge Function (Deno runtime).

---

## 2. Frontend

| Concern | Implementation |
|---|---|
| Build tool | Vite (`vite.config.ts` — minimal config, just the React plugin) |
| UI framework | React 18 + TypeScript |
| Styling | Tailwind CSS + PostCSS |
| Routing | React Router v6 (`BrowserRouter`) |
| Auth state | React Context (`AuthContext`) |
| Supabase client | `src/lib/supabase.ts` — single client, `db.schema: 'tap'` |
| Image compression | `src/utils/compressImage.ts` — client-side before upload |
| Debounced auto-save | `src/hooks/useDebounce.ts` — 1500 ms for page edits |

**Supabase client config:**
```ts
createClient(url, key, { db: { schema: 'tap' } })
```
All `supabase.from('table')` calls implicitly query `tap.*`. Auth always uses `auth.*` regardless.

---

## 3. Routing & Auth Flow

### Route table

| Path | Component | Guard |
|---|---|---|
| `/` | `Home` | Public |
| `/login` | `Login` | Public |
| `/signup` | `Signup` | Public |
| `/privacy` | `Privacy` | Public |
| `/terms` | `Terms` | Public |
| `/auth` | `AuthRedirect` | Public (OAuth callback) |
| `/onboarding` | `Onboarding` | `ProtectedRoute` |
| `/dashboard` | `Dashboard` | `ProtectedRoute` |
| `/admin` | `AdminOrders` | `ProtectedRoute` + email check |
| `/:username/:slug` | `PortfolioPage` | Public |
| `/:username` | `PublicProfile` | Public |

**Route ordering matters:** `/:username/:slug` is declared before `/:username` so portfolio URLs are not swallowed by the profile catch-all.

### Auth state machine (`AuthContext`)

```
app load
    │
    ├─ getSession() ──► user found ──► fetchTapUser(uid)
    │                                       │
    │                               tapUser found ──► authenticated
    │                               tapUser null  ──► /onboarding
    │
    └─ user null ──► /login

onAuthStateChange
    ├─ INITIAL_SESSION  → skipped (already handled by getSession)
    ├─ SIGNED_IN        → fetchTapUser → loading=false
    └─ SIGNED_OUT       → tapUser=null, loading=false
```

`loading` stays `true` while `fetchTapUser` is in flight — prevents premature redirects.

### OAuth redirect flow

`signInWithGoogle()` → Supabase Google OAuth → redirects to `/auth?…` → `AuthRedirect` component reads state, then routes:
- No user → `/login`
- No tapUser → `/onboarding`
- Admin email → `/admin`
- Otherwise → `/dashboard`

### Referral capture

`ReferralCapture` component (rendered outside `AuthProvider`) reads `?ref=` from URL on any page load and stores it to `localStorage('tap_referral')`. Applied later when crediting referrals.

---

## 4. Data Model

All tables live under the `tap` schema. `auth.users` is shared with other Zakapedia apps.

### tap.users
```sql
id          UUID  PK → auth.users(id) ON DELETE CASCADE
username    TEXT  UNIQUE, CHECK regex: ^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$
user_type   TEXT  JSON array stored as TEXT (e.g. '["creator","tech"]')
created_at  TIMESTAMPTZ
```
One row per authenticated user. Created during onboarding.

### tap.pages
```sql
id             UUID  PK
user_id        UUID  → tap.users(id) ON DELETE CASCADE
theme          TEXT  CHECK('editorial','minimal','expressive'), DEFAULT 'minimal'
accent_color   TEXT  DEFAULT '#3B82F6'
name           TEXT
bio            TEXT  (max 500 chars enforced client-side)
role           TEXT  (optional — job title / niche / category)
profile_type   TEXT  (creator | professional | business | service_pro | speaker)
avatar_url     TEXT  (Supabase Storage public URL)
banner_url     TEXT  (Supabase Storage public URL)
portfolio_html TEXT  (full AI-generated HTML page, stored verbatim)
portfolio_slug TEXT  (URL slug, e.g. 'portfolio', 'menu', 'cv')
published      BOOL  DEFAULT false
updated_at     TIMESTAMPTZ
```
One page per user. All builder edits auto-save via debounce (1500 ms).

### tap.links
```sql
id         UUID  PK
page_id    UUID  → tap.pages(id) ON DELETE CASCADE
title      TEXT
url        TEXT
icon       TEXT  (unused field, kept for future use)
position   INT   (manual ordering)
created_at TIMESTAMPTZ
```
Ordered list of links on the profile page.

### tap.sections
```sql
id         UUID  PK
page_id    UUID  → tap.pages(id) ON DELETE CASCADE
type       TEXT  (see section types below)
position   INT
content    JSONB (schema varies by type)
created_at TIMESTAMPTZ
```
Portfolio sections. Content is untyped JSONB — each section type defines its own shape (see §12).

### tap.page_views
```sql
id        UUID  PK
page_id   UUID  → tap.pages(id) ON DELETE CASCADE
timestamp TIMESTAMPTZ DEFAULT now()
source    TEXT  (direct | nfc | instagram | twitter | linkedin | whatsapp | web)
country   TEXT  (nullable — resolved via ipapi.co)
```

### tap.link_clicks
```sql
id        UUID  PK
link_id   UUID  → tap.links(id) ON DELETE CASCADE
page_id   UUID  → tap.pages(id) ON DELETE CASCADE
timestamp TIMESTAMPTZ DEFAULT now()
source    TEXT
```

### tap.nfc_orders
```sql
id                UUID  PK
user_id           UUID  → tap.users(id)
page_id           UUID  → tap.pages(id)
name_on_card      TEXT
address           JSONB  { name, line1, line2, city, state, pincode, phone }
quantity          INT   DEFAULT 1
status            TEXT  CHECK('placed','printing','shipped','delivered','cancelled')
payment_reference TEXT  (manual payment ref or Razorpay ID)
created_at        TIMESTAMPTZ
```

### tap.visiting_card_orders
```sql
id                UUID  PK
user_id           UUID  → tap.users(id)
page_id           UUID  → tap.pages(id)
template          TEXT  CHECK('editorial','minimal','expressive','upload')
finish            TEXT  CHECK('matte','glossy')
quantity          INT   DEFAULT 100  (MOQ 100)
design_file_url   TEXT  (nullable — for 'upload' template)
address           JSONB
status            TEXT  CHECK('placed','printing','shipped','delivered','cancelled')
payment_reference TEXT
created_at        TIMESTAMPTZ
```

### tap.contact_messages
```sql
id           UUID  PK
page_id      UUID  → tap.pages(id)
sender_name  TEXT
message      TEXT
read         BOOL  DEFAULT false
created_at   TIMESTAMPTZ
```
Visitors send these from the public profile page.

### tap.order_messages
```sql
id          UUID  PK
user_id     UUID  → tap.users(id)
order_id    UUID  nullable (linked order)
order_type  TEXT  ('nfc' | 'visiting_card' | 'support')
message     TEXT
from_admin  BOOL
read        BOOL
created_at  TIMESTAMPTZ
```
Bidirectional messaging between user and admin about orders or support.

### tap.credits
```sql
user_id    UUID  PK → tap.users(id)
balance    INT
updated_at TIMESTAMPTZ
```
AI credit wallet. One row per user.

---

## 5. Row-Level Security

Every table has RLS enabled. Policy summary:

| Table | Public SELECT | Owner ALL | Notes |
|---|---|---|---|
| tap.users | Yes (username lookups) | Yes | Public read needed for username availability checks |
| tap.pages | Published pages only | Yes | `published = true` filter |
| tap.links | Links of published pages | Yes | Joins to pages.published |
| tap.page_views | No | Yes | Anyone can INSERT (analytics) |
| tap.link_clicks | No | Yes | Anyone can INSERT |
| tap.nfc_orders | No | Yes (`user_id = auth.uid()`) | — |
| tap.visiting_card_orders | No | Yes | — |
| tap.contact_messages | No | Yes (owner reads) | Anyone can INSERT |
| tap.order_messages | No | Yes | — |
| tap.credits | No | Yes | — |

Admin operations (cross-user reads) bypass RLS via the service role key, used only in Supabase SQL editor or direct admin queries — not exposed client-side.

---

## 6. Storage

**Bucket:** `tap-avatars` (public)

Used for:
- Avatars: `{user_id}/avatar.jpg` — compressed to 300×300 px, 0.85 quality before upload
- Banners: `{user_id}/banner.jpg` — compressed to 1200×400 px, 0.82 quality

Storage RLS: upload/update/delete require `auth.uid()::text = folder name`. Public GET unrestricted.

Cache-busting: `?t={Date.now()}` appended to public URL after upload to bypass CDN cache.

---

## 7. AI Pipeline

### Architecture

```
Browser
  └── src/services/ai.ts
        └── fetch POST /functions/v1/ai-generate
                    (Authorization: Bearer anon_key)
                         │
                    Supabase Edge Function (Deno)
                    supabase/functions/ai-generate/index.ts
                         │
                    Google Gemini API
                    gemini-2.5-flash
```

The Google AI API key (`GOOGLE_AI_API_KEY`) lives as a Supabase secret — never in the browser bundle.

### Three AI operations

**1. Portfolio generation** (10 credits)

Input: profile type, theme, name, bio, role, user roles, accent color, avatar URL, links, sections.

Processing in `src/services/ai.ts`:
- Links are enriched with platform detection (Instagram, YouTube, WhatsApp, etc.) and handle extraction
- UPI payment sections get a pre-computed QR code URL (`api.qrserver.com`)
- WhatsApp number extracted from links or whatsapp_order section
- A per-section checklist is built for the AI to verify nothing is skipped
- Two prompts composed: system (theme tokens + profile type instructions) + user (enriched data)

Edge function sends to Gemini with `maxOutputTokens: 32768`. Response is a complete standalone HTML document, stored verbatim in `tap.pages.portfolio_html`.

**2. Bio rewrite** (3 credits)

Input: current bio text + profile type. Output: rewritten bio ≤ 450 characters, wrapped in `<OUTPUT>…</OUTPUT>` tags.

**3. Resume extraction** (5 credits)

Input: PDF file as base64. The PDF is sent inline to Gemini as `inline_data`. Output: JSON with name, role, bio, skills, services, credentials, talks, phone. Used to pre-fill portfolio sections during onboarding or from the Portfolio tab.

### Edge function response parsing

- Portfolio HTML: extracts content between `<OUTPUT>` tags, or falls back to `<!DOCTYPE html…</html>` regex
- Resume: extracts outermost `{…}` JSON object
- Markdown code fences stripped if model wraps output despite instructions

---

## 8. Analytics

No third-party library. All events written directly to Supabase.

### Page view tracking (`trackPageView`)

Fired on `PublicProfile` mount (fire-and-forget). Two async operations run in parallel:
1. `detectSource()` — checks `?ref=` param (nfc, whatsapp), then `document.referrer` (instagram, twitter, linkedin, web), falls back to `direct`
2. `detectCountry()` — fetches `https://ipapi.co/json/` with 3 s timeout, caches result in `sessionStorage('tap_country')`

Writes one row to `tap.page_views`.

### Link click tracking (`trackLinkClick`)

Called from theme components when a link is tapped. Writes to `tap.link_clicks`.

### Analytics dashboard (`AnalyticsDashboard`)

User-facing: 7-day/30-day views, link click counts, traffic source breakdown, country breakdown, per-link click stats. Rendered as custom SVG sparklines (bezier curves). No charting library.

### Admin analytics

Cross-user aggregates: total users, new users (7d), published pages, total views, views (7d), daily activity bar chart, top profiles by view count, traffic source distribution.

---

## 9. Credits System

| Action | Cost |
|---|---|
| Generate portfolio | 10 credits |
| Rewrite bio | 3 credits |
| Fill from resume | 5 credits |
| Referral (earn) | +20 credits |

Credits are read fresh from DB before each AI operation to prevent stale-state races. Deducted after successful AI response by updating `tap.credits.balance`. Balance shown in dashboard header.

Referral tracking: `?ref=username` captured to `localStorage('tap_referral')` on any page visit via `ReferralCapture`. Credit grant logic is manual / admin-triggered (no automated referral webhook yet).

---

## 10. Realtime

The Dashboard subscribes to Supabase Realtime on mount:

```
channel: 'inbox-realtime'
  ├── INSERT tap.order_messages WHERE user_id = {uid}
  │       → prepend to orderMessages state
  ├── INSERT tap.contact_messages WHERE page_id = {pid}
  │       → prepend to messages state
  ├── UPDATE tap.nfc_orders WHERE user_id = {uid}
  │       → replace updated order in nfcOrders state
  └── UPDATE tap.visiting_card_orders WHERE user_id = {uid}
          → replace updated order in visitingOrders state
```

Channel torn down on component unmount. Used for live order status updates and new inbox messages.

---

## 11. Theme System

Three complete design systems — not colour swaps. Each owns typography, motion, and layout.

| Theme | Target | Typography | Hero | Motion |
|---|---|---|---|---|
| Editorial | Creators, bloggers | Playfair Display + DM Sans | Dark near-black (#060608), dominant italic name | Fade-up, staggered delays |
| Minimal | Freelancers, consultants | Inter (all weights) | White/light grey, centered 600px max-width | Gentle translateY fade, no bounce |
| Expressive | Artists, local businesses | Nunito 800 | Bold accent gradient hero, layered white content below | Bouncy cubic-bezier, scale on hover |

Theme components: `src/components/themes/Editorial.tsx`, `Minimal.tsx`, `Expressive.tsx`.

Used in two places:
1. **Live preview** in Dashboard (scaled 0.64× in a phone frame mockup)
2. **PublicProfile** (full render for visitors)

Theme + accent colour selection → `ThemeSelector` component → debounced auto-save to DB.

---

## 12. Profile & Section Types

### Profile types

| ID | Label | AI prompt style | Recommended theme | Default slug |
|---|---|---|---|---|
| `creator` | Creator | Fan landing page — drives follows | editorial | showcase |
| `professional` | Professional | Client-conversion page — drives enquiries | minimal | portfolio |
| `business` | Business | Storefront — WhatsApp ordering, product catalog | expressive | menu |
| `service_pro` | Service Pro | Trust-first — credentials, booking CTA | minimal | portfolio |
| `speaker` | Speaker / Networker | Stage presence — talk history, booking | minimal | cv |

Selected during onboarding. Stored in `tap.pages.profile_type`.

### Section types

| Type | Content shape | Notes |
|---|---|---|
| `about` | `{ text }` | Business story or shop description |
| `latest_post` | `{ title, url, title_2, url_2, title_3, url_3 }` | Up to 3 posts |
| `links` | `{ text }` | Social platform list |
| `services` | `{ text }` | Newline-separated, "Name – ₹Price" |
| `skills` | `{ text }` | Comma-separated skill tags |
| `credentials` | `{ text }` | Newline-separated, "Degree – Institution" |
| `products` | `{ items: ProductItem[] }` | Full catalog, managed by `ProductSectionEditor` |
| `hours_location` | `{ hours, address }` | Address may be a Google Maps URL |
| `whatsapp_order` | `{ number }` | Generates wa.me link |
| `book_appointment` | `{ number }` | Generates wa.me appointment link |
| `upi_payment` | `{ upi_id }` | QR URL computed at generation time |
| `talks` | `{ text }` | Newline-separated, "Title – Event – Year" |
| `contact` | `{ email, phone }` | Direct contact details |

Sections are stored as JSONB. Products section has its own editor (`ProductSectionEditor`) with per-item state; all others use `SectionContentEditor` with text/textarea fields. Changes auto-save on field blur.

---

## 13. Physical Products

### NFC Cards

- NTAG213 PVC cards, programmed with NFC Tools to `https://tap.zakapedia.in/:username`
- Visitors arriving via NFC get `?ref=nfc` for analytics source tracking
- Fulfillment: manual (admin ships cards)
- Pricing: ₹199 or ₹299/card (TBD)
- Order flow: placed → printing → shipped → delivered
- User can cancel only in `placed` status

### Visiting Cards

- 85×54 mm, MOQ 100, matte or glossy
- 4 templates: editorial / minimal / expressive (match themes) + upload own design
- Status flow: placed → printing → shipped → delivered
- Static PDF preview for MVP (no live in-browser render)
- Pricing: TBD after print vendor quote

Both order types use the same `ShippingAddress` JSONB shape: `{ name, line1, line2, city, state, pincode, phone }`.

### Payments

Razorpay integrated (referenced in stack). Payment reference stored as `payment_reference TEXT` on each order table. Full Razorpay webhook flow not visible in current codebase — appears to be manual for MVP.

---

## 14. Admin Panel

**Access:** Email `zaheer800@gmail.com` only. Check is client-side in `App.tsx` (`AuthRedirect`) and in the Dashboard header. No server-side RBAC — admin reads use the anon key with cross-user queries that RLS permits because the admin's own `auth.uid()` matches service-level reads via join policies.

**Tabs:**

| Tab | Content |
|---|---|
| Overview | Aggregate stats: users, pages, views, clicks (7d and all-time), daily activity chart, traffic sources, top profiles by views, all users table, all pages table |
| Orders | NFC orders + visiting card orders with status stepper. Admin can advance status (placed → printing → shipped → delivered). Search/filter by username. |
| Inbox | All user support messages and order messages. Mark read/unread. Reply from admin. |

Admin data is fetched in a single `loadAdminData()` call with multiple parallel Supabase queries. No dedicated admin API — queries run directly from the browser with the anon key against RLS-enabled tables (admin user's UID has access to all relevant data via join conditions).

---

## 15. Key Constraints & Decisions

### Username namespace
Global and flat. `/:username` is the public URL. Reserved words blocked at onboarding: `login, logout, signup, onboarding, dashboard, admin, api, tap, zakapedia, settings, account, profile, about, terms, privacy, help, support, favicon, robots, auth`.

### One page per user
No multiple pages. The dashboard edits the single `tap.pages` row for the authenticated user.

### Portfolio HTML storage
Generated HTML is stored verbatim in `portfolio_html TEXT`. No post-processing, no server-side rendering — served raw in an `<iframe>` or at `/:username/:slug`. This means the AI-generated page is fully standalone (includes its own `<style>`, Google Font `<link>`, and footer attribution).

### Avatar storage
Supabase Storage bucket `tap-avatars` (decision made). Cloudinary was considered and rejected.

### Analytics
Custom, no third-party. 90-day rolling window recommended for raw events at scale. Country detection via `ipapi.co` with session cache — no PII stored.

### No automated fulfillment
v1 fulfillment is entirely manual (admin updates status fields). No print vendor API integration.

### MVP exclusions
Multiple pages per user · custom domains · scheduled links · team accounts · automated fulfillment · embedded media.

### Multi-schema Supabase
Tap shares the Zakapedia Supabase project with `masjid.*`, `iplpredictor.*`. The `tap` schema is isolated by the client-level `db.schema` setting. Never write to `public.*`.
