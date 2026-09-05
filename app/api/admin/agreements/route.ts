import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AGREEMENT_COLUMNS, agreementPublicUrl, slugify } from '@/lib/agreements/queries'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true as const, userId: user.id }
}

/** GET /api/admin/agreements?user_id=… — list agreements for a client */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const userId = new URL(req.url).searchParams.get('user_id')
  let query = supabaseAdmin.from('client_agreements').select(AGREEMENT_COLUMNS).order('created_at', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    agreements: (data ?? []).map((a) => ({ ...a, monthly_fee: Number(a.monthly_fee), url: agreementPublicUrl(a.slug) })),
  })
}

/** POST /api/admin/agreements — create a signing link for a client */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const userId = typeof body.user_id === 'string' ? body.user_id : ''
  const companyName = typeof body.company_name === 'string' ? body.company_name.trim() : ''
  const monthlyFee = Number(body.monthly_fee)
  if (!userId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  if (!companyName) return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
  if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) {
    return NextResponse.json({ error: 'Monthly fee must be a positive number' }, { status: 400 })
  }

  const { data: client } = await supabaseAdmin.from('profiles').select('id, email').eq('id', userId).maybeSingle()
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  // Custom slug if provided, else derived from the company name. Ensure uniqueness.
  const requested = typeof body.slug === 'string' && body.slug.trim() ? slugify(body.slug) : slugify(companyName)
  if (!requested) return NextResponse.json({ error: 'Could not derive a URL slug' }, { status: 400 })
  let slug = requested
  for (let i = 2; i < 50; i++) {
    const { data: existing } = await supabaseAdmin.from('client_agreements').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${requested}-${i}`
  }

  const effectiveDate =
    typeof body.effective_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.effective_date)
      ? body.effective_date
      : new Date().toISOString().slice(0, 10)

  const { data, error } = await supabaseAdmin
    .from('client_agreements')
    .insert({
      user_id: userId,
      slug,
      template: 'pov_pro',
      title: 'POV Pro Implementation Agreement',
      status: 'sent',
      effective_date: effectiveDate,
      company_name: companyName,
      client_name: typeof body.client_name === 'string' ? body.client_name.trim() || null : null,
      client_email:
        typeof body.client_email === 'string' ? body.client_email.trim() || null : client.email ?? null,
      client_phone: typeof body.client_phone === 'string' ? body.client_phone.trim() || null : null,
      monthly_fee: monthlyFee,
      created_by: auth.userId,
    })
    .select(AGREEMENT_COLUMNS)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Link the pending agreement on the billing page right away so the client can find it.
  await supabaseAdmin
    .from('subscriptions')
    .update({ client_agreement_url: agreementPublicUrl(slug), updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  return NextResponse.json({
    agreement: { ...data, monthly_fee: Number(data.monthly_fee), url: agreementPublicUrl(slug) },
  })
}
