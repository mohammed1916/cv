import { motion } from 'framer-motion';
import './ComparisonBox.css';

export default function ComparisonBox({ step, dpSnapshot }) {
  if (!step || !dpSnapshot || step.activeLine < 15) {
    return (
      <div className="comparison-empty">
        <p>Comparisons appear during the top-down DP pass (lines 15-23).</p>
      </div>
    );
  }

  const { sourceNode, targetNode } = step.focus || {};
  const parentIdx = sourceNode ?? 0;
  const childIdx = targetNode ?? 0;

  const parentSecond = dpSnapshot.second[parentIdx] || 0;
  const childSecond = dpSnapshot.second[childIdx] || 0;
  const parentThird = dpSnapshot.third[parentIdx] || 0;

  // The critical decision: second[parent] <= second[node] + 1?
  const childSecondPlusOne = childSecond + 1;
  const isLessOrEqual = parentSecond <= childSecondPlusOne;
  const chosenDepth = isLessOrEqual ? parentThird + 1 : parentSecond + 1;
  const chosenSource = isLessOrEqual ? 'third[parent] + 1' : 'second[parent] + 1';

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <h3>Top-Down Decision Logic</h3>
        <p className="comparison-subtitle">
          Deciding which depth to send to node {childIdx}
        </p>
      </div>

      <motion.div
        className="comparison-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="comparison-title">
          Comparing: second[parent {parentIdx}] vs second[node {childIdx}] + 1
        </div>

        <div className="comparison-inputs">
          <motion.div
            className="comparison-input left-input"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="comparison-label">second[parent]</div>
            <div className="comparison-value">{parentSecond}</div>
          </motion.div>

          <div className="comparison-operator">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isLessOrEqual ? '≤' : '>'}
            </motion.div>
          </div>

          <motion.div
            className="comparison-input right-input"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="comparison-label">second[node] + 1</div>
            <div className="comparison-value">{childSecondPlusOne}</div>
          </motion.div>
        </div>

        <motion.div
          className="comparison-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={`result-badge ${isLessOrEqual ? 'true-branch' : 'false-branch'}`}>
            {isLessOrEqual ? 'TRUE' : 'FALSE'}
          </div>
          <div className="result-text">
            <span className="result-label">Use:</span>
            <span className="result-formula">{chosenSource}</span>
            <span className="result-equals">= {chosenDepth}</span>
          </div>
        </motion.div>

        <div className="comparison-explanation">
          {isLessOrEqual ? (
            <p>
              Since second[parent] ≤ second[node] + 1, the parent's second-largest depth
              is blocked by the child, so we send the parent's <strong>third-largest</strong> instead.
            </p>
          ) : (
            <p>
              Since second[parent] &gt; second[node] + 1, the parent's second-largest depth
              is available, so we send the parent's <strong>second-largest</strong>.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
