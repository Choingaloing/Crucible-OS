import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { migoDb } from '@/lib/migo/admin'
import { DONE_VISIBLE_DAYS, isISODate, logEntry } from '@/lib/migo/todos'
import { CLIENT_TODO_COLUMNS, CLIENT_VISIBLE_STATUSES, type ClientTodo } from '@/types/migo'

export const dynamic = 'force-dynamic'

// To-dos are migo_dispatch rows tied to the client. That table is admin-only under
// RLS, so these routes authorize with resolveContext() and then use the service
// role, always scoped to the target client and to client-safe columns.

export async function GET(request: Request) {
  const url = new URL(request.url)
  const res = await resolveContext(url.searchParams.get('user_id'))
  if (!res.ok) return res.response
  const { targetUserId, isAdmin } = res.ctx

  const since = new Date(Date.now() - DONE_VISIBLE_DAYS * 86_400_000).toISOString()
  const db = await migoDb()
  let query = db
    .from('migo_dispatch')
    .select(CLIENT_TODO_COLUMNS)
    .eq('client_id', targetUserId)
    .in('status', CLIENT_VISIBLE_STATUSES)
    .or(`status.neq.done,completed_at.gte.${since}`)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(200)
  if (!isAdmin) query = query.eq('client_visible', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ todos: (data ?? []) as ClientTodo[] })
}

// POST { user_id?, title, assignee?, due_date? }
// Admin can add for either side; a client can only add to their own list.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  const { supabase, targetUserId, isAdmin } = res.ctx

  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 300) : ''
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  const assignee = isAdmin && body.assignee === 'crucible' ? 'crucible' : 'client'
  const by = isAdmin ? 'chandler' : 'client'

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', targetUserId)
    .maybeSingle()

  const now = new Date().toISOString()
  const db = await migoDb()
  const { data, error } = await db
    .from('migo_dispatch')
    .insert({
      client_id: targetUserId,
      client_name: profile?.full_name ?? profile?.email ?? null,
      business: 'crucible',
      destination: 'crucible_clients',
      owner_agent: assignee === 'client' ? 'client' : 'migo',
      assignee,
      client_visible: true,
      title,
      due_date: isISODate(body.due_date) ? body.due_date : null,
      status: 'approved',
      approved_at: now,
      last_touched_by: by,
      work_log: [logEntry(by, 'Added from Crucible Pro')],
    })
    .select(CLIENT_TODO_COLUMNS)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ todo: data as ClientTodo }, { status: 201 })
}
