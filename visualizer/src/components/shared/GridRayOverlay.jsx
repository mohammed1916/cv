import { motion } from 'framer-motion'
import './GridRayOverlay.css'

/**
 * Animated SVG overlay drawing "comparison rays" between cells of a grid —
 * e.g. N-Queens attacker→candidate lines, or a DP table's dp[i-1][j-1]→dp[i][j]
 * dependency line. Pair with useGridRayOverlay for cell-center measurement.
 *
 * Rays animate from their `from` point out to their `to` point on mount/change,
 * so re-renders where `to` changes look like the ray sweeping to the new target.
 *
 * @param {{width:number,height:number}} gridSize - from useGridRayOverlay
 * @param {Array<{key:string, from:{x,y}, to:{x,y}, color:string, strokeWidth?:number}>} rays
 * @param {string} [className] - extra class on the <svg>, for problem-specific tweaks
 */
export default function GridRayOverlay({ gridSize, rays, className = '' }) {
  if (!gridSize || !rays || rays.length === 0) return null

  return (
    <svg
      className={`grid-ray-overlay ${className}`}
      viewBox={`0 0 ${gridSize.width} ${gridSize.height}`}
    >
      {rays.map((ray) => (
        <motion.line
          key={ray.key}
          x1={ray.from.x} y1={ray.from.y}
          initial={{ x2: ray.from.x, y2: ray.from.y, opacity: 0 }}
          animate={{ x2: ray.to.x, y2: ray.to.y, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          stroke={ray.color}
          strokeWidth={ray.strokeWidth ?? 2.5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
