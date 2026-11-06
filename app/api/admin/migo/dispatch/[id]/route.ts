import { NextResponse } from 'next/server'
import { migoDb, requireMigoAdmin } from '@/lib/migo/admin'
import { MIGO_DESTINATIONS, MIGO_STATUSES, type MigoDestination, type MigoStatus } from '@/types/migo'

const PRIORITIES = ['p1', 'p2', 'p3']

// PATCH /api/admin/migo/dispatch/:id — Chandler changes status, due date, priority or destination.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await requireMigoAdmin()
  if (!guard.ok) return guard.response

  const body = await request.json().catch(() => ({}))
  const update: Record<string, unknown> = { last_touched_by: 'chandler' }

  if (typeof body.status === 'string') {
    if (!MIGO_STATUSES.includes(body.status as MigoStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    update.status = body.status
    if (body.status === 'approved') update.approved_at = new Date().toISOString()
    update.completed_at = body.status === 'done' ? new Date().toISOString() : null
  }
  if (typeof body.destination === 'string') {
    if (!MIGO_DESTINATIONS.includes(body.destination as MigoDestination)) {
      return NextResponse.json({ error: 'Invalid destination' }, { status: 400 })
    }
    update.destination = body.destination
  }
  if (typeof body.priority === 'string') {
    if (!PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }
    update.priority = body.priority
  }
  if (body.due_date === null || (typeof body.due_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.due_date))) {
    update.due_date = body.due_date
  }

  const db = await migoDb()
  const { data, error } = await db.from('migo_dispatch').update(update).eq('id', params.id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}
