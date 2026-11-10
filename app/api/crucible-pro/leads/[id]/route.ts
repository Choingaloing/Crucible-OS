import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { clean, serviceDb } from '@/lib/crucible-pro/db'
import { LEAD_STATUSES, type LeadStatus } from '@/types/clientPortal'

// PATCH { status?, notes? }: the client (own leads) or admin.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { userId, isAdmin } = res.ctx
  const body = await request.json().catch(() => ({}))

  const db = await serviceDb()
  const { data: row } = await db.from('client_leads').select('user_id').eq('id', params.id).maybeSingle()
  if (!row || (!isAdmin && row.user_id !== userId)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.status === 'string') {
    if (!LEAD_STATUSES.includes(body.status as LeadStatus)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    update.status = body.status
  }
  if ('notes' in body) update.notes = clean(body.notes, 5000)

  const { data, error } = await db.from('client_leads').update(update).eq('id', params.id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ lead: data })
}

// DELETE: admin only (e.g. test submissions).
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = await serviceDb()
  const { error } = await db.from('client_leads').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
