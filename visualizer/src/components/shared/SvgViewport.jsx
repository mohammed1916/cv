import { useCallback, useEffect, useRef, useState } from 'react'
import './SvgViewport.css'

/**
 * Pan/zoom wrapper for an inline SVG diagram inside a Lumino dock panel.
 *
 * Transform is applied to the viewBox rather than a CSS transform so stroke
 * widths and font sizes stay constant while zooming (a scaled <g> would make
 * edges hairline-thin when zoomed out and chunky when zoomed in).
 *
 * Lumino compatibility:
 *  - Buttons are the primary control and always work.
 *  - Wheel zoom only fires with the pointer over the canvas, and calls
 *    preventDefault so the surrounding `overflow: auto` panel doesn't scroll.
 *    It's registered natively (not via React's onWheel) because React attaches
 *    wheel listeners as passive, where preventDefault is ignored.
 *  - Drag-to-pan listens on the canvas only and stops propagation, so it never
 *    reaches Lumino's tab-bar drag handling that initiates panel docking.
 *
 * @param {number} width  - viewBox width in user units
 * @param {number} height - viewBox height in user units
 */
export default function SvgViewport({
  width = 400,
  height = 300,
  minScale = 0.4,
  maxScale = 4,
  className = '',
  children,
}) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  // Mirrored in state purely so the grabbing cursor re-renders; the ref holds
  // the live pointer position without causing a render per pointermove.
  const [isDragging, setIsDragging] = useState(false)
  const hostRef = useRef(null)
  const dragRef = useRef(null)

  const clampScale = useCallback(
    (s) => Math.min(maxScale, Math.max(minScale, s)),
    [minScale, maxScale],
  )

  const zoomBy = useCallback(
    (factor) => setScale((s) => clampScale(s * factor)),
    [clampScale],
  )

  const reset = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const panBy = useCallback(
    (dx, dy) => {
      // Pan in user units, scaled so a click moves the same visual distance
      // regardless of zoom level.
      setOffset((o) => ({ x: o.x + dx / scale, y: o.y + dy / scale }))
    },
    [scale],
  )

  // Native non-passive wheel listener: React's onWheel is passive, so
  // preventDefault there would be ignored and the dock panel would scroll.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const onWheel = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setScale((s) => clampScale(s * (e.deltaY < 0 ? 1.12 : 1 / 1.12)))
    }

    host.addEventListener('wheel', onWheel, { passive: false })
    return () => host.removeEventListener('wheel', onWheel)
  }, [clampScale])

  const onPointerDown = (e) => {
    // Left button only; keeps right-click/context menu and Lumino's own
    // middle-click behaviour untouched.
    if (e.button !== 0) return
    e.stopPropagation()
    dragRef.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    const start = dragRef.current
    if (!start) return
    e.stopPropagation()
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    dragRef.current = { x: e.clientX, y: e.clientY }
    // Dragging right should move content right, i.e. shift the viewBox left.
    setOffset((o) => ({ x: o.x - dx / scale, y: o.y - dy / scale }))
  }

  const endDrag = (e) => {
    if (!dragRef.current) return
    dragRef.current = null
    setIsDragging(false)
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  // Zoom about the centre: shrink the viewBox around its midpoint.
  const vbW = width / scale
  const vbH = height / scale
  const vbX = offset.x + (width - vbW) / 2
  const vbY = offset.y + (height - vbH) / 2

  const PAN_STEP = 40

  return (
    <div className={`svg-viewport ${className}`}>
      <div className="svg-viewport-toolbar">
        <div className="svg-viewport-group">
          <button type="button" className="svg-viewport-btn" onClick={() => zoomBy(1.25)} title="Zoom in" aria-label="Zoom in">+</button>
          <button type="button" className="svg-viewport-btn" onClick={() => zoomBy(1 / 1.25)} title="Zoom out" aria-label="Zoom out">−</button>
          <span className="svg-viewport-scale mono">{Math.round(scale * 100)}%</span>
        </div>
        <div className="svg-viewport-group">
          <button type="button" className="svg-viewport-btn" onClick={() => panBy(PAN_STEP, 0)} title="Pan left" aria-label="Pan left">←</button>
          <button type="button" className="svg-viewport-btn" onClick={() => panBy(0, PAN_STEP)} title="Pan up" aria-label="Pan up">↑</button>
          <button type="button" className="svg-viewport-btn" onClick={() => panBy(0, -PAN_STEP)} title="Pan down" aria-label="Pan down">↓</button>
          <button type="button" className="svg-viewport-btn" onClick={() => panBy(-PAN_STEP, 0)} title="Pan right" aria-label="Pan right">→</button>
        </div>
        <button type="button" className="svg-viewport-btn wide" onClick={reset} title="Reset view" aria-label="Reset view">Reset</button>
      </div>

      <div
        ref={hostRef}
        className={`svg-viewport-canvas ${isDragging ? 'dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <svg
          className="svg-viewport-svg"
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {children}
        </svg>
      </div>
    </div>
  )
}
