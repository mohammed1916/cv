import { motion } from 'framer-motion';
import './TreeDPConnector.css';

/**
 * TreeDPConnector - Draws SVG lines connecting tree nodes to their DP table cells
 * Shows visual mapping between tree nodes and DP triplet values
 */
export default function TreeDPConnector({
  treeNodePositions,
  highlightNode,
  dpCellPositions,
}) {
  if (!highlightNode || highlightNode < 0 || !treeNodePositions || !dpCellPositions) {
    return null;
  }

  const sourcePos = treeNodePositions.get(highlightNode);
  if (!sourcePos || !dpCellPositions[highlightNode]) {
    return null;
  }

  const targetPos = dpCellPositions[highlightNode];

  // Calculate SVG coordinates for connection
  // Tree viewBox is 0-1000 x 0-300
  // DP cells are in a different coordinate space below
  return (
    <svg className="tree-dp-connector" viewBox="0 0 1000 600" preserveAspectRatio="none">
      <defs>
        <marker
          id="arrowhead-dp"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#4c6ef5" opacity="0.6" />
        </marker>
      </defs>

      {/* Connection line from tree node to DP cell */}
      <motion.path
        d={`M ${sourcePos.x} ${sourcePos.y + 10} Q ${(sourcePos.x + targetPos.x) / 2} ${
          (sourcePos.y + targetPos.y) / 2
        } ${targetPos.x} ${targetPos.y}`}
        className="connector-line"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 0.6 }}
        markerEnd="url(#arrowhead-dp)"
      />

      {/* Flow indicator dot */}
      <motion.circle
        cx={sourcePos.x}
        cy={sourcePos.y}
        r="4"
        className="connector-dot"
        animate={{
          cx: [sourcePos.x, targetPos.x],
          cy: [sourcePos.y, targetPos.y],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </svg>
  );
}

/**
 * DP Cell Position Tracker - calculates positions of DP cells in the DOM
 */
export function calculateDPCellPositions(dpSnapshot, containerRef) {
  if (!dpSnapshot || !containerRef?.current) return {};

  const positions = {};
  const cells = containerRef.current.querySelectorAll('[data-node-id]');

  cells.forEach((cell) => {
    const nodeId = parseInt(cell.getAttribute('data-node-id'), 10);
    const rect = cell.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    positions[nodeId] = {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    };
  });

  return positions;
}
