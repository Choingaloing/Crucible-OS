'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ExternalLink, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import {
  CLIENT_STATUS_LABELS,
  type ClientTodo,
  type MigoAssignee,
  type MigoStatus,
} from '@/types/migo'

const POLL_MS = 20_000

const STATUS_STYLES: Partial<Record<MigoStatus, string>> = {
  approved: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-purple-50 text-purple-700',
  in_review: 'bg-orange-50 text-orange-700',
  blocked: 'bg-red-50 text-red-700',
  done: 'bg-green-50 text-green-700',
}

const ADMIN_STATUSES: MigoStatus[] = ['approved', 'in_progress', 'in_review', 'blocked', 'done']

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fmtDue = (iso: string | null) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : null

export function TodosTab({
  targetUserId,
  isAdmin,
  clientName,
  initialTodos,
}: {
  targetUserId: string
  isAdmin: boolean
  clientName: string
  initialTodos: ClientTodo[]
}) {
  const [todos, setTodos] = useState(initialTodos)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(0)

  useEffect(() => setTodos(initialTodos), [initialTodos])

  const refresh = useCallback(async () => {
    if (busy.current > 0) return
    const qs = isAdmin ? `?user_id=${encodeURIComponent(targetUserId)}` : ''
    const res = await fetch(`/api/crucible-pro/todos${qs}`, { cache: 'no-store' })
    if (res.ok && busy.current === 0) setTodos(((await res.json()).todos ?? []) as ClientTodo[])
  }, [isAdmin, targetUserId])

  // Keep both screens in sync during a call.
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, POLL_MS)
    return () => clearInterval(t)
  }, [refresh])

  async function call(url: string, init: RequestInit) {
    busy.current++
    setError(null)
    try {
      const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Update failed')
      return json
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
      return null
    } finally {
      busy.current--
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const prev = todos
    setTodos((curr) => curr.map((t) => (t.id === id ? ({ ...t, ...body } as ClientTodo) : t)))
    const json = await call(`/api/crucible-pro/todos/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
    if (json) setTodos((curr) => curr.map((t) => (t.id === id ? (json.todo as ClientTodo) : t)))
    else setTodos(prev)
  }

  async function add(assignee: MigoAssignee, title: string, due: string) {
    const json = await call('/api/crucible-pro/todos', {
      method: 'POST',
      body: JSON.stringify({ user_id: isAdmin ? targetUserId : undefined, title, assignee, due_date: due || null }),
    })
    if (json) setTodos((curr) => [...curr, json.todo as ClientTodo])
    return !!json
  }

  async function remove(id: string) {
    if (!confirm('Remove this to-do?')) return
    const json = await call(`/api/crucible-pro/todos/${id}`, { method: 'DELETE' })
    if (json) setTodos((curr) => curr.filter((t) => t.id !== id))
  }

  const side = (a: MigoAssignee) => todos.filter((t) => t.assignee === a)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Everything we agreed on, on both sides. {isAdmin ? 'Edits save instantly and sync to Migo.' : 'Check off your items as you finish them.'}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Column
          heading="Crucible is working on"
          items={side('crucible')}
          assignee="crucible"
          isAdmin={isAdmin}
          canAdd={isAdmin}
          canCheck={isAdmin}
          onPatch={patch}
          onAdd={add}
          onRemove={remove}
        />
        <Column
          heading={isAdmin ? `On ${clientName}'s side` : 'On your side'}
          items={side('client')}
          assignee="client"
          isAdmin={isAdmin}
          canAdd
          canCheck
          onPatch={patch}
          onAdd={add}
          onRemove={remove}
        />
      </div>
    </div>
  )
}

function Column({
  heading,
  items,
  assignee,
  isAdmin,
  canAdd,
  canCheck,
  onPatch,
  onAdd,
  onRemove,
}: {
  heading: string
  items: ClientTodo[]
  assignee: MigoAssignee
  isAdmin: boolean
  canAdd: boolean
  canCheck: boolean
  onPatch: (id: string, body: Record<string, unknown>) => void
  onAdd: (assignee: MigoAssignee, title: string, due: string) => Promise<boolean>
  onRemove: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [saving, setSaving] = useState(false)
  const open = items.filter((t) => t.status !== 'done')
  const done = items.filter((t) => t.status === 'done')

  async function submit() {
    if (!title.trim()) return
    setSaving(true)
    if (await onAdd(assignee, title.trim(), due)) {
      setTitle('')
      setDue('')
    }
    setSaving(false)
  }

  return (
    <section className="bg-white border border-gray-200 rounded-[25px] p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {heading} <span className="text-sm font-normal text-gray-400">{open.length}</span>
      </h2>

      {open.length === 0 && <p className="mt-3 text-sm text-gray-500">Nothing open right now.</p>}
      <ul className="mt-3 space-y-2">
        {open.map((t) => (
          <TodoRow key={t.id} todo={t} isAdmin={isAdmin} canCheck={canCheck} onPatch={onPatch} onRemove={onRemove} />
        ))}
      </ul>

      {canAdd && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Add a to-do…"
            className="flex-1 min-w-[10rem] text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="text-sm px-2 py-2 rounded-lg border border-gray-200"
            aria-label="Due date"
          />
          <button
            onClick={submit}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      )}

      {done.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer">Done in the last 30 days ({done.length})</summary>
          <ul className="mt-2 space-y-2">
            {done.map((t) => (
              <TodoRow key={t.id} todo={t} isAdmin={isAdmin} canCheck={canCheck} onPatch={onPatch} onRemove={onRemove} />
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

function TodoRow({
  todo,
  isAdmin,
  canCheck,
  onPatch,
  onRemove,
}: {
  todo: ClientTodo
  isAdmin: boolean
  canCheck: boolean
  onPatch: (id: string, body: Record<string, unknown>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const isDone = todo.status === 'done'
  const overdue = !isDone && !!todo.due_date && todo.due_date < todayISO()

  useEffect(() => setTitle(todo.title), [todo.title])

  function saveTitle() {
    setEditing(false)
    if (title.trim() && title.trim() !== todo.title) onPatch(todo.id, { title: title.trim() })
    else setTitle(todo.title)
  }

  return (
    <li className={`rounded-xl border px-3 py-2.5 flex items-start gap-3 ${overdue ? 'border-red-200 bg-red-50/40' : 'border-gray-100'} ${!todo.client_visible ? 'opacity-60' : ''}`}>
      <button
        disabled={!canCheck}
        onClick={() => onPatch(todo.id, { status: isDone ? 'approved' : 'done' })}
        className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${
          isDone ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 bg-white'
        } ${canCheck ? 'hover:border-green-600' : 'cursor-default'}`}
        aria-label={isDone ? 'Mark not done' : 'Mark done'}
      >
        {isDone && <Check className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 min-w-0">
        {isAdmin && editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle()
              if (e.key === 'Escape') {
                setTitle(todo.title)
                setEditing(false)
              }
            }}
            className="w-full text-sm px-2 py-1 rounded border border-gray-200"
          />
        ) : (
          <p
            onClick={() => isAdmin && setEditing(true)}
            className={`text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-900'} ${isAdmin ? 'cursor-text' : ''}`}
          >
            {todo.title}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {isAdmin ? (
            <>
              <select
                value={todo.status}
                onChange={(e) => onPatch(todo.id, { status: e.target.value })}
                className={`rounded-full px-2 py-0.5 border-0 ${STATUS_STYLES[todo.status] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {ADMIN_STATUSES.map((s) => (
                  <option key={s} value={s}>{CLIENT_STATUS_LABELS[s]}</option>
                ))}
              </select>
              <input
                type="date"
                value={todo.due_date ?? ''}
                onChange={(e) => onPatch(todo.id, { due_date: e.target.value || null })}
                className={`rounded px-1 py-0.5 border border-gray-200 ${overdue ? 'text-red-600' : 'text-gray-500'}`}
              />
              <select
                value={todo.assignee}
                onChange={(e) => onPatch(todo.id, { assignee: e.target.value })}
                className="rounded px-1 py-0.5 border border-gray-200 text-gray-500"
                aria-label="Owner"
              >
                <option value="crucible">Crucible</option>
                <option value="client">Client</option>
              </select>
            </>
          ) : (
            <>
              <span className={`rounded-full px-2 py-0.5 ${STATUS_STYLES[todo.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {CLIENT_STATUS_LABELS[todo.status] ?? todo.status}
              </span>
              {todo.due_date && (
                <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                  {overdue ? 'Overdue · ' : 'Due '}
                  {fmtDue(todo.due_date)}
                </span>
              )}
            </>
          )}
          {todo.deliverable_url && (
            <a href={todo.deliverable_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-orange">
              Open <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 shrink-0 text-gray-400">
          <button
            onClick={() => onPatch(todo.id, { client_visible: !todo.client_visible })}
            title={todo.client_visible ? 'Visible to client (click to hide)' : 'Hidden from client (click to show)'}
            className="hover:text-gray-700"
          >
            {todo.client_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={() => onRemove(todo.id)} title="Remove" className="hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </li>
  )
}
