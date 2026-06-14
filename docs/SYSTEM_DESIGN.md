# Tap by Zakapedia — System Design Document

**Version:** 1.0  
**Last Updated:** June 2, 2026  
**Status:** Active

---

## 1. Executive Summary

Tap is a free bio link page builder enabling creators, businesses, and professionals to create beautiful brand pages. Revenue is generated through optional NFC cards (₹199–299) and printed visiting cards (₹100+, MOQ 100).

The system is designed for scalability, performance, and ease of management, with a focus on real-time analytics and streamlined order fulfillment for physical products.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                         │
│  • Next.js / Vite + React + TypeScript                      │
│  • Edge Functions (if needed)                               │
│  • Serverless functions (optional)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (Backend + Database)                   │
│  • PostgreSQL (tap schema)                                   │
│  • Realtime subscriptions                                    │
│  • Row-level security (RLS)                                  │
│  • Authentication (email/Google)                             │
│  • File storage (avatars, banners)                           │
│  • Edge Functions (IP geolocation, webhooks)                 │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌───┴───┐
    ▼         ▼          ▼         ▼          ▼       ▼
  Auth    PostgreSQL  Realtime   Storage   Vectors  Analytics
  (JWT)   (10+ tables) (page_*)  (avatars) (future) (in-query)
```

**Key Design Principles:**
- **Multi-schema isolation**: All tap tables in `tap` schema, not `public`
- **Direct Supabase client**: No intermediate API layer (SPA architecture)
- **RLS enforcement**: All data access controlled via row-level security
- **Event-driven updates**: Realtime subscriptions for live features
- **Minimal backend**: No custom API — Supabase handles all CRUD + auth

---

## 3. Data Model

### 3.1 Core Tables

#### `tap.users`
```sql
id UUID PRIMARY KEY (→ auth.users)
username TEXT UNIQUE
email TEXT
user_type JSONB (array of user profession tags)
created_at TIMESTAMP
```
- **Username namespace is global** (must be reserved before launch)
- Stores user metadata and preferences
- One-to-one join with `auth.users` for authentication

#### `tap.pages`
```sql
id UUID PRIMARY KEY
user_id UUID (→ users)
name TEXT
bio TEXT (500 char max)
theme TEXT (editorial|minimal|expressive)
accent_color TEXT (hex or brand palette)
avatar_url TEXT
banner_url TEXT
published BOOLEAN
created_at TIMESTAMP
```
- One page per user (MVP — multi-page is future scope)
- Theme selection is immutable per session (no mixing across themes)
- Published status controls visibility

#### `tap.links`
```sql
id UUID PRIMARY KEY
page_id UUID (→ pages)
title TEXT
url TEXT
icon TEXT (optional custom icon)
position INT (manual sort order)
created_at TIMESTAMP
```
- Links are ordered by `position` field
- Icon field reserved for future rich media
- Soft deletions not used; hard delete on removal

#### `tap.page_views`
```sql
id UUID PRIMARY KEY
page_id UUID (→ pages)
timestamp TIMESTAMP
source TEXT (nfc|instagram|twitter|linkedin|whatsapp|web|direct)
country TEXT (country name, e.g., "India")
created_at TIMESTAMP (indexed for range queries)
```
- **Analytics core table** — one row per page visit
- `country` field populated by ipapi.co on client
- No `session_id` (stateless, each view is independent)
- No user_id (traffic is anonymous)

#### `tap.link_clicks`
```sql
id UUID PRIMARY KEY
link_id UUID (→ links)
page_id UUID (→ pages)
timestamp TIMESTAMP
source TEXT
created_at TIMESTAMP
```
- Tracks which links are clicked and from which source
- Used for CTR (click-through rate) calculation
- `page_id` denormalized for analytics queries

#### `tap.nfc_orders`
```sql
id UUID PRIMARY KEY
user_id UUID (→ users)
page_id UUID (→ pages)
name_on_card TEXT
address JSONB {name, line1, line2, city, state, pincode, phone}
quantity INT
status TEXT (placed|printing|shipped|delivered|cancelled)
razorpay_payment_id TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```
- Manual fulfillment workflow (no auto-printing integration)
- Address stored as JSONB for flexible schema
- `razorpay_payment_id` for payment reconciliation

#### `tap.visiting_card_orders`
```sql
id UUID PRIMARY KEY
user_id UUID (→ users)
page_id UUID (→ pages)
template TEXT (editorial|minimal|expressive|custom_upload)
finish TEXT (matte|glossy)
quantity INT
design_file_url TEXT (if custom upload)
address JSONB
status TEXT (placed|printing|shipped|delivered|cancelled)
razorpay_payment_id TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```
- 85×54mm standard size (ISO/IEC 7810 ID-1)
- Three template designs (one per theme)
- Custom upload for premium tier (future)

#### `tap.contact_messages`
```sql
id UUID PRIMARY KEY
page_id UUID (→ pages)
sender_name TEXT
sender_email TEXT
message TEXT
read BOOLEAN
created_at TIMESTAMP
```
- Visitor contact form submissions
- No authentication required for senders
- Read/unread status for admin inbox

#### `tap.order_messages`
```sql
id UUID PRIMARY KEY
user_id UUID (→ users)
order_id UUID (nullable)
order_type TEXT (nfc|visiting_card|support)
message TEXT
from_admin BOOLEAN
read BOOLEAN
created_at TIMESTAMP
```
- Bidirectional admin-to-user communication
- `order_type=support` for general support conversations
- Realtime notifications via subscription

### 3.2 Schema Structure
```
auth (shared Zakapedia schema)
├── users ← JWT tokens, managed by Supabase Auth

