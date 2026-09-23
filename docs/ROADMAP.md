# tap.zakapedia roadmap

Written 2026-09-23 for autonomous runs (`run tap.zakapedia: Do roadmap item N in docs/ROADMAP.md ...`).

## Context every run must know

- Tap by Zakapedia is a free bio-link-page builder (`tap.zakapedia.in`); revenue is optional NFC
  cards and printed visiting cards, paid manually by UPI. Not venture-scale -- keep changes simple
  and avoid speculative infrastructure.
- Read first: `CLAUDE.md` (repo root), `docs/PRD_V1.1.md`, `docs/SYSTEM_DESIGN.md`, `docs/TSD.md`,
  and the VM's `~/projects/CLAUDE.md` (the autonomous build loop you must follow).
- The whole codebase was built in a single day (2026-09-23, one large MVP commit) then hardened
  with docs, CI, and a Semgrep/Gitleaks/Trivy scan pipeline. It has never had a test added.
- Supabase project `khjfvrkkblfcsyiwnoow` is **shared** with the `crm` schema -- this app must only
  touch the `tap` schema (the client is initialized with `db.schema: 'tap'`; the one exception is
  an admin RPC read against `public.admin_get_users_with_email`). Never touch `crm.*`.
- Schema reality has drifted from `CLAUDE.md`: the payments column is `payment_reference`, not
  `razorpay_payment_id`; a `tap-avatars` Supabase Storage bucket already exists (avatar storage is
  decided, not pending); extra tables exist beyond what's documented
  (`tap.sections`, `tap.credits`, `tap.credit_transactions`, `tap.ai_usage`,
  `tap.contact_messages`, `tap.order_messages`). Item 3 below fixes this; until then, trust the
  live schema over the doc.
- ContextForge (MCP `contextforge`) may hold project history from other sessions; `recall` a
  specific term before rediscovering things.

## Rules for every item

1. Do exactly one item per run. Keep it small enough to finish in about 15 minutes; if it will not
   fit, finish a coherent first slice, commit it, and say what is left.
2. **Lint and build must pass** (`npm run lint`, `npm run build`) -- this mirrors `ci.yml` exactly
   and is the current CI backstop.
3. **There is no test suite yet.** Item 1 (wave 1) sets one up. Once it exists, every subsequent
   item must add or update tests for the code it touches and run them locally before finishing --
   do not let the suite regress to zero coverage again.
4. **Database changes:** this repo currently has no `supabase/migrations/` directory (schema is 12
   loose hand-applied `.sql` files) -- item 2 fixes that. Until/after it exists, any schema change
   must be a new numbered file in `supabase/migrations/`, applied via `mcp__supabase-write` tools,
   and verified afterwards with a read-only `SELECT` (never rewrite or delete existing rows). Prefer
   the read-only `supabase` MCP server for inspection; only use `supabase-write` when the item
   requires an actual change.
5. **Security-sensitive changes** (auth, admin gating, payments/order data, PII, the `ai-generate`
   edge function) must also pass the `/security-review` skill before being considered done, per the
   root `~/projects/CLAUDE.md` autonomous workflow.
6. Out of scope for every item: Razorpay/payment-gateway integration, finalizing NFC or
   visiting-card pricing (both explicitly TBD business decisions in the PRD), new paid services or
   API keys, new Supabase projects, custom domains, multi-page accounts, team/agency accounts,
   anything on the Proxmox host or docker-lxc, secrets in the repo.
7. When finished, tick the item below (`[x]`, date, one-line result) and commit that with the work.

## Items

### Wave 1: make the foundation trustworthy

- [ ] **1. Add a real test setup.** There are zero tests despite `playwright` sitting unused as a
  devDependency. Add Vitest + React Testing Library for unit/component tests, wire an `npm test`
  script, and add it as a required step in `ci.yml`. Either remove the unused `playwright`
  devDependency or give it a minimal config plus one real smoke test (e.g. the public profile page
  at `/:username` renders). Write the first real unit test against existing logic with edge cases,
  e.g. `src/utils/trackEvent.ts`'s source-detection (referrer vs. `?ref=nfc`) or
  `src/utils/compressImage.ts`.
- [ ] **2. Turn the loose `.sql` files into tracked migrations.** Consolidate the base `schema.sql`
  plus the 12 incremental files under `supabase/` into numbered files in `supabase/migrations/`
  that reflect the current live schema (verify column-for-column against `list_tables` on the
  `supabase` MCP server first). Document the new workflow (how to add a migration, how to verify
  against the live project) in `CLAUDE.md`. Do not change any live data -- this is a bookkeeping
  migration of the schema definition, not a schema change.
