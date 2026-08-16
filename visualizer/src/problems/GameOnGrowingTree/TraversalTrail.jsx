import { motion } from 'framer-motion';
import './TraversalTrail.css';

/**
 * TraversalTrail - Shows breadcrumb of visited nodes in current pass
 * Highlights nodes that have been visited and the current node
 */
export default function TraversalTrail({ step, currentTree, parentZeroBased }) {
  if (!step || !currentTree || !parentZeroBased) {
    return (
      <div className="trail-empty">
        <p>Traversal trail appears during DP passes.</p>
      </div>
    );
  }

  const { activeLine, sourceNode, targetNode } = step;
  const isBottomUp = activeLine >= 9 && activeLine <= 14;
  const isTopDown = activeLine >= 15 && activeLine <= 23;

  if (!isBottomUp && !isTopDown) {
    return (
      <div className="trail-empty">
        <p>Active during DP passes (lines 9-23).</p>
      </div>
    );
  }

  // Build traversal trail based on current pass
  const trail = [];
  const visited = new Set();

  if (isBottomUp) {
    // Bottom-up: traverse from leaves to root
    for (let i = currentTree.renderCount - 1; i >= 1; i--) {
      if (i <= currentTree.renderCount) {
        trail.push({
          node: i,
          parent: parentZeroBased[i],
          type: 'child',
          isActive: sourceNode === i,
        });
        visited.add(i);
      }
    }
  } else if (isTopDown) {
    // Top-down: traverse from root to leaves
    const queue = [0];
    while (queue.length > 0) {
      const node = queue.shift();
      trail.push({
        node,
        type: 'node',
        isActive: targetNode === node,
      });
      visited.add(node);

      // Add children
      for (let i = 1; i < parentZeroBased.length; i++) {
        if (parentZeroBased[i] === node && !visited.has(i)) {
          queue.push(i);
        }
      }
    }
  }

  // Limit trail length for display
  const displayTrail = trail.slice(0, 20);

  return (
    <div className="trail-container">
      <div className="trail-header">
        <h3>Traversal Trail</h3>
        <p className="trail-subtitle">
          {isBottomUp
            ? '⬆️ Bottom-up: processing nodes from leaves to root'
            : '⬇️ Top-down: processing nodes from root to leaves'}
        </p>
      </div>

      <motion.div
        className="trail-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="trail-breadcrumb">
          {displayTrail.map((item, idx) => (
            <motion.div
              key={`${item.node}-${idx}`}
              className={`trail-node ${item.isActive ? 'active' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
            >
              <span className="node-number">{item.node}</span>
              {item.parent !== undefined && (
                <span className="node-parent">p:{item.parent}</span>
              )}
              {idx < displayTrail.length - 1 && (
                <span className="trail-arrow">→</span>
              )}
            </motion.div>
          ))}
        </div>

        <div className="trail-stats">
          <div className="stat">
            <span className="stat-label">Visited:</span>
            <span className="stat-value">{visited.size}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Trail length:</span>
            <span className="stat-value">{displayTrail.length}</span>
          </div>
          {displayTrail.length < trail.length && (
            <div className="stat">
              <span className="stat-label">Showing:</span>
              <span className="stat-value">{displayTrail.length} of {trail.length}</span>
            </div>
          )}
        </div>

        <div className="trail-legend">
          <div className="legend-item">
            <span className="legend-dot active"></span>
            <span>Current node</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot visited"></span>
            <span>Visited node</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * TreeTraversalHighlight - Highlights visited nodes in the tree
 */
export function TreeTraversalHighlight({ currentTree, parentZeroBased, isBottomUp }) {
  if (!currentTree || !parentZeroBased) return null;

  const visited = new Set();

  if (isBottomUp) {
    for (let i = currentTree.renderCount - 1; i >= 1; i--) {
      visited.add(i);
    }
  } else {
    const queue = [0];
    while (queue.length > 0) {
      const node = queue.shift();
      visited.add(node);

      for (let i = 1; i < parentZeroBased.length; i++) {
        if (parentZeroBased[i] === node && !visited.has(i)) {
          queue.push(i);
        }
      }
    }
  }

  return (
    <g className="trail-highlight">
      {Array.from(visited).map((node) => {
        const pos = currentTree.positions.get(node);
        if (!pos) return null;

        return (
          <motion.circle
            key={`trail-${node}`}
            cx={pos.x}
            cy={pos.y}
            r="20"
            className="trail-node-indicator"
            initial={{ opacity: 0, r: 15 }}
            animate={{ opacity: 0.15, r: 22 }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </g>
  );
}
