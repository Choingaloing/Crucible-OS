// Turn a form submission from any tool (site JS, HubSpot, GoHighLevel, Zapier,
// Webflow...) into a lead row. Field names vary, so match on normalized keys.

export type FlatFields = Record<string, string>

const key = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '')

const NAME = ['name', 'fullname', 'yourname', 'contactname', 'customername']
const FIRST = ['firstname', 'first', 'fname', 'givenname']
const LAST = ['lastname', 'last', 'lname', 'surname', 'familyname']
const EMAIL = ['email', 'emailaddress', 'youremail', 'workemail']
const PHONE = ['phone', 'phonenumber', 'mobilephone', 'mobile', 'tel', 'telephone', 'cell', 'cellphone']
const MESSAGE = [
  'message', 'comments', 'comment', 'notes', 'details', 'projectdetails', 'projectdescription',
  'description', 'howcanwehelp', 'tellusaboutyourproject', 'inquiry', 'question',
]
const PAGE = ['pageurl', 'page', 'url', 'sourceurl', 'hspageurl', 'landingpage', 'pageuri']
const FORM = ['formname', 'form', 'formtitle', 'formid']
const EXTERNAL = ['submissionid', 'externalid', 'eventid', 'leadid']
const SPAM_TRAPS = ['gotcha', 'websitehp', 'honeypot', 'botfield']

// Flatten one level of nesting (GoHighLevel and Zapier wrap fields in objects).
export function flatten(input: unknown): FlatFields {
  const out: FlatFields = {}
  const put = (k: string, v: unknown) => {
    if (v == null || typeof v === 'object') return
    const s = String(v).trim()
    if (s && !(k in out)) out[k] = s.slice(0, 5000)
  }
  if (!input || typeof input !== 'object') return out
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) put(k2, v2)
    } else if (Array.isArray(v)) {
      put(k, v.filter((x) => typeof x !== 'object').join(', '))
    } else {
      put(k, v)
    }
  }
  return out
}

function pick(fields: FlatFields, names: string[]): string | null {
  const byKey = new Map(Object.entries(fields).map(([k, v]) => [key(k), v]))
  for (const n of names) {
    const v = byKey.get(n)
    if (v) return v
  }
  return null
}

export function toLead(fields: FlatFields, fallbackPage: string | null) {
  const first = pick(fields, FIRST)
  const last = pick(fields, LAST)
  const name = pick(fields, NAME) ?? ([first, last].filter(Boolean).join(' ') || null)
  const utm: Record<string, string> = {}
  for (const [k, v] of Object.entries(fields)) if (key(k).startsWith('utm')) utm[k.toLowerCase()] = v
  const spam = SPAM_TRAPS.some((t) => Object.keys(fields).some((k) => key(k) === t && fields[k]))
  return {
    name,
    email: pick(fields, EMAIL)?.toLowerCase() ?? null,
    phone: pick(fields, PHONE),
    message: pick(fields, MESSAGE),
    page_url: pick(fields, PAGE) ?? fallbackPage,
    form_name: pick(fields, FORM),
    external_id: pick(fields, EXTERNAL),
    utm,
    spam,
  }
}
