import type { MigoWorkLogEntry } from '@/types/migo'

export const DONE_VISIBLE_DAYS = 30

export function logEntry(by: string, note: string): MigoWorkLogEntry {
  return { at: new Date().toISOString(), by, note }
}

export function appendLog(existing: unknown, entry: MigoWorkLogEntry): MigoWorkLogEntry[] {
  const list = Array.isArray(existing) ? (existing as MigoWorkLogEntry[]) : []
  return [...list, entry].slice(-100)
}

export const isISODate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
