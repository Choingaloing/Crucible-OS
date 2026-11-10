import { flatten, toLead } from '@/lib/leads/normalize'
import type { SupabaseClient } from '@supabase/supabase-js'

// Pull recent submissions for a client's HubSpot forms into client_leads.
// Needs HUBSPOT_ACCESS_TOKEN (a HubSpot private app token with the "forms" scope).
const API = 'https://api.hubapi.com/form-integrations/v1/submissions/forms'

type Submission = { submittedAt: number; pageUrl?: string; values?: { name: string; value: string }[] }

export async function syncHubspotLeads(db: SupabaseClient, userId: string, formIds: string[]) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN
  if (!token) return { synced: 0, error: 'HUBSPOT_ACCESS_TOKEN is not set' }

  let synced = 0
  for (const formId of formIds) {
    let after: string | undefined
    for (let page = 0; page < 4; page++) {
      const qs = new URLSearchParams({ limit: '50' })
      if (after) qs.set('after', after)
      const res = await fetch(`${API}/${encodeURIComponent(formId)}?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) return { synced, error: `HubSpot ${res.status} for form ${formId}` }
      const body = (await res.json()) as { results?: Submission[]; paging?: { next?: { after?: string } } }
      const rows = (body.results ?? []).map((s) => {
        const fields = flatten(Object.fromEntries((s.values ?? []).map((v) => [v.name, v.value])))
        const lead = toLead(fields, s.pageUrl ?? null)
        return {
          user_id: userId,
          source: 'hubspot',
          external_id: `${formId}:${s.submittedAt}:${lead.email ?? lead.phone ?? ''}`,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          message: lead.message,
          page_url: lead.page_url,
          form_name: lead.form_name,
          utm: lead.utm,
          fields,
          status: lead.spam ? 'spam' : 'new',
          submitted_at: new Date(s.submittedAt).toISOString(),
        }
      })
      if (rows.length) {
        const { error } = await db
          .from('client_leads')
          .upsert(rows, { onConflict: 'user_id,source,external_id', ignoreDuplicates: true })
        if (error) return { synced, error: error.message }
        synced += rows.length
      }
      after = body.paging?.next?.after
      if (!after) break
    }
  }
  return { synced, error: null }
}