tap (isolated Tap schema)
├── users
├── pages
├── links
├── page_views (analytics core)
├── link_clicks (analytics detail)
├── nfc_orders
├── visiting_card_orders
├── contact_messages
└── order_messages
```

---

## 4. Authentication & Authorization

### 4.1 Auth Flow
1. **Email/Google OAuth** → `auth.users` table
2. **Post-signup**: Create `tap.users` row with username
3. **Session**: JWT in localStorage, refreshed via Supabase SDK
4. **Logout**: Clear JWT + invalidate session

### 4.2 Row-Level Security (RLS)
- **`tap.users`**: Users can only read their own row
- **`tap.pages`**: Published pages are public; private pages only to owner
- **`tap.links`**: Inherit `page_id` permissions
- **`tap.page_views`**: Insert-only for anonymous users; read by page owner
- **`tap.nfc_orders`**: Owners can read/update their orders; admins have unrestricted access
- **Admin access**: Special `zaheer800@gmail.com` bypass for dashboard

### 4.3 API Keys
- **Publishable key** (client-side): Posted to Vercel
- **Service role key**: Admin operations only (local/CI/CD use)
- **Session-based auth**: RLS handles per-user isolation

---

## 5. Analytics System

### 5.1 Architecture
- **No third-party SDKs** (Mixpanel, Amplitude, GA rejected)
- **Client-side event capture** in `trackEvent.ts`:
  - `trackPageView(pageId)` → inserts `page_views` row
  - `trackLinkClick(linkId, pageId)` → inserts `link_clicks` row
- **Source detection**: URL params (`?ref=nfc`) + referrer header
- **Country detection**: ipapi.co API (fire-and-forget, 3s timeout, sessionStorage cache)
- **Queries**: Ad-hoc SQL in dashboard, no event streaming

### 5.2 Dashboard Features
**User dashboard** (`/dashboard` → Analytics tab):
- Total views (all-time) + period views (7d/30d)
- Total clicks (all-time) + period clicks
- Click-through rate (CTR) with % change vs. previous period
- Clickable stat cards to toggle chart (views vs. clicks)
- Views/clicks trend line chart (7d or 30d bucketed by day)
- Top links table (clickable to open URL)
- Top countries donut chart + list (if country data exists)
- Traffic sources breakdown

**Admin dashboard** (`/admin` → Overview tab):
- Global stats: total users, live pages, total views/clicks
- 7-day activity chart (views + clicks, toggleable highlight)
- Traffic sources last 30 days
- Top profiles by views (last 30d)
- Clickable "Total Users" card → expands user list (searchable)
- Clickable "Live Pages" card → expands pages list (searchable)

### 5.3 Data Retention
- **Raw events**: 90-day rolling window (configure in policy)
- **Aggregates**: Queried on-demand (no materialized views MVP)
- **Deletion**: Cron job or manual cleanup

### 5.4 Performance
- **No external calls on page load** (geolocation is background)
- **Realtime dashboards**: Query on mount + 30s polling
- **Indexes**: `page_views(page_id, timestamp)`, `link_clicks(page_id, timestamp)`

---

## 6. Physical Products

### 6.1 NFC Cards
- **Product**: NTAG213 PVC NFC cards (₹199 or ₹299)
- **Programming**: Manual via NFC Tools app
- **URL format**: `https://tap.zakapedia.in/:username?ref=nfc`
- **Tracking**: `?ref=nfc` UTM parameter tags views as NFC source
- **Fulfillment**: Manual print + ship (no API integration)
- **Status workflow**: `placed` → `printing` → `shipped` → `delivered` (or `cancelled`)

