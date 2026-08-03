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
    if (contentWrapper) {
      contentWrapper.style.transform = `scale(${zoom / 100})`
      contentWrapper.style.transformOrigin = 'top left'
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
