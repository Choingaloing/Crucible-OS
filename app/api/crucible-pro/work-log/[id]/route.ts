import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { clean, serviceDb } from '@/lib/crucible-pro/db'
import { isISODate } from '@/lib/migo/todos'

// PATCH / DELETE /api/crucible-pro/work-log/:id  (admin only)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => ({}))

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('title' in body) {
    const title = clean(body.title, 300)
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    update.title = title
  }
  if ('details' in body) update.details = clean(body.details, 5000)
  if ('category' in body) update.category = clean(body.category, 80)
  if ('link_url' in body) update.link_url = clean(body.link_url, 1000)
  if (isISODate(body.work_date)) update.work_date = body.work_date

  const db = await serviceDb()
  const { data, error } = await db.from('client_work_log').update(update).eq('id', params.id).select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ entry: data })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = await serviceDb()
  const { error } = await db.from('client_work_log').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
