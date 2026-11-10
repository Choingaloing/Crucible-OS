import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { migoDb } from '@/lib/migo/admin'
import { appendLog, isISODate, logEntry } from '@/lib/migo/todos'
import { CLIENT_TODO_COLUMNS, MIGO_STATUSES, type ClientTodo, type MigoStatus } from '@/types/migo'

const PRIORITIES = ['p1', 'p2', 'p3']

// PATCH /api/crucible-pro/todos/:id
// Admin: title, status, due_date, assignee, priority, client_visible.
// Client: may only mark their own visible items done / not done.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  const { userId, isAdmin } = res.ctx
  const body = await request.json().catch(() => ({}))

  const db = await migoDb()
  const { data: row, error: readError } = await db
    .from('migo_dispatch')
    .select('id, client_id, assignee, client_visible, status, title, work_log')
    .eq('id', params.id)
    .maybeSingle()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
  if (!row || (!isAdmin && (row.client_id !== userId || !row.client_visible))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const by = isAdmin ? 'chandler' : 'client'
  const update: Record<string, unknown> = { last_touched_by: by }
  const notes: string[] = []
  const now = new Date().toISOString()

  const setStatus = (status: MigoStatus) => {
    update.status = status
    update.completed_at = status === 'done' ? now : null
    if (status === 'approved') update.approved_at = now
    notes.push(`Status → ${status}`)
  }

  if (!isAdmin) {
    if (row.assignee !== 'client') {
      return NextResponse.json({ error: 'Only Crucible can update this item' }, { status: 403 })
    }
    if (body.status !== 'done' && body.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    setStatus(body.status)
  } else {
    if (typeof body.status === 'string') {
      if (!MIGO_STATUSES.includes(body.status as MigoStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      setStatus(body.status as MigoStatus)
    }
    if (typeof body.title === 'string' && body.title.trim()) {
      update.title = body.title.trim().slice(0, 300)
      notes.push('Title edited')
    }
    if (body.due_date === null || isISODate(body.due_date)) {
      update.due_date = body.due_date
      notes.push(`Due → ${body.due_date ?? 'none'}`)
    }
    if (body.assignee === 'crucible' || body.assignee === 'client') {
      update.assignee = body.assignee
      update.owner_agent = body.assignee === 'client' ? 'client' : 'migo'
      notes.push(`Owner → ${body.assignee}`)
    }
    if (typeof body.priority === 'string' && PRIORITIES.includes(body.priority)) {
      update.priority = body.priority
    }
    if (typeof body.client_visible === 'boolean') {
      update.client_visible = body.client_visible
      notes.push(body.client_visible ? 'Shown to client' : 'Hidden from client')
    }
  }

  if (notes.length) update.work_log = appendLog(row.work_log, logEntry(by, `Crucible Pro: ${notes.join('; ')}`))

  const { data, error } = await db
    .from('migo_dispatch')
    .update(update)
    .eq('id', params.id)
    .select(CLIENT_TODO_COLUMNS)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ todo: data as ClientTodo })
}

// DELETE: admin only. Cancels rather than deletes, so Migo keeps the history.
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const res = await resolveContext(null)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = await migoDb()
  const { data: row } = await db.from('migo_dispatch').select('work_log').eq('id', params.id).maybeSingle()
  const { error } = await db
    .from('migo_dispatch')
    .update({
      status: 'cancelled',
      last_touched_by: 'chandler',
      work_log: appendLog(row?.work_log, logEntry('chandler', 'Crucible Pro: removed')),
    })
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
