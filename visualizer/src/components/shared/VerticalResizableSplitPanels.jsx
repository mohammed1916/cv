import { useEffect, useRef, useState } from 'react'
import './VerticalResizableSplitPanels.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function VerticalResizableSplitPanels({
  top,
  bottom,
  storageKey,
  initialTopPercent = 60,
  minTopPx = 200,
  minBottomPx = 120,
  className = '',
}) {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const [topHeight, setTopHeight] = useState(() => {
    if (!storageKey) return null
    try {
      const stored = Number(window.localStorage.getItem(storageKey))
      if (Number.isFinite(stored)) return stored
    } catch {
      // Ignore localStorage read failures.
    }
    return null
  })

  useEffect(() => {
    if (!storageKey || topHeight === null) return
    try {
      window.localStorage.setItem(storageKey, String(topHeight))
    } catch {
      // Ignore localStorage write failures.
    }
  }, [topHeight, storageKey])

  useEffect(() => {
    const handleMove = (event) => {
      const state = dragRef.current
      if (!state || !rootRef.current) return
      const rect = rootRef.current.getBoundingClientRect()
      const availableHeight = rect.height - state.dividerHeight
      if (availableHeight <= 0) return
      const rawTop = event.clientY - rect.top - state.dividerHeight / 2
      const minTop = minTopPx
      const maxTop = availableHeight - minBottomPx
      const nextTop = clamp(rawTop, minTop, maxTop)
      setTopHeight(nextTop)
    }

    const handleUp = () => {
      if (!dragRef.current) return
      dragRef.current = null
      document.body.classList.remove('rsp-resizing')
      document.body.style.cursor = ''
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [minTopPx, minBottomPx])

  const startResize = (event) => {
    if (!rootRef.current) return
    const dividerHeight = 12
    dragRef.current = { dividerHeight }
    document.body.classList.add('rsp-resizing')
    document.body.style.cursor = 'row-resize'
    event.preventDefault()
  }

  return (
    <div className={`vrsp ${className}`.trim()} ref={rootRef}>
      <section
        className="vrsp-pane vrsp-pane-top"
        style={{
          height: topHeight ? `${topHeight}px` : 'auto',
          minHeight: `${minTopPx}px`,
          flex: topHeight ? '0 0 auto' : '1 1 auto',
        }}
      >
        {top}
      </section>
      <div
        className="vrsp-divider"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize panels"
        onPointerDown={startResize}
      >
        <span className="vrsp-divider-grip" />
      </div>
      <section className="vrsp-pane vrsp-pane-bottom" style={{ minHeight: `${minBottomPx}px` }}>
        {bottom}
      </section>
    </div>
  )
}
