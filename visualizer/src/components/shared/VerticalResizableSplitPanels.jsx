import { useEffect, useRef, useState } from 'react'
import './VerticalResizableSplitPanels.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function VerticalResizableSplitPanels({
  top,
  bottom,
  storageKey,
  initialTopHeight = 400,
  minTopPx = 150,
  minBottomPx = 100,
  className = '',
}) {
  const rootRef = useRef(null)
  const dragRef = useRef(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(initialTopHeight)
  const [topHeight, setTopHeight] = useState(() => {
    if (!storageKey) return initialTopHeight
    try {
      const stored = Number(window.localStorage.getItem(storageKey))
      if (Number.isFinite(stored) && stored > minTopPx) return stored
    } catch {
      // Ignore localStorage read failures.
    }
    return initialTopHeight
  })
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (!storageKey) return
    try {
      window.localStorage.setItem(storageKey, String(topHeight))
    } catch {
      // Ignore localStorage write failures.
    }
  }, [topHeight, storageKey])

  useEffect(() => {
    const handleMove = (event) => {
      if (!dragRef.current || !rootRef.current) return
      const rect = rootRef.current.getBoundingClientRect()
      const deltaY = event.clientY - startYRef.current
      const newHeight = clamp(
        startHeightRef.current + deltaY,
        minTopPx,
        rect.height - minBottomPx - 12
      )
      setTopHeight(newHeight)
    }

    const handleUp = () => {
      if (!dragRef.current) return
      dragRef.current = false
      setIsResizing(false)
      document.body.classList.remove('vrsp-resizing')
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }

    if (dragRef.current) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [minTopPx, minBottomPx])

  const startResize = (event) => {
    if (!rootRef.current) return
    dragRef.current = true
    startYRef.current = event.clientY
    startHeightRef.current = topHeight
    setIsResizing(true)
    document.body.classList.add('vrsp-resizing')
    document.body.style.cursor = 'row-resize'
    event.preventDefault()
  }

  return (
    <div className={`vrsp ${className}`.trim()} ref={rootRef}>
      <section
        className="vrsp-pane vrsp-pane-top"
        style={{
          height: `${topHeight}px`,
          flex: '0 0 auto',
          minHeight: `${minTopPx}px`,
          overflow: 'auto',
        }}
      >
        {top}
      </section>

      <div
        className={`vrsp-divider ${isResizing ? 'active' : ''}`}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize panels"
        onMouseDown={startResize}
        onTouchStart={startResize}
      >
        <span className="vrsp-divider-grip" />
      </div>

      <section
        className="vrsp-pane vrsp-pane-bottom"
        style={{
          flex: '1 1 auto',
          minHeight: `${minBottomPx}px`,
          overflow: 'auto',
        }}
      >
        {bottom}
      </section>
    </div>
  )
}
