'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Check, ExternalLink, X } from 'lucide-react'
import {
  MIGO_DESTINATION_LABELS,
  MIGO_OPEN_STATUSES,
  MIGO_STATUS_LABELS,
  type MigoDebrief,
  type MigoDestination,
  type MigoDispatch,
  type MigoStatus,
} from '@/types/migo'

type AgentFilter = 'all' | 'migo' | 'moldy'

const AGENT_TABS: { key: AgentFilter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'migo', label: 'Migo · Crucible' },
  { key: 'moldy', label: 'Moldy · Mold Launch' },
]

const STATUS_STYLES: Record<MigoStatus, string> = {
  proposed: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  in_review: 'bg-orange-100 text-orange-700',
  done: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const PRIORITY_STYLES: Record<string, string> = {
  p1: 'text-red-600',
  p2: 'text-gray-700',
  p3: 'text-gray-400',
}

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDaysISO(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDue(iso: string | null) {
  if (!iso) return 'No date'
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function matchesAgent(business: string, filter: AgentFilter) {
  if (filter === 'all') return true
  if (filter === 'moldy') return business === 'mold_launch'
  return business !== 'mold_launch'
}

export function MigoHQ({
  initialDebriefs,
  initialItems,
}: {
  initialDebriefs: MigoDebrief[]
  initialItems: MigoDispatch[]
}) {
  const [debriefs, setDebriefs] = useState(initialDebriefs)
  const [items, setItems] = useState(initialItems)
  const [agent, setAgent] = useState<AgentFilter>('all')
  const [destination, setDestination] = useState<MigoDestination | 'all'>('all')
  const [error, setError] = useState<string | null>(null)

  const today = todayISO()
  const in3 = addDaysISO(today, 3)
  const weekAgo = addDaysISO(today, -7)

  const view = useMemo(() => {
    const scoped = items.filter((i) => matchesAgent(i.business, agent))
    const open = scoped.filter((i) => MIGO_OPEN_STATUSES.includes(i.status))
    const pendingDebriefs = debriefs.filter(
      (d) => d.status === 'awaiting_approval' && matchesAgent(d.business, agent),
    )
    const looseProposed = scoped.filter(
      (i) => i.status === 'proposed' && (!i.debrief_id || !pendingDebriefs.some((d) => d.id === i.debrief_id)),
    )
    const overdue = open.filter((i) => i.due_date && i.due_date < today && i.status !== 'in_review')
    const dueSoon = open.filter((i) => i.due_date && i.due_date >= today && i.due_date <= in3)
    const inReview = open.filter((i) => i.status === 'in_review')
    const shipped = scoped.filter((i) => i.status === 'done' && (i.completed_at ?? '').slice(0, 10) >= weekAgo)
    const promises = open.filter((i) => destination === 'all' || i.destination === destination)
    return { open, pendingDebriefs, looseProposed, overdue, dueSoon, inReview, shipped, promises }
  }, [items, debriefs, agent, destination, today, in3, weekAgo])

  async function patchItem(id: string, patch: Partial<MigoDispatch>) {
    const prev = items
    setItems((curr) => curr.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    setError(null)
    try {
      const res = await fetch(`/api/admin/migo/dispatch/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Update failed')
      setItems((curr) => curr.map((i) => (i.id === id ? (json.item as MigoDispatch) : i)))
    } catch (err) {
      setItems(prev)
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function decideDebrief(id: string, action: 'approve' | 'reject') {
    setError(null)
    try {
      const res = await fetch(`/api/admin/migo/debriefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Update failed')
      setDebriefs((curr) => curr.map((d) => (d.id === id ? (json.debrief as MigoDebrief) : d)))
      const updated = new Map((json.items as MigoDispatch[]).map((i) => [i.id, i]))
      setItems((curr) => curr.map((i) => updated.get(i.id) ?? i))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {AGENT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setAgent(t.key)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              agent === t.key
                ? 'border-brand-orange bg-brand-orange/10 text-brand-orange font-semibold'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label="Needs approval" value={view.pendingDebriefs.length + view.looseProposed.length} tone="text-amber-600" />
        <Stat label="Overdue" value={view.overdue.length} tone="text-red-600" />
        <Stat label="Due in 72h" value={view.dueSoon.length} tone="text-orange-600" />
        <Stat label="In review" value={view.inReview.length} tone="text-purple-600" />
        <Stat label="Shipped (7d)" value={view.shipped.length} tone="text-green-600" />
      </div>

      {/* Approvals */}
      <section>
        <SectionHeader title="Needs your approval" count={view.pendingDebriefs.length + view.looseProposed.length} />
        {view.pendingDebriefs.length === 0 && view.looseProposed.length === 0 ? (
          <Empty text="Nothing waiting on you. Debriefs from new calls land here." />
        ) : (
          <div className="space-y-3">
            {view.pendingDebriefs.map((d) => (
              <DebriefCard
                key={d.id}
                debrief={d}
                tasks={items.filter((i) => i.debrief_id === d.id)}
                onDecide={decideDebrief}
              />
            ))}
            {view.looseProposed.map((i) => (
              <div key={i.id} className="rounded-2xl border border-amber-200 bg-white p-4 flex items-start justify-between gap-3">
                <ItemSummary item={i} />
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => patchItem(i.id, { status: 'approved' })} className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-medium text-white">
                    Approve
                  </button>
                  <button onClick={() => patchItem(i.id, { status: 'cancelled' })} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
                    Drop
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promises */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            Open promises <span className="text-sm font-normal text-gray-400">{view.promises.length}</span>
          </h2>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value as MigoDestination | 'all')}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-white"
          >
            <option value="all">All projects</option>
            {Object.entries(MIGO_DESTINATION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        {view.promises.length === 0 ? (
          <Empty text="No open promises." />
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {view.promises.map((i) => {
              const overdue = !!i.due_date && i.due_date < today && i.status !== 'in_review'
              return (
                <li key={i.id} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${overdue ? 'bg-red-50/50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <ItemSummary item={i} />
                    {i.status === 'blocked' && i.blocked_reason && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {i.blocked_reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {overdue ? 'Overdue · ' : ''}{formatDue(i.due_date)}
                    </span>
                    {i.deliverable_url && (
                      <a href={i.deliverable_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700" title="Open deliverable">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <select
                      value={i.status}
                      onChange={(e) => patchItem(i.id, { status: e.target.value as MigoStatus })}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium border-0 ${STATUS_STYLES[i.status]}`}
                    >
                      {(['approved', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'] as MigoStatus[]).map((s) => (
                        <option key={s} value={s}>{MIGO_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Shipped */}
      <section>
        <SectionHeader title="Shipped this week" count={view.shipped.length} />
        {view.shipped.length === 0 ? (
          <Empty text="Nothing marked done in the last 7 days." />
        ) : (
          <ul className="space-y-2">
            {view.shipped.map((i) => (
              <li key={i.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{i.title}</span>
                <span className="text-xs text-gray-400">{i.client_name ?? MIGO_DESTINATION_LABELS[i.destination]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function DebriefCard({
  debrief,
  tasks,
  onDecide,
}: {
  debrief: MigoDebrief
  tasks: MigoDispatch[]
  onDecide: (id: string, action: 'approve' | 'reject') => void
}) {
  const proposed = tasks.filter((t) => t.status === 'proposed')
  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {debrief.business === 'mold_launch' ? 'Moldy' : 'Migo'} debrief ·{' '}
            {debrief.call_date ? new Date(debrief.call_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Undated'}
          </p>
          <h3 className="font-semibold text-gray-900">
            {debrief.title}
            {debrief.client_name ? <span className="text-gray-500 font-normal"> · {debrief.client_name}</span> : null}
          </h3>
        </div>
        <div className="flex gap-2 shrink-0">
          {debrief.fathom_url && (
            <a href={debrief.fathom_url} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 inline-flex items-center gap-1">
              Recording <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button onClick={() => onDecide(debrief.id, 'approve')} className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-medium text-white inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> Approve &amp; dispatch
          </button>
          <button onClick={() => onDecide(debrief.id, 'reject')} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 inline-flex items-center gap-1">
            <X className="w-3 h-3" /> Reject
          </button>
        </div>
      </div>
      {debrief.summary && <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{debrief.summary}</p>}
      {proposed.length > 0 && (
        <ul className="mt-3 space-y-2">
          {proposed.map((t) => (
            <li key={t.id} className="rounded-lg bg-gray-50 px-3 py-2">
              <ItemSummary item={t} />
            </li>
          ))}
        </ul>
      )}
      {debrief.open_questions && (
        <p className="mt-3 text-xs text-amber-700">
          <span className="font-semibold">Open questions:</span> {debrief.open_questions}
        </p>
      )}
    </div>
  )
}

function ItemSummary({ item }: { item: MigoDispatch }) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900">
        <span className={`mr-1.5 text-xs font-bold uppercase ${PRIORITY_STYLES[item.priority]}`}>{item.priority}</span>
        {item.title}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">
        {MIGO_DESTINATION_LABELS[item.destination]}
        {item.client_name ? ` · ${item.client_name}` : ''}
        {item.promised_to ? ` · promised to ${item.promised_to}` : ''}
        {item.status === 'proposed' && item.due_date ? ` · due ${formatDue(item.due_date)}` : ''}
      </p>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <h2 className="text-lg font-bold text-gray-900 mb-3">
      {title} <span className="text-sm font-normal text-gray-400">{count}</span>
    </h2>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">{text}</p>
}
