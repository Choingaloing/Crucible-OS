'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, FileText, Calendar, Pencil, ExternalLink, Send, Repeat, Plus, Copy, Check } from 'lucide-react'
import type { AgreementStatus, BillingSnapshot, ClientAgreement, Invoice } from '@/types/cruciblePro'
import { agreementPublicUrl, formatFee, formatLongDate } from '@/lib/agreements/format'
import { setMonthlyRetainerFee, startRetainerSubscription } from '@/lib/actions'
import { StartSubscriptionModal } from '@/components/admin/StartSubscriptionModal'
import { SendOneOffInvoiceModal } from '@/components/admin/SendOneOffInvoiceModal'
import { InvoiceHistoryList } from './InvoiceHistoryList'

export function BillingTab({
  billing,
  invoices,
  agreements = [],
  targetUserId,
  isAdmin,
}: {
  billing: BillingSnapshot
  invoices: Invoice[]
  agreements?: ClientAgreement[]
  targetUserId: string
  isAdmin: boolean
}) {
  const nextBilling = billing.next_billing_date ?? billing.current_period_end

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeeCard billing={billing} targetUserId={targetUserId} isAdmin={isAdmin} />
        <AgreementCard billing={billing} agreements={agreements} targetUserId={targetUserId} isAdmin={isAdmin} />
        <NextBillingCard nextBilling={nextBilling} targetUserId={targetUserId} isAdmin={isAdmin} />
        <PaymentMethodCard billing={billing} />
      </div>
      {isAdmin && <AdminBillingActions billing={billing} targetUserId={targetUserId} />}
      <InvoiceHistoryList
        invoices={invoices}
        emptyHint={isAdmin ? 'No invoices sent yet for this client.' : undefined}
      />
    </div>
  )
}

function AdminBillingActions({
  billing,
  targetUserId,
}: {
  billing: BillingSnapshot
  targetUserId: string
}) {
  const [subUrl, setSubUrl] = useState<string | null>(null)
  const [subOpen, setSubOpen] = useState(false)
  const [subError, setSubError] = useState<string | null>(null)
  const [subPending, startSubTransition] = useTransition()
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const router = useRouter()

  function openSubscription() {
    setSubError(null)
    startSubTransition(async () => {
      try {
        const res = await startRetainerSubscription(targetUserId)
        setSubUrl(res.url)
        setSubOpen(true)
      } catch (e) {
        setSubError(e instanceof Error ? e.message : 'Failed to start subscription')
      }
    })
  }

  const subActive = billing.status === 'active' && billing.has_stripe_subscription
  const fee = billing.monthly_consulting_fee

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Admin actions</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={openSubscription}
          disabled={subPending || !fee}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white text-sm font-semibold disabled:opacity-50"
        >
          <Repeat className="w-4 h-4" />
          {subPending
            ? 'Generating link…'
            : subActive
            ? 'Restart subscription'
            : 'Start subscription'}
        </button>
        <button
          onClick={() => setInvoiceOpen(true)}
          disabled={!fee}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Send one-off invoice
        </button>
      </div>
      {!fee && (
        <p className="mt-2 text-xs text-gray-500">
          Set a monthly retainer above before billing.
        </p>
      )}
      {subError && <p className="mt-2 text-xs text-red-600">{subError}</p>}

      <StartSubscriptionModal
        open={subOpen}
        url={subUrl}
        onClose={() => setSubOpen(false)}
      />
      <SendOneOffInvoiceModal
        open={invoiceOpen}
        userId={targetUserId}
        defaultAmount={fee}
        onClose={() => setInvoiceOpen(false)}
        onSent={() => router.refresh()}
      />
    </div>
  )
}

