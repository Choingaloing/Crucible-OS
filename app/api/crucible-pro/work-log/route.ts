import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { clean, serviceDb } from '@/lib/crucible-pro/db'
import { isISODate } from '@/lib/migo/todos'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const res = await resolveContext(url.searchParams.get('user_id'))
  if (!res.ok) return res.response
  const db = await serviceDb()
  const { data, error } = await db
    .from('client_work_log')
    .select('*')
    .eq('user_id', res.ctx.targetUserId)
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entries: data ?? [] })
}

// POST { user_id, title, details?, category?, link_url?, work_date? }  (admin only)
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const title = clean(body.title, 300)
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const db = await serviceDb()
  const { data, error } = await db
    .from('client_work_log')
    .insert({
      user_id: res.ctx.targetUserId,
      title,
      details: clean(body.details, 5000),
      category: clean(body.category, 80),
      link_url: clean(body.link_url, 1000),
      ...(isISODate(body.work_date) ? { work_date: body.work_date } : {}),
    })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data }, { status: 201 })
}
