// Server-only Windsor.ai REST client. Windsor holds the Google Ads, Google Business
// Profile and Search Console connections for every client; we pull all connected
// accounts and filter to the requesting client's accounts on the server.

const BASE = 'https://connectors.windsor.ai'
const REVALIDATE_SECONDS = 600

export type WindsorRow = Record<string, string | number | null>

export class WindsorError extends Error {}

export async function windsorRows(
  connector: string,
  fields: string[],
  dates: { from: string; to: string },
): Promise<WindsorRow[]> {
  const key = process.env.WINDSOR_API_KEY
  if (!key) throw new WindsorError('WINDSOR_API_KEY is not set')

  const params = new URLSearchParams({
    api_key: key,
    date_from: dates.from,
    date_to: dates.to,
    fields: fields.join(','),
  })
  const res = await fetch(`${BASE}/${connector}?${params.toString()}`, {
    headers: { accept: 'application/json' },
    next: { revalidate: REVALIDATE_SECONDS },
  })
  const text = await res.text()
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    throw new WindsorError(`Windsor returned a non-JSON response (${res.status})`)
  }
  const obj = body as { data?: unknown; error?: unknown; message?: unknown }
  if (!res.ok || obj.error) {
    const msg = String(obj.error ?? obj.message ?? `HTTP ${res.status}`)
    throw new WindsorError(msg.slice(0, 300))
  }
  const rows = Array.isArray(obj.data) ? obj.data : Array.isArray(body) ? body : []
  return rows as WindsorRow[]
}

const norm = (s: unknown) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

// Windsor formats account ids inconsistently (dashes, "locations/" prefixes), so
// compare normalized ids and allow a long-suffix match.
export function sameAccount(rowId: unknown, want: string) {
  const a = norm(rowId)
  const b = norm(want)
  if (!a || !b) return false
  return a === b || (a.length >= 8 && b.endsWith(a)) || (b.length >= 8 && a.endsWith(b))
}

export const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10)
}

// Date ranges are computed in US Central, where the current clients operate.
export function rangeDates(range: string): { from: string; to: string } {
  const local = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  const to = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()))
  let from: Date
  if (range === 'mtd') {
    from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1))
  } else {
    const days = ({ '7': 7, '30': 30, '90': 90 } as Record<string, number>)[range] ?? 30
    from = new Date(to.getTime() - (days - 1) * 86_400_000)
  }
  return { from: ymd(from), to: ymd(to) }
}

// A fixed lookback ending today, used for content lists (reviews, posts, photos)
// that should not shrink with the metrics range.
export function daysBack(days: number): { from: string; to: string } {
  const { to } = rangeDates('7')
  const from = new Date(new Date(`${to}T00:00:00Z`).getTime() - (days - 1) * 86_400_000)
  return { from: ymd(from), to }
}
