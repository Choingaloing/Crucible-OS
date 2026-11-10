import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { ASSETS_BUCKET, clean, serviceDb } from '@/lib/crucible-pro/db'

// PATCH / DELETE /api/crucible-pro/assets/:id  (admin only)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => ({}))

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('title' in body) {
    const title = clean(body.title, 200)
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    update.title = title
  }
  if ('description' in body) update.description = clean(body.description, 2000)
  if ('category' in body) update.category = clean(body.category, 80)
  if (body.visibility === 'client' || body.visibility === 'internal') update.visibility = body.visibility
  if ('url' in body) {
    const link = clean(body.url, 2000)
    if (link && !/^https?:\/\//i.test(link)) return NextResponse.json({ error: 'A full https:// link is required' }, { status: 400 })
    update.url = link
  }
  if (Number.isInteger(body.sort_order)) update.sort_order = body.sort_order

  const db = await serviceDb()
  const { data, error } = await db.from('client_assets').update(update).eq('id', params.id).select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ asset: data })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = await serviceDb()
  const { data: row } = await db.from('client_assets').select('storage_path').eq('id', params.id).maybeSingle()
  const { error } = await db.from('client_assets').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (row?.storage_path) await db.storage.from(ASSETS_BUCKET).remove([row.storage_path])
  return NextResponse.json({ ok: true })
}
