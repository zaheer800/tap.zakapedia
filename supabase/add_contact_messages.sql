-- Contact messages sent by profile visitors
-- Anyone can message a published page; only the page owner can read

CREATE TABLE IF NOT EXISTS tap.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID NOT NULL REFERENCES tap.pages(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL CHECK (char_length(sender_name) <= 100),
  message     TEXT NOT NULL CHECK (char_length(message) <= 1000),
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tap.contact_messages ENABLE ROW LEVEL SECURITY;

-- Visitors (including anonymous) can submit to any published page
CREATE POLICY "anyone_insert_contact_messages"
  ON tap.contact_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tap.pages
      WHERE id = page_id AND published = true
    )
  );

-- Only the page owner can read and mark messages as read
CREATE POLICY "owner_read_contact_messages"
  ON tap.contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tap.pages
      WHERE id = page_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "owner_update_contact_messages"
  ON tap.contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tap.pages
      WHERE id = page_id AND user_id = auth.uid()
    )
  );
