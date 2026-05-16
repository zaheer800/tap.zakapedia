-- Expose the tap schema via PostgREST and grant the necessary permissions.
-- Run this once in the SQL editor, then the PGRST106 error will be gone.

-- 1. Expose tap schema to PostgREST
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, graphql_public, tap';
NOTIFY pgrst, 'reload config';

-- 2. Grant access to Supabase roles
GRANT USAGE ON SCHEMA tap TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES    IN SCHEMA tap TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA tap TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES  IN SCHEMA tap TO anon, authenticated, service_role;

-- 3. Apply same grants to future tables automatically
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA tap
  GRANT ALL ON TABLES    TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA tap
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA tap
  GRANT ALL ON ROUTINES  TO anon, authenticated, service_role;
