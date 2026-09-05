'use client'

import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'
import { Eraser, PenLine, Type } from 'lucide-react'

export type SignatureResult = { dataUrl: string; type: 'drawn' | 'typed' }

export type SignaturePadHandle = {
  /** Returns the current signature as a PNG data URL, or null if empty. */
  getSignature: () => SignatureResult | null
  clear: () => void
}

type Props = {
  /** Used as the default text for the "type it" mode. */
  defaultTypedName?: string
  /** CSS font-family string for the typed signature. */
  scriptFont: string
  onChange?: (hasSignature: boolean) => void
}

const CANVAS_W = 640
const CANVAS_H = 180

/**
 * Lightweight DocuSign-style signature capture. Two modes:
 *  - Draw: pointer events on a canvas (mouse, touch, pen)
 *  - Type: renders the typed name in a script font onto the same canvas
 * Either way `getSignature()` returns a PNG so downstream storage is uniform.
 */
export const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  { defaultTypedName = '', scriptFont, onChange },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [mode, setMode] = useState<'draw' | 'type'>('draw')
  const [typed, setTyped] = useState(defaultTypedName)
  const [hasInk, setHasInk] = useState(false)

  const notify = useCallback(
    (v: boolean) => {
      setHasInk(v)
      onChange?.(v)
    },
    [onChange],
  )

  const clearCanvas = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
  }, [])

  const renderTyped = useCallback(
    async (text: string) => {
      const c = canvasRef.current
      if (!c) return
      const ctx = c.getContext('2d')
      if (!ctx) return
      clearCanvas()
      const t = text.trim()
      if (!t) {
        notify(false)
        return
      }
      try {
        await document.fonts.load(`64px ${scriptFont}`)
      } catch {
        /* fall through with fallback font */
      }
      let size = 72
      ctx.font = `${size}px ${scriptFont}`
      while (ctx.measureText(t).width > c.width - 48 && size > 24) {
        size -= 4
        ctx.font = `${size}px ${scriptFont}`
      }
      ctx.fillStyle = '#1a1a1a'
      ctx.textBaseline = 'middle'
      ctx.fillText(t, 24, c.height / 2 + 4)
      notify(true)
    },
    [clearCanvas, notify, scriptFont],
  )

  useEffect(() => {
    if (mode === 'type') void renderTyped(typed)
  }, [mode, typed, renderTyped])

  useImperativeHandle(
    ref,
    () => ({
      getSignature: () => {
        const c = canvasRef.current
        if (!c || !hasInk) return null
        return { dataUrl: c.toDataURL('image/png'), type: mode === 'draw' ? 'drawn' : 'typed' }
      },
      clear: () => {
        clearCanvas()
        notify(false)
        if (mode === 'type') setTyped('')
      },
    }),
    [clearCanvas, hasInk, mode, notify],
  )

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * c.width,
      y: ((e.clientY - rect.top) / rect.height) * c.height,
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (mode !== 'draw') return
    e.preventDefault()
    const c = canvasRef.current!
    c.setPointerCapture(e.pointerId)
    drawing.current = true
    const p = getPoint(e)
    lastPoint.current = p
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2)
    ctx.fill()
    notify(true)
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (mode !== 'draw' || !drawing.current) return
    e.preventDefault()
    const c = canvasRef.current!
    const ctx = c.getContext('2d')!
    const p = getPoint(e)
    const last = lastPoint.current ?? p
    // Pressure-ish variable width: faster strokes are thinner
    const dist = Math.hypot(p.x - last.x, p.y - last.y)
    const width = Math.max(1.4, 3.4 - dist / 12)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lastPoint.current = p
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (mode !== 'draw') return
    drawing.current = false
    lastPoint.current = null
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  function switchMode(next: 'draw' | 'type') {
    if (next === mode) return
    clearCanvas()
    notify(false)
    setMode(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-full bg-[#F1E8DC] p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => switchMode('draw')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
              mode === 'draw' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500'
            }`}
          >
            <PenLine className="w-3 h-3" /> Draw
          </button>
          <button
            type="button"
            onClick={() => switchMode('type')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
              mode === 'type' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500'
            }`}
          >
            <Type className="w-3 h-3" /> Type
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            clearCanvas()
            notify(false)
            if (mode === 'type') setTyped('')
          }}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-brand-orange-dark"
        >
          <Eraser className="w-3 h-3" /> Clear
        </button>
      </div>

      {mode === 'type' && (
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type your full name"
          className="w-full text-sm px-3 py-2 rounded-lg border border-[#C9B8A6] bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
        />
      )}

      <div className="relative rounded-xl border-2 border-dashed border-[#C9B8A6] bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          className={`block w-full h-auto select-none ${mode === 'draw' ? 'cursor-crosshair' : ''}`}
          style={{ touchAction: 'none', aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
          aria-label="Signature pad"
        />
        {!hasInk && mode === 'draw' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Sign here
          </div>
        )}
        <div className="pointer-events-none absolute left-6 right-6 bottom-8 border-b border-[#C9B8A6]/70" />
        <div className="pointer-events-none absolute left-6 bottom-9 text-brand-orange text-lg font-black">
          ×
        </div>
      </div>
    </div>
  )
})
