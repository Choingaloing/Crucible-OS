import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Standalone admin client that does NOT depend on cookies().
// Safe to use in fire-and-forget contexts after the HTTP response is sent.
// Every request is sent with cache: 'no-store' so Next.js's persistent Data
// Cache never serves a stale row (e.g. an agreement fee edited after deploy).
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  }
)
