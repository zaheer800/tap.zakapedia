-- Add banner_url column to tap.pages
ALTER TABLE tap.pages
  ADD COLUMN IF NOT EXISTS banner_url text;
