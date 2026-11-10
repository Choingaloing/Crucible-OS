'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, ExternalLink, FileText, Link2, Loader2, Lock, Pencil, Trash2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { AssetVisibility, ClientAsset } from '@/types/clientPortal'

const BUCKET = 'client-assets'
const INPUT =
  'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30'

const size = (b: number | null) =>
  b == null ? '' : b > 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`
const titleFromFile = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()

export function AssetsTab({ targetUserId, isAdmin }: { targetUserId: string; isAdmin: boolean }) {
  const [assets, setAssets] = useState<ClientAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<AssetVisibility>('client')
  const [category, setCategory] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = isAdmin ? `?user_id=${encodeURIComponent(targetUserId)}` : ''
      const res = await fetch(`/api/crucible-pro/assets${qs}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load assets')
      setAssets(json.assets as ClientAsset[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, targetUserId])

  useEffect(() => {
    load()
  }, [load])

  async function post(body: Record<string, unknown>) {
    const res = await fetch('/api/crucible-pro/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: targetUserId, ...body }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Save failed')
    setAssets((curr) => [json.asset as ClientAsset, ...curr])
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)
    const supabase = createClient()
    for (const file of Array.from(files)) {
      setUploading(file.name)
      try {
        const res = await fetch('/api/crucible-pro/assets/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: targetUserId, file_name: file.name }),
        })
        const signed = await res.json()
        if (!res.ok) throw new Error(signed.error ?? 'Could not start upload')
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || undefined })
        if (upErr) throw new Error(upErr.message)
        await post({
          kind: 'file',
          title: titleFromFile(file.name),
          storage_path: signed.path,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
          category: category || null,
          visibility,
        })
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : 'upload failed'}`)
      }
    }
    setUploading(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function patch(id: string, body: Partial<ClientAsset>) {
    const res = await fetch(`/api/crucible-pro/assets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Update failed')
      return false
    }
    setAssets((curr) => curr.map((a) => (a.id === id ? { ...a, ...(json.asset as ClientAsset), download_url: a.download_url } : a)))
    return true
  }

  async function remove(id: string) {
    if (!confirm('Delete this asset? Uploaded files are removed permanently.')) return
    const res = await fetch(`/api/crucible-pro/assets/${id}`, { method: 'DELETE' })
    if (res.ok) setAssets((curr) => curr.filter((a) => a.id !== id))
  }

  const shared = assets.filter((a) => a.visibility === 'client')
  const internal = assets.filter((a) => a.visibility === 'internal')

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        {isAdmin
          ? 'Files and links for this client. Internal items are only visible to Crucible.'
          : 'Your marketing materials: designs, print files, brand assets and links.'}
      </p>

      {isAdmin && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fileInput.current?.click()}
              disabled={!!uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? `Uploading ${uploading}…` : 'Upload files'}
            </button>
            <button
              onClick={() => setLinkOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700"
            >
              <Link2 className="w-4 h-4" /> Add link
            </button>
            <input
              ref={fileInput}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => uploadFiles(e.target.files)}
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white w-44"
            />
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as AssetVisibility)}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
            >
              <option value="client">Share with client</option>
              <option value="internal">Internal only</option>
            </select>
          </div>
          {linkOpen && (
            <LinkForm
              onSave={async (title, url, description) => {
                try {
                  await post({ kind: 'link', title, url, description, category: category || null, visibility })
                  setLinkOpen(false)
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Save failed')
                }
              }}
            />
          )}
          <p className="text-[11px] text-gray-400">Up to 50 MB per file. You can select several files at once.</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      ) : (
        <>
          <AssetGrid
            title={isAdmin ? 'Shared with client' : null}
            assets={shared}
            isAdmin={isAdmin}
            empty={isAdmin ? 'Nothing shared yet.' : 'No marketing assets yet.'}
            onPatch={patch}
            onRemove={remove}
          />
          {isAdmin && (
            <AssetGrid
              title="Internal only"
              assets={internal}
              isAdmin
              empty="No internal documents."
              onPatch={patch}
              onRemove={remove}
            />
          )}
        </>
      )}
    </div>
  )
}

