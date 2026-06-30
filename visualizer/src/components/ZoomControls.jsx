import { useZoomControl } from '../context/ZoomContext'
import './ZoomControls.css'

export default function ZoomControls() {
  const { zoom, setZoom } = useZoomControl()

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50))
  const handleReset = () => setZoom(100)

  return (
    <div className="zoom-controls-panel">
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
