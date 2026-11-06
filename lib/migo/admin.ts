import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Migo tables are not in the generated Database types yet; use an untyped
// service-role client for them. Callers must run requireMigoAdmin() first.
export async function migoDb(): Promise<SupabaseClient> {
  const admin = await createAdminClient()
  return admin as unknown as SupabaseClient
}

export async function requireMigoAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true as const, adminId: user.id }
}
