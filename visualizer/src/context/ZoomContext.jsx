import React, { createContext, useState, useContext, useEffect } from 'react'

const ZoomContext = createContext()

export function ZoomProvider({ children }) {
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Plus or Ctrl+Equals
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        setZoom((prev) => Math.min(prev + 10, 200))
      }
      // Ctrl+Minus
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        setZoom((prev) => Math.max(prev - 10, 50))
      }
      // Ctrl+0 Reset
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        setZoom(100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const contentWrapper = document.getElementById('zoom-content-wrapper')
    if (!contentWrapper) return

    const scale = zoom / 100

    // Use the CSS `zoom` property rather than `transform: scale()`. A transform
    // is paint-only: it never re-runs layout, and `vh` units keep resolving
    // against the unscaled viewport — so panels sized `calc(100vh - 200px)`
    // kept their original height and the page never reflowed. `zoom` performs
    // real layout and rescales `vh`, so every panel reflows with no
    // per-problem CSS. Applied to the wrapper (not documentElement) so the
    // position: fixed panels portaled to document.body stay at native size.
    contentWrapper.style.zoom = scale

    // Zooming changes the layout size of every panel, but a ResizeObserver on
    // a zoomed subtree does not reliably report that on its own. Lumino only
    // re-lays-out its dock when it receives a resize, so poke the observers
    // once the new zoom has been applied.
    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
    })

    return () => {
      cancelAnimationFrame(raf)
      contentWrapper.style.zoom = ''
    }
  }, [zoom])

  return (
    <ZoomContext.Provider value={{ zoom, setZoom }}>
      {children}
    </ZoomContext.Provider>
  )
}

export function useZoomControl() {
  const context = useContext(ZoomContext)
  if (!context) {
    throw new Error('useZoomControl must be used within ZoomProvider')
  }
  return context
}
