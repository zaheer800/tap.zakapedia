# AI Profile Builder — Implementation Plan

> Ready to implement when approved. Cross-reference with PRD.md Section 10.

## Context

Users currently build their profile manually — writing a bio, picking a theme, adding links one by one. The ask is to let AI do that work: the user describes themselves in a sentence or two, and AI generates their entire profile (bio, theme, accent color, suggested links). This becomes a **paid feature** using an AI credits system — new users get 3 free credits, then purchase more via UPI.

OpenRouter is used as the AI gateway (model: `google/gemini-flash-1.5` — fast, cheap, good JSON output). The API key must never be in the browser, so all AI calls go through a Supabase Edge Function that also handles auth verification and atomic credit deduction.

---

## Architecture

```
Browser → supabase.functions.invoke('generate-profile') 
        → [Edge Function] verify JWT → deduct credit → OpenRouter
        → returns { bio, theme, accent_color, suggested_links[], credits_remaining }
```

The existing `supabase` client in `src/lib/supabase.ts` can call Edge Functions directly via `.functions.invoke()` — the `db.schema: 'tap'` option only affects PostgREST, not functions.

---

## Phase 1: Database Migrations (4 SQL files)

### `supabase/add_ai_credits.sql`
```sql
CREATE TABLE IF NOT EXISTS tap.ai_credits (
  user_id    UUID PRIMARY KEY REFERENCES tap.users(id) ON DELETE CASCADE,
  balance    INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tap.ai_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_read_ai_credits" ON tap.ai_credits FOR SELECT USING (auth.uid() = user_id);
-- No INSERT/UPDATE policies — Edge Function uses service_role to write
```

### `supabase/add_signup_credits_trigger.sql`
Postgres trigger on `tap.users` INSERT — gives every new user 3 free credits atomically, zero frontend change needed:
```sql
CREATE OR REPLACE FUNCTION tap.grant_signup_credits() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO tap.ai_credits (user_id, balance) VALUES (NEW.id, 3) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_grant_signup_credits AFTER INSERT ON tap.users FOR EACH ROW EXECUTE FUNCTION tap.grant_signup_credits();
```

Also run a one-time backfill for existing users:
```sql
INSERT INTO tap.ai_credits (user_id, balance) SELECT id, 3 FROM tap.users ON CONFLICT (user_id) DO NOTHING;
```

### `supabase/add_ai_credit_rpcs.sql`
Two `SECURITY DEFINER` RPCs for atomic credit operations (avoids SELECT-then-UPDATE race):
```sql
-- Returns new balance, or -1 if balance was already 0
CREATE OR REPLACE FUNCTION tap.spend_ai_credit(p_user_id UUID) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_new_balance INTEGER; BEGIN
  UPDATE tap.ai_credits SET balance = balance - 1, updated_at = now()
   WHERE user_id = p_user_id AND balance >= 1 RETURNING balance INTO v_new_balance;
  IF NOT FOUND THEN RETURN -1; END IF;
  RETURN v_new_balance;
END; $$;

-- Compensating refund on AI failure
CREATE OR REPLACE FUNCTION tap.refund_ai_credit(p_user_id UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN UPDATE tap.ai_credits SET balance = balance + 1, updated_at = now() WHERE user_id = p_user_id; END; $$;

GRANT EXECUTE ON FUNCTION tap.spend_ai_credit(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION tap.refund_ai_credit(UUID) TO service_role;
```

### `supabase/add_credit_purchase_requests.sql`
Manual-fulfillment UPI payment log (same pattern as NFC orders):
```sql
CREATE TABLE tap.credit_purchase_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES tap.users(id),
  package_credits INTEGER NOT NULL,
  amount_inr      INTEGER NOT NULL,
  utr_number      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tap.credit_purchase_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_insert_credit_requests" ON tap.credit_purchase_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_read_credit_requests"   ON tap.credit_purchase_requests FOR SELECT USING (auth.uid() = user_id);
```

---

## Phase 2: Edge Function

**Location**: `supabase/functions/generate-profile/index.ts`  
**Shared CORS**: `supabase/functions/_shared/cors.ts`

**Edge Function steps:**
1. Verify `Authorization` header → `auth.getUser()` with user JWT
2. Parse + validate payload: `description` (10–1000 chars), `tone`, `userTypes[]`, optional `currentName`
3. Call `tap.spend_ai_credit(user_id)` via service-role client → returns -1 if no credits
4. POST to `https://openrouter.ai/api/v1/chat/completions` with model `google/gemini-flash-1.5`, `response_format: { type: 'json_object' }`
5. On OpenRouter failure or JSON parse error → call `tap.refund_ai_credit(user_id)` and return 502
6. Sanitize output: validate theme is one of 3 values, accent is in allowed list, bio ≤ 250 chars, max 5 links
7. Return `{ data: GeneratedProfile, credits_remaining: number }`

**Secret**: `OPENROUTER_API_KEY` — stored only in Supabase Dashboard > Edge Functions > Secrets (no `VITE_` prefix, never in frontend).

**System prompt template**: Instructs the model to output strict JSON with `bio`, `theme`, `accent_color`, `suggested_links[]`. Includes theme guide (editorial=dark/bold for creators, minimal=clean for professionals, expressive=vivid for artists) and accent color allowlist.

---

## Phase 3: TypeScript Types (`src/types.ts`)

Add:
```typescript
export type AiTone = 'professional' | 'creative' | 'casual'
export interface AiSuggestedLink { title: string; url: string; icon: string }
export interface AiGeneratedProfile { bio: string; theme: Theme; accent_color: string; suggested_links: AiSuggestedLink[] }
export interface AiGenerateResponse { data: AiGeneratedProfile; credits_remaining: number }
```

