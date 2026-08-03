import { useState, useCallback } from 'react'

export function useZoom(initialZoom = 100, minZoom = 50, maxZoom = 200, step = 10) {
  const [zoom, setZoom] = useState(initialZoom)

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + step, maxZoom))
  }, [maxZoom, step])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - step, minZoom))
  }, [minZoom, step])

  const resetZoom = useCallback(() => {
    setZoom(initialZoom)
  }, [initialZoom])

  return {
    zoom,
    setZoom,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    resetZoom,
  }
}
