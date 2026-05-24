-- Add country tracking to page views
ALTER TABLE tap.page_views
  ADD COLUMN IF NOT EXISTS country TEXT;