- [ ] **3. Fix the CLAUDE.md schema/doc drift the audit found.** Update the data-model section:
  `payment_reference` (not `razorpay_payment_id`), avatar storage already decided (Supabase
  Storage, bucket `tap-avatars`, not "pending"), and add the undocumented tables
  (`tap.sections`, `tap.credits`, `tap.credit_transactions`, `tap.ai_usage`,
  `tap.contact_messages`, `tap.order_messages`) with a one-line purpose each.
- [ ] **4. Replace the hardcoded admin gate.** `AdminOrders.tsx` currently checks a hardcoded
  `ADMIN_EMAIL = 'zaheer800@gmail.com'` string in client code. Use the existing
  `tap.users.user_type` column to drive an `is_admin`-style check instead (client check plus RLS
  policy on any admin-only queries/RPCs), so admin access isn't a single string shipped to the
  browser. Add a test once item 1 lands.
- [ ] **5. Add a root README.md.** There is none today. Cover what the product is, the stack, how
  to run it locally (`npm run dev`), the script list, and links into `docs/` (PRD, system design,
  TSD) and `CLAUDE.md`.

### Wave 2: close gaps the product's own docs already flagged

- [ ] **6. Open Graph / social share tags.** `SYSTEM_DESIGN.md` lists this as future work, but for
  a link-in-bio product, how the page previews when shared (WhatsApp, Instagram bio, iMessage) is
  core to the product. Add per-user OG tags (name, bio, avatar) to `PublicProfile.tsx` and
  `PortfolioPage.tsx`, server-rendered or via a prerender/meta-injection approach compatible with
  the Vite/Vercel setup (no SSR framework migration).
- [ ] **7. Enforce the analytics retention window.** CLAUDE.md recommends a 90-day rolling window
  for `page_views`/`link_clicks` but nothing prunes old rows today. Add a scheduled cleanup
  (Supabase `pg_cron` or a small edge function on a cron trigger) that deletes rows past 90 days.
  Migration + test.
- [ ] **8. Reserved-username enforcement.** CLAUDE.md says to "reserve Zakapedia brand names before
  launch" but no reserved-word check was found in the signup/onboarding flow. Add a check (list of
  reserved usernames, e.g. `admin`, `zakapedia`, `support`, `api`) at signup and username-change
  time, server-side (RLS or a check constraint/trigger), not just client-side.
- [ ] **9. Basic error visibility.** `SYSTEM_DESIGN.md` flags Sentry as future; that is out of scope
  (new paid service), but there is currently zero visibility into client-side JS errors in
  production. Add a lightweight React error boundary around the app shell that logs to a new
  `tap.client_errors` table (message, stack, route, user id if signed in), and a simple admin view
  to read recent ones. Migration + RLS + test.
- [ ] **10. Notify on order status change.** Admins update `nfc_orders`/`visiting_card_orders`
  status in `AdminOrders.tsx` today with no notification to the customer. Add an email (Supabase
  auth email or a simple transactional send) when status moves to `printing`/`shipped`/`delivered`.
  No new paid email service -- reuse whatever is already available to the Supabase project, or park
  this item if nothing is.

### Wave 3: polish and resilience

- [ ] **11. GDPR-style self-serve export/delete.** `SYSTEM_DESIGN.md` future item. Let a signed-in
  user download their own page + analytics data (JSON) and delete their account and associated
  data from a dashboard settings screen. Migration for any needed RPC + RLS + tests.
- [ ] **12. Offline/fast-load hardening for the public profile page.** CLAUDE.md commits to <2s
  loads for `/:username`; `SYSTEM_DESIGN.md` lists service-worker caching as future. Start smaller:
  audit and reduce the public page's JS bundle/critical path (check whether theme components are
  code-split), add basic caching headers, and only reach for a service worker if that is not enough.
- [ ] **13. Contact/order message UX pass.** `AdminOrders.tsx` has an inbox tab backed by
  `tap.contact_messages`/`tap.order_messages`; audit whether read/unread state and a reply path
  actually exist end-to-end, and close any gap found.
- [ ] **14. Credits UI coherence check.** `tap.credits` is checked client-side only (not a security
  boundary, per CLAUDE.md) and gates AI feature usage. Audit the dashboard UI for a clear,
  consistent display of remaining credits/AI usage (the `ai-generate` function already enforces a
  server-side 30/24h cap) so the client-side number never contradicts what the server allows.

## Parked (needs the owner)

- Razorpay/payment gateway integration, and final NFC (Rs 199 vs Rs 299) and visiting-card pricing --
  explicit TBD business decisions in `docs/PRD_V1.1.md`, not something to resolve autonomously.
- Custom domains, multi-page accounts, scheduled links, team/agency accounts -- explicitly out of
  scope for MVP per the PRD.
- WhatsApp intake, marketplace, business directory, social feed, chat, delivery/logistics --
  explicit non-goals in `docs/PRD_V1.1.md`.
</content>
