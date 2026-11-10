import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { ASSETS_BUCKET, serviceDb } from '@/lib/crucible-pro/db'

// POST { user_id, file_name } (admin) → a one-time signed upload URL. The browser
// uploads straight to Supabase Storage, so large files never pass through Vercel.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const name = String(body.file_name ?? 'file')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-120) || 'file'
  const path = `${res.ctx.targetUserId}/${crypto.randomUUID()}-${name}`

  const db = await serviceDb()
  const { data, error } = await db.storage.from(ASSETS_BUCKET).createSignedUploadUrl(path)
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Could not start upload' }, { status: 500 })
  return NextResponse.json({ path: data.path, token: data.token })
}
