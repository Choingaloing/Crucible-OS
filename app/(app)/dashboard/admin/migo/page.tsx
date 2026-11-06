import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { migoDb } from '@/lib/migo/admin'
import { MigoHQ } from '@/components/admin/migo/MigoHQ'
import type { MigoDebrief, MigoDispatch } from '@/types/migo'

export const dynamic = 'force-dynamic'

export default async function MigoHQPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const db = await migoDb()
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()

  const [debriefsRes, dispatchRes] = await Promise.all([
    db.from('migo_debriefs').select('*').order('call_date', { ascending: false }).limit(40),
    db
      .from('migo_dispatch')
      .select('*')
      .or(`status.neq.done,completed_at.gte.${since}`)
      .neq('status', 'cancelled')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(400),
  ])

  const setupError = debriefsRes.error?.message || dispatchRes.error?.message || null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Migo HQ</h1>
        <p className="text-sm text-gray-500">
          Every promise from your calls, who owns it, and when it&apos;s due. Migo runs Crucible; Moldy runs Mold Launch.
        </p>
      </div>
      {setupError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Migo tables aren&apos;t reachable yet ({setupError}). Apply migration <code>20261106_migo_hq.sql</code>.
        </div>
      ) : (
        <MigoHQ
          initialDebriefs={(debriefsRes.data ?? []) as MigoDebrief[]}
          initialItems={(dispatchRes.data ?? []) as MigoDispatch[]}
        />
      )}
    </div>
  )
}