### 6.2 Visiting Cards
- **Product**: 85×54mm matte or glossy cards (MOQ 100)
- **Pricing**: TBD after vendor quote
- **Templates**: 3 designs (one per theme)
- **Custom upload**: Future (premium tier)
- **Preview**: Static PDF (not live render MVP)
- **Fulfillment**: Manual print + ship via print vendor
- **Status workflow**: Same as NFC

### 6.3 Order Management
- **Payments**: Razorpay integration (client-side checkout)
- **Webhooks**: Admin notifications on payment success
- **Admin panel**: Order list, status updates, customer communication
- **Customer inbox**: Real-time order updates via `order_messages`

---

## 7. Theme System

### 7.1 Three Complete Design Systems

| Theme | Target User | Typography | Aesthetic | Accent Palette |
|-------|-----------|------------|-----------|-----------------|
| **Editorial** | Creators, bloggers | Bold serif (Fraunces) | Magazine-feel, staggered reveal | Warm (amber, gold) |
| **Minimal** | Freelancers, consultants | Clean sans-serif (DM Sans) | Generous whitespace, subtle fade | Cool (blue, slate) |
| **Expressive** | Artists, local businesses | Rounded quirky font | Bouncy hover, warm palette | Vibrant (pink, purple) |

### 7.2 User Selection
- **Onboarding**: User selects profession type → suggested theme + accent
- **Builder**: Can change theme later (resets to default accent)
- **Accent color**: User picks from theme-specific palette (3–5 options)
- **No mixing**: Elements from different themes cannot coexist

### 7.3 Component Structure
- Separate React component per theme (`Editorial.tsx`, `Minimal.tsx`, `Expressive.tsx`)
- Shared `PublicProfile.tsx` router selects theme based on `pages.theme`
- Tailwind + inline styles for theme-specific colors
- SVG backgrounds for texture/visual effects

---

## 8. Public Profile (/:username)

### 8.1 Rendering
- **Route**: `/:username` (dynamic route with fallback)
- **Data fetch**: Query `tap.users` by username → `tap.pages` by user_id → `tap.links` by page_id
- **Not found**: 404 page if user or page unpublished
- **Performance**: <2s load time target (mobile-first)

### 8.2 Tracking
- **Page view**: Logged on mount via `trackPageView(pageId)`
- **Link click**: Logged via `trackLinkClick(linkId, pageId)`
- **Source detection**: Referrer + URL params (`?ref=nfc`, `?ref=instagram`)
- **Analytics**: Real-time updates in user dashboard

### 8.3 Social Features
- **Avatar + bio**: Displayed prominently
- **Link preview**: Hover/tap shows target URL
- **Share buttons**: WhatsApp, copy link
- **Open Graph**: Meta tags for social card preview (future)

---

## 9. Security & Privacy

### 9.1 Data Protection
- **HTTPS only**: All traffic encrypted
- **RLS enforcement**: Database-level access control (not application-level)
- **No PII in analytics**: Country/source only; no user emails logged
- **Avatar storage**: Supabase bucket (`tap-avatars`) with public read, user write

### 9.2 API Key Management
- **Publishable key**: Safe to expose (RLS enforces permissions)
- **Service role key**: Never exposed; local/CI only
- **JWT refresh**: Automatic via Supabase SDK (30min expiry)

### 9.3 Privacy Policy & Terms
- Pages exist at `/privacy` and `/terms`
- Data retention, analytics, payment terms covered
- GDPR compliance: User can export/delete data (future)

### 9.4 Admin Access
- **Restricted to**: `zaheer800@gmail.com`
- **Access level**: Unrestricted (bypass RLS for order management)
- **Audit logging**: Not yet implemented (future enhancement)

---

## 10. Scalability & Performance

### 10.1 Database Optimization
- **Indexes**: Primary keys + `(page_id, timestamp)` for page_views/link_clicks
- **Partitioning**: Not needed at MVP scale; consider after 1M rows
- **Connection pooling**: Handled by Supabase

### 10.2 Frontend Performance
- **Code splitting**: Lazy load theme components
- **Bundle size**: Current ~176KB gzipped (acceptable)
- **Caching**: Service workers for offline support (future)

### 10.3 Analytics Query Optimization
- **Query patterns**:
  - `SELECT COUNT(*) FROM page_views WHERE page_id=X AND timestamp>Y`
  - `SELECT link_id, COUNT(*) FROM link_clicks WHERE page_id=X GROUP BY link_id`
- **Indexes prevent full table scans**
- **No aggregation tables**: Computed on-demand

