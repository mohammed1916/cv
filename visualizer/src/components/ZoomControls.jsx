import { useLayoutEffect, useRef, useState } from 'react'
import { useZoomControl } from '../context/ZoomContext'
import './ZoomControls.css'

export default function ZoomControls() {
  const { zoom, setZoom } = useZoomControl()
  const panelRef = useRef(null)
  const dragRef = useRef(null)
  const [position, setPosition] = useState(null)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50))
  const handleReset = () => setZoom(100)

  useLayoutEffect(() => {
    const onMove = (event) => {
      if (!dragRef.current) return
      const { offsetX, offsetY } = dragRef.current
      const node = panelRef.current
      if (!node) return
      const { width, height } = node.getBoundingClientRect()
      setPosition({
        left: Math.min(Math.max(8, event.clientX - offsetX), window.innerWidth - width - 8),
        top: Math.min(Math.max(8, event.clientY - offsetY), window.innerHeight - height - 8),
      })
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  const startDrag = (event) => {
    if (event.target.closest('button')) return
    const rect = panelRef.current.getBoundingClientRect()
    dragRef.current = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top }
  }

  return (
    <div
      ref={panelRef}
      className="zoom-controls-panel"
      style={position ? position : undefined}
    >
      <div className="zoom-controls-handle" onPointerDown={startDrag} title="Drag to move zoom controls" aria-label="Drag to move zoom controls">⠿</div>
      <div className="zoom-controls-inner">
        <button
          type="button"
          className="zoom-btn zoom-btn-out"
          onClick={handleZoomOut}
          disabled={zoom <= 50}
          title="Zoom out (Ctrl+-)"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="zoom-value">{zoom}%</span>
        <button
          type="button"
          className="zoom-btn zoom-btn-in"
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          title="Zoom in (Ctrl++)"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="zoom-btn zoom-btn-reset"
          onClick={handleReset}
          title="Reset zoom (Ctrl+0)"
          aria-label="Reset zoom"
        >
          ↺
        </button>
      </div>
    </div>
  )
}
