'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2, Mail, Phone, RefreshCw, Trash2 } from 'lucide-react'
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type ClientLead, type LeadStatus } from '@/types/clientPortal'

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-amber-50 text-amber-700',
  contacted: 'bg-blue-50 text-blue-700',
  qualified: 'bg-purple-50 text-purple-700',
  won: 'bg-green-50 text-green-700',
  lost: 'bg-gray-100 text-gray-500',
  spam: 'bg-gray-100 text-gray-400',
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const pagePath = (url: string | null) => {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.pathname === '/' ? u.hostname : u.pathname
  } catch {
    return url
  }
}

export function LeadsTab({ targetUserId, isAdmin }: { targetUserId: string; isAdmin: boolean }) {
  const [leads, setLeads] = useState<ClientLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [showSpam, setShowSpam] = useState(false)
  const [open, setOpen] = useState<string | null>(null)

  const load = useCallback(
    async (refresh = false) => {
      setLoading(true)
      setError(null)
      try {
        const qs = new URLSearchParams()
        if (isAdmin) qs.set('user_id', targetUserId)
        if (refresh) qs.set('refresh', '1')
        const res = await fetch(`/api/crucible-pro/leads?${qs}`, { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Failed to load leads')
        setLeads(json.leads as ClientLead[])
        setSyncError(json.syncError ?? null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load leads')
      } finally {
        setLoading(false)
      }
    },
    [isAdmin, targetUserId],
  )

  useEffect(() => {
    load()
  }, [load])

  async function patch(id: string, body: Partial<Pick<ClientLead, 'status' | 'notes'>>) {
    setLeads((curr) => curr.map((l) => (l.id === id ? { ...l, ...body } : l)))
    const res = await fetch(`/api/crucible-pro/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setError((await res.json()).error ?? 'Update failed')
      load()
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this lead?')) return
    const res = await fetch(`/api/crucible-pro/leads/${id}`, { method: 'DELETE' })
    if (res.ok) setLeads((curr) => curr.filter((l) => l.id !== id))
  }

  const stats = useMemo(() => {
    const real = leads.filter((l) => l.status !== 'spam')
    const since = (days: number) => real.filter((l) => Date.now() - new Date(l.submitted_at).getTime() < days * 86_400_000).length
    return {
      week: since(7),
      month: since(30),
      open: real.filter((l) => l.status === 'new').length,
      won: real.filter((l) => l.status === 'won').length,
    }
  }, [leads])

  const visible = leads.filter((l) => showSpam || l.status !== 'spam')
  const spamCount = leads.length - leads.filter((l) => l.status !== 'spam').length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Every form submission from your website, newest first.</p>
        <button
          onClick={() => load(true)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Last 7 days', stats.week],
          ['Last 30 days', stats.month],
          ['Not contacted yet', stats.open],
          ['Won', stats.won],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isAdmin && syncError && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">HubSpot sync: {syncError}</p>
      )}

      {!loading && visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
          No website leads yet. New form submissions show up here automatically.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-[25px] border border-gray-200 bg-white overflow-hidden">
          {visible.map((l) => {
            const expanded = open === l.id
            return (
              <li key={l.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <button onClick={() => setOpen(expanded ? null : l.id)} className="flex-1 min-w-0 text-left flex gap-2">
                    {expanded ? (
                      <ChevronDown className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{l.name ?? l.email ?? l.phone ?? 'Website visitor'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {when(l.submitted_at)}
                        {pagePath(l.page_url) ? ` · ${pagePath(l.page_url)}` : ''}
                        {l.form_name ? ` · ${l.form_name}` : ''}
                      </p>
                      {l.message && !expanded && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{l.message}</p>}
                    </div>
                  </button>
                  <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
                    {l.phone && (
                      <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                        <Phone className="w-3.5 h-3.5" /> {l.phone}
                      </a>
                    )}
                    {l.email && (
                      <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900" title={l.email}>
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                    <select
                      value={l.status}
                      onChange={(e) => patch(l.id, { status: e.target.value as LeadStatus })}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium border-0 ${STATUS_STYLES[l.status]}`}
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    {isAdmin && (
                      <button onClick={() => remove(l.id)} className="text-gray-300 hover:text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {expanded && <LeadDetail lead={l} onNotes={(notes) => patch(l.id, { notes })} />}
              </li>
            )
          })}
        </ul>
      )}

      {spamCount > 0 && (
        <button onClick={() => setShowSpam((v) => !v)} className="text-xs text-gray-400 hover:text-gray-600">
          {showSpam ? 'Hide' : 'Show'} {spamCount} spam submission{spamCount === 1 ? '' : 's'}
        </button>
      )}
    </div>
  )
}

function LeadDetail({ lead, onNotes }: { lead: ClientLead; onNotes: (notes: string) => void }) {
  const [notes, setNotes] = useState(lead.notes ?? '')
  const extra = Object.entries(lead.fields ?? {}).filter(([, v]) => v != null && String(v).trim())
  return (
    <div className="mt-3 ml-6 space-y-3">
      {lead.message && <p className="text-sm text-gray-700 whitespace-pre-line">{lead.message}</p>}
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2 text-xs">
        {lead.email && <Row label="Email" value={lead.email} />}
        {lead.phone && <Row label="Phone" value={lead.phone} />}
        {lead.page_url && <Row label="Page" value={lead.page_url} />}
        <Row label="Source" value={lead.source} />
        {Object.entries(lead.utm ?? {}).map(([k, v]) => (
          <Row key={k} label={k} value={String(v)} />
        ))}
      </dl>
      {extra.length > 0 && (
        <details>
          <summary className="text-xs text-gray-400 cursor-pointer">All form fields ({extra.length})</summary>
          <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 text-xs">
            {extra.map(([k, v]) => (
              <Row key={k} label={k} value={String(v)} />
            ))}
          </dl>
        </details>
      )}
      <div>
        <label className="text-xs font-medium text-gray-600">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (lead.notes ?? '') && onNotes(notes)}
          rows={2}
          placeholder="Called back, booked a walkthrough…"
          className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
        />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 min-w-0">
      <dt className="text-gray-400 shrink-0">{label}</dt>
      <dd className="text-gray-700 break-all">{value}</dd>
    </div>
  )
}
