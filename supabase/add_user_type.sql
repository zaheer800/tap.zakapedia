-- Add user_type to tap.users so profession is stored per user
ALTER TABLE tap.users
  ADD COLUMN IF NOT EXISTS user_type text;
