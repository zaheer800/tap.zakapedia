-- Remove email column from tap.users
-- Email is stored in auth.users (shared Supabase auth) and referenced via user.email.
-- Storing it redundantly in tap.users was a security liability flagged in audit.
-- Run this in the Supabase SQL editor once.

ALTER TABLE tap.users DROP COLUMN IF EXISTS email;
