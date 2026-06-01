-- Run this in the Supabase SQL editor to set up the tap schema.
-- Tap shares a single Supabase project with other Zakapedia products.
-- All tables live under the `tap` schema; auth.users is shared.

CREATE SCHEMA IF NOT EXISTS tap;

-- ─── Users ─────────────────────────────────────────────────────────────────

CREATE TABLE tap.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL
              CHECK (username ~ '^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$'),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tap.users ENABLE ROW LEVEL SECURITY;

-- Username lookups and availability checks must be publicly readable
CREATE POLICY "public_read_users" ON tap.users FOR SELECT USING (true);
CREATE POLICY "insert_own_user"   ON tap.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_user"   ON tap.users FOR UPDATE USING (auth.uid() = id);

-- ─── Pages ─────────────────────────────────────────────────────────────────

CREATE TABLE tap.pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES tap.users(id) ON DELETE CASCADE,
  theme        TEXT NOT NULL DEFAULT 'minimal'
               CHECK (theme IN ('editorial', 'minimal', 'expressive')),
  accent_color TEXT NOT NULL DEFAULT '#3B82F6',
  name         TEXT NOT NULL DEFAULT '',
  bio          TEXT NOT NULL DEFAULT '',
  avatar_url   TEXT,
  published    BOOLEAN NOT NULL DEFAULT false,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tap.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_pages"       ON tap.pages FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "public_published_pages" ON tap.pages FOR SELECT USING (published = true);

-- ─── Links ─────────────────────────────────────────────────────────────────

CREATE TABLE tap.links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id    UUID NOT NULL REFERENCES tap.pages(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tap.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_links" ON tap.links FOR ALL USING (
  EXISTS (SELECT 1 FROM tap.pages WHERE id = page_id AND user_id = auth.uid())
);
CREATE POLICY "public_published_links" ON tap.links FOR SELECT USING (
  EXISTS (SELECT 1 FROM tap.pages WHERE id = page_id AND published = true)
);

-- ─── Analytics ─────────────────────────────────────────────────────────────

CREATE TABLE tap.page_views (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id   UUID NOT NULL REFERENCES tap.pages(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  source    TEXT NOT NULL DEFAULT 'direct'
);

ALTER TABLE tap.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_insert_page_views" ON tap.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "owner_read_page_views"    ON tap.page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM tap.pages WHERE id = page_id AND user_id = auth.uid())
);

CREATE TABLE tap.link_clicks (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id   UUID NOT NULL REFERENCES tap.links(id) ON DELETE CASCADE,
  page_id   UUID NOT NULL REFERENCES tap.pages(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  source    TEXT NOT NULL DEFAULT 'direct'
);

ALTER TABLE tap.link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_insert_link_clicks" ON tap.link_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "owner_read_link_clicks"    ON tap.link_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM tap.pages WHERE id = page_id AND user_id = auth.uid())
);

-- ─── NFC Orders ────────────────────────────────────────────────────────────

CREATE TABLE tap.nfc_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES tap.users(id) ON DELETE CASCADE,
  page_id              UUID NOT NULL REFERENCES tap.pages(id),
  name_on_card         TEXT NOT NULL,
  address              JSONB NOT NULL,
  quantity             INTEGER NOT NULL DEFAULT 1,
  status               TEXT NOT NULL DEFAULT 'placed'
                       CHECK (status IN ('placed', 'shipped', 'delivered')),
  payment_reference  TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tap.nfc_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_nfc_orders" ON tap.nfc_orders FOR ALL USING (auth.uid() = user_id);

-- ─── Visiting Card Orders ──────────────────────────────────────────────────

CREATE TABLE tap.visiting_card_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES tap.users(id) ON DELETE CASCADE,
  page_id              UUID NOT NULL REFERENCES tap.pages(id),
  template             TEXT NOT NULL
                       CHECK (template IN ('editorial', 'minimal', 'expressive', 'upload')),
  finish               TEXT NOT NULL DEFAULT 'matte'
                       CHECK (finish IN ('matte', 'glossy')),
  quantity             INTEGER NOT NULL DEFAULT 100,
  design_file_url      TEXT,
  address              JSONB NOT NULL,
  status               TEXT NOT NULL DEFAULT 'placed'
                       CHECK (status IN ('placed', 'printing', 'shipped', 'delivered')),
  payment_reference  TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tap.visiting_card_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_card_orders" ON tap.visiting_card_orders FOR ALL USING (auth.uid() = user_id);

-- ─── Storage ───────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('tap-avatars', 'tap-avatars', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "public_avatar_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tap-avatars');

CREATE POLICY "auth_avatar_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tap-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "auth_avatar_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'tap-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "auth_avatar_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tap-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
