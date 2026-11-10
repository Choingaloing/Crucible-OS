'use client'

import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import type { WorkLogEntry } from '@/types/clientPortal'

const INPUT =
  'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fmtDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const monthKey = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

type Draft = { work_date: string; title: string; details: string; category: string; link_url: string }
const emptyDraft = (): Draft => ({ work_date: todayISO(), title: '', details: '', category: '', link_url: '' })

export function WorkLogTab({ targetUserId, isAdmin }: { targetUserId: string; isAdmin: boolean }) {
  const [entries, setEntries] = useState<WorkLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = isAdmin ? `?user_id=${encodeURIComponent(targetUserId)}` : ''
      const res = await fetch(`/api/crucible-pro/work-log${qs}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load work log')
      setEntries(json.entries as WorkLogEntry[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load work log')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, targetUserId])

  useEffect(() => {
    load()
  }, [load])

  async function save(draft: Draft, id?: string) {
    setError(null)
    const res = await fetch(id ? `/api/crucible-pro/work-log/${id}` : '/api/crucible-pro/work-log', {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...draft, user_id: targetUserId }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Save failed')
      return false
    }
    const entry = json.entry as WorkLogEntry
    setEntries((curr) =>
      (id ? curr.map((e) => (e.id === id ? entry : e)) : [entry, ...curr]).sort(
        (a, b) => b.work_date.localeCompare(a.work_date) || b.created_at.localeCompare(a.created_at),
      ),
    )
    return true
  }

  async function remove(id: string) {
    if (!confirm('Remove this work log entry?')) return
    const res = await fetch(`/api/crucible-pro/work-log/${id}`, { method: 'DELETE' })
    if (res.ok) setEntries((curr) => curr.filter((e) => e.id !== id))
  }

  const groups = entries.reduce<{ month: string; items: WorkLogEntry[] }[]>((acc, e) => {
    const m = monthKey(e.work_date)
    const last = acc[acc.length - 1]
    if (last && last.month === m) last.items.push(e)
    else acc.push({ month: m, items: [e] })
    return acc
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">What Crucible has shipped for you, most recent first.</p>
        {isAdmin && (
          <button
            onClick={() => setAdding((v) => !v)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> {adding ? 'Cancel' : 'Add entry'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isAdmin && adding && (
        <EntryForm
          initial={emptyDraft()}
          onCancel={() => setAdding(false)}
          onSave={async (d) => {
            if (await save(d)) setAdding(false)
          }}
        />
      )}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      ) : entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
          Nothing logged yet.
        </p>
      ) : (
        groups.map((g) => (
          <section key={g.month} className="bg-white border border-gray-200 rounded-[25px] p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">{g.month}</h2>
            <ul className="space-y-3">
              {g.items.map((e) =>
                editing === e.id ? (
                  <li key={e.id}>
                    <EntryForm
                      initial={{
                        work_date: e.work_date.slice(0, 10),
                        title: e.title,
                        details: e.details ?? '',
                        category: e.category ?? '',
                        link_url: e.link_url ?? '',
                      }}
                      onCancel={() => setEditing(null)}
                      onSave={async (d) => {
                        if (await save(d, e.id)) setEditing(null)
                      }}
                    />
                  </li>
                ) : (
                  <li key={e.id} className="flex gap-4">
                    <span className="w-20 shrink-0 text-xs text-gray-400 pt-0.5">{fmtDate(e.work_date)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {e.title}
                        {e.category && (
                          <span className="ml-2 align-middle rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-normal text-gray-500">
                            {e.category}
                          </span>
                        )}
                      </p>
                      {e.details && <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{e.details}</p>}
                      {e.link_url && (
                        <a href={e.link_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-brand-orange">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex items-start gap-2 text-gray-400 shrink-0">
                        <button onClick={() => setEditing(e.id)} className="hover:text-gray-700" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(e.id)} className="hover:text-red-500" title="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </li>
                ),
              )}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

function EntryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Draft
  onSave: (d: Draft) => Promise<void>
  onCancel: () => void
}) {
  const [d, setD] = useState(initial)
  const [saving, setSaving] = useState(false)
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setD((curr) => ({ ...curr, [k]: e.target.value }))

  return (
    <div className="rounded-2xl border border-brand-orange/40 bg-gray-50 p-4 space-y-2">
      <div className="grid gap-2 sm:grid-cols-[10rem_1fr_10rem]">
        <input type="date" value={d.work_date} onChange={set('work_date')} className={INPUT} aria-label="Date" />
        <input autoFocus value={d.title} onChange={set('title')} placeholder="What was done" className={INPUT} />
        <input value={d.category} onChange={set('category')} placeholder="Category (e.g. Website)" className={INPUT} />
      </div>
      <textarea value={d.details} onChange={set('details')} rows={3} placeholder="Details (optional)" className={INPUT} />
      <input value={d.link_url} onChange={set('link_url')} placeholder="Link (optional), https://…" className={INPUT} />
      <div className="flex items-center gap-3">
        <button
          onClick={async () => {
            setSaving(true)
            await onSave(d)
            setSaving(false)
          }}
          disabled={saving || !d.title.trim()}
          className="px-4 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  )
}
