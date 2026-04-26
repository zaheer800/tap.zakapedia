import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Default schema is `tap`; all from() calls query tap.* tables.
// supabase.auth always uses the auth schema regardless of this setting.
export const supabase = createClient(url, key, {
  db: { schema: 'tap' },
})
