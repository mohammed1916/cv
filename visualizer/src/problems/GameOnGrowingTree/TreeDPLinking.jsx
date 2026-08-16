import { motion } from 'framer-motion';
import './TreeDPLinking.css';

/**
 * TreeDPLinking - Visual connection between tree nodes and DP table cells
 * Shows which tree node maps to which DP values
 */
export default function TreeDPLinking({
  step,
  dpSnapshot,
  highlightNode,
  treeNodePositions,
}) {
  if (!highlightNode || highlightNode < 0 || !dpSnapshot || !treeNodePositions) {
    return null;
  }

  const nodePos = treeNodePositions.get(highlightNode);
  if (!nodePos) return null;

  const first = dpSnapshot.first[highlightNode] || 0;
  const second = dpSnapshot.second[highlightNode] || 0;
  const third = dpSnapshot.third[highlightNode] || 0;

  // Calculate SVG line path from tree node to DP panel area
  // This shows the connection between the visual elements
  const startX = nodePos.x;
  const startY = nodePos.y;

  return (
    <div className="tree-dp-linking">
      {/* Highlight circle around tree node */}
      <motion.circle
        cx={startX}
        cy={startY}
        r={30}
        className="tree-node-highlight"
        initial={{ r: 25, opacity: 0.3 }}
        animate={{ r: 35, opacity: 0.7 }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />

      {/* Info tooltip near tree node */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <foreignObject x={startX - 40} y={startY - 80} width={80} height={60}>
          <div className="tree-tooltip">
            <div className="tooltip-title">Node {highlightNode}</div>
            <div className="tooltip-values">
              <div className="tooltip-value">1st: {first}</div>
              <div className="tooltip-value">2nd: {second}</div>
              <div className="tooltip-value">3rd: {third}</div>
            </div>
          </div>
        </foreignObject>
      </motion.g>
    </div>
  );
}

/**
 * TreeHighlightOverlay - Highlights active nodes in tree during DP updates
 */
export function TreeHighlightOverlay({ step, treeNodePositions, dpSnapshot }) {
  if (!step || !step.focus || !treeNodePositions) {
    return null;
  }

  const { sourceNode, targetNode } = step.focus;
  const sourcePos = sourceNode !== undefined ? treeNodePositions.get(sourceNode) : null;
  const targetPos = targetNode !== undefined ? treeNodePositions.get(targetNode) : null;

  // This overlay is rendered inside TreeStatePanel's SVG (1000 × 300). Keep
  // it as a group in that same coordinate system; a nested 1000 × 1000 SVG
  // stretches/offsets the source-to-target connector on wide tree panels.
  return (
    <g className="tree-highlight-overlay">
      {/* Highlight source node */}
      {sourcePos && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Pulsing ring */}
          <motion.circle
            cx={sourcePos.x}
            cy={sourcePos.y}
            r={22}
            fill="none"
            stroke="#4c6ef5"
            strokeWidth="2"
            initial={{ r: 20 }}
            animate={{ r: 28 }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
          {/* Static ring */}
          <circle
            cx={sourcePos.x}
            cy={sourcePos.y}
            r={25}
            fill="none"
            stroke="#4c6ef5"
            strokeWidth="1"
            opacity="0.3"
          />
          {/* Label */}
          <foreignObject
            x={sourcePos.x - 30}
            y={sourcePos.y - 50}
            width={60}
            height={40}
          >
            <div className="node-label source">
              <div>Node {sourceNode}</div>
            </div>
          </foreignObject>
        </motion.g>
      )}

      {/* Highlight target node */}
      {targetPos && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Pulsing ring */}
          <motion.circle
            cx={targetPos.x}
            cy={targetPos.y}
            r={22}
            fill="none"
            stroke="#15aabf"
            strokeWidth="2"
            initial={{ r: 20 }}
            animate={{ r: 28 }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          {/* Static ring */}
          <circle
            cx={targetPos.x}
            cy={targetPos.y}
            r={25}
            fill="none"
            stroke="#15aabf"
            strokeWidth="1"
            opacity="0.3"
          />
          {/* Label */}
          <foreignObject
            x={targetPos.x - 30}
            y={targetPos.y - 50}
            width={60}
            height={40}
          >
            <div className="node-label target">
              <div>Node {targetNode}</div>
            </div>
          </foreignObject>
        </motion.g>
      )}

      {/* Connection line between nodes */}
      {sourcePos && targetPos && (
        <motion.line
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          stroke="#fd7e14"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      )}
    </g>
  );
}
