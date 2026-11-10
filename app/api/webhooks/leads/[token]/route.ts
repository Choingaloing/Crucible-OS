import { NextResponse } from 'next/server'
import { serviceDb } from '@/lib/crucible-pro/db'
import { flatten, toLead, type FlatFields } from '@/lib/leads/normalize'

export const dynamic = 'force-dynamic'

// Public lead intake. Each client has an unguessable token (client_data_sources.
// lead_webhook_token); their website, HubSpot workflow, GoHighLevel workflow or
// Zapier posts form submissions here as JSON or form data.
//   POST https://cruciblecoaching.org/api/webhooks/leads/<token>

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
const MAX_BYTES = 64 * 1024

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: CORS })
  if (!/^[a-f0-9]{24,64}$/i.test(params.token)) return reply({ ok: false, error: 'Unknown endpoint' }, 404)

  const db = await serviceDb()
  const { data: source } = await db
    .from('client_data_sources')
    .select('user_id')
    .eq('lead_webhook_token', params.token)
    .maybeSingle()
  if (!source) return reply({ ok: false, error: 'Unknown endpoint' }, 404)

  const raw = await request.text()
  if (raw.length > MAX_BYTES) return reply({ ok: false, error: 'Payload too large' }, 413)

  let fields: FlatFields = {}
  const type = request.headers.get('content-type') ?? ''
  try {
    if (type.includes('application/json')) {
      fields = flatten(JSON.parse(raw))
    } else if (type.includes('multipart/form-data')) {
      const form = await new Request(request.url, { method: 'POST', headers: { 'content-type': type }, body: raw }).formData()
      fields = flatten(Object.fromEntries(Array.from(form.entries()).filter(([, v]) => typeof v === 'string')))
    } else {
      fields = flatten(Object.fromEntries(new URLSearchParams(raw)))
    }
  } catch {
    return reply({ ok: false, error: 'Could not read the submission' }, 400)
  }

  const lead = toLead(fields, request.headers.get('referer'))
  if (!lead.name && !lead.email && !lead.phone && !lead.message) {
    return reply({ ok: false, error: 'No name, email, phone or message in the submission' }, 400)
  }

  const row = {
    user_id: source.user_id,
    source: String(fields.source ?? fields.lead_source ?? 'website').slice(0, 40).toLowerCase(),
    external_id: lead.external_id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    page_url: lead.page_url,
    form_name: lead.form_name,
    utm: lead.utm,
    fields,
    status: lead.spam ? 'spam' : 'new',
  }
  const { error } = row.external_id
    ? await db.from('client_leads').upsert(row, { onConflict: 'user_id,source,external_id', ignoreDuplicates: true })
    : await db.from('client_leads').insert(row)
  if (error) {
    console.error('[leads webhook] insert failed', error.message)
    return reply({ ok: false, error: 'Could not save the lead' }, 500)
  }
  return reply({ ok: true })
}
