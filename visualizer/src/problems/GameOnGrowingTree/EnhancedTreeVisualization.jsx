import { motion } from 'framer-motion'
import './EnhancedTreeVisualization.css'

/**
 * Enhanced tree node rendering with:
 * - Top-3 depth values
 * - Color-coded ranks (1st/2nd/3rd)
 * - Pruning visualization
 * - Node status indicators
 */
export function EnhancedTreeNode({
  node,
  position,
  isActive,
  dpSnapshot,
  nodeRadius = 22,
  onSelect,
}) {
  if (!position) return null

  const first = dpSnapshot?.first?.[node.id] ?? 0
  const second = dpSnapshot?.second?.[node.id] ?? 0
  const third = dpSnapshot?.third?.[node.id] ?? 0

  const hasValues = first > 0 || second > 0 || third > 0

  return (
    <motion.g
      key={node.id}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: node.id * 0.02 }}
    >
      {/* Main node circle */}
      <motion.circle
        cx={position.x}
        cy={position.y}
        r={nodeRadius}
        className={`tree-node ${isActive ? 'active' : ''} ${hasValues ? 'has-values' : 'empty'}`}
        onClick={() => onSelect?.(node.id)}
        animate={isActive ? { r: nodeRadius + 4 } : { r: nodeRadius }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />

      {/* Node label/ID */}
      <text
        x={position.x}
        y={position.y + 2}
        textAnchor="middle"
        className="tree-node-label"
        fontSize="11"
        fontWeight="bold"
      >
        {node.id}
      </text>

      {/* Top-3 depth values - shown as small badges around the node */}
      {hasValues && (
        <>
          {/* 1st rank - gold/blue - top position */}
          {first > 0 && (
            <g className="tree-depth-badge rank-1">
              <circle
                cx={position.x}
                cy={position.y - nodeRadius - 12}
                r="8"
                className="badge-circle rank-1"
              />
              <text
                x={position.x}
                y={position.y - nodeRadius - 8}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                className="badge-text"
              >
                {first}
              </text>
              <title>1st best depth: {first}</title>
            </g>
          )}

          {/* 2nd rank - silver - left position */}
          {second > 0 && (
            <g className="tree-depth-badge rank-2">
              <circle
                cx={position.x - nodeRadius - 12}
                cy={position.y}
                r="7"
                className="badge-circle rank-2"
              />
              <text
                x={position.x - nodeRadius - 12}
                y={position.y + 2}
                textAnchor="middle"
                fontSize="8"
                fontWeight="bold"
                className="badge-text"
              >
                {second}
              </text>
              <title>2nd best depth: {second}</title>
            </g>
          )}

          {/* 3rd rank - bronze - right position */}
          {third > 0 && (
            <g className="tree-depth-badge rank-3">
              <circle
                cx={position.x + nodeRadius + 12}
                cy={position.y}
                r="6"
                className="badge-circle rank-3"
              />
              <text
                x={position.x + nodeRadius + 12}
                y={position.y + 2}
                textAnchor="middle"
                fontSize="7"
                fontWeight="bold"
                className="badge-text"
              >
                {third}
              </text>
              <title>3rd best depth: {third}</title>
            </g>
          )}
        </>
      )}

      {/* Pruning indicator - show if node had pruning happen */}
      {isActive && hasValues && (
        <motion.circle
          cx={position.x}
          cy={position.y}
          r={nodeRadius + 6}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="tree-node-pulse"
          animate={{ r: [nodeRadius + 6, nodeRadius + 10] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.g>
  )
}

/**
 * Pruning visualization legend
 */
export function PruningLegend() {
  return (
    <div className="pruning-legend">
      <div className="legend-title">Depth Rankings</div>

      <div className="legend-item rank-1">
        <span className="legend-badge rank-1">1st</span>
        <span className="legend-label">Best depth (kept)</span>
      </div>

      <div className="legend-item rank-2">
        <span className="legend-badge rank-2">2nd</span>
        <span className="legend-label">2nd best (kept)</span>
      </div>

      <div className="legend-item rank-3">
        <span className="legend-badge rank-3">3rd</span>
        <span className="legend-label">3rd best (kept)</span>
      </div>

      <div className="legend-item pruned">
        <span className="legend-badge pruned">✗</span>
        <span className="legend-label">Pruned (discarded)</span>
      </div>

      <div className="legend-note">
        Smaller badges = lower rank. Pruning keeps top-3 depths per node.
      </div>
    </div>
  )
}

/**
 * Pruning statistics for current state
 */
export function PruningStats({ dpSnapshot, totalNodes }) {
  const countRank = (rank) => {
    let count = 0
    const key = ['first', 'second', 'third'][rank]
    if (dpSnapshot?.[key]) {
      count = dpSnapshot[key].filter((v) => v > 0).length
    }
    return count
  }

  const rank1Count = countRank(0)
  const rank2Count = countRank(1)
  const rank3Count = countRank(2)
  const totalKept = rank1Count + rank2Count + rank3Count
  const totalPruned = (totalNodes * 3) - totalKept

  return (
    <div className="pruning-stats">
      <div className="stat-row">
        <span className="stat-label">1st rank:</span>
        <span className="stat-value">{rank1Count}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">2nd rank:</span>
        <span className="stat-value">{rank2Count}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">3rd rank:</span>
        <span className="stat-value">{rank3Count}</span>
      </div>
      <div className="stat-row highlight">
        <span className="stat-label">Kept:</span>
        <span className="stat-value">{totalKept}</span>
      </div>
      <div className="stat-row pruned">
        <span className="stat-label">Pruned:</span>
        <span className="stat-value">{totalPruned}</span>
      </div>
    </div>
  )
}
