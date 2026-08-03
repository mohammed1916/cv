import { useState, useEffect } from 'react'

export function useGlobalZoom() {
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
    document.documentElement.style.zoom = `${zoom}%`
  }, [zoom])

  return zoom
}
