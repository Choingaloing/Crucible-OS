import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'

// Leads, assets and work log tables aren't in the generated Database types yet,
// and client writes to them go through API routes. Callers MUST authorize with
// resolveContext() first and scope every query to ctx.targetUserId.
export async function serviceDb(): Promise<SupabaseClient> {
  return (await createAdminClient()) as unknown as SupabaseClient
}

export const ASSETS_BUCKET = 'client-assets'

export const clean = (v: unknown, max = 2000) =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null
