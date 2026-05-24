-- Add AI-generated portfolio HTML and profile type to pages
-- Run after schema.sql

alter table tap.pages
  add column if not exists profile_type text,     -- creator|professional|business|service_pro|speaker
  add column if not exists portfolio_html text,   -- cached HTML from AI generation
  add column if not exists role text;             -- role/title shown in profile (e.g. "UI/UX Designer")

-- Constrain profile_type to known values
alter table tap.pages
  add constraint pages_profile_type_check
  check (profile_type in ('creator', 'professional', 'business', 'service_pro', 'speaker') or profile_type is null);