function LinkForm({ onSave }: { onSave: (title: string, url: string, description: string) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={INPUT} />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={INPUT} />
      <button
        onClick={() => onSave(title.trim(), url.trim(), description.trim())}
        disabled={!title.trim() || !url.trim()}
        className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
      >
        Save link
      </button>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className={`${INPUT} sm:col-span-3`}
      />
    </div>
  )
}

function AssetGrid({
  title,
  assets,
  isAdmin,
  empty,
  onPatch,
  onRemove,
}: {
  title: string | null
  assets: ClientAsset[]
  isAdmin: boolean
  empty: string
  onPatch: (id: string, body: Partial<ClientAsset>) => Promise<boolean>
  onRemove: (id: string) => void
}) {
  return (
    <section>
      {title && (
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          {title} <span className="font-normal text-gray-400">{assets.length}</span>
        </h2>
      )}
      {assets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">{empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} isAdmin={isAdmin} onPatch={onPatch} onRemove={onRemove} />
          ))}
        </div>
      )}
    </section>
  )
}

function AssetCard({
  asset,
  isAdmin,
  onPatch,
  onRemove,
}: {
  asset: ClientAsset
  isAdmin: boolean
  onPatch: (id: string, body: Partial<ClientAsset>) => Promise<boolean>
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(asset.title)
  const [description, setDescription] = useState(asset.description ?? '')
  const [category, setCategory] = useState(asset.category ?? '')
  const href = asset.kind === 'file' ? asset.download_url : asset.url
  const isImage = asset.kind === 'file' && !!asset.mime_type?.startsWith('image/') && !!asset.download_url

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col">
      <a href={href ?? undefined} target="_blank" rel="noreferrer" className="block bg-gray-50 h-36">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.download_url!} alt="" className="w-full h-36 object-cover" />
        ) : (
          <div className="h-36 flex items-center justify-center text-gray-300">
            {asset.kind === 'link' ? <Link2 className="w-10 h-10" /> : <FileText className="w-10 h-10" />}
          </div>
        )}
      </a>
      <div className="p-4 flex-1 flex flex-col">
        {editing ? (
          <div className="space-y-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className={INPUT} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description" className={INPUT} />
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (await onPatch(asset.id, { title, category: category || null, description: description || null })) setEditing(false)
                }}
                className="px-3 py-1.5 rounded-full bg-brand-orange text-white text-xs font-semibold"
              >
                Save
              </button>
              <button onClick={() => setEditing(false)} className="text-xs text-gray-500">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">{asset.title}</p>
              {asset.visibility === 'internal' && <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" aria-label="Internal" />}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {[asset.category, asset.kind === 'file' ? size(asset.size_bytes) : 'Link'].filter(Boolean).join(' · ')}
            </p>
            {asset.description && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{asset.description}</p>}
          </>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              download={asset.kind === 'file' ? asset.file_name ?? true : undefined}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-orange"
            >
              {asset.kind === 'file' ? (
                <>
                  <Download className="w-3.5 h-3.5" /> Download
                </>
              ) : (
                <>
                  Open <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </a>
          ) : (
            <span />
          )}
          {isAdmin && !editing && (
            <div className="flex items-center gap-2 text-gray-400">
              <button
                onClick={() => onPatch(asset.id, { visibility: asset.visibility === 'client' ? 'internal' : 'client' })}
                className="text-[11px] hover:text-gray-700"
              >
                {asset.visibility === 'client' ? 'Make internal' : 'Share'}
              </button>
              <button onClick={() => setEditing(true)} className="hover:text-gray-700" title="Edit">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onRemove(asset.id)} className="hover:text-red-500" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
