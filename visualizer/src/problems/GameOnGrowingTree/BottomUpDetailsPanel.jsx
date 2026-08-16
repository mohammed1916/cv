import { motion } from 'framer-motion';
import './BottomUpDetailsPanel.css';

/**
 * BottomUpDetailsPanel - Shows which children feed a node's triplet during bottom-up pass
 * Explains how each child's depth gets ranked in the parent's top-3
 */
export default function BottomUpDetailsPanel({
  step,
  currentTree,
  dpSnapshot,
  parentZeroBased,
}) {
  if (
    !step ||
    !currentTree ||
    !dpSnapshot ||
    !parentZeroBased ||
    step.activeLine < 9 ||
    step.activeLine > 14
  ) {
    return (
      <div className="bottom-up-empty">
        <p>Bottom-up details appear during the bottom-up pass (lines 9-14).</p>
      </div>
    );
  }

  const { sourceNode, targetNode } = step.focus || {};
  if (sourceNode === undefined || targetNode === undefined) {
    return (
      <div className="bottom-up-empty">
        <p>Waiting for active edge during bottom-up pass.</p>
      </div>
    );
  }

  // sourceNode is the child, targetNode is the parent
  const childIdx = sourceNode;
  const parentIdx = targetNode;
  const childDepth = dpSnapshot.second[childIdx] + 1;

  const parentFirst = dpSnapshot.first[parentIdx] || 0;
  const parentSecond = dpSnapshot.second[parentIdx] || 0;
  const parentThird = dpSnapshot.third[parentIdx] || 0;

  // Determine where this child's depth ranks
  let rank = 0;
  if (childDepth > parentFirst) rank = 1;
  else if (childDepth > parentSecond) rank = 2;
  else if (childDepth > parentThird) rank = 3;

  // Get all children of this parent and their contributions
  const children = [];
  for (let i = 1; i < parentZeroBased.length; i++) {
    if (parentZeroBased[i] === parentIdx) {
      const childSecond = dpSnapshot.second[i] || 0;
      const depth = childSecond + 1;
      children.push({
        nodeId: i,
        depth,
        isActive: i === childIdx,
      });
    }
  }

  children.sort((a, b) => b.depth - a.depth);

  return (
    <div className="bottom-up-container">
      <div className="bottom-up-header">
        <h3>Bottom-Up Pass Details</h3>
        <p className="bottom-up-subtitle">
          How child {childIdx} feeds parent {parentIdx}
        </p>
      </div>

      <motion.div
        className="bottom-up-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Active child contribution */}
        <div className="bottom-up-section">
          <div className="section-title">Active child contribution</div>
          <motion.div
            className={`contribution-card active rank-${rank}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="contribution-header">
              <span className="node-label">Node {childIdx}</span>
              <span className="depth-badge">depth: {childDepth}</span>
            </div>
            <div className="contribution-calculation">
              <span className="calc-label">Calculation:</span>
              <span className="calc-formula">
                second[{childIdx}] + 1 = {dpSnapshot.second[childIdx]} + 1 = {childDepth}
              </span>
            </div>
            <div className={`rank-result rank-${rank || 'none'}`}>
              {rank > 0 ? (
                <>
                  <span className="rank-badge">Ranked {rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'}</span>
                  <span className="rank-explanation">
                    {rank === 1 && 'Becomes 1st value'}
                    {rank === 2 && 'Becomes 2nd value (shifts 3rd)'}
                    {rank === 3 && 'Becomes 3rd value'}
                  </span>
                </>
              ) : (
                <>
                  <span className="rank-badge rejected">Not in top-3</span>
                  <span className="rank-explanation">Too small to rank</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Parent's current triplet */}
        <div className="bottom-up-section">
          <div className="section-title">Parent's triplet after update</div>
          <div className="triplet-display">
            <motion.div
              className={`triplet-value rank-1st ${rank === 1 ? 'updated' : ''}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="label">1st</span>
              <span className="value">{parentFirst}</span>
            </motion.div>
            <motion.div
              className={`triplet-value rank-2nd ${rank === 2 ? 'updated' : ''}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <span className="label">2nd</span>
              <span className="value">{parentSecond}</span>
            </motion.div>
            <motion.div
              className={`triplet-value rank-3rd ${rank === 3 ? 'updated' : ''}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="label">3rd</span>
              <span className="value">{parentThird}</span>
            </motion.div>
          </div>
        </div>

        {/* Other children */}
        {children.length > 1 && (
          <div className="bottom-up-section">
            <div className="section-title">Other children of node {parentIdx}</div>
            <div className="children-list">
              {children.map((child, idx) => (
                <motion.div
                  key={child.nodeId}
                  className={`child-item ${child.isActive ? 'active' : 'inactive'}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                >
                  <span className="child-node">Node {child.nodeId}</span>
                  <span className="child-depth">depth: {child.depth}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="bottom-up-explanation">
          <p>
            During bottom-up, we collect the <strong>second-largest depth</strong> from each child
            (using second[child] + 1). The parent maintains a top-3 of these values. This ensures
            the parent knows the best paths through each of its children.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
