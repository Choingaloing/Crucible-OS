import { NextResponse } from 'next/server'
import { migoDb, requireMigoAdmin } from '@/lib/migo/admin'

// PATCH /api/admin/migo/debriefs/:id  { action: 'approve' | 'reject' }
// Approve: debrief -> dispatched, and every still-proposed task from it -> approved,
// so the owning Claude project picks it up on its next session.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const guard = await requireMigoAdmin()
  if (!guard.ok) return guard.response

  const body = await request.json().catch(() => ({}))
  const action = body.action
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }

  const db = await migoDb()
  const now = new Date().toISOString()

  const { data: debrief, error } = await db
    .from('migo_debriefs')
    .update(action === 'approve' ? { status: 'dispatched', approved_at: now } : { status: 'rejected' })
    .eq('id', params.id)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: items, error: itemsError } = await db
    .from('migo_dispatch')
    .update(
      action === 'approve'
        ? { status: 'approved', approved_at: now, last_touched_by: 'chandler' }
        : { status: 'cancelled', last_touched_by: 'chandler' },
    )
    .eq('debrief_id', params.id)
    .eq('status', 'proposed')
    .select('*')
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  return NextResponse.json({ debrief, items: items ?? [] })
}
