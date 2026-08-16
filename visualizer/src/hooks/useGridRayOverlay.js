import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Measures a grid container and the center points of specific cells inside it,
 * so an absolutely-positioned SVG overlay can draw animated "comparison rays"
 * between cells (e.g. N-Queens attacker→target, DP dp[i-1][j-1]→dp[i][j]).
 *
 * Cells must be marked with `data-cell="<row>-<col>"` (any row/col key scheme
 * is fine as long as it's consistent between the cell and the `rays` you pass
 * to GridRayOverlay). Measurement uses real getBoundingClientRect() on the
 * cell and grid container, so it's correct regardless of grid gaps, header
 * rows/columns, or non-uniform cell sizing — no cell-size arithmetic needed.
 *
 * @returns {{ gridRef: React.RefObject, gridSize: {width,height}|null, getCellCenter: (row, col) => {x,y}|null }}
 */
export function useGridRayOverlay() {
  const gridRef = useRef(null)
  const [gridSize, setGridSize] = useState(null)

  useLayoutEffect(() => {
    if (!gridRef.current) return
    const measure = () => {
      const bounds = gridRef.current.getBoundingClientRect()
      setGridSize({ width: bounds.width, height: bounds.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(gridRef.current)
    return () => ro.disconnect()
  }, [])

  const getCellCenter = (row, col) => {
    if (!gridRef.current) return null
    const cellEl = gridRef.current.querySelector(`[data-cell="${row}-${col}"]`)
    if (!cellEl) return null
    const gridBounds = gridRef.current.getBoundingClientRect()
    const cellBounds = cellEl.getBoundingClientRect()
    return {
      x: cellBounds.left - gridBounds.left + cellBounds.width / 2,
      y: cellBounds.top - gridBounds.top + cellBounds.height / 2,
    }
  }

  return { gridRef, gridSize, getCellCenter }
}
