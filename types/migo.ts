// Migo HQ — Chandler's master-agent command layer (tables migo_debriefs + migo_dispatch).
// Migo runs Crucible + personal; Moldy runs Mold Launch and reports up to Migo.

export const MIGO_BUSINESSES = ['crucible', 'mold_launch', 'personal'] as const
export type MigoBusiness = (typeof MIGO_BUSINESSES)[number]

export const MIGO_DESTINATIONS = ['crucible_clients', 'bos_app', 'mold_launch', 'migo', 'personal'] as const
export type MigoDestination = (typeof MIGO_DESTINATIONS)[number]

export const MIGO_DESTINATION_LABELS: Record<MigoDestination, string> = {
  crucible_clients: 'Crucible Clients',
  bos_app: 'BOS App',
  mold_launch: 'Mold Launch (Moldy)',
  migo: 'Migo',
  personal: 'Personal',
}

export const MIGO_STATUSES = [
  'proposed',
  'approved',
  'in_progress',
  'in_review',
  'done',
  'blocked',
  'cancelled',
] as const
export type MigoStatus = (typeof MIGO_STATUSES)[number]

export const MIGO_STATUS_LABELS: Record<MigoStatus, string> = {
  proposed: 'Needs approval',
  approved: 'Approved',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
}

export const MIGO_OPEN_STATUSES: MigoStatus[] = ['approved', 'in_progress', 'in_review', 'blocked']

export type MigoPriority = 'p1' | 'p2' | 'p3'

export type MigoDebriefStatus = 'awaiting_approval' | 'approved' | 'rejected' | 'dispatched'

export interface MigoWorkLogEntry {
  at: string
  by: string
  note: string
}

export interface MigoDispatch {
  id: string
  debrief_id: string | null
  business: MigoBusiness
  destination: MigoDestination
  owner_agent: string
  client_id: string | null
  client_name: string | null
  title: string
  scope: string | null
  acceptance_criteria: string | null
  promised_to: string | null
  source_quote: string | null
  due_date: string | null
  priority: MigoPriority
  status: MigoStatus
  blocked_reason: string | null
  deliverable_url: string | null
  work_log: MigoWorkLogEntry[]
  last_touched_by: string | null
  approved_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface MigoDebrief {
  id: string
  fathom_recording_id: string | null
  fathom_url: string | null
  title: string
  call_date: string | null
  business: MigoBusiness
  client_id: string | null
  client_name: string | null
  attendees: string[]
  summary: string | null
  decisions: string | null
  open_questions: string | null
  follow_up_email_draft: string | null
  status: MigoDebriefStatus
  approved_at: string | null
  created_by_agent: string
  created_at: string
  updated_at: string
}
