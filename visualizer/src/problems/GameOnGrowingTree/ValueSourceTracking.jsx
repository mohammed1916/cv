import { motion } from 'framer-motion';
import './ValueSourceTracking.css';

/**
 * ValueSourceTracking - Shows where each depth value comes from
 * Traces the calculation: depth = source_second + 1 or depth = source_third + 1
 */
export default function ValueSourceTracking({
  step,
  dpSnapshot,
  parentZeroBased,
}) {
  if (!step || !dpSnapshot || !parentZeroBased) {
    return (
      <div className="source-empty">
        <p>Value source tracking appears during DP passes.</p>
      </div>
    );
  }

  const { sourceNode, targetNode, activeLine } = step;
  const isBottomUp = activeLine >= 9 && activeLine <= 14;
  const isTopDown = activeLine >= 15 && activeLine <= 23;

  if (!isBottomUp && !isTopDown) {
    return (
      <div className="source-empty">
        <p>Active during DP passes.</p>
      </div>
    );
  }

  if (sourceNode === undefined || targetNode === undefined) {
    return (
      <div className="source-empty">
        <p>Waiting for active edge.</p>
      </div>
    );
  }

  let source, target, sourceCalculation, depthValue;

  if (isBottomUp) {
    // Bottom-up: child contributes to parent
    source = sourceNode;
    target = targetNode;
    const childSecond = dpSnapshot.second[source] || 0;
    depthValue = childSecond + 1;
    sourceCalculation = {
      formula: `second[${source}] + 1`,
      components: [
        { label: 'second', node: source, value: childSecond },
        { label: '+ 1', value: 1 },
      ],
      result: depthValue,
    };
  } else {
    // Top-down: parent sends to child
    source = sourceNode;
    target = targetNode;
    const parentSecond = dpSnapshot.second[source] || 0;
    const childSecond = dpSnapshot.second[target] || 0;

    // Determine which formula was used
    const useThird = parentSecond <= childSecond + 1;
    if (useThird) {
      const parentThird = dpSnapshot.third[source] || 0;
      depthValue = parentThird + 1;
      sourceCalculation = {
        formula: `third[${source}] + 1`,
        reason: `because second[${source}] (${parentSecond}) ≤ second[${target}] + 1 (${childSecond + 1})`,
        components: [
          { label: 'third', node: source, value: parentThird },
          { label: '+ 1', value: 1 },
        ],
        result: depthValue,
      };
    } else {
      depthValue = parentSecond + 1;
      sourceCalculation = {
        formula: `second[${source}] + 1`,
        reason: `because second[${source}] (${parentSecond}) > second[${target}] + 1 (${childSecond + 1})`,
        components: [
          { label: 'second', node: source, value: parentSecond },
          { label: '+ 1', value: 1 },
        ],
        result: depthValue,
      };
    }
  }

  return (
    <div className="source-container">
      <div className="source-header">
        <h3>Value Source Tracking</h3>
        <p className="source-subtitle">
          {isBottomUp
            ? `Child ${source} → Parent ${target}`
            : `Parent ${source} → Child ${target}`}
        </p>
      </div>

      <motion.div
        className="source-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Formula breakdown */}
        <div className="source-section">
          <div className="section-title">Calculation</div>
          <motion.div
            className="formula-box"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="formula-display">
              <span className="formula-text">{sourceCalculation.formula}</span>
              <span className="formula-equals">=</span>
              <span className="formula-result">{depthValue}</span>
            </div>

            {sourceCalculation.reason && (
              <div className="formula-reason">
                <span className="reason-label">Why:</span>
                <span className="reason-text">{sourceCalculation.reason}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Component breakdown */}
        <div className="source-section">
          <div className="section-title">Components</div>
          <div className="components-list">
            {sourceCalculation.components.map((comp, idx) => (
              <motion.div
                key={idx}
                className="component-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
              >
                {comp.node !== undefined ? (
                  <>
                    <span className="comp-label">{comp.label}</span>
                    <span className="comp-bracket">[{comp.node}]</span>
                    <span className="comp-equals">=</span>
                    <span className="comp-value">{comp.value}</span>
                  </>
                ) : (
                  <>
                    <span className="comp-label">{comp.label}</span>
                    <span className="comp-equals">=</span>
                    <span className="comp-value">{comp.value}</span>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Source node info */}
        <motion.div
          className="source-section source-info"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-title">Source Node</div>
          <div className="node-info-card">
            <div className="info-row">
              <span className="info-label">Node ID:</span>
              <span className="info-value">{source}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Type:</span>
              <span className="info-value">
                {isBottomUp ? 'Child' : 'Parent'}
              </span>
            </div>
            {dpSnapshot.first[source] !== undefined && (
              <>
                <div className="info-row">
                  <span className="info-label">Triplet:</span>
                  <span className="info-values">
                    1st: {dpSnapshot.first[source]} |
                    2nd: {dpSnapshot.second[source]} |
                    3rd: {dpSnapshot.third[source]}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Explanation */}
        <div className="source-explanation">
          <p>
            Each depth value is derived from either the <strong>second-largest</strong> or{' '}
            <strong>third-largest</strong> path from the source node. This ensures we always
            have the best alternative paths available for the game strategy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
