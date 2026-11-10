// Crucible Pro client portal: website leads, marketing assets, work log.

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
  spam: 'Spam',
}

export interface ClientLead {
  id: string
  user_id: string
  source: string
  external_id: string | null
  name: string | null
  email: string | null
  phone: string | null
  message: string | null
  page_url: string | null
  form_name: string | null
  utm: Record<string, string>
  fields: Record<string, unknown>
  status: LeadStatus
  notes: string | null
  submitted_at: string
  created_at: string
}

export type AssetVisibility = 'client' | 'internal'

export interface ClientAsset {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  kind: 'link' | 'file'
  url: string | null
  storage_path: string | null
  file_name: string | null
  mime_type: string | null
  size_bytes: number | null
  visibility: AssetVisibility
  sort_order: number
  created_at: string
  // Short-lived signed URL for uploaded files, added by the API.
  download_url?: string | null
}

export interface WorkLogEntry {
  id: string
  user_id: string
  work_date: string
  title: string
  details: string | null
  category: string | null
  link_url: string | null
  created_at: string
}
