import { NextResponse } from 'next/server'
import { resolveContext } from '@/lib/crucible-pro/auth'
import { ASSETS_BUCKET, clean, serviceDb } from '@/lib/crucible-pro/db'
import type { ClientAsset } from '@/types/clientPortal'

export const dynamic = 'force-dynamic'

const SIGNED_URL_SECONDS = 60 * 60

// Attach short-lived download URLs to uploaded files.
async function withDownloadUrls(db: Awaited<ReturnType<typeof serviceDb>>, rows: ClientAsset[]) {
  const paths = rows.filter((r) => r.kind === 'file' && r.storage_path).map((r) => r.storage_path as string)
  if (!paths.length) return rows
  const { data } = await db.storage.from(ASSETS_BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)
  const byPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]))
  return rows.map((r) => (r.storage_path ? { ...r, download_url: byPath.get(r.storage_path) ?? null } : r))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const res = await resolveContext(url.searchParams.get('user_id'))
  if (!res.ok) return res.response
  const { targetUserId, isAdmin } = res.ctx

  const db = await serviceDb()
  let query = db
    .from('client_assets')
    .select('*')
    .eq('user_id', targetUserId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (!isAdmin) query = query.eq('visibility', 'client')
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ assets: await withDownloadUrls(db, (data ?? []) as ClientAsset[]) })
}

// POST (admin): a link { kind:'link', url } or an uploaded file { kind:'file', storage_path, file_name, mime_type, size_bytes }
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const res = await resolveContext(body.user_id)
  if (!res.ok) return res.response
  if (!res.ctx.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { targetUserId } = res.ctx

  const kind = body.kind === 'file' ? 'file' : 'link'
  const title = clean(body.title, 200) ?? clean(body.file_name, 200)
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const row: Record<string, unknown> = {
    user_id: targetUserId,
    title,
    description: clean(body.description, 2000),
    category: clean(body.category, 80),
    kind,
    visibility: body.visibility === 'internal' ? 'internal' : 'client',
  }
  if (kind === 'link') {
    const link = clean(body.url, 2000)
    if (!link || !/^https?:\/\//i.test(link)) return NextResponse.json({ error: 'A full https:// link is required' }, { status: 400 })
    row.url = link
  } else {
    const path = clean(body.storage_path, 500)
    // Uploads are always written under the client's own folder by upload-url.
    if (!path || !path.startsWith(`${targetUserId}/`)) return NextResponse.json({ error: 'Invalid upload' }, { status: 400 })
    row.storage_path = path
    row.file_name = clean(body.file_name, 300)
    row.mime_type = clean(body.mime_type, 200)
    row.size_bytes = Number.isFinite(Number(body.size_bytes)) ? Number(body.size_bytes) : null
  }

  const db = await serviceDb()
  const { data, error } = await db.from('client_assets').insert(row).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const [asset] = await withDownloadUrls(db, [data as ClientAsset])
  return NextResponse.json({ asset }, { status: 201 })
}
