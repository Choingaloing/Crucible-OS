'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ExternalLink, Loader2, Settings2, Star } from 'lucide-react'
import {
  MARKETING_RANGES,
  MARKETING_RANGE_LABELS,
  type AdsCampaign,
  type AdsTotals,
  type ClientDataSources,
  type MarketingRange,
  type MarketingSummary,
} from '@/types/marketing'

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n >= 100 ? 0 : 2 })
const count = (n: number) => Math.round(n).toLocaleString('en-US')
const perLead = (spend: number, leads: number) => (leads > 0 ? money(spend / leads) : '—')
const shortDate = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

const INPUT =
  'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30'

const CHANNEL_LABELS: Record<string, string> = {
  SEARCH: 'Search',
  LOCAL_SERVICES: 'Local Services',
  PERFORMANCE_MAX: 'Performance Max',
  DISPLAY: 'Display',
  VIDEO: 'YouTube',
  DEMAND_GEN: 'Demand Gen',
}

export function MarketingTab({
  targetUserId,
  isAdmin,
  initialSources,
}: {
  targetUserId: string
  isAdmin: boolean
  initialSources: ClientDataSources | null
}) {
  const [range, setRange] = useState<MarketingRange>('30')
  const [summary, setSummary] = useState<MarketingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sources, setSources] = useState(initialSources)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams({ range })
      if (isAdmin) qs.set('user_id', targetUserId)
      const res = await fetch(`/api/crucible-pro/marketing?${qs.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load')
      setSummary(json as MarketingSummary)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [range, isAdmin, targetUserId])

  useEffect(() => {
    load()
  }, [load, sources])

  const connected = !!sources && (sources.google_ads_accounts.length > 0 || sources.gbp_locations.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {MARKETING_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                range === r
                  ? 'border-brand-orange bg-brand-orange/10 text-brand-orange font-semibold'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {MARKETING_RANGE_LABELS[r]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {summary && !loading && (
            <span>
              {shortDate(summary.dates.from)} – {shortDate(summary.dates.to)} · updates every 10 min
            </span>
          )}
        </div>
      </div>

      {isAdmin && <DataSourcesEditor targetUserId={targetUserId} sources={sources} onSaved={setSources} />}

      {error && <Notice tone="red">{error}</Notice>}

      {!connected && !loading && (
        <Notice tone="gray">
          {isAdmin
            ? 'No Google accounts mapped to this client yet. Add them under Data sources above.'
            : 'Your marketing dashboard is being connected. Your Google Ads and Business Profile numbers will show here soon.'}
        </Notice>
      )}

      {summary && sources?.google_ads_accounts.length ? <AdsSection summary={summary} /> : null}
      {summary && sources?.gbp_locations.length ? <GbpSection summary={summary} /> : null}
    </div>
  )
}

function AdsSection({ summary }: { summary: MarketingSummary }) {
  const { ads } = summary
  if (ads.error) return <Card title="Google Ads"><Notice tone="red">{ads.error}</Notice></Card>
  if (!ads.data) return null
  const { search, lsa, campaigns, daily } = ads.data
  const lsaCampaigns = campaigns.filter((c) => c.channel === 'LOCAL_SERVICES' || c.channel === 'LOCAL SERVICES')
  const adCampaigns = campaigns.filter((c) => !lsaCampaigns.includes(c))

  return (
    <>
      <Card title="Google Ads" subtitle="Search, Performance Max and other paid campaigns">
        <Stats
          items={[
            ['Spend', money(search.spend)],
            ['Clicks', count(search.clicks)],
            ['Leads (conversions)', count(search.conversions)],
            ['Cost per lead', perLead(search.spend, search.conversions)],
            ['Calls from ads', count(search.phone_calls)],
          ]}
        />
        {daily.length > 1 && (
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={daily} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: '#9ca3af' }} minTickGap={24} />
                <YAxis yAxisId="spend" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="leads" orientation="right" allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  labelFormatter={(l) => shortDate(String(l))}
                  formatter={(v: number, name: string) => (name === 'Spend' ? money(v) : count(v))}
                />
                <Bar yAxisId="spend" dataKey="spend" name="Spend" fill="#FDE07A" radius={[3, 3, 0, 0]} />
                <Line yAxisId="leads" dataKey="conversions" name="Leads" stroke="#E86530" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        {adCampaigns.length > 0 && <CampaignTable campaigns={adCampaigns} />}
      </Card>

      <Card title="Local Services Ads" subtitle="Google Guaranteed / Google Screened">
        {lsaCampaigns.length === 0 && lsa.spend === 0 ? (
          <p className="text-sm text-gray-500">No Local Services Ads activity in this period.</p>
        ) : (
          <>
            <Stats
              items={[
                ['Spend', money(lsa.spend)],
                ['Leads', count(lsaLeads(lsa))],
                ['Cost per lead', perLead(lsa.spend, lsaLeads(lsa))],
                ['Impressions', count(lsa.impressions)],
              ]}
            />
            <p className="mt-3 text-xs text-gray-400">
              Lead totals come from Google Ads reporting. Individual LSA leads (calls, messages, charged vs. credited) are in
              your Local Services dashboard.
            </p>
          </>
        )}
      </Card>
    </>
  )
}

const lsaLeads = (t: AdsTotals) => Math.max(t.conversions, t.phone_calls)

function CampaignTable({ campaigns }: { campaigns: AdsCampaign[] }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="py-2 pr-3 font-medium">Campaign</th>
            <th className="py-2 px-3 font-medium text-right">Spend</th>
            <th className="py-2 px-3 font-medium text-right">Clicks</th>
            <th className="py-2 px-3 font-medium text-right">Leads</th>
            <th className="py-2 pl-3 font-medium text-right">Cost / lead</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={`${c.campaign}|${c.channel}`} className="border-b border-gray-50 last:border-0">
              <td className="py-2 pr-3">
                <div className="text-gray-900">{c.campaign}</div>
                <div className="text-xs text-gray-400">{CHANNEL_LABELS[c.channel] ?? c.channel.toLowerCase()}</div>
              </td>
              <td className="py-2 px-3 text-right tabular-nums">{money(c.spend)}</td>
              <td className="py-2 px-3 text-right tabular-nums">{count(c.clicks)}</td>
              <td className="py-2 px-3 text-right tabular-nums">{count(c.conversions)}</td>
              <td className="py-2 pl-3 text-right tabular-nums">{perLead(c.spend, c.conversions)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GbpSection({ summary }: { summary: MarketingSummary }) {
  const { gbp } = summary
  if (gbp.error) return <Card title="Google Business Profile"><Notice tone="red">{gbp.error}</Notice></Card>
  if (!gbp.data) return null
  const { totals, keywords, rating, review_count, reviews, posts, photos } = gbp.data

  return (
    <Card
      title="Google Business Profile"
      subtitle="Your listing on Google Search and Maps"
      aside={
        rating != null ? (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="w-4 h-4 fill-brand-amber text-brand-amber" />
            <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
            {review_count != null && <span className="text-gray-400">({count(review_count)} reviews)</span>}
          </div>
        ) : null
      }
    >
      <Stats
        items={[
          ['Profile views', count(totals.impressions)],
          ['Calls', count(totals.call_clicks)],
          ['Website clicks', count(totals.website_clicks)],
          ['Direction requests', count(totals.direction_requests)],
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">How people found you</h4>
          {keywords.length === 0 ? (
            <p className="text-sm text-gray-500">No search term data for this period yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {keywords.map((k) => (
                <li key={k.keyword} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate pr-3">{k.keyword}</span>
                  <span className="text-gray-400 tabular-nums">{count(k.searches)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Latest reviews</h4>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews in the last year.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{r.reviewer ?? 'Google user'}</span>
                    {r.rating != null && <span className="text-brand-amber text-xs">{'★'.repeat(r.rating)}</span>}
                    <span className="text-xs text-gray-400">{shortDate(r.created_at)}</span>
                  </div>
                  {r.comment && <p className="text-gray-600 mt-0.5 line-clamp-3">{r.comment}</p>}
                  {r.reply ? (
                    <p className="text-xs text-gray-400 mt-1">Replied</p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1">No reply yet</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent posts</h4>
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500">No posts in the last year.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-200 overflow-hidden">
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt="" className="w-full h-32 object-cover bg-gray-100" />
                )}
                <div className="p-3">
                  <div className="text-xs text-gray-400 flex justify-between">
                    <span>{shortDate(p.created_at)}</span>
                    {p.state && p.state !== 'LIVE' && <span className="text-amber-600">{p.state.toLowerCase()}</span>}
                  </div>
                  {p.summary && <p className="text-sm text-gray-700 mt-1 line-clamp-4">{p.summary}</p>}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-brand-orange">
                      View on Google <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent photos</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {photos.map((ph) => (
              <a key={ph.id} href={ph.url ?? undefined} target="_blank" rel="noreferrer" className="block" title={`${count(ph.views)} views`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.thumbnail_url ?? ph.url ?? ''} alt="" className="aspect-square w-full object-cover rounded-lg bg-gray-100" />
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function DataSourcesEditor({
  targetUserId,
  sources,
  onSaved,
}: {
  targetUserId: string
  sources: ClientDataSources | null
  onSaved: (s: ClientDataSources) => void
}) {
  const [open, setOpen] = useState(!sources)
  const [ads, setAds] = useState((sources?.google_ads_accounts ?? []).join(', '))
  const [gbp, setGbp] = useState((sources?.gbp_locations ?? []).join(', '))
  const [gsc, setGsc] = useState(sources?.gsc_property ?? '')
  const [forms, setForms] = useState((sources?.hubspot_form_ids ?? []).join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAds((sources?.google_ads_accounts ?? []).join(', '))
    setGbp((sources?.gbp_locations ?? []).join(', '))
    setGsc(sources?.gsc_property ?? '')
    setForms((sources?.hubspot_form_ids ?? []).join(', '))
  }, [sources])

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/crucible-pro/data-sources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: targetUserId,
          google_ads_accounts: ads.split(/[,\s]+/).filter(Boolean),
          gbp_locations: gbp.split(/[,\s]+/).filter(Boolean),
          gsc_property: gsc,
          hubspot_form_ids: forms.split(/[,\s]+/).filter(Boolean),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      onSaved(json.sources as ClientDataSources)
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Settings2 className="w-4 h-4" /> Data sources <span className="text-xs font-normal text-gray-400">(admin only)</span>
      </button>
      {open && (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Google Ads account IDs" hint="Comma-separated, e.g. 730-975-1048">
            <input value={ads} onChange={(e) => setAds(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Business Profile locations" hint="Comma-separated, e.g. locations/1606…">
            <input value={gbp} onChange={(e) => setGbp(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Search Console property" hint="Saved for later; not shown yet">
            <input value={gsc} onChange={(e) => setGsc(e.target.value)} className={INPUT} />
          </Field>
          <Field label="HubSpot form IDs" hint="Website forms that post to HubSpot; leads are pulled every 5 min">
            <input value={forms} onChange={(e) => setForms(e.target.value)} className={INPUT} />
          </Field>
          <div className="sm:col-span-2">
            <span className="text-xs font-medium text-gray-600">Lead webhook URL</span>
            <p className="mt-1 text-xs text-gray-500 break-all font-mono bg-white border border-gray-200 rounded-lg px-3 py-2">
              {sources?.lead_webhook_token
                ? `https://cruciblecoaching.org/api/webhooks/leads/${sources.lead_webhook_token}`
                : 'Save once to generate this client’s webhook URL.'}
            </p>
            <span className="text-[11px] text-gray-400">
              POST form submissions here (JSON or form data) from the site, GoHighLevel, HubSpot or Zapier.
            </span>
          </div>
          <div className="sm:col-span-3 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
            <span className="text-xs text-gray-400">IDs must match accounts connected in Windsor.ai.</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <div className="mt-1">{children}</div>
      <span className="text-[11px] text-gray-400">{hint}</span>
    </label>
  )
}

function Card({
  title,
  subtitle,
  aside,
  children,
}: {
  title: string
  subtitle?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-[25px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

function Stats({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  )
}

function Notice({ tone, children }: { tone: 'red' | 'gray'; children: React.ReactNode }) {
  const cls =
    tone === 'red' ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-500'
  return <p className={`rounded-2xl border p-4 text-sm ${cls}`}>{children}</p>
}
