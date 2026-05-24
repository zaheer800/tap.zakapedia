-- Add configurable portfolio slug to tap.pages
-- The portfolio is served at tap.zakapedia.in/:username/:portfolio_slug
ALTER TABLE tap.pages ADD COLUMN IF NOT EXISTS portfolio_slug text DEFAULT 'portfolio';
