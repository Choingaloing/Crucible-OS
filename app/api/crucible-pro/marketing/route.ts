import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { buildMarketingSummary } from '@/lib/marketing/summary'
import { MARKETING_RANGES, type ClientDataSources, type MarketingRange } from '@/types/marketing'

export const dynamic = 'force-dynamic'

// GET /api/crucible-pro/marketing?user_id=&range=30
// Clients get their own numbers; admins can pass any client's user_id.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const res = await resolveContext(url.searchParams.get('user_id'))
  if (!res.ok) return res.response
  const { supabase, targetUserId, isAdmin } = res.ctx

  const rangeParam = url.searchParams.get('range') ?? '30'
  const range: MarketingRange = (MARKETING_RANGES as readonly string[]).includes(rangeParam)
    ? (rangeParam as MarketingRange)
    : '30'

  const { data: sources, error } = await supabase
    .from('client_data_sources')
    .select('*')
    .eq('user_id', targetUserId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const summary = await buildMarketingSummary((sources as ClientDataSources | null) ?? null, range)

  // Raw Windsor errors (billing, plan limits) are for Chandler, not clients.
  if (!isAdmin) {
    const friendly = 'This data is temporarily unavailable. Crucible has been notified.'
    if (summary.ads.error) summary.ads.error = friendly
    if (summary.gbp.error) summary.gbp.error = friendly
  } else if (summary.ads.error || summary.gbp.error) {
    console.error('[marketing] Windsor error', { ads: summary.ads.error, gbp: summary.gbp.error })
  }

  return NextResponse.json(summary)
}
