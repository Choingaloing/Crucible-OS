import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { serviceDb } from '@/lib/crucible-pro/db'
import { syncHubspotLeads } from '@/lib/leads/hubspot'

export const dynamic = 'force-dynamic'

const SYNC_EVERY_MS = 5 * 60 * 1000

// GET /api/crucible-pro/leads?user_id=  → the client's leads, newest first.
// Pulls new HubSpot submissions first when the last pull is over 5 minutes old.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const res = await resolveContext(url.searchParams.get('user_id'))
  if (!res.ok) return res.response
  const { targetUserId, isAdmin } = res.ctx

  const db = await serviceDb()
  const { data: source } = await db
    .from('client_data_sources')
    .select('hubspot_form_ids, leads_synced_at')
    .eq('user_id', targetUserId)
    .maybeSingle()

  let syncError: string | null = null
  const formIds: string[] = source?.hubspot_form_ids ?? []
  const stale = !source?.leads_synced_at || Date.now() - new Date(source.leads_synced_at).getTime() > SYNC_EVERY_MS
  if (formIds.length && (stale || url.searchParams.get('refresh') === '1')) {
    const result = await syncHubspotLeads(db, targetUserId, formIds)
    syncError = result.error
    if (!result.error) {
      await db.from('client_data_sources').update({ leads_synced_at: new Date().toISOString() }).eq('user_id', targetUserId)
    } else {
      console.error('[leads] HubSpot sync failed', result.error)
    }
  }

  const { data, error } = await db
    .from('client_leads')
    .select('*')
    .eq('user_id', targetUserId)
    .order('submitted_at', { ascending: false })
    .limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data ?? [], syncError: isAdmin ? syncError : null })
}
