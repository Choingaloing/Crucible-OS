import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'

// PUT /api/crucible-pro/data-sources  { user_id, google_ads_accounts, gbp_locations, hubspot_form_ids, gsc_property }
// Admin maps a client to their Windsor-connected Google accounts.
export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  const { supabase, targetUserId, isAdmin } = res.ctx
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const list = (v: unknown) =>
    Array.isArray(v) ? v.map((a) => String(a).trim()).filter(Boolean).slice(0, 10) : []

  const { data, error } = await supabase
    .from('client_data_sources')
    .upsert(
      {
        user_id: targetUserId,
        google_ads_accounts: list(body.google_ads_accounts),
        gbp_locations: list(body.gbp_locations),
        hubspot_form_ids: list(body.hubspot_form_ids),
        gsc_property: clean(body.gsc_property),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sources: data })
}