function FeeCard({
  billing,
  targetUserId,
  isAdmin,
}: {
  billing: BillingSnapshot
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(billing.monthly_consulting_fee?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaveTransition] = useTransition()

  function save() {
    setError(null)
    const trimmed = value.trim()
    const parsed = trimmed === '' ? null : Number(trimmed)
    if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) {
      setError('Enter a non-negative number')
      return
    }
    startSaveTransition(async () => {
      try {
        await setMonthlyRetainerFee(targetUserId, parsed)
        setEditing(false)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save retainer')
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
          <CreditCard className="w-4 h-4" />
          Monthly retainer
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-700">
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">$</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              placeholder="5000"
            />
            <span className="text-xs text-gray-500">/ month</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setError(null) }} className="text-sm text-gray-500 hover:text-gray-900">
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      ) : (
        <div className="mt-2 text-3xl font-bold text-gray-900">
          {billing.monthly_consulting_fee != null ? formatCurrency(billing.monthly_consulting_fee) : '—'}
          {billing.monthly_consulting_fee != null && (
            <span className="text-sm font-normal text-gray-500 ml-1">/ mo</span>
          )}
        </div>
      )}
    </div>
  )
}

function AgreementCard({
  billing,
  agreements,
  targetUserId,
  isAdmin,
}: {
  billing: BillingSnapshot
  agreements: ClientAgreement[]
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [editingUrl, setEditingUrl] = useState(false)
  const [value, setValue] = useState(billing.client_agreement_url ?? '')
  const [saving, setSaving] = useState(false)

  const hasStructured = agreements.length > 0

  async function saveUrl() {
    setSaving(true)
    await fetch('/api/crucible-pro/billing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: targetUserId, client_agreement_url: value || null }),
    })
    setSaving(false)
    setEditingUrl(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
          <FileText className="w-4 h-4" />
          Client agreement
        </div>
        {isAdmin && !creating && !editingUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:text-brand-orange-dark"
            >
              <Plus className="w-3.5 h-3.5" /> New agreement
            </button>
            <button onClick={() => setEditingUrl(true)} className="text-gray-400 hover:text-gray-700" title="Link an external PDF">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {creating ? (
        <NewAgreementForm
          targetUserId={targetUserId}
          defaultFee={billing.monthly_consulting_fee}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            router.refresh()
          }}
        />
      ) : editingUrl ? (
        <div className="mt-3 space-y-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            placeholder="https://…/agreement.pdf"
          />
          <div className="flex gap-2">
            <button
              onClick={saveUrl}
              disabled={saving}
              className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditingUrl(false)} className="text-sm text-gray-500 hover:text-gray-900">
              Cancel
            </button>
          </div>
        </div>
      ) : hasStructured ? (
        <ul className="mt-3 space-y-3">
          {agreements.map((a) => (
            <AgreementRow key={a.id} agreement={a} isAdmin={isAdmin} />
          ))}
        </ul>
      ) : billing.client_agreement_url ? (
        <a
          href={billing.client_agreement_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-brand-orange hover:underline text-sm font-medium"
        >
          View agreement
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          {isAdmin ? 'No agreement yet. Create one to send a signing link.' : 'No agreement linked yet.'}
        </p>
      )}
    </div>
  )
}

const AGREEMENT_STATUS_CLASSES: Record<AgreementStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-amber-100 text-amber-700',
  signed: 'bg-green-100 text-green-700',
  void: 'bg-gray-100 text-gray-500 line-through',
}

const AGREEMENT_STATUS_LABEL: Record<AgreementStatus, string> = {
  draft: 'Draft',
  sent: 'Awaiting signature',
  signed: 'Signed',
  void: 'Void',
}

