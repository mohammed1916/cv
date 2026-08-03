import { motion } from 'framer-motion';
import './EdgeFlowOverlay.css';

/**
 * EdgeFlowOverlay - Visualizes the flow of depth values through tree edges
 * Shows which edge is active, the direction (up/down), and what DP update occurs
 */
export default function EdgeFlowOverlay({ step, currentTree }) {
  if (!step || !currentTree || !step.focus) {
    return (
      <div className="edge-flow-empty">
        <p>Edge flow visualizes during bottom-up and top-down DP passes.</p>
      </div>
    );
  }

  const { sourceNode, targetNode, direction } = step.focus;
  const isBottomUp = direction === 'up';

  // Get node positions from the tree
  const sourcePos = currentTree.positions?.get(sourceNode);
  const targetPos = currentTree.positions?.get(targetNode);

  if (!sourcePos || !targetPos) {
    return <div className="edge-flow-empty">Edge not visible in current tree view.</div>;
  }

  // Calculate midpoint for the label
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;

  // Extract DP update info from step message
  const dpUpdateMatch = step.message.match(/depth (\d+)/);
  const depthValue = dpUpdateMatch ? dpUpdateMatch[1] : '?';

  return (
    <div className="edge-flow-container">
      <div className="edge-flow-header">
        <h3>Edge Flow Visualization</h3>
        <p className="edge-flow-subtitle">
          {isBottomUp ? '⬆️ Bottom-up: Child contributes to parent' : '⬇️ Top-down: Parent sends to child'}
        </p>
      </div>

      <motion.div
        className="edge-flow-info"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="edge-flow-nodes">
          <div className="edge-flow-node source">
            <div className="node-label">
              {isBottomUp ? 'Child' : 'Parent'}
            </div>
            <div className="node-number">Node {sourceNode}</div>
          </div>

          <div className={`edge-flow-arrow ${isBottomUp ? 'up' : 'down'}`}>
            <div className="arrow-shaft">
              <motion.div
                className="arrow-flow"
                animate={{ y: isBottomUp ? [-5, 5] : [5, -5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <div className="arrow-label">depth: {depthValue}</div>
          </div>

          <div className="edge-flow-node target">
            <div className="node-label">
              {isBottomUp ? 'Parent' : 'Child'}
            </div>
            <div className="node-number">Node {targetNode}</div>
          </div>
        </div>

        <div className="edge-flow-details">
          <div className="detail-row">
            <span className="detail-label">Direction:</span>
            <span className="detail-value">
              {isBottomUp
                ? '📤 Bottom-up (lines 9-14)'
                : '📥 Top-down (lines 15-23)'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Depth value:</span>
            <span className="detail-value">{depthValue}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Active edge:</span>
            <span className="detail-value">
              Node {sourceNode} ↔ Node {targetNode}
            </span>
          </div>
        </div>

        <div className="edge-flow-explanation">
          {isBottomUp ? (
            <p>
              This child's depth contributes to its parent's <strong>first/second/third</strong> array.
              The parent ranks this value among all children.
            </p>
          ) : (
            <p>
              The parent sends a depth down to this child. The child will rank it among its
              own <strong>first/second/third</strong> values to determine the game score.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
