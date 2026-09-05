/** Format helpers shared by the public signing page and the billing tab. */

/** Parse a YYYY-MM-DD string as a local date (avoids UTC off-by-one). */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** "September 4, 2026" */
export function formatLongDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = value.length <= 10 ? parseDateOnly(value) : new Date(value)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/** "$2,500" */
export function formatFee(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n)
}

/** Today's date as YYYY-MM-DD in the browser's local timezone. */
export function todayISO(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/* ---- URL helpers (client-safe) ---- */

export function agreementPublicPath(slug: string) {
  return `/agreements/${slug}`
}

export function agreementPublicUrl(slug: string) {
  // Always the public domain so links shared with clients are branded.
  const base = (process.env.NEXT_PUBLIC_AGREEMENTS_BASE_URL || 'https://cruciblecoaching.org').replace(/\/$/, '')
  return `${base}${agreementPublicPath(slug)}`
}

/** "elite-lighting-designs" from "Elite Lighting Designs Inc." */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