---

## Phase 4: Frontend

### `src/hooks/useAiCredits.ts` (new)
Fetches `tap.ai_credits` balance for the logged-in user. Exposes `balance`, `loading`, `syncBalance(n)`. The `owner_read_ai_credits` RLS policy allows this SELECT from the browser.

### `src/components/builder/AiBuilderModal.tsx` (new)
Two-step modal:
- **Step 1 (Input)**: Textarea "Describe yourself", tone pill selector (Professional / Creative / Casual), credit cost notice, Generate button (disabled when < 10 chars or balance = 0)
- **Step 2 (Result)**: Shows generated bio, theme+accent mini-preview, and suggested links. Buttons: **Apply Everything** | **Apply Bio Only** | **Apply Design Only** | **Add Links** | **Regenerate** (costs 1 more credit) | **Buy Credits** (opens buy modal)

Props: `onApplyBio(bio)`, `onApplyDesign(theme, accent)`, `onApplyLinks(links[])`, `creditsBalance`, `onCreditSync(n)`, `onBuyCredits()`

### `src/components/builder/BuyCreditsModal.tsx` (new)
MVP — display only, no Razorpay SDK yet:
- Two package cards: ₹49 / 5 credits, ₹149 / 20 credits
- UPI ID display (from `VITE_UPI_ID`) + copy button
- UTR number input + Submit (inserts to `tap.credit_purchase_requests`)
- "Credits added within 2 hours" footer

### `src/pages/Dashboard.tsx` (modify)

**Add imports**: `Sparkles`, `Coins` from lucide-react; both new modal components; `useAiCredits` hook; `AiSuggestedLink` type

**Add state**:
```typescript
const { balance: creditsBalance, syncBalance } = useAiCredits()
const [aiModalOpen, setAiModalOpen] = useState(false)
const [buyModalOpen, setBuyModalOpen] = useState(false)
```

**Header**: Add AI credit badge between saving indicator and avatar menu:
```tsx
<button onClick={() => setAiModalOpen(true)} className="... text-brand-gold">
  <Sparkles className="w-3.5 h-3.5" />
  <span className="hidden sm:inline">AI</span>
  {creditsBalance === null ? <skeleton /> : <span>{creditsBalance}</span>}
</button>
```

**Build tab**: Add "Build with AI" CTA banner just above the profile section (full-width, gold tinted, with sparkle icon + credits remaining). Clicking opens the modal.

**New handler** `applyAiLinks(suggested: AiSuggestedLink[])`: inserts each suggested link into `tap.links` using the existing `supabase.from('links').insert(...)` pattern, then appends to `links` state.

**Modal JSX**: Render `<AiBuilderModal>` and `<BuyCreditsModal>` before closing `</div>`.

---

## Phase 5: Deployment Order

1. Run 4 SQL migrations via Supabase MCP `execute_sql`
2. Add `OPENROUTER_API_KEY` secret in Supabase Dashboard > Settings > Edge Functions > Secrets
3. Deploy edge function: `supabase functions deploy generate-profile`
4. Build and deploy frontend to Vercel

---

## Verification Checklist

- [ ] Sign up a new test user → `tap.ai_credits` row created with `balance = 3`
- [ ] Open dashboard → AI badge shows "3"
- [ ] Click "Build with AI" → modal opens
- [ ] Enter description → click Generate → check Edge Function logs in Supabase dashboard
- [ ] Verify response: bio populated, theme+accent shown, links listed
- [ ] Click "Apply Everything" → profile fields update in the builder
- [ ] Badge updates to "2" (credit deducted)
- [ ] Deplete to 0 → Generate button disabled, "Buy Credits" shown
- [ ] Submit a credit purchase request → verify row in `tap.credit_purchase_requests`

---

## Critical Files

| File | Action |
|---|---|
| `supabase/add_ai_credits.sql` | Create |
| `supabase/add_signup_credits_trigger.sql` | Create |
| `supabase/add_ai_credit_rpcs.sql` | Create |
| `supabase/add_credit_purchase_requests.sql` | Create |
| `supabase/functions/generate-profile/index.ts` | Create |
| `supabase/functions/_shared/cors.ts` | Create |
| `src/types.ts` | Modify — add AI types |
| `src/hooks/useAiCredits.ts` | Create |
| `src/components/builder/AiBuilderModal.tsx` | Create |
| `src/components/builder/BuyCreditsModal.tsx` | Create |
| `src/pages/Dashboard.tsx` | Modify — imports, state, header badge, CTA, handler, modals |

## Existing Code to Reuse

- `src/lib/supabase.ts` — existing client, `.functions.invoke()` works without changes
- `src/contexts/AuthContext.tsx` — `useAuth()` for `user.id` and session
- `src/components/builder/ThemeSelector.tsx` — `ThemePreview` sub-component for design preview in result step
- `src/data/userTypes.ts` — `USER_TYPE_LABELS` for building the AI prompt's context
- `src/components/orders/NFCOrderForm.tsx` — UPI/UTR payment pattern to replicate in `BuyCreditsModal`

## Error Handling

| Scenario | Edge Function response | Frontend behavior |
|---|---|---|
| Not authenticated | 401 | "Please sign in again" |
| Balance is 0 | 402 | "No credits — Buy more" with link |
| OpenRouter down | 502 + credit refunded | "AI failed, credit refunded" |
| JSON parse failure | 502 + credit refunded | Same as above |
| Description too short | 400 | Generate button disabled client-side |