### 10.4 Realtime Latency
- **Subscriptions**: `page_views`, `link_clicks`, `order_messages`
- **Broadcast**: Max 100 concurrent subscribers per table (adequate for MVP)
- **Fallback**: Polling if Realtime unavailable

---

## 11. Third-Party Integrations

### 11.1 External Services
- **Authentication**: Google OAuth (optional, email primary)
- **Payments**: Razorpay (checkout, webhooks)
- **Geolocation**: ipapi.co (free tier, 1000 req/day)
- **Deployment**: Vercel (auto-deploy from Git)
- **Hosting**: Supabase Cloud (PostgreSQL + auth + storage + realtime)

### 11.2 Webhooks
- **Razorpay**: Payment success → create order record
- **Supabase**: (future) Automated order status updates

---

## 12. Development Workflow

### 12.1 Local Development
```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite build
npm run preview      # Preview production build
npm run lint         # ESLint checks
```

### 12.2 Database Changes
- **Migrations**: Manual SQL in `supabase/` folder
- **Deploy**: Apply in Supabase Studio or via CLI
- **Rollback**: No auto-rollback; write DOWN migration if needed
- **Example**: `add_country_to_page_views.sql`

### 12.3 Deployment
- **Main branch**: Auto-deploys to production (Vercel)
- **Preview**: Pull requests get temporary preview URLs
- **Database**: Changes are manual (no auto-migrations)

---

## 13. Future Enhancements (Out of Scope MVP)

- [ ] **Multi-page per user**: Each user creates multiple public pages
- [ ] **Custom domains**: User's own domain instead of `tap.zakapedia.in/:username`
- [ ] **Team accounts**: Collaborative page editing
- [ ] **Scheduled links**: Publish links on future dates
- [ ] **Embedded media**: YouTube, Instagram, TikTok embeds in links
- [ ] **Advanced analytics**: Cohort analysis, A/B testing, heat maps
- [ ] **Automated fulfillment**: Print vendor API integration
- [ ] **Subscription model**: Premium themes, advanced analytics
- [ ] **Mobile app**: Native iOS/Android apps
- [ ] **AI portfolio generation**: Auto-generate profiles from LinkedIn

---

## 14. Monitoring & Observability

### 14.1 Logging
- **Application logs**: Supabase logs tab (API, Realtime, Auth)
- **Errors**: Browser console + Sentry (future)
- **Admin dashboard**: User creation, order updates

### 14.2 Alerts
- **Not implemented**: No monitoring/alerting (post-MVP)
- **Future**: Uptime monitoring, error rate alerts, quota alerts

### 14.3 Metrics to Track
- **User signups per day**
- **Active pages (published)**
- **Page views trending**
- **Order conversion rate** (views → NFC/card order)
- **Support message response time**

---

## 15. Disaster Recovery

### 15.1 Backup Strategy
- **Database**: Supabase automated daily backups (7-day retention)
- **Manual backup**: Export via `pg_dump` weekly (future automation)
- **File storage**: Supabase bucket has redundancy

### 15.2 Incident Response
- **Database down**: Users cannot log in or create pages
- **Vercel down**: Site is inaccessible
- **Payment down**: Orders cannot be placed
- **Recovery**: Both handled by respective providers; no SLA agreed yet

---

## 16. Cost Model

### 16.1 Infrastructure
- **Vercel**: Pro plan (~$20/month) or usage-based
- **Supabase**: Startup plan (~$25/month) or Pro (~$50/month)
- **Razorpay**: 2% + ₹10 per successful transaction
- **ipapi.co**: Free tier (1000 req/day) or paid ($5+/month)

### 16.2 Revenue
- **NFC cards**: ₹199–299 per order (min. 1–10 cards)
- **Visiting cards**: MOQ 100, pricing TBD (estimate ₹100+ per order)
- **Target**: 5–10 orders/month at MVP to break even

---

## 17. Glossary

| Term | Definition |
|------|-----------|
| **RLS** | Row-level security policies in PostgreSQL |
| **CTR** | Click-through rate (clicks ÷ views × 100) |
| **NFC** | Near-field communication (wireless card tap) |
| **MOQ** | Minimum order quantity (100 for visiting cards) |
| **NTAG213** | ISO14443A compliant NFC chip (common, cheap) |
| **Realtime** | WebSocket-based live data updates (Supabase) |
| **JWT** | JSON Web Token (session authentication) |
| **PII** | Personally identifiable information (avoid logging) |
| **SPA** | Single Page Application (no server-side rendering) |

---

## 18. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-02 | System | Initial system design (MVP) |