function AgreementRow({ agreement, isAdmin }: { agreement: ClientAgreement; isAdmin: boolean }) {
  const [copied, setCopied] = useState(false)
  const url = agreementPublicUrl(agreement.slug)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <li className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{agreement.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {agreement.company_name} · {formatFee(agreement.monthly_fee)}/mo · Effective{' '}
            {formatLongDate(agreement.effective_date)}
          </div>
          {agreement.status === 'signed' && (
            <div className="text-xs text-gray-500 mt-0.5">
              Signed by {agreement.signer_name}
              {agreement.signer_title ? `, ${agreement.signer_title}` : ''} on {formatLongDate(agreement.signed_date)}
            </div>
          )}
        </div>
        <span
          className={`flex-none text-[11px] font-semibold px-2 py-0.5 rounded-full ${AGREEMENT_STATUS_CLASSES[agreement.status]}`}
        >
          {AGREEMENT_STATUS_LABEL[agreement.status]}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-brand-orange hover:underline text-sm font-medium"
        >
          {agreement.status === 'signed' ? 'View signed agreement' : 'Open signing page'}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {isAdmin && (
          <button
            onClick={copy}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        )}
      </div>
    </li>
  )
}

function NewAgreementForm({
  targetUserId,
  defaultFee,
  onClose,
  onCreated,
}: {
  targetUserId: string
  defaultFee: number | null
  onClose: () => void
  onCreated: () => void
}) {
  const [company, setCompany] = useState('')
  const [signer, setSigner] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fee, setFee] = useState(defaultFee != null ? String(defaultFee) : '')
  const [slug, setSlug] = useState('')
  const [effective, setEffective] = useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: targetUserId,
          company_name: company,
          client_name: signer,
          client_email: email,
          client_phone: phone,
          monthly_fee: Number(fee),
          effective_date: effective,
          slug: slug || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? 'Failed to create agreement')
      setCreatedUrl(json.agreement.url as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agreement')
    } finally {
      setSubmitting(false)
    }
  }

  if (createdUrl) {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-sm text-gray-700">Signing link created. Send this to the client:</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={createdUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
          />
          <button
            onClick={() => navigator.clipboard.writeText(createdUrl).catch(() => undefined)}
            className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold"
          >
            Copy
          </button>
        </div>
        <button onClick={onCreated} className="text-sm text-brand-orange font-semibold hover:underline">
          Done
        </button>
      </div>
    )
  }

  const input =
    'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30'

  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <p className="text-xs text-gray-500">POV Pro Implementation Agreement</p>
      <input value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="Company name (e.g. Elite Lighting Designs Inc.)" className={input} />
      <div className="grid grid-cols-2 gap-2">
        <input value={signer} onChange={(e) => setSigner(e.target.value)} placeholder="Signer (Name, Title)" className={input} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Signer email" className={input} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={input} />
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-sm">$</span>
          <input value={fee} onChange={(e) => setFee(e.target.value)} type="number" min="0" required placeholder="Monthly fee" className={input} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={effective} onChange={(e) => setEffective(e.target.value)} type="date" required className={input} />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Custom URL slug (optional)" className={input} />
      </div>
      {slug && <p className="text-[11px] text-gray-400">cruciblecoaching.org/agreements/{slug}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create signing link'}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  )
}

function NextBillingCard({
  nextBilling,
  targetUserId,
  isAdmin,
}: {
  nextBilling: string | null
  targetUserId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const initial = nextBilling ? new Date(nextBilling).toISOString().slice(0, 10) : ''
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/crucible-pro/billing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: targetUserId, next_billing_date: value || null }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
          <Calendar className="w-4 h-4" />
          Next billing date
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-700">
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-3 space-y-2">
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-900">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-xl font-bold text-gray-900">
          {nextBilling ? new Date(nextBilling).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—'}
        </div>
      )}
    </div>
  )
}

function PaymentMethodCard({ billing }: { billing: BillingSnapshot }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openPortal() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to open portal')
      window.location.href = json.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open portal')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide font-semibold">
        <CreditCard className="w-4 h-4" />
        Payment method
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Update your card, view invoices, or cancel through the secure Stripe portal.
      </p>
      <button
        onClick={openPortal}
        disabled={loading || !billing.stripe_customer_id}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
      >
        {loading ? 'Opening…' : 'Manage billing in Stripe'}
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
      {!billing.stripe_customer_id && (
        <p className="mt-2 text-xs text-gray-500">
          Available once an active Stripe subscription is on file.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}
